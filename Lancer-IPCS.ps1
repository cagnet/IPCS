[CmdletBinding()]
param(
    [int]$Port = 4173
)

$ErrorActionPreference = "Stop"
$projectDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$applicationUrl = "http://127.0.0.1:$Port/"
$serverProcess = $null

function Find-PythonRuntime {
    $pythonLauncher = Get-Command py -ErrorAction SilentlyContinue
    if ($pythonLauncher) {
        return @{ FilePath = $pythonLauncher.Source; Arguments = @("-3", "-m", "http.server", $Port, "--bind", "127.0.0.1") }
    }

    $python = Get-Command python -ErrorAction SilentlyContinue
    if ($python) {
        return @{ FilePath = $python.Source; Arguments = @("-m", "http.server", $Port, "--bind", "127.0.0.1") }
    }

    $python3 = Get-Command python3 -ErrorAction SilentlyContinue
    if ($python3) {
        return @{ FilePath = $python3.Source; Arguments = @("-m", "http.server", $Port, "--bind", "127.0.0.1") }
    }

    return $null
}

try {
    $runtime = Find-PythonRuntime
    if (-not $runtime) {
        throw "Python 3 est requis. Installez Python depuis https://www.python.org/downloads/ puis relancez ce fichier."
    }

    Write-Host ""
    Write-Host "  IPCS - Interactive Pinball Circuit Simulator" -ForegroundColor Cyan
    Write-Host "  Dossier : $projectDirectory"
    Write-Host "  Adresse : $applicationUrl"
    Write-Host ""

    $serverProcess = Start-Process `
        -FilePath $runtime.FilePath `
        -ArgumentList $runtime.Arguments `
        -WorkingDirectory $projectDirectory `
        -WindowStyle Hidden `
        -PassThru

    Start-Sleep -Milliseconds 800
    if ($serverProcess.HasExited) {
        throw "Le serveur local ne peut pas demarrer. Verifiez que le port $Port est disponible."
    }

    Start-Process $applicationUrl
    Write-Host "  Application ouverte dans votre navigateur." -ForegroundColor Green
    Write-Host "  Appuyez sur Entree pour arreter IPCS." -ForegroundColor Yellow
    [void](Read-Host)
}
catch {
    Write-Host ""
    Write-Host "Erreur : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Appuyez sur Entree pour fermer."
    [void](Read-Host)
    exit 1
}
finally {
    if ($serverProcess -and -not $serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
