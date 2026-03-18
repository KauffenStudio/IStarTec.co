/* ─────────────────────────────────────────────────────────
   KAUFFEN — script.js
   ───────────────────────────────────────────────────────── */

/* ── TRANSLATIONS ────────────────────────────────────────── */
const translations = {
  pt: {
    // Nav
    'nav.home':        'Início',
    'nav.services':    'Serviços',
    'nav.portfolio':   'Portfolio',
    'nav.about':       'Sobre Nós',
    'nav.cta':         'Pedir Orçamento',
    'contact.label.short': 'Contacto',
    // Hero
    'hero.title':      'Instalações<br>Hidráulicas<br><span class="accent">de Precisão.</span>',
    'hero.sub':        'Sistemas técnicos de canalização e hidráulica para construção residencial, moradias de luxo e grandes empreendimentos no Algarve.',
    'hero.btn1':       'Os Nossos Serviços',
    'hero.btn2':       'Ver Projetos',
    'hero.scroll':     'Rolar',
    // Stats
    'stats.projects':  'Projetos Concluídos',
    'stats.years':     'Anos de Experiência',
    'stats.focus':     'Foco Residencial',
    'stats.brands':    'Marcas Parceiras',
    // Services section
    'services.label':  'O Que Fazemos',
    'services.title':  'Serviços de Instalação Técnica',
    'services.desc':   'Desde o planeamento hidráulico até à comissionamento final, entregamos sistemas de instalação completos, projetados para desempenho e durabilidade.',
    // Service cards
    'svc.plumbing.title':    'Instalações de Canalização',
    'svc.plumbing.desc':     'Sistemas hidráulicos completos para edifícios residenciais e moradias de luxo — projetados, fornecidos e instalados segundo os mais elevados padrões técnicos.',
    'svc.plumbing.li1':      'Redes de abastecimento de água',
    'svc.plumbing.li2':      'Sistemas de esgotos',
    'svc.plumbing.li3':      'Drenagem de águas pluviais',
    'svc.plumbing.li4':      'Sistemas de ventilação',
    'svc.plumbing.li5':      'Drenagem de condensados de AC',
    'svc.plumbing.li6':      'Coletores hidráulicos',
    'svc.radiant.title':     'Sistema de Chão Radiante',
    'svc.radiant.desc':      'Instalação completa de chão radiante Uponor — tubagem de aquecimento, coletores de distribuição, bombas de circulação e acumuladores integrados com bomba de calor aerotérmica.',
    'svc.solar.title':       'Sistemas Solares Térmicos',
    'svc.solar.desc':        'Projeto e instalação de coletores solares térmicos para aquecimento de água quente sanitária, adaptados à elevada irradiância solar do Algarve.',
    'svc.sanitary.title':    'Instalações Sanitárias',
    'svc.sanitary.desc':     'Instalação completa de equipamentos sanitários — bases de duche, banheiras, sanitas e bidés suspensos, torneiras e ligações de esgotos em obra nova e remodelação.',
    // Why
    'why.label':       'Porquê a Kauffen',
    'why.title':       'Pensado para Construtores e Promotores',
    'why.1.title':     'Competência Técnica',
    'why.1.desc':      'Especificação e execução de grau de engenharia em cada sistema que instalamos. As nossas equipas trabalham diretamente a partir de desenhos arquitetónicos e esquemas MEP.',
    'why.2.title':     'Coordenação de Obra',
    'why.2.desc':      'Integramo-nos perfeitamente nos programas de fase de construção, coordenando com empreiteiros civis, elétricos e AVAC em empreendimentos multi-moradia complexos.',
    'why.3.title':     'Materiais Premium',
    'why.3.desc':      'Trabalhamos exclusivamente com marcas europeias certificadas — Uponor e Bosch, entre outras — garantindo a longevidade do sistema e o cumprimento da garantia.',
    'why.4.title':     'Especialistas no Algarve',
    'why.4.desc':      'Conhecimento local profundo do terreno, clima e requisitos regulatórios do Algarve, desenvolvido ao longo de décadas de projetos de construção residencial e de luxo.',
    // Portfolio
    'portfolio.label':           'Projetos Selecionados',
    'portfolio.title':           'Portfolio',
    'portfolio.desc':            'Projetos entregues em Portimão e no Algarve, incluindo obras executadas em colaboração com a empresa de construção <strong>Ordem Geométrica</strong>.',
    'portfolio.filter.all':      'Todos',
    'portfolio.filter.portimao': 'Portimão',
    'portfolio.filter.alvor':    'Alvor',
    'portfolio.filter.albufeira': 'Albufeira',
    'units.label': 'habitações',
    // Portfolio cards
    'p1.title':  'Edifício S. Lourenço Deluxe · Portimão',
    'p1.desc':   'Instalação hidráulica completa — abastecimento, esgotos, solar térmico e bomba de calor. Em colaboração com <em>Ordem Geométrica</em>.',
    'p2.title':  'Edifício Bellevue Lote 13 · Praia da Rocha',
    'p2.desc':   'Infraestrutura hidráulica completa para condomínio privado de luxo. Em colaboração com <em>Ordem Geométrica</em>.',
    'p3.title':  'Edifício Vavilon Residence · Portimão',
    'p3.desc':   'Condomínio privado — instalações completas incluindo ventilação e drenagem AC. Em colaboração com <em>Ordem Geométrica</em>.',
    'p4.title':  'Ocean Breeze Residence · Praia da Rocha',
    'p4.desc':   'Moradia de alto padrão com Uponor piso radiante, solar térmico para AQS e sistema de esgotos completo. Em colaboração com <em>Ordem Geométrica</em>.',
    'p5.title':  'Edifício Elite Residence · Praia da Rocha',
    'p5.desc':   'Edifício residencial de 104 habitações — especificação completa de canalização, coletores hidráulicos e sistemas Bosch. Em colaboração com <em>Ordem Geométrica</em>.',
    'p6.title':  'Residência Privada · Alvor',
    'p6.desc':   'Moradia V8 com 8 quartos e 330 m² — aproveitamento pluvial, reutilização de águas cinzentas e solar térmico para AQS. Em colaboração com <em>Ordem Geométrica</em>.',
    'p7.title':  'Albufeira Garden · Albufeira',
    'p7.desc':   'Nova construção pelo Grupo Libertas em Albufeira — 76 apartamentos com instalações hidráulicas completas e sistemas de bomba de calor.',
    'p8.title':  'Fojo Lote 47 · Portimão',
    'p8.desc':   'Edifício residencial de 38 habitações — instalações hidráulicas completas. Em colaboração com <em>Ordem Geométrica</em>.',
    'p9.title':  'Edifício Urbigal · Praia da Rocha',
    'p9.desc':   'Edifício residencial de 45 habitações — sistemas hidráulicos e solar térmico. Em colaboração com <em>Ordem Geométrica</em>.',
    'p10.title': 'Edifício Iate Residence · Praia da Rocha',
    'p10.desc':  'Edifício residencial de 27 habitações — instalação hidráulica completa e coletores hidráulicos. Em colaboração com <em>Ordem Geométrica</em>.',
    'p11.title': 'Sesmarias · Portimão',
    'p11.desc':  'Moradia de 15 habitações com piscina — instalações hidráulicas e solar térmico. Em colaboração com <em>Ordem Geométrica</em>.',
    'p12.title': 'Garden City 16/17 · Portimão',
    'p12.desc':  'Edifício residencial de 38 habitações — instalações hidráulicas completas e bomba de calor. Em colaboração com <em>Ordem Geométrica</em>.',
    'p13.title': 'Lote 7/8 · Portimão',
    'p13.desc':  'Edifício residencial de 36 habitações — sistemas hidráulicos e coletores. Em colaboração com <em>Ordem Geométrica</em>.',
    'p14.title': 'Alvor Ria Residence · Alvor',
    'p14.desc':  'Empreendimento residencial de 30 apartamentos frente à Ria de Alvor — instalações hidráulicas e solar térmico. Em colaboração com <em>Ordem Geométrica</em>.',
    'p15.title': 'Moradia emohb I · Portimão',
    'p15.desc':  'Conjunto de 3 moradias — canalização completa, bomba de calor, chão radiante e painéis solares térmicos. Em colaboração com <em>emohb</em>.',
    'p16.title': 'Moradia emohb II · Portimão',
    'p16.desc':  'Conjunto de 3 moradias — canalização completa, bomba de calor, chão radiante e painéis solares térmicos. Em colaboração com <em>emohb</em>.',
    'portfolio.gallery': 'Ver Galeria',
    // Portfolio tags
    'tag.plumbing':    'Canalização',
    'tag.solar':       'Solar Térmico',
    'tag.heatpump':    'Bomba de Calor',
    'tag.drainage':    'Drenagem',
    'tag.collectors':  'Coletores',
    'tag.ventilation': 'Ventilação',
    'tag.ac':          'Drenagem AC',
    'tag.sewage':      'Esgotos',
    'tag.rain':        'Águas Pluviais',
    // Collaboration
    'emohb.desc':  'Empresa de construção e mediação imobiliária no Algarve, com mais de 30 anos de conhecimento na área. Parceira na execução de moradias modernas em Portimão.',
    'emohb.li1':   'Construção e mediação imobiliária',
    'emohb.li2':   'Moradias modernas em Portimão',
    'emohb.li3':   '+30 anos de experiência',
    'collab.label':      'Parceiros de Longa Data',
    'collab.desc':       'Vários projetos no Algarve foram executados em colaboração com a Ordem Geométrica, uma das principais empresas de construção da região. Esta parceria garante uma integração perfeita entre a construção civil e as instalações técnicas.',
    'collab.tacu.desc':  'Empresa de construção parceira de longa data no Algarve, com vasta experiência em obras residenciais de qualidade na região.',
    // Brands
    'brands.label':  'Fornecedores de Confiança',
    'brands.title':  'Marcas com que Trabalhamos',
    'brands.desc':   'Especificamos e instalamos produtos de fabricantes europeus certificados, garantindo o desempenho do sistema, cumprimento de garantias e fiabilidade a longo prazo.',
    'bosch.desc':    'Bombas de calor para AQS, sistemas solares térmicos e soluções de água quente doméstica. Engenharia alemã, fiabilidade global.',
    'bosch.li1':     'Bombas de calor aerotérmicas',
    'bosch.li2':     'Coletores solares térmicos',
    'bosch.li3':     'Esquentadores domésticos',
    'uponor.desc':   'Sistemas de tubagem em PEX, aquecimento por piso radiante e sistemas de tubo pré-isolado. A referência em instalações hidráulicas residenciais.',
    'uponor.li1':    'Sistemas de abastecimento em PEX',
    'uponor.li2':    'Aquecimento por piso radiante',
    'uponor.li3':    'Sistemas de coletores',
    'libertas.desc': 'Grupo imobiliário com presença consolidada no Algarve, responsável por empreendimentos residenciais de nova construção de alto padrão.',
    'libertas.li1':  'Albufeira Garden — 76 apartamentos',
    'libertas.li2':  'Nova construção em Albufeira',
    'libertas.li3':  'Promotor de referência no Algarve',
    'montalgarve.desc': 'Fornecedor de materiais de construção e instalações técnicas com vasta oferta de produtos hidráulicos, tubagem e acessórios para obra.',
    'montalgarve.li1':  'Materiais de canalização e hidráulica',
    'montalgarve.li2':  'Tubagem e acessórios técnicos',
    'montalgarve.li3':  'Fornecedor local de confiança',
    'nicolau.desc':  'Distribuidor especializado em materiais técnicos para instalações hidráulicas e sanitárias, com ampla gama de produtos para nova construção.',
    'nicolau.li1':   'Materiais sanitários e hidráulicos',
    'nicolau.li2':   'Equipamentos de instalação técnica',
    'nicolau.li3':   'Distribuidor regional de referência',
    'sanitop.desc':  'Especialista em equipamentos e acessórios sanitários de qualidade superior, com ampla gama de produtos para instalações técnicas residenciais e de obra.',
    'sanitop.li1':   'Equipamentos sanitários certificados',
    'sanitop.li2':   'Acessórios para instalações técnicas',
    'sanitop.li3':   'Soluções para nova construção',
    // Partners
    'partners.label':          'Parcerias Estratégicas',
    'partners.title':          'Parceiros',
    'partners.desc':           'Trabalhamos lado a lado com promotores imobiliários e construtoras líderes no Algarve, integrando as nossas instalações técnicas nos seus projetos de referência.',
    'partner.type.developer':  'Promotor Imobiliário',
    'partner.type.builder':    'Empresa de Construção',
    'og.desc':  'Uma das principais empresas de construção residencial do Algarve, com vasto historial em empreendimentos de luxo em Portimão e na costa algarvia.',
    'og.li1':   'Edifícios residenciais em Portimão',
    'og.li2':   'Projetos de luxo na Praia da Rocha',
    'og.li3':   'Construtor de referência no Algarve',
    // About
    'about.label':   'Sobre a Kauffen',
    'about.title':   'Especialistas em Instalações Técnicas',
    'about.p1':      'A Kauffen é uma empresa especializada em instalações técnicas sediada no Algarve, focada exclusivamente em sistemas hidráulicos e de canalização para construção residencial. Trabalhamos com construtoras, promotores, arquitetos e construtores de moradias em toda a região.',
    'about.p2':      'Ao contrário de um empreiteiro de canalização genérico, o nosso foco é inteiramente na nova construção — integrando sistemas na fase certa da obra, trabalhando a partir de projetos técnicos e entregando documentação de comissionamento na conclusão.',
    'about.p3':      'O nosso trabalho abrange desde residências privadas a empreendimentos multi-fração, com um forte historial em Portimão, Albufeira e na costa do Algarve. Somos parceiros orgulhosos da <strong>Ordem Geométrica</strong>, <strong>Tacu Bacaliuc</strong> e <strong>emohb</strong>, colaborando em muitos dos seus projetos de construção residencial.',
    'about.badge1':  'Empreiteiro Certificado',
    'about.badge2':  'Sediado no Algarve',
    'about.badge3':  'Nova Construção',
    'about.badge4':  'Remodelações',
    'about.years':   'Anos de Experiência',
    // Contact
    'contact.label':         'Entre em Contacto',
    'contact.title':         'Pedir Orçamento de Projeto',
    'contact.desc':          'Trabalhamos com construtoras, arquitetos, promotores e construtores de moradias em todo o Algarve. Envie os detalhes do seu projeto e respondemos em 24 horas.',
    'contact.loc.label':     'Localização',
    'contact.email.label':   'Email',
    'contact.phone.label':   'Telefone',
    'contact.area':          'Área de Serviço',
    // Form
    'form.name':              'Nome Completo *',
    'form.name.ph':           'João Silva',
    'form.company':           'Empresa',
    'form.company.ph':        'Construtora Exemplo Lda',
    'form.email':             'Email *',
    'form.phone':             'Telefone',
    'form.type':              'Tipo de Projeto *',
    'form.type.ph':           'Selecionar tipo de projeto',
    'form.type.villa':        'Moradia Privada',
    'form.type.residential':  'Edifício Residencial',
    'form.type.luxury':       'Empreendimento de Luxo',
    'form.type.apartment':    'Complexo de Apartamentos',
    'form.type.other':        'Outro',
    'form.location':          'Localização do Projeto',
    'form.location.ph':       'ex. Portimão, Albufeira, Lagos...',
    'form.services':          'Serviços Necessários',
    'form.svc.plumbing':      'Instalação de Canalização',
    'form.svc.radiant':       'Chão Radiante',
    'form.svc.solar':         'Solar Térmico',
    'form.svc.sanitary':      'Instalações Sanitárias',
    'form.svc.ventilation':   'Ventilação',
    'form.message':           'Descrição do Projeto *',
    'form.message.ph':        'Descreva o seu projeto — número de frações, fase de construção, prazo, requisitos específicos...',
    'form.submit':            'Enviar Pedido de Orçamento',
    'form.note':              'Respondemos em 24 horas úteis. Os seus dados são tratados de forma confidencial.',
    // Footer
    'footer.desc':    'Especialistas em instalações de canalização e hidráulica para construção residencial no Algarve, Portugal.',
    'footer.nav':     'Navegação',
    'footer.bosch':   'Parceiro Bosch',
    'footer.uponor':  'Certificado Uponor',
    'footer.copy':    '© 2025 Kauffen. Todos os direitos reservados.',
    'footer.tagline': 'Instalações Técnicas · Algarve, Portugal',
    // Success message
    'success.title': 'Pedido de Orçamento Enviado',
    'success.desc':  'Obrigado pelo seu contacto. Um membro da equipa Kauffen entrará em contacto em 24 horas úteis.',
    'form.sending':  'A enviar…',
  },
  en: {
    // Nav
    'nav.home':        'Home',
    'nav.services':    'Services',
    'nav.portfolio':   'Portfolio',
    'nav.about':       'About',
    'nav.cta':         'Request Quote',
    'contact.label.short': 'Contact',
    // Hero
    'hero.title':      'Precision<br>Hydraulic<br><span class="accent">Installations.</span>',
    'hero.sub':        'Technical plumbing and hydraulic systems for residential construction, luxury villas and large-scale developments across the Algarve.',
    'hero.btn1':       'Our Services',
    'hero.btn2':       'View Projects',
    'hero.scroll':     'Scroll',
    // Stats
    'stats.projects':  'Projects Completed',
    'stats.years':     'Years of Experience',
    'stats.focus':     'Residential Focused',
    'stats.brands':    'Key Partner Brands',
    // Services section
    'services.label':  'What We Do',
    'services.title':  'Technical Installation Services',
    'services.desc':   'From hydraulic planning to final commissioning, we deliver complete installation systems engineered for performance and longevity.',
    // Service cards
    'svc.plumbing.title':    'Plumbing Installations',
    'svc.plumbing.desc':     'Full hydraulic systems for residential buildings and luxury villas — designed, supplied and installed to the highest technical standards.',
    'svc.plumbing.li1':      'Water supply networks',
    'svc.plumbing.li2':      'Sewage systems',
    'svc.plumbing.li3':      'Rainwater drainage',
    'svc.plumbing.li4':      'Ventilation systems',
    'svc.plumbing.li5':      'AC condensate drainage',
    'svc.plumbing.li6':      'Hydraulic collectors',
    'svc.radiant.title':     'Radiant Floor System',
    'svc.radiant.desc':      'Complete Uponor radiant floor installation — heating pipework, distribution collectors, circulation pumps and accumulators integrated with aerothermal heat pump.',
    'svc.solar.title':       'Solar Thermal Systems',
    'svc.solar.desc':        'Design and installation of solar thermal collectors for domestic hot water heating, tailored to Algarve\'s high solar irradiance.',
    'svc.sanitary.title':    'Sanitary Installations',
    'svc.sanitary.desc':     'Complete sanitary equipment installation — shower trays, baths, wall-hung toilets and bidets, taps and waste connections for new builds and renovations.',
    // Why
    'why.label':       'Why Kauffen',
    'why.title':       'Built for Contractors & Developers',
    'why.1.title':     'Technical Expertise',
    'why.1.desc':      'Engineering-grade specification and execution across every system we install. Our teams work directly from architectural drawings and MEP schematics.',
    'why.2.title':     'Project Coordination',
    'why.2.desc':      'We integrate seamlessly within construction-phase programmes, coordinating with civil, electrical and HVAC trades on complex multi-villa developments.',
    'why.3.title':     'Premium Materials',
    'why.3.desc':      'We work exclusively with certified European brands — Uponor and Bosch among others — guaranteeing system longevity and warranty compliance.',
    'why.4.title':     'Algarve Specialists',
    'why.4.desc':      'Deep local knowledge of Algarve terrain, climate and regulatory requirements, developed across decades of residential and luxury construction projects.',
    // Portfolio
    'portfolio.label':           'Selected Projects',
    'portfolio.title':           'Portfolio',
    'portfolio.desc':            'Projects delivered across Portimão and the Algarve region, including works executed in collaboration with construction company <strong>Ordem Geométrica</strong>.',
    'portfolio.filter.all':      'All Projects',
    'portfolio.filter.portimao': 'Portimão',
    'portfolio.filter.alvor':    'Alvor',
    'portfolio.filter.albufeira': 'Albufeira',
    'units.label': 'units',
    // Portfolio cards
    'p1.title':  'S. Lourenço Deluxe Building · Portimão',
    'p1.desc':   'Full hydraulic installation — water supply, sewage, solar thermal and heat pump. In collaboration with <em>Ordem Geométrica</em>.',
    'p2.title':  'Bellevue Building Lot 13 · Praia da Rocha',
    'p2.desc':   'Complete hydraulic infrastructure for a luxury private condominium. In collaboration with <em>Ordem Geométrica</em>.',
    'p3.title':  'Vavilon Residence Building · Portimão',
    'p3.desc':   'Private condominium — full installations including ventilation and AC drainage. In collaboration with <em>Ordem Geométrica</em>.',
    'p4.title':  'Ocean Breeze Residence · Praia da Rocha',
    'p4.desc':   'High-end villa with Uponor radiant floor heating, solar thermal DHW and full sewage system. In collaboration with <em>Ordem Geométrica</em>.',
    'p5.title':  'Elite Residence Building · Praia da Rocha',
    'p5.desc':   'Residential building with 104 units — full plumbing specification, hydraulic collectors and Bosch systems. In collaboration with <em>Ordem Geométrica</em>.',
    'p6.title':  'Private Residence · Alvor',
    'p6.desc':   'Villa V8 with 8 bedrooms and 330 m² — rainwater harvesting, grey water recycling and solar thermal DHW. In collaboration with <em>Ordem Geométrica</em>.',
    'p7.title':  'Albufeira Garden · Albufeira',
    'p7.desc':   'New development by Grupo Libertas in Albufeira — 76 apartments with full hydraulic installations and heat pump systems.',
    'p8.title':  'Fojo Lote 47 · Portimão',
    'p8.desc':   '38-unit residential building — full hydraulic installations. In collaboration with <em>Ordem Geométrica</em>.',
    'p9.title':  'Urbigal Building · Praia da Rocha',
    'p9.desc':   '45-unit residential building — hydraulic systems and solar thermal. In collaboration with <em>Ordem Geométrica</em>.',
    'p10.title': 'Iate Residence Building · Praia da Rocha',
    'p10.desc':  '27-unit residential building — full hydraulic installation and hydraulic collectors. In collaboration with <em>Ordem Geométrica</em>.',
    'p11.title': 'Sesmarias · Portimão',
    'p11.desc':  '15-unit residential complex with pool — hydraulic installations and solar thermal. In collaboration with <em>Ordem Geométrica</em>.',
    'p12.title': 'Garden City 16/17 · Portimão',
    'p12.desc':  '38-unit residential building — full hydraulic installations and heat pump. In collaboration with <em>Ordem Geométrica</em>.',
    'p13.title': 'Lote 7/8 · Portimão',
    'p13.desc':  '36-unit residential building — hydraulic systems and collectors. In collaboration with <em>Ordem Geométrica</em>.',
    'p14.title': 'Alvor Ria Residence · Alvor',
    'p14.desc':  '30-apartment residential development facing the Ria de Alvor — hydraulic installations and solar thermal. In collaboration with <em>Ordem Geométrica</em>.',
    'p15.title': 'emohb Villa I · Portimão',
    'p15.desc':  'Group of 3 villas — full plumbing, heat pump, radiant floor heating and solar thermal panels. In collaboration with <em>emohb</em>.',
    'p16.title': 'emohb Villa II · Portimão',
    'p16.desc':  'Group of 3 villas — full plumbing, heat pump, radiant floor heating and solar thermal panels. In collaboration with <em>emohb</em>.',
    'portfolio.gallery': 'View Gallery',
    // Portfolio tags
    'tag.plumbing':    'Plumbing',
    'tag.solar':       'Solar Thermal',
    'tag.heatpump':    'Heat Pump',
    'tag.drainage':    'Drainage',
    'tag.collectors':  'Collectors',
    'tag.ventilation': 'Ventilation',
    'tag.ac':          'AC Drainage',
    'tag.sewage':      'Sewage',
    'tag.rain':        'Rainwater',
    // Collaboration
    'collab.label':      'Long-term Partners',
    'collab.desc':       'Several projects across the Algarve have been executed in collaboration with Ordem Geométrica, a leading construction company in the region. This partnership ensures seamless integration between civil construction and technical installations.',
    'collab.tacu.desc':  'Long-term construction partner in the Algarve, with extensive experience in quality residential projects across the region.',
    // Brands
    'brands.label':  'Trusted Suppliers',
    'brands.title':  'Brands We Work With',
    'brands.desc':   'We specify and install products from certified European manufacturers, ensuring system performance, warranty compliance and long-term reliability.',
    'bosch.desc':    'Heat pump water heaters, solar thermal systems and domestic hot water solutions. German engineering, global reliability.',
    'bosch.li1':     'Aerothermal heat pumps',
    'bosch.li2':     'Solar thermal collectors',
    'bosch.li3':     'Domestic water heaters',
    'uponor.desc':   'PEX piping systems, underfloor heating and pre-insulated pipe systems. The benchmark for residential hydraulic installations.',
    'uponor.li1':    'PEX water supply systems',
    'uponor.li2':    'Radiant floor heating',
    'uponor.li3':    'Manifold systems',
    'libertas.desc': 'Real estate group with a strong presence in the Algarve, responsible for high-quality new-build residential developments.',
    'libertas.li1':  'Albufeira Garden — 76 apartments',
    'libertas.li2':  'New construction in Albufeira',
    'libertas.li3':  'Leading developer in the Algarve',
    'montalgarve.desc': 'Construction materials and technical installations supplier with a wide range of hydraulic products, piping and accessories for the trade.',
    'montalgarve.li1':  'Plumbing and hydraulic materials',
    'montalgarve.li2':  'Technical piping and accessories',
    'montalgarve.li3':  'Trusted local supplier',
    'nicolau.desc':  'Specialist distributor of technical materials for hydraulic and sanitary installations, with a broad product range for new construction.',
    'nicolau.li1':   'Sanitary and hydraulic materials',
    'nicolau.li2':   'Technical installation equipment',
    'nicolau.li3':   'Regional reference distributor',
    'sanitop.desc':  'Specialist in high-quality sanitary equipment and accessories, with a wide range of products for residential and commercial technical installations.',
    'sanitop.li1':   'Certified sanitary equipment',
    'sanitop.li2':   'Technical installation accessories',
    'sanitop.li3':   'Solutions for new construction',
    // Partners
    'partners.label':          'Strategic Partnerships',
    'partners.title':          'Partners',
    'partners.desc':           'We work side by side with leading real estate developers and construction companies in the Algarve, integrating our technical installations into their landmark projects.',
    'partner.type.developer':  'Real Estate Developer',
    'partner.type.builder':    'Construction Company',
    'og.desc':  'One of the Algarve\'s leading residential construction companies, with an extensive track record in luxury developments in Portimão and the Algarve coast.',
    'og.li1':   'Residential buildings in Portimão',
    'og.li2':   'Luxury projects at Praia da Rocha',
    'og.li3':   'Reference builder in the Algarve',
    // About
    'about.label':   'About Kauffen',
    'about.title':   'Technical Installation Specialists',
    'about.p1':      'Kauffen is a technical installation contractor based in the Algarve, specialising exclusively in hydraulic and plumbing systems for residential construction. We work with construction companies, developers, architects and villa builders throughout the region.',
    'about.p2':      'Unlike a general plumbing contractor, our focus is entirely on new construction — integrating systems at the right phase of a build, working from professional drawings, and delivering commissioning documentation at handover.',
    'about.p3':      'Our work spans single private residences to multi-unit developments, with a strong track record in Portimão, Albufeira and the wider Algarve coast. We are proud partners of <strong>Ordem Geométrica</strong>, <strong>Tacu Bacaliuc</strong> and <strong>emohb</strong>, collaborating on many of their residential construction projects.',
    'about.badge1':  'Certified Contractor',
    'about.badge2':  'Algarve-Based',
    'about.badge3':  'New Construction',
    'about.badge4':  'Renovations',
    'about.years':   'Years of Experience',
    // Contact
    'contact.label':         'Get in Touch',
    'contact.title':         'Request a Project Quote',
    'contact.desc':          'We work with construction companies, architects, developers and villa builders across the Algarve. Submit your project details and we\'ll respond within 24 hours.',
    'contact.loc.label':     'Location',
    'contact.email.label':   'Email',
    'contact.phone.label':   'Phone',
    'contact.area':          'Service Area',
    // Form
    'form.name':              'Full Name *',
    'form.name.ph':           'João Silva',
    'form.company':           'Company',
    'form.company.ph':        'Construction Company Ltd',
    'form.email':             'Email Address *',
    'form.phone':             'Phone Number',
    'form.type':              'Project Type *',
    'form.type.ph':           'Select project type',
    'form.type.villa':        'Private Villa',
    'form.type.residential':  'Residential Building',
    'form.type.luxury':       'Luxury Development',
    'form.type.apartment':    'Apartment Complex',
    'form.type.other':        'Other',
    'form.location':          'Project Location',
    'form.location.ph':       'e.g. Portimão, Albufeira, Lagos...',
    'form.services':          'Services Required',
    'form.svc.plumbing':      'Plumbing Installation',
    'form.svc.radiant':       'Radiant Floor',
    'form.svc.solar':         'Solar Thermal',
    'form.svc.sanitary':      'Sanitary Installations',
    'form.svc.ventilation':   'Ventilation',
    'form.message':           'Project Description *',
    'form.message.ph':        'Please describe your project — number of units, construction phase, timeline, any specific requirements...',
    'form.submit':            'Submit Quote Request',
    'form.note':              'We respond within 24 business hours. Your details are kept confidential.',
    // Footer
    'footer.desc':    'Technical plumbing and hydraulic installation specialists for residential construction in the Algarve, Portugal.',
    'footer.nav':     'Navigation',
    'footer.bosch':   'Bosch Partner',
    'footer.uponor':  'Uponor Certified',
    'footer.copy':    '© 2025 Kauffen. All rights reserved.',
    'footer.tagline': 'Technical Installations · Algarve, Portugal',
    // Success message
    'success.title': 'Quote Request Sent',
    'success.desc':  'Thank you for your enquiry. A member of the Kauffen team will be in touch within 24 business hours.',
    'form.sending':  'Sending…',
  }
};

/* ── Language engine ─────────────────────────────────────── */
let currentLang = 'pt';

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  // Update data-i18n (textContent)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key] !== undefined) {
      el.textContent = translations[lang][key];
    }
  });

  // Update data-i18n-html (innerHTML — for elements with <br>, <em>, <strong>)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (translations[lang][key] !== undefined) {
      el.innerHTML = translations[lang][key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key] !== undefined) {
      el.placeholder = translations[lang][key];
    }
  });

  // Update select option text
  document.querySelectorAll('option[data-i18n]').forEach(opt => {
    const key = opt.getAttribute('data-i18n');
    if (translations[lang][key] !== undefined) {
      opt.textContent = translations[lang][key];
    }
  });

  // Toggle active button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('lang-btn--active', btn.dataset.lang === lang);
  });

  // Refresh units badges with new language label
  renderUnitsBadges();
}

/* ── Language toggle (sliding pill) ─────────────────────── */
function updateLangSlider() {
  const toggle    = document.getElementById('langSwitch');
  const track     = document.getElementById('langTrack');
  const activeBtn = toggle.querySelector('.lang-toggle__btn--active');
  if (!track || !activeBtn) return;
  const toggleRect = toggle.getBoundingClientRect();
  const btnRect    = activeBtn.getBoundingClientRect();
  track.style.width     = btnRect.width  + 'px';
  track.style.transform = `translateX(${btnRect.left - toggleRect.left - 3}px)`;
}

document.querySelectorAll('.lang-toggle__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-toggle__btn').forEach(b => b.classList.remove('lang-toggle__btn--active'));
    btn.classList.add('lang-toggle__btn--active');
    setLanguage(btn.dataset.lang);
    updateLangSlider();
  });
});

/* ── Sticky header shadow ─────────────────────────────────── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Mobile nav toggle ────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

/* ── Active nav link on scroll ────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navItems  = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

function setActiveLink() {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) current = section.id;
  });
  navItems.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}
window.addEventListener('scroll', setActiveLink, { passive: true });

/* ── Scroll reveal (directional) ────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

function addReveal(el, type = 'reveal', delay = 0) {
  if (!el) return;
  el.classList.add(type);
  el.style.transitionDelay = delay + 'ms';
  revealObserver.observe(el);
}

// Section headers — slide from left
document.querySelectorAll('.section__header').forEach(el => addReveal(el, 'reveal-left'));

// Service cards — staggered up
document.querySelectorAll('.service-card').forEach((el, i) => addReveal(el, 'reveal', i * 70));

// Why items — alternating left/right
document.querySelectorAll('.why__item').forEach((el, i) =>
  addReveal(el, i % 2 === 0 ? 'reveal-left' : 'reveal-right', i * 80)
);

// Portfolio cards — staggered scale
document.querySelectorAll('.portfolio-card').forEach((el, i) => addReveal(el, 'reveal-scale', i * 60));

// Brand cards
document.querySelectorAll('.brand-card').forEach((el, i) => addReveal(el, 'reveal', i * 100));

// Stats — up with stagger
document.querySelectorAll('.intro-strip__stat').forEach((el, i) => addReveal(el, 'reveal', i * 80));

// About — split left/right
addReveal(document.querySelector('.about__content'), 'reveal-left');
addReveal(document.querySelector('.about__visual'),  'reveal-right');

// Contact — split
addReveal(document.querySelector('.contact__info'), 'reveal-left');
addReveal(document.querySelector('.contact__form'), 'reveal-right', 100);

// Portfolio collab
addReveal(document.querySelector('.portfolio__collab'), 'reveal', 0);

/* ── Animated counters ──────────────────────────────────── */
function animateCount(el, target, suffix = '', duration = 1400) {
  const start     = performance.now();
  const isDecimal = String(target).includes('.');
  const from      = 0;

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = from + (target - from) * eased;
    el.textContent = (isDecimal ? value.toFixed(0) : Math.floor(value)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const raw = el.dataset.count;
    const suffix = el.dataset.suffix || '';
    animateCount(el, parseFloat(raw), suffix);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

// Map stat elements to their values
const statMappings = [
  { selector: '.intro-strip__stat:nth-child(1) .stat-number', count: '50', suffix: '+' },
  { selector: '.intro-strip__stat:nth-child(3) .stat-number', count: '25', suffix: '+' },
  { selector: '.intro-strip__stat:nth-child(5) .stat-number', count: '100', suffix: '%' },
  { selector: '.intro-strip__stat:nth-child(7) .stat-number', count: '4',   suffix: '' },
];
statMappings.forEach(({ selector, count, suffix }) => {
  const el = document.querySelector(selector);
  if (!el) return;
  el.dataset.count  = count;
  el.dataset.suffix = suffix;
  el.textContent    = '0' + suffix;
  counterObserver.observe(el);
});

/* ── Hero parallax ──────────────────────────────────────── */
const heroBgPhoto = document.querySelector('.hero__bg-photo img');
function onScroll() {
  if (heroBgPhoto) {
    const offset = window.scrollY * 0.25;
    heroBgPhoto.style.transform = `translateY(${offset}px) scale(1.05)`;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });

/* ── Project data ────────────────────────────────────────── */
const projectData = {
  'sao-lourenco': {
    title:    { pt: 'Edifício S. Lourenço Deluxe', en: 'S. Lourenço Deluxe Building' },
    location: 'Portimão',
    type:     { pt: 'Condomínio Privado', en: 'Private Condominium' },
    year:     '2019–2022',
    units:    null, /* TODO: confirmar nº de habitações */
    desc: {
      pt: 'Instalação hidráulica completa neste condomínio privado de luxo em Portimão — redes de abastecimento de água, sistema de esgotos, drenagem pluvial e sistema solar térmico para AQS. Obra realizada em colaboração com Ordem Geométrica.',
      en: 'Full hydraulic installation on this luxury private condominium in Portimão — water supply networks, sewage system, rainwater drainage and solar thermal DHW. Executed in collaboration with Ordem Geométrica.'
    },
    services: {
      pt: ['Abastecimento de Água', 'Sistema de Esgotos', 'Drenagem Pluvial', 'Solar Térmico'],
      en: ['Water Supply', 'Sewage System', 'Rainwater Drainage', 'Solar Thermal']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-25-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-26-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-27-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-29-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-23-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-33-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-2-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-4-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-10-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-5-thegem-gallery-sidebar.png',
    ]
  },
  'bellevue': {
    title:    { pt: 'Edifício Bellevue Lote 13', en: 'Bellevue Building Lot 13' },
    location: 'Praia da Rocha, Portimão',
    type:     { pt: 'Condomínio de Luxo', en: 'Luxury Condominium' },
    year:     '2018–',
    units:    33,
    desc: {
      pt: 'Infraestrutura hidráulica completa para condomínio privado de luxo em Praia da Rocha — coletores de distribuição, redes de abastecimento e sistema de drenagem pluvial completo.',
      en: 'Complete hydraulic infrastructure for a luxury private condominium in Praia da Rocha — distribution collectors, supply networks and full rainwater drainage system.'
    },
    services: {
      pt: ['Coletores Hidráulicos', 'Abastecimento de Água', 'Drenagem Pluvial', 'Sistema de Esgotos'],
      en: ['Hydraulic Collectors', 'Water Supply', 'Rainwater Drainage', 'Sewage System']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-2-3-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-5-2-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-3-4-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-4-2-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-6-2-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-19-1-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-20-1-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-22-1-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-12-1-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-10-2-thegem-gallery-sidebar.png',
    ]
  },
  'vavilon': {
    title:    { pt: 'Edifício Vavilon Residence', en: 'Vavilon Residence Building' },
    location: 'Três Bicos, Portimão',
    type:     { pt: 'Condomínio Privado', en: 'Private Condominium' },
    year:     '2019–2024',
    units:    null, /* TODO: confirmar nº de habitações */
    desc: {
      pt: 'Condomínio privado em Portimão — instalações técnicas completas incluindo ventilação, drenagem de condensados AC e sistema de bomba de calor. Obra concluída com fotos reais de 2024.',
      en: 'Private condominium in Portimão — full technical installations including ventilation, AC condensate drainage and heat pump system. Project completed with real photos from 2024.'
    },
    services: {
      pt: ['Canalização', 'Ventilação', 'Drenagem AC', 'Bomba de Calor'],
      en: ['Plumbing', 'Ventilation', 'AC Drainage', 'Heat Pump']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_9660-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_9661-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_9662-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_9663-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_7364-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_7361-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_7353-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_7352-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_7344-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_7343-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-34-2-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-35-2-thegem-gallery-sidebar.png',
    ]
  },
  'ocean-breeze': {
    title:    { pt: 'Ocean Breeze Residence', en: 'Ocean Breeze Residence' },
    location: 'Praia da Rocha, Portimão',
    type:     { pt: 'Condomínio Fechado', en: 'Closed Condominium' },
    year:     '2022',
    units:    null, /* TODO: confirmar nº de habitações */
    desc: {
      pt: 'Condomínio fechado de luxo em Praia da Rocha — instalações hidráulicas completas com piso radiante Uponor, sistema solar térmico para AQS e sistema de esgotos de alta performance.',
      en: 'Luxury closed condominium in Praia da Rocha — complete hydraulic installations with Uponor radiant floor heating, solar thermal DHW system and high-performance sewage system.'
    },
    services: {
      pt: ['Uponor Piso Radiante', 'Solar Térmico', 'Sistema de Esgotos', 'Coletores'],
      en: ['Uponor Radiant Floor', 'Solar Thermal', 'Sewage System', 'Collectors']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-43-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-50-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-48-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-44-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-47-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-51-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-41-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-42-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-46-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-45-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-40-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-49-thegem-gallery-sidebar.png',
    ]
  },
  'elite': {
    title:    { pt: 'Edifício Elite Residence', en: 'Elite Residence Building' },
    location: 'Praia da Rocha, Portimão',
    type:     { pt: 'Edifício Residencial', en: 'Residential Building' },
    year:     '2019–',
    units:    104,
    desc: {
      pt: 'Edifício residencial em Praia da Rocha — especificação técnica completa de canalização, coletores hidráulicos Uponor e sistemas de bomba de calor Bosch para AQS.',
      en: 'Residential building in Praia da Rocha — full technical plumbing specification, Uponor hydraulic collectors and Bosch heat pump systems for DHW.'
    },
    services: {
      pt: ['Coletores Hidráulicos', 'Bosch AQS', 'Abastecimento de Água', 'Esgotos'],
      en: ['Hydraulic Collectors', 'Bosch DHW', 'Water Supply', 'Sewage']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-7-2-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-1-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-5-1-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-2-2-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-3-3-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-4-1-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-9-1-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-6-1-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-8-1-thegem-gallery-sidebar.png',
    ]
  },
  'casa-alvor': {
    title:    { pt: 'Residência Privada', en: 'Private Residence' },
    location: 'Alvor, Algarve',
    type:     { pt: 'Habitação Unifamiliar', en: 'Single Family Home' },
    year:     '2020',
    units:    null,
    desc: {
      pt: 'Moradia privada em Alvor — instalação hidráulica completa com aproveitamento pluvial, reutilização de águas cinzentas e sistema solar térmico para AQS.',
      en: 'Private house in Alvor — full hydraulic installation including rainwater harvesting, grey water recycling and solar thermal DHW system.'
    },
    services: {
      pt: ['Aproveitamento Pluvial', 'Solar Térmico', 'Canalização', 'Esgotos'],
      en: ['Rainwater Harvesting', 'Solar Thermal', 'Plumbing', 'Sewage']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2020/01/Casa-10-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2020/01/Casa-11-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2020/01/Casa-12-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2020/01/Casa-13-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2020/01/Casa-14-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2020/01/Casa-15-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2020/01/Casa-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2020/01/Casa-1-thegem-gallery-sidebar.jpg',
    ]
  },
  'albufeira-garden': {
    title:    { pt: 'Albufeira Garden', en: 'Albufeira Garden' },
    location: 'Albufeira',
    type:     { pt: 'Nova Construção', en: 'New Development' },
    year:     '2024–2025',
    units:    76,
    desc: {
      pt: 'Empreendimento de nova construção em Albufeira pelo Grupo Libertas — 76 apartamentos com instalações hidráulicas completas, sistemas de bomba de calor aerotérmica Bosch para AQS e solar térmico.',
      en: 'New construction development in Albufeira by Grupo Libertas — 76 apartments with full hydraulic installations, Bosch aerothermal heat pump DHW systems and solar thermal.'
    },
    services: {
      pt: ['Abastecimento de Água', 'Sistema de Esgotos', 'Bosch Bomba de Calor', 'Solar Térmico', 'Coletores Hidráulicos'],
      en: ['Water Supply', 'Sewage System', 'Bosch Heat Pump', 'Solar Thermal', 'Hydraulic Collectors']
    },
    creditTitle:   { pt: 'Promotor', en: 'Developer' },
    creditCompany: 'Grupo Libertas',
    photos: [
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-0000111e086c.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-0000111e0866.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-0000111e0868.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-0000111e086a.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-0000111e086e.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-0000111e086f.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-0000111e0871.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-0000111e0874.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-0000111e0876.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-0000111e0878.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-0000111e087a.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-0000111e087c.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-00001145cfe9.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-000011207e0d.jpg',
      'https://images.egorealestate.com/Z1280x1024/S5/C332/P23672660/Tphoto/ID54376901-0000-0500-0000-000011207e11.jpg',
    ]
  },
  'fojo-47': {
    title:    { pt: 'Fojo Lote 47', en: 'Fojo Lot 47' },
    location: 'Portimão',
    type:     { pt: 'Edifício Residencial', en: 'Residential Building' },
    year:     '2022–2024',
    units:    38,
    desc: {
      pt: 'Edifício residencial de 38 habitações em Portimão — instalações hidráulicas completas e solar térmico. Obra realizada em colaboração com Ordem Geométrica.',
      en: '38-unit residential building in Portimão — full hydraulic installations and solar thermal. In collaboration with Ordem Geométrica.'
    },
    services: {
      pt: ['Canalização', 'Solar Térmico', 'Sistema de Esgotos', 'Drenagem Pluvial'],
      en: ['Plumbing', 'Solar Thermal', 'Sewage System', 'Rainwater Drainage']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/image-0023-thegem-gallery-sidebar.jpeg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/image-0011-thegem-gallery-sidebar.jpeg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/image-0003-thegem-gallery-sidebar.jpeg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/image-0024-thegem-gallery-sidebar.jpeg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/image-0007-thegem-gallery-sidebar.jpeg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/image-0015-thegem-gallery-sidebar.jpeg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/image-0017-thegem-gallery-sidebar.jpeg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/image-0020-thegem-gallery-sidebar.jpeg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/image-0022-thegem-gallery-sidebar.jpeg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/image-0014-thegem-gallery-sidebar.jpeg',
    ]
  },
  'urbigal': {
    title:    { pt: 'Edifício Urbigal', en: 'Urbigal Building' },
    location: 'Praia da Rocha, Portimão',
    type:     { pt: 'Edifício Residencial', en: 'Residential Building' },
    year:     '2022–',
    units:    45,
    desc: {
      pt: 'Edifício residencial de 45 habitações em Praia da Rocha — sistemas hidráulicos completos e bomba de calor. Em colaboração com Ordem Geométrica.',
      en: '45-unit residential building in Praia da Rocha — full hydraulic systems and heat pump. In collaboration with Ordem Geométrica.'
    },
    services: {
      pt: ['Canalização', 'Bomba de Calor', 'Solar Térmico', 'Coletores Hidráulicos'],
      en: ['Plumbing', 'Heat Pump', 'Solar Thermal', 'Hydraulic Collectors']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-32-1-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-32-2-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/11/Design-sem-nome-33-1-thegem-gallery-sidebar.png',
    ]
  },
  'iate-residence': {
    title:    { pt: 'Edifício Iate Residence', en: 'Iate Residence Building' },
    location: 'Praia da Rocha, Portimão',
    type:     { pt: 'Edifício Residencial', en: 'Residential Building' },
    year:     '2022–2023',
    units:    27,
    desc: {
      pt: 'Edifício residencial de 27 habitações em Praia da Rocha — instalação hidráulica completa e coletores hidráulicos. Em colaboração com Ordem Geométrica.',
      en: '27-unit residential building in Praia da Rocha — full hydraulic installation and hydraulic collectors. In collaboration with Ordem Geométrica.'
    },
    services: {
      pt: ['Canalização', 'Coletores Hidráulicos', 'Sistema de Esgotos', 'Solar Térmico'],
      en: ['Plumbing', 'Hydraulic Collectors', 'Sewage System', 'Solar Thermal']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2023/02/Fotos-orgem-geometrica-marca-de-agua-7-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2023/02/Fotos-orgem-geometrica-marca-de-agua-57-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2023/02/Fotos-orgem-geometrica-marca-de-agua-56-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2023/02/Fotos-orgem-geometrica-marca-de-agua-8-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2023/02/Fotos-orgem-geometrica-marca-de-agua-9-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2023/02/Fotos-orgem-geometrica-marca-de-agua-10-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2023/02/Fotos-orgem-geometrica-marca-de-agua-11-thegem-gallery-sidebar.png',
      'https://ordemgeometrica.pt/wp-content/uploads/2023/02/Fotos-orgem-geometrica-marca-de-agua-12-thegem-gallery-sidebar.png',
    ]
  },
  'sesmarias': {
    title:    { pt: 'Sesmarias', en: 'Sesmarias' },
    location: 'Portimão',
    type:     { pt: 'Condomínio Privado', en: 'Private Condominium' },
    year:     '2023–',
    units:    15,
    desc: {
      pt: 'Condomínio residencial de 15 habitações com piscina em Portimão — instalações hidráulicas e solar térmico. Em colaboração com Ordem Geométrica.',
      en: '15-unit residential condominium with pool in Portimão — hydraulic installations and solar thermal. In collaboration with Ordem Geométrica.'
    },
    services: {
      pt: ['Canalização', 'Solar Térmico', 'Sistema de Esgotos', 'Drenagem Pluvial'],
      en: ['Plumbing', 'Solar Thermal', 'Sewage System', 'Rainwater Drainage']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2022/10/Lote5_Sesmarias_entrada-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/10/Lote5_Sesmarias_piscina_a-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/10/Lote5_Sesmarias_piscina_c-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/10/Lote5_Sesmarias_piscina_b-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_0206-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_0203-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_0201-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_0195-scaled-thegem-gallery-sidebar.jpg',
    ]
  },
  'garden-city': {
    title:    { pt: 'Garden City 16/17', en: 'Garden City 16/17' },
    location: 'Portimão',
    type:     { pt: 'Edifício Residencial', en: 'Residential Building' },
    year:     '2023–',
    units:    38,
    desc: {
      pt: 'Edifício residencial de 38 habitações em Portimão — instalações hidráulicas completas e bomba de calor. Em colaboração com Ordem Geométrica.',
      en: '38-unit residential building in Portimão — full hydraulic installations and heat pump. In collaboration with Ordem Geométrica.'
    },
    services: {
      pt: ['Canalização', 'Bomba de Calor', 'Sistema de Esgotos', 'Coletores Hidráulicos'],
      en: ['Plumbing', 'Heat Pump', 'Sewage System', 'Hydraulic Collectors']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/6085a96a-d24f-427f-b2b5-716248eeb4f5-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/9bb023dc-aec6-4991-9960-10a6be4c44bc-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/48707f76-cef6-47ab-950f-0dcccbbc5ed3-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/4d8e2861-8489-4326-aecd-455061026ef5-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/67C68898-A9BD-4177-B71C-E00757568748-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/12/83c8e1a0-6f26-45b4-b716-14e7e1948e30-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/DJI_20240517_115022_336-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/DJI_20240517_120030_786-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_0637-scaled-thegem-gallery-sidebar.jpg',
    ]
  },
  'lote-7-8': {
    title:    { pt: 'Lote 7/8', en: 'Lot 7/8' },
    location: 'Portimão',
    type:     { pt: 'Edifício Residencial', en: 'Residential Building' },
    year:     '2022–',
    units:    36,
    desc: {
      pt: 'Edifício residencial de 36 habitações em Portimão — sistemas hidráulicos e coletores. Em colaboração com Ordem Geométrica.',
      en: '36-unit residential building in Portimão — hydraulic systems and collectors. In collaboration with Ordem Geométrica.'
    },
    services: {
      pt: ['Canalização', 'Coletores Hidráulicos', 'Sistema de Esgotos', 'Solar Térmico'],
      en: ['Plumbing', 'Hydraulic Collectors', 'Sewage System', 'Solar Thermal']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2022/09/IMG_6614-scaled-thegem-product-justified-square-m.jpg',
    ]
  },
  'alvor-ria-residence': {
    title:    { pt: 'Alvor Ria Residence', en: 'Alvor Ria Residence' },
    location: 'Alvor, Algarve',
    type:     { pt: 'Empreendimento Residencial', en: 'Residential Development' },
    year:     '2022–',
    units:    30,
    desc: {
      pt: 'Empreendimento residencial de 30 apartamentos frente à Ria de Alvor — instalações hidráulicas completas e solar térmico. Em colaboração com Ordem Geométrica.',
      en: '30-apartment residential development facing the Ria de Alvor — full hydraulic installations and solar thermal. In collaboration with Ordem Geométrica.'
    },
    services: {
      pt: ['Canalização', 'Solar Térmico', 'Bomba de Calor', 'Sistema de Esgotos'],
      en: ['Plumbing', 'Solar Thermal', 'Heat Pump', 'Sewage System']
    },
    photos: [
      'https://ordemgeometrica.pt/wp-content/uploads/2022/10/photo-output-3-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/10/IMG-7948-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2022/10/IMG-8315-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_0536-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_0535-scaled-thegem-gallery-sidebar.jpg',
      'https://ordemgeometrica.pt/wp-content/uploads/2024/06/IMG_0532-scaled-thegem-gallery-sidebar.jpg',
    ]
  },
  'emohb-moradia-1': {
    title:    { pt: 'Moradia emohb I', en: 'emohb Villa I' },
    location: 'Portimão',
    type:     { pt: '3 Moradias', en: '3 Villas' },
    year:     '2024',
    units:    3,
    desc: {
      pt: 'Conjunto de 3 moradias modernas em Portimão — instalação hidráulica completa, bomba de calor aerotérmica para AQS, chão radiante Uponor e painéis solares térmicos. Em colaboração com emohb.',
      en: 'Group of 3 modern villas in Portimão — full hydraulic installation, aerothermal heat pump for DHW, Uponor radiant floor heating and solar thermal panels. In collaboration with emohb.'
    },
    services: {
      pt: ['Canalização', 'Bomba de Calor', 'Chão Radiante', 'Solar Térmico', 'Sistema de Esgotos'],
      en: ['Plumbing', 'Heat Pump', 'Radiant Floor', 'Solar Thermal', 'Sewage System']
    },
    creditTitle:   { pt: 'Construção', en: 'Construction' },
    creditCompany: 'emohb',
    photos: [
      'assets/portfolio/emohb-m1-img_3376.jpg',
      'assets/portfolio/emohb-m1-img_3377.jpg',
      'assets/portfolio/emohb-m1-img_3378.jpg',
      'assets/portfolio/emohb-m1-img_3379.jpg',
      'assets/portfolio/emohb-m1-img_3380.jpg',
      'assets/portfolio/emohb-m1-img_3381.jpg',
      'assets/portfolio/emohb-m1-img_3382.jpg',
      'assets/portfolio/emohb-m1-img_3383.jpg',
      'assets/portfolio/emohb-m1-img_3385.jpg',
    ]
  },
  'emohb-moradia-2': {
    title:    { pt: 'Moradia emohb II', en: 'emohb Villa II' },
    location: 'Portimão',
    type:     { pt: '3 Moradias', en: '3 Villas' },
    year:     '2024',
    units:    3,
    desc: {
      pt: 'Conjunto de 3 moradias modernas em Portimão — instalação hidráulica completa, bomba de calor aerotérmica para AQS, chão radiante Uponor e painéis solares térmicos. Em colaboração com emohb.',
      en: 'Group of 3 modern villas in Portimão — full hydraulic installation, aerothermal heat pump for DHW, Uponor radiant floor heating and solar thermal panels. In collaboration with emohb.'
    },
    services: {
      pt: ['Canalização', 'Bomba de Calor', 'Chão Radiante', 'Solar Térmico', 'Sistema de Esgotos'],
      en: ['Plumbing', 'Heat Pump', 'Radiant Floor', 'Solar Thermal', 'Sewage System']
    },
    creditTitle:   { pt: 'Construção', en: 'Construction' },
    creditCompany: 'emohb',
    photos: [
      'assets/portfolio/emohb-m2-img_3370.jpg',
      'assets/portfolio/emohb-m2-img_3367.jpg',
      'assets/portfolio/emohb-m2-img_3368.jpg',
      'assets/portfolio/emohb-m2-img_3369.jpg',
      'assets/portfolio/emohb-m2-img_3372.jpg',
      'assets/portfolio/emohb-m2-img_3373.jpg',
      'assets/portfolio/emohb-m2-img_3374.jpg',
      'assets/portfolio/emohb-m2-img_3375.jpg',
    ]
  }
};

/* ── Units badges ─────────────────────────────────────────── */
function renderUnitsBadges() {
  const label = translations[currentLang]['units.label'];
  document.querySelectorAll('.portfolio-card[data-project]').forEach(card => {
    const proj = projectData[card.dataset.project];
    if (!proj || !proj.units) return;
    let badge = card.querySelector('.portfolio-card__units');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'portfolio-card__units';
      const h3 = card.querySelector('.portfolio-card__info h3');
      if (h3) h3.after(badge);
    }
    badge.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M15 8h1M15 12h1M15 16h1M4 21V7l8-4 8 4v14"/></svg><strong>${proj.units}</strong> ${label}`;
  });
}

/* ── Portfolio filter ─────────────────────────────────────── */
const filterBtns     = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');
    portfolioCards.forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.location !== filter);
    });
  });
});

/* ── Lightbox ────────────────────────────────────────────── */
const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxTitle  = document.getElementById('lightboxTitle');
const lightboxType   = document.getElementById('lightboxType');
const lightboxDesc   = document.getElementById('lightboxDesc');
const lightboxSvcs   = document.getElementById('lightboxServices');
const lightboxThumbs = document.getElementById('lightboxThumbs');
const lightboxCount  = document.getElementById('lightboxCounter');
const lightboxSpinner= document.getElementById('lightboxSpinner');
const lightboxCreditTitle = document.getElementById('lightboxCreditTitle');
const lightboxCreditHydro = document.getElementById('lightboxCreditHydro');

let lbPhotos  = [];
let lbIndex   = 0;
let lbProject = null;

function lbOpen(projectKey, startIndex = 0) {
  const proj = projectData[projectKey];
  if (!proj) return;
  lbProject = proj;
  lbPhotos  = proj.photos;
  lbIndex   = startIndex;

  const lang = currentLang;
  lightboxTitle.textContent = proj.title[lang];
  lightboxType.textContent  = proj.type[lang];
  lightboxDesc.textContent  = proj.desc[lang];

  // Units badge
  const unitsEl = document.getElementById('lightboxUnits');
  if (unitsEl) {
    if (proj.units) {
      const unitsLabel = lang === 'pt' ? 'habitações' : 'units';
      unitsEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M15 8h1M15 12h1M15 16h1M4 21V7l8-4 8 4v14"/></svg><strong>${proj.units}</strong> ${unitsLabel}`;
      unitsEl.style.display = '';
    } else {
      unitsEl.style.display = 'none';
    }
  }

  // Services tags
  lightboxSvcs.innerHTML = proj.services[lang].map(s => `<span>${s}</span>`).join('');

  // Credit labels
  const creditLabel = proj.creditTitle ? proj.creditTitle[lang] : (lang === 'pt' ? 'Construção' : 'Construction');
  const creditName  = proj.creditCompany || 'Ordem Geométrica';
  lightboxCreditTitle.textContent = creditLabel;
  lightboxCreditTitle.nextElementSibling.textContent = creditName;
  lightboxCreditHydro.textContent = lang === 'pt' ? 'Inst. Hidráulicas' : 'Hydraulics';

  // Thumbnails
  lightboxThumbs.innerHTML = '';
  lbPhotos.forEach((url, i) => {
    const btn = document.createElement('button');
    btn.className = 'lightbox__thumb' + (i === lbIndex ? ' active' : '');
    btn.innerHTML = `<img src="${url}" alt="" loading="lazy" />`;
    btn.addEventListener('click', () => lbGoto(i));
    lightboxThumbs.appendChild(btn);
  });

  lbShowPhoto(lbIndex);
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function lbClose() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function lbShowPhoto(index) {
  lbIndex = index;
  const url = lbPhotos[index];

  lightboxSpinner.classList.add('active');
  lightboxImg.classList.add('loading');

  const tmp = new Image();
  tmp.onload = () => {
    lightboxImg.src = url;
    lightboxImg.classList.remove('loading');
    lightboxSpinner.classList.remove('active');
  };
  tmp.src = url;

  // Counter
  lightboxCount.textContent = `${index + 1} / ${lbPhotos.length}`;

  // Update thumbs
  lightboxThumbs.querySelectorAll('.lightbox__thumb').forEach((th, i) => {
    th.classList.toggle('active', i === index);
    if (i === index) th.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
}

function lbGoto(index) {
  lbShowPhoto((index + lbPhotos.length) % lbPhotos.length);
}

document.getElementById('lightboxClose').addEventListener('click', lbClose);
document.getElementById('lightboxBackdrop').addEventListener('click', lbClose);
document.getElementById('lightboxPrev').addEventListener('click', () => lbGoto(lbIndex - 1));
document.getElementById('lightboxNext').addEventListener('click', () => lbGoto(lbIndex + 1));

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape')      lbClose();
  if (e.key === 'ArrowRight')  lbGoto(lbIndex + 1);
  if (e.key === 'ArrowLeft')   lbGoto(lbIndex - 1);
});

// Open lightbox from portfolio cards
document.querySelectorAll('.portfolio-card[data-project]').forEach(card => {
  card.querySelector('.portfolio-card__img').addEventListener('click', () => {
    lbOpen(card.dataset.project, 0);
  });
  const galleryBtn = card.querySelector('.portfolio-card__gallery-btn');
  if (galleryBtn) galleryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    lbOpen(card.dataset.project, 0);
  });
});

// Touch swipe support
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) lbGoto(dx < 0 ? lbIndex + 1 : lbIndex - 1);
}, { passive: true });

/* ── Contact form ─────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let valid = true;
  contactForm.querySelectorAll('[required]').forEach(field => {
    if (!field.value.trim()) {
      valid = false;
      field.style.borderColor = '#ef4444';
      field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
    }
  });
  if (!valid) return;

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  submitBtn.textContent = translations[currentLang]['form.sending'];
  submitBtn.disabled = true;

  setTimeout(() => {
    contactForm.innerHTML = `
      <div class="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3 style="font-family:var(--font-head);font-size:1.25rem;font-weight:700;color:var(--grey-900);">
        ${translations[currentLang]['success.title']}
      </h3>
      <p style="font-size:.9rem;color:var(--grey-500);max-width:320px;line-height:1.65;">
        ${translations[currentLang]['success.desc']}
      </p>
    `;
    contactForm.classList.add('submitted');
  }, 1200);
});

/* ── Smooth scroll offset for fixed header ─────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = document.getElementById('header').offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Magnetic CTA buttons ───────────────────────────────── */
document.querySelectorAll('.btn--primary, .btn--ghost').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px) translateY(-2px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ── Service card galleries ─────────────────────────────── */
function initServiceGalleries() {
  document.querySelectorAll('.service-card__gallery').forEach(gallery => {
    const slides = gallery.querySelector('.service-card__slides');
    const dotsContainer = gallery.querySelector('.svc-gallery-dots');
    const prevBtn = gallery.querySelector('.svc-gallery-prev');
    const nextBtn = gallery.querySelector('.svc-gallery-next');
    const imgs = slides.querySelectorAll('img');
    const total = imgs.length;

    if (total <= 1) {
      gallery.querySelector('.service-card__gallery-nav').style.display = 'none';
      return;
    }

    let current = 0;

    // Build dots
    imgs.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'svc-gallery-dot' + (i === 0 ? ' is-active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    function goTo(index) {
      current = (index + total) % total;
      slides.style.transform = `translateX(-${current * 100}%)`;
      dotsContainer.querySelectorAll('.svc-gallery-dot').forEach((d, i) => {
        d.classList.toggle('is-active', i === current);
      });
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Touch swipe
    let tx = 0;
    gallery.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    gallery.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });
  });
}

/* ── Init ────────────────────────────────────────────────── */
setLanguage('pt');
initServiceGalleries();
// Run slider positioning after fonts/layout settle
requestAnimationFrame(() => setTimeout(updateLangSlider, 60));
window.addEventListener('resize', updateLangSlider);
