# AWS Configuration
aws_region          = "us-east-1"
docker_hub_username = "nlh29060"
image_tag           = "latest"

# MongoDB - Your MongoDB Atlas connection string
mongodb_uri = "mongodb+srv://nethminalakshan:nethminalakshan@cluster0.otpfy.mongodb.net/chat-app?retryWrites=true&w=majority"

# JWT Secret
jwt_secret = "mysecretkey123"

# =============================================================
# UPDATED: Using new Application Load Balancer DNS
# ALB DNS: chat-app-alb-1195695260.us-east-1.elb.amazonaws.com
# =============================================================

# Client URL - Using ALB DNS
client_url = "http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com"

# Google OAuth Credentials
# IMPORTANT: Update these URLs in Google Cloud Console!
google_client_id     = "563521387761-s6008ucnkmnq9hst7799kp0is89n56b6.apps.googleusercontent.com"
google_client_secret = "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"
google_callback_url  = "http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com:5000/api/auth/google/callback"

# GitHub OAuth Credentials
# IMPORTANT: Update these URLs in GitHub Developer Settings!
github_client_id     = "Ov23liGFqdvFV34eGEaN"
github_client_secret = "2404ac37d48cf8c421045f4e79588afa968ecdb5"
github_callback_url  = "http://chat-app-alb-1195695260.us-east-1.elb.amazonaws.com:5000/api/auth/github/callback"
