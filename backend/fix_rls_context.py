"""
Script para adicionar set_tenant_context automaticamente em todos os endpoints autenticados
"""
import re
from pathlib import Path

def add_tenant_context_to_endpoint(file_path: Path):
    """Adiciona set_tenant_context aos endpoints que usam get_current_active_user"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Verificar se já tem a importação
    has_import = 'from app.core.tenant_context import set_tenant_context' in content
    
    # Padrão para detectar funções async com current_user e get_db
    pattern = r'(async def \w+\([^)]*current_user[^)]*Depends\(get_current_active_user\)[^)]*db: Session = Depends\(get_db\)[^)]*\):[\s]*"""[^"]*""")'
    
    matches = list(re.finditer(pattern, content))
    
    if not matches:
        return False, "Nenhum endpoint encontrado"
    
    modified = False
    new_content = content
    
    for match in reversed(matches):  # Processar de trás para frente para não afetar índices
        func_end = match.end()
        
        # Verificar se já tem set_tenant_context logo após a docstring
        next_lines = content[func_end:func_end+200]
        if 'set_tenant_context' in next_lines:
            continue  # Já tem, pular
        
        # Adicionar código após a docstring
        insert_code = '\n    from app.core.tenant_context import set_tenant_context\n    \n    # Set tenant context for RLS\n    if current_user.company_id:\n        set_tenant_context(db, current_user.company_id)\n    '
        
        new_content = new_content[:func_end] + insert_code + new_content[func_end:]
        modified = True
    
    if modified:
        # Adicionar importação se necessário
        if not has_import:
            # Adicionar após outras importações
            import_pos = content.find('from app.core.database import get_db')
            if import_pos > 0:
                import_end = content.find('\n', import_pos) + 1
                new_content = new_content[:import_end] + 'from app.core.tenant_context import set_tenant_context\n' + new_content[import_end:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True, f"Modificado com sucesso: {len(matches)} endpoints"
    
    return False, "Nenhuma modificação necessária"


def main():
    """Processar todos os arquivos de endpoints"""
    endpoints_dir = Path('app/api/v1/endpoints')
    
    results = []
    
    for file_path in endpoints_dir.glob('*.py'):
        if file_path.name == '__init__.py':
            continue
        
        try:
            modified, message = add_tenant_context_to_endpoint(file_path)
            results.append((file_path.name, modified, message))
        except Exception as e:
            results.append((file_path.name, False, f"Erro: {e}"))
    
    # Mostrar resultados
    print("=" * 60)
    print("RESULTADOS DA CORREÇÃO DE RLS")
    print("=" * 60)
    
    for filename, modified, message in results:
        status = "OK" if modified else "SKIP"
        print(f"[{status}] {filename}: {message}")
    
    print()
    print(f"Total processado: {len(results)}")
    print(f"Modificados: {sum(1 for _, m, _ in results if m)}")
    print(f"Pulados: {sum(1 for _, m, _ in results if not m)}")


if __name__ == "__main__":
    main()
