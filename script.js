// Recupera o histórico do localStorage. Se não tiver nada salvo, cria um array vazio.
let listaDeTransacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

// Pegando os elementos do HTML que vou precisar manipular
const botao = document.querySelector("#btn-adicionar");
const inputDescricao = document.querySelector("#descricao");
const inputValor = document.querySelector("#valor");
const selectTipo = document.querySelector("#tipo-transacao");

// Elementos onde mostro os valores na tela
const elementoReceitas = document.querySelector("#dinheiro-entrou");
const elementoDespesas = document.querySelector("#dinheiro-saiu");
const elementoTotal = document.querySelector("#valor-total");

// Formatador para deixar o valor bonitinho em Euros
const formatador = new Intl.NumberFormat('pt-Pt', {
    style: 'currency',
    currency: 'EUR'
});

// Evento de clique no botão principal
botao.addEventListener("click", function () {
    const texto = inputDescricao.value;
    const valor = inputValor.value;

    // Validação básica: não deixa salvar se tiver campo vazio
    if (texto === "" || valor === "") {
        alert("Preencha todos os campos!");
        return;
    }

    let valorFinal = Number(valor);
    const tipo = selectTipo.value;

    // Se for despesa, transformo em negativo para facilitar a conta do saldo depois
    if (tipo === "saida") {
        valorFinal = valorFinal * -1;
    }

    // Objeto da transação com ID baseado no tempo (gera um número único)
    const novaTransacao = {
        id: Date.now(),
        descricao: texto,
        valor: Number(valorFinal)
    };

    // Salva na lista e atualiza o armazenamento do navegador
    listaDeTransacoes.push(novaTransacao);
    localStorage.setItem("transacoes", JSON.stringify(listaDeTransacoes));

    console.log(listaDeTransacoes); // Só pra debugar se precisar

    // Limpa os inputs para a próxima digitação
    inputDescricao.value = "";
    inputValor.value = "";

    // Roda as funções que atualizam a tela
    atualizarTela();
    atualizarSaldo();
});


// Função que renderiza a lista (<li>) no HTML
function atualizarTela() {
    const listaHtml = document.querySelector("#lista-transacoes");

    // Zera a lista atual para não duplicar os itens quando recriar
    listaHtml.innerHTML = "";

    listaDeTransacoes.forEach(function (transacao) {
        const elementoLi = document.createElement("li");

        // Define a classe CSS dependendo se é lucro ou gasto
        const classeCSS = transacao.valor < 0 ? 'negativo' : 'positivo';

        elementoLi.innerHTML = `
            ${transacao.descricao} 
            <span class="${classeCSS}"> ${formatador.format(transacao.valor)}</span>
            <button onclick="removerTransacao(${transacao.id})">x</button>
        `;

        listaHtml.appendChild(elementoLi);
    });
}


// Função que calcula e mostra os totais no dashboard
function atualizarSaldo() {
    let receitas = 0;
    let despesas = 0;
    let total = 0;

    // Percorre tudo para somar receitas e despesas separadamente
    listaDeTransacoes.forEach(function (transacao) {
        total += transacao.valor;

        if (transacao.valor > 0) {
            receitas += transacao.valor;
        } else {
            despesas += transacao.valor;
        }
    });

    // Atualiza os textos na tela
    elementoReceitas.textContent = formatador.format(receitas);
    elementoDespesas.textContent = formatador.format(despesas);
    elementoTotal.textContent = formatador.format(total);

    // Remove as classes antigas para garantir que a cor do saldo fique certa
    elementoTotal.classList.remove("positivo", "negativo");

    if (total < 0) {
        elementoTotal.classList.add("negativo");
    } else {
        elementoTotal.classList.add("positivo");
    }
}

// Inicializa o cálculo assim que carrega
atualizarSaldo();


// Função para deletar um item específico pelo ID
function removerTransacao(idDoItem) {
    // Filtra a lista mantendo só o que for diferente do ID que eu quero apagar
    listaDeTransacoes = listaDeTransacoes.filter(function (transacao) {
        return transacao.id !== idDoItem;
    });

    // Atualiza o localStorage com a nova lista (agora sem o item deletado)
    localStorage.setItem("transacoes", JSON.stringify(listaDeTransacoes));

    atualizarTela();
    atualizarSaldo();
}

// Chama essas funções ao iniciar o script para carregar o que já estava salvo
atualizarTela();
atualizarSaldo();