// Bilingual pages: elements tagged lang="en" / lang="zh" are shown or hidden
// based on html[data-lang]. The choice is remembered per visitor.
(function () {
    var KEY = 'site-lang';
    var root = document.documentElement;

    function stored() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }

    function initial() {
        var fromUrl = new URLSearchParams(location.search).get('lang');
        if (fromUrl === 'en' || fromUrl === 'zh') return fromUrl;
        var saved = stored();
        if (saved === 'en' || saved === 'zh') return saved;
        return (navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
    }

    function apply(lang) {
        root.setAttribute('data-lang', lang);
        root.lang = lang === 'zh' ? 'zh-CN' : 'en';
        var title = root.getAttribute('data-title-' + lang);
        if (title) document.title = title;
        var btn = document.querySelector('.lang-toggle');
        if (btn) {
            btn.textContent = lang === 'zh' ? 'EN' : '中文';
            btn.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
        }
    }

    apply(initial());

    document.addEventListener('DOMContentLoaded', function () {
        apply(root.getAttribute('data-lang'));
        var btn = document.querySelector('.lang-toggle');
        if (!btn) return;
        btn.addEventListener('click', function () {
            var next = root.getAttribute('data-lang') === 'zh' ? 'en' : 'zh';
            try { localStorage.setItem(KEY, next); } catch (e) {}
            apply(next);
        });
    });
})();
