# Estrutura do Nginx e Fix de HTTPS (atendo.website)

## Visao geral da estrutura
- Compose usado na VPS: `/opt/saas/atendo/docker-compose.prod.yml`
- Servico nginx monta:
  - `./docker/nginx/nginx.prod.conf` -> `/etc/nginx/nginx.conf` (read-only)
  - `/opt/agendamento-saas/ssl/certificates` -> `/etc/nginx/ssl`
  - `/opt/agendamento-saas/logs/nginx` -> `/var/log/nginx`

## Onde ficam os certificados
- Certificados LetsEncrypt na VPS:
  - `/etc/letsencrypt/live/atendo.website/fullchain.pem`
  - `/etc/letsencrypt/live/atendo.website/privkey.pem`

## Problema
- O nginx estava lendo SSL de `/etc/letsencrypt/...` dentro do container.
- O container **nao** monta `/etc/letsencrypt`.
- Resultado: erro ao iniciar HTTPS, restart loop, `ERR_CONNECTION_REFUSED`.

## Solucao aplicada
1) Copiar certificados LetsEncrypt para o volume montado pelo nginx:
```
cp /etc/letsencrypt/live/atendo.website/fullchain.pem /opt/agendamento-saas/ssl/certificates/cert.pem
cp /etc/letsencrypt/live/atendo.website/privkey.pem   /opt/agendamento-saas/ssl/certificates/key.pem
```

2) Ajustar o arquivo usado pelo nginx (`nginx.prod.conf`) para usar os caminhos montados:
```
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```

3) (Opcional) Desativar stapling se faltar cadeia emissora:
```
ssl_stapling off;
ssl_stapling_verify off;
```

4) Reiniciar nginx:
```
docker compose -f /opt/saas/atendo/docker-compose.prod.yml restart nginx
```

## Resultado
- HTTPS passou a responder:
  - `https://atendo.website` -> 200 OK

## Observacoes
- O arquivo efetivamente montado no container e:
  - `/opt/saas/atendo/docker/nginx/nginx.prod.conf`
- Sempre validar o arquivo real do container:
```
docker exec -i agendamento_nginx_prod sh -c 'head -80 /etc/nginx/nginx.conf'
```
