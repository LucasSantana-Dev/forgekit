param(
  [switch]$EnableWSL = $true
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

& "$Root\scripts\install-windows.ps1" -EnableWSL:$EnableWSL

Write-Host ""
Write-Host "Bootstrap do Windows concluído."
Write-Host ""
Write-Host "Autentique as ferramentas quando abrir o terminal/WSL:"
Write-Host "  gh auth login"
Write-Host "  opencode auth login"
Write-Host "  claude"
Write-Host ""
Write-Host "Recomendado: abrir Ubuntu/WSL e rodar:"
Write-Host "  ./bootstrap.sh"
