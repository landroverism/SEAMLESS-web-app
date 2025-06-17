# Tailorly Server Deployment Guide for Render

This guide will help you deploy the Tailorly server to Render.com.

## Prerequisites

1. A [Render.com](https://render.com) account
2. Your Tailorly repository pushed to GitHub
3. Active Supabase project with credentials

## Deployment Steps

### Option 1: Manual Deployment

1. **Log in to your Render dashboard**
   - Go to [dashboard.render.com](https://dashboard.render.com)

2. **Create a new Web Service**
   - Click "New" and select "Web Service"
   - Connect your GitHub repository or use "Deploy from public Git repository"
   - Enter your repository URL

3. **Configure your service**
   - Name: `tailorly-api` (or your preferred name)
   - Environment: `Node`
   - Region: Choose the closest to your users
   - Branch: `main` (or your deployment branch)
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Select Free or paid tier based on your needs

4. **Add Environment Variables**
   - Click on "Environment" tab
   - Add the following variables:
     ```
     PORT=10000
     NODE_ENV=production
     SUPABASE_URL=https://your-project-url.supabase.co
     SUPABASE_KEY=your-supabase-key
     JWT_SECRET=your-secure-jwt-secret
     JWT_EXPIRES_IN=7d
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the deployment to complete

### Option 2: Using render.yaml (Blueprint)

1. **Install Render CLI** (optional)
   ```bash
   npm install -g @render/cli
   ```

2. **Deploy using the blueprint**
   ```bash
   render blueprint up
   ```

3. **Add Environment Variables**
   - After deployment, go to your service in the Render dashboard
   - Add the required environment variables as listed above

## Troubleshooting

### Common Issues

1. **Build Command Failing**
   - Ensure your package.json has a valid "build" script
   - Check for any missing dependencies

2. **Application Not Starting**
   - Check the logs in the Render dashboard
   - Verify all environment variables are set correctly
   - Make sure your start command is correct

3. **Database Connection Issues**
   - Verify your Supabase credentials are correct
   - Ensure your Supabase project is active and accessible

4. **Port Issues**
   - Render assigns a PORT environment variable - make sure your app uses it:
   ```javascript
   const PORT = process.env.PORT || 5000;
   ```

## Health Checks

Render uses health checks to determine if your application is running properly. The server includes a `/health` endpoint that returns a 200 OK response when the server is running.

## Monitoring

After deployment, you can monitor your application's:
- Logs
- CPU and memory usage
- Request metrics

All available in the Render dashboard.
