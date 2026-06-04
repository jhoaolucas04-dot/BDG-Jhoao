/**
 * dados.js — Camada de Dados Compartilhada
 *
 * Migrado de localStorage para Firebase Cloud Firestore.
 * Mantém sincronização em tempo real (onSnapshot) para atualizar a vitrine
 * e o admin instantaneamente para todos os usuários conectados.
 */

// Configuração do Firebase
// Caso queira usar credenciais reais, substitua este objeto com as credenciais do seu Console Firebase.
const firebaseConfig = {
    apiKey: "AIzaSyDummyKey_PleaseReplaceWithRealKey",
    authDomain: "bodega-do-galego.firebaseapp.com",
    projectId: "bodega-do-galego",
    storageBucket: "bodega-do-galego.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef"
};

let db;
let produtosCache = [];
let onProdutosAtualizadosCallback = null;
let initialized = false;
let resolveInitPromise;

// Promise global que resolve quando os dados iniciais do Firestore são carregados
const initPromise = new Promise((resolve) => {
    resolveInitPromise = resolve;
});

/**
 * Registra um callback para ser notificado sempre que houver alterações nos produtos.
 * @param {Function} callback 
 */
function registrarListenerProdutos(callback) {
    onProdutosAtualizadosCallback = callback;
    // Se o cache já foi inicializado com dados, executa o callback imediatamente
    if (initialized) {
        callback(produtosCache);
    }
}

// Inicializa o SDK do Firebase Compat e o Cloud Firestore
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();

    // Escuta a coleção "produtos" em tempo real
    db.collection("produtos").onSnapshot(async (snapshot) => {
        if (snapshot.empty && !initialized) {
            // Banco de dados novo/vazio: semeia com os dados de produtos.json
            initialized = true;
            console.log("Banco de dados vazio no Firestore. Semeando dados iniciais...");
            await semearBancoDeDados();
            return;
        }

        produtosCache = [];
        snapshot.forEach((doc) => {
            produtosCache.push(doc.data());
        });

        // Garante a ordenação crescente por ID numérico
        produtosCache.sort((a, b) => a.id - b.id);

        initialized = true;
        resolveInitPromise(produtosCache);

        if (onProdutosAtualizadosCallback) {
            onProdutosAtualizadosCallback(produtosCache);
        }
    }, (error) => {
        console.error("Erro no listener em tempo real do Firestore:", error);
    });
} else {
    console.error("Firebase SDK não carregado! Verifique as referências do CDN no HTML.");
}

/**
 * Popula a coleção "produtos" no Firestore usando o arquivo produtos.json
 */
async function semearBancoDeDados() {
    try {
        const resp = await fetch('produtos.json');
        if (!resp.ok) throw new Error('Falha ao buscar produtos.json');
        const data = await resp.json();
        
        const batch = db.batch();
        data.forEach((p) => {
            const docRef = db.collection("produtos").doc(p.id.toString());
            batch.set(docRef, {
                id: p.id,
                nome: p.nome,
                preco: parseFloat(p.preco),
                estoque: parseInt(p.estoque),
                categoria: p.categoria,
                imagem: p.imagem || '',
                status: p.status || (parseInt(p.estoque) > 0 ? 'Disponível' : 'Esgotado')
            });
        });
        await batch.commit();
        console.log("Banco de dados do Firestore inicializado com sucesso!");
    } catch (erro) {
        console.error('Erro ao semear o banco de dados no Firestore:', erro);
    }
}

/**
 * Retorna uma Promise que resolve com os produtos quando a carga inicial for concluída.
 * Mantido para compatibilidade com o ciclo de vida inicial das páginas.
 * @returns {Promise<Array>} Lista de produtos inicial
 */
async function carregarProdutos() {
    return initPromise;
}

/**
 * Retorna os produtos armazenados no cache local (síncrono).
 * @returns {Array} Lista de produtos do cache
 */
function getProdutos() {
    return produtosCache;
}

/**
 * Adiciona um novo produto no Firestore.
 * @param {Object} dados — { nome, preco, estoque, categoria, imagem }
 */
async function adicionarProduto(dados) {
    const id = Date.now();
    const novoProduto = {
        id: id,
        nome: dados.nome,
        preco: parseFloat(dados.preco),
        estoque: parseInt(dados.estoque),
        categoria: dados.categoria,
        imagem: dados.imagem || '',
        status: parseInt(dados.estoque) > 0 ? 'Disponível' : 'Esgotado'
    };
    try {
        await db.collection("produtos").doc(id.toString()).set(novoProduto);
    } catch (e) {
        console.error("Erro ao adicionar produto no Firestore:", e);
        throw e;
    }
}

/**
 * Edita um produto existente pelo ID no Firestore.
 * @param {number} id
 * @param {Object} dados — campos a atualizar
 */
async function editarProduto(id, dados) {
    try {
        const docRef = db.collection("produtos").doc(id.toString());
        const updateData = {};
        if (dados.nome !== undefined) updateData.nome = dados.nome;
        if (dados.preco !== undefined) updateData.preco = parseFloat(dados.preco);
        if (dados.estoque !== undefined) {
            updateData.estoque = parseInt(dados.estoque);
            updateData.status = parseInt(dados.estoque) > 0 ? 'Disponível' : 'Esgotado';
        }
        if (dados.categoria !== undefined) updateData.categoria = dados.categoria;
        if (dados.imagem !== undefined) updateData.imagem = dados.imagem;

        await docRef.update(updateData);
    } catch (e) {
        console.error("Erro ao editar produto no Firestore:", e);
        throw e;
    }
}

/**
 * Deleta um produto pelo ID no Firestore.
 * @param {number} id
 */
async function deletarProduto(id) {
    try {
        await db.collection("produtos").doc(id.toString()).delete();
    } catch (e) {
        console.error("Erro ao deletar produto no Firestore:", e);
        throw e;
    }
}

/**
 * Alterna o status do produto entre Disponível e Esgotado no Firestore.
 * Se ficar Disponível com estoque 0, define estoque = 10.
 * @param {number} id
 */
async function alternarStatus(id) {
    try {
        const docRef = db.collection("produtos").doc(id.toString());
        const doc = await docRef.get();
        if (doc.exists) {
            const currentData = doc.data();
            const novoStatus = currentData.status === 'Disponível' ? 'Esgotado' : 'Disponível';
            let novoEstoque = currentData.estoque;
            if (novoStatus === 'Disponível' && currentData.estoque === 0) {
                novoEstoque = 10;
            }
            await docRef.update({
                status: novoStatus,
                estoque: novoEstoque
            });
        }
    } catch (e) {
        console.error("Erro ao alternar status no Firestore:", e);
        throw e;
    }
}
