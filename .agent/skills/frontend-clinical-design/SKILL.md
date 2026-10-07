---
name: frontend-clinical-design
description: Especialista em design de interfaces clínicas e odontológicas, com foco em ergonomia médica, acessibilidade (WCAG AA/AAA), odontograma interativo e visualização de agenda médica.
---

# Frontend Clinical & Dental Design Skill

Use esta skill sempre que estiver projetando, prototipando ou codificando telas para o sistema odontológico.

## 1. Ergonomia e Acessibilidade Clínica
- **Ambiente de Uso:** Dentistas e auxiliares utilizam o sistema frequentemente com luvas, monitores a distâncias variadas e sob iluminação de consultório.
- **Áreas de Toque/Clique:** Botões e alvos de clique devem ter altura mínima de 44px (`min-h-[44px]` / `touch-target`).
- **Contraste & Cores:**
  - Seguir estritamente WCAG AA (mínimo de 4.5:1 para texto normal e 3:1 para elementos de interface/gráficos).
  - Nunca utilizar cor como único indicador de status (ex: para agendamento "CANCELADO", combine a cor vermelha/âmbar com ícone identificador e texto legível).
  - Evitar paletas supersaturadas; priorizar paleta médica sóbria (tons neutros Slate/Zinc com acentos em Teal/Emerald clínico ou Navy suave).

## 2. Odontograma Visual Interativo (FDI World Dental Federation)
O odontograma deve seguir o padrão internacional de dois dígitos (FDI):

### 2.1 Quadrantes e Numeração
- **Arcada Permanente (32 dentes):**
  - **Quadrante 1 (Superior Direito do Paciente):** 18, 17, 16, 15, 14, 13, 12, 11
  - **Quadrante 2 (Superior Esquerdo do Paciente):** 21, 22, 23, 24, 25, 26, 27, 28
  - **Quadrante 4 (Inferior Direito do Paciente):** 48, 47, 46, 45, 44, 43, 42, 41
  - **Quadrante 3 (Inferior Esquerdo do Paciente):** 31, 32, 33, 34, 35, 36, 37, 38
- **Arcada Decídua / Infantil (20 dentes - suporte opcional/chaveável):**
  - Quadrantes 5 (55-51), 6 (61-65), 8 (85-81), 7 (71-75).

### 2.2 Faces Anatômicas do Dente (Componente SVG)
Cada dente deve ser renderizado como uma composição poligonal SVG interativa com 5 faces clicáveis:
1. **Vestibular (V):** Face voltada para os lábios/bochechas (polígono superior ou inferior dependendo da arcada).
2. **Lingual / Palatina (L / P):** Face voltada para a língua/palato.
3. **Mesial (M):** Face voltada para a linha média da arcada.
4. **Distal (D):** Face oposta à linha média.
5. **Oclusal / Incisal (O / I):** Centro do dente (face mastigatória ou bordo cortante).

### 2.3 Estados Visuais Padronizados
- **Hígido / Sadio:** Fundo neutro/branco (#FFFFFF ou #F8FAFC) com contorno cinza (#CBD5E1).
- **Cárie Ativa:** Vermelho clínico (#EF4444) translúcido com borda destacada.
- **Restauração Realizada:** Azul médico (#3B82F6) sólido ou preenchido.
- **Tratamento de Canal (Endodontia):** Dourado/Âmbar (#F59E0B) com ícone vertical central no dente.
- **Dente Ausente / Extraído:** Fundo atenuado com cruz diagonal (X) cinza escuro (#64748B).
- **Implante / Prótese:** Verde esmeralda (#10B981) ou ícone de coroa protética.

## 3. Calendário e Grade de Atendimento
- **Visão Multi-Dentista:** Capacidade de alternar entre visão diária (colunas simultâneas por dentista) e visão semanal/mensal.
- **Detecção Visual de Conflitos:** Sinalização imediata de sobreposição de horários e alertas em tempo real.
- **Slots Configuráveis:** Grade temporal em blocos de 15, 30 ou 60 minutos (padrão 30 min conforme regra PL/SQL).
- **Card de Agendamento:** Deve exibir de forma compacta e legível:
  - Horário de início e término.
  - Nome do paciente e telefone de contato formatado.
  - Procedimento previsto.
  - Badge visual de status: `AGENDADO` (Azul/Cinza), `CONFIRMADO` (Verde), `CANCELADO` (Vermelho/Cinza tachado), `REALIZADO` (Índigo).
