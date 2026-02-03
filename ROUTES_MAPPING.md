# MAPEAMENTO DE ROTAS BACKEND vs FRONTEND

## ENDPOINTS EXISTENTES NO BACKEND

### Auth (/auth)
- POST /auth/register ✅
- POST /auth/login ✅
- POST /auth/login-json ✅
- POST /auth/refresh ✅
- POST /auth/change-password ✅

### Appointments (/appointments)
- POST /appointments ✅
- POST /appointments/public ✅
- GET /appointments/calendar ✅
- GET /appointments/conflicts ✅
- GET /appointments/{id} ✅
- PUT /appointments/{id} ✅
- DELETE /appointments/{id} ✅
- POST /appointments/{id}/reschedule ✅
- ❌ GET /appointments (NÃO EXISTE!)
- ❌ POST /appointments/{id}/cancel (NÃO EXISTE!)
- ❌ POST /appointments/{id}/confirm (NÃO EXISTE!)
- ❌ POST /appointments/{id}/check-in (NÃO EXISTE!)

### Professionals (/professionals)
- GET /professionals ✅
- GET /professionals/public ✅
- POST /professionals ✅
- GET /professionals/{id} ✅
- PUT /professionals/{id} ✅
- DELETE /professionals/{id} ✅
- GET /professionals/{id}/schedule ✅
- GET /professionals/{id}/statistics ✅

### Clients (/clients)
- GET /clients ✅
- POST /clients ✅
- GET /clients/{id} ✅
- PUT /clients/{id} ✅
- DELETE /clients/{id} ✅
- GET /clients/{id}/history ✅

### Services (/services)
- GET /services ✅
- GET /services/public ✅
- POST /services ✅
- GET /services/{id} ✅
- PUT /services/{id} ✅
- DELETE /services/{id} ✅
- GET /services/categories ✅
- POST /services/categories ✅
- GET /services/categories/{id} ✅
- PUT /services/categories/{id} ✅
- DELETE /services/categories/{id} ✅

### Commands (/commands)
- GET /commands ✅
- POST /commands ✅
- GET /commands/{id} ✅
- PUT /commands/{id} ✅
- DELETE /commands/{id} ✅
- POST /commands/{id}/add-item ✅
- DELETE /commands/{id}/items/{item_id} ✅
- POST /commands/{id}/finish ✅
- GET /commands/{id}/print ✅
- POST /commands/{id}/apply-discount ✅
- POST /commands/{id}/apply-cashback ✅

### Users (/users)
- GET /users ✅
- POST /users ✅
- GET /users/me ✅
- PUT /users/me ✅
- GET /users/{id} ✅
- PUT /users/{id} ✅
- DELETE /users/{id} ✅
- GET /users/professionals/available ✅

## CORREÇÕES NECESSÁRIAS NO FRONTEND

1. appointmentService.list() deve usar /appointments/calendar
2. appointmentService.cancel() deve usar DELETE /appointments/{id}
3. Remover confirm() e checkIn() que não existem
4. userService.getClients() deve usar /clients
5. userService.createClient() deve usar /clients
