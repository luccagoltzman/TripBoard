# 🌎 TripBoard

<div align="center">
  <img src="src/assets/images/logo.png" alt="TripBoard Logo" width="200"/>
  
  <p align="center">
    Planeje e organize suas viagens de forma intuitiva e colaborativa
  </p>

  <p>
    <a href="#-sobre">Sobre</a> •
    <a href="#-features">Features</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-instalação">Instalação</a> •
    <a href="#-uso">Uso</a> •
    <a href="#-estrutura">Estrutura</a>
  </p>
</div>

## 📖 Sobre

O TripBoard é uma aplicação web moderna para planejamento de viagens, permitindo que você organize roteiros de forma colaborativa. Com uma interface intuitiva e recursos poderosos, você pode criar, compartilhar e gerenciar seus roteiros de viagem com facilidade.

### ✨ Destaques

- 🎨 Interface moderna e responsiva
- 👥 Colaboração em tempo real
- 📱 Design mobile-first
- 🔒 Sistema de permissões granular
- 📊 Gestão de gastos integrada
- 📍 Organização por dias e atividades

## 🚀 Features

### Roteiros
- Criação e edição de roteiros
- Organização por dias
- Adição de atividades com horários
- Upload de imagens e documentos
- Compartilhamento com outros usuários

### Colaboração
- Sistema de convites por e-mail
- Diferentes níveis de permissão
- Comentários e sugestões
- Compartilhamento via redes sociais

### Gestão de Gastos
- Controle de orçamento
- Categorização de despesas
- Divisão de gastos
- Relatórios e gráficos

## 🛠 Tecnologias

- **Frontend:**
  - Angular 17
  - Bootstrap 5
  - SCSS
  - Material Icons
  - RxJS

- **Backend:**
  - Laravel 10
  - MySQL
  - Redis
  - JWT Authentication

## 💻 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Angular CLI 17+
- Composer
- PHP 8.1+
- MySQL 8.0+

### Frontend

```bash
# Clone o repositório
git clone https://github.com/luccagoltzman/tripboard.git

# Entre no diretório
cd tripboard

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
ng serve

```

## 🎮 Uso

1. Acesse `http://localhost:4200` no navegador
2. Faça login ou crie uma nova conta
3. Comece a criar seus roteiros!

### Criando um Roteiro

1. Clique em "Novo Roteiro" no dashboard
2. Preencha as informações básicas:
   - Nome do roteiro
   - Destino
   - Datas
   - Imagem de capa (opcional)
3. Adicione atividades por dia
4. Convide colaboradores (opcional)

### Compartilhando

1. Abra o roteiro desejado
2. Clique no botão "Compartilhar"
3. Escolha o método:
   - Link direto
   - Convite por e-mail
   - Redes sociais

## 📁 Estrutura

```
src/
├── app/
│   ├── core/           # Serviços, modelos e guards
│   ├── features/       # Módulos principais
│   ├── shared/        # Componentes compartilhados
│   └── utils/         # Utilitários e helpers
├── assets/
│   ├── images/        # Imagens e ícones
│   └── styles/        # Estilos globais
└── environments/      # Configurações por ambiente
```

### Principais Módulos

- `DashboardModule`: Visualização e gestão de roteiros
- `RoteiroModule`: Criação e edição de roteiros
- `ColaboradoresModule`: Gestão de colaboradores
- `GastosModule`: Controle financeiro
- `PerfilModule`: Configurações do usuário

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Contato

Lucca Goltzman - [@lucca_goltzman](https://instagram.com/lucca_goltzman) - luccagoltzman@gmail.com

Link do Projeto: [https://github.com/luccagoltzman/tripboard](https://github.com/luccagoltzman/tripboard)
