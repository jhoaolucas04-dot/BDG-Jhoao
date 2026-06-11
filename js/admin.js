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

    // ===== Carregar dados do Supabase =====
    await carregarProdutos();

    // ===== Elementos do DOM =====
    const form = document.getElementById('product-form');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnSubmit = document.getElementById('btn-submit'); 
    const inputId = document.getElementById('prod-id');
    const inputNome = document.getElementById('prod-nome');
    const inputPreco = document.getElementById('prod-preco');
    const inputEstoque = document.getElementById('prod-estoque');
    const selectCategoria = document.getElementById('prod-categoria');
    const inputImagem = document.getElementById('prod-imagem');
    const imgPreview = document.getElementById('img-preview');
    const groupPreco = document.getElementById('group-preco');
    const previewWrapper = document.getElementById('image-preview-wrapper');
    const btnLogout = document.getElementById('btn-logout');

    // Elementos adicionais para controle de imagem (Abas e Upload)
    const btnMethodUrl = document.getElementById('method-url');
    const btnMethodFile = document.getElementById('method-file');
    const groupImageUrl = document.getElementById('group-image-url');
    const groupImageFile = document.getElementById('group-image-file');
    const inputImagemFile = document.getElementById('prod-imagem-file');
    const fileNameDisplay = document.getElementById('file-name-display');

    let imagemAtualMetodo = 'url'; // 'url' ou 'file'

    function setImagemMetodo(metodo) {
        imagemAtualMetodo = metodo;
        if (metodo === 'url') {
            btnMethodUrl.classList.add('active');
            btnMethodFile.classList.remove('active');
            groupImageUrl.style.display = 'block';
            groupImageFile.style.display = 'none';
        } else {
            btnMethodUrl.classList.remove('active');
            btnMethodFile.classList.add('active');
            groupImageUrl.style.display = 'none';
            groupImageFile.style.display = 'block';
        }
    }

    btnMethodUrl.addEventListener('click', function () {
        setImagemMetodo('url');
    });

    btnMethodFile.addEventListener('click', function () {
        setImagemMetodo('file');
    });

    // ===== Preview de Imagem (URL) =====
    inputImagem.addEventListener('input', function () {
        const url = this.value.trim();
        if (url) {
            imgPreview.src = url;
            imgPreview.style.display = 'block';
            previewWrapper.querySelector('.placeholder-text').style.display = 'none';
            previewWrapper.classList.add('has-image');

            imgPreview.onerror = function () {
                imgPreview.style.display = 'none';
                previewWrapper.querySelector('.placeholder-text').innerHTML =
                    '<i class="fa-solid fa-triangle-exclamation"></i> URL inválida';
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

    // ===== Leitura e Preview de Imagem (Upload de Arquivo) =====
    inputImagemFile.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            const reader = new FileReader();
            reader.onload = function (e) {
                const base64 = e.target.result;
                imgPreview.src = base64;
                imgPreview.style.display = 'block';
                previewWrapper.querySelector('.placeholder-text').style.display = 'none';
                previewWrapper.classList.add('has-image');
            };
            reader.onerror = function () {
                mostrarToast('Erro ao ler arquivo de imagem!', 'danger');
            };
            reader.readAsDataURL(file);
        } else {
            fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
            if (!inputId.value) {
                imgPreview.style.display = 'none';
                imgPreview.src = '';
                previewWrapper.querySelector('.placeholder-text').innerHTML = '<i class="fa-solid fa-camera" style="color: rgb(192, 192, 192);"></i> Preview da imagem aparecerá aqui';
                previewWrapper.querySelector('.placeholder-text').style.display = 'block';
                previewWrapper.classList.remove('has-image');
            }
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
            tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-dolly" style="color: rgb(73, 67, 61);"></i></div><p>Nenhum produto cadastrado ainda</p></div></td></tr>';
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
                '<td><span class="badge ' + (p.status === 'Disponível' ? 'badge-success' : 'badge-danger') + '"><span class="badge-dot"></span>' + (p.status === 'Disponível' ? 'Disponível' : 'Esgotado') + '</span></td>' +
                '<td><div class="actions-cell">' +
                '<button class="btn-action btn-edit" data-id="' + p.id + '" title="Editar"><i class="fa-solid fa-pencil" style="color: rgb(230, 181, 5);"></i> Editar</button>' +
                '<button class="btn-action btn-toggle" data-id="' + p.id + '" title="Alternar status"><i class="fa-solid fa-rotate" style="color: rgb(119, 206, 69);"></i> Status</button>' +
                '<button class="btn-action btn-delete" data-id="' + p.id + '" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>' +
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
            btn.addEventListener('click', async function () {
                try {
                    await alternarStatus(parseInt(this.dataset.id));
                    mostrarToast('Status alterado!', 'success');
                    renderTabela();
                } catch (e) {
                    mostrarToast('Erro ao alterar status!', 'danger');
                }
            });
        });

        tbody.querySelectorAll('.btn-delete').forEach(function (btn) {
            btn.addEventListener('click', async function () {
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    try {
                        await deletarProduto(parseInt(this.dataset.id));
                        mostrarToast('Produto excluído!', 'danger');
                        renderTabela();
                    } catch (e) {
                        mostrarToast('Erro ao excluir produto!', 'danger');
                    }
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
        if (p.imagem) {
            imgPreview.src = p.imagem;
            imgPreview.style.display = 'block';
            previewWrapper.querySelector('.placeholder-text').style.display = 'none';
            previewWrapper.classList.add('has-image');

            if (p.imagem.startsWith('data:image/')) {
                setImagemMetodo('file');
                inputImagem.value = '';
                fileNameDisplay.textContent = 'Imagem salva no banco (arquivo)';
            } else {
                setImagemMetodo('url');
                inputImagem.value = p.imagem;
                fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
            }
        } else {
            inputImagem.value = '';
            imgPreview.src = '';
            imgPreview.style.display = 'none';
            previewWrapper.querySelector('.placeholder-text').innerHTML = '<i class="fa-solid fa-camera" style="color: rgb(192, 192, 192);"></i> Preview da imagem aparecerá aqui';
            previewWrapper.querySelector('.placeholder-text').style.display = 'block';
            previewWrapper.classList.remove('has-image');
            setImagemMetodo('url');
            fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
        }

        if (p.categoria === 'Reparos') {
            if (groupPreco) groupPreco.style.display = 'none';
            inputPreco.removeAttribute('required');
        } else {
            if (groupPreco) groupPreco.style.display = 'block';
            inputPreco.setAttribute('required', 'required');
        }

        btnCancelar.style.display = 'block';
        document.querySelector('.box-title-form').innerHTML = '<i class="fa-solid fa-pencil" style="color: rgb(82, 55, 29);"></i> Editando Produto';
        if (btnSubmit) btnSubmit.innerHTML = '<i class="fa-regular fa-floppy-disk" style="color: rgb(255, 255, 255);"></i> Salvar Alterações';
        inputNome.focus();

        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ===== MONITORAR MUDANÇA DE CATEGORIA EM TEMPO REAL =====
    selectCategoria.addEventListener('change', function () {
        if (this.value === 'Reparos') {
            if (groupPreco) groupPreco.style.display = 'none';
            inputPreco.removeAttribute('required');
            inputPreco.value = ''; 
        } else {
            if (groupPreco) groupPreco.style.display = 'block';
            inputPreco.setAttribute('required', 'required');
        }
    });

    // ===== Submissão do Formulário =====
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        var ehReparo = selectCategoria.value === 'Reparos';
        var precoFinal = ehReparo ? 0 : (parseFloat(inputPreco.value) || 0);

        const dados = {
            nome: inputNome.value.trim(),
            preco: precoFinal,
            estoque: parseInt(inputEstoque.value) || 0,
            categoria: selectCategoria.value,
            imagem: imagemAtualMetodo === 'url' ? inputImagem.value.trim() : (imgPreview.src && imgPreview.src.startsWith('data:image/') ? imgPreview.src : ''),
            status: 'Disponível'
        };

        const editId = inputId.value;
        if (btnSubmit) btnSubmit.disabled = true;

        if (editId) {
            try {
                await editarProduto(parseInt(editId), dados);
                mostrarToast('Produto updated com sucesso!', 'success');
                resetarFormulario();
                renderTabela();
            } catch (e) {
                mostrarToast('Erro ao atualizar produto!', 'danger');
            } finally {
                if (btnSubmit) btnSubmit.disabled = false;
            }
        } else {
            try {
                await adicionarProduto(dados);
                mostrarToast('Produto adicionado com sucesso!', 'success');
                resetarFormulario();
                renderTabela();
            } catch (e) {
                mostrarToast('Erro ao adicionar produto!', 'danger');
            } finally {
                if (btnSubmit) btnSubmit.disabled = false;
            }
        }
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

    // ===== RESETAR FORMULÁRIO =====
    function resetarFormulario() {
        form.reset();
        inputId.value = '';
        btnCancelar.style.display = 'none';

        document.querySelector('.box-title-form').innerHTML = '<i class="fa-solid fa-plus"></i> Novo Produto';
        if (btnSubmit) btnSubmit.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Produto';

        imgPreview.style.display = 'none';
        imgPreview.src = '';
        previewWrapper.querySelector('.placeholder-text').innerHTML = '<i class="fa-solid fa-camera" style="color: rgb(192, 192, 192);"></i> Preview da imagem aparecerá aqui';
        previewWrapper.querySelector('.placeholder-text').style.display = 'block';
        previewWrapper.classList.remove('has-image');

        setImagemMetodo('url');
        fileNameDisplay.textContent = 'Nenhum arquivo selecionado';

        if (groupPreco) groupPreco.style.display = 'block';
        inputPreco.setAttribute('required', 'required');
    }

    // ===== Toast Notification =====
    function mostrarToast(mensagem, tipo) {
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

    // ===== Inicialização e Sincronização em Tempo Real =====
    registrarListenerProdutos(function () {
        renderTabela();
    });
});