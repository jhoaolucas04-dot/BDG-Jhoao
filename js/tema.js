/**
 * tema.js — Dark Mode Toggle
 *
 * O tema inicial é aplicado por um script inline no <head> de cada página
 * (para evitar flash). Este arquivo gerencia o botão de toggle.
 *
 * Padrão: segue preferência do sistema (prefers-color-scheme).
 * Após o usuário escolher, a preferência fica salva no localStorage.
 */

(function () {
    var STORAGE_KEY = 'bodega_tema';

    function getTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        updateIcons();
    }

    function toggleTheme() {
        var current = getTheme();
        setTheme(current === 'dark' ? 'light' : 'dark');
    }

    function updateIcons() {
        var theme = getTheme();
        var icons = document.querySelectorAll('.btn-tema .tema-icon');
        for (var i = 0; i < icons.length; i++) {
            icons[i].textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        // Attach toggle to all theme buttons on the page
        var btns = document.querySelectorAll('.btn-tema');
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', toggleTheme);
        }

        // Set initial icon state
        updateIcons();

        // Listen for system theme changes (only if user hasn't manually chosen)
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
                if (!localStorage.getItem(STORAGE_KEY)) {
                    setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    });
})();
