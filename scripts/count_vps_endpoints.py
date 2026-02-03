"""
Script para contar e categorizar todos os endpoints do sistema VPS
"""
import requests
import json
from collections import defaultdict
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

VPS_URL = "http://72.62.138.239"

def analyze_endpoints():
    """Analisa todos os endpoints da API"""
    print("\n" + "=" * 80)
    print(" ANALISE COMPLETA DE ENDPOINTS DO SISTEMA VPS")
    print("=" * 80)
    print(f"\nURL: {VPS_URL}")
    
    try:
        response = requests.get(f"{VPS_URL}/openapi.json", timeout=10, verify=False)
        
        if response.status_code != 200:
            print(f"\nErro ao buscar documentacao: {response.status_code}")
            return
        
        openapi = response.json()
        paths = openapi.get('paths', {})
        
        # Estatisticas gerais
        total_paths = len(paths)
        total_operations = 0
        methods_count = defaultdict(int)
        categories = defaultdict(list)
        
        # Analisar cada path
        for path, methods in paths.items():
            for method, details in methods.items():
                if method.upper() in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']:
                    total_operations += 1
                    methods_count[method.upper()] += 1
                    
                    # Categorizar por prefixo
                    parts = path.split('/')
                    if len(parts) >= 3:
                        category = parts[2] if parts[2] else 'root'
                    else:
                        category = 'root'
                    
                    categories[category].append({
                        'path': path,
                        'method': method.upper(),
                        'summary': details.get('summary', 'N/A')
                    })
        
        # Imprimir estatisticas gerais
        print("\n" + "=" * 80)
        print(" ESTATISTICAS GERAIS")
        print("=" * 80)
        print(f"\nTotal de Paths (URLs):     {total_paths}")
        print(f"Total de Operacoes:        {total_operations}")
        print(f"\nDistribuicao por Metodo HTTP:")
        for method in sorted(methods_count.keys()):
            print(f"  {method:8} {methods_count[method]:4} operacoes")
        
        # Imprimir por categoria
        print("\n" + "=" * 80)
        print(" ENDPOINTS POR CATEGORIA")
        print("=" * 80)
        
        for category in sorted(categories.keys()):
            endpoints = categories[category]
            print(f"\n[{category.upper()}] - {len(endpoints)} operacoes")
            
            # Agrupar por path
            paths_in_category = defaultdict(list)
            for ep in endpoints:
                paths_in_category[ep['path']].append(ep['method'])
            
            for path in sorted(paths_in_category.keys()):
                methods_list = ', '.join(sorted(paths_in_category[path]))
                print(f"  {methods_list:20} {path}")
        
        # Top 10 categorias com mais endpoints
        print("\n" + "=" * 80)
        print(" TOP 10 CATEGORIAS COM MAIS ENDPOINTS")
        print("=" * 80)
        
        sorted_categories = sorted(categories.items(), key=lambda x: len(x[1]), reverse=True)
        for i, (category, endpoints) in enumerate(sorted_categories[:10], 1):
            print(f"{i:2}. {category:30} {len(endpoints):4} operacoes")
        
        # Endpoints de autenticacao
        print("\n" + "=" * 80)
        print(" ENDPOINTS DE AUTENTICACAO")
        print("=" * 80)
        
        auth_endpoints = [ep for cat, eps in categories.items() for ep in eps if 'auth' in ep['path'].lower()]
        for ep in sorted(auth_endpoints, key=lambda x: x['path']):
            print(f"  {ep['method']:8} {ep['path']}")
            print(f"           {ep['summary']}")
        
        # Endpoints CRUD principais
        print("\n" + "=" * 80)
        print(" PRINCIPAIS RECURSOS CRUD")
        print("=" * 80)
        
        crud_resources = [
            'appointments', 'clients', 'services', 'professionals',
            'companies', 'users', 'products', 'payments', 'financial'
        ]
        
        for resource in crud_resources:
            resource_endpoints = [
                ep for cat, eps in categories.items() 
                for ep in eps 
                if resource in ep['path'].lower()
            ]
            if resource_endpoints:
                print(f"\n{resource.upper()}: {len(resource_endpoints)} operacoes")
                
                # Contar por metodo
                methods_in_resource = defaultdict(int)
                for ep in resource_endpoints:
                    methods_in_resource[ep['method']] += 1
                
                methods_str = ', '.join([f"{m}:{c}" for m, c in sorted(methods_in_resource.items())])
                print(f"  Metodos: {methods_str}")
        
        # Salvar relatorio detalhado
        report = {
            'total_paths': total_paths,
            'total_operations': total_operations,
            'methods_count': dict(methods_count),
            'categories': {cat: len(eps) for cat, eps in categories.items()},
            'all_endpoints': []
        }
        
        for category, endpoints in categories.items():
            for ep in endpoints:
                report['all_endpoints'].append({
                    'category': category,
                    'method': ep['method'],
                    'path': ep['path'],
                    'summary': ep['summary']
                })
        
        with open('RELATORIO_ENDPOINTS_VPS.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print("\n" + "=" * 80)
        print(" RESUMO FINAL")
        print("=" * 80)
        print(f"\nO sistema possui {total_operations} operacoes distribuidas em {total_paths} paths.")
        print(f"Relatorio detalhado salvo em: RELATORIO_ENDPOINTS_VPS.json")
        print("\n" + "=" * 80)
        
    except Exception as e:
        print(f"\nErro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    analyze_endpoints()
