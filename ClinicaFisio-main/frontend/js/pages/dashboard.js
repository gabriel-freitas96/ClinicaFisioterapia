function goTo(page) {
    state.page = page;
    activateMenu();
    renderPage();
    window.scrollTo({ top: 0 });
}
 
function pct(part, total) {
    return total ? Math.round((part * 100) / total) : 0;
}
 
function plural(quantidade, singular, varios) {
    return `${quantidade} ${quantidade === 1 ? singular : varios}`;
}
 
function sumPayments(status) {
    return state.payments
        .filter(item => !status || item.status === status)
        .reduce((sum, item) => sum + Number(item.value || 0), 0);
}
 
function saudacao() {
    const hora = new Date().getHours();
 
    if (hora < 12) {
        return 'Bom dia';
    }
 
    return hora < 18 ? 'Boa tarde' : 'Boa noite';
}
 
function patientsWithoutAssessment() {
    return state.patients.filter(patient =>
        !state.assessments.some(
            assessment =>
                String(assessment.pacienteId) === String(patient.id)
        )
    );
}
 
/* Faixa com os números principais da tela. */
function summaryStrip(items) {
    return `
        <div class="summary-strip">
            ${items.map(item => `
                <div class="summary-item ${item.warning ? 'is-warning' : ''}">
                    <div class="summary-label">${esc(item.label)}</div>
                    <div class="summary-value">${esc(item.value)}</div>
                    <div class="summary-hint">${esc(item.hint || '')}</div>
                </div>
            `).join('')}
        </div>
    `;
}
 
/* Barra única dividida em partes (confirmadas/pendentes/canceladas etc.). */
function stackBar(segments, label) {
    const total = segments.reduce((sum, item) => sum + item.valor, 0);
 
    const partes = total
        ? segments
            .filter(item => item.valor > 0)
            .map(item => `
                <span class="status-${item.classe}"
                      style="width: ${(item.valor * 100) / total}%"></span>
            `)
            .join('')
        : '';
 
    return `
        <div class="stack-bar" role="img" aria-label="${esc(label)}">
            ${partes}
        </div>
    `;
}
 
function legendRow(classe, rotulo, valor, percentual) {
    return `
        <div class="legend-row">
            <span class="status-dot status-${classe}"></span>
            <span class="legend-label">${esc(rotulo)}</span>
            <strong class="legend-value">${esc(valor)}</strong>
            <span class="legend-percent">${percentual}%</span>
        </div>
    `;
}
 
function coverageBar(percentual) {
    return `
        <div class="progress"
             role="progressbar"
             aria-label="Cobertura de avaliações"
             aria-valuenow="${percentual}"
             aria-valuemin="0"
             aria-valuemax="100">
            <div class="progress-bar" style="width: ${percentual}%"></div>
        </div>
    `;
}
 
 
/* ====================== INÍCIO (administrador) ====================== */
 
function adminDashboard() {
 
    const hoje = today();
 
    const session =
        typeof getSession === 'function'
            ? getSession()
            : null;
 
    const primeiroNome =
        String(session?.nome || 'Administrador').split(' ')[0];
 
    const dataLonga =
        new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long'
        });
 
    const porHorario = (a, b) =>
        `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`);
 
    const consultasHoje =
        state.appointments
            .filter(item => item.data === hoje && item.status !== 'Cancelada')
            .sort(porHorario);
 
    const confirmadasHoje =
        consultasHoje.filter(item => item.status === 'Confirmada').length;
 
    const proximas =
        state.appointments
            .filter(item => item.data > hoje && item.status !== 'Cancelada')
            .sort(porHorario)
            .slice(0, 5);
 
    const aguardandoConfirmacao =
        state.appointments.filter(
            item => item.data >= hoje && item.status === 'Pendente'
        ).length;
 
    const recebido = sumPayments('Pago');
    const aReceber = sumPayments('Pendente');
 
    const pagamentosPendentes =
        state.payments.filter(item => item.status === 'Pendente').length;
 
    const semAvaliacao = patientsWithoutAssessment();
    const comAvaliacao = state.patients.length - semAvaliacao.length;
    const cobertura = pct(comAvaliacao, state.patients.length);
 
    const atencao = [];
 
    if (aguardandoConfirmacao) {
        atencao.push({
            icone: 'bi-clock-history',
            titulo: plural(aguardandoConfirmacao, 'consulta para confirmar', 'consultas para confirmar'),
            detalhe: 'De hoje em diante',
            pagina: 'agenda'
        });
    }
 
    if (aReceber > 0) {
        atencao.push({
            icone: 'bi-wallet2',
            titulo: `${money(aReceber)} a receber`,
            detalhe: plural(pagamentosPendentes, 'pagamento pendente', 'pagamentos pendentes'),
            pagina: 'pagamentos'
        });
    }
 
    if (semAvaliacao.length) {
        const nomes = semAvaliacao.slice(0, 2).map(item => item.name).join(', ');
        const restante = semAvaliacao.length - 2;
 
        atencao.push({
            icone: 'bi-clipboard2-pulse',
            titulo: plural(semAvaliacao.length, 'paciente sem avaliação', 'pacientes sem avaliação'),
            detalhe: restante > 0 ? `${nomes} e mais ${restante}` : nomes,
            pagina: 'avaliacoes'
        });
    }
 
    return `
        <header class="dashboard-header">
            <div>
                <div class="dashboard-date">${esc(dataLonga)}</div>
                <h1>${saudacao()}, ${esc(primeiroNome)}</h1>
            </div>
 
            <button class="btn btn-primary" onclick="openAppointmentModal()">
                <i class="bi bi-plus-lg me-2"></i>Nova consulta
            </button>
        </header>
 
        ${summaryStrip([
            {
                label: 'Consultas hoje',
                value: consultasHoje.length,
                hint: plural(confirmadasHoje, 'confirmada', 'confirmadas')
            },
            {
                label: 'Pacientes',
                value: state.patients.length,
                hint: `${comAvaliacao} com avaliação`
            },
            {
                label: 'Recebido',
                value: money(recebido),
                hint: `de ${money(recebido + aReceber)} registrados`
            },
            {
                label: 'A receber',
                value: money(aReceber),
                hint: plural(pagamentosPendentes, 'pagamento pendente', 'pagamentos pendentes'),
                warning: aReceber > 0
            }
        ])}
 
        <div class="dashboard-grid">
 
            <div class="dashboard-stack">
 
                <section class="panel">
                    <div class="panel-head">
                        <div>
                            <h3>Agenda de hoje</h3>
                            <p>${plural(consultasHoje.length, 'atendimento', 'atendimentos')}</p>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="goTo('agenda')">
                            Ver agenda
                        </button>
                    </div>
 
                    ${
                        consultasHoje.length
                            ? `<div class="dashboard-today-list">
                                   ${consultasHoje.map(item => dashboardAppointmentItem(item)).join('')}
                               </div>`
                            : `<div class="empty-inline">
                                   <i class="bi bi-calendar-check"></i>
                                   <div>
                                       <strong>Nada marcado para hoje</strong>
                                       <span>Use “Nova consulta” para agendar um atendimento.</span>
                                   </div>
                               </div>`
                    }
                </section>
 
                <section class="panel">
                    <div class="panel-head">
                        <div>
                            <h3>Próximos dias</h3>
                            <p>Atendimentos já agendados</p>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="goTo('agenda')">
                            Ver todos
                        </button>
                    </div>
 
                    ${
                        proximas.length
                            ? `<div class="dashboard-today-list">
                                   ${proximas.map(item => dashboardAppointmentItem(item, true)).join('')}
                               </div>`
                            : `<div class="empty-inline">
                                   <i class="bi bi-calendar2"></i>
                                   <div>
                                       <strong>Nenhum atendimento futuro</strong>
                                       <span>Quando houver novas consultas, elas aparecem aqui.</span>
                                   </div>
                               </div>`
                    }
                </section>
 
            </div>
 
            <div class="dashboard-stack">
 
                <section class="panel">
                    <div class="panel-head">
                        <div>
                            <h3>Precisa de atenção</h3>
                            <p>O que está esperando por você</p>
                        </div>
                    </div>
 
                    ${
                        atencao.length
                            ? `<div class="attention-list">
                                   ${atencao.map(item => `
                                       <button type="button"
                                               class="attention-item"
                                               onclick="goTo('${item.pagina}')">
                                           <span class="attention-icon"><i class="bi ${item.icone}"></i></span>
                                           <span class="attention-text">
                                               <strong>${esc(item.titulo)}</strong>
                                               <span>${esc(item.detalhe)}</span>
                                           </span>
                                           <i class="bi bi-chevron-right attention-arrow"></i>
                                       </button>
                                   `).join('')}
                               </div>`
                            : `<div class="empty-inline">
                                   <i class="bi bi-check2-circle"></i>
                                   <div>
                                       <strong>Tudo em dia</strong>
                                       <span>Nenhuma pendência no momento.</span>
                                   </div>
                               </div>`
                    }
                </section>
 
                <section class="panel">
                    <div class="panel-head">
                        <div>
                            <h3>Avaliações físicas</h3>
                            <p>Pacientes com avaliação registrada</p>
                        </div>
                        <strong class="panel-figure">${cobertura}%</strong>
                    </div>
 
                    ${coverageBar(cobertura)}
 
                    <p class="panel-note">
                        ${comAvaliacao} de ${plural(state.patients.length, 'paciente', 'pacientes')}
                    </p>
                </section>
 
            </div>
 
        </div>
    `;
}
 
function dashboardAppointmentItem(appointment, showDate = false) {
 
    const patient =
        state.patients.find(
            item => String(item.id) === String(appointment.pacienteId)
        );
 
    const nome =
        patient?.name ||
        patient?.nome ||
        'Paciente não identificado';
 
    return `
        <div class="dashboard-appointment-item">
 
            <div class="appointment-time">
                <strong>${esc(appointment.horario || '--:--')}</strong>
                ${showDate
                    ? `<span>${esc(formatDate(appointment.data).slice(0, 5))}</span>`
                    : ''}
            </div>
 
            <div class="appointment-patient">
                <div class="patient-avatar">${esc(iniciais(nome))}</div>
 
                <div class="appointment-info">
                    <strong>${esc(nome)}</strong>
                    <span>${esc(appointment.tipo || appointment.type || 'Consulta')}</span>
                </div>
            </div>
 
            ${statusBadge(appointment.status)}
 
        </div>
    `;
}
 
 
/* ============================ RELATÓRIOS ============================ */
 
function reports() {
 
    const total = state.appointments.length;
 
    const contar = status =>
        state.appointments.filter(item => item.status === status).length;
 
    const confirmadas = contar('Confirmada');
    const pendentes = contar('Pendente');
    const canceladas = contar('Cancelada');
 
    const recebido = sumPayments('Pago');
    const aReceber = sumPayments('Pendente');
    const totalFinanceiro = recebido + aReceber;
 
    const semAvaliacao = patientsWithoutAssessment();
    const comAvaliacao = state.patients.length - semAvaliacao.length;
    const cobertura = pct(comAvaliacao, state.patients.length);
 
    const situacao = [
        { classe: 'confirmed', rotulo: 'Confirmadas', valor: confirmadas },
        { classe: 'pending', rotulo: 'Pendentes', valor: pendentes },
        { classe: 'cancelled', rotulo: 'Canceladas', valor: canceladas }
    ];
 
    const financeiro = [
        { classe: 'confirmed', rotulo: 'Recebido', valor: recebido },
        { classe: 'pending', rotulo: 'A receber', valor: aReceber }
    ];
 
    const limite = 8;
 
    return `
        <header class="dashboard-header">
            <div>
                <h1>Visão geral da clínica</h1>
                <p>Consultas, finanças e avaliações em um só lugar.</p>
            </div>
        </header>
 
        ${summaryStrip([
            {
                label: 'Total de consultas',
                value: total,
                hint: `${pendentes} aguardando confirmação`
            },
            {
                label: 'Confirmadas',
                value: confirmadas,
                hint: `${pct(confirmadas, total)}% do total`
            },
            {
                label: 'Pacientes',
                value: state.patients.length,
                hint: `${comAvaliacao} com avaliação`
            },
            {
                label: 'Receita recebida',
                value: money(recebido),
                hint: `${pct(recebido, totalFinanceiro)}% do valor registrado`
            }
        ])}
 
        <div class="report-grid">
 
            <section class="panel">
                <div class="panel-head">
                    <div>
                        <h3>Consultas por situação</h3>
                        <p>${plural(total, 'consulta registrada', 'consultas registradas')}</p>
                    </div>
                </div>
 
                ${stackBar(situacao, 'Distribuição das consultas por situação')}
 
                ${situacao.map(item =>
                    legendRow(item.classe, item.rotulo, item.valor, pct(item.valor, total))
                ).join('')}
 
                ${total ? '' : '<p class="panel-note">Nenhuma consulta registrada ainda.</p>'}
            </section>
 
            <section class="panel">
                <div class="panel-head">
                    <div>
                        <h3>Financeiro</h3>
                        <p>Valores recebidos e a receber</p>
                    </div>
                </div>
 
                ${stackBar(financeiro, 'Distribuição entre recebido e a receber')}
 
                ${financeiro.map(item =>
                    legendRow(item.classe, item.rotulo, money(item.valor), pct(item.valor, totalFinanceiro))
                ).join('')}
 
                <div class="legend-row is-total">
                    <span class="status-dot is-blank"></span>
                    <span class="legend-label">Total registrado</span>
                    <strong class="legend-value">${money(totalFinanceiro)}</strong>
                    <span class="legend-percent"></span>
                </div>
            </section>
 
        </div>
 
        <section class="panel">
            <div class="panel-head">
                <div>
                    <h3>Cobertura de avaliações</h3>
                    <p>Pacientes com avaliação registrada</p>
                </div>
                <strong class="panel-figure">${cobertura}%</strong>
            </div>
 
            ${coverageBar(cobertura)}
 
            <p class="panel-note">
                ${comAvaliacao} de ${plural(state.patients.length, 'paciente', 'pacientes')}
            </p>
 
            ${
                semAvaliacao.length
                    ? `<div class="pending-patients">
                           <div class="pending-patients-title">Ainda sem avaliação</div>
 
                           <div class="pending-patients-list">
                               ${semAvaliacao.slice(0, limite).map(item => `
                                   <span class="person-chip">
                                       <span class="patient-avatar">${esc(iniciais(item.name))}</span>
                                       ${esc(item.name)}
                                   </span>
                               `).join('')}
 
                               ${semAvaliacao.length > limite
                                   ? `<span class="person-chip">+${semAvaliacao.length - limite}</span>`
                                   : ''}
                           </div>
 
                           <button class="btn btn-sm btn-outline-primary" onclick="goTo('avaliacoes')">
                               Registrar avaliação
                           </button>
                       </div>`
                    : ''
            }
        </section>
    `;
}
 
 
function userDashboard() {
    const patient =
        state.patients.find(
            item =>
                String(item.id) ===
                String(state.currentPatientId)
        ) ||
        state.patients[0];
 
 
    if (!patient) {
 
        return `
 
            <div class="alert alert-warning">
 
                <i class="bi bi-exclamation-triangle me-2"></i>
 
                Nenhum paciente cadastrado.
 
            </div>
 
        `;
    }
    const next =
        state.appointments
            .filter(
                appointment =>
                    String(
                        appointment.pacienteId
                    ) ===
                    String(
                        patient.id
                    ) &&
                    new Date(`${appointment.data}T${appointment.horario || '00:00'}:00`) >= new Date() &&
                    appointment.status !== 'Cancelada'
            )
            .sort(
                (a, b) =>
                    (
                        `${a.data}${a.horario}`
                    ).localeCompare(
                        `${b.data}${b.horario}`
                    )
            )[0];
            const agora = new Date();

    const consultasDeHoje =
        state.appointments
            .filter(
                appointment =>
                    String(appointment.pacienteId) === String(patient.id) &&
                    appointment.data === today() &&
                    appointment.status !== 'Cancelada'
            )
            .sort((a, b) => String(a.horario).localeCompare(String(b.horario)));

    const lembreteHoje = consultasDeHoje.length
        ? `
            <div class="reminder-today mb-4">
                <div class="reminder-today-title">
                    <i class="bi bi-bell-fill"></i>
                    <strong>
                        ${consultasDeHoje.length === 1
                            ? 'Você tem 1 consulta hoje'
                            : `Você tem ${consultasDeHoje.length} consultas hoje`}
                    </strong>
                </div>

                ${consultasDeHoje.map(item => {
                    const passou =
                        new Date(`${item.data}T${item.horario || '23:59'}:00`) < agora;

                    return `
                        <div class="reminder-today-item">
                            <span class="reminder-today-time">${esc(item.horario || '--:--')}</span>
                            <span class="reminder-today-type">
                                ${esc(item.tipo || item.type || 'Consulta')}
                                ${passou ? '<small class="text-muted">· horário já passou</small>' : ''}
                            </span>
                            ${statusBadge(item.status)}
                        </div>
                    `;
                }).join('')}
            </div>
        `
        : '';
    const last =
        state.assessments
            .filter(
                assessment =>
                    String(
                        assessment.pacienteId
                    ) ===
                    String(
                        patient.id
                    )
            )
            .sort(
                (a, b) =>
                    String(
                        b.data || ''
                    ).localeCompare(
                        String(
                            a.data || ''
                        )
                    )
            )[0];
 
 
    const patientAppointments =
        state.appointments.filter(
            appointment =>
                String(
                    appointment.pacienteId
                ) ===
                String(
                    patient.id
                )
        );
 
 
    const patientAssessments =
        state.assessments.filter(
            assessment =>
                String(
                    assessment.pacienteId
                ) ===
                String(
                    patient.id
                )
        );
 
 
    return `
 
        <div class="dashboard-header mb-4">
 
            <div>
 
                <div class="text-muted small mb-1">
                    Área do paciente
                </div>
 
                <h1 class="mb-1">
                    Olá, ${esc(
                        patient.name ||
                        patient.nome ||
                        'Paciente'
                    )}.
                </h1>
 
                <p class="text-muted mb-0">
                    Acompanhe suas consultas e avaliações.
                </p>
 
            </div>
 
        </div>
 
 
 
        <!-- INDICADORES -->
 
        <div class="row g-3 mb-4">
 
 
            <div class="col-md-4">
 
                <div class="stat-card">
 
                    <div class="stat-icon">
 
                        <i class="bi bi-calendar-check"></i>
 
                    </div>
 
                    <div>
 
                        <div class="stat-value">
                            ${patientAppointments.length}
                        </div>
 
                        <div class="stat-label">
                            Consultas registradas
                        </div>
 
                    </div>
 
                </div>
 
            </div>
 
 
 
            <div class="col-md-4">
 
                <div class="stat-card">
 
                    <div class="stat-icon">
 
                        <i class="bi bi-file-medical"></i>
 
                    </div>
 
                    <div>
 
                        <div class="stat-value">
                            ${patientAssessments.length}
                        </div>
 
                        <div class="stat-label">
                            Avaliações físicas
                        </div>
 
                    </div>
 
                </div>
 
            </div>
 
 
 
            <div class="col-md-4">
 
                <div class="stat-card">
 
                    <div class="stat-icon">
 
                        <i class="bi bi-heart-pulse"></i>
 
                    </div>
 
                    <div>
 
                        <div class="stat-value">
 
                            ${esc(
                                last?.dor ??
                                last?.pain ??
                                '—'
                            )}
 
                        </div>
 
                        <div class="stat-label">
                            Dor na última avaliação
                        </div>
 
                    </div>
 
                </div>
 
            </div>
 
        </div>
 
 
 
        <!-- PRÓXIMA CONSULTA -->
 
        <div class="section-title">
            Próxima consulta
        </div>
 
 
        <div class="panel mb-4">
 
            ${
                next
 
                    ? `
 
                        <div class="d-flex flex-wrap align-items-center gap-3">
 
                            <div class="patient-avatar">
 
                                <i class="bi bi-calendar2-check"></i>
 
                            </div>
 
 
                            <div class="flex-grow-1">
 
                                <strong>
 
                                    ${formatDate(
                                        next.data
                                    )}
 
                                    às
 
                                    ${esc(
                                        next.horario
                                    )}
 
                                </strong>
 
 
                                <div class="text-muted small">
 
                                    ${esc(
                                        next.tipo ||
                                        next.type ||
                                        'Consulta'
                                    )}
 
                                </div>
 
                            </div>
 
 
                            ${statusBadge(
                                next.status
                            )}
 
                        </div>
 
                    `
 
                    : `
 
                        <div class="empty-state py-3">
 
                            <i class="bi bi-calendar-x fs-2"></i>
 
                            <p class="mb-0 mt-2">
                                Nenhuma consulta futura agendada.
                            </p>
 
                        </div>
 
                    `
            }
 
        </div>
 
 
 
        <!-- ÚLTIMA ORIENTAÇÃO -->
 
        <div class="section-title">
            Última orientação
        </div>
 
 
        <div class="panel">
 
            <p class="mb-0">
 
                ${esc(
                    last?.observacao ||
                    last?.note ||
                    'Sua fisioterapeuta ainda não registrou uma observação.'
                )}
 
            </p>
 
        </div>
 
    `;
}