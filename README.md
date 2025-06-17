# Tailorly

Tailorly is a custom tailoring platform that enables tailors to manage clients, orders, inventory, and analytics.

## Project Structure

- **client/** - Vue 3 frontend application
- **server/** - Node.js/Express backend API

## Deployment

### Backend (Server)

The backend is configured for deployment to Render.com:

1. Create a new Web Service in your Render dashboard
2. Connect your GitHub repository
3. Important settings:
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: See server/.env.example

For detailed deployment instructions, see [server/RENDER_DEPLOYMENT.md](server/RENDER_DEPLOYMENT.md).

### Frontend (Client)

The frontend is configured for deployment to Netlify:

1. Connect your GitHub repository to Netlify
2. Set the build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
   - **Node version**: 18 or higher

## Development

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```
