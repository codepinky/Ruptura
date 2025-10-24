# 💰 RupturaProject - Plataforma Financeira

Uma plataforma completa de controle financeiro pessoal construída com React e Vite, oferecendo uma interface moderna e intuitiva para gerenciar receitas, despesas e análises financeiras.

## 🚀 Tecnologias Utilizadas

- **React 19** - Biblioteca JavaScript para interfaces de usuário
- **Vite** - Ferramenta de build rápida e moderna
- **React Router** - Roteamento para aplicações SPA
- **Recharts** - Biblioteca de gráficos para React
- **Lucide React** - Ícones modernos e consistentes
- **CSS3** - Estilização moderna com gradientes e animações
- **ESLint** - Linter para qualidade de código

## 📁 Estrutura do Projeto

```
src/
├── context/                    # Contexto global da aplicação
│   └── FinancialContext.jsx    # Gerenciamento de estado financeiro
├── components/                # Componentes reutilizáveis
│   ├── Layout/               # Componentes de layout
│   │   ├── Layout.jsx       # Layout principal
│   │   ├── Layout.css       # Estilos do layout
│   │   ├── Sidebar.jsx      # Barra lateral de navegação
│   │   ├── Sidebar.css      # Estilos da sidebar
│   │   ├── TopBar.jsx       # Barra superior
│   │   └── TopBar.css       # Estilos da topbar
│   ├── Cards/               # Componentes de cartões
│   │   ├── SummaryCard.jsx  # Cartão de resumo
│   │   ├── SummaryCard.css  # Estilos do cartão de resumo
│   │   ├── TransactionCard.jsx # Cartão de transação
│   │   └── TransactionCard.css # Estilos do cartão de transação
│   ├── Charts/              # Componentes de gráficos
│   │   ├── ExpenseChart.jsx # Gráfico de gastos por categoria
│   │   ├── ExpenseChart.css # Estilos do gráfico de gastos
│   │   ├── BalanceChart.jsx # Gráfico de evolução do saldo
│   │   └── BalanceChart.css # Estilos do gráfico de saldo
│   └── Forms/               # Componentes de formulários
│       ├── TransactionForm.jsx # Formulário de transação
│       └── TransactionForm.css # Estilos do formulário
├── pages/                   # Páginas da aplicação
│   ├── Dashboard/          # Página principal
│   │   ├── Dashboard.jsx  # Componente do dashboard
│   │   └── Dashboard.css  # Estilos do dashboard
│   ├── Transactions/       # Página de transações
│   │   ├── Transactions.jsx # Componente de transações
│   │   └── Transactions.css # Estilos de transações
│   └── Reports/           # Página de relatórios
│       ├── Reports.jsx    # Componente de relatórios
│       └── Reports.css    # Estilos de relatórios
├── App.jsx                 # Componente principal
├── App.css                 # Estilos globais da aplicação
├── main.jsx                # Ponto de entrada da aplicação
└── index.css              # Estilos globais
```

## 🛠️ Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Abrir no navegador:**
   Acesse `http://localhost:5173` (ou a porta indicada no terminal)

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter ESLint

## 🎨 Funcionalidades Implementadas

### ✅ Dashboard
- **Visão geral** das finanças com cards de resumo
- **Gráficos interativos** de gastos por categoria
- **Evolução do saldo** nos últimos 30 dias
- **Transações recentes** com ações rápidas

### ✅ Gestão de Transações
- **Adicionar/Editar/Excluir** transações
- **Filtros avançados** por tipo, categoria e período
- **Busca em tempo real** por descrição
- **Ordenação** por data, valor ou descrição
- **Validação de formulários** com feedback visual

### ✅ Relatórios e Análises
- **Gráfico de barras** comparando receitas vs despesas por mês
- **Gráfico de pizza** mostrando distribuição de gastos por categoria
- **Gráfico de linha** da evolução do saldo
- **Estatísticas anuais** com resumos financeiros

## 🎨 Funcionalidades Implementadas

### ✅ Dashboard
- **Visão geral** das finanças com cards de resumo
- **Gráficos interativos** de gastos por categoria
- **Evolução do saldo** nos últimos 30 dias
- **Transações recentes** com ações rápidas

### ✅ Gestão de Transações
- **Adicionar/Editar/Excluir** transações
- **Filtros avançados** por tipo, categoria e período
- **Busca em tempo real** por descrição
- **Ordenação** por data, valor ou descrição
- **Validação de formulários** com feedback visual

### ✅ Relatórios e Análises
- **Gráfico de barras** comparando receitas vs despesas por mês
- **Gráfico de pizza** mostrando distribuição de gastos por categoria
- **Gráfico de linha** da evolução do saldo
- **Estatísticas anuais** com resumos financeiros

### ✅ Interface e UX
- **Design responsivo** para todos os dispositivos
- **Navegação intuitiva** com sidebar e breadcrumbs
- **Tema moderno** com gradientes e animações
- **Feedback visual** em todas as interações
- **Persistência de dados** no localStorage
- **🌙 Modo Escuro/Claro** com alternância automática

## 🎯 Características Técnicas

- ✅ **Arquitetura modular** com componentes bem organizados
- ✅ **Gerenciamento de estado** com Context API
- ✅ **Roteamento** com React Router
- ✅ **Gráficos interativos** com Recharts
- ✅ **Ícones consistentes** com Lucide React
- ✅ **Validação de formulários** robusta
- ✅ **Persistência local** dos dados
- ✅ **Design responsivo** mobile-first
- ✅ **Performance otimizada** com Vite
- ✅ **Sistema de temas** com modo escuro/claro
- ✅ **Variáveis CSS** para consistência visual

## 🔮 Próximas Funcionalidades

- [ ] **Gestão de Categorias** - Criar e editar categorias personalizadas
- [ ] **Orçamentos** - Definir limites de gastos por categoria
- [ ] **Metas Financeiras** - Acompanhar objetivos de poupança
- [ ] **Calendário Financeiro** - Visualizar transações em calendário
- [ ] **Exportação de dados** - PDF e Excel
- [ ] **Notificações** - Lembretes e alertas
- [ ] **Backup na nuvem** - Sincronização entre dispositivos
- [ ] **Relatórios avançados** - Mais tipos de análise
- [ ] **Testes automatizados** - Cobertura de testes

## 🌙 Sistema de Temas

O RupturaProject inclui um sistema completo de temas com modo escuro e claro:

### ✨ Características do Sistema de Temas
- **Alternância automática** baseada na preferência do sistema
- **Persistência** da escolha do usuário no localStorage
- **Transições suaves** entre os temas (0.3s)
- **Variáveis CSS** para consistência visual
- **Botão de alternância** na barra superior
- **Ícones dinâmicos** (Sol/Lua) indicando o tema atual

### 🎨 Paleta de Cores

**Modo Claro:**
- Fundo principal: `#f8fafc`
- Fundo de cards: `#ffffff`
- Texto principal: `#1e293b`
- Texto secundário: `#64748b`
- Bordas: `#e2e8f0`

**Modo Escuro:**
- Fundo principal: `#1e293b`
- Fundo de cards: `#1e293b`
- Texto principal: `#f1f5f9`
- Texto secundário: `#cbd5e1`
- Bordas: `#334155`

### 🔧 Implementação Técnica
- **Context API** para gerenciamento de estado do tema
- **CSS Custom Properties** para variáveis de tema
- **Detecção automática** da preferência do sistema
- **Hook personalizado** `useTheme()` para fácil acesso

## 📱 Responsividade

A aplicação foi desenvolvida com abordagem mobile-first, garantindo uma experiência otimizada em:
- 📱 **Smartphones** (320px+)
- 📱 **Tablets** (768px+)
- 💻 **Desktops** (1024px+)
- 🖥️ **Telas grandes** (1440px+)

## 🎨 Design System

- **Cores primárias**: Azul (#3B82F6) e Roxo (#8B5CF6)
- **Cores de status**: Verde (#10B981) para receitas, Vermelho (#EF4444) para despesas
- **Tipografia**: Sistema de fontes do sistema para melhor performance
- **Espaçamento**: Sistema de grid consistente
- **Animações**: Transições suaves de 0.2s-0.3s

## 📝 Licença

Este projeto está sob a licença MIT.