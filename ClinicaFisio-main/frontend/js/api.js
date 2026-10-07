const API_URL =
    window.APP_CONFIG?.API_URL ||
    (['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:5000/api'
        : '/api');

const API_ORIGIN = API_URL.replace(/\/api$/, '');

let ultimoErroApi = '';

function mapPaciente(p) {
    return {
        id: p._id || p.id,
        name: p.nome || p.name || '',
        phone: p.telefone || p.phone || '',
        goal: p.motivoConsulta || p.goal || ''
    };
}


function mapConsulta(c) {
    return {
        id: c._id || c.id,
        pacienteId: c.pacienteId || '',
        data: c.data || '',
        horario: c.horario || '',
        type: c.tipo || c.type || '',
        status: c.status || 'Pendente',
        note: c.observacao || c.note || ''
    };
}


function mapAvaliacao(a) {

    return {
        id: a._id || a.id,
        pacienteId: a.pacienteId || '',
        data: a.data || '',
        weight: a.peso ?? a.weight ?? '',
        height: a.altura ?? a.height ?? '',
        pain: a.dor ?? a.pain ?? '',
        mobility: a.mobilidade ?? a.mobility ?? '',
        note: a.observacao || a.note || '',
        before: a.fotoAntes
            ? `${API_URL}/avaliacoes/${a._id || a.id}/foto/antes`
            : '',
        after: a.fotoDepois
            ? `${API_URL}/avaliacoes/${a._id || a.id}/foto/depois`
            : ''
    };
}



function mapPagamento(p) {
    return {
        id: p._id || p.id,
        pacienteId: p.pacienteId || '',
        description:
            p.descricao ||
            p.description ||
            '',
        data:
            p.data ||
            '',
        value:
            p.valor ??
            p.value ??
            0,
        status:
            p.status ||
            'Pendente',
        method:
            p.metodo ||
            p.method ||
            ''
    };
}
async function apiFetch(endpoint, method = 'GET', body = null) {

    ultimoErroApi = '';
    try {
        const headers = {};
        const token = getSession()?.token;
        if (token) {

            headers.Authorization =
                `Bearer ${token}`;

        }


        const options = {
            method,
            headers
        };



        if (body instanceof FormData) {
            options.body = body;
        }

        else if (body !== null) {

            headers['Content-Type'] =
                'application/json';

            options.body =
                JSON.stringify(body);

        }



        const response = await fetch(
            `${API_URL}${endpoint}`,
            options
        );



        if (response.status === 204) {
            return true;
        }
        const data =
            await response
                .json()
                .catch(() => null);
        if (!response.ok) {
            ultimoErroApi =
                data?.erro ||
                data?.message ||
                `Erro ${response.status} ao falar com o servidor.`;
            if(response.status === 401 && token){
                sessaoExpirada(
                    ultimoErroApi
                );

            }
            return null;
        }
        return data ?? true;
    } catch (erro) {
        console.error(
            `Erro na API (${endpoint}):`,
            erro
        );
        ultimoErroApi =
            'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        return null;
    }
}




async function loadData(){
    const [
        pacientes,
        consultas,
        avaliacoes,
        pagamentos
    ] = await Promise.all([
        apiFetch('/pacientes'),
        apiFetch('/consultas'),
        apiFetch('/avaliacoes'),
        apiFetch('/pagamentos')
    ]);



    if(

        pacientes === null ||
        consultas === null ||
        avaliacoes === null ||
        pagamentos === null
    ){


        if(getSession()?.token){
            toast(
                ultimoErroApi ||
                'Erro ao carregar os dados.',
                'danger'
            );
        }
        return false;
    }
    state.patients =
        Array.isArray(pacientes)
        ? pacientes.map(mapPaciente)
        : [];
    state.appointments =
        Array.isArray(consultas)
        ? consultas.map(mapConsulta)
        : [];
    state.assessments =
        Array.isArray(avaliacoes)
        ? avaliacoes.map(mapAvaliacao)
        : [];
    state.payments =
        Array.isArray(pagamentos)
        ? pagamentos.map(mapPagamento)
        : [];
    return true;
}
async function carregarFotoAvaliacao(url){
    try{
        const token =
            getSession()?.token;
        if(!token){
            return null;
        }
        const response =
            await fetch(
                url,
                {
                    headers:{
                        Authorization:
                            `Bearer ${token}`
                    }

                }

            );



        if(!response.ok){
            console.error(
                'Erro ao carregar foto:',
                response.status
            );
            return null;
        }
        const blob =
            await response.blob();
        return URL.createObjectURL(blob);
    }catch(erro){
        console.error(
            'Erro ao carregar foto:',
            erro
        );
         return null;

    }

async function comBotaoOcupado(botao, textoOcupado, tarefa) {
    if (botao?.disabled) {
        return;
    }

    const textoOriginal = botao ? botao.textContent : '';

    if (botao) {
        botao.disabled = true;
        botao.textContent = textoOcupado;
    }

    try {
        return await tarefa();
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent = textoOriginal;
        }
    }
}   
}