import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';
import { logger } from './config/logger';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import startupRoutes from './routes/startup.routes';
import meetingRoutes from './routes/meeting.routes';
import milestoneRoutes from './routes/milestone.routes';
import fundingRoutes from './routes/funding.routes';
import notificationRoutes from './routes/notification.routes';
import userRoutes from './routes/user.routes';
import mentorRoutes from './routes/mentor.routes';
import resourceRoutes from './routes/resource.routes';
import investorRoutes from './routes/investor.routes';
import incubationRoutes from './routes/incubation.routes';
import adminRoutes from './routes/admin.routes';
import founderRoutes from './routes/founder.routes';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Trust Proxy for Rate Limiting & Secure Cookies behind reverse proxy
app.set('trust proxy', 1);

// Set security HTTP headers
app.use(helmet());

app.use(express.json({ limit: '10kb' })); // Body parser limit
app.use(cookieParser());

// Data sanitization against NoSQL query injection & XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Request Logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);

app.use('/api/founder', founderRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/incubation', incubationRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}

export default app;
