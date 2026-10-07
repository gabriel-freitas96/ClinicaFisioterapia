function openAppointmentModal() {

    fillPatientSelect(
        'appointmentPatient'
    );

    const pSelect =
        document.getElementById(
            'appointmentPatient'
        );

    if (pSelect) {

        if (
            state.role === 'user' &&
            state.currentPacienteId
        ) {

            pSelect.value =
                state.currentPacienteId;

            pSelect.disabled = true;

        } else {

            pSelect.disabled = false;
        }
    }

    const data =
        document.getElementById(
            'appointmentData'
        );

    if (data) {
        data.value = today();
    }

    const modal =
        document.getElementById(
            'appointmentModal'
        );

    if (modal) {
        new bootstrap.Modal(modal).show();
    }
}
async function saveAppointment() {
    const form = document.getElementById('appointmentForm');
    if (!form) return;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const patientSelect = document.getElementById('appointmentPatient');
    
    let pacienteId =
        state.role === 'user' && state.currentPacienteId
            ? state.currentPacienteId
            : patientSelect.value;

    const pacienteEncontrado = state.patients.find(p => p.nome === pacienteId || p.name === pacienteId);
    if (pacienteEncontrado) {
        pacienteId = pacienteEncontrado._id || pacienteEncontrado.id;
    }

    if (!pacienteId || pacienteId === 'undefined' || pacienteId === 'null') {
        return toast('Erro: O ID do paciente não foi reconhecido.', 'danger');
    }

    const consultaDB = await apiFetch(
        '/consultas',
        'POST',
        {
            pacienteId: pacienteId,
            tipo: document.getElementById('appointmentType').value,
            data: document.getElementById('appointmentData').value,
            horario: document.getElementById('appointmentHorario').value,
            observacao: document.getElementById('appointmentNote').value
        }
    );

    if (!consultaDB) {
        return toast(
            ultimoErroApi || 'Falha ao registrar consulta.',
            'danger'
        );
    }

    state.appointments.push(
        mapConsulta(consultaDB.consulta || consultaDB)
    );

    const modalElement = document.getElementById('appointmentModal');
    bootstrap.Modal.getInstance(modalElement)?.hide();

    if (document.activeElement) document.activeElement.blur();

    form.reset();

    if (patientSelect) {
        patientSelect.disabled = false;
    }

    renderPage();

    toast('Consulta agendada com sucesso.', 'success');
}
async function changeAppointmentStatus(
    id,
    newStatus
) {

    const appointment =
        state.appointments.find(
            item => String(item.id) === String(id)
        );

    if (!appointment) {
        return;
    }

    const atualizado =
        await apiFetch(
            `/consultas/${id}`,
            'PUT',
            {
                status: newStatus
            }
        );

    if (!atualizado) {

        toast(
            ultimoErroApi ||
            'Erro ao atualizar o status.',
            'danger'
        );

        filterAgenda();

        return;
    }

    const consultaAtualizada =
        atualizado.consulta ||
        atualizado;

    appointment.status =
        consultaAtualizada.status ||
        newStatus;

    toast(
        'Status atualizado com sucesso.',
        'success'
    );

    filterAgenda();
}

async function deleteAppointment(id) {

    if (state.role !== 'admin') {
        return;
    }

    const appointment =
        state.appointments.find(
            item => String(item.id) === String(id)
        );

    if (!appointment) {
        return;
    }

    const confirmado = await confirmar({
        titulo: 'Excluir consulta',
        mensagem:
            `Deseja excluir a consulta de ` +
            `${patientName(appointment.pacienteId)} ` +
            `em ${formatData(appointment.data)} ` +
            `às ${appointment.horario}?`,
        textoConfirmar: 'Excluir',
        perigo: true
    });

    if (!confirmado) {
        return;
    }

    const removida =
        await apiFetch(
            `/consultas/${id}`,
            'DELETE'
        );

    if (!removida) {

        return toast(
            ultimoErroApi ||
            'Erro ao excluir consulta.',
            'danger'
        );
    }

    state.appointments =
        state.appointments.filter(
            item => String(item.id) !== String(id)
        );

    renderPage();

    toast(
        'Consulta excluída com sucesso.',
        'success'
    );
}

function statusBadge(status) {

    const className =
        status === 'Confirmada' ||
        status === 'Pago'

            ? 'badge-confirmed'

            : status === 'Cancelada'

                ? 'badge-cancelled'

                : 'badge-pending';

    return `
        <span class="badge-soft ${className}">
            ${esc(status)}
        </span>
    `;
}

function filterAgenda() {

    const search =
        (
            document.getElementById(
                'agendaSearch'
            )?.value || ''
        ).toLowerCase();

    const data =
        document.getElementById(
            'agendaData'
        )?.value || '';

    const status =
        document.getElementById(
            'agendaStatus'
        )?.value || '';

    const filteredList =
        state.appointments.filter(
            app =>

                (
                    !search ||
                    patientName(
                        app.pacienteId
                    )
                        .toLowerCase()
                        .includes(search)
                )

                &&

                (
                    !data ||
                    app.data === data
                )

                &&

                (
                    !status ||
                    app.status === status
                )
        );

    const results =
        document.getElementById(
            'agendaResults'
        );

    if (results) {
        results.innerHTML =
            agendaTable(filteredList);
    }
}

function appointmentList(list) {

    if (!list.length) {

        return `

            <div class="empty-state">

                <i class="bi bi-calendar-x d-block mb-2"></i>

                Nenhuma consulta encontrada.

            </div>

        `;
    }

    return list
        .map(appointment => {

            const initials =
                patientName(
                    appointment.pacienteId
                )
                    .split(' ')
                    .filter(Boolean)
                    .map(
                        name => name[0]
                    )
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

            return `

                <div class="appointment-row">

                    <div class="time-box">
                        ${esc(appointment.horario)}
                    </div>

                    <div class="patient-avatar">
                        ${esc(initials)}
                    </div>

                    <div class="flex-grow-1">

                        <strong>
                            ${esc(
                                patientName(
                                    appointment.pacienteId
                                )
                            )}
                        </strong>

                        <div class="text-muted small">

                            ${formatData(
                                appointment.data
                            )}

                            ·

                            ${esc(
                                appointment.type
                            )}

                            ${
                                appointment.note
                                    ? ` · ${esc(appointment.note)}`
                                    : ''
                            }

                        </div>

                    </div>

                    ${statusBadge(
                        appointment.status
                    )}

                </div>

            `;
        })
        .join('');
}

function agenda() {

    return `

        <div class="table-card">

            <div class="row g-2 mb-3">

                <div class="col-md-5">

                    <input
                        id="agendaSearch"
                        class="form-control"
                        placeholder="Pesquisar paciente"
                        oninput="filterAgenda()">

                </div>


                <div class="col-md-3">

                    <input
                        id="agendaData"
                        type="data"
                        class="form-control"
                        onchange="filterAgenda()">

                </div>


                <div class="col-md-2">

                    <select
                        id="agendaStatus"
                        class="form-select"
                        onchange="filterAgenda()">

                        <option value="">
                            Todos
                        </option>

                        <option value="Confirmada">
                            Confirmada
                        </option>

                        <option value="Pendente">
                            Pendente
                        </option>

                        <option value="Cancelada">
                            Cancelada
                        </option>

                    </select>

                </div>


                <div class="col-md-2">

                    <button
                        class="btn btn-primary w-100"
                        onclick="openAppointmentModal()">

                        Agendar

                    </button>

                </div>

            </div>


            <div id="agendaResults">

                ${agendaTable(
                    state.appointments
                )}

            </div>

        </div>

    `;
}

function agendaTable(list) {

    if (!list.length) {

        return `

            <div class="empty-state">

                <i class="bi bi-calendar2-x d-block mb-2"></i>

                Nenhum agendamento para os filtros selecionados.

            </div>

        `;
    }

    const sortedList =
        [...list].sort(
            (a, b) =>
                (
                    a.data + a.horario
                ).localeCompare(
                    b.data + b.horario
                )
        );

    return `

        <div class="table-responsive">

            <table class="table align-middle">

                <thead>

                    <tr>

                        <th>Data</th>

                        <th>Horário</th>

                        <th>Paciente</th>

                        <th>Atendimento</th>

                        <th>Status</th>

                        <th>Ação</th>

                    </tr>

                </thead>


                <tbody>

                    ${sortedList
                        .map(
                            appointment => `

                                <tr>

                                    <td>
                                        ${formatData(
                                            appointment.data
                                        )}
                                    </td>

                                    <td>
                                        <strong>
                                            ${esc(
                                                appointment.horario
                                            )}
                                        </strong>
                                    </td>

                                    <td>
                                        ${esc(
                                            patientName(
                                                appointment.pacienteId
                                            )
                                        )}
                                    </td>

                                    <td>
                                        ${esc(
                                            appointment.type
                                        )}
                                    </td>

                                    <td>
                                        ${statusBadge(
                                            appointment.status
                                        )}
                                    </td>

                                    <td>

                                        <select
                                            class="form-select form-select-sm"
                                            onchange="changeAppointmentStatus('${esc(appointment.id)}', this.value)">

                                            <option
                                                value="Confirmada"
                                                ${
                                                    appointment.status === 'Confirmada'
                                                        ? 'selected'
                                                        : ''
                                                }>
                                                Confirmada
                                            </option>

                                            <option
                                                value="Pendente"
                                                ${
                                                    appointment.status === 'Pendente'
                                                        ? 'selected'
                                                        : ''
                                                }>
                                                Pendente
                                            </option>

                                            <option
                                                value="Cancelada"
                                                ${
                                                    appointment.status === 'Cancelada'
                                                        ? 'selected'
                                                        : ''
                                                }>
                                                Cancelada
                                            </option>

                                        </select>

                                        ${
                                            state.role === 'admin'
                                                ? `
                                                    <button
                                                        class="btn btn-sm btn-outline-danger"
                                                        onclick="deleteAppointment('${esc(appointment.id)}')">
                                                        Excluir
                                                    </button>
                                                `
                                                : ''
                                        }

                                    </td>

                                </tr>

                            `
                        )
                        .join('')}

                </tbody>

            </table>

        </div>

    `;
}

function userAppointments() {

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
        state.appointments.filter(
            appointment =>
                String(
                    appointment.pacienteId
                ) ===
                String(
                    patient.id
                )
        );

    return `

        <div class="panel">

            <div class="d-flex justify-content-between align-items-center mb-3">

                <div>

                    <h5 class="mb-1">
                        Minhas consultas
                    </h5>

                    <p class="text-muted small mb-0">
                        Histórico e próximos atendimentos.
                    </p>

                </div>


                <button
                    class="btn btn-primary"
                    onclick="openAppointmentModal()">

                    Agendar consulta

                </button>

            </div>


            ${
                list.length
                    ? `

                        <div class="table-responsive">

                            <table class="table">

                                <thead>

                                    <tr>

                                        <th>Data</th>

                                        <th>Horário</th>

                                        <th>Atendimento</th>

                                        <th>Status</th>

                                        <th>Observação</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    ${[...list]
                                        .sort(
                                            (a, b) =>
                                                (
                                                    b.data +
                                                    b.horario
                                                ).localeCompare(
                                                    a.data +
                                                    a.horario
                                                )
                                        )
                                        .map(
                                            appointment => `

                                                <tr>

                                                    <td>
                                                        ${formatData(
                                                            appointment.data
                                                        )}
                                                    </td>

                                                    <td>
                                                        ${esc(
                                                            appointment.horario
                                                        )}
                                                    </td>

                                                    <td>
                                                        ${esc(
                                                            appointment.type
                                                        )}
                                                    </td>

                                                    <td>
                                                        ${statusBadge(
                                                            appointment.status
                                                        )}
                                                    </td>

                                                    <td>
                                                        ${esc(
                                                            appointment.note ||
                                                            '—'
                                                        )}
                                                    </td>

                                                </tr>

                                            `
                                        )
                                        .join('')}

                                </tbody>

                            </table>

                        </div>

                    `
                    : `

                        <div class="empty-state">
                            Nenhuma consulta registrada.
                        </div>

                    `
            }

        </div>

    `;
}