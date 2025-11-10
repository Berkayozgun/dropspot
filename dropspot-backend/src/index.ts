import 'dotenv/config';
import express from 'express';
import * as authController from './controllers/auth.controller';
import { authenticateToken } from './middlewares/auth.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Auth routes
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);

app.get('/', (req, res) => {
  res.send('Dropspot Backend Çalışıyor!');
});

// Protected route example
app.get('/protected', authenticateToken, (req: any, res) => {
  res.json({ message: 'Bu korumalı bir rota!', userId: req.userId });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor.`);
});
