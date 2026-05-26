# Run as user from D:\PersonalAI\phone-remote in an elevated PowerShell.
$ErrorActionPreference = "Stop"

$root = (Resolve-Path "$PSScriptRoot\..").Path
$venv = "$root\.venv"

if (-not (Test-Path $venv)) {
    python -m venv $venv
}

& "$venv\Scripts\pip.exe" install -e "$root[laptop]"

# Build the PWA
Push-Location "$root\pwa"
npm install
npm run build
Pop-Location

# Firewall rule for TCP 8765 (Private profile only)
New-NetFirewallRule -DisplayName "phone-remote-agent" -Direction Inbound `
    -Action Allow -Protocol TCP -LocalPort 8765 -Profile Private -ErrorAction SilentlyContinue

# Task Scheduler entry — runs at logon, restarts on failure
$action = New-ScheduledTaskAction `
    -Execute "$venv\Scripts\pythonw.exe" `
    -Argument "-m agents.laptop.main" `
    -WorkingDirectory $root
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName "PhoneRemoteLaptopAgent" `
    -Action $action -Trigger $trigger -Settings $settings -Force

Write-Host "Installed. Start the task with:  Start-ScheduledTask -TaskName PhoneRemoteLaptopAgent"
