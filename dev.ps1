<#
.SYNOPSIS
    Script Mestre de Orquestracao para Desenvolvimento Local - Clinica Odontologica.
.DESCRIPTION
    Gerencia o ciclo de vida dos servicos (Oracle 23ai Free, Backend FastAPI e Frontend Next.js).
.PARAMETER Mode
    Modo de execucao: 'all' (padrao), 'db', 'backend', 'frontend', 'stop'.
.EXAMPLE
    .\dev.ps1
    .\dev.ps1 -Mode db
    .\dev.ps1 -Mode backend
    .\dev.ps1 -Mode frontend
    .\dev.ps1 -Mode stop
#>

[CmdletBinding()]
param(
    [ValidateSet("all", "db", "backend", "frontend", "seed", "stop")]
    [string]$Mode = "all"
)

$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $PSScriptRoot

function Test-PortOpen {
    param([string]$Server = "localhost", [int]$Port = 1521, [int]$TimeoutMs = 1000)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $connect = $tcpClient.BeginConnect($Server, $Port, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne($TimeoutMs, $false)
        if ($wait -and $tcpClient.Connected) {
            $tcpClient.EndConnect($connect)
            $tcpClient.Close()
            return $true
        }
        $tcpClient.Close()
        return $false
    } catch {
        return $false
    }
}

function Stop-PortProcess {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $procIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $procIds) {
            if ($procId -gt 0) {
                try {
                    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
                    if ($proc) {
                        Write-Host "   -> Encerrando $($proc.ProcessName) (PID: $procId) na porta $Port..." -ForegroundColor Yellow
                        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                    }
                } catch { }
            }
        }
    }
}

switch ($Mode) {
    "db" {
        Write-Host "`n[Clinica-Odonto] Iniciando banco de dados Oracle 23ai Free..." -ForegroundColor Cyan
        docker compose up -d database
        docker compose ps database
    }

    "backend" {
        Write-Host "`n[Clinica-Odonto] Iniciando Backend API (FastAPI)..." -ForegroundColor Cyan
        Set-Location "$PSScriptRoot\backend"
        & ".\.venv\Scripts\uvicorn.exe" src.main:app --reload --port 8000
    }

    "frontend" {
        Write-Host "`n[Clinica-Odonto] Iniciando Frontend (Next.js)..." -ForegroundColor Cyan
        Set-Location "$PSScriptRoot\frontend"
        npm run dev
    }

    "seed" {
        Write-Host "`n[Clinica-Odonto] Executando Seed de Usuarios com Argon2id..." -ForegroundColor Cyan
        Set-Location "$PSScriptRoot\backend"
        & ".\.venv\Scripts\python.exe" scripts/seed_users.py
    }

    "stop" {
        Write-Host "`n=======================================================" -ForegroundColor Red
        Write-Host " [Clinica-Odonto] Encerrando todos os servicos locais" -ForegroundColor Red
        Write-Host "=======================================================" -ForegroundColor Red

        Write-Host "1. Finalizando processos na porta 8000 (Backend API)..." -ForegroundColor Gray
        Stop-PortProcess -Port 8000

        Write-Host "2. Finalizando processos na porta 3000 (Frontend Next.js)..." -ForegroundColor Gray
        Stop-PortProcess -Port 3000

        Write-Host "3. Parando conteineres Docker..." -ForegroundColor Gray
        docker compose stop

        Write-Host "`nServicos encerrados com sucesso!" -ForegroundColor Green
    }

    "all" {
        Write-Host "`n=================================================================" -ForegroundColor Cyan
        Write-Host "       Clinica Odontologica - Ambiente Fullstack Local           " -ForegroundColor Cyan
        Write-Host "=================================================================" -ForegroundColor Cyan

        # 1. Inicia o banco de dados
        Write-Host "`n[1/3] Iniciando Oracle 23ai Free via Docker Compose..." -ForegroundColor Yellow
        docker compose up -d database

        # 2. Aguarda o listener da porta 1521
        Write-Host "   -> Aguardando listener do Oracle na porta 1521..." -NoNewline -ForegroundColor Gray
        $maxAttempts = 30
        $attempt = 0
        $dbReady = $false

        while (-not $dbReady -and $attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 1
            $dbReady = Test-PortOpen -Server "localhost" -Port 1521 -TimeoutMs 1000
            $attempt++
            Write-Host "." -NoNewline -ForegroundColor Gray
        }

        if ($dbReady) {
            Write-Host " [OK]" -ForegroundColor Green
        } else {
            Write-Host " [AVISO: Listener ainda inicializando; prosseguindo...]" -ForegroundColor Yellow
        }

        # 3. Dispara o Backend FastAPI em janela dedicada
        Write-Host "`n[2/3] Abrindo janela dedicada para o Backend (FastAPI)..." -ForegroundColor Yellow
        $backendCmd = "`$Host.UI.RawUI.WindowTitle = '[Clinica-Odonto] Backend API (FastAPI)'; Set-Location '$PSScriptRoot\backend'; .\.venv\Scripts\uvicorn.exe src.main:app --reload --port 8000"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

        # 4. Dispara o Frontend Next.js em janela dedicada
        Write-Host "`n[3/3] Abrindo janela dedicada para o Frontend (Next.js)..." -ForegroundColor Yellow
        $frontendCmd = "`$Host.UI.RawUI.WindowTitle = '[Clinica-Odonto] Frontend (Next.js)'; Set-Location '$PSScriptRoot\frontend'; npm run dev"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

        # 5. Painel ASCII de Informacoes e Links
        Start-Sleep -Milliseconds 800
        Write-Host "`n=================================================================" -ForegroundColor Green
        Write-Host "         TODOS OS SERVICOS FORAM DISPARADOS COM SUCESSO!         " -ForegroundColor Green
        Write-Host "=================================================================" -ForegroundColor Green
        Write-Host "                                                                 "
        Write-Host "   * Frontend Web (Next.js):     http://localhost:3000           " -ForegroundColor Cyan
        Write-Host "   * Backend Swagger (FastAPI):  http://localhost:8000/docs      " -ForegroundColor Cyan
        Write-Host "   * Backend Health Endpoint:    http://localhost:8000/health    " -ForegroundColor Cyan
        Write-Host "   * Oracle 23ai Free PDB:       localhost:1521/FREEPDB1         " -ForegroundColor Cyan
        Write-Host "                                                                 "
        Write-Host "   * Credenciais de Teste (Senha padrao: Odonto@2026):           " -ForegroundColor Yellow
        Write-Host "     - Admin:    admin@clinica.com (Dr. Roberto Carlos)          " -ForegroundColor Gray
        Write-Host "     - Dentista: dra.ana@clinica.com (Dra. Ana Beatriz Silva)    " -ForegroundColor Gray
        Write-Host "     - Recepcao: recepcao@clinica.com (Mariana Costa)            " -ForegroundColor Gray
        Write-Host "                                                                 "
        Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray
        Write-Host "  Dica: Para parar todos os servicos, execute em outro terminal: " -ForegroundColor Yellow
        Write-Host "        .\dev.ps1 -Mode stop                                     " -ForegroundColor White
        Write-Host "=================================================================`n" -ForegroundColor Green
    }
}
