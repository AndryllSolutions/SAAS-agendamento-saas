# NGINX – Estabilidade Definitiva (Docker-first)

Este guia consolida a configuração e rotinas para manter o Nginx estável em produção no VPS.

## ✅ Configuração definitiva (Docker-first)

**Arquivo oficial:**
- `docker/nginx/nginx.docker-first.conf`

**Motivo:**
- O serviço `nginx` do `docker-compose.prod.yml` monta esse arquivo dentro do container:
  ```yaml
  nginx:
    volumes:
      - ./docker/nginx/nginx.docker-first.conf:/etc/nginx/nginx.conf:ro
  ```

## ✅ Regras essenciais aplicadas

- **Proxy API não remove `/api` do path**
  ```nginx
  location /api/ {
      proxy_pass http://backend;
  }
  ```

- **Login sempre envia para `/api/v1/auth/login`**
  ```nginx
  location /api/auth/login {
      proxy_pass http://backend/api/v1/auth/login;
  }
  ```

- **Upload sempre envia para `/api/v1/upload`**
  ```nginx
  location /api/upload {
      proxy_pass http://backend/api/v1/upload;
  }
  ```

Isso evita 502 por rotas inexistentes e mantém compatibilidade com o frontend.

## ✅ Procedimento de atualização segura

1. **Subir config**:
   ```bash
   scp ./docker/nginx/nginx.docker-first.conf root@72.62.138.239:/opt/saas/atendo/docker/nginx/nginx.docker-first.conf
   ```

2. **Reiniciar somente o Nginx**:
   ```bash
   ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml restart nginx"
   ```

## ✅ Health checks

**Interno (backend):**
```bash
ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml exec -T backend curl -f -s http://localhost:8000/health"
```

**Nginx -> backend:**
```bash
ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml exec -T nginx curl -f -s http://backend:8000/health"
```

**Login (via Nginx público):**
```bash
ssh root@72.62.138.239 "curl -i -X POST https://atendo.website/api/v1/auth/login -H 'Content-Type: application/x-www-form-urlencoded' -d 'username=teste&password=teste'"
```

## ✅ Monitoramento rápido (em caso de 502)

```bash
ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml logs nginx --tail 100"
```

```bash
ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml logs backend --tail 100"
```

## ✅ Observações finais

- Nunca edite `/etc/nginx/nginx.conf` do host. O Nginx rodando é **container**.
- A única config efetiva é `docker/nginx/nginx.docker-first.conf`.
- Sempre reinicie apenas o serviço `nginx` no compose após mudanças.
