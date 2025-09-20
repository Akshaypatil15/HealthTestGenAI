# Deployment Guide: Google Cloud Platform

This guide covers deploying the Healthcare Test Case Generation AI application to Google Cloud Platform using multiple deployment options.

## Prerequisites

1. **Google Cloud Account**: Set up a Google Cloud account with billing enabled
2. **Google Cloud CLI**: Install and configure the `gcloud` CLI tool
3. **Docker**: Install Docker for containerized deployments
4. **Firebase Project**: Create a Firebase project for authentication

## Environment Setup

### 1. Create Google Cloud Project

\`\`\`bash
# Create a new project
gcloud projects create your-project-id --name="Healthcare Test Case AI"

# Set the project as default
gcloud config set project your-project-id

# Enable billing (required for most services)
gcloud billing accounts list
gcloud billing projects link your-project-id --billing-account=BILLING_ACCOUNT_ID
\`\`\`

### 2. Enable Required APIs

\`\`\`bash
# Enable necessary Google Cloud APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable generativelanguage.googleapis.com
\`\`\`

### 3. Configure Environment Variables

Create a `.env.local` file with your configuration:

\`\`\`env
# Firebase Configuration (Authentication only)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# Development Configuration
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

## Deployment Options

### Option 1: Google Cloud Run (Recommended)

Cloud Run is ideal for containerized Next.js applications with automatic scaling.

#### Manual Deployment

\`\`\`bash
# Build the Docker image
docker build -t gcr.io/your-project-id/healthcare-testcase-ai .

# Push to Google Container Registry
docker push gcr.io/your-project-id/healthcare-testcase-ai

# Deploy to Cloud Run
gcloud run deploy healthcare-testcase-ai \
  --image gcr.io/your-project-id/healthcare-testcase-ai \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 2Gi \
  --cpu 1 \
  --max-instances 10
\`\`\`

#### Automated Deployment with Cloud Build

\`\`\`bash
# Deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml
\`\`\`

### Option 2: Google App Engine

App Engine provides a fully managed platform with automatic scaling.

\`\`\`bash
# Deploy to App Engine
gcloud app deploy app.yaml

# View your application
gcloud app browse
\`\`\`

### Option 3: Firebase App Hosting

Firebase App Hosting is optimized for Next.js applications.

\`\`\`bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# Deploy to Firebase
firebase deploy
\`\`\`

## CI/CD Setup

### GitHub Actions

1. Create the following secrets in your GitHub repository:
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_SA_KEY`: Service account key JSON (base64 encoded)

2. The workflow in `.github/workflows/deploy.yml` will automatically deploy on pushes to main branch.

### Service Account Setup

\`\`\`bash
# Create a service account for deployment
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:github-actions@your-project-id.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:github-actions@your-project-id.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

# Create and download service account key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@your-project-id.iam.gserviceaccount.com
\`\`\`

## Post-Deployment Configuration

### 1. Custom Domain Setup

\`\`\`bash
# Map a custom domain to Cloud Run
gcloud run domain-mappings create \
  --service healthcare-testcase-ai \
  --domain your-domain.com \
  --region us-central1
\`\`\`

### 2. SSL Certificate

Cloud Run automatically provides SSL certificates for custom domains.

### 3. Monitoring and Logging

\`\`\`bash
# View logs
gcloud run services logs read healthcare-testcase-ai --region us-central1

# Set up monitoring alerts
gcloud alpha monitoring policies create --policy-from-file=monitoring-policy.yaml
\`\`\`

### 4. Scaling Configuration

\`\`\`bash
# Update scaling settings
gcloud run services update healthcare-testcase-ai \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 20 \
  --cpu 2 \
  --memory 4Gi
\`\`\`

## Security Best Practices

1. **Environment Variables**: Store sensitive data in Google Secret Manager
2. **IAM Permissions**: Use least-privilege access principles
3. **Network Security**: Configure VPC and firewall rules if needed
4. **Authentication**: Ensure Firebase Auth is properly configured
5. **HTTPS**: Always use HTTPS in production (automatic with Cloud Run)

## Monitoring and Maintenance

### Health Checks

Cloud Run automatically performs health checks on your application.

### Performance Monitoring

- Use Google Cloud Monitoring for application metrics
- Set up alerting for error rates and response times
- Monitor resource usage and costs

### Backup Strategy

- Firebase automatically backs up authentication data
- Google Cloud Storage provides built-in redundancy
- Consider implementing database backups if using additional storage

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Cloud Build logs for detailed error messages
2. **Memory Issues**: Increase memory allocation in deployment configuration
3. **Cold Starts**: Consider setting minimum instances for better performance
4. **Environment Variables**: Ensure all required variables are set correctly

### Debugging

\`\`\`bash
# View detailed logs
gcloud run services logs read healthcare-testcase-ai --region us-central1 --limit 100

# Check service status
gcloud run services describe healthcare-testcase-ai --region us-central1

# Test the deployment
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  https://your-service-url.run.app
\`\`\`

## Cost Optimization

1. **Right-sizing**: Monitor resource usage and adjust CPU/memory allocation
2. **Scaling**: Configure appropriate min/max instances
3. **Regional Deployment**: Choose regions close to your users
4. **Resource Cleanup**: Remove unused resources and old container images

## Support and Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Google Cloud Support](https://cloud.google.com/support)
