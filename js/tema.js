/**
 * tema.js — Dark Mode Toggle
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
            icons[i].innerHTML = theme === 'dark'
                ? '<i class="fa-solid fa-sun" style="color: rgb(255, 212, 59);"></i>'
                : '<i class="fa-solid fa-moon" style="color: rgb(255, 212, 59);"></i>';
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var btns = document.querySelectorAll('.btn-tema');
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', toggleTheme);
        }

        updateIcons();

        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
                if (!localStorage.getItem(STORAGE_KEY)) {
                    setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    });
})();