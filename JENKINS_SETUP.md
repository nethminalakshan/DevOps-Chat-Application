# Jenkins Integration Guide

This guide will help you set up Jenkins CI/CD pipeline for the DevOps Chat Application.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Jenkins Installation](#jenkins-installation)
- [Jenkins Configuration](#jenkins-configuration)
- [Pipeline Setup](#pipeline-setup)
- [Webhook Configuration](#webhook-configuration)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up Jenkins, ensure you have:

1. **Jenkins Server** (version 2.400+)
2. **Docker** installed on Jenkins server
3. **Git** installed on Jenkins server
4. **Node.js** (version 20+)
5. **Docker Hub Account** (or other container registry)
6. **GitHub Account** with repository access

## Jenkins Installation

### Option 1: Install Jenkins on Ubuntu/Debian

```bash
# Update system
sudo apt update

# Install Java
sudo apt install openjdk-11-jdk -y

# Add Jenkins repository
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'

# Install Jenkins
sudo apt update
sudo apt install jenkins -y

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Check status
sudo systemctl status jenkins
```

### Option 2: Run Jenkins in Docker

```bash
# Create Jenkins volume
docker volume create jenkins_home

# Run Jenkins container
docker run -d \
  --name jenkins \
  -p 8090:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --restart unless-stopped \
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Option 3: Run Jenkins with Docker Compose

Create `jenkins-docker-compose.yml`:

```yaml
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    privileged: true
    user: root
    ports:
  - "8090:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
    environment:
      - JENKINS_OPTS=--prefix=/jenkins
    restart: unless-stopped

volumes:
  jenkins_home:
```

Run:
```bash
docker-compose -f jenkins-docker-compose.yml up -d
```

## Jenkins Configuration

### 1. Initial Setup

1. Access Jenkins at `http://localhost:8090`
2. Enter the initial admin password
3. Install suggested plugins
4. Create admin user

### 2. Install Required Plugins

Go to **Manage Jenkins** → **Manage Plugins** → **Available**

Install these plugins:
- **Pipeline**
- **Git Plugin**
- **GitHub Plugin**
- **Docker Plugin**
- **Docker Pipeline**
- **NodeJS Plugin**
- **Credentials Binding Plugin**
- **Blue Ocean** (optional, for better UI)
- **Email Extension Plugin** (for notifications)

### 3. Configure NodeJS

1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Scroll to **NodeJS**
3. Click **Add NodeJS**
   - Name: `NodeJS 20`
   - Version: Select NodeJS 20.x
   - Install automatically: ✓
4. Save

### 4. Configure Docker

If running Jenkins in Docker, Docker should already be available. To verify:

```bash
# Inside Jenkins container
docker --version
```

### 5. Add Credentials

Go to **Manage Jenkins** → **Manage Credentials** → **Global** → **Add Credentials**

#### Docker Hub Credentials
- Kind: `Username with password`
- Username: Your Docker Hub username
- Password: Your Docker Hub password or access token
- ID: `dockerhub-credentials`
- Description: `Docker Hub Credentials`

#### GitHub Credentials
- Kind: `Username with password` or `Secret text` (for token)
- Username: Your GitHub username
- Password: Personal Access Token
- ID: `github-credentials`
- Description: `GitHub Credentials`

#### Environment File (Optional)
- Kind: `Secret file`
- File: Upload your `.env` file
- ID: `chat-app-env-file`
- Description: `Chat App Environment Variables`

## Pipeline Setup

### 1. Create a New Pipeline Job

1. Click **New Item**
2. Enter name: `chat-app-pipeline`
3. Select **Pipeline**
4. Click **OK**

### 2. Configure Pipeline

#### General Settings
- Description: `CI/CD Pipeline for Chat Application`
- ✓ GitHub project
  - Project url: `https://github.com/nethminalakshan/DevOps-Chat-Application`

#### Build Triggers
- ✓ GitHub hook trigger for GITScm polling
- ✓ Poll SCM (optional): `H/5 * * * *` (every 5 minutes)

#### Pipeline Definition
- Definition: `Pipeline script from SCM`
- SCM: `Git`
  - Repository URL: `https://github.com/nethminalakshan/DevOps-Chat-Application.git`
  - Credentials: Select your GitHub credentials
  - Branch Specifier: `*/main`
- Script Path: `Jenkinsfile`

### 3. Update Jenkinsfile

Update the following in `Jenkinsfile`:

```groovy
environment {
    DOCKER_HUB_USERNAME = 'YOUR_DOCKERHUB_USERNAME' // Change this
}
```

### 4. Save and Build

1. Click **Save**
2. Click **Build Now**
3. View build progress in **Blue Ocean** or **Console Output**

## Webhook Configuration

### GitHub Webhook Setup

1. Go to your GitHub repository
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Configure:
  - Payload URL: `http://YOUR_JENKINS_URL:8090/github-webhook/`
   - Content type: `application/json`
   - Events: `Just the push event`
   - ✓ Active
4. Click **Add webhook**

**Note:** If Jenkins is on localhost, use a service like **ngrok** to expose it:

```bash
ngrok http 8080
```

Then use the ngrok URL in webhook.

## Environment Variables

### Create .env File

Create a `.env` file in the project root (don't commit this to Git):

```bash
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# JWT
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# App
NODE_ENV=production
PORT=5000
CLIENT_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf
```

### Add to Jenkins

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Add as **Secret file** with ID: `chat-app-env-file`

## Pipeline Stages Explained

### 1. Checkout
- Clones the repository
- Gets commit information

### 2. Install Dependencies
- Installs npm packages for backend and frontend in parallel

### 3. Lint & Code Quality
- Runs linting checks (configure ESLint/Prettier if needed)

### 4. Run Tests
- Executes unit and integration tests

### 5. Build Frontend
- Creates production build of React app

### 6. Build Docker Images
- Builds Docker images for backend and frontend

### 7. Security Scan
- Scans images for vulnerabilities (optional, requires Trivy)

### 8. Push to Docker Hub
- Pushes images to Docker Hub (only on main branch)

### 9. Deploy
- Deploys to development or production environment

## Optional Enhancements

### 1. Install Trivy for Security Scanning

```bash
# On Jenkins server
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy
```

Uncomment the security scan stages in Jenkinsfile.

### 2. Email Notifications

Configure email in **Manage Jenkins** → **Configure System** → **Extended E-mail Notification**

Uncomment the email sections in Jenkinsfile post stages.

### 3. Multi-Branch Pipeline

For better branch management:
1. Create **New Item** → **Multibranch Pipeline**
2. Add GitHub source
3. Jenkins will automatically detect branches with Jenkinsfile

### 4. SonarQube Integration

```groovy
stage('SonarQube Analysis') {
    steps {
        script {
            def scannerHome = tool 'SonarScanner'
            withSonarQubeEnv('SonarQube') {
                sh "${scannerHome}/bin/sonar-scanner"
            }
        }
    }
}
```

## Troubleshooting

### Docker Permission Issues

```bash
# Add Jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Node/NPM Not Found

- Ensure NodeJS plugin is installed
- Configure Node in Global Tool Configuration
- Reference correct Node version in Jenkinsfile tools section

### Docker Images Not Building

```bash
# Check Docker is running
docker ps

# Check Docker permissions
docker run hello-world
```

### Webhook Not Triggering

- Check webhook delivery in GitHub settings
- Ensure Jenkins URL is accessible
- Verify GitHub plugin is installed
- Check Jenkins logs: **Manage Jenkins** → **System Log**

### Build Failures

1. Check Console Output for detailed errors
2. Verify all credentials are configured
3. Check environment variables
4. Ensure Docker daemon is running

## Best Practices

1. **Use .gitignore** - Don't commit sensitive data
2. **Branch Strategy** - Use develop/staging/main branches
3. **Automated Testing** - Add comprehensive test suites
4. **Security Scans** - Enable Trivy or similar tools
5. **Backup Jenkins** - Regularly backup Jenkins home directory
6. **Monitor Resources** - Ensure adequate server resources
7. **Use Docker Compose** - For consistent environments
8. **Version Tags** - Tag Docker images with build numbers
9. **Rollback Strategy** - Keep previous image versions
10. **Documentation** - Keep this guide updated

## Useful Commands

```bash
# View Jenkins logs
docker logs -f jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Check Jenkins port
netstat -tuln | grep 8080

# Clean Docker images
docker image prune -f

# View running containers
docker ps

# Stop all containers
docker stop $(docker ps -aq)
```

## Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)

## Support

For issues or questions:
1. Check Jenkins logs
2. Review console output
3. Consult Jenkins documentation
4. Check project issues on GitHub
