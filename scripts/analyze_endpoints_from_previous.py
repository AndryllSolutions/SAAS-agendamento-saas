"""
Script para analisar endpoints baseado na saida anterior do check_api_docs.py
"""
from collections import defaultdict

# Lista completa de endpoints obtida anteriormente
endpoints_raw = """
GET                  /api/v1/addons
POST                 /api/v1/addons/
GET, PUT, DELETE     /api/v1/addons/{addon_id}
POST                 /api/v1/addons/{addon_id}/activate
POST                 /api/v1/addons/{addon_id}/deactivate
POST, GET            /api/v1/appointments
GET                  /api/v1/appointments/available-slots
GET                  /api/v1/appointments/calendar
POST                 /api/v1/appointments/check-availability
POST                 /api/v1/appointments/check-conflicts
GET                  /api/v1/appointments/conflicts
GET                  /api/v1/appointments/dashboard
GET                  /api/v1/appointments/statistics
GET, PUT, DELETE     /api/v1/appointments/{appointment_id}
POST                 /api/v1/appointments/{appointment_id}/cancel
POST                 /api/v1/appointments/{appointment_id}/complete
POST                 /api/v1/appointments/{appointment_id}/confirm
POST                 /api/v1/appointments/{appointment_id}/no-show
POST                 /api/v1/appointments/{appointment_id}/reschedule
POST                 /api/v1/auth/change-password
POST                 /api/v1/auth/login
POST                 /api/v1/auth/login-json
POST                 /api/v1/auth/login/json
POST                 /api/v1/auth/mobile/login
POST                 /api/v1/auth/refresh
POST                 /api/v1/auth/refresh/json
POST                 /api/v1/auth/register
GET                  /api/v1/calendar/events
POST, GET            /api/v1/clients
GET                  /api/v1/clients/birthdays
GET                  /api/v1/clients/export
POST                 /api/v1/clients/import
GET                  /api/v1/clients/search
GET                  /api/v1/clients/statistics
GET, PUT, DELETE     /api/v1/clients/{client_id}
GET                  /api/v1/clients/{client_id}/appointments
GET                  /api/v1/clients/{client_id}/history
GET                  /api/v1/clients/{client_id}/packages
GET                  /api/v1/clients/{client_id}/statistics
POST, GET            /api/v1/commissions
GET                  /api/v1/commissions/calculate
GET                  /api/v1/commissions/pending
POST                 /api/v1/commissions/recalculate
GET                  /api/v1/commissions/report
GET, PUT, DELETE     /api/v1/commissions/{commission_id}
POST                 /api/v1/commissions/{commission_id}/pay
POST, GET            /api/v1/companies
GET                  /api/v1/companies/current
GET                  /api/v1/companies/slug/{slug}
GET, PUT, DELETE     /api/v1/companies/{company_id}
GET                  /api/v1/companies/{company_id}/statistics
POST                 /api/v1/companies/{company_id}/toggle-status
POST, GET            /api/v1/documents
GET                  /api/v1/documents/search
POST, GET            /api/v1/documents/templates
GET, PUT, DELETE     /api/v1/documents/templates/{template_id}
POST                 /api/v1/documents/templates/{template_id}/duplicate
GET, PUT, DELETE     /api/v1/documents/{document_id}
POST                 /api/v1/documents/{document_id}/send
POST, GET            /api/v1/expenses
POST, GET            /api/v1/expenses/categories
GET, PUT, DELETE     /api/v1/expenses/categories/{category_id}
GET                  /api/v1/expenses/report
GET, PUT, DELETE     /api/v1/expenses/{expense_id}
POST, GET            /api/v1/financial/cash-flow
POST                 /api/v1/financial/cash-flow/close
GET                  /api/v1/financial/cash-flow/current
GET                  /api/v1/financial/cash-flow/history
POST                 /api/v1/financial/cash-flow/open
GET                  /api/v1/financial/cash-flow/report
GET, PUT, DELETE     /api/v1/financial/cash-flow/{cash_flow_id}
POST, GET            /api/v1/financial/categories
GET, PUT, DELETE     /api/v1/financial/categories/{category_id}
POST, GET            /api/v1/financial/payment-forms
GET, PUT, DELETE     /api/v1/financial/payment-forms/{payment_form_id}
POST, GET            /api/v1/financial/transactions
GET                  /api/v1/financial/transactions/pending
GET                  /api/v1/financial/transactions/report
GET, PUT, DELETE     /api/v1/financial/transactions/{transaction_id}
POST                 /api/v1/financial/transactions/{transaction_id}/cancel
POST                 /api/v1/financial/transactions/{transaction_id}/confirm
POST, GET            /api/v1/goals
GET                  /api/v1/goals/progress
GET, PUT, DELETE     /api/v1/goals/{goal_id}
POST, GET            /api/v1/inventory/movements
GET, PUT, DELETE     /api/v1/inventory/movements/{movement_id}
POST, GET            /api/v1/loyalty
GET                  /api/v1/loyalty/client/{client_id}
POST                 /api/v1/loyalty/client/{client_id}/redeem
GET                  /api/v1/loyalty/report
GET, PUT, DELETE     /api/v1/loyalty/{loyalty_id}
GET                  /api/v1/notifications
DELETE               /api/v1/notifications/all
PUT                  /api/v1/notifications/mark-all-read
GET                  /api/v1/notifications/unread-count
DELETE               /api/v1/notifications/{notification_id}
PUT                  /api/v1/notifications/{notification_id}/mark-read
POST, GET            /api/v1/online-booking/availability
GET                  /api/v1/online-booking/config
PUT                  /api/v1/online-booking/config
POST, GET            /api/v1/online-booking/gallery
PUT, DELETE          /api/v1/online-booking/gallery/{image_id}
GET                  /api/v1/online-booking/links
GET                  /api/v1/online-booking/services/available
GET                  /api/v1/online-booking/services/unavailable
PUT                  /api/v1/online-booking/services/{service_id}/availability
POST, GET            /api/v1/packages
POST, GET            /api/v1/packages/predefined
GET, PUT, DELETE     /api/v1/packages/predefined/{package_id}
GET, PUT             /api/v1/packages/{package_id}
POST                 /api/v1/packages/{package_id}/use-session
POST, GET            /api/v1/payments
GET, POST            /api/v1/payments/plans
PUT                  /api/v1/payments/plans/{plan_id}
GET, POST            /api/v1/payments/subscriptions
POST                 /api/v1/payments/webhook
POST                 /api/v1/payments/webhook/{gateway}
GET, PUT, DELETE     /api/v1/payments/{payment_id}
POST                 /api/v1/payments/{payment_id}/refund
GET                  /api/v1/plans
POST                 /api/v1/plans/
GET                  /api/v1/plans/subscription/can-add-professional
GET                  /api/v1/plans/subscription/check-feature/{feature}
GET                  /api/v1/plans/subscription/current
POST                 /api/v1/plans/subscription/downgrade
GET                  /api/v1/plans/subscription/limits
POST                 /api/v1/plans/subscription/upgrade
GET                  /api/v1/plans/subscription/usage
PUT, DELETE          /api/v1/plans/{plan_id}
GET                  /api/v1/plans/{plan_slug}
POST, GET            /api/v1/products
GET, POST            /api/v1/products/brands
GET, PUT, DELETE     /api/v1/products/brands/{brand_id}
GET, POST            /api/v1/products/categories
GET, PUT, DELETE     /api/v1/products/categories/{category_id}
GET, PUT, DELETE     /api/v1/products/{product_id}
POST                 /api/v1/products/{product_id}/adjust-stock
POST, GET            /api/v1/professionals
GET                  /api/v1/professionals/public
GET, PUT, DELETE     /api/v1/professionals/{professional_id}
GET                  /api/v1/professionals/{professional_id}/schedule
GET                  /api/v1/professionals/{professional_id}/statistics
POST, GET            /api/v1/promotions
GET, PUT, DELETE     /api/v1/promotions/{promotion_id}
POST                 /api/v1/promotions/{promotion_id}/activate
POST                 /api/v1/promotions/{promotion_id}/apply
POST                 /api/v1/promotions/{promotion_id}/deactivate
POST, GET            /api/v1/purchases
POST, GET            /api/v1/purchases/suppliers
GET, PUT, DELETE     /api/v1/purchases/suppliers/{supplier_id}
GET, PUT, DELETE     /api/v1/purchases/{purchase_id}
POST                 /api/v1/purchases/{purchase_id}/finish
GET                  /api/v1/push/logs
POST                 /api/v1/push/send-to-company
POST                 /api/v1/push/send-to-user
GET                  /api/v1/push/stats
POST                 /api/v1/push/subscribe
GET                  /api/v1/push/subscriptions
DELETE               /api/v1/push/subscriptions/{subscription_id}
POST                 /api/v1/push/test
GET                  /api/v1/push/vapid-public-key
GET                  /api/v1/reports/by-client
GET                  /api/v1/reports/by-professional
GET                  /api/v1/reports/by-service
GET                  /api/v1/reports/commissions
GET                  /api/v1/reports/consolidated
GET                  /api/v1/reports/expenses
GET                  /api/v1/reports/financial-results
GET                  /api/v1/reports/revenue-forecast
POST, GET            /api/v1/resources
GET, PUT, DELETE     /api/v1/resources/{resource_id}
POST, GET            /api/v1/reviews
GET                  /api/v1/reviews/professional/{professional_id}/stats
PUT, DELETE          /api/v1/reviews/{review_id}
POST                 /api/v1/reviews/{review_id}/approve
POST                 /api/v1/reviews/{review_id}/reject
POST                 /api/v1/reviews/{review_id}/response
GET                  /api/v1/saas-admin/addons/stats
GET                  /api/v1/saas-admin/analytics/growth
GET                  /api/v1/saas-admin/analytics/revenue
GET                  /api/v1/saas-admin/companies
GET, PUT             /api/v1/saas-admin/companies/{company_id}
GET, PUT             /api/v1/saas-admin/companies/{company_id}/subscription
POST                 /api/v1/saas-admin/companies/{company_id}/toggle-status
POST                 /api/v1/saas-admin/impersonate/{company_id}
GET                  /api/v1/saas-admin/metrics/overview
GET                  /api/v1/saas-admin/plans
GET                  /api/v1/saas-admin/plans/{plan_id}
GET                  /api/v1/saas-admin/users
POST                 /api/v1/saas-admin/users/{user_id}/promote-saas
POST, GET            /api/v1/services
GET, POST            /api/v1/services/categories
PUT                  /api/v1/services/categories/{category_id}
GET                  /api/v1/services/public
GET, PUT, DELETE     /api/v1/services/{service_id}
GET, PUT             /api/v1/settings/admin
GET                  /api/v1/settings/all
GET, PUT             /api/v1/settings/details
GET, PUT             /api/v1/settings/financial
GET, PUT             /api/v1/settings/notifications
GET, PUT             /api/v1/settings/theme
GET                  /api/v1/standalone-services/
GET                  /api/v1/standalone-services/check-included/{slug}
GET                  /api/v1/standalone-services/{slug}
GET                  /api/v1/subscription-sales
POST                 /api/v1/subscription-sales/
POST, GET            /api/v1/subscription-sales/models
GET, PUT, DELETE     /api/v1/subscription-sales/models/{model_id}
GET, PUT, DELETE     /api/v1/subscription-sales/{subscription_id}
POST                 /api/v1/subscription-sales/{subscription_id}/pause
GET                  /api/v1/subscription-sales/{subscription_id}/payments
POST                 /api/v1/subscription-sales/{subscription_id}/renew
POST                 /api/v1/subscription-sales/{subscription_id}/resume
POST                 /api/v1/uploads/clients/{client_id}/avatar
POST                 /api/v1/uploads/documents
POST                 /api/v1/uploads/documents/templates/{template_id}/file
POST                 /api/v1/uploads/images
POST                 /api/v1/uploads/products/{product_id}/image
POST                 /api/v1/uploads/professionals/{professional_id}/avatar
POST                 /api/v1/uploads/services/{service_id}/image
DELETE               /api/v1/uploads/{filename}
GET, POST            /api/v1/users
GET, PUT             /api/v1/users/me
GET                  /api/v1/users/professionals/available
GET, PUT, DELETE     /api/v1/users/{user_id}
GET                  /api/v1/whatsapp-marketing/automated-campaigns
GET, PUT             /api/v1/whatsapp-marketing/automated-campaigns/{campaign_type}
POST                 /api/v1/whatsapp-marketing/automated-campaigns/{campaign_type}/reset
GET                  /api/v1/whatsapp-marketing/automated-campaigns/{campaign_type}/stats
POST                 /api/v1/whatsapp-marketing/automated-campaigns/{campaign_type}/toggle
POST, GET            /api/v1/whatsapp/campaigns
GET, PUT, DELETE     /api/v1/whatsapp/campaigns/{campaign_id}
GET                  /api/v1/whatsapp/campaigns/{campaign_id}/logs
POST                 /api/v1/whatsapp/campaigns/{campaign_id}/send
POST                 /api/v1/whatsapp/campaigns/{campaign_id}/toggle-auto
GET, POST            /api/v1/whatsapp/providers
GET                  /api/v1/whatsapp/providers/connection-status
PUT, DELETE          /api/v1/whatsapp/providers/{provider_id}
POST, GET            /api/v1/whatsapp/templates
GET, PUT, DELETE     /api/v1/whatsapp/templates/{template_id}
GET                  /health
"""

def analyze():
    print("\n" + "=" * 80)
    print(" ANALISE COMPLETA DE ENDPOINTS DO SISTEMA VPS")
    print("=" * 80)
    
    lines = [l.strip() for l in endpoints_raw.strip().split('\n') if l.strip()]
    
    # Contar operacoes
    total_operations = 0
    methods_count = defaultdict(int)
    categories = defaultdict(list)
    paths_unique = set()
    
    for line in lines:
        parts = line.split(None, 1)
        if len(parts) < 2:
            continue
        
        methods_str = parts[0]
        path = parts[1]
        paths_unique.add(path)
        
        methods = [m.strip() for m in methods_str.split(',')]
        
        for method in methods:
            total_operations += 1
            methods_count[method] += 1
            
            # Categorizar
            path_parts = path.split('/')
            if len(path_parts) >= 3 and path_parts[1] == 'api':
                category = path_parts[3] if len(path_parts) > 3 else 'v1'
            else:
                category = 'root'
            
            categories[category].append({
                'method': method,
                'path': path
            })
    
    # Estatisticas gerais
    print(f"\nURL: http://72.62.138.239")
    print("\n" + "=" * 80)
    print(" ESTATISTICAS GERAIS")
    print("=" * 80)
    print(f"\nTotal de Paths (URLs unicas):  {len(paths_unique)}")
    print(f"Total de Operacoes:            {total_operations}")
    print(f"\nDistribuicao por Metodo HTTP:")
    for method in sorted(methods_count.keys()):
        print(f"  {method:8} {methods_count[method]:4} operacoes")
    
    # Top categorias
    print("\n" + "=" * 80)
    print(" TOP 15 CATEGORIAS COM MAIS ENDPOINTS")
    print("=" * 80)
    
    sorted_categories = sorted(categories.items(), key=lambda x: len(x[1]), reverse=True)
    for i, (category, endpoints) in enumerate(sorted_categories[:15], 1):
        # Contar paths unicos na categoria
        unique_paths = len(set(ep['path'] for ep in endpoints))
        print(f"{i:2}. {category:30} {len(endpoints):4} ops / {unique_paths:3} paths")
    
    # Recursos CRUD principais
    print("\n" + "=" * 80)
    print(" PRINCIPAIS RECURSOS CRUD (com contagem de operacoes)")
    print("=" * 80)
    
    crud_resources = {
        'appointments': 'Agendamentos',
        'clients': 'Clientes',
        'services': 'Servicos',
        'professionals': 'Profissionais',
        'companies': 'Empresas',
        'users': 'Usuarios',
        'products': 'Produtos',
        'payments': 'Pagamentos',
        'financial': 'Financeiro',
        'expenses': 'Despesas',
        'commissions': 'Comissoes',
        'packages': 'Pacotes',
        'promotions': 'Promocoes',
        'reviews': 'Avaliacoes',
        'documents': 'Documentos',
        'notifications': 'Notificacoes',
        'reports': 'Relatorios',
        'whatsapp': 'WhatsApp',
        'push': 'Push Notifications',
        'inventory': 'Estoque',
        'goals': 'Metas',
        'loyalty': 'Fidelidade'
    }
    
    for resource_key, resource_name in sorted(crud_resources.items()):
        resource_endpoints = [
            ep for cat, eps in categories.items() 
            for ep in eps 
            if resource_key in ep['path'].lower()
        ]
        if resource_endpoints:
            methods_in_resource = defaultdict(int)
            for ep in resource_endpoints:
                methods_in_resource[ep['method']] += 1
            
            methods_str = ', '.join([f"{m}:{c}" for m, c in sorted(methods_in_resource.items())])
            print(f"\n{resource_name:25} {len(resource_endpoints):3} ops")
            print(f"  {'':25} {methods_str}")
    
    # Endpoints de autenticacao
    print("\n" + "=" * 80)
    print(" ENDPOINTS DE AUTENTICACAO")
    print("=" * 80)
    
    for line in lines:
        if 'auth' in line.lower():
            print(f"  {line}")
    
    # Endpoints SaaS Admin
    print("\n" + "=" * 80)
    print(" ENDPOINTS SAAS ADMIN")
    print("=" * 80)
    
    saas_admin_count = 0
    for line in lines:
        if 'saas-admin' in line.lower():
            print(f"  {line}")
            saas_admin_count += 1
    
    print(f"\nTotal: {saas_admin_count} operacoes de administracao SaaS")
    
    # Resumo final
    print("\n" + "=" * 80)
    print(" RESUMO FINAL")
    print("=" * 80)
    print(f"\nO sistema VPS possui:")
    print(f"  - {len(paths_unique)} endpoints (paths unicos)")
    print(f"  - {total_operations} operacoes HTTP totais")
    print(f"  - {len(categories)} categorias de recursos")
    print(f"\nPrincipais metodos:")
    for method in ['GET', 'POST', 'PUT', 'DELETE']:
        if method in methods_count:
            pct = (methods_count[method] / total_operations) * 100
            print(f"  - {method}: {methods_count[method]} ({pct:.1f}%)")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    analyze()
