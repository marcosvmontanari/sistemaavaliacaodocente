function aguardarFormularioAluno() {
    const form = document.getElementById("formCadastroAluno");
    if (form) {
        console.log("✅ iniciarCadastroAlunos carregado com sucesso");
        iniciarCadastroAlunos();
    } else {
        console.log("⏳ Aguardando carregamento do formulário...");
        setTimeout(aguardarFormularioAluno, 100);
    }
}

aguardarFormularioAluno();

function iniciarCadastroAlunos() {
    const form = document.getElementById("formCadastroAluno");
    if (form.dataset.listenerAttached === "true") return;
    form.dataset.listenerAttached = "true";

    const tabela = document.querySelector("#tabelaAlunos tbody");
    const campoBusca = document.getElementById("buscaAlunos");

    const formLote = document.getElementById("formLoteAlunos");
    const inputCSV = document.getElementById("arquivoCSVAlunos");
    const resultadoCSV = document.getElementById("resultadoCSVAlunos");

    const formEditar = document.getElementById("formEditarAluno");
    const modalEditar = new bootstrap.Modal(document.getElementById("modalEditarAluno"));

    let alunos = [];

    async function carregarAlunos() {
        try {
            const res = await fetch("/usuarios");
            const lista = await res.json();
            alunos = lista.filter(u => u.tipo === "ALUNO");
            renderizarTabela(alunos);
        } catch {
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao carregar alunos.' });
        }
    }

    function renderizarTabela(lista) {
        tabela.innerHTML = "";
        lista.forEach(aluno => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${aluno.nome}</td>
                <td>${aluno.email}</td>
                <td>${aluno.matricula}</td>
                <td>${aluno.curso || "-"}</td>
                <td>${aluno.turma || "-"}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" data-id="${aluno.id}" data-acao="editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger me-1" data-id="${aluno.id}" data-acao="excluir">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" data-id="${aluno.id}" data-acao="redefinir">
                        <i class="bi bi-key-fill"></i>
                    </button>
                </td>
            `;
            tabela.appendChild(tr);
        });
    }

    campoBusca.addEventListener("input", () => {
        const termo = campoBusca.value.toLowerCase();
        const filtrados = alunos.filter(a =>
            a.nome.toLowerCase().includes(termo) ||
            a.email.toLowerCase().includes(termo) ||
            a.matricula?.toLowerCase().includes(termo) ||
            a.curso?.toLowerCase().includes(termo) ||
            a.turma?.toLowerCase().includes(termo)
        );
        renderizarTabela(filtrados);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const botao = form.querySelector("button[type=submit]");
        botao.disabled = true;
        botao.textContent = "Cadastrando...";

        const nome = document.getElementById("nomeAluno").value.trim();
        const email = document.getElementById("emailAluno").value.trim().toLowerCase();
        const matricula = document.getElementById("matricula").value.trim();
        const curso = document.getElementById("curso").value.trim();
        const turma = document.getElementById("turma").value.trim();

        if (!nome || !email || !matricula || !curso || !turma) {
            Swal.fire({ icon: "warning", title: "Campos obrigatórios", text: "Preencha todos os campos." });
            botao.disabled = false;
            botao.textContent = "Cadastrar Aluno";
            return;
        }

        const dados = { nome, email, matricula, curso, turma, tipo: "ALUNO" };

        try {
            const res = await fetch("/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            const json = await res.json();

            if (!res.ok) {
                Swal.fire({ icon: "error", title: "Erro", text: json.erro || "Erro desconhecido." });
                return;
            }

            Swal.fire({
                icon: "success",
                title: "Aluno cadastrado!",
                text: "Cadastro realizado com sucesso.",
                timer: 2000,
                showConfirmButton: false
            });

            form.reset();
            carregarAlunos();

        } catch {
            Swal.fire({ icon: "error", title: "Erro", text: "Falha ao conectar com o servidor." });
        } finally {
            botao.disabled = false;
            botao.textContent = "Cadastrar Aluno";
        }
    });

    tabela.addEventListener("click", async (e) => {
        const botao = e.target.closest("button");
        if (!botao) return;

        const id = botao.dataset.id;
        const acao = botao.dataset.acao;
        const aluno = alunos.find(a => a.id == id);

        if (acao === "excluir") {
            const confirmacao = await Swal.fire({
                title: "Confirmar exclusão?",
                text: `Deseja excluir ${aluno.nome}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sim, excluir",
                cancelButtonText: "Cancelar"
            });

            if (!confirmacao.isConfirmed) return;

            const res = await fetch(`/usuarios/${id}`, { method: "DELETE" });
            if (res.ok) {
                carregarAlunos();
                Swal.fire({ icon: "success", title: "Excluído", timer: 1500, showConfirmButton: false });
            } else {
                Swal.fire({ icon: "error", title: "Erro", text: "Erro ao excluir aluno." });
            }
        }

        if (acao === "redefinir") {
            const confirmacao = await Swal.fire({
                title: "Redefinir Senha?",
                text: `Redefinir a senha de ${aluno.nome}?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sim, redefinir",
                cancelButtonText: "Cancelar"
            });

            if (!confirmacao.isConfirmed) return;

            const res = await fetch(`/usuarios/${id}/redefinir-senha`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identificador: aluno.matricula })
            });

            if (res.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Senha Redefinida",
                    text: "A nova senha é a matrícula do aluno.",
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({ icon: "error", title: "Erro", text: "Erro ao redefinir senha." });
            }
        }

        if (acao === "editar") {
            document.getElementById("editIdAluno").value = aluno.id;
            document.getElementById("editNomeAluno").value = aluno.nome;
            document.getElementById("editEmailAluno").value = aluno.email;
            document.getElementById("editCursoAluno").value = aluno.curso;
            document.getElementById("editTurmaAluno").value = aluno.turma;
            modalEditar.show();
        }
    });

    formEditar?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("editIdAluno").value;
        const nome = document.getElementById("editNomeAluno").value.trim();
        const email = document.getElementById("editEmailAluno").value.trim().toLowerCase();
        const curso = document.getElementById("editCursoAluno").value.trim();
        const turma = document.getElementById("editTurmaAluno").value.trim();

        const dados = { nome, email, curso, turma, tipo: "ALUNO" };

        try {
            const res = await fetch(`/usuarios/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            const json = await res.json();

            if (!res.ok) {
                Swal.fire({ icon: "error", title: "Erro", text: json.erro || "Erro ao salvar." });
                return;
            }

            modalEditar.hide();
            carregarAlunos();
            Swal.fire({ icon: "success", title: "Alterações salvas", timer: 2000, showConfirmButton: false });

        } catch {
            Swal.fire({ icon: "error", title: "Erro", text: "Erro ao editar aluno." });
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
                        carregarAlunos();

                        Swal.fire({
                            icon: 'info',
                            title: 'Importação concluída',
                            html: `
                                <p><strong>${json.sucesso}</strong> aluno(s) cadastrados.</p>
                                <p><strong>${json.duplicados}</strong> já existentes.</p>
                                <p><strong>${json.erros}</strong> com erro.</p>
                            `,
                            confirmButtonText: 'OK'
                        });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Erro', text: json.erro || "Erro ao importar." });
                    }
                } catch {
                    Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro de conexão com o servidor.' });
                }
            }
        });
    });

    carregarAlunos();
}
