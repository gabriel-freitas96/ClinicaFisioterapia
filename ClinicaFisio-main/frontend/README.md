# Clínica Fisio

> Sistema web de agendamento e gerenciamento para clínica de fisioterapia.

---

## Sobre o Projeto

O **Clínica Fisio** é um sistema web desenvolvido para auxiliar no gerenciamento de uma clínica de fisioterapia, centralizando informações de pacientes, consultas, avaliações físicas e pagamentos.

A aplicação possui duas áreas principais: **Paciente** e **Administrativa**. O paciente pode criar sua própria conta, acessar o sistema, consultar suas informações e realizar agendamentos. Já a administração possui recursos para gerenciar pacientes, consultas, avaliações físicas e pagamentos.

O projeto foi desenvolvido com foco em uma interface simples, organizada e responsiva.

---

## Funcionalidades

### Área do Paciente

- Criação de conta para novos pacientes
- Login de acesso ao sistema
- Visualização da página inicial
- Agendamento de consultas
- Visualização das consultas agendadas
- Histórico de consultas
- Visualização das avaliações físicas
- Visualização de observações registradas pela profissional
- Acompanhamento de fotos de evolução
- Visualização das informações de pagamento
- Alternância entre tema claro e escuro

### Área Administrativa

- Login administrativo
- Página inicial com resumo da clínica
- Gerenciamento de pacientes
- Cadastro de novos pacientes
- Visualização da agenda
- Agendamento de consultas
- Alteração do status das consultas
- Registro de avaliações físicas
- Registro de peso e altura
- Registro do nível de dor e mobilidade
- Registro de bioimpedância
- Registro de observações
- Upload de fotos de acompanhamento
- Gerenciamento de pagamentos
- Controle de pagamentos recebidos e pendentes
- Relatórios básicos da clínica
- Alternância entre tema claro e escuro

---

## Avaliação Física

O sistema permite registrar informações da avaliação física do paciente, incluindo:

- Peso
- Altura
- Nível de dor
- Mobilidade
- Observações da profissional
- Fotos de antes e depois
- Informações de bioimpedância

As avaliações registradas pela administração podem ser visualizadas posteriormente na área do paciente.

---

## Agendamento de Consultas

O sistema possui um módulo de agendamento que permite:

- Selecionar o paciente
- Definir o tipo de atendimento
- Escolher a data
- Definir o horário
- Adicionar observações
- Acompanhar o status da consulta

Os status disponíveis são:

- Confirmada
- Pendente
- Cancelada

Tanto a **administração quanto o paciente** podem realizar agendamentos.

---

## Pagamentos

A área financeira permite registrar e acompanhar:

- Paciente
- Descrição do pagamento
- Valor
- Data
- Método de pagamento
- Status do pagamento

Os pagamentos podem ser classificados como **Pago** ou **Pendente**.

---

## Tecnologias

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

---

## Estrutura do Projeto

```text
ClinicaFisio/
│
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   ├── assets/
│   │   └── logo.png
│   └── ...
│
└── README.md
