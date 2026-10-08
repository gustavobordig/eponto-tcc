# Documentação da API - EPonto

Este documento contém todas as rotas, métodos HTTP e payloads esperados da API do sistema EPonto.

## Base URL
```
/api
```

---

## 1. Banco de Horas

### 1.1 Processar Banco de Horas
**POST** `/api/BancoHoras/Processar/{idUsuario}`

**Parâmetros:**
- `idUsuario` (int) - ID do usuário
- `data` (DateTime) - Data para processamento (query parameter)

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "string"
}
```

### 1.2 Obter Saldos Diários
**GET** `/api/BancoHoras/SaldosDiarios/{idUsuario}`

**Parâmetros:**
- `idUsuario` (int) - ID do usuário

### 1.3 Obter Banco de Horas Atual
**GET** `/api/BancoHoras/Atual/{idUsuario}`

**Parâmetros:**
- `idUsuario` (int) - ID do usuário

### 1.4 Obter Horas Trabalhadas por Mês
**GET** `/api/BancoHoras/HorasTrabalhadasMes/{idUsuario}`

**Parâmetros:**
- `idUsuario` (int) - ID do usuário

### 1.5 Obter Horas Extras por Mês
**GET** `/api/BancoHoras/HorasExtrasMes/{idUsuario}`

**Parâmetros:**
- `idUsuario` (int) - ID do usuário

---

## 2. Calendário

### 2.1 Buscar Calendário
**GET** `/api/Calendario/BuscaCalendario`

**Parâmetros:**
- `ano` (int) - Ano do calendário
- `idUsuario` (int, opcional) - ID do usuário

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "string",
  "calendario": "object"
}
```

---

## 3. Cargo

### 3.1 Criar Cargo
**POST** `/api/Cargo/Inserir`

**Payload:**
```json
{
  "idCargo": 0,
  "nomeCargo": "string",
  "salario": "string",
  "indAtivo": 1,
  "formacaoMinima": "string"
}
```

### 3.2 Obter Cargo por ID
**GET** `/api/Cargo/{id}`

**Parâmetros:**
- `id` (int) - ID do cargo

### 3.3 Listar Todos os Cargos
**GET** `/api/Cargo/Listar`

### 3.4 Atualizar Cargo
**PUT** `/api/Cargo/Atualizar/{id}`

**Parâmetros:**
- `id` (int) - ID do cargo

**Payload:**
```json
{
  "idCargo": 0,
  "nomeCargo": "string",
  "salario": "string",
  "indAtivo": 1,
  "formacaoMinima": "string"
}
```

### 3.5 Excluir Cargo
**PUT** `/api/Cargo/Deletar/{id}`

**Parâmetros:**
- `id` (int) - ID do cargo

---

## 4. Comunicado

### 4.1 Cadastrar Comunicado
**POST** `/api/Comunicado/CadastrarComunicado`

**Payload:**
```json
{
  "idComunicado": 0,
  "titulo": "string",
  "mensagem": "string",
  "dataInicio": "2024-01-01T00:00:00",
  "dataFim": "2024-01-01T00:00:00",
  "indAtivo": 1
}
```

### 4.2 Deletar Comunicado
**DELETE** `/api/Comunicado/DeletarComunicado`

**Parâmetros:**
- `idComunicado` (int) - ID do comunicado

### 4.3 Listar Comunicados
**GET** `/api/Comunicado/ListarComunicados`

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "string",
  "listaComunicados": [
    {
      "idComunicado": 0,
      "titulo": "string",
      "mensagem": "string",
      "dataInicio": "2024-01-01T00:00:00",
      "dataFim": "2024-01-01T00:00:00",
      "indAtivo": 1
    }
  ]
}
```

---

## 5. Feedback

### 5.1 Inserir Solicitação de Feedback
**POST** `/api/Feedback/InserirSolicitacao`

**Payload:**
```json
{
  "idSolicitacaoFeedback": 0,
  "idUsuario": 0,
  "idResponsavel": 0,
  "mensagemSolicitacao": "string",
  "dataSolicitacao": "2024-01-01T00:00:00",
  "statusSolicitacao": 1
}
```

### 5.2 Inserir Feedback
**POST** `/api/Feedback/InserirFeedback`

**Payload:**
```json
{
  "idFeedback": 0,
  "idSolicitacaoFeedback": 0,
  "mensagemFeedback": "string",
  "avaliacao": 1,
  "dataFeedback": "2024-01-01T00:00:00"
}
```

### 5.3 Listar Solicitações
**GET** `/api/Feedback/ListarSolicitacao`

### 5.4 Listar Feedbacks
**GET** `/api/Feedback/ListarFeedback`

### 5.5 Obter Solicitação por ID
**GET** `/api/Feedback/ListarSolicitacao/{id}`

**Parâmetros:**
- `id` (int) - ID da solicitação

### 5.6 Obter Solicitações por Usuário
**GET** `/api/Feedback/ListarSolicitacoesUsuario/{idUsuario}`

**Parâmetros:**
- `idUsuario` (int) - ID do usuário

### 5.7 Obter Solicitações por Responsável
**GET** `/api/Feedback/ListarSolicitacoesResponsavel/{idResponsavel}`

**Parâmetros:**
- `idResponsavel` (int) - ID do responsável

### 5.8 Obter Feedback por ID
**GET** `/api/Feedback/ListarFeedback/{id}`

**Parâmetros:**
- `id` (int) - ID do feedback

### 5.9 Atualizar Solicitação
**PUT** `/api/Feedback/AtualizarSolicitacao/{id}`

**Parâmetros:**
- `id` (int) - ID da solicitação

**Payload:**
```json
{
  "idSolicitacaoFeedback": 0,
  "idUsuario": 0,
  "idResponsavel": 0,
  "mensagemSolicitacao": "string",
  "dataSolicitacao": "2024-01-01T00:00:00",
  "statusSolicitacao": 1
}
```

### 5.10 Obter Feedbacks por Usuário
**GET** `/api/Feedback/ListarFeedbacksUsuario/{idUsuario}`

**Parâmetros:**
- `idUsuario` (int) - ID do usuário

### 5.11 Excluir Solicitação
**DELETE** `/api/Feedback/Deletar/{id}`

**Parâmetros:**
- `id` (int) - ID da solicitação

---

## 6. Feriado

### 6.1 Cadastrar Feriado
**POST** `/api/feriado/CadastrarFeriado`

**Payload:**
```json
{
  "idFeriado": 0,
  "nomeFeriado": "string",
  "dataFeriado": "2024-01-01T00:00:00",
  "indAtivo": 1
}
```

### 6.2 Deletar Feriado
**DELETE** `/api/feriado/DeletarFeriado/{idFeriado}`

**Parâmetros:**
- `idFeriado` (int) - ID do feriado

### 6.3 Listar Feriados
**GET** `/api/feriado/ListarFeriados`

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "string",
  "feriados": [
    {
      "idFeriado": 0,
      "nomeFeriado": "string",
      "dataFeriado": "2024-01-01T00:00:00",
      "indAtivo": 1
    }
  ]
}
```

---

## 7. Férias

### 7.1 Cadastrar Férias
**POST** `/api/Ferias/CadastrarFerias`

**Payload:**
```json
{
  "idFerias": 0,
  "idUsuario": 0,
  "dataInicio": "2024-01-01T00:00:00",
  "dataFim": "2024-01-01T00:00:00",
  "diasFerias": 0,
  "indAtivo": 1
}
```

### 7.2 Deletar Férias
**DELETE** `/api/Ferias/DeletarFerias/{idFerias}`

**Parâmetros:**
- `idFerias` (int) - ID das férias

### 7.3 Listar Férias
**GET** `/api/Ferias/ListarFerias`

**Parâmetros:**
- `idUsuario` (int, opcional) - ID do usuário

### 7.4 Cadastrar Solicitação de Férias
**POST** `/api/Ferias/CadastrarSolicitacaoFerias`

**Payload:**
```json
{
  "idSolicitacaoFerias": 0,
  "idUsuario": 0,
  "dataInicio": "2024-01-01T00:00:00",
  "dataFim": "2024-01-01T00:00:00",
  "diasSolicitados": 0,
  "statusSolicitacao": 1,
  "dataSolicitacao": "2024-01-01T00:00:00"
}
```

### 7.5 Listar Solicitações de Férias
**GET** `/api/Ferias/ListarSolicitacoesFerias`

**Parâmetros:**
- `idUsuario` (int, opcional) - ID do usuário

### 7.6 Retornar Saldo de Férias
**GET** `/api/Ferias/RetornaSaldoFerias`

**Parâmetros:**
- `idUsuario` (int, opcional) - ID do usuário

### 7.7 Atualizar Solicitação de Férias
**POST** `/api/Ferias/AtualizaSolicitacaoFerias`

**Parâmetros:**
- `idSolicitacao` (int, opcional) - ID da solicitação
- `indSituacao` (int, opcional) - Situação da solicitação

---

## 8. Jornada de Trabalho

### 8.1 Criar Jornada de Trabalho
**POST** `/api/JornadaTrabalho/Inserir`

**Payload:**
```json
{
  "idJornada": 0,
  "nomeJornada": "string",
  "horaInicio": "08:00:00",
  "horaFim": "17:00:00",
  "cargaHoraria": 8,
  "indAtivo": 1
}
```

### 8.2 Obter Jornada por ID
**GET** `/api/JornadaTrabalho/{id}`

**Parâmetros:**
- `id` (int) - ID da jornada

### 8.3 Listar Jornadas
**GET** `/api/JornadaTrabalho/Listar`

### 8.4 Atualizar Jornada
**PUT** `/api/JornadaTrabalho/Atualizar/{id}`

**Parâmetros:**
- `id` (int) - ID da jornada

**Payload:**
```json
{
  "idJornada": 0,
  "nomeJornada": "string",
  "horaInicio": "08:00:00",
  "horaFim": "17:00:00",
  "cargaHoraria": 8,
  "indAtivo": 1
}
```

### 8.5 Excluir Jornada
**PUT** `/api/JornadaTrabalho/Deletar/{id}`

**Parâmetros:**
- `id` (int) - ID da jornada

---

## 9. Login

### 9.1 Realizar Login
**POST** `/api/login/RealizarLogin`

**Payload:**
```json
{
  "email": "string",
  "senha": "string"
}
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "string",
  "idUsuario": 0,
  "token": "string"
}
```

### 9.2 Recuperar Senha
**POST** `/api/login/RecuperarSenha`

**Payload:**
```json
{
  "email": "string"
}
```

### 9.3 Validar Código de Recuperação
**POST** `/api/login/ValidaCodigoRecuperacao`

**Payload:**
```json
{
  "codigo": "string",
  "email": "string"
}
```

### 9.4 Alterar Senha
**POST** `/api/login/AlteraSenhaLogin`

**Payload:**
```json
{
  "senha": "string",
  "email": "string"
}
```

---

## 10. Registro de Ponto

### 10.1 Criar Registro de Ponto
**POST** `/api/RegistroPonto/Inserir`

**Payload:**
```json
{
  "idUsuario": 0,
  "horaRegistro": "2024-01-01T08:00:00",
  "dataRegistro": "2024-01-01T00:00:00",
  "idTipoRegistroPonto": 1,
  "localizacao": "string"
}
```

### 10.2 Obter Registro por ID
**GET** `/api/RegistroPonto/{id}`

**Parâmetros:**
- `id` (int) - ID do registro

### 10.3 Obter Registros do Usuário
**GET** `/api/RegistroPonto/ObterRegistrosUsuario`

**Parâmetros:**
- `idUsuario` (int) - ID do usuário

### 10.4 Listar Todos os Registros
**GET** `/api/RegistroPonto/Listar`

### 10.5 Excluir Registro
**DELETE** `/api/RegistroPonto/{id}`

**Parâmetros:**
- `id` (int) - ID do registro

### 10.6 Criar Solicitação de Alteração
**POST** `/api/RegistroPonto/CriarSolicitacaoAlteracao`

**Payload:**
```json
{
  "idSolicitacao": 0,
  "idUsuario": 0,
  "idRegistroPonto": 0,
  "justificativa": "string",
  "novaHora": "2024-01-01T08:00:00",
  "statusSolicitacao": 1,
  "dataSolicitacao": "2024-01-01T00:00:00"
}
```

### 10.7 Listar Solicitações de Alteração
**GET** `/api/RegistroPonto/ListarSolicitacoesAlteracao`

**Parâmetros:**
- `status` (int, opcional) - Status da solicitação

### 10.8 Obter Solicitação de Alteração
**GET** `/api/RegistroPonto/ObterSolicitacaoAlteracao/{id}`

**Parâmetros:**
- `id` (int) - ID da solicitação

### 10.9 Validar Solicitação
**POST** `/api/RegistroPonto/ValidarSolicitacao/{idSolicitacao}`

**Parâmetros:**
- `idSolicitacao` (int) - ID da solicitação

**Payload:**
```json
{
  "aprovado": true
}
```

---

## 11. Solicitação de Ausência

### 11.1 Listar Solicitações de Ausência
**GET** `/api/SolicitacaoAusencia/ListarSolicitacaoAusencia`

### 11.2 Obter Solicitação por ID
**GET** `/api/SolicitacaoAusencia/ListarSolicitacaoAusencia/{id}`

**Parâmetros:**
- `id` (int) - ID da solicitação

### 11.3 Obter Solicitações por Usuário
**GET** `/api/SolicitacaoAusencia/ListarSolicitacoesAusenciaUsuario/{idUsuario}`

**Parâmetros:**
- `idUsuario` (int) - ID do usuário

### 11.4 Inserir Solicitação de Ausência
**POST** `/api/SolicitacaoAusencia/InserirSolicitacaoAusencia`

**Content-Type:** `multipart/form-data`

**Campos:**
- `idUsuario` (int) - ID do usuário
- `mensagemSolicitacao` (string, opcional) - Mensagem da solicitação
- `dataInicioAusencia` (DateTime, opcional) - Data de início da ausência
- `dataFimAusencia` (DateTime, opcional) - Data de fim da ausência
- `arquivo` (file, opcional) - Arquivo anexo (PDF, JPEG, PNG, WebP, DOC, DOCX)
- `camposAtivos` (string[], opcional) - Campos que devem ser processados

### 11.5 Atualizar Solicitação
**PUT** `/api/SolicitacaoAusencia/AtualizarSolicitacao/{id}`

**Parâmetros:**
- `id` (int) - ID da solicitação

**Payload:**
```json
{
  "idSolicitacaoAusencia": 0,
  "idUsuario": 0,
  "mensagemSolicitacao": "string",
  "dataInicioAusencia": "2024-01-01T00:00:00",
  "dataFimAusencia": "2024-01-01T00:00:00",
  "linkArquivo": "string",
  "statusSolicitacao": 1,
  "dataSolicitacao": "2024-01-01T00:00:00"
}
```

### 11.6 Excluir Solicitação
**DELETE** `/api/SolicitacaoAusencia/Deletar/{id}`

**Parâmetros:**
- `id` (int) - ID da solicitação

### 11.7 Responder Solicitação
**PUT** `/api/SolicitacaoAusencia/ResponderSolicitacao/{id}`

**Parâmetros:**
- `id` (int) - ID da solicitação
- `aprovar` (bool) - Aprovar ou reprovar a solicitação

---

## 12. Usuário

### 12.1 Criar Usuário
**POST** `/api/Usuario/Inserir`

**Payload:**
```json
{
  "idUsuario": 0,
  "nome": "string",
  "dataNascimento": "2024-01-01T00:00:00",
  "senha": "string",
  "email": "string",
  "telefone": 0,
  "idCargo": 0,
  "idJornada": 0,
  "indAtivo": 1,
  "fotoPerfil": "string"
}
```

### 12.2 Obter Usuário por ID
**GET** `/api/Usuario/{id}`

**Parâmetros:**
- `id` (int) - ID do usuário

### 12.3 Listar Todos os Usuários
**GET** `/api/Usuario/Listar`

### 12.4 Atualizar Usuário
**PUT** `/api/Usuario/Atualizar/{id}`

**Parâmetros:**
- `id` (int) - ID do usuário

**Payload:**
```json
{
  "idUsuario": 0,
  "nome": "string",
  "dataNascimento": "2024-01-01T00:00:00",
  "senha": "string",
  "email": "string",
  "telefone": 0,
  "idCargo": 0,
  "idJornada": 0,
  "indAtivo": 1,
  "fotoPerfil": "string"
}
```

### 12.5 Excluir Usuário
**PUT** `/api/Usuario/Deletar/{id}`

**Parâmetros:**
- `id` (int) - ID do usuário

---

## Códigos de Status HTTP

- **200 OK** - Requisição bem-sucedida
- **400 Bad Request** - Dados inválidos ou erro na requisição
- **401 Unauthorized** - Não autorizado (principalmente para login)
- **404 Not Found** - Recurso não encontrado

## Observações Gerais

1. **Autenticação:** A maioria dos endpoints requer autenticação via token JWT retornado no login.

2. **Formato de Data:** Todas as datas devem estar no formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss`).

3. **Upload de Arquivos:** O endpoint de solicitação de ausência suporta upload de arquivos com limite de 50MB.

4. **Campos Opcionais:** Muitos campos são opcionais e podem ser omitidos do payload.

5. **Respostas Padrão:** Todas as respostas seguem um padrão com `sucesso` (boolean) e `mensagem` (string).

6. **Soft Delete:** Alguns endpoints usam PUT para exclusão lógica em vez de DELETE físico.
