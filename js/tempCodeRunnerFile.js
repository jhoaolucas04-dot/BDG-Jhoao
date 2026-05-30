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

    // Carregar usuários que estão em local storage
    function carregarusuarios(loginjson){
    const usuariolocal = JSON.parse(localStorage.getItem('usuarios'));
    if (usuariolocal && usuariolocal.length > 0) {
        return usuariolocal;
    }
    return loginjson;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const usuario = document.getElementById('username').value.trim();
        const senha = document.getElementById('password').value;

        // Carregar Json:
        const resposta = await fetch('login.json');
        const usuarios = await resposta.json();

        const userlogin = usuarios.find(u =>
        u.usuario === usuario && u.senha === senha
        );

        // Login Conectado ao Json
        if (userlogin){
            sessionStorage.setItem('logado', 'true');
            sessionStorage.setItem('usuario', usuario);
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

// Salvar usuarios e senha:
    const formlogin = document.getElementById('form-cadastro');
    
    function cadastrousuario(usuario, senha) {
    let = JSON.parse(localStorage.getItem('usuarios')) || [];
    const novoid = usuarios.length > 0 
    ? usuarios[usuarios.length -1].id + 1: 1;

    const novousuario = {
        id: novoid,
        usuario: usuario,
        senha: senha
    };
};