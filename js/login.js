/**
 * login.js — Lógica da tela de login
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-form');
    const erroMsg = document.getElementById('login-erro');
    const card = document.querySelector('.login-card');

    function carregarusuarios(){
        return JSON.parse(localStorage.getItem ('usuarios')) || [];
    }

    // Carregar usuários que estão em local storage
    function salvarusuarios(usuarios){
     localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    let usuarios = carregarusuarios();

    if (!usuarios.find(u => u.usuario === 'admin')) {
        usuarios.push({
        id: 1,
        usuario: 'admin',
        senha: 'admin123',
        role: 'admin'
        });
    salvarusuarios(usuarios);    
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
    
    
        const usuario = document.getElementById('username').value.trim();
        const senha = document.getElementById('password').value;
        
        let usuarios = carregarusuarios();
        let user = usuarios.find(u => u.usuario === usuario);
        
        if (!user){
            user = {
                usuario,
                senha,
                role: 'user'
            };
        usuarios.push(user);
        salvarusuarios(usuarios);
        }
       
        // Login Conectado ao Json
        if (user){
               sessionStorage.setItem('logado', 'true');
               sessionStorage.setItem('usuario', user.usuario);
               sessionStorage.setItem('role', user.role || 'user');
              
                if (user.role === 'admin'){
                  window.location.href = 'admin.html';
                  } else {
                  window.location.href = 'index.html';
                }
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