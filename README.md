<div align="center">

# 🩺 Joelma Negreiros Fisioterapia

Sistema de gestão e atendimento para clínica de fisioterapia, com área administrativa para a profissional e área de acompanhamento para os pacientes.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>

---

## 📑 Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Como executar](#-como-executar)
- [Segurança e privacidade](#-segurança-e-privacidade)
- [Autor](#-autor)

---

## 💡 Sobre o projeto

O sistema organiza o dia a dia de uma clínica de fisioterapia em um só lugar: pacientes, agenda, avaliações físicas com fotos de antes e depois, e pagamentos. Os pacientes também têm uma área própria para acompanhar suas consultas, avaliações e pagamentos.

---

## ✨ Funcionalidades

### Área da profissional (administrador)

| Módulo | O que faz |
|---|---|
| 🏠 **Início** | Visão geral da clínica no dashboard |
| 👥 **Pacientes** | Cadastro, edição e exclusão de pacientes |
| 📅 **Agenda** | Agendamento de consultas por paciente, data, horário e tipo de atendimento |
| 📋 **Avaliações** | Peso, altura, dor (0 a 10), mobilidade, observações e fotos de antes e depois |
| 💰 **Pagamentos** | Registro de pagamentos por Pix, dinheiro ou cartão |
| 📊 **Relatórios** | Acompanhamento de resultados da clínica |

### Área do paciente

| Módulo | O que faz |
|---|---|
| 🏠 **Início** | Resumo da própria área |
| 📅 **Minhas consultas** | Consultas agendadas |
| 📋 **Minhas avaliações** | Evolução com as fotos liberadas pela clínica |
| 💳 **Meus pagamentos** | Histórico de pagamentos |

Os pacientes também podem criar a própria conta pela tela de login.

---

## 🛠️ Tecnologias

**Frontend**
- HTML5, CSS3 e JavaScript puro
- Bootstrap 5 e Bootstrap Icons
- Tema claro e escuro

**Backend**
- Node.js com Express
- MongoDB com Mongoose
- Multer para upload das fotos das avaliações
- Autenticação com perfis de administrador e paciente

---

## 🗂️ Estrutura do projeto

```
ClinicaFisio/
├── assets/                 # Logo e imagens
├── css/                    # Estilos (style, components, dashboard, login)
├── js/
│   ├── api.js              # Comunicação com o backend
│   ├── app.js              # Inicialização e navegação entre telas
│   ├── auth.js             # Login, cadastro e sessão
│   ├── pages/              # Telas: pacientes, agenda, avaliações, pagamentos, dashboard
│   ├── ui/                 # Componentes: toast, confirmação, sidebar e tema
│   └── utils/              # Formatação e segurança
├── server/                 # Backend (rotas, modelos, middlewares e utilitários)
├── index.html              # Página única do sistema
└── README.md
```

---

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS)
- [MongoDB](https://www.mongodb.com/) local ou um cluster no [MongoDB Atlas](https://www.mongodb.com/atlas)

### Passo a passo

**1. Clone o repositório**

```bash
git clone https://github.com/gabriel-freitas96/ClinicaFisioterapia.git
cd ClinicaFisioterapia
```

**2. Instale as dependências**

```bash
npm install
```

**3. Configure o ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
MONGODB_URI=mongodb://localhost:27017/clinicafisio
JWT_SECRET=troque-por-uma-chave-segura
PORT=3000
```

**4. Inicie o servidor**

```bash
npm start
```

**5. Acesse o sistema**

Abra `http://localhost:3000` no navegador (ou o endereço indicado no terminal).

> ⚠️ Confirme os comandos e as variáveis do `.env` com o seu `package.json` e o arquivo principal do servidor.

---

## 🔒 Segurança e privacidade

- As fotos das avaliações ficam na pasta `uploads/`, que **não vai para o repositório**, pois contém dados sensíveis dos pacientes.
- O arquivo `.env` guarda senhas e chaves, e também **não vai para o repositório**.
- Apenas administradores podem criar, editar ou excluir avaliações.
- Pacientes só enxergam as próprias informações.
- A exclusão de um paciente remove junto suas consultas, avaliações e pagamentos.

---

## 👨‍💻 Autor

**Gabriel Lacerda**
Estudante de Sistemas de Informação

[![GitHub](https://img.shields.io/badge/GitHub-gabriel--freitas96-181717?style=flat-square&logo=github)](https://github.com/gabriel-freitas96)

---

<div align="center">

Clínica Joelma Negreiros Fisioterapia ⚕️

</div>
