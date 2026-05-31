# lanpad tray icon — native Windows Forms, no Python deps needed
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$PORT = 8765
$ROOT = "D:\Claude Code AI\phone-remote"
$PYTHON = "$ROOT\.venv\Scripts\python.exe"
$BROWSER_URL = "http://192.168.0.121:$PORT"

$agentProc = $null

function Test-AgentRunning {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $PORT)
        $tcp.Close()
        return $true
    } catch { return $false }
}

function Start-Agent {
    if (-not (Test-AgentRunning)) {
        $script:agentProc = Start-Process -FilePath $PYTHON `
            -ArgumentList "-m agents.laptop.main" `
            -WorkingDirectory $ROOT `
            -WindowStyle Hidden `
            -PassThru
    }
}

function Stop-Agent {
    if ($script:agentProc -and -not $script:agentProc.HasExited) {
        $script:agentProc.Kill()
        $script:agentProc = $null
    }
    # also kill any orphan
    $conns = netstat -ano | Select-String ":$PORT\s.*LISTENING"
    foreach ($line in $conns) {
        $pid_ = ($line -split '\s+')[-1]
        Stop-Process -Id $pid_ -Force -ErrorAction SilentlyContinue
    }
}

# Build icon (green or red circle)
function New-Icon([bool]$green) {
    $bmp = New-Object System.Drawing.Bitmap(16, 16)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $color = if ($green) { [System.Drawing.Color]::FromArgb(0, 220, 100) } `
             else        { [System.Drawing.Color]::FromArgb(220, 60, 60) }
    $brush = New-Object System.Drawing.SolidBrush($color)
    $g.FillEllipse($brush, 1, 1, 13, 13)
    $g.Dispose()
    return [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
}

# Tray icon
$tray = New-Object System.Windows.Forms.NotifyIcon
$tray.Text = "lanpad"
$tray.Icon = New-Icon $false
$tray.Visible = $true

# Context menu
$menu = New-Object System.Windows.Forms.ContextMenuStrip
$menuOpen   = $menu.Items.Add("Open in browser")
$menu.Items.Add("-") | Out-Null
$menuStart  = $menu.Items.Add("Start agent")
$menuStop   = $menu.Items.Add("Stop agent")
$menu.Items.Add("-") | Out-Null
$menuExit   = $menu.Items.Add("Exit")

$tray.ContextMenuStrip = $menu

$menuOpen.add_Click({ Start-Process $BROWSER_URL })
$menuStart.add_Click({ Start-Agent })
$menuStop.add_Click({ Stop-Agent })
$menuExit.add_Click({
    $tray.Visible = $false
    [System.Windows.Forms.Application]::Exit()
})

# Double-click opens browser
$tray.add_DoubleClick({ Start-Process $BROWSER_URL })

# Poll timer — update icon color every 3s
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 3000
$timer.add_Tick({
    $running = Test-AgentRunning
    $tray.Icon = New-Icon $running
    $tray.Text = if ($running) { "lanpad — running" } else { "lanpad — stopped" }
})
$timer.Start()

# Auto-start agent on launch
Start-Agent

# Run message loop
[System.Windows.Forms.Application]::Run()
$tray.Visible = $false
