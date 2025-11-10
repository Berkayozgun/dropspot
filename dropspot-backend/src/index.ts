import 'dotenv/config';
import express from 'express';
import * as authController from './controllers/auth.controller';
import * as dropController from './controllers/drop.controller'; // dropController'ı içe aktar
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

// Drop routes (public)
app.get('/drops', dropController.getDrops);

// Admin Drop routes (protected - authentication will be added later)
app.post('/admin/drops', dropController.createDrop);
app.put('/admin/drops/:id', dropController.updateDrop);
app.delete('/admin/drops/:id', dropController.deleteDrop);

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor.`);
});
