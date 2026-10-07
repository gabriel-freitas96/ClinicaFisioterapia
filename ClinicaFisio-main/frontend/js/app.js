const state = {
    role: 'admin',
    page: 'dashboard',
    currentPacienteId: null,
    appointments: [],
    patients: [],
    assessments: [],
    payments: []
};
 
const PAGE_TITLES = {
    dashboard: 'Início',
    agenda: 'Agenda e consultas',
    pacientes: 'Pacientes',
    avaliacoes: 'Avaliações físicas',
    pagamentos: 'Pagamentos',
    relatorios: 'Relatórios',
    'meu-dashboard': 'Minha área',
    'minhas-consultas': 'Minhas consultas',
    'minhas-avaliacoes': 'Minhas avaliações',
    'meus-pagamentos': 'Meus pagamentos'
};
 
function getPageViews() {
    return {
        dashboard: adminDashboard,
        agenda,
        pacientes: patients,
        avaliacoes: assessments,
        pagamentos: payments,
        relatorios: reports,
        'meu-dashboard': userDashboard,
        'minhas-consultas': userAppointments,
        'minhas-avaliacoes': userAssessments,
        'meus-pagamentos': userPayments
    };
}
 
function renderPage() {
    const pageTitle = document.getElementById('pageTitle');
    const breadcrumb = document.getElementById('breadcrumb');
    const todayLabel = document.getElementById('todayData');
    const pageContent = document.getElementById('pageContent');
 
    if (pageTitle) {
        pageTitle.textContent = PAGE_TITLES[state.page] || 'Página';
    }
 
    if (breadcrumb) {
        breadcrumb.textContent =
            state.role === 'admin' ? 'Gestão da clínica' : 'Área do paciente';
    }
 
    if (todayLabel) {
        todayLabel.textContent = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }
 
    if (!pageContent) {
        return;
    }
 
    const view = getPageViews()[state.page];
 
    if (!view) {
        pageContent.innerHTML = `
            <div class="alert alert-danger">Página não encontrada.</div>
        `;
        return;
    }
 
    pageContent.innerHTML = view();
 
    if (typeof carregarFotosDasAvaliacoes === 'function') {
        carregarFotosDasAvaliacoes();
    }
}
 
function iniciais(nome) {
    return String(nome || '')
        .split(' ')
        .filter(Boolean)
        .map(parte => parte[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
 
async function abrirSistema() {
    const session = getSession();
 
    if (!session?.token) {
        return;
    }
 
    state.role = session.papel || session.role || 'user';
    state.currentPacienteId = session.pacienteId || null;
 
    const carregou = await loadData();
 
    if (!carregou) {
        return;
    }
 
    document.getElementById('loginScreen')?.classList.add('d-none');
    document.getElementById('app')?.classList.remove('d-none');
 
    document
        .getElementById('adminMenu')
        ?.classList.toggle('d-none', state.role !== 'admin');
 
    document
        .getElementById('userMenu')
        ?.classList.toggle('d-none', state.role !== 'user');
 
    const nome = session.nome || (state.role === 'admin' ? 'Joelma Negreiros' : 'Paciente');
 
    const profileName = document.getElementById('profileName');
    const profileRole = document.getElementById('profileRole');
    const profileAvatar = document.getElementById('profileAvatar');
    const topProfileAvatar = document.getElementById('topProfileAvatar');
 
    if (profileName) {
        profileName.textContent = nome;
    }
 
    if (profileRole) {
        profileRole.textContent =
            state.role === 'admin' ? 'Administrador' : 'Paciente';
    }
 
    if (profileAvatar) {
        profileAvatar.textContent = iniciais(nome);
    }
 
    if (topProfileAvatar) {
        topProfileAvatar.textContent = iniciais(nome);
    }
 
    state.page = state.role === 'admin' ? 'dashboard' : 'meu-dashboard';
 
    activateMenu();
    renderPage();
}
restaurarTema();
restaurarSessao();