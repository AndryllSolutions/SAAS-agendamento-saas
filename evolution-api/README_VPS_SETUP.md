# Configuração Evolution API na VPS

## Passos para Configurar na VPS (72.62.138.239)

### 1. Acessar VPS via SSH
```bash
# Se você tem chave SSH configurada
ssh root@72.62.138.239

# Se não tiver chave, usar senha
ssh root@72.62.138.239
```

### 2. Criar Diretório na VPS
```bash
# Criar pasta para Evolution API
mkdir -p /opt/evolution-api
cd /opt/evolution-api
```

### 3. Copiar docker-compose.yml para VPS
```bash
# Opção 1: Usar SCP (se tiver SSH configurado)
scp e:\agendamento_SAAS\evolution-api\docker-compose.yml root@72.62.138.239:/opt/evolution-api/

# Opção 2: Criar diretamente na VPS
nano /opt/evolution-api/docker-compose.yml
# Colar o conteúdo do docker-compose.yml
```

### 4. Configurar Variáveis de Ambiente
```bash
# Editar docker-compose.yml para personalizar
nano /opt/evolution-api/docker-compose.yml

# Mudar estas variáveis:
- AUTHENTICATION_API_KEY=sua-chave-secreta-aqui
- JWT_SECRET_KEY=seu-jwt-secret-aqui
- SERVER_HOST=0.0.0.0  # Para acessar externamente
```

### 5. Iniciar Evolution API na VPS
```bash
cd /opt/evolution-api
docker-compose up -d
```

### 6. Verificar Status
```bash
# Verificar containers
docker-compose ps

# Verificar logs
docker-compose logs -f evolution-api

# Verificar se está rodando
curl http://localhost:8080
```

### 7. Configurar Firewall (se necessário)
```bash
# Liberar porta 8080
ufw allow 8080

# Ou com iptables
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
```

### 8. Acessar Painel Web
URL: http://72.62.138.239:8080

### 9. Criar Instância no Painel
1. Acessar http://72.62.138.239:8080
2. Login com as credenciais configuradas
3. Criar nova instância:
   - Instance Name: `agendamento-saas`
   - Phone Number: seu número com +55
   - Escanear QR Code com WhatsApp

### 10. Obter API Key
1. No painel, ir para seção de API Keys
2. Gerar nova chave
3. Copiar a chave

### 11. Configurar no Sistema SaaS
Adicionar ao .env do SaaS:
```bash
EVOLUTION_API_URL=http://72.62.138.239:8080
EVOLUTION_API_KEY=sua-api-key-aqui
EVOLUTION_INSTANCE_NAME=agendamento-saas
```

### 12. Testar Integração
```bash
# Testar via curl na VPS
curl -X POST "http://localhost:8080/message/sendText/agendamento-saas" \
  -H "apikey: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Teste de integracao Evolution API!"
  }'
```

## Comandos Úteis

### Gerenciar Evolution API
```bash
# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Ver logs
docker-compose logs -f

# Atualizar
docker-compose pull
docker-compose up -d
```

### Backup
```bash
# Backup das configurações
tar -czf evolution-api-backup.tar.gz /opt/evolution-api

# Backup do banco
docker exec evolution-postgres pg_dump -U postgres evolution > evolution-backup.sql
```

## Segurança

### Configurar Nginx (Opcional)
```nginx
# Adicionar ao nginx para HTTPS
server {
    listen 443 ssl;
    server_name api.seudominio.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Variáveis de Segurança
```bash
# Mudar chaves padrão
AUTHENTICATION_API_KEY=gerar-chave-forte-aqui
JWT_SECRET_KEY=gerar-jwt-forte-aqui

# Usar HTTPS em produção
SERVER_URL=https://api.seudominio.com
```

## Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker-compose logs evolution-api

# Verificar se portas estão em uso
netstat -tulpn | grep 8080
```

### QR Code não aparece
1. Verificar se instância foi criada
2. Reiniciar container
3. Limpar pasta instances

### Mensagem não enviada
1. Verificar se WhatsApp está conectado
2. Checar formato do número (+55DDDXXXXXXX)
3. Verificar logs de erro

## URLs Finais

- **Painel Web**: http://72.62.138.239:8080
- **API Base**: http://72.62.138.239:8080
- **Instance**: agendamento-saas
- **API Endpoint**: http://72.62.138.239:8080/message/sendText/agendamento-saas
