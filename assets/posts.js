// Renders post lists and tag filters from assets/data.js.
//
// <div data-posts="techblogs">  posts of one section, with a tag filter bar
// <div data-posts="all">        posts of every section (used by /tags/)
// <div data-tag-cloud>          every tag with its post count
//
// The active tag comes from ?tag=<slug>. Text is emitted as lang="en" /
// lang="zh" pairs so the language toggle in lang.js applies to it.
(function () {
    var TAGS = window.SITE_TAGS || {};
    var POSTS = (window.SITE_POSTS || []).slice().sort(function (a, b) {
        return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function bi(o) {
        o = o || {};
        return '<span lang="en">' + esc(o.en || o.zh) + '</span>' +
               '<span lang="zh">' + esc(o.zh || o.en) + '</span>';
    }

    function tagLabel(slug) {
        return bi(TAGS[slug] || { en: slug, zh: slug });
    }

    function tagHref(base, slug) {
        return slug ? base + '?tag=' + encodeURIComponent(slug) : base;
    }

    function countTags(posts) {
        var counts = {};
        posts.forEach(function (p) {
            (p.tags || []).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
        });
        return counts;
    }

    function sortedSlugs(counts) {
        return Object.keys(counts).sort(function (a, b) {
            return counts[b] - counts[a] || a.localeCompare(b);
        });
    }

    function chip(href, label, count, active) {
        return '<a class="tag-chip' + (active ? ' is-active' : '') + '" href="' + esc(href) + '"' +
               (active ? ' aria-current="true"' : '') + '>' + label +
               (count != null ? '<span class="count">' + count + '</span>' : '') + '</a>';
    }

    function card(p) {
        var tags = (p.tags || []).map(function (t) {
            return '<a class="tag" href="' + esc(tagHref('/tags/', t)) + '">#' + tagLabel(t) + '</a>';
        }).join('');
        return '<li class="post-card">' +
            '<time datetime="' + esc(p.date) + '">' + esc(p.date) + '</time>' +
            '<h3><a href="' + esc(p.url) + '">' + bi(p.title) + '</a></h3>' +
            (p.summary ? '<p>' + bi(p.summary) + '</p>' : '') +
            (tags ? '<div class="post-tags">' + tags + '</div>' : '') +
            '</li>';
    }

    function empty(en, zh) {
        return '<div class="placeholder">' + bi({ en: en, zh: zh }) + '</div>';
    }

    function renderPosts(el, active) {
        var section = el.getAttribute('data-posts');
        var base = location.pathname;
        var pool = section === 'all' ? POSTS : POSTS.filter(function (p) { return p.section === section; });
        var counts = countTags(pool);
        var slugs = sortedSlugs(counts);
        var shown = active ? pool.filter(function (p) { return (p.tags || []).indexOf(active) !== -1; }) : pool;
        var html = '';

        if (section !== 'all' && slugs.length) {
            html += '<nav class="tag-bar" aria-label="Tags">' +
                chip(base, bi({ en: 'All', zh: '全部' }), pool.length, !active) +
                slugs.map(function (t) { return chip(tagHref(base, t), tagLabel(t), counts[t], t === active); }).join('') +
                '</nav>';
        }

        if (shown.length) {
            html += '<ul class="posts">' + shown.map(card).join('') + '</ul>';
        } else if (active) {
            html += empty('No posts with this tag yet', '该标签下暂无文章');
        } else if (section !== 'all') {
            html += empty('To be updated', '待更新');
        }
        el.innerHTML = html;
    }

    function renderCloud(el, active) {
        var counts = countTags(POSTS);
        Object.keys(TAGS).forEach(function (t) { counts[t] = counts[t] || 0; });
        var slugs = sortedSlugs(counts);
        el.innerHTML = slugs.length
            ? '<nav class="tag-bar">' + slugs.map(function (t) {
                  return chip(tagHref(location.pathname, t), tagLabel(t), counts[t], t === active);
              }).join('') + '</nav>'
            : empty('No tags yet', '暂无标签');
    }

    function run() {
        var active = new URLSearchParams(location.search).get('tag') || '';
        document.querySelectorAll('[data-tag-cloud]').forEach(function (el) { renderCloud(el, active); });
        document.querySelectorAll('[data-posts]').forEach(function (el) { renderPosts(el, active); });
        document.querySelectorAll('[data-active-tag]').forEach(function (el) {
            el.hidden = !active;
            if (active) el.querySelector('.name').innerHTML = tagLabel(active);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
})();
