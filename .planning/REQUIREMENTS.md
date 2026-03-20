# Requirements: Jetwash24

**Defined:** 2026-03-20
**Core Value:** O cliente consegue marcar uma lavagem online em menos de 2 minutos, ver horários disponíveis em tempo real, e receber confirmação imediata — sem necessidade de telefonema.

## v1 Requirements

### Booking (BOOK)

- [ ] **BOOK-01**: Cliente pode selecionar um serviço e extras opcionais num fluxo multi-step
- [ ] **BOOK-02**: Cliente vê resumo de preço (serviço + extras + tipo de veículo) antes de confirmar
- [ ] **BOOK-03**: Cliente pode ver slots de tempo disponíveis em tempo real para a data escolhida
- [ ] **BOOK-04**: Sistema bloqueia automaticamente slots indisponíveis (1 carro por vez + 15min buffer)
- [ ] **BOOK-05**: Cliente preenche nome, email, telefone e tipo de veículo para completar reserva
- [ ] **BOOK-06**: Cliente aceita consentimento GDPR para poder submeter a reserva
- [ ] **BOOK-07**: Cliente recebe email de confirmação automático após reserva confirmada

### Services (SERV)

- [ ] **SERV-01**: Utilizador pode ver catálogo completo de serviços com descrições, preços e duração estimada
- [ ] **SERV-02**: Preços variam automaticamente por tipo de veículo (citadino, berlina, SUV, carrinha)
- [ ] **SERV-03**: Extras opcionais (limpeza profunda de estofos, remoção de pelos, vidros interiores, ozonização) são selecionáveis na reserva de serviços interiores
- [ ] **SERV-04**: Pacotes são apresentados com a poupança em relação aos serviços individuais

### Notifications (NOTF)

- [ ] **NOTF-01**: Negócio recebe email de notificação para cada nova reserva com todos os detalhes (cliente, serviço, data/hora, veículo)
- [ ] **NOTF-02**: Email de notificação ao negócio inclui link assinado e seguro para cancelar a reserva, libertando o slot automaticamente

### Content (CONT)

- [ ] **CONT-01**: Página inicial com hero section, visão geral dos serviços e chamada à ação para reservar
- [ ] **CONT-02**: Secção de contacto com telefone, email, morada, link para Google Maps e Instagram
- [x] **CONT-03**: Todo o conteúdo do site disponível em Português (principal) e Inglês (alternativa)

### Design (DSGN)

- [x] **DSGN-01**: Logo personalizado criado de raiz para a marca Jetwash24
- [x] **DSGN-02**: Design system com esquema de cores azul escuro + branco + ciano, estilo profissional e dinâmico
- [ ] **DSGN-03**: Website totalmente responsivo em dispositivos mobile e desktop
- [ ] **DSGN-04**: Placeholders visuais para fotografias de serviços (a substituir quando o cliente fornecer fotos reais)

### Technical (TECH)

- [x] **TECH-01**: Motor de slots previne double-booking com verificação atómica a nível de base de dados (sem race conditions)
- [ ] **TECH-02**: Entregabilidade de email garantida com SPF/DKIM/DMARC configurados num domínio próprio

## v2 Requirements

### Admin

- **ADMN-01**: Painel de administração para visualizar e gerir reservas do dia
- **ADMN-02**: Capacidade de bloquear slots manualmente (férias, manutenção)

### Engagement

- **ENGM-01**: Secção de avaliações/reviews de clientes
- **ENGM-02**: SMS de lembrete 24h antes da reserva (reduz no-shows ~30%)
- **ENGM-03**: Histórico de reservas para clientes recorrentes

### Payments

- **PAYM-01**: Pagamento online opcional via MB Way ou cartão

## Out of Scope

| Feature | Reason |
|---------|--------|
| Pagamento online | Pagamento presencial — simplifica v1 e elimina complexidade PCI |
| Painel de administração | Email é suficiente para volume de um negócio novo |
| App mobile nativa | Web-first; browser móvel responsivo cobre o caso de uso |
| Sistema de reviews | Fase posterior após validar produto com clientes reais |
| Contas de cliente/login | Não necessário para reservas simples sem histórico |
| Múltiplos carros simultâneos | Operação de 1 carro por vez confirmada pelo proprietário |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BOOK-01 | Phase 4 | Pending |
| BOOK-02 | Phase 4 | Pending |
| BOOK-03 | Phase 2 | Pending |
| BOOK-04 | Phase 2 | Pending |
| BOOK-05 | Phase 4 | Pending |
| BOOK-06 | Phase 4 | Pending |
| BOOK-07 | Phase 5 | Pending |
| SERV-01 | Phase 3 | Pending |
| SERV-02 | Phase 3 | Pending |
| SERV-03 | Phase 3 | Pending |
| SERV-04 | Phase 3 | Pending |
| NOTF-01 | Phase 5 | Pending |
| NOTF-02 | Phase 5 | Pending |
| CONT-01 | Phase 3 | Pending |
| CONT-02 | Phase 3 | Pending |
| CONT-03 | Phase 1 | Complete |
| DSGN-01 | Phase 1 | Complete |
| DSGN-02 | Phase 1 | Complete |
| DSGN-03 | Phase 4 | Pending |
| DSGN-04 | Phase 3 | Pending |
| TECH-01 | Phase 1 | Complete |
| TECH-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-20 after roadmap creation — all 22 requirements mapped*
