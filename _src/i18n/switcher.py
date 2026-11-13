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


def markup(alt, cur):
    links = []
    for l in ('pt', 'en', 'fr', 'de'):
        attrs = f'class="lang-switch__a{" is-current" if l == cur else ""}" href="{alt[l]}" hreflang="{l}" lang="{l}" title="{NAMES[l]}"'
        if l == cur:
            attrs += ' aria-current="true"'
        links.append(f'<a {attrs}>{l.upper()}</a>')
    return f'<li class="nav__lang-item"><div class="lang-switch" role="group" aria-label="{LABEL[cur]}">' + ''.join(links) + '</div></li>'


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
        s2 = re.sub(r'<li class="nav__lang-item">.*?</li>', lambda m: new, s, count=1, flags=re.S)
        if s2 != s:
            open(f, 'w', encoding='utf-8').write(s2)
            n += 1
    print('language switcher updated on', n, 'pages')


if __name__ == '__main__':
    run()
