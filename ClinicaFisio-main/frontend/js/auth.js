const SESSION_KEY = 'jf_session';

function getSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
        return null;
    }
}

function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
}

async function restaurarSessao() {

    const session = getSession();

    if (!session?.token) {
        return;
    }

    const me = await apiFetch('/auth/me');

    if (!me) {
        if (ultimoErroApi) {
            console.warn(ultimoErroApi);
        }

        return;
    }

    const usuario = me.usuario || me.user || me;

    setSession({
        ...session,
        papel:
            usuario.papel ||
            usuario.role ||
            me.papel ||
            session.papel ||
            'user',

        pacienteId:
            usuario.pacienteId ||
            me.pacienteId ||
            session.pacienteId ||
            null,

        nome:
            usuario.nome ||
            usuario.name ||
            me.nome ||
            session.nome ||
            'Usuário',

        email:
            usuario.email ||
            me.email ||
            session.email ||
            ''
    });

    await abrirSistema();
}


function logout() {

    clearSession();

    Object.assign(state, {
        role: 'admin',
        page: 'dashboard',
        currentPacienteId: null,
        appointments: [],
        patients: [],
        assessments: [],
        payments: []
    });

    document
        .getElementById('app')
        ?.classList.add('d-none');

    document
        .getElementById('loginScreen')
        ?.classList.remove('d-none');

    const senha =
        document.getElementById('loginPassword');

    if (senha) {
        senha.value = '';
    }
}

function sessaoExpirada(mensagem) {

    logout();

    toast(
        mensagem || 'Sessão expirada. Faça login novamente.',
        'warning'
    );
}

async function login() {
    const emailInput = document.getElementById('loginEmail');
    const senhaInput = document.getElementById('loginPassword');
    const botao = document.querySelector('.login-form button[type="submit"]');

    if (!emailInput || !senhaInput) {
        console.error('Campos de login não encontrados.');
        return;
    }

    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value;

    if (!email || !senha) {
        toast('Informe e-mail e senha.', 'warning');
        return;
    }

    if (botao) {
        botao.disabled = true;
        botao.textContent = 'Entrando...';
    }

    try {
        const resposta = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(dados.erro || dados.message || 'E-mail ou senha inválidos.');
        }

        if (!dados.token) {
            throw new Error('O servidor não retornou o token de acesso.');
        }

        const session = {
            token: dados.token,
            nome: dados.nome || 'Usuário',
            email,
            papel: dados.papel || 'user',
            pacienteId: dados.pacienteId || null
        };

        setSession(session);
        await abrirSistema();

        toast(`Bem-vindo, ${session.nome}!`, 'success');
    } catch (erro) {
        console.error('Erro no login:', erro);

        const semConexao = erro instanceof TypeError;

        toast(
            semConexao
                ? 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
                : erro.message || 'Erro ao realizar login.',
            'danger'
        );
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent = 'Entrar';
        }
    }
}

async function registerPatient() {
    const form = document.getElementById('registerForm');

    if (!form) {
        return;
    }

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const email = document
        .getElementById('registerEmail')
        .value
        .trim()
        .toLowerCase();

    const resposta = await apiFetch('/auth/registrar', 'POST', {
        nome: document.getElementById('registerName').value.trim(),
        telefone: document.getElementById('registerPhone').value.trim(),
        motivoConsulta:
            document.getElementById('registerGoal').value.trim() ||
            'Acompanhamento fisioterapêutico',
        email,
        senha: document.getElementById('registerPassword').value
    });

    if (!resposta) {
        return toast(ultimoErroApi || 'Erro ao criar a conta.', 'danger');
    }

    bootstrap.Modal
        .getInstance(document.getElementById('registerModal'))
        ?.hide();

    form.reset();

    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');

    if (loginEmail) {
        loginEmail.value = email;
    }

    if (loginPassword) {
        loginPassword.value = '';
        loginPassword.focus();
    }

    toast('Conta criada! Agora entre no sistema.', 'success');
}
function openRegisterModal() {

    const modal =
        document.getElementById(
            'registerModal'
        );

    if (modal) {
        new bootstrap.Modal(modal).show();
    }
}