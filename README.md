# Second-Hand-Marketplace-MERN-Stack-E-commerce-Platform

A full-stack web application for buying and selling second-hand products, built with the MERN stack.

## Features

- User registration, login, and JWT authentication
- Role-based access control (buyer/seller)
- List, browse, and manage products with category filtering
- Image uploads for product listings
- Real-time buyer-seller chat using WebSockets
- User-specific favorites and cart management
- Secure payment integration with Razorpay

## Tech Stack

- **Frontend:** React.js, Socket.io-client
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT
- **File Uploads:** Multer
- **Payments:** Razorpay
- **Real-time:** Socket.io

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/sankeerthkatta/Second-Hand-Marketplace-MERN-Stack-E-commerce-Platform.git

2. **Install dependencies:**
   cd Backend
   npm install
   cd ../Frontend
   npm install
   
3. **Configure environment variables:**
   Copy .env.example to .env in the Backend folder and update values.

4. **Run the backend server:**
   cd Backend
   npm run dev

5. **Run the frontend app:**
   cd ../Frontend
   npm run dev
