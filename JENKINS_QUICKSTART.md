# Quick Start Guide - Jenkins Setup

This is a quick reference for setting up and running Jenkins for this project.

## Quick Setup (5 minutes)

### 1. Start Jenkins

Using WSL (recommended for Windows):

```bash
wsl docker-compose -f jenkins-docker-compose.yml up -d
```

### 2. Get Initial Password

```bash
wsl docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
```

### 3. Access Jenkins

Open browser: http://localhost:8080

### 4. Complete Setup

1. Enter the initial password
2. Click "Install suggested plugins"
3. Create admin user
4. Start using Jenkins!

### 5. Install Docker in Jenkins Container

```bash
wsl docker exec -it jenkins-server bash
bash /workspace/jenkins/setup-jenkins.sh
exit
```

### 6. Create Pipeline

1. Click **New Item**
2. Name: `chat-app-pipeline`
3. Type: **Pipeline**
4. Configuration:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/nethminalakshan/DevOps-Chat-Application.git`
   - Script Path: `Jenkinsfile`
5. Save and **Build Now**

## Essential Commands

```bash
# Start Jenkins
wsl docker-compose -f jenkins-docker-compose.yml up -d

# Stop Jenkins
wsl docker-compose -f jenkins-docker-compose.yml down

# View logs
wsl docker logs -f jenkins-server

# Restart Jenkins
wsl docker restart jenkins-server

# Get initial password
wsl docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
```

## Configure Docker Hub Credentials

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **Global** → **Add Credentials**
3. Kind: **Username with password**
4. Username: Your Docker Hub username
5. Password: Your Docker Hub password/token
6. ID: `dockerhub-credentials`
7. Save

## Update Jenkinsfile

Edit `Jenkinsfile` and change:

```groovy
DOCKER_HUB_USERNAME = 'your-dockerhub-username'  // ← Change this
```

## First Build

1. Open pipeline job
2. Click **Build Now**
3. Watch build in **Console Output**

## Troubleshooting

### Jenkins won't start
```bash
wsl docker logs jenkins-server
```

### Docker permission denied
```bash
wsl docker exec jenkins-server chmod 666 /var/run/docker.sock
```

### Build fails
- Check Console Output
- Verify Docker Hub credentials
- Ensure Docker is running

## Full Documentation

See `JENKINS_SETUP.md` for complete documentation.

## Next Steps

1. ✓ Jenkins running
2. ✓ Pipeline created
3. ⬜ Configure GitHub webhook
4. ⬜ Set up automatic builds
5. ⬜ Configure deployment

Happy building! 🚀
