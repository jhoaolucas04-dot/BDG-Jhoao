/**
 * dados.js — Camada de Dados Compartilhada
 *
 * Usa localStorage como "banco de dados" do navegador.
 * Na primeira visita, carrega os dados iniciais de produtos.json via fetch().
 * Todas as modificações são salvas no localStorage e ficam disponíveis
 * tanto para o admin quanto para a vitrine.
 */

const STORAGE_KEY = 'bodega_produtos';

/**
 * Carrega os produtos: do localStorage se já existir,
 * senão busca do arquivo produtos.json (primeira vez).
 * @returns {Promise<Array>} Lista de produtos
 */
async function carregarProdutos() {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
        return JSON.parse(salvo);
    }

    // Primeira vez — carregar do JSON
    try {
        const resp = await fetch('produtos.json');
        if (!resp.ok) throw new Error('Falha ao buscar produtos.json');
        const data = await resp.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
    } catch (erro) {
        console.error('Erro ao carregar produtos.json:', erro);
        return [];
    }
}

/**
 * Retorna a lista de produtos do localStorage (síncrono).
 * @returns {Array} Lista de produtos
 */
function getProdutos() {
    const salvo = localStorage.getItem(STORAGE_KEY);
    return salvo ? JSON.parse(salvo) : [];
}

/**
 * Salva a lista inteira no localStorage.
 * @param {Array} lista
 */
function salvarProdutos(lista) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

/**
 * Adiciona um novo produto.
 * @param {Object} dados — { nome, preco, estoque, categoria, imagem }
 * @returns {Array} Lista atualizada
 */
function adicionarProduto(dados) {
    const lista = getProdutos();
    const novoProduto = {
        id: Date.now(),
        nome: dados.nome,
        preco: parseFloat(dados.preco),
        estoque: parseInt(dados.estoque),
        categoria: dados.categoria,
        imagem: dados.imagem || '',
        status: parseInt(dados.estoque) > 0 ? 'Disponível' : 'Esgotado'
    };
    lista.push(novoProduto);
    salvarProdutos(lista);
    return lista;
}

/**
 * Edita um produto existente pelo ID.
 * @param {number} id
 * @param {Object} dados — campos a atualizar
 * @returns {Array} Lista atualizada
 */
function editarProduto(id, dados) {
    const lista = getProdutos();
    const idx = lista.findIndex(p => p.id == id);
    if (idx !== -1) {
        lista[idx].nome = dados.nome ?? lista[idx].nome;
        lista[idx].preco = dados.preco !== undefined ? parseFloat(dados.preco) : lista[idx].preco;
        lista[idx].estoque = dados.estoque !== undefined ? parseInt(dados.estoque) : lista[idx].estoque;
        lista[idx].categoria = dados.categoria ?? lista[idx].categoria;
        lista[idx].imagem = dados.imagem !== undefined ? dados.imagem : lista[idx].imagem;
        lista[idx].status = lista[idx].estoque > 0 ? 'Disponível' : 'Esgotado';
        salvarProdutos(lista);
    }
    return lista;
}

/**
 * Deleta um produto pelo ID.
 * @param {number} id
 * @returns {Array} Lista atualizada
 */
function deletarProduto(id) {
    let lista = getProdutos();
    lista = lista.filter(p => p.id !== id);
    salvarProdutos(lista);
    return lista;
}

/**
 * Alterna o status do produto entre Disponível e Esgotado.
 * Se ficar Disponível com estoque 0, define estoque = 10.
 * @param {number} id
 * @returns {Array} Lista atualizada
 */
function alternarStatus(id) {
    const lista = getProdutos();
    const p = lista.find(prod => prod.id === id);
    if (p) {
        p.status = p.status === 'Disponível' ? 'Esgotado' : 'Disponível';
        if (p.status === 'Disponível' && p.estoque === 0) {
            p.estoque = 10;
        }
        salvarProdutos(lista);
    }
    return lista;
}
