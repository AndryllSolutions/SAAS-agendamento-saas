"""
Script para verificar compatibilidade do Python com todas as bibliotecas
Execute: python test_compatibility.py
"""
import sys

def check_python_version():
    """Verifica se a versão do Python é compatível"""
    python_version = sys.version_info
    version_str = f"{python_version.major}.{python_version.minor}.{python_version.micro}"
    
    print("=" * 60)
    print("🔍 VERIFICAÇÃO DE COMPATIBILIDADE PYTHON")
    print("=" * 60)
    print(f"\n📌 Python: {version_str}")
    
    # Verificar se é 3.11
    if python_version.major == 3 and python_version.minor == 11:
        if python_version.micro >= 9:
            print("✅ Versão Python compatível! (3.11.9+)")
        else:
            print("⚠️ Versão Python 3.11.x (recomendado 3.11.9+)")
    elif python_version.major == 3 and python_version.minor >= 12:
        print("⚠️ Python 3.12+ pode ter problemas com algumas bibliotecas")
        print("   Recomendado: Python 3.11.9")
    elif python_version.major == 3 and python_version.minor < 11:
        print("❌ Versão Python muito antiga")
        print("   Recomendado: Python 3.11.9")
    else:
        print("❌ Versão Python não suportada")
    
    return python_version

def check_library(name, import_name=None, version_attr='__version__'):
    """Verifica se uma biblioteca está instalada e sua versão"""
    if import_name is None:
        import_name = name
    
    try:
        module = __import__(import_name)
        if hasattr(module, version_attr):
            version = getattr(module, version_attr)
            print(f"✅ {name}: {version}")
            return True
        else:
            print(f"✅ {name}: instalado (versão não disponível)")
            return True
    except ImportError as e:
        print(f"❌ {name}: NÃO INSTALADO - {e}")
        return False

def main():
    """Função principal"""
    python_version = check_python_version()
    
    print("\n" + "=" * 60)
    print("📦 VERIFICAÇÃO DE BIBLIOTECAS")
    print("=" * 60)
    
    # Bibliotecas críticas
    print("\n🔴 Bibliotecas Críticas:")
    critical_libs = [
        ("FastAPI", "fastapi"),
        ("SQLAlchemy", "sqlalchemy"),
        ("Pydantic", "pydantic"),
        ("Uvicorn", "uvicorn"),
        ("Celery", "celery"),
        ("argon2-cffi", "argon2"),
    ]
    
    critical_ok = True
    for name, import_name in critical_libs:
        if not check_library(name, import_name):
            critical_ok = False
    
    # Bibliotecas secundárias
    print("\n🟡 Bibliotecas Secundárias:")
    secondary_libs = [
        ("psycopg2", "psycopg2"),
        ("Redis", "redis"),
        ("Pandas", "pandas"),
        ("Pillow", "PIL"),
        ("Alembic", "alembic"),
        ("JWT", "jose"),
        ("Passlib", "passlib"),
    ]
    
    for name, import_name in secondary_libs:
        check_library(name, import_name)
    
    # Resumo
    print("\n" + "=" * 60)
    print("📊 RESUMO")
    print("=" * 60)
    
    if python_version.major == 3 and python_version.minor == 11:
        print("✅ Python 3.11.x detectado - Versão recomendada!")
    elif python_version.major == 3 and python_version.minor >= 12:
        print("⚠️ Python 3.12+ detectado - Pode ter problemas")
        print("   Considere usar Python 3.11.9")
    else:
        print("❌ Versão Python não recomendada")
        print("   Use Python 3.11.9")
    
    if critical_ok:
        print("✅ Todas as bibliotecas críticas estão instaladas")
    else:
        print("❌ Algumas bibliotecas críticas estão faltando")
        print("   Execute: pip install -r requirements.txt")
    
    print("=" * 60)

if __name__ == "__main__":
    main()


