"""Build the French and German pages from their English sources.

    python3 _src/i18n/build_lang.py todo  fr   # list English strings still missing in fr.json -> todo_fr.json
    python3 _src/i18n/build_lang.py merge fr   # zip todo_fr.json with add_fr.json (same order) into fr.json
    python3 _src/i18n/build_lang.py build fr   # write /fr/... pages (refuses while strings are missing)

Needs beautifulsoup4. Pages and URLs come from groups.json; translations are a shared
dictionary per language (fr.json / de.json) keyed by the English text, so menus,
footers and repeated catalogue strings are translated once, and a rebuild after the
English page changes only asks for the new strings.

A translation unit is an element whose content is text plus inline tags (<a>, <strong>
...); its inner HTML is translated as a whole so sentences keep their word order.
"""
import json, os, re, sys, unicodedata
from bs4 import BeautifulSoup, NavigableString, Comment, Tag, Doctype, Declaration, ProcessingInstruction

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
GROUPS = json.load(open(os.path.join(HERE, 'groups.json')))
SITE = 'https://istartec.co'
LOCALE = {'fr': ('fr', 'fr_FR', 'fr-FR'), 'de': ('de', 'de_DE', 'de-DE')}
INLINE = {'a', 'strong', 'em', 'b', 'i', 'span', 'br', 'sup', 'sub', 'small', 'abbr', 'code', 'mark', 'time', 'u', 's'}
SKIP = {'script', 'style', 'svg', 'noscript', 'template', 'math'}
ATTRS = ('alt', 'title', 'aria-label', 'placeholder', 'data-title', 'data-count', 'data-count1')
META = {'description', 'twitter:title', 'twitter:description', 'og:title', 'og:description'}
LD_KEYS = {'name', 'description', 'text', 'headline', 'caption', 'alternativeHeadline', 'abstract', 'serviceType',
           'audienceType', 'slogan', 'disambiguatingDescription', 'knowsAbout', 'category', 'about_text'}
DATA_SKIP_KEYS = {'id', 'img', 'imgSmall', 'depth', 'before', 'beforeSmall', 'photo', 'href', 'sys', 'part', 'model',
                  'lang', 'brand', 'photoCredit', 'aspect', 'centerX', 'x', 'y', 'variants_ids'}
LETTERS = re.compile(r'[A-Za-zÀ-ÿ]{2}')
SHORT_EN = {'to', 'or', 'of', 'in', 'on', 'at', 'by', 'up', 'no', 'is', 'an', 'as', 'if', 'we', 'us', 'it', 'be', 'do', 'my'}
FORMS = json.load(open(os.path.join(HERE, 'forms.json'), encoding='utf-8'))
SERVICE_LINKS = {'Solar Thermal Systems': 'solar', 'Underfloor Heating System': 'piso',
                 'Plumbing Installations': 'canal', 'Bathroom Installations': 'canal'}
SKIP_CLASSES = {'lang-switch', 'nav__logo-text', 'lang-flag'}
# words that stay as they are in every language (brands, product lines, places, units)
KEEP = set('''iStarTec iStar Tec Bosch Uponor AstralPool WhatsApp Algarve Portugal Albufeira Faro Lagos Lagoa Loulé Vilamoura Portimão
Silves Tavira Olhão Quarteira Almancil Carvoeiro Ferragudo Alvor Armação Pêra Praia Rocha Luz Montenegro Estoi Quinta Lago Vale Lobo
Compress Stora Vario Klett Minitec Siccus Smatrix Fluvia Thermatop Comfort Pipe PLUS Eco Elyo Solar Premium Essence Mini Twinboard
HomeCom Easy Wave Base Lda NIF IMPIC PAR PEX AL PPR PEAD PVC SML LED RGB AQS AWF AW OR EP WS WST WD TS FCC FKC FT VK CPC AGS MS
B-Sol Sol CS HMI Wi Fi K40 Geberit Wavin Instagram Facebook LinkedIn Google iStarTec.co Kauffen Bosch.'''.split())


def has_text(s):
    return bool(LETTERS.search(s or ''))


def identity(s):
    """strings that read the same in every language: codes, measures, brand/place names"""
    words = re.findall(r"[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'.-]*", re.sub(r'<[^>]+>', ' ', s))
    if not words:
        return True
    return all(w in KEEP or w.rstrip('.') in KEEP or (len(w) <= 2 and w.lower() not in SHORT_EN) or w.isupper() or re.search(r'\d', w) for w in words)


def skipped(el):
    return el.name in SKIP or bool(SKIP_CLASSES.intersection(el.get('class') or []))


def is_unit(el):
    """element whose descendants are only inline tags/text, holds real text and has text of its own
    (a block made only of separate links/spans is split into those links instead)"""
    if skipped(el) or el.name in ('html', 'head', 'body'):
        return False
    for d in el.descendants:
        if isinstance(d, Tag) and (d.name not in INLINE or skipped(d)):
            return False
    if not has_text(el.get_text()):
        return False
    return any(isinstance(c, NavigableString) and not isinstance(c, Comment) and c.strip() for c in el.children)


def units(soup):
    """yield ('inner', tag) / ('text', navstring) translation units in document order"""
    def walk(node):
        for ch in list(node.children):
            if isinstance(ch, (Comment, Doctype, Declaration, ProcessingInstruction)):
                continue
            if isinstance(ch, NavigableString):
                if has_text(str(ch)) and node.name not in SKIP:
                    yield ('text', ch)
                continue
            if not isinstance(ch, Tag) or skipped(ch):
                continue
            if is_unit(ch):
                yield ('inner', ch)
            else:
                yield from walk(ch)
    yield from walk(soup)


def norm(s):
    return re.sub(r'\s+', ' ', s).strip()


def json_strings(obj, ld, key=None):
    """yield (container, key/index) for translatable strings inside JSON"""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, str):
                if (ld and k in LD_KEYS) or (not ld and k not in DATA_SKIP_KEYS):
                    if has_text(v) and not v.startswith(('http', '/', '#')):
                        yield (obj, k)
            else:
                if ld and k in ('@id', 'url', 'item', 'sameAs', 'image', 'logo'):
                    continue
                if not ld and k in DATA_SKIP_KEYS:
                    continue
                yield from json_strings(v, ld, k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            if isinstance(v, str):
                if (not ld or key in LD_KEYS) and has_text(v) and not v.startswith(('http', '/', '#')):
                    yield (obj, i)
            else:
                yield from json_strings(v, ld, key)


def collect(src_html):
    """ordered unique English strings of a page"""
    soup = BeautifulSoup(src_html, 'html.parser')
    out = []
    def add(s):
        s = norm(s)
        if s and has_text(s) and not identity(s) and s not in out:
            out.append(s)
    for kind, n in units(soup):
        add(n.decode_contents() if kind == 'inner' else str(n))
    for el in soup.find_all(True):
        for a in ATTRS:
            if el.has_attr(a):
                add(el[a])
        if el.name == 'meta' and (el.get('name') in META or el.get('property') in META):
            add(el.get('content', ''))
    for sc in soup.find_all('script'):
        typ, sid = sc.get('type', ''), sc.get('id', '')
        if typ == 'application/ld+json' or sid == 'eq-data':
            try:
                data = json.loads(sc.string)
            except Exception:
                continue
            for c, k in json_strings(data, typ == 'application/ld+json'):
                add(c[k])
    return out


def fold(s):
    """lowercase without accents, as catalogo.js folds the search box"""
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if not unicodedata.combining(c))


def url_map(lang):
    m = {}
    for g in GROUPS:
        if g.get(lang):
            m[g['en']] = g[lang]
    return m


def build_page(g, lang, tr):
    src = open(os.path.join(REPO, g['src']), encoding='utf-8').read()
    soup = BeautifulSoup(src, 'html.parser')
    T = lambda s: tr.get(norm(s), None)
    missing = []
    # every FR/DE page is for homeowners: the top bar highlights that pill
    for a in soup.select('a.audience-pill'):
        biz = a.get('href') == '/en/'
        cls = [c for c in a.get('class', []) if c != 'audience-pill--active'] + ([] if biz else ['audience-pill--active'])
        a['class'] = cls
        if biz:
            a.attrs.pop('aria-current', None)
        else:
            a['aria-current'] = 'true'
    def get(s):
        if identity(norm(s)):
            return s
        t = T(s)
        if t is None:
            missing.append(norm(s))
            return s
        return t
    for kind, n in list(units(soup)):
        if kind == 'inner':
            new = get(n.decode_contents())
            n.clear()
            for c in list(BeautifulSoup(new, 'html.parser').contents):
                n.append(c)
        else:
            raw = str(n)
            lead = raw[:len(raw) - len(raw.lstrip())]; trail = raw[len(raw.rstrip()):]
            n.replace_with(NavigableString(lead + get(raw) + trail))
    # the English B2B service list has no translation: service links go to the matching homeowner
    # page, the rest to this language's home services section (mapped below with the other links)
    svc = {norm(tr.get(k, k)): v for k, v in SERVICE_LINKS.items()}
    for a in soup.find_all('a', href='/en/services/'):
        slug = svc.get(norm(a.get_text()))
        a['href'] = next(x['en'] for x in GROUPS if x['slug'] == slug) if slug else '/en/homeowners/#services'
    for el in soup.find_all(True):
        for a in ATTRS:
            if el.has_attr(a) and has_text(el[a]):
                el[a] = get(el[a])
        if el.name == 'meta' and (el.get('name') in META or el.get('property') in META) and has_text(el.get('content', '')):
            el['content'] = get(el['content'])
        for a in [x for x in el.attrs if x.startswith('data-i18n')]:
            del el[a]
    for el in soup.find_all(attrs={'data-search': True}):
        el['data-search'] = fold(norm(el.get_text(' '))) + ' ' + el['data-search']
    links = url_map(lang)
    for sc in soup.find_all('script'):
        typ, sid = sc.get('type', ''), sc.get('id', '')
        if typ == 'application/ld+json' or sid == 'eq-data':
            data = json.loads(sc.string)
            if sid == 'eq-data':
                def relink(o):
                    if isinstance(o, dict):
                        for k, v in o.items():
                            if k == 'href' and isinstance(v, str):
                                base, _, frag = v.partition('#')
                                if base in links:
                                    o[k] = links[base] + ('#' + frag if frag else '')
                            else:
                                relink(v)
                    elif isinstance(o, list):
                        for v in o:
                            relink(v)
                relink(data)
            for c, k in list(json_strings(data, typ == 'application/ld+json')):
                c[k] = get(c[k])
            if typ == 'application/ld+json':
                txt = json.dumps(data, ensure_ascii=False, indent=1).replace('"inLanguage": "en"', f'"inLanguage": "{LOCALE[lang][2]}"')
            else:
                data['lang'] = lang
                txt = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
            sc.string = '\n' + txt + '\n  ' if typ == 'application/ld+json' else txt
    html = str(soup)
    # internal links and JSON-LD URLs to the translated pages (longest paths first)
    for en_path, l_path in sorted(url_map(lang).items(), key=lambda kv: -len(kv[0])):
        html = html.replace(f'href="{en_path}"', f'href="{l_path}"').replace(f'href="{en_path}#', f'href="{l_path}#')
        html = html.replace(f'"{SITE}{en_path}', f'"{SITE}{l_path}').replace(f'{SITE}{en_path}"', f'{SITE}{l_path}"')
    # "Home" and the logo go to this language's home; the Business pill keeps the English B2B home
    html = re.sub(r'<a\b[^>]*href="/en/"[^>]*>', lambda m: m.group(0) if re.search(r'audience-pill|audience-card|data-audience="empresa"', m.group(0)) else m.group(0).replace('href="/en/"', f'href="/{lang}/"'), html)
    F = FORMS[lang]
    html = html.replace('Hello%20iStarTec%2C%20I%20would%20like%20some%20information%20/%20a%20quote.', F['wa'])
    if g['slug'] == 'contacto':
        html, n = re.subn(r'<section class="content-section">\s*<div class="container prose">\s*<h2[^>]*>[^<]*</h2>.*?href="/#contact".*?</section>',
                          lambda m: contact_form(lang), html, count=1, flags=re.S)
        if not n:
            sys.exit('contact page: quote section not found')
    # page language, canonical, hreflang, Open Graph
    code, og, inlang = LOCALE[lang]
    html = re.sub(r'<html lang="[^"]*"', f'<html lang="{code}"', html, count=1)
    html = re.sub(r'<link rel="alternate" hreflang="[^"]+" href="[^"]+"\s*/?>\s*', '', html)
    alts = ''.join(f'<link rel="alternate" hreflang="{h}" href="{SITE}{g[k]}"/>\n  ' for h, k in (('pt-PT', 'pt'), ('en', 'en'), ('fr', 'fr'), ('de', 'de'), ('x-default', 'pt')))
    html = re.sub(r'(<link href="[^"]*" rel="canonical"\s*/?>|<link rel="canonical" href="[^"]*"\s*/?>)', f'<link rel="canonical" href="{SITE}{g[lang]}"/>\n  ' + alts.rstrip(), html, count=1)
    html = re.sub(r'(<meta content=")en_GB(" property="og:locale")', rf'\g<1>{og}\g<2>', html)
    html = re.sub(r'(<meta property="og:locale" content=")en_GB(")', rf'\g<1>{og}\g<2>', html)
    return html, missing


def contact_form(lang):
    F = FORMS[lang]
    svc = ''.join(f'<label class="checkbox"><input type="checkbox" name="services" value="{t}"/><span>{t}</span></label>' for v, t in F['svc'])
    return f'''<section class="content-section" id="devis">
    <div class="container" style="max-width:760px">
      <h2 style="text-align:center">{F['h2']}</h2>
      <p style="text-align:center;margin:0 auto 2rem;max-width:600px">{F['intro']}</p>
      <form class="contact__form" id="contactForm" action="https://formsubmit.co/geral@istartec.co" method="POST" novalidate data-lead data-sending="{F['sending']}" data-submit="{F['submit']}" data-ok-title="{F['ok_title']}" data-ok-desc="{F['ok_desc']}" data-error="{F['error']}">
        <input type="hidden" name="_captcha" value="false"/>
        <input type="hidden" name="_template" value="table"/>
        <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off"/>
        <input type="hidden" name="_subject" value="{F['subject']}"/>
        <input type="hidden" name="language" value="{lang.upper()}"/>
        <div class="form__row">
          <div class="form__group"><label for="name">{F['name']}</label><input type="text" id="name" name="name" placeholder="{F['name_ph']}" autocomplete="name" required/></div>
          <div class="form__group"><label for="email">{F['email']}</label><input type="email" id="email" name="email" autocomplete="email" required/></div>
        </div>
        <div class="form__row">
          <div class="form__group"><label for="phone">{F['phone']}</label><input type="tel" id="phone" name="phone" placeholder="+351 / +33 / +49 …" autocomplete="tel"/></div>
          <div class="form__group"><label for="location">{F['location']}</label><input type="text" id="location" name="location" placeholder="{F['location_ph']}"/></div>
        </div>
        <fieldset class="form__group" style="border:0;padding:0;margin-inline:0"><legend class="form__legend">{F['services']}</legend><div class="form__checkboxes">{svc}</div></fieldset>
        <div class="form__group"><label for="message">{F['message']}</label><textarea id="message" name="message" rows="5" placeholder="{F['message_ph']}" required></textarea></div>
        <button type="submit" class="btn btn--primary btn--full">{F['submit']}</button>
        <p class="form__note">{F['note']}</p>
      </form>
      <script src="/assets/lead-form.js?v=1" defer></script>
    </div>
  </section>'''


def cmd_todo(lang):
    trp = os.path.join(HERE, f'{lang}.json')
    tr = json.load(open(trp, encoding='utf-8')) if os.path.exists(trp) else {}
    todo = []
    for g in GROUPS:
        for s in collect(open(os.path.join(REPO, g['src']), encoding='utf-8').read()):
            if s not in tr and s not in todo:
                todo.append(s)
    json.dump(todo, open(os.path.join(HERE, f'todo_{lang}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'{lang}: {len(todo)} strings to translate, {len(tr)} already done')


def cmd_merge(lang):
    trp = os.path.join(HERE, f'{lang}.json')
    tr = json.load(open(trp, encoding='utf-8')) if os.path.exists(trp) else {}
    todo = json.load(open(os.path.join(HERE, f'todo_{lang}.json'), encoding='utf-8'))
    add = json.load(open(os.path.join(HERE, f'add_{lang}.json'), encoding='utf-8'))
    if len(add) > len(todo):
        sys.exit(f'add_{lang}.json has {len(add)} items but todo has {len(todo)}')
    for en, t in zip(todo, add):
        tr[en] = t
    json.dump(tr, open(trp, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
    print(f'{lang}: merged {len(add)} strings, dictionary now {len(tr)}')


def cmd_build(lang):
    tr = json.load(open(os.path.join(HERE, f'{lang}.json'), encoding='utf-8'))
    for g in GROUPS:
        html, missing = build_page(g, lang, tr)
        if missing:
            sys.exit(f'{g["src"]}: {len(missing)} strings missing in {lang}.json, e.g. {missing[:3]}')
        out = os.path.join(REPO, g[lang].strip('/'), 'index.html')
        os.makedirs(os.path.dirname(out), exist_ok=True)
        open(out, 'w', encoding='utf-8').write(html)
        print('wrote', g[lang])
    import switcher  # the copied English switcher is replaced by the PT · EN · FR · DE one
    switcher.run()


if __name__ == '__main__':
    {'todo': cmd_todo, 'merge': cmd_merge, 'build': cmd_build}[sys.argv[1]](sys.argv[2])
