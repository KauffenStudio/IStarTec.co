# Como Recolher Testemunhos Reais para o Site iStarTec

**Quem isto é para:** Augustin / equipa interna iStarTec.
**Quando ler:** quando quiseres ativar a secção "Testemunhos" do site.

---

## Porquê isto importa

A secção `<section class="testimonials">` na home e nas 4 páginas-cidade está **construída tecnicamente mas escondida** (`hidden`). Está à espera de testemunhos reais.

Testemunhos reais valem mais que dezenas de artigos de blog para conversão B2B em construção. Mas **falsos são ilegais** (Decreto-Lei 84/2021 PT — coimas até €5.000 cada) e **proibidos pela Google** (manual action + perda de rich snippets).

---

## Quem contactar (priorizado)

| # | Contacto | Empresa | Projeto-âncora | Esforço |
|---|---|---|---|---|
| 1 | Responsável de obra | Ordem Geométrica | Bellevue Lote 13 ou Elite Residence | Baixo (parceria forte) |
| 2 | Gestor de empreendimento | Grupo Libertas | Albufeira Garden (76 apartamentos) | Médio (relação institucional) |
| 3 | Direção | emohb | Moradias Portimão (chão radiante Uponor) | Baixo |
| 4 | Direção | Tacu Bacaliuc | Parceria de longa data | Baixo |
| 5–7 | Arquitetos com quem coordenaram em obra | (vários) | Vários | Médio |
| 8+ | Clientes particulares de moradias | (vários) | Moradias específicas | Alto (RGPD, privacidade) |

**Meta inicial:** **3 testemunhos reais** dos top 4. Suficiente para ativar a secção da home.

---

## Email template em PT

Curto, casual, sem soar a marketing — em linha com a memória `feedback_email_tone.md` (cold outreach casual humano).

```
Assunto: 30 segundos para uma pequena ajuda

Olá [Nome],

Estamos a atualizar o site da iStarTec e ia ficar mesmo bem ter
uma pequena frase tua sobre a obra do [PROJETO ESPECÍFICO].

Seria 1-2 frases curtas, sobre o que correu bem — a coordenação,
o trabalho técnico, prazos, o que quiseres destacar. Coisa de
30 segundos a escrever.

Posso usar com o teu nome e empresa, ou anónimo, como preferires.

Obrigado pela paciência!
Augustin · iStarTec
+351 965 445 801
```

**Sub-variações úteis:**

- Para parceiro mais formal (Libertas): manter mas trocar "Olá" por "Boa tarde [Nome]".
- Para cliente particular: substituir "obra do [projeto]" por "instalação que fizemos na sua moradia em [cidade]".
- Para arquiteto: enfatizar coordenação técnica — "sobre como correu a coordenação técnica em fase de execução do projeto X".

---

## Quando receberes a resposta

### Passo 1 — Guardar prova
Guarda o email original (ou screenshot do whatsapp) numa pasta `/Users/augustinagapii/Desktop/IStarTec/_proof/` — não publicar, mas manter caso a Google peça verificação.

### Passo 2 — Preparar o HTML
Edita o ficheiro relevante:
- **Home:** `index.html` — procurar `<section id="testimonials"` (~linha 1090)
- **Cidade:** `[cidade]/index.html` — procurar `<section id="testimonials"`

Dentro de `.testimonials__grid`, adicionar o card real:

```html
<article class="testimonial-card">
  <p class="testimonial-card__quote">FRASE LITERAL DO EMAIL OU WHATSAPP — não editar.</p>
  <div class="testimonial-card__author">
    <div class="testimonial-card__avatar">JS</div>
    <div>
      <span class="testimonial-card__name">João Silva</span>
      <span class="testimonial-card__role">Diretor de Obra · Ordem Geométrica</span>
    </div>
  </div>
</article>
```

As iniciais do avatar (`JS` no exemplo) são as do nome real do autor.

### Passo 3 — Ativar a secção
Remover o atributo `hidden` da `<section class="testimonials">`:

```diff
- <section id="testimonials" class="testimonials section" hidden data-testimonials="empty">
+ <section id="testimonials" class="testimonials section">
```

### Passo 4 — Adicionar JSON-LD `Review`
Antes do `</head>` da mesma página, adicionar bloco `<script type="application/ld+json">` usando o template em [`docs/testimonial-schema-template.json`](./testimonial-schema-template.json). Substituir todos os placeholders (NOME_REAL, etc.) pelos valores verificados.

### Passo 5 — Testar antes de fazer push
1. `python3 -m http.server 8765` em `/Users/augustinagapii/Desktop/IStarTec/`
2. Abrir `http://localhost:8765/` e confirmar que a secção testimonials agora aparece com o card real.
3. Validar JSON-LD: `python3 -c "import json, re; [json.loads(b) for b in re.findall(r'<script type=\"application/ld\+json\">\s*(.*?)\s*</script>', open('index.html').read(), re.DOTALL)]"`. Sem erros = OK.
4. Após push e deploy: testar o URL no [Rich Results Test do Google](https://search.google.com/test/rich-results) — confirmar que `Review` é detetado.

### Passo 6 — Pedir indexação no GSC
URL Inspection no Google Search Console → solicitar reindexação do URL com testemunho novo.

---

## ⚠️ Regras que NÃO se quebram

1. **Nunca** escrever ou pedir a alguém para escrever uma versão "editada" do testemunho. Texto literal. Se a frase tem "blé", fica "blé".
2. **Nunca** preencher campos com "Cliente satisfeito" / "Construtora X" / iniciais sem nome. Ou tens nome real ou não publicas.
3. **Nunca** adicionar `reviewRating` (estrelas) sem que o autor tenha explicitamente dado um número. Sem GBP, sem rating numérico. Visualmente fica sem estrelas — está bem.
4. **Nunca** adicionar `aggregateRating` ao Schema do `Plumber` enquanto não tiveres uma fonte verificável (Google Business Profile + Trustpilot + outra plataforma com URL público).
5. **Sempre** pedir consentimento expresso para publicar com nome+empresa. Em alternativa (raro), pedir consentimento para publicar como "Diretor de Obra · Empresa Construção XYZ no Algarve" sem nome individual — mas a empresa tem de estar identificada.
6. **Guardar a prova** (email/whatsapp) sempre.

---

## Onde está o template Schema

[`./testimonial-schema-template.json`](./testimonial-schema-template.json) — copia e adapta.

## Próxima ação concreta sugerida

Hoje ou amanhã: enviar 3 emails (Ordem Geométrica, Libertas, emohb) usando o template acima. Resposta típica esperada em 1-2 semanas.
