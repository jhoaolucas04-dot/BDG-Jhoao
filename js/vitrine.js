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
        var destaques = produtos.filter(function (p) {
            return p.status === 'Disponível' && p.imagem;
        }).slice(0, 5);

        var carousel = document.getElementById('carousel');
        var track = document.getElementById('carousel-track');
        var dotsContainer = document.getElementById('carousel-dots');

        if (destaques.length === 0) {
            // Fallback: banner estático
            track.innerHTML = '<div class="carousel-fallback"><h2>Bodega do Galego</h2><p>Os melhores acessórios de tecnologia com preço justo!</p></div>';
            document.getElementById('carousel-prev').style.display = 'none';
            document.getElementById('carousel-next').style.display = 'none';
            dotsContainer.style.display = 'none';
            return;
        }

        track.innerHTML = '';
        dotsContainer.innerHTML = '';

        destaques.forEach(function (p, i) {
            var linkWhats = 'https://wa.me/' + numeroWhatsapp + '?text=' +
                encodeURIComponent('Olá, tenho interesse no produto: ' + p.nome + ' no valor de R$ ' + p.preco.toFixed(2));

            var slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML =
                '<div class="carousel-img-wrapper">' +
                    '<img src="' + p.imagem + '" alt="' + p.nome + '" class="carousel-img" onerror="this.style.display=\'none\'">' +
                '</div>' +
                '<div class="carousel-info">' +
                    '<span class="carousel-badge">⭐ Destaque</span>' +
                    '<h2 class="carousel-name">' + p.nome + '</h2>' +
                    '<div class="carousel-price">R$ ' + p.preco.toFixed(2) + '</div>' +
                    '<a href="' + linkWhats + '" target="_blank" class="carousel-whatsapp">💬 Comprar via WhatsApp</a>' +
                '</div>';
            track.appendChild(slide);

            // Dot
            var dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Slide ' + (i + 1));
            dot.dataset.index = i;
            dotsContainer.appendChild(dot);
        });

        // ===== Carousel Controls =====
        var currentSlide = 0;
        var totalSlides = destaques.length;
        var autoPlayTimer;

        function goToSlide(index) {
            currentSlide = index;
            track.style.transform = 'translateX(-' + (index * 100) + '%)';
            var dots = dotsContainer.querySelectorAll('.carousel-dot');
            for (var d = 0; d < dots.length; d++) {
                if (d === index) {
                    dots[d].classList.add('active');
                } else {
                    dots[d].classList.remove('active');
                }
            }
        }

        function nextSlide() {
            goToSlide((currentSlide + 1) % totalSlides);
        }

        function prevSlide() {
            goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
        }

        // Arrow buttons
        document.getElementById('carousel-next').addEventListener('click', function () {
            nextSlide();
            restartAutoPlay();
        });

        document.getElementById('carousel-prev').addEventListener('click', function () {
            prevSlide();
            restartAutoPlay();
        });

        // Dots
        dotsContainer.addEventListener('click', function (e) {
            var dot = e.target.closest('.carousel-dot');
            if (!dot) return;
            goToSlide(parseInt(dot.dataset.index));
            restartAutoPlay();
        });

        // Auto-play
        function startAutoPlay() {
            autoPlayTimer = setInterval(nextSlide, 4000);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayTimer);
        }

        function restartAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        // Pause on hover
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);

        // Touch/swipe support
        var touchStartX = 0;
        var touchEndX = 0;

        carousel.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay();
        }, { passive: true });

        carousel.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) { nextSlide(); }
                else { prevSlide(); }
            }
            startAutoPlay();
        }, { passive: true });

        // Start
        startAutoPlay();
    }

    // ===== PRODUTOS =====
    function renderProdutos(textoBusca) {
        textoBusca = textoBusca || '';
        var container = document.getElementById('vitrine-container');
        var produtos = getProdutos();
        container.innerHTML = '';

        var filtrados = produtos.filter(function (p) {
            var bateCategoria = categoriaAtual === 'Todos' || p.categoria === categoriaAtual;
            var bateBusca = p.nome.toLowerCase().includes(textoBusca.toLowerCase());
            return bateCategoria && bateBusca;
        });

        if (filtrados.length === 0) {
            container.innerHTML = '<div class="vitrine-empty"><div class="empty-icon">🔍</div><p>Nenhum produto encontrado</p></div>';
            return;
        }

        filtrados.forEach(function (p, index) {
            var isEsgotado = p.status === 'Esgotado' || p.estoque === 0;
            var linkWhats = 'https://wa.me/' + numeroWhatsapp + '?text=' +
                encodeURIComponent('Olá, tenho interesse no produto: ' + p.nome + ' no valor de R$ ' + p.preco.toFixed(2));

            var imgSrc = p.imagem || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjE2MCIgeT0iMTA4IiBmb250LXNpemU9IjI0IiBmaWxsPSIjY2NjIj7wn5OmPC90ZXh0Pjwvc3ZnPg==';

            var card = document.createElement('div');
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
    var categoryContainer = document.getElementById('category-container');
    categoryContainer.addEventListener('click', function (e) {
        var item = e.target.closest('.category-item');
        if (!item) return;

        categoriaAtual = item.dataset.categoria;

        var items = categoryContainer.querySelectorAll('.category-item');
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('active');
        }
        item.classList.add('active');

        renderProdutos(document.getElementById('search').value);
    });

    // ===== Busca =====
    document.getElementById('search').addEventListener('input', function (e) {
        renderProdutos(e.target.value);
    });

    // ===== Inicialização =====
    renderCarrossel();
    renderProdutos();
});
