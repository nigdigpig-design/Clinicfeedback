import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import doctorsRouter from './routes/doctors';
import feedbackRouter from './routes/feedback';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ ЭТОТ БЛОК — ПЕРВЫЙ middleware
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // Также устанавливаем для HTML-ответов (если будут)
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  next();
});

app.use(cors());
app.use(express.json());

// Маршруты
app.use('/api/doctors', doctorsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер работает' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});