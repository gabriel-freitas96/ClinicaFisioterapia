function formatDate(date) {
    if (!date) {
        return '-';
    }
 
    const data = new Date(`${date}T00:00:00`);
 
    if (Number.isNaN(data.getTime())) {
        return '-';
    }
 
    return data.toLocaleDateString('pt-BR');
}
 
/* As páginas (agenda, avaliações, pagamentos, pacientes) chamam formatData. */
function formatData(date) {
    return formatDate(date);
}
 
 
function money(value) {
    const numero = Number(value) || 0;
 
    return numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}
 
 
function today() {
    const data = new Date();
 
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
 
    return `${ano}-${mes}-${dia}`;
}
 
 
function formatPhone(value) {
    if (!value) {
        return '';
    }
 
    const numeros = String(value)
        .replace(/\D/g, '')
        .slice(0, 11);
 
    if (numeros.length <= 10) {
        return numeros.replace(
            /^(\d{2})(\d{4})(\d{0,4})$/,
            '($1) $2-$3'
        );
    }
 
    return numeros.replace(
        /^(\d{2})(\d{5})(\d{0,4})$/,
        '($1) $2-$3'
    );
}
 
 
function fotoUrl(caminho) {
    if (!caminho) {
        return '';
    }
 
    return /^(https?:|data:)/.test(caminho)
        ? caminho
        : `${API_ORIGIN}${caminho}`;
}
 
 
function previewImage(input, target) {
    const box = document.getElementById(target);
 
    if (!box || !input?.files?.[0]) {
        return;
    }
 
    const arquivo = input.files[0];
 
    if (!arquivo.type.startsWith('image/')) {
        toast('Selecione um arquivo de imagem válido.', 'danger');
        input.value = '';
        return;
    }
 
    const reader = new FileReader();
 
    reader.onload = event => {
        box.innerHTML = `
            <img src="${event.target.result}" alt="Pré-visualização"
                 style="max-width:100%; max-height:160px; border-radius:10px;">
        `;
    };
 
    reader.readAsDataURL(arquivo);
}
 