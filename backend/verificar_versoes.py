#!/usr/bin/env python3
"""
Script para verificar se todas as versões no requirements.txt existem no PyPI
"""
import subprocess
import re
import sys

def check_package_version(package_line):
    """Verifica se uma versão específica de um pacote existe"""
    # Parse linha: "package==version" ou "package[extra]==version"
    match = re.match(r'^([^\s=]+)==([^\s]+)', package_line.strip())
    if not match:
        return None, None
    
    package = match.group(1)
    version = match.group(2)
    
    # Remove comentários
    if '#' in package:
        return None, None
    
    return package, version

def check_version_exists(package, version):
    """Verifica se a versão existe no PyPI"""
    try:
        result = subprocess.run(
            ['pip', 'index', 'versions', package],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            # Procura pela versão na saída
            return version in result.stdout
        else:
            # Fallback: tenta instalar para ver se funciona
            result = subprocess.run(
                ['pip', 'install', f'{package}=={version}', '--dry-run'],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.returncode == 0
    except Exception as e:
        print(f"Erro ao verificar {package}=={version}: {e}")
        return None

def main():
    print("🔍 Verificando versões no requirements.txt...")
    print()
    
    with open('requirements.txt', 'r') as f:
        lines = f.readlines()
    
    issues = []
    checked = []
    
    for line_num, line in enumerate(lines, 1):
        package, version = check_package_version(line)
        
        if package and version:
            checked.append((line_num, package, version))
    
    print(f"📦 Verificando {len(checked)} pacotes...")
    print()
    
    for line_num, package, version in checked:
        print(f"Verificando {package}=={version}...", end=' ')
        exists = check_version_exists(package, version)
        
        if exists is False:
            print("❌ NÃO ENCONTRADO")
            issues.append((line_num, package, version))
        elif exists is True:
            print("✅ OK")
        else:
            print("⚠️  Não foi possível verificar")
    
    print()
    if issues:
        print("❌ Problemas encontrados:")
        for line_num, package, version in issues:
            print(f"  Linha {line_num}: {package}=={version}")
        return 1
    else:
        print("✅ Todas as versões parecem estar corretas!")
        return 0

if __name__ == '__main__':
    sys.exit(main())
