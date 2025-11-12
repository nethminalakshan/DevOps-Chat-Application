#!/bin/bash

# Install required Jenkins plugins
# Run this inside Jenkins container

JENKINS_URL="http://localhost:8080"
PLUGINS=(
    "git"
    "github"
    "pipeline-stage-view"
    "docker-plugin"
    "docker-workflow"
    "nodejs"
    "credentials-binding"
    "workflow-aggregator"
    "blueocean"
    "email-ext"
    "slack"
)

echo "Installing Jenkins plugins..."

for plugin in "${PLUGINS[@]}"; do
    echo "Installing $plugin..."
    java -jar /var/jenkins_home/war/WEB-INF/jenkins-cli.jar -s $JENKINS_URL install-plugin $plugin
done

echo "Restarting Jenkins..."
java -jar /var/jenkins_home/war/WEB-INF/jenkins-cli.jar -s $JENKINS_URL safe-restart

echo "Plugin installation complete!"
