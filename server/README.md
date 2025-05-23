# Tailorly Backend API

This is the backend API for the Tailorly application, a custom tailoring platform that enables tailors to manage clients, orders, inventory, and analytics.

## Technology Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for Node.js
- **Supabase**: PostgreSQL database with built-in authentication and real-time capabilities
- **JWT**: JSON Web Tokens for secure authentication

## Project Structure

```
server/
├── src/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # External service integrations
│   └── index.js          # Entry point
├── supabase/
│   └── schema.sql        # Database schema for Supabase
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
└── README.md             # Documentation
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new tailor
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current tailor profile
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/profile` - Update tailor profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Clients

- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get a client by ID
- `POST /api/clients` - Create a new client
- `PUT /api/clients/:id` - Update a client
- `DELETE /api/clients/:id` - Delete a client
- `PUT /api/clients/:id/preferences` - Update client preferences
- `PUT /api/clients/:id/measurements` - Update client measurements
- `GET /api/clients/:id/orders` - Get all orders for a client

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get an order by ID
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id` - Update an order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete an order
- `GET /api/orders/stats/summary` - Get order statistics summary
- `GET /api/orders/stats/by-status` - Get orders grouped by status
- `GET /api/orders/stats/by-month` - Get orders grouped by month

### Inventory

- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get an inventory item by ID
- `POST /api/inventory` - Create a new inventory item
- `PUT /api/inventory/:id` - Update an inventory item
- `PUT /api/inventory/:id/quantity` - Update inventory item quantity
- `DELETE /api/inventory/:id` - Delete an inventory item
- `GET /api/inventory/stats/low-stock` - Get low stock inventory items
- `GET /api/inventory/stats/by-category` - Get inventory items grouped by category
- `GET /api/inventory/stats/value` - Get total inventory value

### Analytics

- `GET /api/analytics/dashboard` - Get dashboard analytics data
- `GET /api/analytics/revenue` - Get revenue analytics
- `GET /api/analytics/services` - Get service popularity analytics
- `GET /api/analytics/clients` - Get client analytics
- `GET /api/analytics/performance` - Get tailor performance analytics

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Set up Supabase:
   - Create a new project in Supabase
   - Run the SQL from `supabase/schema.sql` in the Supabase SQL editor
   - Copy your Supabase URL and anon key to the `.env` file
5. Start the development server: `npm run dev`

## Database Schema

The application uses the following tables:

- **tailors**: Store tailor information (linked to Supabase auth)
- **clients**: Store client information with preferences and measurements
- **orders**: Track orders with status and payment information
- **inventory**: Manage materials and supplies

## Authentication Flow

1. User registers or logs in through the API
2. Backend authenticates with Supabase and returns a JWT token
3. Client stores the token and includes it in the Authorization header for subsequent requests
4. Protected routes verify the token using middleware

## Deployment

For production deployment:

1. Set up environment variables
2. Build the application: `npm run build`
3. Start the server: `npm start`

## Security

- JWT authentication for all protected routes
- Row-level security in Supabase for data isolation
- Input validation using express-validator
- Error handling middleware for consistent error responses
