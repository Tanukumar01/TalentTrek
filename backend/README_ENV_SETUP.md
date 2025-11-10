# Environment Setup Instructions

## Backend Server Not Starting?

The backend server needs a `.env` file to run. Create a file named `.env` in the `backend` directory with the following content:

```
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
MONGO_URI=mongodb://localhost:27017/talenttrek
NODE_ENV=development
PORT=5000
```

## Steps to Fix:

1. **Create .env file**: In the `backend` folder, create a new file called `.env`
2. **Copy the content above** into the `.env` file
3. **Save the file**
4. **Restart the server**: Run `npm run start:all` again

## MongoDB Setup:

Make sure MongoDB is running on your system:
- **Windows**: Install MongoDB Community Server
- **Mac**: Use `brew install mongodb-community`
- **Linux**: Use your package manager to install MongoDB

## Troubleshooting:

- If you see "Route /api/my-jobs not found", the backend isn't running
- If you see connection errors, check if MongoDB is running
- If you see JWT errors, check your .env file has the correct JWT_SECRET
