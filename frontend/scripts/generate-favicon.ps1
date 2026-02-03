# Script para gerar favicon.ico
# Este script cria um favicon basico em formato ICO

Write-Host "Gerando favicon para Atendo..." -ForegroundColor Green

$publicDir = Join-Path $PSScriptRoot "..\public"

# Criar um favicon.ico simples usando ImageMagick se disponivel
$imageMagickPath = Get-Command magick -ErrorAction SilentlyContinue

if ($imageMagickPath) {
    Write-Host "ImageMagick encontrado. Convertendo SVG para ICO..." -ForegroundColor Yellow
    
    $svgPath = Join-Path $publicDir "favicon.svg"
    $icoPath = Join-Path $publicDir "favicon.ico"
    
    # Gerar favicon.ico em multiplos tamanhos (16x16, 32x32, 48x48)
    magick convert -background none -density 256 $svgPath -define icon:auto-resize=16,32,48 $icoPath
    
    Write-Host "Favicon.ico gerado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "ImageMagick nao encontrado." -ForegroundColor Yellow
    Write-Host "Opcoes:" -ForegroundColor Cyan
    Write-Host "1. Instale ImageMagick: https://imagemagick.org/script/download.php" -ForegroundColor White
    Write-Host "2. Use um conversor online: https://convertio.co/svg-ico/" -ForegroundColor White
    Write-Host "3. Use o favicon.svg diretamente (navegadores modernos suportam)" -ForegroundColor White
}

Write-Host "`nArquivos criados em: $publicDir" -ForegroundColor Cyan
