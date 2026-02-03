-- Fix para adicionar colunas faltantes na tabela financial_accounts
-- Execute este SQL no pgAdmin, DBeaver ou qualquer cliente PostgreSQL

-- Verificar se as colunas já existem (opcional)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'financial_accounts' 
ORDER BY ordinal_position;

-- Adicionar colunas faltantes (só executa se não existirem)
DO $$
BEGIN
    -- Adicionar account_type se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_accounts' AND column_name = 'account_type'
    ) THEN
        ALTER TABLE financial_accounts ADD COLUMN account_type VARCHAR(50) NOT NULL DEFAULT 'cash';
        RAISE NOTICE 'Coluna account_type adicionada';
    ELSE
        RAISE NOTICE 'Coluna account_type já existe';
    END IF;

    -- Adicionar balance se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_accounts' AND column_name = 'balance'
    ) THEN
        ALTER TABLE financial_accounts ADD COLUMN balance NUMERIC(10,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Coluna balance adicionada';
    ELSE
        RAISE NOTICE 'Coluna balance já existe';
    END IF;

    -- Adicionar is_active se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_accounts' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE financial_accounts ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Coluna is_active adicionada';
    ELSE
        RAISE NOTICE 'Coluna is_active já existe';
    END IF;
END $$;

-- Criar índice para is_active se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'financial_accounts' AND indexname = 'ix_financial_accounts_is_active'
    ) THEN
        CREATE INDEX ix_financial_accounts_is_active ON financial_accounts (is_active);
        RAISE NOTICE 'Índice ix_financial_accounts_is_active criado';
    ELSE
        RAISE NOTICE 'Índice ix_financial_accounts_is_active já existe';
    END IF;
END $$;

-- Verificar resultado final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'financial_accounts' 
ORDER BY ordinal_position;

-- Inserir algumas contas padrão se a tabela estiver vazia
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM financial_accounts) = 0 THEN
        INSERT INTO financial_accounts (company_id, name, account_type, balance, is_active, admin_only) VALUES
        (1, 'Caixa Principal', 'cash', 0, true, false),
        (1, 'Banco Itaú', 'bank', 0, true, false),
        (1, 'Cartão Visa', 'credit_card', 0, true, true);
        RAISE NOTICE 'Contas padrão inseridas';
    END IF;
END $$;

COMMIT;

RAISE NOTICE '✅ Fix financeiro aplicado com sucesso! O módulo financeiro deve funcionar agora.';
