# ZapShift Backend API

A robust backend service for the **ZapShift** platform, built with Node.js, Express, and MongoDB. This API manages users, riders, parcels, and related infrastructure for a delivery/logistics platform.

##  Features

- **User Management:** Registration, authentication, and profile management.
- **Rider System:** Management of delivery personnel (riders).
- **Parcel Tracking & Management:** Full lifecycle management for delivery parcels.
- **Role-based Access Control:** Distinct routes for Users, Riders, and Admins.
- **Secure Authentication:** Built with JWT, bcrypt, and Clerk integration.
- **Database:** MongoDB with Mongoose ODM for flexible and scalable data schemas.

##  Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Security & Auth:** `@clerk/clerk-sdk-node`
- **Utilities:** `dotenv`, `cors`

##  Project Structure

```text
src/
├── config/        # Database and external service configurations
├── middlewares/   # Express middlewares (auth, validation, error handling)
├── modules/       # Domain-driven modules
│   ├── auth/      # Authentication routes, controllers, and services
│   ├── infrastructure/ # System infrastructure related endpoints
│   ├── parcels/   # Parcel management
│   ├── riders/    # Rider management
│   └── users/     # User management
├── app.js         # Express app setup and route mounting
├── server.js      # Server entry point
└── seed.js        # Database seeding script
```

##  Prerequisites

- **Node.js** (v16+ recommended)
- **MongoDB** (Local instance or MongoDB Atlas)

##  Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd zap-shift-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory and add the necessary environment variables. Example variables to include:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Run Database Seeds (Optional):**
   ```bash
   npm run seed
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The server should now be running on `http://localhost:5000`.

##  API Endpoints Overview

- `GET /` - Health check endpoint
- `POST /api/auth/*` - Authentication endpoints
- `GET/POST /api/parcels/*` - Parcel operations
- `GET/POST /api/riders/*` - Rider operations
- `GET/POST /api/users/*` - User operations
- `GET/POST /api/admin/users/*` - Admin-specific user operations
- `GET/POST /api/infra/*` - Infrastructure operations

##  Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Author

This project is developed by Mahmudul Karim.
