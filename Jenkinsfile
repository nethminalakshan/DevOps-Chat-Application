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

        // NOTE: Terraform deployment is handled manually via WSL
        // Jenkins is used for CI only (build, test, push Docker images)
        // To deploy: Run "wsl terraform apply" in the terraform directory
        
        stage('CI Complete - Ready for Deployment') {
            steps {
                script {
                    echo '========================================='
                    echo 'CI Pipeline Completed Successfully! ✅'
                    echo '========================================='
                    echo ''
                    echo 'Docker Images Built and Pushed:'
                    echo "  - Backend:  nlh29060/chat-app-backend:${IMAGE_TAG}"
                    echo "  - Frontend: nlh29060/chat-app-frontend:${IMAGE_TAG}"
                    echo ''
                    echo 'Next Steps for Deployment:'
                    echo '  1. Open WSL terminal'
                    echo '  2. cd to terraform directory'
                    echo '  3. Update image_tag in terraform.tfvars if needed'
                    echo "  4. Run: terraform apply -auto-approve"
                    echo ''
                    echo '========================================='
                }
            }
        }
        
        /* TERRAFORM DEPLOYMENT - DISABLED (AWS credentials not configured in Jenkins)
        stage('Deploy (Terraform)') {
            steps {
                dir('terraform') {
                    sh '''
                      set -e
                      # Install terraform if missing (without sudo)
                      if ! command -v terraform >/dev/null 2>&1; then
                        echo "Installing Terraform..."
                        curl -fsSL https://releases.hashicorp.com/terraform/1.6.6/terraform_1.6.6_linux_amd64.zip -o tf.zip
                        unzip -o tf.zip
                        chmod +x terraform
                        # Add to PATH for this session
                        export PATH=$PWD:$PATH
                        echo "Terraform installed at $PWD/terraform"
                      fi
                      
                      # Use local terraform if exists, otherwise use system
                      TERRAFORM_BIN="$(command -v terraform || echo ./terraform)"
                      echo "Using Terraform: $TERRAFORM_BIN"
                      
                      $TERRAFORM_BIN version
                      $TERRAFORM_BIN init -input=false
                      $TERRAFORM_BIN apply -auto-approve -input=false
                    '''
                }
            }
        }
        */
        
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
