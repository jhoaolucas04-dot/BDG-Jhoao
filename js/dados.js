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
let modoLocal = false;
let timeoutFirebase = null;

// Promise global que resolve quando os dados iniciais do Firestore (ou Local) são carregados
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

/**
 * Ativa o modo local de forma segura, carregando dados do localStorage ou de produtos.json
 * @param {string} motivo
 */
async function ativarModoLocal(motivo) {
    if (modoLocal || (initialized && produtosCache.length > 0)) return;
    modoLocal = true;
    initialized = true;
    console.warn("Ativando modo local. Motivo: " + motivo);

    if (timeoutFirebase) {
        clearTimeout(timeoutFirebase);
    }

    try {
        let localData = localStorage.getItem('bodega_produtos');
        if (localData) {
            produtosCache = JSON.parse(localData);
            console.log("Dados carregados com sucesso do localStorage.");
        } else {
            console.log("LocalStorage vazio. Semeando dados locais a partir de produtos.json...");
            const resp = await fetch('produtos.json');
            if (resp.ok) {
                produtosCache = await resp.json();
                localStorage.setItem('bodega_produtos', JSON.stringify(produtosCache));
            } else {
                throw new Error("Falha ao buscar produtos.json para semeadura local.");
            }
        }

        produtosCache.sort((a, b) => a.id - b.id);
        resolveInitPromise(produtosCache);

        if (onProdutosAtualizadosCallback) {
            onProdutosAtualizadosCallback(produtosCache);
        }
    } catch (e) {
        console.error("Erro crítico na inicialização do modo local:", e);
        produtosCache = [];
        resolveInitPromise([]);
    }
}

// Inicializa o SDK do Firebase Compat e o Cloud Firestore se disponível
if (typeof firebase !== 'undefined') {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();

        // Inicia o timer de timeout para fallback
        timeoutFirebase = setTimeout(() => {
            if (!initialized) {
                ativarModoLocal("Tempo limite de resposta do Firebase expirado.");
            }
        }, 3500);

        // Escuta a coleção "produtos" em tempo real
        db.collection("produtos").onSnapshot(async (snapshot) => {
            if (timeoutFirebase) {
                clearTimeout(timeoutFirebase);
            }

            if (snapshot.empty && !initialized) {
                initialized = true;
                console.log("Banco de dados vazio no Firestore. Semeando dados iniciais...");
                await semearBancoDeDados();
                return;
            }

            produtosCache = [];
            snapshot.forEach((doc) => {
                produtosCache.push(doc.data());
            });

            produtosCache.sort((a, b) => a.id - b.id);

            // Espelha no localStorage para que, se cair a conexão depois, tenhamos os dados atualizados do servidor
            localStorage.setItem('bodega_produtos', JSON.stringify(produtosCache));

            initialized = true;
            resolveInitPromise(produtosCache);

            if (onProdutosAtualizadosCallback) {
                onProdutosAtualizadosCallback(produtosCache);
            }
        }, (error) => {
            console.error("Erro no listener em tempo real do Firestore:", error);
            ativarModoLocal("Erro retornado pelo listener do Firestore: " + error.message);
        });
    } catch (err) {
        console.error("Erro ao configurar Firebase:", err);
        ativarModoLocal("Exceção ao configurar Firebase: " + err.message);
    }
} else {
    console.error("Firebase SDK não carregado! Verifique as referências do CDN no HTML.");
    ativarModoLocal("Firebase SDK não carregado (bloqueado pelo Brave Shields/Adblocker).");
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
        ativarModoLocal("Erro ao semear banco de dados no Firestore.");
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
 * Adiciona um novo produto.
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

    if (modoLocal) {
        produtosCache.push(novoProduto);
        produtosCache.sort((a, b) => a.id - b.id);
        localStorage.setItem('bodega_produtos', JSON.stringify(produtosCache));
        if (onProdutosAtualizadosCallback) {
            onProdutosAtualizadosCallback(produtosCache);
        }
        return;
    }

    try {
        await db.collection("produtos").doc(id.toString()).set(novoProduto);
    } catch (e) {
        console.error("Erro ao adicionar no Firestore. Mudando para modo local e tentando novamente...", e);
        ativarModoLocal("Erro ao adicionar produto: " + e.message);
        await adicionarProduto(dados);
    }
}

/**
 * Edita um produto existente pelo ID.
 * @param {number} id
 * @param {Object} dados — campos a atualizar
 */
async function editarProduto(id, dados) {
    if (modoLocal) {
        const index = produtosCache.findIndex(p => p.id === id);
        if (index !== -1) {
            const current = produtosCache[index];
            if (dados.nome !== undefined) current.nome = dados.nome;
            if (dados.preco !== undefined) current.preco = parseFloat(dados.preco);
            if (dados.estoque !== undefined) {
                current.estoque = parseInt(dados.estoque);
                current.status = parseInt(dados.estoque) > 0 ? 'Disponível' : 'Esgotado';
            }
            if (dados.categoria !== undefined) current.categoria = dados.categoria;
            if (dados.imagem !== undefined) current.imagem = dados.imagem;
            
            localStorage.setItem('bodega_produtos', JSON.stringify(produtosCache));
            if (onProdutosAtualizadosCallback) {
                onProdutosAtualizadosCallback(produtosCache);
            }
        }
        return;
    }

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
        console.error("Erro ao editar no Firestore. Mudando para modo local e tentando novamente...", e);
        ativarModoLocal("Erro ao editar produto: " + e.message);
        await editarProduto(id, dados);
    }
}

/**
 * Deleta um produto pelo ID.
 * @param {number} id
 */
async function deletarProduto(id) {
    if (modoLocal) {
        produtosCache = produtosCache.filter(p => p.id !== id);
        localStorage.setItem('bodega_produtos', JSON.stringify(produtosCache));
        if (onProdutosAtualizadosCallback) {
            onProdutosAtualizadosCallback(produtosCache);
        }
        return;
    }

    try {
        await db.collection("produtos").doc(id.toString()).delete();
    } catch (e) {
        console.error("Erro ao deletar no Firestore. Mudando para modo local e tentando novamente...", e);
        ativarModoLocal("Erro ao deletar produto: " + e.message);
        await deletarProduto(id);
    }
}

/**
 * Alterna o status do produto entre Disponível e Esgotado.
 * Se ficar Disponível com estoque 0, define estoque = 10.
 * @param {number} id
 */
async function alternarStatus(id) {
    if (modoLocal) {
        const index = produtosCache.findIndex(p => p.id === id);
        if (index !== -1) {
            const current = produtosCache[index];
            const novoStatus = current.status === 'Disponível' ? 'Esgotado' : 'Disponível';
            let novoEstoque = current.estoque;
            if (novoStatus === 'Disponível' && current.estoque === 0) {
                novoEstoque = 10;
            }
            current.status = novoStatus;
            current.estoque = novoEstoque;
            localStorage.setItem('bodega_produtos', JSON.stringify(produtosCache));
            if (onProdutosAtualizadosCallback) {
                onProdutosAtualizadosCallback(produtosCache);
            }
        }
        return;
    }

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
        console.error("Erro ao alternar status no Firestore. Mudando para modo local e tentando novamente...", e);
        ativarModoLocal("Erro ao alternar status: " + e.message);
        await alternarStatus(id);
    }
}
