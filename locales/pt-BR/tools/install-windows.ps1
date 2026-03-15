#Requires -RunAsAdministrator
<#
.SYNOPSIS
    AI Dev Toolkit — Windows Setup
.DESCRIPTION
    Installs productivity CLI tools via winget and scoop.
    Run as Administrator in PowerShell.
#>

$ErrorActionPreference = "Stop"

Write-Host "=== AI Dev Toolkit — Windows Setup ===" -ForegroundColor Cyan

# Check for winget
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "winget not found. Install App Installer from the Microsoft Store." -ForegroundColor Red
    exit 1
}

# Check for scoop (some tools are only on scoop)
$hasScoop = Get-Command scoop -ErrorAction SilentlyContinue
if (-not $hasScoop) {
    Write-Host "Installing Scoop package manager..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
    # Refresh PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "User") + ";" + $env:PATH
}

Write-Host "`n=== Installing tools via winget ===" -ForegroundColor Cyan

$wingetPackages = @(
    "JesseDuffield.lazygit",
    "junegunn.fzf",
    "dandavison.delta",
    "sharkdp.bat",
    "sharkdp.fd",
    "BurntSushi.ripgrep",
    "jqlang.jq",
    "aristocratos.btop",
    "ajeetdsouza.zoxide"
)

foreach ($pkg in $wingetPackages) {
    Write-Host "Installing $pkg..." -ForegroundColor Gray
    winget install --id $pkg --accept-source-agreements --accept-package-agreements --silent 2>$null
}

Write-Host "`n=== Installing tools via scoop ===" -ForegroundColor Cyan

scoop bucket add extras 2>$null
scoop bucket add main 2>$null

$scoopPackages = @(
    "eza",
    "yq",
    "atuin"
)

foreach ($pkg in $scoopPackages) {
    Write-Host "Installing $pkg..." -ForegroundColor Gray
    scoop install $pkg 2>$null
}

Write-Host "`n=== Configuring git delta ===" -ForegroundColor Cyan

git config --global core.pager delta
git config --global interactive.diffFilter "delta --color-only"
git config --global delta.navigate true
git config --global delta.side-by-side true
git config --global delta.line-numbers true
git config --global merge.conflictstyle zdiff3

Write-Host "`n=== Setting up atuin ===" -ForegroundColor Cyan
Write-Host "Run 'atuin register' or 'atuin login' to set up history sync."

Write-Host "`n=== Shell Integration ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Add to your PowerShell profile (`$PROFILE):" -ForegroundColor Yellow
Write-Host ""
Write-Host '  # fzf'
Write-Host '  Set-PSReadLineKeyHandler -Key Tab -ScriptBlock { Invoke-FzfTabCompletion }'
Write-Host ''
Write-Host '  # zoxide'
Write-Host '  Invoke-Expression (& { (zoxide init powershell | Out-String) })'
Write-Host ''
Write-Host '  # atuin'
Write-Host '  Invoke-Expression (& { (atuin init powershell | Out-String) })'
Write-Host ''
Write-Host '  # aliases'
Write-Host '  Set-Alias -Name lg -Value lazygit'
Write-Host '  function ll { eza -la --git @args }'
Write-Host '  function lt { eza -la --tree --level=2 --git @args }'
Write-Host '  Set-Alias -Name cat -Value bat -Option AllScope'
Write-Host ''

# Create PowerShell profile if it doesn't exist
if (-not (Test-Path $PROFILE)) {
    New-Item -Path $PROFILE -Type File -Force | Out-Null
    Write-Host "Created PowerShell profile at: $PROFILE" -ForegroundColor Green
}

# Ask to auto-configure profile
Write-Host "`nAuto-configure PowerShell profile? (y/n)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq 'y') {
    $profileContent = @'

# === AI Dev Toolkit ===
# zoxide (smart cd)
Invoke-Expression (& { (zoxide init powershell | Out-String) })

# aliases
Set-Alias -Name lg -Value lazygit
function ll { eza -la --git @args }
function lt { eza -la --tree --level=2 --git @args }
Set-Alias -Name cat -Value bat -Option AllScope
# === End AI Dev Toolkit ===
'@
    Add-Content -Path $PROFILE -Value $profileContent
    Write-Host "Profile updated. Restart PowerShell to apply." -ForegroundColor Green
}

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "Restart your terminal to use all tools."
Write-Host "Key commands: lg (lazygit), z (zoxide), ll (eza), bat (syntax-highlighted cat)"
