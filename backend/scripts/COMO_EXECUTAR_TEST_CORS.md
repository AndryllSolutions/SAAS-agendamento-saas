# 🧪 Como Executar o Teste de CORS

## 🐳 Opção 1: Usando Docker (RECOMENDADO)

Se você está usando Docker, execute o script dentro do container:

```bash
# Executar no container backend
docker exec -it agendamento_backend python scripts/test_cors.py http://localhost:8000

# Ou se o container estiver rodando em outro host
docker exec -it agendamento_backend python scripts/test_cors.py http://backend:8000
```

**Vantagens:**
- ✅ Não precisa instalar nada localmente
- ✅ Ambiente já configurado
- ✅ Dependências já instaladas

## 💻 Opção 2: Executar Localmente (Sem Docker)

### Passo 1: Criar venv (se não existir)

```powershell
# No PowerShell, dentro da pasta backend
cd backend
python -m venv venv
```

### Passo 2: Ativar venv

**PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

**CMD:**
```cmd
venv\Scripts\activate.bat
```

**Git Bash:**
```bash
source venv/Scripts/activate
```

### Passo 3: Instalar dependências

```powershell
pip install requests
# Ou instalar tudo:
pip install -r requirements.txt
```

### Passo 4: Executar o script

```powershell
python scripts/test_cors.py http://localhost:8000
```

## 🔧 Solução de Problemas

### Erro: "ModuleNotFoundError: No module named 'requests'"

**Solução:**
```powershell
# Ativar venv primeiro
.\venv\Scripts\Activate.ps1

# Instalar requests
pip install requests
```

### Erro: "O termo '.\venv\Scripts\activate' não é reconhecido"

**Causa:** Venv não existe ou caminho incorreto

**Solução:**
```powershell
# Verificar se venv existe
Test-Path .\venv

# Se não existir, criar
python -m venv venv

# Depois ativar
.\venv\Scripts\Activate.ps1
```

### Erro: "Execution Policy" no PowerShell

**Solução:**
```powershell
# Permitir execução de scripts (temporário)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Depois ativar venv
.\venv\Scripts\Activate.ps1
```

### Prefere usar Docker?

Se você está usando Docker, **não precisa de venv local**! Use:

```bash
docker exec -it agendamento_backend python scripts/test_cors.py http://localhost:8000
```

## 📝 Exemplo de Saída Esperada

```
🔒 ============================================================
🔒 TESTE DE CONFIGURAÇÃO CORS
============================================================

Base URL: http://localhost:8000

============================================================
Testando origem: http://localhost:3000

🧪 Testando Preflight (OPTIONS) de http://localhost:3000
  Status: 200
  Headers CORS:
    ✓ access-control-allow-origin: http://localhost:3000
    ✓ access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
    ✓ access-control-allow-headers: Accept, Accept-Language, Content-Language, Content-Type, Authorization, ...
    ✓ access-control-max-age: 3600
  ✅ Preflight OK

🧪 Testando Request Real de http://localhost:3000
  Status: 200
  Access-Control-Allow-Origin: http://localhost:3000
  ✅ CORS OK

============================================================
📊 RESUMO
============================================================

http://localhost:3000: ✅ OK

✅ Todos os testes de CORS passaram!
```

## 🎯 Dica Rápida

**Se você está usando Docker (recomendado):**
```bash
docker exec -it agendamento_backend python scripts/test_cors.py
```

**Se você está desenvolvendo localmente:**
```powershell
.\venv\Scripts\Activate.ps1
python scripts/test_cors.py http://localhost:8000
```

