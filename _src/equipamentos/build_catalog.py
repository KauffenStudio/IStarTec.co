"""Render the equipment catalogue into /equipamentos/ and /en/equipment/.

    python3 _src/equipamentos/build_catalog.py      (from the repo root or anywhere)

Writes the catalogue between <!-- CATALOGO:START --> / <!-- CATALOGO:END --> and the
CollectionPage JSON-LD between <!-- CATALOGO-LD:START --> / <!-- CATALOGO-LD:END -->.
Product data lives in catalogo_dados.py; valid Bosch data-sheet references in
erp_validos.json (a model only links to its PDF when the PDF really is that model's).
"""
import html, json, os, re, sys, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import catalogo_dados as D  # noqa: E402

ERP_OK = set(json.load(open(os.path.join(HERE, 'erp_validos.json'))))
ERP = 'https://b5-web-product-data-service.azurewebsites.net/pdf/pt-PT/{}.pdf'
VER = '1'

T = {
 'pt': dict(label='Catálogo', title='Os equipamentos, um a um',
            intro='As marcas e gamas que montamos em obras de construtoras e em casas de particulares em todo o Algarve. Filtre por tipo de equipamento, marca ou tipo de obra, e abra a ficha completa de cada produto com todos os modelos.',
            search='Procurar', placeholder='Procurar por produto, modelo ou capacidade (ex.: 300 L, AWF, Minitec)',
            cat='Equipamento', brand='Marca', obra='Tipo de obra', all='Todos', generic='Sem marca', reset='Limpar filtros',
            count='{n} produtos', count1='1 produto', empty='Nenhum produto com estes filtros.',
            more='Ver ficha completa', v3d='Ver em 3D', tour='Ver na visita', pdf='Ficha PDF', maker='Página do fabricante',
            quote='Pedir orçamento', quote_href='/contact/', models='Modelos', specs='Características', suited='Indicado para',
            close='Fechar', credits='Fotografias de produto: Bosch, Uponor e AstralPool, usadas para identificar os equipamentos que instalamos; as marcas pertencem aos respetivos fabricantes. Imagens dos materiais de canalização e modelos 3D: ilustrativos. Fichas PDF: documentação oficial Bosch.'),
 'en': dict(label='Catalogue', title='The equipment, one by one',
            intro="The brands and ranges we fit on developers' sites and in private homes across the Algarve. Filter by equipment, brand or type of job, and open the full details of each product with every model.",
            search='Search', placeholder='Search by product, model or size (e.g. 300 L, AWF, Minitec)',
            cat='Equipment', brand='Brand', obra='Type of job', all='All', generic='Unbranded', reset='Clear filters',
            count='{n} products', count1='1 product', empty='No products match these filters.',
            more='View full details', v3d='View in 3D', tour='Show in the tour', pdf='PDF', maker='Manufacturer page',
            quote='Request a quote', quote_href='/en/contact/', models='Models', specs='Specifications', suited='Suited to',
            close='Close', credits='Product photos: Bosch, Uponor and AstralPool, used to identify the equipment we install; trademarks belong to their owners. Plumbing material images and 3D models are illustrative. PDF sheets: official Bosch documentation.'),
}
LINE_IDS = {'solar': 'solar-termico', 'bomba': 'bombas-de-calor', 'aqs': 'depositos', 'piso': 'piso-radiante', 'piscina': 'piscina', 'canal': 'canalizacao'}
ICON = {
 'search': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
 'cube': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m12 12 8-4.5M12 12v9M12 12 4 7.5"/></svg>',
 'pin': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
 'doc': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
 'ext': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
 'arrow': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
 'close': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
}
e = lambda s: html.escape(str(s), quote=True)
L = lambda v, i: v[i] if isinstance(v, (tuple, list)) else v  # pick language from a (pt, en) pair


def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')


def img_size(name):
    from struct import unpack
    p = os.path.join(REPO, 'assets/equipamentos/img', name)
    with open(p, 'rb') as f:
        b = f.read(64)
    if b[12:16] == b'VP8X':
        w = 1 + int.from_bytes(b[24:27], 'little'); h = 1 + int.from_bytes(b[27:30], 'little')
    elif b[12:16] == b'VP8 ':
        w, h = unpack('<HH', b[26:30]); w &= 0x3fff; h &= 0x3fff
    elif b[12:16] == b'VP8L':
        bits = int.from_bytes(b[21:25], 'little'); w = (bits & 0x3fff) + 1; h = ((bits >> 14) & 0x3fff) + 1
    else:
        w, h = 900, 675
    return w, h


def ficha(p, li, t):
    w, h = img_size(p['img'])
    brand = p['brand'] or t['generic']
    out = [f'<div class="eq-ficha" hidden data-brand="{e(brand)}" data-title="{e(L(p["name"], li))}">',
           f'<figure class="eq-ficha__media"><img src="{D.IMG}{e(p["img"])}" alt="{e(L(p["name"], li))}" width="{w}" height="{h}" loading="lazy" decoding="async" /></figure>',
           '<div class="eq-ficha__body">', f'<p class="eq-ficha__lead">{e(L(p["desc"], li))}</p>',
           '<ul class="eq-ficha__facts">' + ''.join(f'<li>{e(x)}</li>' for x in p['facts'][li]) + '</ul>']
    tb = p.get('table')
    if tb:
        ref = tb.get('ref')
        cols = [L(c, li) for c in tb['cols']]
        out.append(f'<h4>{t["models"]}</h4><div class="eq-table-wrap"><table class="eq-table"><thead><tr>' + ''.join(f'<th scope="col">{e(c)}</th>' for c in cols) + '</tr></thead><tbody>')
        for r in tb['rows']:
            cells = []
            for i, c in enumerate(r):
                if ref is not None and i == ref:
                    c = str(c)
                    cells.append(f'<td><a class="eq-pdf" href="{ERP.format(c)}" target="_blank" rel="noopener">{ICON["doc"]}{t["pdf"]}</a></td>' if c in ERP_OK else '<td>—</td>')
                else:
                    tag = 'th scope="row"' if i == 0 else 'td'
                    cells.append(f'<{tag}>{e(L(c, li))}</{tag.split()[0]}>')
            out.append('<tr>' + ''.join(cells) + '</tr>')
        out.append('</tbody></table></div>')
    if p.get('specs'):
        out.append(f'<h4>{t["specs"]}</h4><dl class="eq-specs">')
        for lp, le, vp, ve in p['specs']:
            out.append(f'<div><dt>{e(lp if li == 0 else le)}</dt><dd>{e(vp if li == 0 or ve is None else ve)}</dd></div>')
        out.append('</dl>')
    obra = ' · '.join(o[1 + li] for o in D.OBRA if o[0] in p['obra'])
    out.append(f'<p class="eq-ficha__tags"><strong>{t["suited"]}:</strong> {e(obra)}</p>')
    out.append('<div class="eq-ficha__cta">' + actions(p, t, in_ficha=True) + '</div></div></div>')
    return ''.join(out)


def actions(p, t, in_ficha=False):
    a = []
    sysid, var = p.get('show') or (None, None)
    v = f' data-eq-variant="{e(var)}"' if var else ''
    if p.get('model3d') and sysid:
        a.append(f'<button type="button" class="eq-btn eq-btn--primary eq-btn--sm" data-eq-show="{sysid}"{v} data-eq-3d>{ICON["cube"]}{t["v3d"]}</button>')
    if sysid:
        a.append(f'<button type="button" class="eq-btn eq-btn--ghost eq-btn--sm" data-eq-show="{sysid}"{v}>{ICON["pin"]}{t["tour"]}</button>')
    if in_ficha:
        if p.get('link'):
            a.append(f'<a class="eq-btn eq-btn--ghost eq-btn--sm" href="{e(p["link"])}" target="_blank" rel="noopener">{ICON["ext"]}{t["maker"]}</a>')
        a.append(f'<a class="eq-btn eq-btn--dark eq-btn--sm" href="{t["quote_href"]}">{t["quote"]} {ICON["arrow"]}</a>')
    return ''.join(a)


def card(p, li, t):
    w, h = img_size(p['img'])
    brand = p['brand'] or t['generic']
    name = L(p['name'], li)
    search = fold(' '.join([name, L(p['short'], li), p['brand'], ' '.join(p['facts'][li])] +
                           [' '.join(str(L(c, li)) for c in r) for r in ((p.get('table') or {}).get('rows') or [])]))
    return (f'<article class="eq-card" id="p-{p["id"]}" data-cat="{p["cat"]}" data-brand="{e(p["brand"] or "generico")}" data-obra="{" ".join(p["obra"])}" data-search="{e(search)}">'
            f'<div class="eq-card__img"><img src="{D.IMG}{e(p["img"])}" alt="{e(name)}" width="{w}" height="{h}" loading="lazy" decoding="async" /><span class="eq-card__brand">{e(brand)}</span></div>'
            f'<div class="eq-card__body"><h3>{e(name)}</h3><p>{e(L(p["short"], li))}</p>'
            '<ul class="eq-card__facts">' + ''.join(f'<li>{e(x)}</li>' for x in p['facts'][li]) + '</ul>'
            f'<div class="eq-card__actions"><button type="button" class="eq-card__more" data-eq-ficha="{p["id"]}" aria-haspopup="dialog">{t["more"]} {ICON["arrow"]}</button>'
            + (f'<button type="button" class="eq-card__3d" data-eq-show="{p["show"][0]}"' + (f' data-eq-variant="{p["show"][1]}"' if p['show'][1] else '') + f' data-eq-3d aria-label="{t["v3d"]}: {e(name)}">{ICON["cube"]}</button>' if p.get('model3d') else '')
            + '</div></div>' + ficha(p, li, t) + '</article>')


def chips(group, items, label, t):
    b = [f'<button type="button" class="eq-fchip is-on" data-f-{group}="all" aria-pressed="true">{t["all"]}</button>']
    for val, txt in items:
        b.append(f'<button type="button" class="eq-fchip" data-f-{group}="{val}" aria-pressed="false">{e(txt)}</button>')
    return f'<div class="eq-fgroup" role="group" aria-label="{e(label)}"><span class="eq-fgroup__label">{e(label)}</span><div class="eq-fchips">' + ''.join(b) + '</div></div>'


def section(lang):
    li = 0 if lang == 'pt' else 1
    t = T[lang]
    n = len(D.P)
    cats = [(c[0], c[1 + li]) for c in D.CATS]
    brands = [('Bosch', 'Bosch'), ('Uponor', 'Uponor'), ('AstralPool', 'AstralPool'), ('generico', t['generic'])]
    obras = [(o[0], o[1 + li]) for o in D.OBRA]
    h = [f'<section class="eq-catalog" aria-labelledby="eqCatalogTitle" data-count="{e(t["count"])}" data-count1="{e(t["count1"])}">',
         '<div class="container">',
         f'<div class="eq-catalog__intro"><div class="section__label">{t["label"]}</div><h2 id="eqCatalogTitle">{t["title"]}</h2><p>{t["intro"]}</p></div>',
         '<div class="eq-filters" role="search">',
         f'<div class="eq-filters__top"><label class="eq-search">{ICON["search"]}<span class="sr-only">{t["search"]}</span><input type="search" id="eqSearch" placeholder="{e(t["placeholder"])}" autocomplete="off" /></label>'
         f'<p class="eq-filters__count" id="eqCount" aria-live="polite">{t["count"].format(n=n)}</p>'
         f'<button type="button" class="eq-filters__reset" id="eqReset" hidden>{t["reset"]}</button></div>',
         chips('cat', cats, t['cat'], t), chips('brand', brands, t['brand'], t), chips('obra', obras, t['obra'], t),
         '</div>', f'<p class="eq-empty" id="eqEmpty" hidden>{t["empty"]}</p>']
    for c in D.CATS:
        items = [p for p in D.P if p['cat'] == c[0]]
        h.append(f'<div class="eq-line" id="{LINE_IDS[c[0]]}" data-line="{c[0]}"><div class="eq-line__head"><h2>{e(c[1 + li])}</h2><p>{e(c[3 + li])}</p></div><div class="eq-grid">')
        h += [card(p, li, t) for p in items]
        h.append('</div></div>')
    h.append(f'<p class="eq-credits">{t["credits"]}</p></div></section>')
    h.append(f'<dialog class="eq-dialog" id="eqFicha" aria-labelledby="eqFichaTitle"><div class="eq-dialog__head"><div><span class="eq-dialog__brand"></span><h3 class="eq-dialog__title" id="eqFichaTitle"></h3></div>'
             f'<button type="button" class="eq-icon-btn eq-dialog__close" data-ficha-close aria-label="{t["close"]}">{ICON["close"]}</button></div><div class="eq-dialog__content"></div></dialog>')
    return '\n'.join(h)


def jsonld(lang):
    li = 0 if lang == 'pt' else 1
    base = 'https://istartec.co/equipamentos/' if lang == 'pt' else 'https://istartec.co/en/equipment/'
    items = []
    for i, p in enumerate(D.P, 1):
        name = L(p['name'], li)
        if p['brand']:
            name = f'{name} ({p["brand"]})' if p['brand'] not in name else name
        items.append({'@type': 'ListItem', 'position': i, 'name': name, 'url': f'{base}#p-{p["id"]}', 'image': f'https://istartec.co{D.IMG}{p["img"]}'})
    data = {'@context': 'https://schema.org', '@type': 'CollectionPage', '@id': base + '#webpage', 'url': base,
            'name': 'Equipamentos em 3D: Bosch, Uponor e AstralPool' if lang == 'pt' else 'Equipment in 3D: Bosch, Uponor and AstralPool',
            'description': ('Catálogo do equipamento que a iStarTec instala no Algarve: solar térmico, bombas de calor e depósitos Bosch, piso radiante Uponor, equipamento de piscina AstralPool e materiais de canalização, com visita guiada em 3D.'
                            if lang == 'pt' else 'Catalogue of the equipment iStarTec installs in the Algarve: Bosch solar thermal, heat pumps and cylinders, Uponor underfloor heating, AstralPool pool equipment and plumbing materials, with a 3D guided tour.'),
            'inLanguage': 'pt-PT' if lang == 'pt' else 'en', 'isPartOf': {'@id': 'https://istartec.co/#website'}, 'about': {'@id': 'https://istartec.co/#business'},
            'publisher': {'@id': 'https://istartec.co/#organization'}, 'primaryImageOfPage': 'https://istartec.co/assets/equipamentos/tour-og.jpg',
            'datePublished': '2026-11-12', 'dateModified': '2026-11-13',
            'mainEntity': {'@type': 'ItemList', 'name': 'Equipamentos instalados pela iStarTec' if lang == 'pt' else 'Equipment installed by iStarTec', 'numberOfItems': len(items), 'itemListElement': items}}
    return '<script type="application/ld+json">\n' + json.dumps(data, ensure_ascii=False, indent=1) + '\n  </script>'


def patch(path, lang):
    f = os.path.join(REPO, path)
    s = open(f, encoding='utf-8').read()
    body = '<!-- CATALOGO:START -->\n' + section(lang) + '\n<!-- CATALOGO:END -->'
    if '<!-- CATALOGO:START -->' in s:
        s = re.sub(r'<!-- CATALOGO:START -->.*?<!-- CATALOGO:END -->', lambda m: body, s, flags=re.S)
    else:
        i = s.index('<section class="eq-catalog"'); j = s.index('</section>', i) + len('</section>')
        s = s[:i] + body + s[j:]
    ld = '<!-- CATALOGO-LD:START -->\n  ' + jsonld(lang) + '\n  <!-- CATALOGO-LD:END -->'
    if '<!-- CATALOGO-LD:START -->' in s:
        s = re.sub(r'<!-- CATALOGO-LD:START -->.*?<!-- CATALOGO-LD:END -->', lambda m: ld, s, flags=re.S)
    else:
        m = re.search(r'<script type="application/ld\+json">\s*\{\s*"@context": "https://schema.org",\s*"@type": "CollectionPage".*?</script>', s, re.S)
        s = s[:m.start()] + ld + s[m.end():]
    tag = f'<script src="/assets/equipamentos/catalogo.js?v={VER}" defer></script>'
    s = re.sub(r'<script src="/assets/equipamentos/catalogo\.js\?v=\d+" defer></script>\n?', '', s)
    s = s.replace('<script src="/assets/consent.js" defer></script>', tag + '\n  <script src="/assets/consent.js" defer></script>', 1)
    open(f, 'w', encoding='utf-8').write(s)
    print('catalogue written:', path, len(D.P), 'products')


if __name__ == '__main__':
    patch('equipamentos/index.html', 'pt')
    patch('en/equipment/index.html', 'en')
