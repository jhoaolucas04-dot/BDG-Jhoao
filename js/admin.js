/**
 * admin.js — Lógica do Dashboard Admin
 * Depende de: dados.js (carregado antes no HTML)
 */

document.addEventListener('DOMContentLoaded', async function () {

    // ===== Proteção de rota =====
    if (sessionStorage.getItem('logado') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // ===== Carregar dados (primeira vez busca do JSON) =====
    await carregarProdutos();

    // ===== Elementos do DOM =====
    const form = document.getElementById('product-form');
    const btnCancelar = document.getElementById('btn-cancelar');
    const inputId = document.getElementById('prod-id');
    const inputNome = document.getElementById('prod-nome');
    const inputPreco = document.getElementById('prod-preco');
    const inputEstoque = document.getElementById('prod-estoque');
    const selectCategoria = document.getElementById('prod-categoria');
    const inputImagem = document.getElementById('prod-imagem');
    const imgPreview = document.getElementById('img-preview');
    const previewWrapper = document.getElementById('image-preview-wrapper');
    const btnLogout = document.getElementById('btn-logout');

    // ===== Preview de Imagem =====
    inputImagem.addEventListener('input', function () {
        const url = this.value.trim();
        if (url) {
            imgPreview.src = url;
            imgPreview.style.display = 'block';
            previewWrapper.querySelector('.placeholder-text').style.display = 'none';
            previewWrapper.classList.add('has-image');

            imgPreview.onerror = function () {
                imgPreview.style.display = 'none';
                previewWrapper.querySelector('.placeholder-text').textContent = '⚠️ URL inválida';
                previewWrapper.querySelector('.placeholder-text').style.display = 'block';
                previewWrapper.classList.remove('has-image');
            };
        } else {
            imgPreview.style.display = 'none';
            previewWrapper.querySelector('.placeholder-text').innerHTML = '<i class="fa-solid fa-camera" style="color: rgb(192, 192, 192);"></i> Preview da imagem aparecerá aqui';
            previewWrapper.querySelector('.placeholder-text').style.display = 'block';
            previewWrapper.classList.remove('has-image');
        }
    });

    // ===== Atualizar indicadores =====
    function atualizarIndicadores() {
        const produtos = getProdutos();
        document.getElementById('total-produtos').textContent = produtos.length;

        const totalValor = produtos.reduce(function (acc, p) {
            return acc + (p.preco * p.estoque);
        }, 0);
        document.getElementById('valor-estoque').textContent = 'R$ ' + totalValor.toFixed(2);

        const esgotados = produtos.filter(function (p) {
            return p.status === 'Esgotado' || p.estoque === 0;
        }).length;
        document.getElementById('itens-esgotados').textContent = esgotados;
    }

    // ===== Renderizar Tabela =====
    function renderTabela() {
        const produtos = getProdutos();
        const tbody = document.getElementById('admin-table-body');
        tbody.innerHTML = '';

        if (produtos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-dolly" style="color: rgb(77, 50, 21);"></i></div><p>Nenhum produto cadastrado ainda</p></div></td></tr>';
            atualizarIndicadores();
            return;
        }

        produtos.forEach(function (p, index) {
            const tr = document.createElement('tr');
            tr.style.animationDelay = (index * 0.03) + 's';
            tr.classList.add('animate-fade-in');

            const imgSrc = p.imagem || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iNDQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQ0IiBoZWlnaHQ9IjQ0IiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMTQiIHk9IjI2IiBmb250LXNpemU9IjE0IiBmaWxsPSIjY2NjIj7wn5OmPC90ZXh0Pjwvc3ZnPg==';

            tr.innerHTML =
                '<td><img src="' + imgSrc + '" alt="' + p.nome + '" class="prod-thumb" onerror="this.src=\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iNDQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQ0IiBoZWlnaHQ9IjQ0IiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+\'"></td>' +
                '<td><div class="prod-name">' + p.nome + '</div><div class="prod-cat">' + p.categoria + '</div></td>' +
                '<td>R$ ' + p.preco.toFixed(2) + '</td>' +
                '<td>' + p.estoque + ' un</td>' +
                '<td><span class="badge ' + (p.status === 'Disponível' ? 'badge-success' : 'badge-danger') + '">' + (p.status === 'Disponível' ? '● Disponível' : '● Esgotado') + '</span></td>' +
                '<td><div class="actions-cell">' +
                    '<button class="btn-action btn-edit" data-id="' + p.id + '" title="Editar"><i class="fa-solid fa-pencil" style="color: rgb(230, 181, 5);"></i> Editar</button>' +
                    '<button class="btn-action btn-toggle" data-id="' + p.id + '" title="Alternar status"><i class="fa-solid fa-rotate" style="color: rgb(119, 206, 69);"></i> Status</button>' +
                    '<button class="btn-action btn-delete" data-id="' + p.id + '" title="Excluir"><i class="fa-solid fa-trash-can" style="color: rgb(192, 44, 44);"></i></button>' +
                '</div></td>';

            tbody.appendChild(tr);
        });

        // Vincular botões de ação
        tbody.querySelectorAll('.btn-edit').forEach(function (btn) {
            btn.addEventListener('click', function () {
                iniciarEdicao(parseInt(this.dataset.id));
            });
        });

        tbody.querySelectorAll('.btn-toggle').forEach(function (btn) {
            btn.addEventListener('click', function () {
                alternarStatus(parseInt(this.dataset.id));
                renderTabela();
                mostrarToast('Status alterado!', 'success');
            });
        });

        tbody.querySelectorAll('.btn-delete').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    deletarProduto(parseInt(this.dataset.id));
                    renderTabela();
                    mostrarToast('Produto excluído!', 'danger');
                }
            });
        });

        atualizarIndicadores();
    }

    // ===== Edição de Produto =====
    function iniciarEdicao(id) {
        const produtos = getProdutos();
        const p = produtos.find(function (prod) { return prod.id === id; });
        if (!p) return;

        inputId.value = p.id;
        inputNome.value = p.nome;
        inputPreco.value = p.preco;
        inputEstoque.value = p.estoque;
        selectCategoria.value = p.categoria;
        inputImagem.value = p.imagem || '';
        inputImagem.dispatchEvent(new Event('input')); // trigger preview

        btnCancelar.style.display = 'block';
        document.querySelector('.box-title-form').innerHTML = '<i class="fa-solid fa-pencil" style="color: rgb(82, 55, 29);"></i> Editando Produto';
        document.getElementById('btn-submit').innerHTML = '<i class="fa-regular fa-floppy-disk" style="color: rgb(255, 255, 255);"></i> Salvar Alterações';
        inputNome.focus();

        // Scroll pro formulário em mobile
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function resetarFormulario() {
        form.reset();
        inputId.value = '';
        btnCancelar.style.display = 'none';
        document.querySelector('.box-title-form').textContent = '➕ Novo Produto';
        document.getElementById('btn-submit').textContent = '➕ Adicionar Produto';
        imgPreview.style.display = 'none';
        previewWrapper.querySelector('.placeholder-text').innerHTML = '<i class="fa-solid fa-camera" style="color: rgb(192, 192, 192);"></i> Preview da imagem aparecerá aqui';
        previewWrapper.querySelector('.placeholder-text').style.display = 'block';
        previewWrapper.classList.remove('has-image');
    }

    // ===== Submissão do Formulário =====
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const dados = {
            nome: inputNome.value.trim(),
            preco: inputPreco.value,
            estoque: inputEstoque.value,
            categoria: selectCategoria.value,
            imagem: inputImagem.value.trim()
        };

        const editId = inputId.value;

        if (editId) {
            // Modo edição
            editarProduto(parseInt(editId), dados);
            mostrarToast('Produto atualizado com sucesso!', 'success');
        } else {
            // Modo inserção
            adicionarProduto(dados);
            mostrarToast('Produto adicionado com sucesso!', 'success');
        }

        resetarFormulario();
        renderTabela();
    });

    // ===== Cancelar Edição =====
    btnCancelar.addEventListener('click', function () {
        resetarFormulario();
    });

    // ===== Logout =====
    btnLogout.addEventListener('click', function (e) {
        e.preventDefault();
        sessionStorage.removeItem('logado');
        window.location.href = 'login.html';
    });

    // ===== Toast Notification =====
    function mostrarToast(mensagem, tipo) {
        // Remover toast anterior se existir
        const existente = document.querySelector('.toast');
        if (existente) existente.remove();

        var toast = document.createElement('div');
        toast.className = 'toast toast-' + tipo;
        toast.textContent = mensagem;
        document.body.appendChild(toast);

        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(function () { toast.remove(); }, 300);
        }, 2500);
    }

    // ===== Inicialização =====
    renderTabela();
});
