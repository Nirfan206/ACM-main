<<<<<<< HEAD
# AL CHAAN MEERA - Multi-Role Appliance Repair & Maintenance Service Web App

## Overview
A complete MERN stack web application for appliance repair and maintenance services, supporting Customer, Employee, Admin, and Customer Care roles. Features phone-based authentication (Twilio), JWT sessions, secure password management, booking, reviews, dashboards, analytics, and more.

## Tech Stack
- **Frontend:** React (client/)
- **Backend:** Node.js, Express (server/)
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, bcrypt, Twilio Verify API
- **Notifications:** Twilio SMS, in-app
- **Payment (Optional):** Stripe

## Setup Instructions

### Prerequisites
- Node.js & npm
- MongoDB (local or Atlas)
- Twilio account (for SMS/OTP)
- (Optional) Stripe account

### 1. Clone the repository
```
git clone <your-repo-url>
cd ACM v2
```

### 2. Install dependencies
```
cd server
npm install
cd ../client
npm install
```

### 3. Environment Variables
Create `.env` files in both `server/` and `client/` folders. Example for backend:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
STRIPE_SECRET_KEY=your_stripe_key
```

### 4. Run Backend
```
cd server
npm run dev
```

### 5. Run Frontend
```
cd client
npm start
```

### 6. Access the App
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `server/` - Express backend (models, controllers, routes, middlewares, config)
- `client/` - React frontend (components, pages, context, hooks, utils)

## Features
- Phone-based registration/login with OTP (Twilio)
- Secure password storage & reset via SMS
- JWT authentication, protected routes
- Role-based dashboards and permissions
- Service booking, tracking, reviews
- Admin management (users, services, analytics)
- Employee job management & earnings
- Customer care request handling
- SMS & in-app notifications
- Responsive mobile-first UI

## Sample Data
Seed scripts and sample data provided in `server/sampleData/` for testing.

## Deployment
- Configure environment variables for production
- Use services like Heroku, Vercel, or AWS for deployment
- Set up MongoDB Atlas and Twilio/Stripe credentials

## License
MIT
=======
# ALCHAANMEERA
AL CHAAN MEERA (Air Conditioning &amp; Maintenance Company)
>>>>>>> 645670c8c56b9c63e4d1f4c25a91970d80ab58a4
