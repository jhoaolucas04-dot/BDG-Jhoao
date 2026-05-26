/**
 * vitrine.js — Lógica da Vitrine (página do usuário)
 * Depende de: dados.js (carregado antes no HTML)
 */

document.addEventListener('DOMContentLoaded', async function () {

    // ===== Carregar dados (primeira vez busca do JSON) =====
    await carregarProdutos();

    // ===== Variáveis =====
    let categoriaAtual = 'Todos';
    const numeroWhatsapp = '5581999999999'; // DDD Recife/PE

    // ===== Renderizar Produtos =====
    function renderProdutos(textoBusca) {
        textoBusca = textoBusca || '';
        const container = document.getElementById('vitrine-container');
        const produtos = getProdutos();
        container.innerHTML = '';

        const filtrados = produtos.filter(function (p) {
            const bateCategoria = categoriaAtual === 'Todos' || p.categoria === categoriaAtual;
            const bateBusca = p.nome.toLowerCase().includes(textoBusca.toLowerCase());
            return bateCategoria && bateBusca;
        });

        if (filtrados.length === 0) {
            container.innerHTML = '<div class="vitrine-empty"><div class="empty-icon">🔍</div><p>Nenhum produto encontrado</p></div>';
            return;
        }

        filtrados.forEach(function (p, index) {
            const isEsgotado = p.status === 'Esgotado' || p.estoque === 0;
            const linkWhats = 'https://wa.me/' + numeroWhatsapp + '?text=' +
                encodeURIComponent('Olá, tenho interesse no produto: ' + p.nome + ' no valor de R$ ' + p.preco.toFixed(2));

            const imgSrc = p.imagem || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjE2MCIgeT0iMTA4IiBmb250LXNpemU9IjI0IiBmaWxsPSIjY2NjIj7wn5OmPC90ZXh0Pjwvc3ZnPg==';

            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.animationDelay = (index * 0.06) + 's';

            card.innerHTML =
                '<div class="product-img-wrapper">' +
                    '<img src="' + imgSrc + '" alt="' + p.nome + '" class="product-img" onerror="this.src=\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==\'">' +
                    (isEsgotado ? '<span class="product-badge-esgotado">ESGOTADO</span>' : '') +
                '</div>' +
                '<div class="product-info">' +
                    '<span class="product-category">' + p.categoria + '</span>' +
                    '<h3 class="product-name">' + p.nome + '</h3>' +
                    '<div class="product-price">R$ ' + p.preco.toFixed(2) + '</div>' +
                    '<a href="' + (isEsgotado ? '#' : linkWhats) + '" ' + (isEsgotado ? '' : 'target="_blank"') + ' class="btn-whatsapp ' + (isEsgotado ? 'esgotado' : '') + '">' +
                        (isEsgotado ? '⚠️ Esgotado' : '💬 Comprar via WhatsApp') +
                    '</a>' +
                '</div>';

            container.appendChild(card);
        });
    }

    // ===== Filtro de Categorias =====
    const categoryContainer = document.getElementById('category-container');
    categoryContainer.addEventListener('click', function (e) {
        const item = e.target.closest('.category-item');
        if (!item) return;

        categoriaAtual = item.dataset.categoria;

        categoryContainer.querySelectorAll('.category-item').forEach(function (el) {
            el.classList.remove('active');
        });
        item.classList.add('active');

        renderProdutos(document.getElementById('search').value);
    });

    // ===== Busca =====
    document.getElementById('search').addEventListener('input', function (e) {
        renderProdutos(e.target.value);
    });

    // ===== Inicialização =====
    renderProdutos();
});
