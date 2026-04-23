param(
  [switch]$EnableWSL = $true
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  throw "winget não encontrado. Instale o App Installer da Microsoft Store."
}

$packages = @(
  "Microsoft.WindowsTerminal",
  "Git.Git",
  "GitHub.cli",
  "Anthropic.ClaudeCode",
  "OpenJS.NodeJS.LTS",
  "Python.Python.3.12",
  "BurntSushi.ripgrep.MSVC",
  "sharkdp.fd",
  "junegunn.fzf"
)

foreach ($pkg in $packages) {
  winget install --id $pkg --accept-package-agreements --accept-source-agreements --silent
}

if (Get-Command npm -ErrorAction SilentlyContinue) {
  npm install -g opencode-ai
}

if ($EnableWSL) {
  wsl --install -d Ubuntu
}
