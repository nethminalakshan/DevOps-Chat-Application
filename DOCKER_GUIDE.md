# 🐳 Docker Quick Start Guide

## 📁 Files Structure

```
DevOps Chat application/
├── docker-compose.yml          # ✅ Root compose file
├── server/
│   ├── Dockerfile             # ✅ Backend Docker image
│   └── .dockerignore          # ✅ Backend ignore file
└── client/
    ├── Dockerfile             # ✅ Frontend Docker image
    ├── nginx.conf             # ✅ Nginx configuration
    └── .dockerignore          # ✅ Frontend ignore file
```

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### Option 2: WSL Terminal

```bash
# Open WSL
wsl

# Navigate to project
cd /mnt/d/DevOps\ Chat\ application

# Start services
docker-compose up --build
```

## 🌐 Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017 (admin/admin123)

## 📊 View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

## 🛑 Stop Services

```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🔄 Restart Service

```bash
# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Rebuild specific service
docker-compose up --build backend
```

## ✅ Verify Running Containers

```bash
docker-compose ps
```

Expected output:
```
NAME                   STATUS
chat-app-backend       Up
chat-app-frontend      Up
chat-app-mongodb       Up
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Stop existing containers
docker-compose down

# Or in WSL, find and kill process
sudo lsof -i :5000
sudo kill -9 <PID>
```

### Build Failed

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
docker-compose up
```

### Cannot Connect to Backend

1. Check if backend is running:
   ```bash
   docker-compose ps
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Verify MongoDB connection in logs

### Frontend Shows 502 Bad Gateway

- Backend might not be ready yet, wait 30 seconds
- Check backend logs: `docker-compose logs backend`
- Restart backend: `docker-compose restart backend`

## 🔧 Advanced Commands

```bash
# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p admin123

# View container stats
docker stats

# Remove all containers and images
docker-compose down -v --rmi all
docker system prune -a --volumes
```

## 📝 What Each File Does

### `server/Dockerfile`
- Uses Node.js 18 Alpine (lightweight)
- Installs production dependencies
- Exposes port 5000
- Runs `node server.js`

### `client/Dockerfile`
- **Stage 1**: Builds React app with Vite
- **Stage 2**: Serves with Nginx
- Multi-stage build reduces image size
- Exposes port 80

### `client/nginx.conf`
- Serves React app
- Proxies `/api` requests to backend
- Proxies Socket.io WebSocket connections
- Enables gzip compression
- Adds security headers

### `docker-compose.yml`
- **MongoDB**: Database service
- **Backend**: Node.js/Express API
- **Frontend**: React app with Nginx
- Networks all services together
- Manages volumes for data persistence

## 🎯 Production Tips

1. **Use environment variables** for secrets
2. **Enable SSL/TLS** in production
3. **Use Docker secrets** for sensitive data
4. **Set resource limits** in compose file
5. **Use health checks** (already configured)
6. **Regular backups** of MongoDB volumes

## ✨ Your Setup is Complete!

All Docker files are ready:
- ✅ Backend Dockerfile
- ✅ Frontend Dockerfile  
- ✅ Nginx configuration
- ✅ Docker Compose file
- ✅ Dockerignore files

Just run: `docker-compose up --build` 🚀
