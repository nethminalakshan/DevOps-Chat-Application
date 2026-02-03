# AWS Configuration
aws_region          = "us-east-1"
docker_hub_username = "nlh29060"
image_tag           = "latest"

# MongoDB - Your MongoDB Atlas connection string
mongodb_uri = "mongodb+srv://nethminalakshan:nethminalakshan@cluster0.otpfy.mongodb.net/chat-app?retryWrites=true&w=majority"

# JWT Secret
jwt_secret = "mysecretkey123"

# =============================================================
# IMPORTANT: Replace <YOUR_AWS_PUBLIC_IP> with your actual ECS task public IP
# You can find this in AWS Console -> ECS -> Clusters -> chat-app-cluster -> Tasks -> Running task -> Public IP
# =============================================================

# Client URL - Using nip.io for domain-based access
client_url = "http://13.218.108.220.nip.io"

# Google OAuth Credentials (from your docker-compose.yml)
# Using nip.io domain because Google requires a real domain, not IP address
google_client_id     = "563521387761-s6008ucnkmnq9hst7799kp0is89n56b6.apps.googleusercontent.com"
google_client_secret = "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"
google_callback_url  = "http://13.218.108.220.nip.io:5000/api/auth/google/callback"

# GitHub OAuth Credentials (GitHub allows IP addresses, but using nip.io for consistency)
github_client_id     = "Ov23liGFqdvFV34eGEaN"
github_client_secret = "2404ac37d48cf8c421045f4e79588afa968ecdb5"
github_callback_url  = "http://13.218.108.220.nip.io:5000/api/auth/github/callback"
