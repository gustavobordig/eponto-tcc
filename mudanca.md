# Mudanças que Afetam o Frontend - EPonto

## ⚠️ **MUDANÇAS CRÍTICAS - ATENÇÃO FRONTEND**

### 1. **MUDANÇA NO FLUXO DE LOGIN** 🔄

#### **ANTES (LoginDTO):**
```json
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso",
  "idUsuario": 123,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "perfisUsuario": [...]
}
```

#### **DEPOIS (LoginDTO):**
```json
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso",
  "perfisUsuario": [
    {
      "idPerfil": 1,
      "dscPerfil": "Admin"
    },
    {
      "idPerfil": 2,
      "dscPerfil": "User"
    }
  ]
}
```

**❌ REMOVIDO:**
- `idUsuario` - não retorna mais no LoginDTO
- `token` - não retorna mais no LoginDTO

**✅ ADICIONADO:**
- `perfisUsuario` - lista de perfis disponíveis para o usuário

---

### 2. **NOVO ENDPOINT DE AUTENTICAÇÃO** 🆕

#### **Nova Rota:**
```
POST /api/login/AutenticarPerfil
```

#### **Payload de Entrada:**
```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123",
  "idPerfil": 1
}
```

#### **Resposta (AutenticarDTO):**
```json
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso",
  "idUsuario": 123,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. **NOVO FLUXO DE AUTENTICAÇÃO** 🔐

#### **Processo em 2 Etapas:**

**ETAPA 1 - Buscar Perfis:**
```javascript
// Chamada para /api/login/RealizarLogin
const response = await fetch('/api/login/RealizarLogin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    senha: 'senha123'
  })
});

const loginData = await response.json();
// loginData.perfisUsuario contém os perfis disponíveis
```

**ETAPA 2 - Autenticar com Perfil:**
```javascript
// Chamada para /api/login/AutenticarPerfil
const authResponse = await fetch('/api/login/AutenticarPerfil', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    senha: 'senha123',
    idPerfil: selectedProfileId // ID do perfil selecionado
  })
});

const authData = await authResponse.json();
// authData.token contém o JWT para usar nas próximas requisições
```

---

### 4. **MUDANÇAS NO JWT** 🔑

#### **Claims Adicionadas:**
O JWT agora inclui informações de perfil:
```json
{
  "sub": "123",
  "email": "usuario@exemplo.com",
  "role": "Admin", // ou "User"
  "jti": "guid-unico"
}
```

#### **Validação de Roles:**
- Endpoints com `[Authorize(Roles = "Admin")]` só funcionam com token de Admin
- Endpoints com `[Authorize]` funcionam com qualquer perfil autenticado

---

### 5. **ENDPOINTS COM CONTROLE DE ACESSO** 🚫

#### **Apenas Administradores:**
- `POST /api/ferias/CadastrarFerias`
- `DELETE /api/ferias/RemoverFerias/{id}`
- `DELETE /api/ferias/DeletarFerias/{idFerias}`
- `POST /api/ferias/AtualizaSolicitacaoFerias`

#### **Usuários Autenticados:**
- `GET /api/ferias/ListarFerias`
- `POST /api/ferias/CadastrarSolicitacaoFerias`
- `GET /api/ferias/ListarSolicitacoesFerias`
- `GET /api/ferias/RetornaSaldoFerias`

---

## 📋 **AÇÕES NECESSÁRIAS NO FRONTEND**

### 1. **Atualizar Fluxo de Login**
```javascript
// ANTES - Login simples
const login = async (email, senha) => {
  const response = await fetch('/api/login/RealizarLogin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  
  const data = await response.json();
  if (data.sucesso) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.idUsuario);
  }
};

// DEPOIS - Login com seleção de perfil
const login = async (email, senha) => {
  // Etapa 1: Buscar perfis
  const perfisResponse = await fetch('/api/login/RealizarLogin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  
  const perfisData = await perfisResponse.json();
  if (perfisData.sucesso) {
    // Mostrar tela de seleção de perfil
    const selectedProfile = await showProfileSelection(perfisData.perfisUsuario);
    
    // Etapa 2: Autenticar com perfil selecionado
    const authResponse = await fetch('/api/login/AutenticarPerfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        senha, 
        idPerfil: selectedProfile.idPerfil 
      })
    });
    
    const authData = await authResponse.json();
    if (authData.sucesso) {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('userId', authData.idUsuario);
      localStorage.setItem('userRole', selectedProfile.dscPerfil);
    }
  }
};
```

### 2. **Implementar Tela de Seleção de Perfil**
```javascript
const showProfileSelection = (perfis) => {
  return new Promise((resolve) => {
    // Implementar modal/tela para seleção de perfil
    // Retornar o perfil selecionado
    const selectedProfile = perfis[0]; // Exemplo
    resolve(selectedProfile);
  });
};
```

### 3. **Atualizar Interceptadores de Requisição**
```javascript
// Adicionar tratamento para erro 403 (Acesso Negado)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Usuário não tem permissão para acessar o recurso
      showError('Acesso negado. Você não possui permissão de Administrador.');
    }
    return Promise.reject(error);
  }
);
```

### 4. **Atualizar Controles de Interface**
```javascript
// Verificar se usuário é admin antes de mostrar botões
const isAdmin = () => {
  return localStorage.getItem('userRole') === 'Admin';
};

// Exemplo de uso
if (isAdmin()) {
  // Mostrar botões de administração
  showAdminButtons();
}
```

---

## 🚨 **PONTOS CRÍTICOS**

1. **Login não retorna mais token** - precisa usar novo endpoint
2. **JWT contém role** - pode ser usado para controle de acesso
3. **Alguns endpoints só funcionam para Admin** - verificar permissões
4. **Fluxo de login em 2 etapas** - implementar seleção de perfil

---

## 📝 **RESUMO DAS MUDANÇAS**

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Login** | 1 endpoint, retorna token | 2 endpoints, seleção de perfil |
| **Token** | Sem role | Com role (Admin/User) |
| **Controle de Acesso** | Apenas autenticado | Por perfil/role |
| **Payload Login** | `{email, senha}` | `{email, senha, idPerfil}` |
| **Resposta Login** | `{sucesso, mensagem, idUsuario, token}` | `{sucesso, mensagem, perfisUsuario}` |

**⚠️ IMPORTANTE:** O frontend atual provavelmente não funcionará sem essas atualizações!
