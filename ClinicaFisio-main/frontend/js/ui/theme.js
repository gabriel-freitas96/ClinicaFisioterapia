function toggleTheme() {
    const body = document.body;

    if (!body) {
        return;
    }

    body.classList.toggle('dark-mode');

    const temaEscuro =
        body.classList.contains('dark-mode');

    localStorage.setItem(
        'jf_theme',
        temaEscuro ? 'dark' : 'light'
    );
}


function restaurarTema() {
    const tema = localStorage.getItem('jf_theme');

    if (tema === 'dark') {
        document.body.classList.add('dark-mode');
    }
}