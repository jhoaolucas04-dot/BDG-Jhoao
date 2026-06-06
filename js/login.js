/**
 * login.js — Lógica da tela de login
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-form');
    const erroMsg = document.getElementById('login-erro');
    const card = document.querySelector('.login-card');

    // ===== LÓGICA DE MOSTRAR / ESCONDER SENHA =====
    const inputSenha = document.getElementById('password');
    const btnToggleSenha = document.getElementById('btn-toggle-password');
    const iconeOlho = document.getElementById('eye-icon');

    if (btnToggleSenha && inputSenha && iconeOlho) {
        btnToggleSenha.addEventListener('click', function () {
            if (inputSenha.type === 'password') {
                inputSenha.type = 'text';
                iconeOlho.classList.remove('fa-eye');
                iconeOlho.classList.add('fa-eye-slash');
                btnToggleSenha.setAttribute('aria-label', 'Esconder senha');
            } else {
                inputSenha.type = 'password';
                iconeOlho.classList.remove('fa-eye-slash');
                iconeOlho.classList.add('fa-eye');
                btnToggleSenha.setAttribute('aria-label', 'Mostrar senha');
            }
        });
    }
    // ===============================================

    // Se já estiver logado, vai direto pro admin
    if (sessionStorage.getItem('logado') === 'true') {
        window.location.href = 'admin.html';
        return;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const usuario = document.getElementById('username').value.trim();
        const senha = inputSenha.value;

        // Credenciais fixas
        if (usuario === 'admin' && senha === 'admin123') {
            sessionStorage.setItem('logado', 'true');
            window.location.href = 'admin.html';
        } else {
            // Mostrar erro com animação
            erroMsg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Usuário ou senha incorretos';
            erroMsg.style.display = 'block';

            card.classList.add('shake');
            setTimeout(function () {
                card.classList.remove('shake');
            }, 500);
        }
    });
});