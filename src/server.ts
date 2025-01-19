import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import analyzeRouter from './routes/analyze';
import { config } from './config';

const app = express();

const limiter = rateLimit({
  windowMs: config.server.rateLimit.windowMs,
  max: config.server.rateLimit.maxRequests,
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(limiter);

app.use('/api', analyzeRouter);

app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
});
