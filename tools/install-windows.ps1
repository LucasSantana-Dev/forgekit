#Requires -RunAsAdministrator
<#
.SYNOPSIS
    AI Dev Toolkit — Windows Setup
.DESCRIPTION
    Installs productivity CLI tools via winget and scoop.
    Run as Administrator in PowerShell.
#>

$ErrorActionPreference = "Stop"

Write-Output "=== AI Dev Toolkit — Windows Setup ==="

$Installed = @()
$Skipped = @()

# Check for winget
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Output "ERROR: winget not found. Install App Installer from the Microsoft Store."
    exit 1
}

# Check for scoop (some tools are only on scoop)
$hasScoop = Get-Command scoop -ErrorAction SilentlyContinue
if (-not $hasScoop) {
    Write-Output "Installing Scoop package manager..."
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    & ([scriptblock]::Create((Invoke-RestMethod -Uri https://get.scoop.sh)))
    # Refresh PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "User") + ";" + $env:PATH
    $Installed += "scoop"
} else {
    Write-Output "[ok] Scoop already installed"
    $Skipped += "scoop"
}

Write-Output ""
Write-Output "=== Installing tools via winget ==="

$wingetPackages = @{
    "JesseDuffield.lazygit" = "lazygit"
    "junegunn.fzf" = "fzf"
    "dandavison.delta" = "delta"
    "sharkdp.bat" = "bat"
    "sharkdp.fd" = "fd"
    "BurntSushi.ripgrep" = "ripgrep"
    "jqlang.jq" = "jq"
    "aristocratos.btop" = "btop"
    "ajeetdsouza.zoxide" = "zoxide"
    "twpayne.chezmoi" = "chezmoi"
}

foreach ($pkg in $wingetPackages.GetEnumerator()) {
    $wingetId = $pkg.Key
    $toolName = $pkg.Value

    # Check if already installed
    $isInstalled = winget list --id $wingetId --accept-source-agreements 2>$null | Select-String $wingetId

    if ($isInstalled) {
        Write-Output "[ok] $toolName already installed"
        $Skipped += $toolName
    } else {
        Write-Output "Installing $toolName..."
        winget install --id $wingetId --accept-source-agreements --accept-package-agreements --silent 2>$null
        $Installed += $toolName
    }
}

Write-Output ""
Write-Output "=== Installing tools via scoop ==="

# Add buckets if not already added
$buckets = scoop bucket list 2>$null
if ($buckets -notcontains "extras") {
    scoop bucket add extras 2>$null
}
if ($buckets -notcontains "main") {
    scoop bucket add main 2>$null
}

$scoopPackages = @(
    "eza",
    "yq",
    "atuin"
)

foreach ($pkg in $scoopPackages) {
    # Check if already installed
    $isInstalled = scoop list $pkg 2>$null | Select-String "^$pkg "

    if ($isInstalled) {
        Write-Output "[ok] $pkg already installed"
        $Skipped += $pkg
    } else {
        Write-Output "Installing $pkg..."
        scoop install $pkg 2>$null

        # Scoop doesn't exit non-zero on failure, so check if it's now installed
        $installed = scoop list $pkg 2>$null | Select-String "^$pkg "
        if ($installed) {
            $Installed += $pkg
        }
    }
}

Write-Output ""
Write-Output "=== Configuring git delta ==="

git config --global core.pager delta
git config --global interactive.diffFilter "delta --color-only"
git config --global delta.navigate true
git config --global delta.side-by-side true
git config --global delta.line-numbers true
git config --global merge.conflictstyle zdiff3

Write-Output "[ok] Git delta configured"

Write-Output ""
Write-Output "=== Setting up atuin ==="
Write-Output "Run 'atuin register' or 'atuin login' to set up history sync."

Write-Output ""
Write-Output "=== Shell Integration ==="
Write-Output ""
Write-Output "Add to your PowerShell profile (`$PROFILE):"
Write-Output ""
Write-Output '  # fzf'
Write-Output '  Set-PSReadLineKeyHandler -Key Tab -ScriptBlock { Invoke-FzfTabCompletion }'
Write-Output ''
Write-Output '  # zoxide'
Write-Output '  Invoke-Expression (& { (zoxide init powershell | Out-String) })'
Write-Output ''
Write-Output '  # atuin'
Write-Output '  Invoke-Expression (& { (atuin init powershell | Out-String) })'
Write-Output ''
Write-Output '  # aliases'
Write-Output '  Set-Alias -Name lg -Value lazygit'
Write-Output '  function ll { eza -la --git @args }'
Write-Output '  function lt { eza -la --tree --level=2 --git @args }'
Write-Output '  Set-Alias -Name cat -Value bat -Option AllScope'
Write-Output ''

# Create PowerShell profile if it doesn't exist
if (-not (Test-Path $PROFILE)) {
    New-Item -Path $PROFILE -Type File -Force | Out-Null
    Write-Output "Created PowerShell profile at: $PROFILE"
}

# Ask to auto-configure profile
Write-Output ""
Write-Output "Auto-configure PowerShell profile? (y/n)"
$response = Read-Host
if ($response -eq 'y') {
    # Check if already configured
    $profileContent = Get-Content $PROFILE -Raw -ErrorAction SilentlyContinue
    if ($profileContent -notmatch "AI Dev Toolkit") {
        $newConfig = @'

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
        Add-Content -Path $PROFILE -Value $newConfig
        Write-Output "[ok] Profile updated. Restart PowerShell to apply."
    } else {
        Write-Output "[ok] Profile already configured"
    }
}

# Summary
Write-Output ""
Write-Output "=== Installation Summary ==="
Write-Output ""
if ($Installed.Count -gt 0) {
    Write-Output "Newly installed ($($Installed.Count)):"
    foreach ($item in $Installed) {
        Write-Output "  + $item"
    }
}

if ($Skipped.Count -gt 0) {
    Write-Output ""
    Write-Output "Already present ($($Skipped.Count)):"
    foreach ($item in $Skipped) {
        Write-Output "  - $item"
    }
}

Write-Output ""
Write-Output "=== Done! ==="
Write-Output "Restart your terminal to use all tools."
Write-Output "Key commands: lg (lazygit), z (zoxide), ll (eza), bat (syntax-highlighted cat)"
