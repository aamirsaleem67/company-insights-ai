require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const analyzeRouter = require('./routes/analyze');

const app = express();

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 10
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(limiter);

app.use('/api', analyzeRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 