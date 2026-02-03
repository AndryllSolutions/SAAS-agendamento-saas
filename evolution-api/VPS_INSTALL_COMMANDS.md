# Comandos para Instalar Evolution API na VPS

## Status Atual
Você está na VPS em: `/opt/evolution-api`
Precisa instalar Docker Compose.

## Comandos para Instalar Docker Compose

### Opção 1: Instalação via APT (Recomendado)
```bash
# Atualizar pacotes
apt update

# Instalar Docker Compose
apt install docker-compose -y

# Verificar instalação
docker-compose --version
```

### Opção 2: Instalação via Snap (Alternativa)
```bash
# Instalar via Snap
snap install docker

# Verificar instalação
docker --version
docker compose version
```

## Comandos para Iniciar Evolution API

### Após instalar Docker Compose:
```bash
# Verificar se Docker está rodando
systemctl status docker

# Iniciar Docker se não estiver rodando
systemctl start docker
systemctl enable docker

# Iniciar Evolution API
docker-compose up -d

# Verificar status dos containers
docker-compose ps

# Verificar logs
docker-compose logs -f evolution-api
```

## Comandos Úteis

### Verificar se está funcionando:
```bash
# Testar se API está respondendo
curl http://localhost:8080

# Verificar containers
docker ps

# Verificar logs específicos
docker-compose logs evolution-api
```

### Se precisar reiniciar:
```bash
# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Forçar recriação
docker-compose up -d --force-recreate
```

## Troubleshooting

### Erro "Permission denied" com Docker:
```bash
# Adicionar usuário ao grupo docker
usermod -aG docker root

# Ou usar sudo sempre
sudo docker-compose up -d
```

### Porta já em uso:
```bash
# Verificar o que está usando porta 8080
netstat -tulpn | grep 8080

# Mudar porta no docker-compose.yml (linha 9)
# ports:
#   - "8081:8080"  # Usar porta 8081
```

### Container não inicia:
```bash
# Verificar logs completos
docker-compose logs

# Verificar se imagem foi baixada
docker images | grep evolution

# Baixar imagem manualmente
docker pull evolutionapi/evolution-api:latest
```

## URLs de Acesso

Após iniciar com sucesso:
- **API Base**: http://72.62.138.239:8080
- **Painel Web**: http://72.62.138.239:8080

## Próximos Passos

1. ✅ Instalar Docker Compose
2. ✅ Iniciar containers
3. 🔄 Acessar painel web
4. 🔄 Criar instância "agendamento-saas"
5. 🔄 Conectar WhatsApp via QR Code
6. 🔄 Obter API Key
7. 🔄 Configurar no sistema SaaS
