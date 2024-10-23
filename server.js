const express = require ('express');
const dotenv = require ('dotenv');
const jwt = require ('jsonwebtoken');
const posts = require ('./posts');

dotenv.config ();

// Create server
const app = express ();

// Middlewares
app.use (express.json ());

app.get ('/', (req, res) => {
  return res.status (200).json ({message: 'Welcome to JWT'});
});

// Posts - Authenticate before accessing posts
app.get ('/posts', authenticateUser, (req, res) => {
  const userPosts = posts.filter (
    eachPost => eachPost.name === req.user.username
  );
  return res.status (200).json (userPosts);
});

// Login Route
app.post ('/login', (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const SECRET = process.env.ACCESS_TOKEN_SECRET;

  if (!username) {
    return res.status (400).json ({message: 'Username is required'});
  }

//   if (!email) {
//     return res.status (400).json ({message: 'Email is required'});
//   }

  console.log(username);
  console.log(email);
  
  

  const user_payload = {username};

  // Generate a token
  const token = jwt.sign (user_payload, SECRET, {expiresIn: '1h'});

  return res.status (200).json ({
    message: 'User login successful',
    token,
    user_payload,
    email,
  });
});

// Middleware to authenticate user
function authenticateUser (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split (' ')[1]; // Extract Bearer token

  if (!token) {
    return res.status (401).json ({message: 'Unauthorized access'});
  }

  // Verify token
  jwt.verify (token, process.env.ACCESS_TOKEN_SECRET, (error, user_payload) => {
    if (error) {
      return res.status (403).json ({message: 'Access denied'});
    }
    req.user = user_payload;
    next ();
  });
}

// Listen to PORT
const PORT = process.env.PORT || 3000; // Default to 3000 if PORT is not set
app.listen (PORT, () => {
  console.log (`App running well on http://localhost:${PORT}`);
});
