"""Put the PT · EN · FR · DE language switcher in the header of every page.

Each code links to the same page in that language when it exists (hreflang tags or
groups.json), otherwise to that language's home. Run after adding pages:
    python3 _src/i18n/switcher.py
"""
import glob, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
GROUPS = json.load(open(os.path.join(HERE, 'groups.json')))
NAMES = {'pt': 'Português', 'en': 'English', 'fr': 'Français', 'de': 'Deutsch'}
HOME = {'pt': '/', 'en': '/en/', 'fr': '/fr/', 'de': '/de/'}
LABEL = {'pt': 'Idioma', 'en': 'Language', 'fr': 'Langue', 'de': 'Sprache'}


def page_path(f):
    rel = os.path.relpath(f, REPO).replace(os.sep, '/')
    return '/' + rel[:-len('index.html')]


def lang_of(path):
    for l in ('en', 'fr', 'de'):
        if path.startswith('/' + l + '/'):
            return l
    return 'pt'


def alternates(path, html):
    alt = {}
    for code, href in re.findall(r'<link rel="alternate" hreflang="([a-zA-Z-]+)" href="https://istartec\.co([^"]*)"', html):
        code = code.split('-')[0].lower()
        if code in NAMES:
            alt[code] = href
    for g in GROUPS:
        if path in (g['pt'], g['en'], g.get('fr'), g.get('de')):
            for l in NAMES:
                if g.get(l):
                    alt[l] = g[l]
    cur = lang_of(path)
    alt[cur] = path
    return {l: alt.get(l, HOME[l]) for l in NAMES}, cur


GLOBE = '<svg class="lang-dd__globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>'
CHEV = '<svg class="lang-dd__chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5"/></svg>'
CHECK = '<svg class="lang-dd__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5"/></svg>'


def markup(alt, cur):
    items = []
    for l in ('pt', 'en', 'fr', 'de'):
        on = l == cur
        a = f'<a class="lang-dd__item{" is-current" if on else ""}" href="{alt[l]}" hreflang="{l}" lang="{l}"' + (' aria-current="true"' if on else '') + '>'
        items.append(f'<li>{a}<span class="lang-dd__name">{NAMES[l]}</span><span class="lang-dd__code">{l.upper()}</span>{CHECK}</a></li>')
    return ('<li class="nav__lang-item"><div class="lang-dd" data-lang-dd>'
            f'<button type="button" class="lang-dd__btn" aria-expanded="false" aria-controls="langMenu" aria-label="{LABEL[cur]}: {NAMES[cur]}">'
            f'{GLOBE}<span>{cur.upper()}</span>{CHEV}</button>'
            f'<ul class="lang-dd__menu" id="langMenu" aria-label="{LABEL[cur]}">' + ''.join(items) + '</ul></div>'
            '<script src="/assets/lang-switch.js?v=1" defer></script></li>')


def run():
    n = 0
    for f in sorted(glob.glob(os.path.join(REPO, '**', 'index.html'), recursive=True)):
        if '/_src/' in f or '/node_modules/' in f:
            continue
        s = open(f, encoding='utf-8').read()
        if 'nav__lang-item' not in s:
            continue
        path = page_path(f)
        alt, cur = alternates(path, s)
        new = markup(alt, cur)
        # the new block nests <li>s and ends with its <script>; the older ones end with </div></li>
        s2 = re.sub(r'<li class="nav__lang-item">.*?(?:</ul></div><script[^>]*></script></li>|</div>\s*</li>)', lambda m: new, s, count=1, flags=re.S)
        if s2 != s:
            open(f, 'w', encoding='utf-8').write(s2)
            n += 1
    print('language switcher updated on', n, 'pages')


if __name__ == '__main__':
    run()
