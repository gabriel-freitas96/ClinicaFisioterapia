const MOTIVO_PADRAO = 'Acompanhamento fisioterapêutico';

function limpar(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
}

function telefoneValido(telefone) {
    if (telefone === '') {
        return true;
    }

    return telefone.length <= 20 && /^\d{10,11}$/.test(telefone.replace(/\D/g, ''));
}

function validarDadosPaciente(corpo) {
    const nome = limpar(corpo.nome);
    const telefone = limpar(corpo.telefone);
    const motivoConsulta = limpar(corpo.motivoConsulta) || MOTIVO_PADRAO;

    if (!nome) {
        return { erro: 'Informe o nome.' };
    }

    if (nome.length > 100) {
        return { erro: 'O nome pode ter no máximo 100 caracteres.' };
    }

    if (!telefoneValido(telefone)) {
        return { erro: 'Telefone inválido. Informe DDD e número, por exemplo (85) 99999-9999.' };
    }

    if (motivoConsulta.length > 200) {
        return { erro: 'O motivo da consulta pode ter no máximo 200 caracteres.' };
    }

    return { dados: { nome, telefone, motivoConsulta } };
}

function senhaForte(senha) {
    return (
        typeof senha === 'string' &&
        senha.length >= 8 &&
        senha.length <= 72 &&
        /[A-Za-z]/.test(senha) &&
        /\d/.test(senha)
    );
}

module.exports = { limpar, validarDadosPaciente, senhaForte };