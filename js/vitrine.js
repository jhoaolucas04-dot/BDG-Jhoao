/**
 * vitrine.js — Lógica da Vitrine (página do usuário)
 * Depende de: dados.js (carregado antes no HTML)
 */

document.addEventListener('DOMContentLoaded', async function () {

    // ===== Carregar dados (primeira vez busca do JSON) =====
    await carregarProdutos();

    // ===== Variáveis =====
    var categoriaAtual = 'Todos';
    var numeroWhatsapp = '5581999999999'; // DDD Recife/PE

    // ===== CARROSSEL =====
    function renderCarrossel() {
        var produtos = getProdutos();

        // 1. Banner de reparos sempre primeiro
        var destaques = [{
            isBannerReparos: true,
            categoria: 'Reparos'
        }];

        // 2. Filtra produtos disponíveis que não sejam da categoria Reparos
        var outrosProdutos = produtos.filter(function (p) {
            var ehReparos = (p.categoria || '').trim().toLowerCase() === 'reparos';
            return p.status === 'Disponível' && !ehReparos && p.imagem;
        });

        // 3. Junta e limita a 5 itens
        destaques = destaques.concat(outrosProdutos).slice(0, 5);

        var track = document.getElementById('carousel-track');
        var dotsContainer = document.getElementById('carousel-dots');

        if (track) track.innerHTML = '';
        if (dotsContainer) dotsContainer.innerHTML = '';

        destaques.forEach(function (p, i) {
            var slide = document.createElement('div');
            slide.className = 'carousel-slide';

            if (p.isBannerReparos) {
                var imagemBanner = 'img/banner-reparos.png';
                var linkWhatsReparo = 'https://wa.me/' + numeroWhatsapp + '?text=' + encodeURIComponent('Olá, gostaria de fazer um orçamento para um reparo/conserto de aparelho.');

                slide.style.padding = '0';
                slide.style.display = 'block';

          slide.innerHTML =
               '<a href="' + linkWhatsReparo + '" target="_blank">' +
                       '<img src="img/banner-reparos.png" alt="Serviços de Reparos" class="banner-desktop">' +
                     '<img src="img/assistencia-tecnica-galego.png" alt="Serviços de Reparos" class="banner-mobile">' +
                '</a>';

            } else {
                var linkWhats = 'https://wa.me/' + numeroWhatsapp + '?text=' +
                    encodeURIComponent('Olá, tenho interesse no produto: ' + p.nome + ' no valor de R$ ' + p.preco.toFixed(2));

                slide.innerHTML =
                    '<div class="carousel-img-wrapper">' +
                        '<img src="' + p.imagem + '" alt="' + p.nome + '" class="carousel-img" onerror="this.style.display=\'none\'">' +
                    '</div>' +
                    '<div class="carousel-info">' +
                        '<span class="carousel-badge"><i class="fa-solid fa-star" style="color: rgb(255, 212, 59);"></i> ' + p.categoria + '</span>' +
                        '<h2 class="carousel-name">' + p.nome + '</h2>' +
                        '<div class="carousel-price">R$ ' + p.preco.toFixed(2) + '</div>' +
                        '<a href="' + linkWhats + '" target="_blank" class="carousel-whatsapp">💬 Comprar via WhatsApp</a>' +
                    '</div>';
            }

            if (track) track.appendChild(slide);

            if (dotsContainer) {
                var dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Slide ' + (i + 1));
                dot.dataset.index = i;
                dotsContainer.appendChild(dot);
            }
        });

        // ===== Controles =====
        var currentSlide = 0;
        var totalSlides = destaques.length;

        function goToSlide(index) {
            currentSlide = index;
            if (track) track.style.transform = 'translateX(-' + (index * 100) + '%)';
            if (dotsContainer) {
                var dots = dotsContainer.querySelectorAll('.carousel-dot');
                for (var d = 0; d < dots.length; d++) {
                    dots[d].classList.toggle('active', d === index);
                }
            }
        }

        var btnNext = document.getElementById('carousel-next');
        var btnPrev = document.getElementById('carousel-prev');

        if (btnNext && btnPrev) {
            var newNext = btnNext.cloneNode(true);
            var newPrev = btnPrev.cloneNode(true);
            btnNext.parentNode.replaceChild(newNext, btnNext);
            btnPrev.parentNode.replaceChild(newPrev, btnPrev);

            newNext.addEventListener('click', function () {
                goToSlide((currentSlide + 1) % totalSlides);
            });
            newPrev.addEventListener('click', function () {
                goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
            });
        }

        if (dotsContainer) {
            dotsContainer.addEventListener('click', function (e) {
                var dot = e.target.closest('.carousel-dot');
                if (!dot) return;
                goToSlide(parseInt(dot.dataset.index));
            });
        }

        // Auto-play
        var autoPlayTimer = setInterval(function () {
            goToSlide((currentSlide + 1) % totalSlides);
        }, 4000);

        var carousel = document.getElementById('carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', function () { clearInterval(autoPlayTimer); });
            carousel.addEventListener('mouseleave', function () {
                autoPlayTimer = setInterval(function () {
                    goToSlide((currentSlide + 1) % totalSlides);
                }, 4000);
            });
        }
    }

    // ===== PRODUTOS =====
    function renderProdutos(textoBusca) {
        textoBusca = textoBusca || '';
        var container = document.getElementById('vitrine-container');
        if (!container) return;

        var produtos = getProdutos();
        container.innerHTML = '';

        var filtrados = produtos.filter(function (p) {
            var bateCategoria = categoriaAtual === 'Todos' || p.categoria === categoriaAtual;
            var bateBusca = p.nome.toLowerCase().includes(textoBusca.toLowerCase());
            return bateCategoria && bateBusca;
        });

        if (filtrados.length === 0) {
            container.innerHTML = '<div class="vitrine-empty"><div class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div><p>Nenhum produto encontrado</p></div>';
            return;
        }

        filtrados.forEach(function (p, index) {
            var isEsgotado = p.status === 'Esgotado' || p.estoque === 0;
            var linkWhats = 'https://wa.me/' + numeroWhatsapp + '?text=' +
                encodeURIComponent('Olá, tenho interesse no produto: ' + p.nome + ' no valor de R$ ' + p.preco.toFixed(2));

            var imgContent = p.imagem
                ? '<img src="' + p.imagem + '" alt="' + p.nome + '" class="product-img">'
                : '<div class="product-img-placeholder"><i class="fa-solid fa-boxes-packing" style="color:rgb(126,83,45)"></i></div>';

            var card = document.createElement('div');
            card.className = 'product-card';
            card.style.animationDelay = (index * 0.06) + 's';

            card.innerHTML =
                '<div class="product-img-wrapper">' +
                    imgContent +
                    (isEsgotado ? '<span class="product-badge-esgotado">ESGOTADO</span>' : '') +
                '</div>' +
                '<div class="product-info">' +
                    '<span class="product-category">' + p.categoria + '</span>' +
                    '<h3 class="product-name">' + p.nome + '</h3>' +
                    '<div class="product-price">R$ ' + p.preco.toFixed(2) + '</div>' +
                    '<a href="' + (isEsgotado ? '#' : linkWhats) + '" ' + (isEsgotado ? '' : 'target="_blank"') + ' class="btn-whatsapp ' + (isEsgotado ? 'esgotado' : '') + '">' +
                        (isEsgotado ? '<i class="fa-solid fa-triangle-exclamation" style="color: rgb(255, 212, 59);"></i> Esgotado' : '💬 Comprar via WhatsApp') +
                    '</a>' +
                '</div>';

            container.appendChild(card);
        });
    }

    // ===== Filtro de Categorias =====
    var categoryContainer = document.getElementById('category-container');
    if (categoryContainer) {
        categoryContainer.addEventListener('click', function (e) {
            var item = e.target.closest('.category-item');
            if (!item) return;

            categoriaAtual = item.dataset.categoria;

            var items = categoryContainer.querySelectorAll('.category-item');
            for (var i = 0; i < items.length; i++) {
                items[i].classList.remove('active');
            }
            item.classList.add('active');

            var searchInput = document.getElementById('search');
            renderProdutos(searchInput ? searchInput.value : '');
        });
    }

    // ===== Busca =====
    var searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            renderProdutos(e.target.value);
        });
    }

    // ===== Inicialização =====
    renderCarrossel();
    renderProdutos();
});