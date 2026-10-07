function openAssessmentModal() {
    const form = document.getElementById('assessmentForm');

    if (form) {
        form.reset();
    }

    const id = document.getElementById('assessmentId');

    if (id) {
        id.value = '';
    }

    fillPatientSelect('assessmentPatient');

    const title = document.getElementById('assessmentModalTitle');

    if (title) {
        title.textContent = 'Nova avaliação física';
    }

    const button = document.getElementById('assessmentSaveButton');

    if (button) {
        button.textContent = 'Salvar avaliação';
    }

    const beforePreview = document.getElementById('beforePreview');
    const afterPreview = document.getElementById('afterPreview');

    if (beforePreview) {
        beforePreview.innerHTML =
            '<i class="bi bi-image"></i><span>Pré-visualização</span>';
    }

    if (afterPreview) {
        afterPreview.innerHTML =
            '<i class="bi bi-image"></i><span>Pré-visualização</span>';
    }

    const modal = document.getElementById('assessmentModal');

    if (modal) {
        bootstrap.Modal
            .getOrCreateInstance(modal)
            .show();
    }
}

function editAssessment(id) {
    const assessment = state.assessments.find(
        item => String(item.id) === String(id)
    );

    if (!assessment) {
        return toast(
            'Avaliação não encontrada.',
            'danger'
        );
    }

    fillPatientSelect('assessmentPatient');

    const assessmentId = document.getElementById('assessmentId');
    const patient = document.getElementById('assessmentPatient');
    const weight = document.getElementById('weight');
    const height = document.getElementById('height');
    const pain = document.getElementById('pain');
    const mobility = document.getElementById('mobility');
    const note = document.getElementById('assessmentNote');

    if (assessmentId) {
        assessmentId.value = assessment.id || '';
    }

    if (patient) {
        patient.value = assessment.pacienteId || '';
    }

    if (weight) {
        weight.value = assessment.weight || '';
    }

    if (height) {
        height.value = assessment.height || '';
    }

    if (pain) {
        pain.value = assessment.pain || '';
    }

    if (mobility) {
        mobility.value = assessment.mobility || '';
    }

    if (note) {
        note.value = assessment.note || '';
    }

    const beforePhoto = document.getElementById('beforePhoto');
    const afterPhoto = document.getElementById('afterPhoto');

    if (beforePhoto) {
        beforePhoto.value = '';
    }

    if (afterPhoto) {
        afterPhoto.value = '';
    }

    const title = document.getElementById('assessmentModalTitle');

    if (title) {
        title.textContent = 'Editar avaliação física';
    }

    const button = document.getElementById('assessmentSaveButton');

    if (button) {
        button.textContent = 'Salvar alterações';
    }

    const beforePreview = document.getElementById('beforePreview');
    const afterPreview = document.getElementById('afterPreview');

    if (beforePreview) {
        beforePreview.innerHTML = assessment.before
            ? `
                <img
                    src="${esc(assessment.before)}"
                    alt="Foto antes"
                    class="img-fluid rounded"
                >
            `
            : `
                <i class="bi bi-image"></i>
                <span>Sem foto</span>
            `;
    }

    if (afterPreview) {
        afterPreview.innerHTML = assessment.after
            ? `
                <img
                    src="${esc(assessment.after)}"
                    alt="Foto depois"
                    class="img-fluid rounded"
                >
            `
            : `
                <i class="bi bi-image"></i>
                <span>Sem foto</span>
            `;
    }

    const modal = document.getElementById('assessmentModal');

    if (modal) {
        bootstrap.Modal
            .getOrCreateInstance(modal)
            .show();
    }
}

async function saveAssessment() {
    const form = document.getElementById('assessmentForm');

    if (!form) {
        return;
    }

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('assessmentId')?.value?.trim();

    const dados = new FormData();

    dados.append(
        'pacienteId',
        document.getElementById('assessmentPatient')?.value || ''
    );

    dados.append(
        'data',
        today()
    );

    dados.append(
        'peso',
        document.getElementById('weight')?.value || ''
    );

    dados.append(
        'altura',
        document.getElementById('height')?.value || ''
    );

    dados.append(
        'dor',
        document.getElementById('pain')?.value || ''
    );

    dados.append(
        'mobilidade',
        document.getElementById('mobility')?.value || ''
    );

    dados.append(
        'observacao',
        document.getElementById('assessmentNote')?.value || ''
    );

    const antes =
        document.getElementById('beforePhoto')?.files?.[0];

    const depois =
        document.getElementById('afterPhoto')?.files?.[0];

    if (antes) {
        dados.append('fotoAntes', antes);
    }

    if (depois) {
        dados.append('fotoDepois', depois);
    }

    let avaliacaoDB;

    if (id) {
        avaliacaoDB = await apiFetch(
            `/avaliacoes/${encodeURIComponent(id)}`,
            'PUT',
            dados
        );
    } else {
        avaliacaoDB = await apiFetch(
            '/avaliacoes',
            'POST',
            dados
        );
    }

    if (!avaliacaoDB) {
        return toast(
            ultimoErroApi ||
            'Erro ao salvar avaliação.',
            'danger'
        );
    }

    const avaliacao = mapAvaliacao(
        avaliacaoDB.avaliacao ||
        avaliacaoDB
    );

    if (id) {
        const index = state.assessments.findIndex(
            item => String(item.id) === String(id)
        );

        if (index !== -1) {
            state.assessments[index] = avaliacao;
        } else {
            state.assessments.unshift(avaliacao);
        }
    } else {
        state.assessments.unshift(avaliacao);
    }

    const modalElement =
        document.getElementById('assessmentModal');

    if (modalElement) {
        bootstrap.Modal
            .getInstance(modalElement)
            ?.hide();
    }

    form.reset();

    const assessmentId =
        document.getElementById('assessmentId');

    if (assessmentId) {
        assessmentId.value = '';
    }

    const beforePreview =
        document.getElementById('beforePreview');

    const afterPreview =
        document.getElementById('afterPreview');

    if (beforePreview) {
        beforePreview.innerHTML =
            '<i class="bi bi-image"></i><span>Pré-visualização</span>';
    }

    if (afterPreview) {
        afterPreview.innerHTML =
            '<i class="bi bi-image"></i><span>Pré-visualização</span>';
    }

    const title =
        document.getElementById('assessmentModalTitle');

    if (title) {
        title.textContent = 'Nova avaliação física';
    }

    const button =
        document.getElementById('assessmentSaveButton');

    if (button) {
        button.textContent = 'Salvar avaliação';
    }

    renderPage();

    toast(
        id
            ? 'Avaliação atualizada com sucesso.'
            : 'Avaliação registrada e disponível na área do paciente.',
        'success'
    );
}

async function deleteAssessment(id) {
    if (!id) {
        return toast(
            'ID da avaliação não informado.',
            'danger'
        );
    }

    const assessment = state.assessments.find(
        item => String(item.id) === String(id)
    );

    if (!assessment) {
        return toast(
            'Avaliação não encontrada.',
            'danger'
        );
    }

    const nomePaciente = patientName(
        assessment.pacienteId
    );

    const confirmado = await confirmar({
        titulo: 'Excluir avaliação',
        mensagem: `Deseja realmente excluir a avaliação de ${nomePaciente}?`,
        textoConfirmar: 'Excluir',
        perigo: true
    });

    if (!confirmado) {
        return;
    }

    try {
        const resposta = await apiFetch(
            `/avaliacoes/${encodeURIComponent(id)}`,
            'DELETE'
        );

        if (!resposta) {
            return toast(
                ultimoErroApi ||
                'Não foi possível excluir a avaliação.',
                'danger'
            );
        }

        state.assessments =
            state.assessments.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );

        renderPage();

        toast(
            'Avaliação excluída com sucesso.',
            'success'
        );

    } catch (erro) {
        console.error(
            'Erro ao excluir avaliação:',
            erro
        );

        toast(
            'Erro ao excluir avaliação.',
            'danger'
        );
    }
}

function assessments() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <p class="text-muted mb-0">
                    Registre evolução, medidas, observações e fotos de antes e depois.
                </p>
            </div>

            <button
                class="btn btn-primary"
                onclick="openAssessmentModal()">
                Nova avaliação
            </button>
        </div>

        <div class="row g-3">
            ${
                state.assessments.length
                    ? state.assessments
                        .map(
                            assessment =>
                                assessmentCard(
                                    assessment,
                                    false
                                )
                        )
                        .join('')
                    : `
                        <div class="col-12">
                            <div class="panel empty-state">
                                <i class="bi bi-clipboard2-pulse d-block mb-2"></i>
                                <strong class="d-block mb-1">
                                    Nenhuma avaliação registrada
                                </strong>
                                <span>
                                    Use “Nova avaliação” para registrar a primeira.
                                </span>
                            </div>
                        </div>
                    `
            }
        </div>
    `;
}

function assessmentCard(
    assessment,
    user
) {
    return `
        <div class="col-xl-6">
            <div class="assessment-card">

                <div class="assessment-head">

                    <div>
                        <strong>
                            ${esc(
                                patientName(
                                    assessment.pacienteId
                                )
                            )}
                        </strong>

                        <div class="text-muted small">
                            ${formatData(
                                assessment.data
                            )}
                        </div>
                    </div>

                    ${
                        !user
                            ? `
                                <div class="d-flex align-items-center gap-2">

                                    <span class="badge-soft badge-confirmed">
                                        Evolução
                                    </span>

                                    <div class="dropdown">

                                        <button
                                            class="btn btn-sm btn-light"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                            title="Ações">

                                            <i class="bi bi-three-dots-vertical"></i>

                                        </button>

                                        <ul class="dropdown-menu dropdown-menu-end">

                                            <li>
                                                <button
                                                    class="dropdown-item"
                                                    type="button"
                                                    onclick="editAssessment('${esc(
                                                        assessment.id
                                                    )}')">

                                                    <i class="bi bi-pencil me-2"></i>
                                                    Editar

                                                </button>
                                            </li>

                                            <li>
                                                <button
                                                    class="dropdown-item text-danger"
                                                    type="button"
                                                    onclick="deleteAssessment('${esc(
                                                        assessment.id
                                                    )}')">

                                                    <i class="bi bi-trash me-2"></i>
                                                    Excluir

                                                </button>
                                            </li>

                                        </ul>

                                    </div>

                                </div>
                            `
                            : `
                                <span class="badge-soft badge-confirmed">
                                    Evolução
                                </span>
                            `
                    }

                </div>

                <div class="row g-0">

                    <div class="col-md-5">

                        <div class="photo-grid">

                            <div>

                                <small class="text-muted">
                                    Antes
                                </small>

                                <div class="photo-box">

                                    ${
                                        assessment.before
                                            ? `
                                                <img
                                                    src="${esc(
                                                        assessment.before
                                                    )}"
                                                    alt="Antes">
                                            `
                                            : `
                                                <i class="bi bi-image"></i>
                                            `
                                    }

                                </div>

                            </div>

                            <div>

                                <small class="text-muted">
                                    Depois
                                </small>

                                <div class="photo-box">

                                    ${
                                        assessment.after
                                            ? `
                                                <img
                                                    src="${esc(
                                                        assessment.after
                                                    )}"
                                                    alt="Depois">
                                            `
                                            : `
                                                <i class="bi bi-image"></i>
                                            `
                                    }

                                </div>

                            </div>

                        </div>

                    </div>

                    <div class="col-md-7 p-3">

                        <div class="row g-2 mb-3">

                            <div class="col-6">

                                <div class="metric">

                                    <small>
                                        Peso
                                    </small>

                                    <strong>
                                        ${
                                            assessment.weight
                                                ? `${esc(
                                                    assessment.weight
                                                )} kg`
                                                : '—'
                                        }
                                    </strong>

                                </div>

                            </div>

                            <div class="col-6">

                                <div class="metric">

                                    <small>
                                        Altura
                                    </small>

                                    <strong>
                                        ${
                                            assessment.height
                                                ? `${esc(
                                                    assessment.height
                                                )} cm`
                                                : '—'
                                        }
                                    </strong>

                                </div>

                            </div>

                            <div class="col-6">

                                <div class="metric">

                                    <small>
                                        Dor
                                    </small>

                                    <strong>
                                        ${esc(
                                            assessment.pain ||
                                            '—'
                                        )}
                                    </strong>

                                </div>

                            </div>

                            <div class="col-6">

                                <div class="metric">

                                    <small>
                                        Mobilidade
                                    </small>

                                    <strong>
                                        ${esc(
                                            assessment.mobility ||
                                            '—'
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </div>

                        <div>

                            <small class="text-muted">
                                Observações
                            </small>

                            <p class="mb-0 mt-1">
                                ${esc(
                                    assessment.note ||
                                    'Nenhuma observação.'
                                )}
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    `;
}

function userAssessments() {
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
            );

    return `
        <div class="mb-3">

            <p class="text-muted">
                Aqui aparecem suas avaliações e observações liberadas pela clínica.
            </p>

        </div>

        <div class="row g-3">

            ${
                list.length
                    ? list
                        .map(
                            assessment =>
                                assessmentCard(
                                    assessment,
                                    true
                                )
                        )
                        .join('')
                    : `
                        <div class="col-12">

                            <div class="panel empty-state">

                                Nenhuma avaliação disponível.

                            </div>

                        </div>
                    `
            }

        </div>
    `;
}

async function carregarFotosDasAvaliacoes() {
    const boxes =
        document.querySelectorAll(
            '.photo-box[data-photo-url]'
        );

    for (const box of boxes) {
        const url =
            box.dataset.photoUrl;

        if (!url) {
            continue;
        }

        const imagem =
            await carregarFotoAvaliacao(
                url
            );

        if (!imagem) {
            box.innerHTML = `
                <i class="bi bi-image"></i>
            `;

            continue;
        }

        box.innerHTML = `
            <img
                src="${imagem}"
                alt="Foto da avaliação"
                loading="lazy"
            >
        `;
    }
}

window.openAssessmentModal =
    openAssessmentModal;

window.editAssessment =
    editAssessment;

window.saveAssessment =
    saveAssessment;

window.deleteAssessment =
    deleteAssessment;

window.assessments =
    assessments;

window.assessmentCard =
    assessmentCard;

window.userAssessments =
    userAssessments;

window.carregarFotosDasAvaliacoes =
    carregarFotosDasAvaliacoes;
