// Observador de carregamento dinâmico
const observer = new MutationObserver((mutations, obs) => {
    const form = document.getElementById("formCadastroUsuario");
    if (form) {
        obs.disconnect();
        iniciarCadastroUsuarios();
    }
});

observer.observe(document.getElementById("conteudoDinamico"), {
    childList: true,
    subtree: true
});

function iniciarCadastroUsuarios() {
    const form = document.getElementById("formCadastroUsuario");

    // Proteção: impede que o mesmo evento submit seja adicionado mais de uma vez
    if (form.dataset.listenerAttached === "true") return;
    form.dataset.listenerAttached = "true";

    const tabela = document.querySelector("#tabelaUsuarios tbody");
    const campoBusca = document.getElementById("buscaUsuarios");

    const formEditar = document.getElementById("formEditarUsuario");
    const modalEditar = new bootstrap.Modal(document.getElementById("modalEditarUsuario"));

    const formLote = document.getElementById("formLote");
    const inputCSV = document.getElementById("arquivoCSV");
    const resultadoCSV = document.getElementById("resultadoCSV");

    let usuarios = [];

    async function carregarUsuarios() {
        try {
            const res = await fetch("/usuarios");
            usuarios = (await res.json()).filter(u => u.tipo !== "ALUNO"); // 🔥 SOMENTE SERVIDORES
            renderizarTabela(usuarios);
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao carregar usuários.'
            });
        }
    }

    function renderizarTabela(lista) {
        tabela.innerHTML = "";
        lista.forEach(usuario => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.matricula || usuario.siape || "-"}</td>
                <td>${usuario.tipo}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" data-id="${usuario.id}" data-acao="editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger me-1" data-id="${usuario.id}" data-acao="excluir">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" data-id="${usuario.id}" data-acao="redefinir">
                        <i class="bi bi-key-fill"></i>
                    </button>
                </td>
            `;
            tabela.appendChild(tr);
        });
    }

    campoBusca.addEventListener("input", () => {
        const termo = campoBusca.value.toLowerCase();
        const filtrados = usuarios.filter(u =>
            u.nome.toLowerCase().includes(termo) ||
            u.email.toLowerCase().includes(termo) ||
            (u.matricula && u.matricula.toLowerCase().includes(termo)) ||
            (u.siape && u.siape.toLowerCase().includes(termo)) ||
            u.tipo.toLowerCase().includes(termo)
        );
        renderizarTabela(filtrados);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("✅ Evento submit disparado");

        const botao = form.querySelector("button[type=submit]");
        botao.disabled = true;
        botao.textContent = "Cadastrando...";

        const dados = {
            nome: document.getElementById("nome").value.trim(),
            email: document.getElementById("email").value.trim().toLowerCase(),
            tipo: document.getElementById("tipo").value,
        };

        const id = document.getElementById("identificador").value.trim();
        if (dados.tipo === "ALUNO") {
            dados.matricula = id;
            dados.curso = "-";
            dados.turma = "-";
        } else {
            dados.siape = id;
        }

        try {
            const res = await fetch("/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados),
            });

            const json = await res.json();

            if (!res.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Não foi possível cadastrar",
                    text: json.erro || "Erro desconhecido",
                });
                return;
            }

            Swal.fire({
                icon: "success",
                title: "Usuário cadastrado!",
                text: "O usuário foi cadastrado com sucesso.",
                timer: 2000,
                showConfirmButton: false,
            });

            form.reset();
            carregarUsuarios();

        } catch (erro) {
            Swal.fire({
                icon: "error",
                title: "Erro de conexão",
                text: "Não foi possível comunicar com o servidor.",
            });
        } finally {
            botao.disabled = false;
            botao.textContent = "Cadastrar Usuário";
        }
    });

    tabela.addEventListener("click", async (e) => {
        const botao = e.target.closest("button");
        if (!botao) return;

        const id = botao.dataset.id;
        const acao = botao.dataset.acao;
        const usuario = usuarios.find(u => u.id == id);

        if (acao === "excluir") {
            const confirmacao = await Swal.fire({
                title: 'Tem certeza?',
                text: `Excluir o usuário ${usuario.nome}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim, excluir',
                cancelButtonText: 'Cancelar'
            });

            if (!confirmacao.isConfirmed) return;

            const res = await fetch(`/usuarios/${id}`, { method: "DELETE" });

            if (res.ok) {
                carregarUsuarios();
                Swal.fire({
                    icon: 'success',
                    title: 'Excluído!',
                    text: 'Usuário removido com sucesso.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Erro ao excluir usuário.'
                });
            }
        }

        if (acao === "redefinir") {
            const confirmacao = await Swal.fire({
                title: 'Redefinir Senha?',
                text: `Deseja redefinir a senha de ${usuario.nome}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sim, redefinir',
                cancelButtonText: 'Cancelar'
            });

            if (!confirmacao.isConfirmed) return;

            const body = {
                identificador: usuario.tipo === "ALUNO" ? usuario.matricula : usuario.siape,
            };

            const res = await fetch(`/usuarios/${id}/redefinir-senha`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Senha Redefinida',
                    text: 'A nova senha é a matrícula/SIAPE.',
                    timer: 2500,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Erro ao redefinir senha.'
                });
            }
        }

        if (acao === "editar") {
            document.getElementById("editId").value = usuario.id;
            document.getElementById("editNome").value = usuario.nome;
            document.getElementById("editEmail").value = usuario.email;
            document.getElementById("editTipo").value = usuario.tipo;
            modalEditar.show();
        }
    });

    formEditar.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("editId").value;
        const dados = {
            nome: document.getElementById("editNome").value.trim(),
            email: document.getElementById("editEmail").value.trim(),
            tipo: document.getElementById("editTipo").value,
        };

        try {
            const res = await fetch(`/usuarios/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados),
            });

            const json = await res.json();

            if (!res.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: json.erro || "Erro ao salvar alterações."
                });
                return;
            }

            modalEditar.hide();
            carregarUsuarios();

            Swal.fire({
                icon: 'success',
                title: 'Salvo!',
                text: 'Alterações salvas com sucesso.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao editar usuário.'
            });
        }
    });

    formLote.addEventListener("submit", (e) => {
        e.preventDefault();

        const arquivo = inputCSV.files[0];
        if (!arquivo) {
            resultadoCSV.textContent = "Selecione um arquivo CSV.";
            return;
        }

        Papa.parse(arquivo, {
            header: true,
            skipEmptyLines: true,
            complete: async (resultado) => {
                const dadosCSV = resultado.data;

                try {
                    const res = await fetch("/usuarios/lote", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ usuarios: dadosCSV }),
                    });

                    const json = await res.json();
                    if (res.ok) {
                        inputCSV.value = "";
                        carregarUsuarios();

                        Swal.fire({
                            icon: 'info',
                            title: 'Importação finalizada',
                            html: `
                                <p><strong>${json.sucesso}</strong> usuário(s) cadastrado(s).</p>
                                <p><strong>${json.duplicados}</strong> já existiam e foram ignorados.</p>
                                <p><strong>${json.erros}</strong> apresentaram erro.</p>
                            `,
                            confirmButtonText: 'OK'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro na importação',
                            text: json.erro || "Erro ao importar arquivo."
                        });
                    }
                } catch {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro de conexão',
                        text: 'Não foi possível se conectar ao servidor.'
                    });
                }
            }
        });
    });

    carregarUsuarios();
}
