🛒 Bodega do Galego — Vitrine Virtual & Painel Administrativo
📝 Sobre o Projeto
A Bodega do Galego é uma plataforma web moderna desenvolvida para a exposição de produtos e gestão de serviços de assistência técnica. O ecossistema divide-se em duas frentes principais: uma Vitrine Virtual pública integrada com links de pedidos diretos para o WhatsApp e um Dashboard Administrativo privado para a gestão de stock e catálogo em tempo real.

O projeto destaca-se por não utilizar frameworks pesados, sendo construído inteiramente com tecnologias web nativas para garantir o máximo de velocidade, leveza e indexação.

✨ Funcionalidades Principais
🛍️ Vitrine Virtual (Cliente)
Carrossel Dinâmico e Híbrido: Apresenta um banner institucional fixo focado em serviços de reparos (com imagens otimizadas para desktop e mobile) e destaca até 5 produtos disponíveis que possuam imagem cadastrada.

Filtro por Categorias: Permite a navegação segmentada entre as categorias Todos, Reparos, Acessórios, Cabos, Fones e Áudio.

Barra de Pesquisa Inteligente: Filtra os produtos em tempo real por nome. No mobile, expande-se dinamicamente e ativa um overlay escuro de fundo para melhorar o foco do utilizador.

Redirecionamento para WhatsApp: Ao clicar num produto disponível, gera automaticamente uma mensagem formatada com o nome e o preço do item para o contacto do vendedor.

🔐 Painel Administrativo (Gestão)
Autenticação de Acesso: Tela de login protegida que valida o utilizador localmente. Possui o recurso de alternar a visibilidade da senha e uma animação visual (shake) caso as credenciais estejam incorretas.

Proteção de Rotas: O painel valida a sessão no carregamento da página através do sessionStorage, impedindo o acesso direto sem autenticação.

Controle Total (CRUD): Permite adicionar, editar, remover e alternar o status de disponibilidade dos produtos.

Preview de Imagem: Valida URLs de imagem em tempo real no formulário, exibindo um aviso visual caso o link seja inválido.

Indicadores Reativos (Cards de Resumo): Apresenta o total de produtos cadastrados, o valor total do inventário em stock e a quantidade de itens esgotados.

Mensagens de Feedback (Toasts): Alertas animados na base da tela confirmando o sucesso ou falha das operações.

🌓 Recursos Globais
Gerenciador de Temas: Alternância entre Modo Claro e Modo Escuro com suporte à preferência do sistema operativo.

Prevenção de Flash de Luz: Inclui um script síncrono no <head> das páginas que lê o localStorage (bodega_tema) antes do carregamento do body, evitando flashes de luz indesejados.

🛠️ Regras de Negócio Implementadas
Comportamento Específico da Categoria "Reparos": * Por se tratar de serviços de assistência técnica com orçamentos variáveis, os itens da categoria "Reparos" têm a exibição de preço ocultada na vitrine e no carrossel.

No Dashboard, ao selecionar esta categoria, o campo de preço é escondido e deixa de ser obrigatório, definindo o valor padrão como 0.

Controle de Badges de Stock: * Esgotado: Produtos com quantidade 0 ou alterados manualmente para "Esgotado" exibem um badge vermelho, ganham um efeito visual cinzento (grayscale) e têm o botão do WhatsApp desativado.

Poucas Unidades!: Produtos que possuam entre 1 e 5 unidades em stock exibem automaticamente um badge amarelo de urgência.

🌍 Arquitetura de Dados & Sincronização
A persistência de dados do ecossistema é totalmente integrada à API REST do Supabase.

Cache Local: O ficheiro js/dados.js mantém uma estrutura de cache síncrono para garantir consultas instantâneas na interface.

Sincronização por Polling: O sistema realiza uma busca automática ao banco de dados a cada 10 segundos. Isto garante que múltiplos administradores e clientes vejam o stock atualizado em tempo real sem a necessidade de atualizar a página manualmente.

📁 Estrutura de Pastas
Plaintext
├── css/
│   ├── admin.css          # Estilização do Dashboard Admin, tabelas e toasts
│   ├── global.css         # Variáveis (tokens), resets, temas e animações gerais
│   ├── login.css          # Design do formulário de acesso e efeitos de fundo
│   └── vitrine.css        # Layout da loja pública, busca mobile e carrossel
├── js/
│   ├── admin.js           # Lógica do CRUD, preenchimento de métricas e formulários
│   ├── dados.js           # Integração com a API do Supabase e cache local
│   ├── login.js           # Controle de acessos e alternância de visualização da senha
│   ├── tema.js            # Motor de controle do Dark Mode / Light Mode
│   └── vitrine.js         # Renderização dos produtos, carrossel e regras de stock
├── img/
│   ├── logo.jpeg          # Logomarca oficial do estabelecimento
│   ├── banner-reparos.png # Banner horizontal para computadores
│   └── assistencia-tecnica-galego.png # Imagem vertical adaptada para telemóveis
├── admin.html             # Estrutura do Painel de Controle Administrativo
├── index.html             # Página principal (Vitrine Virtual Pública)
└── login.html             # Portal de Acesso do Administrador

Conexão com o Banco de Dados
A comunicação com o Supabase é realizada através das seguintes definições globais localizadas no ficheiro js/dados.js:

Endpoint: https://oinyeirkekaqwxiiqdqw.supabase.co

Autenticação: Headers HTTP nativos contendo a chave pública (apikey / Bearer).

🚀 Como Executar Localmente
Clone este repositório para a sua máquina local.

Devido à utilização de requisições assíncronas (fetch) para a comunicação com a API, evite abrir os ficheiros HTML clicando diretamente neles (protocolo file://) para evitar bloqueios de CORS.

Execute a aplicação utilizando um servidor local. Se utilizar o VS Code, recomenda-se a extensão Live Server. Caso prefira o terminal (com Python instalado), execute:

Bash
python -m http.server 8000
Aceda a http://localhost:8000 no seu navegador para visualizar a Vitrine Virtual.
