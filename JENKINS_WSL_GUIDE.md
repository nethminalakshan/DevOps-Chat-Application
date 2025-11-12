# Jenkins Setup for WSL Environment

This guide is specifically for setting up Jenkins in a WSL (Windows Subsystem for Linux) environment.

## Prerequisites

1. **WSL 2** installed and configured
2. **Docker Desktop** with WSL 2 backend enabled
3. **Git** in WSL

## Quick Start with WSL

### 1. Start Jenkins Using WSL

Open PowerShell and run:

```powershell
wsl docker compose -f jenkins-docker-compose.yml up -d
```

Or directly in WSL terminal:

```bash
docker compose -f jenkins-docker-compose.yml up -d
```

### 2. Get Initial Admin Password

From PowerShell:
```powershell
wsl docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
```

From WSL:
```bash
docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
```

### 3. Access Jenkins

Open browser: http://localhost:8090

### 4. Setup Docker in Jenkins Container

From WSL terminal:
```bash
docker exec -it jenkins-server bash
apt-get update
apt-get install -y docker.io docker-compose
exit
```

## WSL-Specific Commands

### Start Jenkins
```bash
# In WSL or PowerShell with wsl prefix
docker compose -f jenkins-docker-compose.yml up -d
```

### Stop Jenkins
```bash
docker compose -f jenkins-docker-compose.yml down
```

### View Logs
```bash
docker logs -f jenkins-server
```

### Restart Jenkins
```bash
docker restart jenkins-server
```

### Check Status
```bash
docker ps | grep jenkins
```

### Access Jenkins Container Shell
```bash
docker exec -it jenkins-server bash
```

## Configure Jenkins for WSL

### 1. Install Required Plugins

In Jenkins web interface:
- Manage Jenkins → Manage Plugins → Available
- Install:
  - Pipeline
  - Git Plugin
  - GitHub Plugin
  - Docker Plugin
  - Docker Pipeline
  - NodeJS Plugin
  - Credentials Binding

### 2. Configure NodeJS

- Manage Jenkins → Global Tool Configuration
- NodeJS → Add NodeJS
  - Name: `NodeJS 20`
  - Version: 20.x
  - Install automatically: ✓

### 3. Add Docker Hub Credentials

- Manage Jenkins → Manage Credentials → Global → Add Credentials
- Kind: Username with password
- Username: Your Docker Hub username (e.g., `nethminalakshan`)
- Password: Your Docker Hub password or token
- ID: `dockerhub-credentials`
- Description: Docker Hub Credentials

### 4. Create Pipeline Job

1. New Item → Pipeline
2. Name: `chat-app-pipeline`
3. Pipeline:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: `https://github.com/nethminalakshan/DevOps-Chat-Application.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
4. Save

### 5. Configure GitHub Webhook (Optional)

For automatic builds on push:

1. Get your Jenkins URL (use ngrok if local):
   ```bash
   # In WSL
   ngrok http 8080
   ```

2. In GitHub repository:
   - Settings → Webhooks → Add webhook
   - Payload URL: `http://your-jenkins-url:8090/github-webhook/`
   - Content type: application/json
   - Events: Just the push event
   - Active: ✓

## WSL Docker Configuration

### Ensure Docker is Available in Jenkins

```bash
# Test Docker in Jenkins container
docker exec jenkins-server docker ps

# If permission denied, fix socket permissions
docker exec jenkins-server chmod 666 /var/run/docker.sock
```

### Verify Docker Compose

```bash
docker exec jenkins-server docker compose version
```

## Troubleshooting WSL Issues

### Docker not found in Jenkins

```bash
# Install Docker CLI in Jenkins
docker exec -it jenkins-server bash
apt-get update
apt-get install -y docker.io
docker --version
exit
```

### Permission denied on Docker socket

```bash
# Fix permissions
docker exec jenkins-server chmod 666 /var/run/docker.sock

# Or add jenkins user to docker group
docker exec jenkins-server usermod -aG docker jenkins
docker restart jenkins-server
```

### Cannot connect to Docker daemon

Check Docker Desktop is running with WSL 2 backend:
- Docker Desktop Settings → General
- ✓ Use the WSL 2 based engine

### Build fails with network issues

```bash
# Ensure containers are on same network
docker network ls
docker network inspect devops-chat-application_chat-app-network
```

### WSL 2 Performance Issues

```powershell
# In PowerShell as Admin
wsl --shutdown
# Restart Docker Desktop
```

## Build Your Project

### First Build

1. Open Jenkins: http://localhost:8090
2. Click on `chat-app-pipeline`
3. Click **Build Now**
4. Watch **Console Output**

### What Gets Built

The pipeline will:
1. ✅ Clone your repository
2. ✅ Install npm dependencies (parallel)
3. ✅ Run linting (if configured)
4. ✅ Run tests (if configured)
5. ✅ Build frontend production bundle
6. ✅ Build Docker images for backend and frontend
7. ✅ Push to Docker Hub (on main branch)
8. ✅ Deploy (if configured)

## Environment Variables

If you need environment variables in Jenkins:

### Option 1: Jenkins Credentials

1. Manage Jenkins → Manage Credentials
2. Add Secret text or Secret file
3. Use in Jenkinsfile with `credentials('id')`

### Option 2: Environment Variables

In pipeline configuration:
- Configure → Build Environment
- ✓ Inject environment variables

## Useful WSL Commands

```bash
# Check WSL version
wsl --version

# List WSL distributions
wsl --list --verbose

# Set default WSL distribution
wsl --set-default Ubuntu

# Access Windows files from WSL
cd /mnt/d/DevOps-Chat-Application

# Access WSL files from Windows
\\wsl$\Ubuntu\home\username

# Check Docker in WSL
docker ps
docker version

# View Jenkins from WSL
curl http://localhost:8090
```

## Monitoring and Logs

### Jenkins Logs
```bash
docker logs -f jenkins-server
```

### Application Logs (during deployment)
```bash
docker logs -f chat-app-backend
docker logs -f chat-app-frontend
docker logs -f chat-app-mongodb
```

### Check All Containers
```bash
docker ps -a
```

## Cleanup

### Remove Jenkins
```bash
docker compose -f jenkins-docker-compose.yml down -v
```

### Clean Docker Images
```bash
docker image prune -f
docker system prune -a
```

## Best Practices for WSL

1. **Use Docker Desktop WSL 2 Backend** - Better performance
2. **Store Projects in WSL** - Faster file access (optional)
3. **Regular Updates** - Keep WSL and Docker updated
4. **Resource Limits** - Configure in Docker Desktop settings
5. **Backup Jenkins** - Volume `jenkins_home` contains all data

## Next Steps

1. ✅ Jenkins running in WSL
2. ✅ Docker configured
3. ✅ Pipeline created
4. ⬜ Run first build
5. ⬜ Monitor build output
6. ⬜ Setup GitHub webhook
7. ⬜ Configure deployment

## Additional Resources

- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [Docker Desktop WSL 2](https://docs.docker.com/desktop/windows/wsl/)
- [Jenkins Docker](https://www.jenkins.io/doc/book/installing/docker/)

Happy building with WSL! 🚀
