#!/bin/bash

# Jenkins Management Script for WSL
# Run this in WSL terminal: bash jenkins-wsl.sh <action>

JENKINS_COMPOSE_FILE="jenkins-docker-compose.yml"
JENKINS_CONTAINER="jenkins-server"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════╗
║   Jenkins Management Script (WSL)    ║
╚═══════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo "Usage: bash jenkins-wsl.sh <action>"
    echo ""
    echo "Actions:"
    echo "  start      - Start Jenkins server"
    echo "  stop       - Stop Jenkins server"
    echo "  restart    - Restart Jenkins server"
    echo "  status     - Show Jenkins status"
    echo "  logs       - View Jenkins logs"
    echo "  password   - Get initial admin password"
    echo "  setup      - Setup Docker in Jenkins container"
    echo "  shell      - Access Jenkins container shell"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  bash jenkins-wsl.sh start"
    echo "  bash jenkins-wsl.sh logs"
    echo "  bash jenkins-wsl.sh password"
    echo ""
    echo -e "${YELLOW}After starting Jenkins:${NC}"
    echo "  1. Access at http://localhost:8090"
    echo "  2. Get password: bash jenkins-wsl.sh password"
    echo "  3. Complete web setup"
    echo "  4. Setup Docker: bash jenkins-wsl.sh setup"
}

start_jenkins() {
    echo -e "${GREEN}Starting Jenkins server...${NC}"
    docker compose -f $JENKINS_COMPOSE_FILE up -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Jenkins started successfully!${NC}"
    echo -e "${CYAN}Access Jenkins at: http://localhost:8090${NC}"
        echo -e "${YELLOW}Get password with: bash jenkins-wsl.sh password${NC}"
    else
        echo -e "${RED}✗ Failed to start Jenkins${NC}"
        exit 1
    fi
}

stop_jenkins() {
    echo -e "${YELLOW}Stopping Jenkins server...${NC}"
    docker compose -f $JENKINS_COMPOSE_FILE down
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Jenkins stopped successfully!${NC}"
    else
        echo -e "${RED}✗ Failed to stop Jenkins${NC}"
        exit 1
    fi
}

restart_jenkins() {
    echo -e "${YELLOW}Restarting Jenkins server...${NC}"
    docker restart $JENKINS_CONTAINER
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Jenkins restarted successfully!${NC}"
    else
        echo -e "${RED}✗ Failed to restart Jenkins${NC}"
        exit 1
    fi
}

get_status() {
    echo -e "${CYAN}Jenkins Status:${NC}"
    docker ps -a --filter "name=$JENKINS_CONTAINER" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

show_logs() {
    echo -e "${CYAN}Showing Jenkins logs (Ctrl+C to exit)...${NC}"
    docker logs -f $JENKINS_CONTAINER
}

get_password() {
    echo -e "${CYAN}Getting initial admin password...${NC}"
    password=$(docker exec $JENKINS_CONTAINER cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}"
        echo "═══════════════════════════════════"
        echo "Initial Admin Password:"
        echo "═══════════════════════════════════"
        echo "$password"
        echo "═══════════════════════════════════"
        echo -e "${NC}"
    echo -e "${YELLOW}Copy this password and paste it at http://localhost:8090${NC}"
    else
        echo -e "${RED}✗ Could not get password. Is Jenkins running?${NC}"
        echo -e "${YELLOW}Start Jenkins with: bash jenkins-wsl.sh start${NC}"
        exit 1
    fi
}

setup_docker() {
    echo -e "${CYAN}Setting up Docker in Jenkins container...${NC}"
    
    docker exec -it $JENKINS_CONTAINER bash -c '
        echo "Updating package list..."
        apt-get update
        
        echo "Installing Docker CLI..."
        apt-get install -y docker.io
        
        echo "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        
        echo "Verifying installation..."
        docker --version
        docker-compose --version
        
        echo "Fixing Docker socket permissions..."
        chmod 666 /var/run/docker.sock
        
        echo "Setup complete!"
    '
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Docker setup completed!${NC}"
    else
        echo -e "${RED}✗ Docker setup failed${NC}"
        exit 1
    fi
}

access_shell() {
    echo -e "${CYAN}Accessing Jenkins container shell...${NC}"
    echo -e "${YELLOW}Type 'exit' to leave the container${NC}"
    docker exec -it $JENKINS_CONTAINER bash
}

# Main execution
case "${1:-help}" in
    start)
        start_jenkins
        ;;
    stop)
        stop_jenkins
        ;;
    restart)
        restart_jenkins
        ;;
    status)
        get_status
        ;;
    logs)
        show_logs
        ;;
    password)
        get_password
        ;;
    setup)
        setup_docker
        ;;
    shell)
        access_shell
        ;;
    help|*)
        show_help
        ;;
esac
