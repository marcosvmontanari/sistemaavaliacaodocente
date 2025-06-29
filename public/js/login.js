document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formLogin");
    const msgErro = document.getElementById("msgErro");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();

        try {
            const resposta = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha }),
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                msgErro.textContent = dados.erro || "Erro ao tentar fazer login.";
                return;
            }

            // Salvar o usuário no sessionStorage
            sessionStorage.setItem("usuario", JSON.stringify(dados.usuario));

            // Redirecionar para a dashboard (o modal será exibido lá se necessário)
            window.location.href = "dashboard.html";

        } catch (error) {
            msgErro.textContent = "Erro de conexão com o servidor.";
        }
    });
});
  