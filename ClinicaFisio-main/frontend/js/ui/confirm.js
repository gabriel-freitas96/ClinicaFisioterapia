function confirmar({
    titulo = 'Confirmar',
    mensagem = '',
    textoConfirmar = 'Confirmar',
    textoCancelar = 'Cancelar',
    perigo = false
} = {}) {
    return new Promise(resolve => {
        const elemento = document.createElement('div');

        elemento.className = 'modal fade';
        elemento.tabIndex = -1;

        elemento.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${esc(titulo)}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                    </div>
                    <div class="modal-body">${esc(mensagem)}</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">${esc(textoCancelar)}</button>
                        <button type="button" class="btn ${perigo ? 'btn-danger' : 'btn-primary'}" data-acao="confirmar">${esc(textoConfirmar)}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(elemento);

        const modal = new bootstrap.Modal(elemento);
        let resultado = false;

        elemento
            .querySelector('[data-acao="confirmar"]')
            .addEventListener('click', () => {
                resultado = true;
                modal.hide();
            });

        elemento.addEventListener('hidden.bs.modal', () => {
            modal.dispose();
            elemento.remove();
            resolve(resultado);
        });

        modal.show();
    });
}