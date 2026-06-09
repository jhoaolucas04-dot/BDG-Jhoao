/**
 * dados.js — Camada de Dados com Supabase
 * Todos os dados são salvos e lidos do Supabase,
 * ficando disponíveis para todos os usuários.
 */

const SUPABASE_URL = 'https://oinyeirkekaqwxiiqdqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbnllaXJrZWthcXd4aWlxZHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3ODI2NzAsImV4cCI6MjA5NjM1ODY3MH0.ufQpR1UliXY736BQPXPMHQUXDwHT2VKiC0CXEQqqPZA';
const API = SUPABASE_URL + '/rest/v1/produtos';

const HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json'
};

// Cache local para uso síncrono (getProdutos)
var _cache = [];

/**
 * Carrega todos os produtos do Supabase.
 * @returns {Promise<Array>}
 */
async function carregarProdutos() {
    try {
        const resp = await fetch(API + '?order=id.asc', { headers: HEADERS });
        if (!resp.ok) throw new Error('Erro ao buscar produtos');
        _cache = await resp.json();
        return _cache;
    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
        _cache = [];
        return [];
    }
}

/**
 * Retorna o cache local (síncrono).
 * Sempre chame carregarProdutos() antes.
 * @returns {Array}
 */
function getProdutos() {
    return _cache;
}

/**
 * Adiciona um novo produto no Supabase.
 * @param {Object} dados — { nome, preco, estoque, categoria, imagem }
 * @returns {Promise<Array>} Lista atualizada
 */
async function adicionarProduto(dados) {
    const novoProduto = {
        nome: dados.nome,
        preco: parseFloat(dados.preco),
        estoque: parseInt(dados.estoque),
        categoria: dados.categoria,
        imagem: dados.imagem || '',
        status: parseInt(dados.estoque) > 0 ? 'Disponível' : 'Esgotado'
    };

    try {
        const resp = await fetch(API, {
            method: 'POST',
            headers: { ...HEADERS, 'Prefer': 'return=representation' },
            body: JSON.stringify(novoProduto)
        });
        if (!resp.ok) {
            const errBody = await resp.text();
            console.error('Supabase erro:', resp.status, errBody);
            throw new Error('Erro ao adicionar produto');
        }
        await carregarProdutos();
        return _cache;
    } catch (erro) {
        console.error('Erro ao adicionar produto:', erro);
        return _cache;
    }
}

/**
 * Edita um produto existente pelo ID.
 * @param {number} id
 * @param {Object} dados — campos a atualizar
 * @returns {Promise<Array>} Lista atualizada
 */
async function editarProduto(id, dados) {
    const atualizacao = {
        nome: dados.nome,
        preco: dados.preco !== undefined ? parseFloat(dados.preco) : undefined,
        estoque: dados.estoque !== undefined ? parseInt(dados.estoque) : undefined,
        categoria: dados.categoria,
        imagem: dados.imagem !== undefined ? dados.imagem : undefined,
    };

    // Recalcula status com base no estoque
    if (atualizacao.estoque !== undefined) {
        atualizacao.status = atualizacao.estoque > 0 ? 'Disponível' : 'Esgotado';
    }

    // Remove campos undefined
    Object.keys(atualizacao).forEach(k => atualizacao[k] === undefined && delete atualizacao[k]);

    try {
        const resp = await fetch(API + '?id=eq.' + id, {
            method: 'PATCH',
            headers: { ...HEADERS, 'Prefer': 'return=representation' },
            body: JSON.stringify(atualizacao)
        });
        if (!resp.ok) throw new Error('Erro ao editar produto');
        await carregarProdutos();
        return _cache;
    } catch (erro) {
        console.error('Erro ao editar produto:', erro);
        return _cache;
    }
}

/**
 * Deleta um produto pelo ID.
 * @param {number} id
 * @returns {Promise<Array>} Lista atualizada
 */
async function deletarProduto(id) {
    try {
        const resp = await fetch(API + '?id=eq.' + id, {
            method: 'DELETE',
            headers: HEADERS
        });
        if (!resp.ok) throw new Error('Erro ao deletar produto');
        await carregarProdutos();
        return _cache;
    } catch (erro) {
        console.error('Erro ao deletar produto:', erro);
        return _cache;
    }
}

/**
 * Alterna o status do produto entre Disponível e Esgotado.
 * @param {number} id
 * @returns {Promise<Array>} Lista atualizada
 */
async function alternarStatus(id) {
    const produto = _cache.find(p => p.id === id);
    if (!produto) return _cache;

    const novoStatus = produto.status === 'Disponível' ? 'Esgotado' : 'Disponível';
    const novoEstoque = novoStatus === 'Disponível' && produto.estoque === 0 ? 10 : produto.estoque;

    try {
        const resp = await fetch(API + '?id=eq.' + id, {
            method: 'PATCH',
            headers: { ...HEADERS, 'Prefer': 'return=representation' },
            body: JSON.stringify({ status: novoStatus, estoque: novoEstoque })
        });
        if (!resp.ok) throw new Error('Erro ao alternar status');
        await carregarProdutos();
        return _cache;
    } catch (erro) {
        console.error('Erro ao alternar status:', erro);
        return _cache;
    }
}

/**
 * Salva lista inteira (compatibilidade). Não usado no Supabase.
 */
function salvarProdutos(lista) {
    console.warn('salvarProdutos() não é usado com Supabase. Use adicionarProduto/editarProduto/deletarProduto.');
}

/**
 * Registra um callback que é chamado sempre que os dados mudam.
 * Faz polling a cada 10 segundos para sincronizar com outros usuários.
 * @param {Function} callback
 */
var _pollingTimer = null;
function registrarListenerProdutos(callback) {
    // Cancela polling anterior se existir
    if (_pollingTimer) clearInterval(_pollingTimer);

    // Chama o callback imediatamente (dados já carregados)
    callback();

    // Polling a cada *10 minutos
    _pollingTimer = setInterval(function() {
        carregarProdutos().then(function() {
            callback();
        });
    }, 600000);
}