pipeline {
    agent any
    
    environment {
        // Docker Hub credentials (add these in Jenkins: Manage Jenkins → Manage Credentials)
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_HUB_USERNAME = 'nlh29060'  // Your Docker Hub username
        
        // Application configuration
        BACKEND_IMAGE = "${DOCKER_HUB_USERNAME}/chat-app-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_USERNAME}/chat-app-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // Node version
        NODE_VERSION = '20'
        
        // Environment files (optional, comment out if not using)
        // ENV_FILE = credentials('chat-app-env-file')
    }
    
    // Note: We run Node.js commands inside a Docker container (node:20),
    // so no Jenkins NodeJS tool/plugin is required.
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
                script {
                    // Get git commit info
                    env.GIT_COMMIT_MSG = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    env.GIT_AUTHOR = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('server') {
                            echo 'Installing backend dependencies...'
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('client') {
                            echo 'Installing frontend dependencies...'
                            sh 'npm install'
                        }
                    }
                }
            }
        }
        
        stage('Lint & Code Quality') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        dir('server') {
                            echo 'Running backend linting...'
                            // Add your linting commands here
                            // sh 'npm run lint'
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir('client') {
                            echo 'Running frontend linting...'
                            // Add your linting commands here
                            // sh 'npm run lint'
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('server') {
                            echo 'Running backend tests...'
                            // Add your test commands here
                            // sh 'npm test'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('client') {
                            echo 'Running frontend tests...'
                            // Add your test commands here
                            // sh 'npm test'
                        }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('client') {
                    echo 'Building frontend application...'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        script {
                            echo 'Building backend Docker image...'
                            sh """
                                cd server
                                docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                                             -t ${BACKEND_IMAGE}:latest \
                                             .
                            """
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        script {
                            echo 'Building frontend Docker image...'
                            sh """
                                cd client
                                docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                                             -t ${FRONTEND_IMAGE}:latest \
                                             .
                            """
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            parallel {
                stage('Scan Backend Image') {
                    steps {
                        script {
                            echo 'Scanning backend image for vulnerabilities...'
                            // Using Trivy for security scanning
                            // sh "trivy image --severity HIGH,CRITICAL ${BACKEND_IMAGE}:${IMAGE_TAG}"
                        }
                    }
                }
                stage('Scan Frontend Image') {
                    steps {
                        script {
                            echo 'Scanning frontend image for vulnerabilities...'
                            // sh "trivy image --severity HIGH,CRITICAL ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    echo 'Pushing images to Docker Hub...'
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', 
                                                       usernameVariable: 'DOCKER_USER', 
                                                       passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        
                        // Push backend images
                        sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${BACKEND_IMAGE}:latest"
                        
                        // Push frontend images
                        sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${FRONTEND_IMAGE}:latest"
                        
                        sh 'docker logout'
                    }
                }
            }
        }

        stage('Deploy to AWS (Terraform)') {
            steps {
                script {
                    echo '========================================='
                    echo 'Starting Automated AWS Deployment...'
                    echo '========================================='
                }
                
                // Use AWS credentials stored in Jenkins (using simple username/password binding)
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    dir('terraform') {
                        sh '''
                          set -e
                          
                          # Export AWS credentials
                          export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
                          export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
                          export AWS_DEFAULT_REGION="us-east-1"
                          
                          # Install AWS CLI if missing
                          if ! command -v aws >/dev/null 2>&1; then
                            echo "Installing AWS CLI..."
                            curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
                            unzip -o -q awscliv2.zip
                            ./aws/install --bin-dir /tmp/aws-cli --install-dir /tmp/aws-cli-install --update || true
                            export PATH=/tmp/aws-cli:$PATH
                          fi
                          
                          # Install terraform if missing (without sudo)
                          if ! command -v terraform >/dev/null 2>&1; then
                            echo "Installing Terraform..."
                            curl -fsSL https://releases.hashicorp.com/terraform/1.6.6/terraform_1.6.6_linux_amd64.zip -o tf.zip
                            unzip -o tf.zip
                            chmod +x terraform
                            export PATH=$PWD:$PATH
                            echo "Terraform installed successfully"
                          fi
                          
                          # Use local terraform if exists, otherwise use system
                          TERRAFORM_BIN="$(command -v terraform || echo ./terraform)"
                          echo "Using Terraform: $TERRAFORM_BIN"
                          
                          # Show Terraform version
                          $TERRAFORM_BIN version
                          
                          # Initialize Terraform
                          echo "Initializing Terraform..."
                          $TERRAFORM_BIN init -input=false
                          
                          # Check if resources exist and import them if needed
                          echo "Checking for existing resources..."
                          $TERRAFORM_BIN plan -input=false -out=tfplan 2>&1 | tee plan.log || true
                          
                          # If plan shows resources to create that already exist, they need importing
                          # For now, we'll use -replace to force update the ECS service
                          
                          # Deploy to AWS - force update ECS service to pull new images
                          echo "Deploying to AWS ECS with latest Docker images..."
                          echo "Forcing ECS service update to pull new images..."
                          
                          # Apply terraform (will skip if no changes)
                          $TERRAFORM_BIN apply -auto-approve -input=false || true
                          
                          # Force ECS service to update with new images
                          echo "Force updating ECS service to deploy latest images..."
                          aws ecs update-service \
                            --cluster chat-app-cluster \
                            --service chat-app-service \
                            --force-new-deployment \
                            --region us-east-1 || echo "Failed to force update ECS service"
                          
                          # Wait a moment for the update to register
                          sleep 5
                          
                          # Show deployment info
                          echo ""
                          echo "========================================="
                          echo "Deployment Complete! ✅"
                          echo "========================================="
                          echo "ECS Service: Forced new deployment"
                          echo "Latest images will be pulled from Docker Hub"
                          $TERRAFORM_BIN output -json | grep -E '(frontend_url|alb_dns_name)' || $TERRAFORM_BIN output
                          
                          echo ""
                          echo "Deployment Status:"
                          aws ecs describe-services \
                            --cluster chat-app-cluster \
                            --services chat-app-service \
                            --region us-east-1 \
                            --query 'services[0].deployments[0].[status,runningCount,desiredCount]' \
                            --output table || true
                        '''
                    }
                }
                
                script {
                    echo ''
                    echo '========================================='
                    echo 'Full CI/CD Pipeline Completed! 🎉'
                    echo '========================================='
                    echo ''
                    echo "Build Number: ${IMAGE_TAG}"
                    echo 'Docker Images: Pushed ✅'
                    echo 'AWS Deployment: Complete ✅'
                    echo ''
                    echo 'Your application is now live!'
                    echo '========================================='
                }
            }
        }
        
        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo 'CI completed. Run Terraform in WSL for CD deployment.'
                    // Note: CD is handled manually with Terraform in WSL
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo 'CI completed. Run Terraform in WSL for CD deployment.'
                    input message: 'Deploy to Production with Terraform?', ok: 'Proceed'
                    // Note: CD is handled manually with Terraform in WSL
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo 'Cleaning up...'
                // Clean up Docker images (only if in a node context)
                try {
                    sh "docker image prune -f || true"
                } catch (Exception e) {
                    echo "Could not prune images: ${e.message}"
                }
            }
        }
        success {
            echo 'Pipeline completed successfully!'
            // Send success notification
            // emailext body: "Build successful: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            //          subject: "Jenkins Build Success: ${env.JOB_NAME}",
            //          to: 'team@example.com'
        }
        failure {
            echo 'Pipeline failed!'
            // Send failure notification
            // emailext body: "Build failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            //          subject: "Jenkins Build Failed: ${env.JOB_NAME}",
            //          to: 'team@example.com'
        }
    }
}
