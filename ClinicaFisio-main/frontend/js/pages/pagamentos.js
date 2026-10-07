function openPaymentModal() {
 
    if (!state.patients.length) {
 
        return toast(
            'Cadastre um paciente primeiro.',
            'warning'
        );
    }
 
    fillPatientSelect(
        'paymentPatient'
    );
 
    const modal =
        document.getElementById(
            'paymentModal'
        );
 
    if (modal) {
        new bootstrap.Modal(modal).show();
    }
}
 
async function savePayment() {
 
    const form =
        document.getElementById(
            'paymentForm'
        );
 
    if (!form) {
        return;
    }
 
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
 
    const pagamentoDB =
        await apiFetch(
            '/pagamentos',
            'POST',
            {
                pacienteId:
                    document.getElementById(
                        'paymentPatient'
                    ).value,
 
                descricao:
                    document.getElementById(
                        'paymentDescription'
                    ).value.trim(),
 
                valor:
                    Number(
                        document.getElementById(
                            'paymentValue'
                        ).value
                    ),
 
                metodo:
                    document.getElementById(
                        'paymentMethod'
                    ).value,
 
                data: today()
            }
        );
 
    if (!pagamentoDB) {
 
        return toast(
            ultimoErroApi ||
            'Erro ao registrar pagamento.',
            'danger'
        );
    }
 
    state.payments.unshift(
        mapPagamento(
            pagamentoDB.pagamento ||
            pagamentoDB
        )
    );
 
    bootstrap.Modal
        .getInstance(
            document.getElementById(
                'paymentModal'
            )
        )
        ?.hide();
 
    form.reset();
 
    renderPage();
 
    toast(
        'Pagamento registrado.',
        'success'
    );
}
 
async function togglePayment(id) {
 
    const payment =
        state.payments.find(
            item => String(item.id) === String(id)
        );
 
    if (!payment) {
        return;
    }
 
    const novoStatus =
        payment.status === 'Pago'
            ? 'Pendente'
            : 'Pago';
 
    const atualizado =
        await apiFetch(
            `/pagamentos/${id}`,
            'PUT',
            {
                status: novoStatus
            }
        );
 
    if (!atualizado) {
 
        return toast(
            ultimoErroApi ||
            'Erro ao atualizar o pagamento.',
            'danger'
        );
    }
 
    const pagamentoAtualizado =
        atualizado.pagamento ||
        atualizado;
 
    payment.status =
        pagamentoAtualizado.status ||
        novoStatus;
 
    renderPage();
 
    toast(
        'Status do pagamento atualizado.',
        'success'
    );
}
 
let paymentFilter = 'todos';
 
function setPaymentFilter(filtro) {
    paymentFilter = filtro;
    renderPage();
}
 
function payments() {
 
    const lista =
        [...state.payments].sort(
            (a, b) => String(b.data).localeCompare(String(a.data))
        );
 
    const pagos = lista.filter(item => item.status === 'Pago');
    const pendentes = lista.filter(item => item.status === 'Pendente');
 
    const visiveis =
        paymentFilter === 'pagos'
            ? pagos
            : paymentFilter === 'pendentes'
                ? pendentes
                : lista;
 
    const abas = [
        ['todos', 'Todos', lista.length],
        ['pendentes', 'Pendentes', pendentes.length],
        ['pagos', 'Pagos', pagos.length]
    ];
 
    const linhas = visiveis.map(payment => `
        <tr>
            <td>${formatData(payment.data)}</td>
 
            <td>
                <div class="cell-person">
                    <span class="patient-avatar">${esc(iniciais(patientName(payment.pacienteId)))}</span>
                    <span>${esc(patientName(payment.pacienteId))}</span>
                </div>
            </td>
 
            <td class="cell-desc">${esc(payment.description) || '—'}</td>
 
            <td>${esc(payment.method) || '—'}</td>
 
            <td class="amount">${money(payment.value)}</td>
 
            <td>${statusBadge(payment.status)}</td>
 
            <td class="text-end">
                ${payment.status === 'Pago'
                    ? `<button class="btn btn-sm btn-light"
                               onclick="togglePayment('${esc(payment.id)}')">
                           Marcar como pendente
                       </button>`
                    : `<button class="btn btn-sm btn-outline-primary"
                               onclick="togglePayment('${esc(payment.id)}')">
                           Marcar como pago
                       </button>`}
            </td>
        </tr>
    `).join('');
 
    const vazio = state.payments.length
        ? 'Nenhum pagamento nesta categoria.'
        : 'Nenhum pagamento registrado ainda. Use “Novo pagamento” para começar.';
 
    return `
        <div class="page-toolbar">
            <p>Controle os valores recebidos e a receber.</p>
 
            <button class="btn btn-primary" onclick="openPaymentModal()">
                <i class="bi bi-plus-lg me-2"></i>Novo pagamento
            </button>
        </div>
 
        ${summaryStrip([
            {
                label: 'Total registrado',
                value: money(sumPayments()),
                hint: plural(lista.length, 'pagamento', 'pagamentos')
            },
            {
                label: 'Recebido',
                value: money(sumPayments('Pago')),
                hint: plural(pagos.length, 'pagamento pago', 'pagamentos pagos')
            },
            {
                label: 'A receber',
                value: money(sumPayments('Pendente')),
                hint: plural(pendentes.length, 'pagamento pendente', 'pagamentos pendentes'),
                warning: pendentes.length > 0
            }
        ])}
 
        <section class="table-card">
 
            <div class="table-toolbar">
                <div class="filter-tabs">
                    ${abas.map(([chave, rotulo, quantidade]) => `
                        <button type="button"
                                class="filter-tab ${paymentFilter === chave ? 'active' : ''}"
                                onclick="setPaymentFilter('${chave}')">
                            ${rotulo}<span>${quantidade}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
 
            <div class="table-responsive">
                <table class="table table-clean align-middle">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Paciente</th>
                            <th>Descrição</th>
                            <th>Método</th>
                            <th class="text-end">Valor</th>
                            <th>Status</th>
                            <th class="text-end">Ação</th>
                        </tr>
                    </thead>
 
                    <tbody>
                        ${linhas || `
                            <tr>
                                <td colspan="7" class="text-center text-muted py-4">
                                    ${vazio}
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
 
        </section>
    `;
}
 
function userPayments() {
 
    const patient =
        state.patients.find(
            item =>
                String(item.id) ===
                String(state.currentPacienteId)
        ) ||
        state.patients[0];
 
    if (!patient) {
 
        return `
            <div class="alert alert-warning">
                Nenhum paciente cadastrado.
            </div>
        `;
    }
 
    const list =
        state.payments.filter(
            payment =>
                String(
                    payment.pacienteId
                ) ===
                String(
                    patient.id
                )
        );
 
    return `
 
        <div class="panel">
 
            <h5>
                Meus pagamentos
            </h5>
 
            <p class="text-muted small">
                Consulte valores e situação das cobranças.
            </p>
 
 
            <div class="table-responsive">
 
                <table class="table">
 
                    <thead>
 
                        <tr>
 
                            <th>Data</th>
 
                            <th>Descrição</th>
 
                            <th>Valor</th>
 
                            <th>Método</th>
 
                            <th>Status</th>
 
                        </tr>
 
                    </thead>
 
 
                    <tbody>
 
                        ${
                            list.length
                                ? list
                                    .map(
                                        payment => `
 
                                            <tr>
 
                                                <td>
                                                    ${formatData(
                                                        payment.data
                                                    )}
                                                </td>
 
                                                <td>
                                                    ${esc(
                                                        payment.description
                                                    )}
                                                </td>
 
                                                <td>
                                                    ${money(
                                                        payment.value
                                                    )}
                                                </td>
 
                                                <td>
                                                    ${esc(
                                                        payment.method
                                                    )}
                                                </td>
 
                                                <td>
                                                    ${statusBadge(
                                                        payment.status
                                                    )}
                                                </td>
 
                                            </tr>
 
                                        `
                                    )
                                    .join('')
                                : `
 
                                    <tr>
 
                                        <td
                                            colspan="5"
                                            class="text-center text-muted">
 
                                            Nenhum pagamento registrado.
 
                                        </td>
 
                                    </tr>
 
                                `
                        }
 
                    </tbody>
 
                </table>
 
            </div>
 
        </div>
 
    `;
}