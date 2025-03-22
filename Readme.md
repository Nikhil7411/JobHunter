🚀 Overview

The Job Board Platform is a web application where companies can post job listings, and candidates can browse and apply for jobs. The platform is built using Next.js, Node.js, and MongoDB. It follows clean code practices, uses JWT authentication, and provides a fully responsive UI with dark mode.

🛠 Tech Stack

Frontend

Next.js – React framework for server-side rendering and static site generation.

Tailwind CSS – Utility-first CSS framework for styling.

React Hook Form – For form handling and validation.

Redux Toolkit – State management.

Axios – HTTP client for API requests.

Backend

Node.js – JavaScript runtime.

Express.js/NestJS – API framework.

MongoDB – Database for storing job listings and applications.

JWT (JSON Web Token) – Authentication mechanism.

🎯 Features

✅ General

Secure authentication with JWT.

MongoDB database for job listings and applications.

Fully responsive UI with dark mode.

Deployed live version available.

Clean code and meaningful Git commits.

✅ Frontend Developer Tasks

🏠 Homepage displaying job listings.

🔍 Job Details Page to view job descriptions.

🏢 Company Dashboard (using mock data) for posting jobs.

✅ Form Validation using React Hook Form.

🌙 Dark Mode using Tailwind CSS.

📦 State Management with Redux.

⚡ Installation & Setup

1️⃣ Clone the Repository

git clone https://github.com/your-username/job-board-platform.git
cd job-board-platform

2️⃣ Install Dependencies

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

3️⃣ Set Up Environment Variables

Create a .env file in both frontend and backend directories:

# Backend .env
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key

# Frontend .env
NEXT_PUBLIC_API_URL=http://localhost:5000

4️⃣ Run the Application

Start Backend

cd backend
npm run dev

Start Frontend

cd frontend
npm run dev

5️⃣ Open in Browser

Visit: http://localhost:3000