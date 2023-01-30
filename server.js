const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const connectDb = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const http = require('http');
const io = require('socket.io')(http);

// Load env vars
dotenv.config({ path: './config/config.env' });
// Connect to database
connectDb();

// // Route files
const moments = require('./routes/moments');
// const courses = require('./routes/courses');
const auth = require('./routes/auth');
// const users = require('./routes/users');
const messages = require('./routes/messages');
// const reviews = require('./routes/reviews');
const app = express();
// Body Parser
app.use(express.json());
// Cookie
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(fileUpload());

// Sanitize Data
app.use(mongoSanitize());
// Set security headers
app.use(helmet({ contentSecurityPolicy: false }));
// Set security script and prevent xss attack
app.use(xss());
// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 1000
});
app.use(limiter);
// Prevent http param pollution
app.use(hpp());
// Prevent cors
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
// Mount routers
app.use('/api/v1/moments', moments);
// app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

app.use('/api/v1/messages', messages);
// app.use('/api/v1/users', users);
// app.use('/api/v1/reviews', reviews);
app.use(errorHandler);
io.on('connection', () => {
  console.log('a user is connected');
});
// ENV PORT name loaded
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
// Handle unhandles promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bgBlack);
  // Close server & exit process
  server.close(() => process.exit(1));
});
