import cors from 'cors';
import express, { Application } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFoundHandler from './app/middlewares/notFoundHandler';
import router from './app/routes/route';
import config from './app/config';

const app: Application = express();

app.use(cors({ origin: config.cors_origin, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/v1', router);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
