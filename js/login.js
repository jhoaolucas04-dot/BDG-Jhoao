/**
 * login.js — Lógica da tela de login
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-form');
    const erroMsg = document.getElementById('login-erro');
    const card = document.querySelector('.login-card');

    // Se já estiver logado, vai direto pro admin
    if (sessionStorage.getItem('logado') === 'true') {
        window.location.href = 'admin.html';
        return;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const usuario = document.getElementById('username').value.trim();
        const senha = document.getElementById('password').value;

        // Credenciais fixas
        if (usuario === 'admin' && senha === 'admin123') {
            sessionStorage.setItem('logado', 'true');
            window.location.href = 'admin.html';
        } else {
            // Mostrar erro com animação
            erroMsg.textContent = '⚠️ Usuário ou senha incorretos!';
            erroMsg.style.display = 'block';

            card.classList.add('shake');
            setTimeout(function () {
                card.classList.remove('shake');
            }, 500);
        }
    });
});
