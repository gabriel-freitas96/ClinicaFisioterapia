function toast(message, type = 'success') {

    const area =
        document.getElementById('toastArea');

    if (!area) {
        console.log(message);
        return;
    }

    const el =
        document.createElement('div');

    el.className =
        `toast align-items-center text-bg-${type} border-0`;

    el.innerHTML = `
        <div class="d-flex">

            <div class="toast-body">
                ${esc(message)}
            </div>

            <button
                type="button"
                class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast">
            </button>

        </div>
    `;

    area.appendChild(el);

    const t =
        new bootstrap.Toast(
            el,
            {
                delay: 2800
            }
        );

    t.show();

    el.addEventListener(
        'hidden.bs.toast',
        () => el.remove()
    );
}