# Análise: Páginas Existentes vs Especificação

**Data**: 2026-01-14  
**Objetivo**: Identificar o que precisa ser adicionado/modificado nas páginas existentes

---

## 1. WhatsApp Marketing

### Rota Atual na VPS
`/marketing/whatsapp/automated-campaigns`

### ✅ O que JÁ TEM
- Grid de cards com campanhas
- Ícones (emojis) para cada campanha
- Título e descrição
- Toggle "Envio automático ativado" ✅
- Botão "Personalizar" ✅
- Modal de personalização completo

### ❌ O que FALTA
- **Tabs**: Campanhas, Campanhas Personalizadas, Configurações
  - Atualmente só mostra "Campanhas Automáticas" (sem tabs)
  - Falta tab "Campanhas Personalizadas"
  - Falta tab "Configurações"

### 📝 AÇÃO NECESSÁRIA
Adicionar sistema de tabs na página `/marketing/whatsapp/page.tsx` para:
1. Tab "Campanhas" → redirecionar para `/automated-campaigns`
2. Tab "Campanhas Personalizadas" → redirecionar para `/custom-campaigns`
3. Tab "Configurações" → redirecionar para `/settings`

**Nota**: As subpáginas já existem, só falta o wrapper com tabs.

---

## 2. Promoções

### Rota Atual na VPS
`/promotions`

### ✅ O que JÁ TEM
- Título e descrição
- Botão "+ Novo" (mas chama toast, não modal)
- Tabela (DataTable component)
- Feature flag implementado
- UpsellModal (mas não é o especificado)

### ❌ O que FALTA
- **Campo de busca "Buscar"** - NÃO TEM
- **Filtros** (dropdown de status) - NÃO TEM
- **Modal Paywall específico** com texto exato:
  - "Você ainda não possui essa funcionalidade contratada"
  - Botões "Fechar" e "Contratar"
  - Atualmente usa `UpsellModal` (diferente do especificado)

### 📝 AÇÃO NECESSÁRIA
1. Adicionar campo de busca "Buscar"
2. Adicionar filtro de status (dropdown)
3. Substituir `UpsellModal` por `PaywallModal` com texto exato
4. Fazer botão "+ Novo" abrir o PaywallModal quando feature não liberada

---

## 3. Subscription Sales

### Rota Atual na VPS
`/subscription-sales`

### ✅ O que JÁ TEM
- Cards de métricas (Ativas, Pausadas, Canceladas, MRR)
- Filtros (Status, Plano/Pacote)
- Tabela de assinaturas
- FeatureWrapper

### ❌ O que FALTA
- **Tabs**: "Assinaturas" e "Modelos de assinatura" - NÃO TEM
- **Modal Paywall** - NÃO TEM
- Botão "+ Novo" - TEM mas não abre modal

### 📝 AÇÃO NECESSÁRIA
1. Adicionar sistema de tabs:
   - Tab "Assinaturas" (conteúdo atual)
   - Tab "Modelos de assinatura" (nova seção)
2. Adicionar PaywallModal
3. Integrar PaywallModal com botão "+ Novo"

**Nota**: Já fiz isso localmente, precisa enviar para VPS.

---

## 4. Avaliações

### Rota Atual na VPS
`/evaluations`

### ✅ O que JÁ TEM
- Título e descrição
- Tabela de avaliações
- Sistema de resposta a avaliações
- Modal de detalhes
- Renderização de estrelas (rating)

### ❌ O que FALTA
- **Subtabs**: Painel, Avaliações, Personalização, Configurações - NÃO TEM
- **Painel** com métricas - NÃO TEM
- **Preview público** com:
  - Fundo com branding
  - Card central com avatar, nome, rating 5 estrelas, comentário, data
- **Personalização** - NÃO TEM
- **Configurações** com toggle "Envio automático ativado" - NÃO TEM

### 📝 AÇÃO NECESSÁRIA
Refatorar completamente a página para incluir:
1. Sistema de 4 subtabs
2. Tab "Painel" com cards de métricas
3. Tab "Avaliações" (conteúdo atual)
4. Tab "Personalização" com preview público estilizado
5. Tab "Configurações" com toggle "Envio automático ativado"

---

## 5. Agendamento Online

### Rota Atual na VPS
`/marketing/online-booking`

### ✅ O que JÁ TEM
- Sistema de 7 tabs ✅
- Tabs separadas em componentes
- CompanyDetailsTab, ConfigurationsTab, LinksTab, GalleryTab, ServicesTab, BusinessHoursTab, PaymentsTab

### ❌ O que FALTA (por tab)

#### Tab "Detalhes da empresa"
- **Layout 2 colunas** - VERIFICAR se tem
- **Preview em moldura de celular** (375x667px) - NÃO TEM
  - Com tabs públicas
  - Lista de serviços com busca + filtro + cards
- Logo com botões "Alterar/Remover" - VERIFICAR

#### Tab "Configurações"
- Verificar se tem todos os campos:
  - Cor primária (color picker)
  - Tema (select)
  - Fluxo de agendamento (select "Serviços")
  - Login obrigatório (toggle ligado)
  - Tempo de antecedência (select "0 min")
  - Cancelar agendamentos (toggle)

#### Tab "Galeria de fotos"
- Grid de thumbnails - VERIFICAR
- Botões "Enviar imagem" e "Excluir imagens" - VERIFICAR

#### Tab "Serviços"
- Loading "Aguarde..." - VERIFICAR
- Lista/tabela após loading - VERIFICAR

### 📝 AÇÃO NECESSÁRIA
Verificar cada tab e adicionar:
1. **CompanyDetailsTab**: Preview mobile em moldura de celular
2. **ConfigurationsTab**: Verificar todos os campos especificados
3. **GalleryTab**: Verificar botões com texto exato
4. **ServicesTab**: Adicionar loading state com texto "Aguarde..."

---

## 📊 RESUMO DE PRIORIDADES

### 🔴 ALTA PRIORIDADE (Mudanças Significativas)

1. **Avaliações** - Refatoração completa
   - Adicionar 4 subtabs
   - Criar preview público estilizado
   - Adicionar painel de métricas

2. **Agendamento Online** - Adicionar preview mobile
   - Criar moldura de celular (375x667px)
   - Implementar preview com tabs públicas

### 🟡 MÉDIA PRIORIDADE (Adicionar Componentes)

3. **WhatsApp Marketing** - Adicionar tabs wrapper
   - Criar sistema de tabs principal
   - Manter subpáginas existentes

4. **Subscription Sales** - Adicionar tabs
   - Já feito localmente, precisa deploy

### 🟢 BAIXA PRIORIDADE (Ajustes Pequenos)

5. **Promoções** - Adicionar busca e filtros
   - Campo "Buscar"
   - Filtro de status
   - Trocar UpsellModal por PaywallModal

---

## 🛠️ COMPONENTES NECESSÁRIOS

### Já Criados Localmente
- ✅ `PaywallModal.tsx` - Pronto para uso

### Precisam Ser Criados
- ❌ Preview Mobile Component (para Agendamento Online)
- ❌ Painel de Métricas (para Avaliações)
- ❌ Preview Público Component (para Avaliações)

---

## 📋 PRÓXIMOS PASSOS

1. **Enviar PaywallModal para VPS**
2. **Atualizar Subscription Sales na VPS** (já pronto localmente)
3. **Criar/Atualizar páginas na ordem de prioridade**:
   - Avaliações (mais complexo)
   - Agendamento Online (preview mobile)
   - WhatsApp Marketing (tabs wrapper)
   - Promoções (busca + filtros)

---

## ✅ CONCLUSÃO

**Páginas existentes têm boa base**, mas precisam de:
- Sistemas de tabs adicionais
- Preview mobile estilizado
- Modal paywall padronizado
- Campos de busca e filtros
- Loading states com textos específicos

**Trabalho estimado**: Médio (2-3 páginas precisam refatoração significativa)
