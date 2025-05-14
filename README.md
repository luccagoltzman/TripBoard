# TripBoard

TripBoard é uma plataforma colaborativa para organização de roteiros de viagem em grupo. Permite que um grupo de viajantes (família ou amigos) possa visualizar, sugerir e editar juntos o roteiro de uma viagem em tempo real, com controle de permissões e histórico de alterações.

## Funcionalidades Principais

- **Autenticação de Usuário**: Registro, login e recuperação de senha
- **Painel de Roteiros**: Visualização e gerenciamento dos roteiros criados
- **Edição Colaborativa**: Sistema de sugestões e aprovações para roteiros
- **Gerenciamento de Gastos**: Controle e visualização de gastos da viagem
- **Comentários e Discussão**: Sistema de comentários para cada atividade do roteiro
- **Compartilhamento**: Link público para compartilhar o roteiro

## Tecnologias Utilizadas

- **Frontend**: Angular 17+
- **Estilização**: Bootstrap
- **Backend**: Laravel 10+ (API RESTful) - em desenvolvimento
- **Banco de Dados**: MySQL / PostgreSQL - em desenvolvimento

## Requisitos para Instalação

- Node.js 16.x ou superior
- npm 8.x ou superior

## Como Instalar

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/tripboard.git
   cd tripboard
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Execute o servidor de desenvolvimento:
   ```
   npm start
   ```

4. Acesse a aplicação em `http://localhost:4200`

## Estrutura do Projeto

O projeto está organizado seguindo a arquitetura de componentes do Angular:

- `/src/app/core`: Serviços, modelos e interceptors essenciais
- `/src/app/shared`: Componentes, diretivas e pipes reutilizáveis
- `/src/app/features`: Componentes específicos de funcionalidades

## Créditos

Desenvolvido como projeto de demonstração para um sistema colaborativo de organização de viagens.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
