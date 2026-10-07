function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar) {
        return;
    }

    sidebar.classList.toggle('open');

    if (overlay) {
        overlay.classList.toggle('show');
    }
}


function activateMenu() {
    document
        .querySelectorAll('.menu-link[data-page]')
        .forEach(btn => {

            btn.classList.toggle(
                'active',
                btn.dataset.page === state.page
            );

            btn.onclick = () => {

                state.page = btn.dataset.page;

                activateMenu();
                renderPage();

                if (window.innerWidth < 992) {
                    toggleSidebar();
                }
            };
        });
}