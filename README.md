# Cube-BOT Interactive Chat Application

An AI-powered chatbot platform featuring multiple conversation models and SQL assistance capabilities.

## Features

- Multiple AI conversation models (GPT, Llama)
- SQL learning assistant
- User authentication system
- Different subscription plans (Free, Pro, Business)
- Role-based access (Student, Teacher, User)
- Real-time chat interface
- Conversation history management

## Tech Stack

### Frontend

- React with TypeScript
- Vite
- React Router
- SweetAlert2 for notifications
- FontAwesome icons
- CSS for styling

### Backend

- Node.js with Express
- MongoDB with Mongoose
- Python Flask server for AI processing
- JWT authentication
- Passport.js for authorization

### AI Models

- OpenAI GPT
- Llama
- Custom SQL assistance model

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- MongoDB
- npm or yarn package manager

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/failaip12/Interactive-Chat-bot.git
    cd Interactive-Chat-bot
    ```

2. Install backend dependencies:

    ```bash
    npm install
    ```

3. Install frontend dependencies:

    ```bash
    cd front
    npm install
    ```

4. Install Python dependencies:

    ```bash
    pip install -r requirements.txt
    ```

5. Set up environment variables:

- Create `.env` file in the root directory
- Required variables:
  - `OPENAI_API_KEY`
  - `REPLICATE_API_TOKEN`

## Running the Application

1. Start the MongoDB server

2. Start the Node.js backend:

    ```bash
    node server/server.js
    ```

3. Start the frontend development server:

    ```bash
    cd front
    npm run dev
    ```

4. Start the Python AI server:

    ```bash
    python waiter/main.py
    ```

The application will be available at `http://localhost:3000`

## Project Structure

- `/front` - React frontend application
- `/server` - Node.js backend server
- `/waiter` - Python AI processing server
- `/models` - MongoDB models
- `/routes` - Express routes
- `/services` - Business logic services

## Available Scripts

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend Scripts

- `node server/server.js` - Start Node.js server
