# MERN Stack Chat Application 💬

> **DevOps-Ready Real-time Chat Application with Full CI/CD Pipeline**

A production-ready, full-featured real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js), Socket.io, and OAuth authentication. Includes complete Docker containerization, Jenkins CI/CD pipeline, and AWS deployment infrastructure.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Docker Deployment](#-docker-deployment)
- [Jenkins CI/CD Pipeline](#-jenkins-cicd-pipeline)
- [AWS Deployment](#-aws-deployment)
- [API Documentation](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## ✨ Features

### Core Features
- 🔐 **Multiple Authentication Methods**
  - Email/Password authentication
  - OAuth with Google
  - OAuth with GitHub
- 💬 **Real-time Messaging** - Instant message delivery using Socket.io
- 👥 **Group Chats** - Create and manage group conversations
- 📁 **File Sharing** - Share images and files (up to 5MB)
- 🔍 **Message Search** - Search through your message history
- 😊 **Emoji Support** - Express yourself with emojis

### User Experience
- 👤 **User Profiles** - Customizable profiles with avatars and bio
- 🟢 **Online Status** - See who's online/offline in real-time
- ⌨️ **Typing Indicators** - Know when someone is typing
- 🔔 **Notifications** - Get notified about new messages
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS and animations

### DevOps Features
- 🐳 **Docker Containerization** - Multi-stage builds, optimized images
- 🔄 **Jenkins CI/CD** - Automated build, test, and deployment pipeline
- ☁️ **AWS Infrastructure** - Terraform-managed ECS, ALB, VPC deployment
- 📊 **Health Checks** - Container health monitoring
- 🔒 **Security Scanning** - Vulnerability checks in CI pipeline

---

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database
- **Socket.io** - Real-time communication
- **Passport.js** - OAuth authentication (Google, GitHub)
- **Passport-Local** - Email/Password authentication
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Validator** - Input validation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates
- **Emoji Picker React** - Emoji selection
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **date-fns** - Date formatting

### DevOps & Infrastructure
- **Docker** & **Docker Compose** - Containerization
- **Jenkins** - CI/CD automation
- **Terraform** - Infrastructure as Code
- **AWS ECS Fargate** - Container orchestration
- **AWS ALB** - Load balancing
- **AWS VPC** - Networking
- **CloudWatch** - Logging and monitoring
- **nginx** - Frontend web server

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB Atlas account** (or local MongoDB)
- **Git**
- **Docker** & **Docker Compose** (for containerization)
- **WSL 2** (for Windows users)

### OAuth Credentials
- **Google OAuth credentials** - [Get them here](https://console.cloud.google.com/)
- **GitHub OAuth credentials** - [Get them here](https://github.com/settings/developers)

### Optional (for deployment)
- **Jenkins** (for CI/CD)
- **AWS Account** (for cloud deployment)
- **Terraform** (for infrastructure management)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/DevOps-Chat-Application.git
cd DevOps-Chat-Application
```

### 2. Install Dependencies

```bash
# Install all dependencies for both server and client
npm run install-all

# Or install separately:
npm install          # Root dependencies
cd server && npm install
cd ../client && npm install
```

### 3. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy your Client ID and Client Secret

### 5. Set Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: Your App Name
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy your Client ID and Client Secret

### 6. Configure Environment Variables

Create a `.env` file in the `server` folder:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chat-app?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Session Secret
SESSION_SECRET=your_session_secret_change_this_in_production

# File Upload (5MB max)
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf
```

### 7. Run the Application

#### Development Mode (Recommended)

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:5173`

#### Run Separately

```bash
# Terminal 1 - Run server
npm run server

# Terminal 2 - Run client
npm run client
```

### 8. Access the Application

Open your browser and navigate to: `http://localhost:5173`

---

## 📁 Project Structure

```
DevOps-Chat-Application/
├── client/                    # React frontend
│   ├── public/
│   │   └── favicon.png       # Custom chat bubble icon
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── chat/        # Chat-specific components
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   ├── ConversationList.jsx
│   │   │   │   ├── MessageList.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── EnigmaChat.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Login.jsx    # Beautiful animated login
│   │   │   ├── Chat.jsx
│   │   │   └── AuthSuccess.jsx
│   │   ├── services/        # API & Socket services
│   │   │   ├── api.js
│   │   │   ├── socket.js
│   │   │   └── webrtc.js
│   │   ├── store/           # Zustand state management
│   │   │   ├── authStore.js
│   │   │   ├── chatStore.js
│   │   │   ├── notificationStore.js
│   │   │   └── themeStore.js
│   │   ├── config/          # Configuration files
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile           # Frontend Docker image
│   ├── nginx.conf           # Nginx configuration
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                   # Node.js backend
│   ├── config/              # Configuration files
│   │   ├── database.js      # MongoDB connection
│   │   └── passport.js      # OAuth strategies
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js          # JWT authentication
│   │   └── upload.js        # File upload
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── conversations.js
│   │   ├── messages.js
│   │   ├── notifications.js
│   │   └── ai.js
│   ├── socket/              # Socket.io handlers
│   │   └── socketHandler.js
│   ├── uploads/             # File uploads directory
│   ├── Dockerfile           # Backend Docker image
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env                 # Environment variables
│
├── terraform/               # Infrastructure as Code
│   ├── main.tf             # Main Terraform configuration
│   ├── variables.tf        # Variable definitions
│   ├── terraform.tfvars    # Variable values
│   └── (diagnostic scripts)
│
├── jenkins/                 # Jenkins configuration
│   ├── Dockerfile
│   ├── setup-jenkins.sh
│   └── install-jenkins-plugins.sh
│
├── docker-compose.yml       # Local development
├── jenkins-docker-compose.yml  # Jenkins server
├── Jenkinsfile             # CI/CD pipeline definition
├── package.json            # Root package.json
└── README.md              # This file
```

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### Using WSL (Windows)

```bash
# Open WSL
wsl

# Navigate to project
cd "/mnt/d/Projects/Academic Project/Semester 5/DevOps-Chat-Application/DevOps-Chat-Application"

# Start services
docker-compose up --build
```

### Access Dockerized Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017 (admin/admin123)

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Stop Services

```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Docker Architecture

The application uses multi-stage Docker builds:

**Frontend (client/Dockerfile):**
- Stage 1: Build React app with Vite
- Stage 2: Serve with Nginx
- Result: Lightweight production image

**Backend (server/Dockerfile):**
- Uses Node.js 18 Alpine (lightweight)
- Installs production dependencies only
- Exposes port 5000

**docker-compose.yml includes:**
- MongoDB container with persistent volume
- Backend container with environment variables
- Frontend container with Nginx
- Networking between all services

---

## 🔄 Jenkins CI/CD Pipeline

### Overview

Automated CI/CD pipeline that builds, tests, and can deploy your application on every Git push.

### Quick Start

#### 1. Start Jenkins

**Windows with WSL:**
```powershell
wsl docker-compose -f jenkins-docker-compose.yml up -d
```

#### 2. Get Initial Password

```powershell
wsl docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
```

#### 3. Access Jenkins

Open browser: `http://localhost:8090`

#### 4. Complete Setup

1. Enter the initial password
2. Click "Install suggested plugins"
3. Create admin user
4. Start using Jenkins

#### 5. Install Docker in Jenkins Container

```bash
wsl docker exec -it jenkins-server bash
apt-get update
apt-get install -y docker.io docker-compose
exit
```

### Configure Jenkins

#### Install Required Plugins

Go to **Manage Jenkins** → **Manage Plugins** → **Available**

Install:
- Pipeline
- Git Plugin
- GitHub Plugin
- Docker Plugin
- Docker Pipeline
- NodeJS Plugin
- Credentials Binding
- CloudBees AWS Credentials (optional, for AWS deployment)

#### Configure NodeJS

1. **Manage Jenkins** → **Global Tool Configuration**
2. **NodeJS** → **Add NodeJS**
   - Name: `NodeJS 20`
   - Version: 20.x
   - Install automatically: ✓
3. Save

#### Add Docker Hub Credentials

1. **Manage Jenkins** → **Manage Credentials** → **Global** → **Add Credentials**
2. Kind: `Username with password`
3. Username: Your Docker Hub username
4. Password: Your Docker Hub password or token
5. ID: `dockerhub-credentials`
6. Description: `Docker Hub Credentials`
7. Save

#### Add AWS Credentials (Optional - for automatic deployment)

1. **Manage Jenkins** → **Manage Credentials** → **Global** → **Add Credentials**
2. Kind: `AWS Credentials`
3. ID: `aws-credentials`
4. Access Key ID: Your AWS Access Key
5. Secret Access Key: Your AWS Secret Key
6. Save

### Create Pipeline Job

1. Click **New Item**
2. Name: `chat-app-pipeline`
3. Select **Pipeline**
4. Click **OK**
5. Configure:
   - **Build Triggers**: ✓ GitHub hook trigger for GITScm polling
   - **Pipeline** → Definition: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: Your GitHub repo URL
   - **Branch**: `*/main`
   - **Script Path**: `Jenkinsfile`
6. Save

### Update Jenkinsfile

Edit `Jenkinsfile` and update line 8:
```groovy
DOCKER_HUB_USERNAME = 'your-dockerhub-username'  // Change this
```

### Pipeline Stages

The Jenkins pipeline includes:

1. ✅ **Checkout** - Clone repository from GitHub
2. ✅ **Install Dependencies** - npm install (parallel for speed)
3. ✅ **Lint & Code Quality** - Code quality checks
4. ✅ **Run Tests** - Execute test suites
5. ✅ **Build Frontend** - Create Vite production build
6. ✅ **Build Docker Images** - Build backend and frontend images
7. ✅ **Security Scan** - Vulnerability scanning (optional)
8. ✅ **Push to Docker Hub** - Push images (main branch only)
9. ✅ **Deploy to AWS** - Deploy with Terraform (if credentials configured)

### GitHub Webhook Setup (for automatic builds)

#### Method 1: Using ngrok (for Local Jenkins)

1. **Install ngrok:**
   - Download from https://ngrok.com/download
   - Or: `choco install ngrok`

2. **Expose Jenkins:**
```powershell
cd C:\ngrok
.\ngrok http 8090
```

3. **Copy the URL** (e.g., `https://abc123.ngrok-free.app`)

4. **Configure GitHub Webhook:**
   - Go to your GitHub repository
   - Settings → Webhooks → Add webhook
   - **Payload URL**: `https://abc123.ngrok-free.app/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Just the push event
   - Active: ✓
   - Save

#### Method 2: Poll SCM (Fallback)

If webhook setup is complex, use Poll SCM:

1. Jenkins → Your pipeline → Configure
2. **Build Triggers** → ✓ **Poll SCM**
3. **Schedule**: `H/5 * * * *` (checks every 5 minutes)
4. Save

### Jenkins Commands

```powershell
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

# Access Jenkins shell
wsl docker exec -it jenkins-server bash
```

### Workflow with CI/CD

```
Developer (You)
    ↓
Git Commit & Push
    ↓
GitHub Repository
    ↓ (webhook or poll)
Jenkins Pipeline Triggered
    ↓
CI Stages (Build, Test, Docker Build)
    ↓
Push to Docker Hub
    ↓ (optional with AWS credentials)
Deploy to AWS ECS
    ↓
Application Live!
```

**Expected Timeline:**
- CI stages: 5-8 minutes
- With AWS deployment: 10-15 minutes total

---

## ☁️ AWS Deployment

### Overview

Deploy your application to AWS using Terraform for infrastructure management. Creates a production-ready environment with:
- VPC with 2 public subnets
- Application Load Balancer (ALB)
- ECS Fargate cluster
- CloudWatch logging
- Security groups

### Prerequisites

1. **AWS Account**
2. **AWS CLI** installed and configured
3. **Terraform** installed (v1.0+)
4. **Docker images** published to Docker Hub

### Setup AWS CLI

```bash
# Install AWS CLI (WSL)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### Deploy to AWS

#### Step 1: Navigate to Terraform Directory

```bash
cd terraform
```

#### Step 2: Update terraform.tfvars

Edit `terraform.tfvars` with your values:

```hcl
aws_region = "us-east-1"
project_name = "chat-app"

# Docker images
docker_image_backend = "your-dockerhub-username/chat-app-backend"
docker_image_frontend = "your-dockerhub-username/chat-app-frontend"
image_tag = "latest"

# MongoDB (Atlas)
mongodb_uri = "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chat-app"

# OAuth - Google
google_client_id = "your-google-client-id"
google_client_secret = "your-google-client-secret"
google_callback_url = "http://TEMP-WILL-UPDATE-AFTER-DEPLOY:5000/api/auth/google/callback"

# OAuth - GitHub
github_client_id = "your-github-client-id"
github_client_secret = "your-github-client-secret"
github_callback_url = "http://TEMP-WILL-UPDATE-AFTER-DEPLOY:5000/api/auth/github/callback"

# Secrets
jwt_secret = "your-jwt-secret-make-it-long-and-random"
session_secret = "your-session-secret-make-it-random"

# Client URL (will update after deployment)
client_url = "http://TEMP-WILL-UPDATE-AFTER-DEPLOY"
```

#### Step 3: Initialize Terraform

```bash
wsl terraform init
```

#### Step 4: Preview Changes

```bash
wsl terraform plan
```

#### Step 5: Deploy Infrastructure

```bash
wsl terraform apply -auto-approve
```

**Wait 5-10 minutes** for deployment to complete.

#### Step 6: Get Your Application URL

```bash
wsl terraform output frontend_url
```

Example output:
```
http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com
```

### Update OAuth Callback URLs

After deployment, you MUST update OAuth URLs:

#### Google OAuth Console

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. **Add Authorized JavaScript origins:**
   - `http://your-alb-dns`
   - `http://your-alb-dns:5000`
4. **Add Authorized redirect URIs:**
   - `http://your-alb-dns:5000/api/auth/google/callback`
5. Save

#### GitHub Developer Settings

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Find your OAuth App
3. **Update Homepage URL:** `http://your-alb-dns`
4. **Update Authorization callback URL:** `http://your-alb-dns:5000/api/auth/github/callback`
5. Update application

#### Update terraform.tfvars and Redeploy

```bash
# Edit terraform.tfvars with your ALB DNS
vim terraform.tfvars

# Update client_url, google_callback_url, github_callback_url

# Redeploy
wsl terraform apply -auto-approve
```

### AWS Infrastructure Components

**Created Resources:**
- VPC with DNS support
- 2 Public subnets (different AZs)
- Internet Gateway
- Route tables and associations
- Security groups (ALB + ECS)
- Application Load Balancer
- Target groups (frontend port 80, backend port 5000)
- ALB listeners
- ECS Fargate cluster
- ECS task definition (frontend + backend containers)
- ECS service with ALB integration
- IAM roles for ECS
- CloudWatch log groups

### Monitoring AWS Deployment

#### Check ECS Service Status

```bash
wsl aws ecs describe-services --cluster chat-app-cluster --services chat-app-service --region us-east-1
```

#### View Container Logs

```bash
# Backend logs
wsl aws logs tail /ecs/chat-app --region us-east-1 --follow --filter-pattern backend

# Frontend logs
wsl aws logs tail /ecs/chat-app --region us-east-1 --follow --filter-pattern frontend

# All logs
wsl aws logs tail /ecs/chat-app --region us-east-1 --follow
```

#### Check ALB Health

```bash
wsl aws elbv2 describe-load-balancers --region us-east-1
```

#### Check Target Health

```bash
wsl aws elbv2 describe-target-groups --region us-east-1
```

#### Force New Deployment (to pull latest images)

```bash
wsl aws ecs update-service \
  --cluster chat-app-cluster \
  --service chat-app-service \
  --force-new-deployment \
  --region us-east-1
```

### Cost Information

**Monthly Costs (Approximate):**
- ECS Fargate: ~$30/month (256 CPU, 512 MB RAM, 24/7)
- Application Load Balancer: ~$18-20/month
- Data Transfer: Variable (minimal for development)
- CloudWatch Logs: ~$1/month

**Total Estimate:** ~$40-50/month

**To Minimize Costs:**
```bash
# Destroy when not in use
wsl terraform destroy -auto-approve

# Recreate when needed
wsl terraform apply -auto-approve
```

### Teardown AWS Resources

```bash
cd terraform
wsl terraform destroy -auto-approve
```

---

## 🔑 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/github` | Initiate GitHub OAuth |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (with search) |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/status` | Update status |

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | Get all conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/:id` | Get conversation by ID |
| PUT | `/api/conversations/:id` | Update group conversation |
| DELETE | `/api/conversations/:id` | Delete conversation |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversation/:id` | Get messages |
| POST | `/api/messages` | Send text message |
| POST | `/api/messages/upload` | Upload file |
| GET | `/api/messages/search` | Search messages |
| PUT | `/api/messages/read/:conversationId` | Mark as read |
| DELETE | `/api/messages/:id` | Delete message |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get all notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Socket.io Events

**Client → Server:**
- `user:join` - User connects
- `conversation:join` - Join conversation room
- `conversation:leave` - Leave conversation room
- `message:send` - Send a message
- `typing:start` - Start typing
- `typing:stop` - Stop typing
- `message:read` - Mark messages as read
- `user:status:update` - Update user status

**Server → Client:**
- `message:new` - New message received
- `user:status` - User status changed
- `typing:update` - Typing indicator update
- `notification:new` - New notification
- `message:read` - Messages marked as read

---

## 🐛 Troubleshooting

### Development Environment

#### MongoDB Connection Error
**Problem:** Can't connect to MongoDB Atlas

**Solutions:**
- Check MongoDB URI format is correct
- Ensure IP is whitelisted in MongoDB Atlas (use `0.0.0.0/0` for development)
- Verify username and password are correct
- Check if cluster is active

#### OAuth Not Working
**Problem:** OAuth login fails or shows errors

**Solutions:**
- Check redirect URIs match exactly (including port)
- Ensure OAuth credentials are correct in `.env`
- Verify OAuth app is enabled in Google/GitHub console
- Check callback URLs don't have typos

#### Socket Connection Failed
**Problem:** Real-time features not working

**Solutions:**
- Check CORS settings in `server.js`
- Verify both servers are running (frontend and backend)
- Check browser console for WebSocket errors
- Verify port 5000 is not blocked by firewall

#### File Upload Fails
**Problem:** Cannot upload files

**Solutions:**
- Check file size (max 5MB)
- Verify file type is allowed
- Ensure `uploads/` directory exists in server folder
- Check disk space

### Docker Issues

#### Port Already in Use
```bash
# Stop existing containers
docker-compose down

# Find process using port (Linux/WSL)
sudo lsof -i :5000
sudo kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

#### Build Failed
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
docker-compose up
```

#### Cannot Connect to Backend
**Solutions:**
1. Check if backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify MongoDB connection in logs
4. Wait 30 seconds for services to fully start

### Jenkins Issues

#### Jenkins Won't Start
```bash
# Check logs
wsl docker logs jenkins-server

# Check if port 8090 is in use
netstat -ano | findstr :8090
```

#### Build Fails - Docker Permission Denied
```bash
# Fix Docker socket permissions
wsl docker exec jenkins-server chmod 666 /var/run/docker.sock
```

#### Build Fails - sudo Not Found
**Solution:** Already fixed in Jenkinsfile. Terraform installs locally without sudo.

#### Docker Hub Push Fails
**Problem:** `denied: requested access to the resource is denied`

**Solutions:**
- Verify Docker Hub credentials in Jenkins
- Check credential ID is exactly `dockerhub-credentials`
- Ensure Docker Hub username in Jenkinsfile matches your account

### AWS Deployment Issues

#### Application Not Loading
**Solutions:**
- Wait 2-3 minutes after deployment for tasks to fully start
- Check ECS service status
- View CloudWatch logs for errors
- Verify target health checks are passing

#### OAuth Not Working on AWS
**Problem:** OAuth login fails with `redirect_uri_mismatch`

**Solutions:**
- Update Google OAuth console with ALB DNS
- Update GitHub OAuth app with ALB DNS
- Update `terraform.tfvars` with correct URLs
- Redeploy: `terraform apply -auto-approve`

#### Target Health Check Failing
**Solutions:**
- Check application logs: `aws logs tail /ecs/chat-app --region us-east-1 --follow`
- Verify MongoDB connection works from AWS
- Check security groups allow traffic on ports 80 and 5000
- Ensure Docker images exist on Docker Hub

#### ECS Tasks Keep Restarting
**Solutions:**
- Check CloudWatch logs for errors
- Verify environment variables are correct
- Check MongoDB URI is accessible from AWS
- Ensure Docker images are valid and runnable

#### No AWS Credentials
**Problem:** Jenkins Terraform deployment fails with "No valid credential sources found"

**Solutions:**
- Add AWS credentials to Jenkins (ID: `aws-credentials`)
- Install CloudBees AWS Credentials plugin
- Or handle deployment manually via WSL

### Common Errors

#### Error: ENOSPC (No space left on device)
```bash
# Clean up Docker resources
docker system prune -a --volumes

# Clean npm cache
npm cache clean --force
```

#### Error: Cannot find module
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Error: Port 5173/5000/27017 already in use
```bash
# Find and kill process (Linux/WSL)
npx kill-port 5173 5000 27017

# Or manually find and kill
lsof -i :5173
kill -9 <PID>
```

---

## 💡 Tips & Best Practices

### Development
- Use environment-specific `.env` files
- Test OAuth locally before deploying
- Use WSL for better Docker performance on Windows
- Keep dependencies updated regularly

### Security
- Never commit `.env` files
- Use strong, random secrets for JWT and sessions
- Regularly update OAuth credentials
- Use HTTPS in production
- Implement rate limiting for APIs

### Performance
- Use connection pooling for MongoDB
- Implement caching for frequently accessed data
- Optimize Docker image sizes with multi-stage builds
- Use CDN for static assets in production

### CI/CD
- Test builds locally before pushing
- Use feature branches for new development
- Implement automated testing
- Monitor build times and optimize
- Use semantic versioning for Docker images

### AWS Deployment
- Use Terraform for infrastructure management
- Enable CloudWatch monitoring
- Set up alarms for critical metrics
- Use Auto Scaling for production loads
- Implement blue-green deployments for zero downtime

---

## 🎯 Deployment Workflows

### Option 1: Development (Local)
```
Code → npm run dev → http://localhost:5173
```

### Option 2: Docker (Local)
```
Code → docker-compose up → http://localhost:3000
```

### Option 3: CI Only (Jenkins + Manual AWS)
```
Code → Push to GitHub → Jenkins CI (build/test/push to Docker Hub)
  → Manual: wsl terraform apply → AWS → Live App
```

### Option 4: Full CI/CD (Automated)
```
Code → Push to GitHub → Jenkins CI/CD (build/test/push/deploy)
  → Automatic AWS deployment → Live App
```

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

Created with ❤️ for learning DevOps and full-stack development.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🆘 Support

For support:
- Check the troubleshooting section above
- Review error logs (application, Docker, Jenkins, CloudWatch)
- Open an issue in the repository with:
  - Detailed description of the problem
  - Steps to reproduce
  - Error messages and logs
  - Environment details (OS, Node version, Docker version, etc.)

---

## 🎉 Acknowledgments

- MERN Stack community
- Socket.io team
- Docker and Jenkins communities
- AWS and Terraform for excellent cloud infrastructure tools
- All open-source contributors

---

**Happy Chatting! 🚀💬**

*Last Updated: February 2026*
