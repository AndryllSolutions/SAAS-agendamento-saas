# Favicon do Atendo

## Arquivos Criados

- **favicon.svg** - Ícone vetorial SVG (recomendado para navegadores modernos)
- **favicon.ico** - Ícone ICO para compatibilidade com navegadores antigos
- **apple-touch-icon.png** - Ícone para dispositivos Apple (placeholder)

## Design

O favicon apresenta:
- Letra "A" (de Atendo) em branco
- Fundo com gradiente verde (#10b981 → #059669)
- Formato circular moderno
- Ponto decorativo representando agendamento

## Como Gerar Ícones PNG/ICO de Alta Qualidade

### Opção 1: Online (Recomendado)
1. Acesse https://realfavicongenerator.net/
2. Faça upload do `favicon.svg`
3. Baixe o pacote completo de ícones
4. Substitua os arquivos em `/public`

### Opção 2: ImageMagick (Local)
```powershell
# Instale ImageMagick: https://imagemagick.org/script/download.php
cd frontend
.\scripts\generate-favicon.ps1
```

### Opção 3: Sharp (Node.js)
```bash
npm install -g sharp-cli
sharp -i public/favicon.svg -o public/favicon.ico resize 32 32
sharp -i public/favicon.svg -o public/apple-touch-icon.png resize 180 180
```

## Navegadores Suportados

- **Modernos** (Chrome, Firefox, Safari, Edge): Usam `favicon.svg`
- **Antigos** (IE11, etc.): Usam `favicon.ico`
- **iOS/Safari**: Usam `apple-touch-icon.png`

## Personalização

Para alterar o favicon, edite `public/favicon.svg` e regenere os outros formatos.
