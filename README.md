<p align="center">
  <img src="img/logo.jpeg" alt="Logo Bodega do Galego" width="130" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"/>
</p>

<p align="center">
  <strong>🛒 Bodega do Galego — Vitrine Virtual & Painel Administrativo</strong><br>
  ⚡ Interface Fluida • 🌐 Sincronização em Tempo Real (Supabase) • 🌓 Modo Escuro Nativo • 📱 Mobile-First
</p>

---

## 📝 Sobre o Projeto

A **Bodega do Galego** é um ecossistema completo voltado para a exposição e gestão de produtos e acessórios tecnológicos de alto desempenho. O projeto foi estruturado sob o conceito de **Vanilla Web Architecture** (HTML5 Semântico, CSS3 Moderno com Design Tokens e JavaScript ES6+ Nativo), garantindo extrema leveza, carregamento ultrarrápido (performance superior a 95+ no Lighthouse), SEO aprimorado e independência total de frameworks pesados (como React, Angular ou Vue).

O ecossistema é dividido em duas partes fundamentais:
1.  **Vitrine Virtual Pública (Client-Side):** Catálogo online voltado para os clientes, otimizado para navegação móvel e integrado diretamente ao WhatsApp do estabelecimento, agilizando o funil de vendas e a comunicação direta.
2.  **Painel Administrativo Privado (Admin-Side):** Dashboard para gerenciamento do catálogo de produtos em tempo real (Adicionar, Editar, Status de Estoque, Excluir e Estatísticas operacionais).

---

## ✨ Funcionalidades Detalhadas

### 🛍️ Vitrine Virtual
*   **Carrossel Híbrido Dinâmico:** Apresenta slides rotativos automáticos contendo banners institucionais do setor de assistência técnica (Reparos) e cartões com os principais produtos em destaque que possuem imagem e estoque disponível.
*   **Barra de Busca Inteligente em Tempo Real:** Filtra a vitrine imediatamente ao digitar, sem necessidade de recarregar a página. Em dispositivos móveis (telas menores que 768px), possui comportamento reativo com overlay escuro expansivo de foco completo.
*   **Filtros Rápidos de Categoria:** Abas navegáveis (Acessórios, Cabos, Fones, Áudio e Reparos) que reagem instantaneamente ao toque para segmentação de catálogo.
*   **Integração Automatizada com WhatsApp:** Geração dinâmica de mensagens pré-formatadas para o WhatsApp do estabelecimento, contendo o nome e o preço do item de interesse do cliente.

### 🔐 Painel Administrativo
*   **Portal de Acesso Seguro:** Tela de login validada localmente, com campo de visualização de senha alternável (ícone de olho) e animação visual de erro (*shake* tridimensional) para tentativas inválidas.
*   **CRUD Completo de Produtos:** Cadastro completo incluindo Nome, Categoria, Quantidade em Estoque, Preço e Imagem do Produto.
*   **Duas Opções de Imagem (URL ou Upload de Arquivos):** Permite adicionar imagens inserindo uma URL externa ou fazendo upload direto de um arquivo local. Arquivos locais são convertidos instantaneamente para a codificação Base64 e gravados no banco de dados.
*   **Preview Interativo de Imagem:** Validação automática com tratamento de erros integrado. Caso um link de imagem seja quebrado ou inválido, o sistema substitui visualmente por um estado de alerta e mantém a integridade do layout.
*   **Indicadores Operacionais Reativos (KPIs):** Painel superior no Admin que atualiza dinamicamente métricas vitais como *Total de Produtos*, *Valor Total em Estoque (R$)* e *Itens Esgotados*.
*   **Alertas Flutuantes (Toasts):** Feedback visual suave e não intrusivo para operações de sistema (ex: "Produto adicionado com sucesso!", "Erro ao atualizar produto").

---

## ⚙️ Regras de Negócio do Código

### 1. Tratamento Especial para a Categoria "Reparos"
A Bodega do Galego também presta serviços de assistência técnica. Para essa categoria específica, o código implementa regras automáticas:
*   **Ocultação de Preços:** Em produtos cadastrados sob a categoria `Reparos`, o preço é ocultado tanto nos cartões da vitrine quanto nos slides do carrossel, exibindo uma mensagem neutra ou focando exclusivamente na solicitação de orçamento via WhatsApp.
*   **Omissão no Formulário:** No Painel Admin, ao selecionar a categoria `Reparos`, o campo de entrada do Preço é ocultado visualmente e a obrigatoriedade (`required`) do atributo HTML é dinamicamente removida. O valor é internamente registrado como `0` no banco. Ao alternar para outra categoria, o campo reaparece e volta a ser obrigatório.

### 2. Badges de Estoque Dinâmicos e Estados de Escassez
O sistema calcula o status e reage visualmente de acordo com a quantidade (`estoque`) de cada produto:
*   **Esgotado (Estoque = 0):** A etiqueta é alterada para "Esgotado" (cor vermelha), o card do produto recebe um filtro de escala de cinza de 80% (`filter: grayscale(80%)`) com opacidade reduzida, e o botão do WhatsApp é alterado para "Esgotado" e desativado.
*   **Poucas Unidades (Estoque entre 1 e 5):** Exibe uma etiqueta chamativa de escassez "Poucas Unidades!" (cor amarela/laranja) na vitrine, instigando o gatilho mental de urgência no consumidor.
*   **Disponível (Estoque > 5):** Exibe a etiqueta comum de produto em estoque active. No Admin, é possível alternar manualmente o status de um produto de "Disponível" para "Esgotado" pressionando o botão **Status**. Se o produto estava esgotado e for ativado, o sistema define uma quantidade padrão de 10 unidades.

### 3. Persistência de Imagem via Banco de Dados
A imagem do produto precisa obrigatoriamente ir para o banco de dados.
*   Quando o administrador fornece uma URL da internet, a string do link é salva no banco.
*   Quando o administrador faz o upload de um arquivo, o JavaScript utiliza o objeto nativo `FileReader` para lê-lo assincronamente como um DataURL Base64 (`data:image/jpeg;base64,...`). Essa string de dados codificados é salva na coluna `imagem` do banco do Supabase, permitindo que a imagem seja armazenada e renderizada diretamente a partir do próprio banco de dados, sem necessidade de servidores de arquivos externos.

---

## 🗄️ Arquitetura de Dados & Supabase

Os dados de produtos são hospedados na plataforma **Supabase** (PostgreSQL) e consumidos via REST API utilizando autenticação via cabeçalhos HTTP com chaves seguras anonimizadas.

*   **Cache Local Síncrono:** Para evitar conexões excessivas e lentidão, a camada de dados em `dados.js` mantém uma variável interna (`_cache`) atualizada. Funções síncronas rápidas (como `getProdutos()`) lêem diretamente deste cache.
*   **Sincronização em Tempo Real (Polling):** A aplicação implementa um listener inteligente em `registrarListenerProdutos()`. Ele define um intervalo de **Polling a cada 10 segundos** (`setInterval`) que busca novos dados do banco de dados de maneira assíncrona. Se houver alterações feitas por outros administradores, a tabela do Admin e a Vitrine do cliente atualizam-se instantaneamente, mantendo as telas de todos os utilizadores em harmonia.

---

## 📁 Estrutura de Pastas

```text
├── css/
│   ├── admin.css          # Estilos do Dashboard Admin, inputs e regras mobile
│   ├── global.css         # Variáveis de Design, resets CSS, Modo Escuro e Badges
│   ├── login.css          # Design do formulário e animações da tela de Login
│   └── vitrine.css        # Layout da vitrine pública, cards de produtos e carrossel
├── js/
│   ├── admin.js           # Lógica do CRUD, validação de abas de imagem e tabelas
│   ├── dados.js           # Camada de integração REST API Supabase e cache em polling
│   ├── login.js           # Autenticação administrativa e controle de exibição de senha
│   ├── tema.js            # Controle global do tema (Escuro/Claro) com localStorage
│   └── vitrine.js         # Lógica de renderização de cards, buscas e carrossel
├── img/
│   ├── logo.jpeg          # Logomarca oficial do estabelecimento
│   └── assistencia...     # Recursos estáticos de banners
├── admin.html             # Painel administrativo de controle de catálogo
├── index.html             # Vitrine pública acessível pelos clientes
├── login.html             # Portal de Login seguro
├── login.json             # Estrutura JSON informativa de credenciais
└── produtos.json          # Dump JSON informativo da carga inicial de produtos
```

---

## 🚀 Como Rodar o Projeto Localmente

Devido à arquitetura moderna baseada em chamadas assíncronas assentes em `fetch` e leitura de arquivos por `FileReader`, abrir os arquivos `.html` diretamente no browser clicando duas vezes sobre eles pode desencadear restrições de **CORS** do navegador. 

Para rodar a aplicação corretamente, execute um servidor local de desenvolvimento seguindo uma das opções abaixo:

### Opção 1: Extensão "Live Server" (VS Code)
1. Abra a pasta do projeto no Visual Studio Code.
2. Certifique-se de ter a extensão **Live Server** instalada.
3. Clique no botão **"Go Live"** no canto inferior direito do VS Code ou clique com o botão direito sobre o arquivo `index.html` e selecione **"Open with Live Server"**.

### Opção 2: Python (Servidor Rápido via Terminal)
Abra o terminal na pasta raiz do projeto e execute o comando abaixo:
*   Se estiver utilizando Python 3:
    ```bash
    python -m http.server 8000
    ```
*   Se estiver utilizando Python 2:
    ```bash
    python -m SimpleHTTPServer 8000
    ```
Após iniciar o servidor, abra o navegador e acesse: [http://localhost:8000](http://localhost:8000)

### 🔑 Credenciais do Painel Admin
Para acessar as ferramentas administrativas em `login.html`, utilize os seguintes dados de login padrão do estabelecimento:
*   **Usuário:** `admin`
*   **Senha:** `admin123`
