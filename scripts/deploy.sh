#!/bin/bash

# Deployment script for Google Cloud Platform
set -e

echo "🚀 Starting deployment to Google Cloud Platform..."

# Check if required environment variables are set
if [ -z "$PROJECT_ID" ]; then
    echo "❌ PROJECT_ID environment variable is required"
    exit 1
fi

if [ -z "$REGION" ]; then
    REGION="us-central1"
    echo "📍 Using default region: $REGION"
fi

# Set the project
echo "🔧 Setting Google Cloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔌 Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable storage.googleapis.com

# Build and deploy using Cloud Build
echo "🏗️ Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml

# Get the service URL
SERVICE_URL=$(gcloud run services describe chatai-app --region=$REGION --format="value(status.url)")

echo "✅ Deployment completed successfully!"
echo "🌐 Your application is available at: $SERVICE_URL"
echo ""
echo "📋 Next steps:"
echo "1. Configure your Firebase project settings"
echo "2. Set up your OpenAI API key in Cloud Console"
echo "3. Configure custom domain (optional)"
echo "4. Set up monitoring and logging"
