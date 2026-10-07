function addPatient() {
    openPatientModal();
}

async function deletePatient(id) {

    if (state.role !== 'admin') {
        return;
    }

    const patient =
        state.patients.find(
            item => String(item.id) === String(id)
        );

    if (!patient) {
        return;
    }

    const confirmado = await confirmar({
        titulo: 'Excluir paciente',
        mensagem:
            `Deseja realmente excluir o paciente ${patient.name}? ` +
            'Consultas, avaliações e pagamentos dele também serão apagados.',
        textoConfirmar: 'Excluir',
        perigo: true
    });

    if (!confirmado) {
        return;
    }

    const resposta =
        await apiFetch(
            `/pacientes/${id}`,
            'DELETE'
        );

    if (!resposta) {

        return toast(
            ultimoErroApi ||
            'Erro ao excluir paciente.',
            'danger'
        );
    }

    state.patients =
        state.patients.filter(
            item => item.id !== id
        );

    state.appointments =
        state.appointments.filter(
            item => item.pacienteId !== id
        );

    state.assessments =
        state.assessments.filter(
            item => item.pacienteId !== id
        );

    state.payments =
        state.payments.filter(
            item => item.pacienteId !== id
        );

    renderPage();

    toast(
        'Paciente excluído com sucesso.',
        'success'
    );
}

function openPatientModal(id = '') {

    const form =
        document.getElementById('patientForm');

    if (form) {
        form.reset();
    }

    const patient = id
        ? state.patients.find(
            item => String(item.id) === String(id)
        )
        : null;

    const pacienteId =
        document.getElementById('pacienteId');

    const patientNameInput =
        document.getElementById('patientName');

    const patientPhone =
        document.getElementById('patientPhone');

    const patientGoal =
        document.getElementById('patientGoal');

    if (pacienteId) {
        pacienteId.value = patient?.id || '';
    }

    if (patientNameInput) {
        patientNameInput.value = patient?.name || '';
    }

    if (patientPhone) {
        patientPhone.value = patient?.phone || '';
    }

    if (patientGoal) {
        patientGoal.value = patient?.goal || '';
    }

    const title =
        document.getElementById('patientModalTitle');

    if (title) {
        title.textContent =
            patient
                ? 'Editar paciente'
                : 'Novo paciente';
    }

    const modal =
        document.getElementById('patientModal');

    if (modal) {
        new bootstrap.Modal(modal).show();
    }
}

async function savePatient() {

    const form =
        document.getElementById('patientForm');

    if (!form) {
        return;
    }

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id =
        document.getElementById('pacienteId').value;

    const dados = {

        nome:
            document
                .getElementById('patientName')
                .value
                .trim(),

        telefone:
            document
                .getElementById('patientPhone')
                .value
                .trim(),

        motivoConsulta:
            document
                .getElementById('patientGoal')
                .value
                .trim() ||
            'Acompanhamento fisioterapêutico'
    };

    const pacienteDB =
        await apiFetch(
            id
                ? `/pacientes/${id}`
                : '/pacientes',

            id
                ? 'PUT'
                : 'POST',

            dados
        );

    if (!pacienteDB) {

        return toast(
            ultimoErroApi ||
            'Falha ao salvar paciente.',
            'danger'
        );
    }

    const pacienteMapeado =
        mapPaciente(
            pacienteDB.paciente ||
            pacienteDB
        );

    if (id) {

        const index =
            state.patients.findIndex(
                item => String(item.id) === String(id)
            );

        if (index !== -1) {
            state.patients[index] =
                pacienteMapeado;
        }

        toast(
            'Paciente atualizado com sucesso.',
            'success'
        );

    } else {

        state.patients.push(
            pacienteMapeado
        );

        toast(
            'Paciente cadastrado com sucesso.',
            'success'
        );
    }

    bootstrap.Modal
        .getInstance(
            document.getElementById('patientModal')
        )
        ?.hide();

    form.reset();

    renderPage();
}

function patientName(id) {

    return state.patients.find(
        patient =>
            String(patient.id) === String(id)
    )?.name || 'Paciente';
}

function fillPatientSelect(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.innerHTML = '<option value="" disabled selected>Selecione um paciente</option>' +
        state.patients
            .map(
                patient => `
                    <option value="${patient._id || patient.id}">
                        ${esc(patient.name || patient.nome)}
                    </option>
                `
            )
            .join('');
}

function patients() {

    return `

        <div class="d-flex justify-content-between align-items-center mb-3">

            <p class="text-muted mb-0">
                Cadastro e acompanhamento básico dos pacientes.
            </p>

            <button
                class="btn btn-primary"
                onclick="addPatient()">

                Novo paciente

            </button>

        </div>


        <div class="table-card">

            <div class="table-responsive">

                <table class="table align-middle">

                    <thead>

                        <tr>

                            <th>Paciente</th>

                            <th>Telefone</th>

                            <th>Objetivo</th>

                            <th>Consultas</th>

                            <th>Última avaliação</th>

                            <th>Ações</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            state.patients.length
                                ? state.patients
                                    .map(patient => {

                                        const count =
                                            state.appointments.filter(
                                                appointment =>
                                                    String(
                                                        appointment.pacienteId
                                                    ) ===
                                                    String(
                                                        patient.id
                                                    )
                                            ).length;

                                        const lastAssessment =
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
                                                        b.data.localeCompare(
                                                            a.data
                                                        )
                                                )[0];

                                        return `

                                            <tr>

                                                <td>
                                                    <strong>
                                                        ${esc(
                                                            patient.name
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    ${esc(formatPhone(patient.phone))}
                                                </td>

                                                <td>
                                                    ${esc(
                                                        patient.goal
                                                    )}
                                                </td>

                                                <td>
                                                    ${count}
                                                </td>

                                                <td>
                                                    ${
                                                        lastAssessment
                                                            ? formatData(
                                                                lastAssessment.data
                                                            )
                                                            : 'Nenhuma'
                                                    }
                                                </td>

                                                <td>

                                                    <button
                                                        class="btn btn-sm btn-outline-primary"
                                                        onclick="openPatientModal('${esc(patient.id)}')">

                                                        Editar

                                                    </button>

                                                    <button
                                                        class="btn btn-sm btn-outline-danger"
                                                        onclick="deletePatient('${esc(patient.id)}')">

                                                        Excluir

                                                    </button>

                                                </td>

                                            </tr>

                                        `;
                                    })
                                    .join('')
                                : `
                                    <tr>
                                        <td
                                            colspan="6"
                                            class="text-center text-muted py-4">

                                            Nenhum paciente cadastrado.

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