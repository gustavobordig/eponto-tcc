# Documentação da API - EPonto

Este documento contém todas as rotas disponíveis na API do sistema EPonto, incluindo métodos HTTP, parâmetros e exemplos de payload.

## Autenticação

A maioria das rotas requer autenticação via token JWT. O token deve ser enviado no header `Authorization: Bearer {token}`.

---

## 1. Login Controller (`/api/login`)

### POST `/api/login/RealizarLogin`
**Descrição:** Realiza login do usuário no sistema
**Autenticação:** Não requerida

**Payload:**
```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso",
  "idUsuario": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "perfisUsuario": [
    {
      "idPerfil": 1,
      "dscPerfil": "Administrador"
    }
  ]
}
```

### POST `/api/login/RecuperarSenha`
**Descrição:** Inicia processo de recuperação de senha
**Autenticação:** Não requerida

**Payload:**
```json
{
  "email": "usuario@exemplo.com"
}
```

### POST `/api/login/ValidaCodigoRecuperacao`
**Descrição:** Valida código de recuperação de senha
**Autenticação:** Não requerida

**Payload:**
```json
{
  "email": "usuario@exemplo.com",
  "codigo": 123456
}
```

### POST `/api/login/AlteraSenhaLogin`
**Descrição:** Altera senha após validação do código
**Autenticação:** Não requerida

**Payload:**
```json
{
  "senha": "novaSenha123",
  "email": "usuario@exemplo.com"
}
```

---

## 2. Usuario Controller (`/api/Usuario`)

### POST `/api/Usuario/Inserir`
**Descrição:** Cria um novo usuário
**Autenticação:** Requerida

**Payload:**
```json
{
  "nome": "João Silva",
  "dataNascimento": "1990-05-15T00:00:00Z",
  "senha": "senha123",
  "email": "joao@exemplo.com",
  "telefone": 11999999999,
  "idCargo": 1,
  "idJornada": 1,
  "indAtivo": 1,
  "fotoPerfil": "https://exemplo.com/foto.jpg",
  "idChefe": 2
}
```

### GET `/api/Usuario/{id}`
**Descrição:** Obtém usuário por ID
**Autenticação:** Requerida

### GET `/api/Usuario/Contrato/{id}`
**Descrição:** Obtém contrato do usuário
**Autenticação:** Requerida

### GET `/api/Usuario/Listar`
**Descrição:** Lista todos os usuários
**Autenticação:** Requerida

### PUT `/api/Usuario/Atualizar/{id}`
**Descrição:** Atualiza dados do usuário
**Autenticação:** Requerida

**Payload:** Mesmo formato do POST `/api/Usuario/Inserir`

### PUT `/api/Usuario/Deletar/{id}`
**Descrição:** Exclui usuário (soft delete)
**Autenticação:** Requerida

### GET `/api/Usuario/Hierarquia`
**Descrição:** Obtém hierarquia organizacional
**Autenticação:** Requerida

---

## 3. RegistroPonto Controller (`/api/RegistroPonto`)

### POST `/api/RegistroPonto/Inserir`
**Descrição:** Registra ponto do funcionário
**Autenticação:** Requerida

**Payload:**
```json
{
  "idUsuario": 1,
  "horaRegistro": "2024-01-15T08:30:00Z",
  "dataRegistro": "2024-01-15T00:00:00Z",
  "idTipoRegistroPonto": 1,
  "localizacao": "Rua das Flores, 123"
}
```

### GET `/api/RegistroPonto/{id}`
**Descrição:** Obtém registro de ponto por ID
**Autenticação:** Requerida

### GET `/api/RegistroPonto/ObterRegistrosUsuario`
**Descrição:** Obtém registros de ponto de um usuário
**Autenticação:** Requerida
**Parâmetros:** `idUsuario` (query)

### GET `/api/RegistroPonto/Listar`
**Descrição:** Lista todos os registros de ponto
**Autenticação:** Requerida

### DELETE `/api/RegistroPonto/{id}`
**Descrição:** Exclui registro de ponto
**Autenticação:** Requerida

### POST `/api/RegistroPonto/CriarSolicitacaoAlteracao`
**Descrição:** Cria solicitação de alteração de ponto
**Autenticação:** Requerida

**Payload:**
```json
{
  "idUsuario": 1,
  "dataRegistro": "2024-01-15T00:00:00Z",
  "horaRegistro": "2024-01-15T08:30:00Z",
  "justificativa": "Esqueci de bater o ponto",
  "idTipoRegistroPonto": 1
}
```

### GET `/api/RegistroPonto/ListarSolicitacoesAlteracao`
**Descrição:** Lista solicitações de alteração
**Autenticação:** Requerida
**Parâmetros:** `status` (query, opcional)

### GET `/api/RegistroPonto/ObterSolicitacaoAlteracao/{id}`
**Descrição:** Obtém solicitação de alteração por ID
**Autenticação:** Requerida

### POST `/api/RegistroPonto/ValidarSolicitacao/{idSolicitacao}`
**Descrição:** Aprova ou reprova solicitação de alteração
**Autenticação:** Requerida

**Payload:**
```json
{
  "aprovado": true
}
```

---

## 4. BancoHoras Controller (`/api/BancoHoras`)

### POST `/api/BancoHoras/Processar/{idUsuario}`
**Descrição:** Processa banco de horas para um usuário
**Autenticação:** Requerida
**Parâmetros:** `data` (query)

### GET `/api/BancoHoras/SaldosDiarios/{idUsuario}`
**Descrição:** Obtém saldos diários do banco de horas
**Autenticação:** Requerida

### GET `/api/BancoHoras/Atual/{idUsuario}`
**Descrição:** Obtém saldo atual do banco de horas
**Autenticação:** Requerida

### GET `/api/BancoHoras/HorasTrabalhadasMes/{idUsuario}`
**Descrição:** Obtém horas trabalhadas por mês
**Autenticação:** Requerida

### GET `/api/BancoHoras/HorasExtrasMes/{idUsuario}`
**Descrição:** Obtém horas extras por mês
**Autenticação:** Requerida

---

## 5. Calendario Controller (`/api/Calendario`)

### GET `/api/Calendario/BuscaCalendario`
**Descrição:** Busca calendário por ano
**Autenticação:** Requerida
**Parâmetros:** `ano` (query), `idUsuario` (query, opcional)

---

## 6. Cargo Controller (`/api/Cargo`)

### POST `/api/Cargo/Inserir`
**Descrição:** Cria um novo cargo
**Autenticação:** Requerida

**Payload:**
```json
{
  "nomeCargo": "Desenvolvedor",
  "salario": "5000.00",
  "indAtivo": 1,
  "formacaoMinima": "Superior em Tecnologia"
}
```

### GET `/api/Cargo/{id}`
**Descrição:** Obtém cargo por ID
**Autenticação:** Requerida

### GET `/api/Cargo/Listar`
**Descrição:** Lista todos os cargos
**Autenticação:** Requerida

### PUT `/api/Cargo/Atualizar/{id}`
**Descrição:** Atualiza cargo
**Autenticação:** Requerida

**Payload:** Mesmo formato do POST

### PUT `/api/Cargo/Deletar/{id}`
**Descrição:** Exclui cargo (soft delete)
**Autenticação:** Requerida

---

## 7. Comunicado Controller (`/api/Comunicado`)

### POST `/api/Comunicado/CadastrarComunicado`
**Descrição:** Cria um novo comunicado
**Autenticação:** Requerida

**Payload:**
```json
{
  "titulo": "Comunicado Importante",
  "mensagem": "Conteúdo do comunicado",
  "dataInicio": "2024-01-15T00:00:00Z",
  "dataFim": "2024-01-30T00:00:00Z",
  "idUsuario": 1
}
```

### DELETE `/api/Comunicado/DeletarComunicado`
**Descrição:** Exclui comunicado
**Autenticação:** Requerida
**Parâmetros:** `idComunicado` (query)

### GET `/api/Comunicado/ListarComunicados`
**Descrição:** Lista todos os comunicados
**Autenticação:** Requerida

---

## 8. Feedback Controller (`/api/Feedback`)

### POST `/api/Feedback/InserirSolicitacao`
**Descrição:** Cria solicitação de feedback
**Autenticação:** Requerida

**Payload:**
```json
{
  "idUsuario": 1,
  "idResponsavel": 2,
  "mensagem": "Solicitação de feedback",
  "dataSolicitacao": "2024-01-15T00:00:00Z"
}
```

### POST `/api/Feedback/InserirFeedback`
**Descrição:** Cria feedback
**Autenticação:** Requerida

**Payload:**
```json
{
  "idUsuarioFeedback": 1,
  "idAutorFeedback": 2,
  "idSolicitacaoFeedback": 1,
  "mensagemFeedback": "Feedback do responsável",
  "avaliacao": 4
}
```

**Campos obrigatórios:**
- `idUsuarioFeedback` - ID do usuário que recebe o feedback
- `idAutorFeedback` - ID do usuário que está respondendo
- `mensagemFeedback` - Mensagem do feedback
- `avaliacao` - Nota de 0 a 4 (0=Péssimo, 1=Ruim, 2=Regular, 3=Bom, 4=Excelente)

**Campos opcionais:**
- `idSolicitacaoFeedback` - ID da solicitação (se for resposta a uma solicitação)

### GET `/api/Feedback/ListarSolicitacao`
**Descrição:** Lista todas as solicitações de feedback
**Autenticação:** Requerida

### GET `/api/Feedback/ListarFeedback`
**Descrição:** Lista todos os feedbacks
**Autenticação:** Requerida

### GET `/api/Feedback/ListarSolicitacao/{id}`
**Descrição:** Obtém solicitação por ID
**Autenticação:** Requerida

### GET `/api/Feedback/ListarSolicitacoesUsuario/{idUsuario}`
**Descrição:** Obtém solicitações por usuário
**Autenticação:** Requerida

### GET `/api/Feedback/ListarSolicitacoesResponsavel/{idResponsavel}`
**Descrição:** Obtém solicitações por responsável
**Autenticação:** Requerida

### GET `/api/Feedback/ListarFeedback/{id}`
**Descrição:** Obtém feedback por ID
**Autenticação:** Requerida

### PUT `/api/Feedback/AtualizarSolicitacao/{id}`
**Descrição:** Atualiza solicitação de feedback
**Autenticação:** Requerida

### GET `/api/Feedback/ListarFeedbacksUsuario/{idUsuario}`
**Descrição:** Obtém feedbacks por usuário
**Autenticação:** Requerida

### DELETE `/api/Feedback/Deletar/{id}`
**Descrição:** Exclui solicitação de feedback
**Autenticação:** Requerida

---

## 9. Feriado Controller (`/api/feriado`)

### POST `/api/feriado/CadastrarFeriado`
**Descrição:** Cria um novo feriado
**Autenticação:** Requerida

**Payload:**
```json
{
  "nomeFeriado": "Dia da Independência",
  "dataFeriado": "2024-09-07T00:00:00Z",
  "tipoFeriado": "Nacional"
}
```

### DELETE `/api/feriado/DeletarFeriado/{idFeriado}`
**Descrição:** Exclui feriado
**Autenticação:** Requerida

### GET `/api/feriado/ListarFeriados`
**Descrição:** Lista todos os feriados
**Autenticação:** Requerida

---

## 10. Ferias Controller (`/api/Ferias`)

### POST `/api/Ferias/CadastrarFerias`
**Descrição:** Cadastra período de férias
**Autenticação:** Requerida

**Payload:**
```json
{
  "idUsuario": 1,
  "dataInicio": "2024-07-01T00:00:00Z",
  "dataFim": "2024-07-15T00:00:00Z",
  "observacoes": "Férias de verão"
}
```

### DELETE `/api/Ferias/DeletarFerias/{idFerias}`
**Descrição:** Exclui período de férias
**Autenticação:** Requerida

### GET `/api/Ferias/ListarFerias`
**Descrição:** Lista férias
**Autenticação:** Requerida
**Parâmetros:** `idUsuario` (query, opcional)

### POST `/api/Ferias/CadastrarSolicitacaoFerias`
**Descrição:** Cria solicitação de férias
**Autenticação:** Requerida

**Payload:**
```json
{
  "idUsuario": 1,
  "dataInicio": "2024-07-01T00:00:00Z",
  "dataFim": "2024-07-15T00:00:00Z",
  "observacoes": "Solicitação de férias"
}
```

### GET `/api/Ferias/ListarSolicitacoesFerias`
**Descrição:** Lista solicitações de férias
**Autenticação:** Requerida
**Parâmetros:** `idUsuario` (query, opcional)

### GET `/api/Ferias/RetornaSaldoFerias`
**Descrição:** Retorna saldo de férias
**Autenticação:** Requerida
**Parâmetros:** `idUsuario` (query, opcional)

### POST `/api/Ferias/AtualizaSolicitacaoFerias`
**Descrição:** Atualiza status da solicitação de férias
**Autenticação:** Requerida
**Parâmetros:** `idSolicitacao` (query, opcional), `indSituacao` (query, opcional)

---

## 11. JornadaTrabalho Controller (`/api/JornadaTrabalho`)

### POST `/api/JornadaTrabalho/Inserir`
**Descrição:** Cria nova jornada de trabalho
**Autenticação:** Requerida

**Payload:**
```json
{
  "nomeJornada": "Jornada 8h",
  "horarioInicio": "08:00:00",
  "horarioFim": "17:00:00",
  "horarioAlmoco": "12:00:00",
  "duracaoAlmoco": 60,
  "indAtivo": 1
}
```

### GET `/api/JornadaTrabalho/{id}`
**Descrição:** Obtém jornada por ID
**Autenticação:** Requerida

### GET `/api/JornadaTrabalho/Listar`
**Descrição:** Lista todas as jornadas
**Autenticação:** Requerida

### PUT `/api/JornadaTrabalho/Atualizar/{id}`
**Descrição:** Atualiza jornada de trabalho
**Autenticação:** Requerida

### PUT `/api/JornadaTrabalho/Deletar/{id}`
**Descrição:** Exclui jornada (soft delete)
**Autenticação:** Requerida

---

## 12. Perfil Controller (`/api/Perfil`)

### POST `/api/Perfil/CadastrarPerfil`
**Descrição:** Cria novo perfil
**Autenticação:** Requerida

**Payload:**
```json
{
  "dscPerfil": "Administrador",
  "indAcessoAdmin": 1,
  "indPermiteCadastrar": 1,
  "indPermiteEditar": 1,
  "indPermiteDeletar": 1,
  "indPermiteRegularSolicitacoes": 1
}
```

### GET `/api/Perfil/ListarPerfis`
**Descrição:** Lista todos os perfis
**Autenticação:** Requerida

### GET `/api/Perfil/ListarPerfil`
**Descrição:** Obtém perfil por ID
**Autenticação:** Requerida
**Parâmetros:** `idPerfil` (query)

### PUT `/api/Perfil/EditarPerfil`
**Descrição:** Edita perfil
**Autenticação:** Requerida

### DELETE `/api/Perfil/RemoverPerfil/{idPerfil}`
**Descrição:** Remove perfil
**Autenticação:** Requerida

### POST `/api/Perfil/CadastrarVinculoPerfilUsuario`
**Descrição:** Cria vínculo entre perfil e usuário
**Autenticação:** Requerida

**Payload:**
```json
{
  "idUsuario": 1,
  "idPerfil": 2
}
```

---

## 13. SolicitacaoAusencia Controller (`/api/SolicitacaoAusencia`)

### GET `/api/SolicitacaoAusencia/ListarSolicitacaoAusencia`
**Descrição:** Lista todas as solicitações de ausência
**Autenticação:** Requerida

### GET `/api/SolicitacaoAusencia/ListarSolicitacaoAusencia/{id}`
**Descrição:** Obtém solicitação por ID
**Autenticação:** Requerida

### GET `/api/SolicitacaoAusencia/ListarSolicitacoesAusenciaUsuario/{idUsuario}`
**Descrição:** Obtém solicitações por usuário
**Autenticação:** Requerida

### POST `/api/SolicitacaoAusencia/InserirSolicitacaoAusencia`
**Descrição:** Cria solicitação de ausência (com upload de arquivo)
**Autenticação:** Requerida
**Content-Type:** `multipart/form-data`

**Payload (form-data):**
```
idUsuario: 1
mensagemSolicitacao: "Preciso me ausentar por motivo médico"
dataInicioAusencia: "2024-01-20T00:00:00Z"
dataFimAusencia: "2024-01-22T00:00:00Z"
arquivo: [arquivo.pdf]
camposAtivos: ["mensagemSolicitacao", "dataInicioAusencia", "dataFimAusencia", "arquivo"]
```

### PUT `/api/SolicitacaoAusencia/AtualizarSolicitacao/{id}`
**Descrição:** Atualiza solicitação de ausência
**Autenticação:** Requerida

### DELETE `/api/SolicitacaoAusencia/Deletar/{id}`
**Descrição:** Exclui solicitação de ausência
**Autenticação:** Requerida

### PUT `/api/SolicitacaoAusencia/ResponderSolicitacao/{id}`
**Descrição:** Aprova ou reprova solicitação de ausência
**Autenticação:** Requerida
**Parâmetros:** `aprovar` (query)

---

## Códigos de Resposta HTTP

- **200 OK:** Operação realizada com sucesso
- **400 Bad Request:** Dados inválidos ou erro na operação
- **401 Unauthorized:** Token de autenticação inválido ou ausente
- **404 Not Found:** Recurso não encontrado
- **500 Internal Server Error:** Erro interno do servidor

## Estrutura de Resposta Padrão

Todas as respostas seguem o padrão:

```json
{
  "sucesso": true,
  "mensagem": "Operação realizada com sucesso",
  "dados": { ... }
}
```

## Observações Importantes

1. **Autenticação:** A maioria das rotas requer token JWT válido no header `Authorization: Bearer {token}`
2. **Content-Type:** Para uploads de arquivo, use `multipart/form-data`
3. **Datas:** Todas as datas devem estar no formato ISO 8601
4. **Soft Delete:** A exclusão de registros é feita via soft delete (campo `indAtivo`)
5. **Paginação:** Algumas listagens podem implementar paginação (não documentada aqui)
6. **Validações:** Todos os campos obrigatórios devem ser fornecidos
7. **Tamanho de Arquivo:** Limite de 50MB para uploads de arquivo
