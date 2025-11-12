# Jenkins Management Script for Windows
# Run this in PowerShell

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'logs', 'password', 'setup', 'help')]
    [string]$Action = 'help'
)

$JENKINS_COMPOSE_FILE = "jenkins-docker-compose.yml"
$JENKINS_CONTAINER = "jenkins-server"

function Show-Help {
    Write-Host "
Jenkins Management Script
========================

Usage: .\jenkins.ps1 <action>

Actions:
  start      - Start Jenkins server
  stop       - Stop Jenkins server
  restart    - Restart Jenkins server
  status     - Show Jenkins status
  logs       - View Jenkins logs
  password   - Get initial admin password
  setup      - Setup Docker in Jenkins container
  help       - Show this help message

Examples:
  .\jenkins.ps1 start
  .\jenkins.ps1 logs
  .\jenkins.ps1 password

After starting Jenkins:
  1. Access at http://localhost:8080
  2. Get password: .\jenkins.ps1 password
  3. Complete web setup
  4. Setup Docker: .\jenkins.ps1 setup
" -ForegroundColor Cyan
}

function Start-Jenkins {
    Write-Host "Starting Jenkins server..." -ForegroundColor Green
    wsl docker-compose -f $JENKINS_COMPOSE_FILE up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Jenkins started successfully!" -ForegroundColor Green
        Write-Host "Access Jenkins at: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "Get password with: .\jenkins.ps1 password" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Failed to start Jenkins" -ForegroundColor Red
    }
}

function Stop-Jenkins {
    Write-Host "Stopping Jenkins server..." -ForegroundColor Yellow
    wsl docker-compose -f $JENKINS_COMPOSE_FILE down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Jenkins stopped successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to stop Jenkins" -ForegroundColor Red
    }
}

function Restart-Jenkins {
    Write-Host "Restarting Jenkins server..." -ForegroundColor Yellow
    wsl docker restart $JENKINS_CONTAINER
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Jenkins restarted successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to restart Jenkins" -ForegroundColor Red
    }
}

function Get-JenkinsStatus {
    Write-Host "Jenkins Status:" -ForegroundColor Cyan
    wsl docker ps -a --filter "name=$JENKINS_CONTAINER" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

function Show-Logs {
    Write-Host "Showing Jenkins logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    wsl docker logs -f $JENKINS_CONTAINER
}

function Get-Password {
    Write-Host "Getting initial admin password..." -ForegroundColor Cyan
    $password = wsl docker exec $JENKINS_CONTAINER cat /var/jenkins_home/secrets/initialAdminPassword 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "
Initial Admin Password:
======================
$password
======================
" -ForegroundColor Green
        Write-Host "Copy this password and paste it at http://localhost:8080" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Could not get password. Is Jenkins running?" -ForegroundColor Red
        Write-Host "Start Jenkins with: .\jenkins.ps1 start" -ForegroundColor Yellow
    }
}

function Setup-Docker {
    Write-Host "Setting up Docker in Jenkins container..." -ForegroundColor Cyan
    wsl docker exec -it $JENKINS_CONTAINER bash /workspace/jenkins/setup-jenkins.sh
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker setup completed!" -ForegroundColor Green
    } else {
        Write-Host "✗ Docker setup failed" -ForegroundColor Red
    }
}

# Main execution
switch ($Action) {
    'start'    { Start-Jenkins }
    'stop'     { Stop-Jenkins }
    'restart'  { Restart-Jenkins }
    'status'   { Get-JenkinsStatus }
    'logs'     { Show-Logs }
    'password' { Get-Password }
    'setup'    { Setup-Docker }
    'help'     { Show-Help }
    default    { Show-Help }
}
