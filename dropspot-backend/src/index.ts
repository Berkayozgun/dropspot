import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as authController from './controllers/auth.controller';
import * as dropController from './controllers/drop.controller'; // dropController'ı içe aktar
import * as waitlistController from './controllers/waitlist.controller'; // waitlistController'ı içe aktar
import * as claimController from './controllers/claim.controller';     // claimController'ı içe aktar
import { authenticateToken } from './middlewares/auth.middleware';
import { authorizeAdmin } from './middlewares/admin.middleware'; // authorizeAdmin'i içe aktar

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors()); // CORS middleware'ini ekle

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
app.get('/drops/:id', dropController.getDropById); // Drop detaylarını getirme route'u eklendi

// Admin Drop routes (protected with authentication and authorization)
app.post('/admin/drops', authenticateToken, authorizeAdmin, dropController.createDrop);
app.get('/admin/drops', authenticateToken, authorizeAdmin, dropController.getAdminDrops); // Admin droplarını getirme route'u eklendi
app.get('/admin/drops/:id', authenticateToken, authorizeAdmin, dropController.getAdminDropById); // Admin drop detaylarını getirme route'u eklendi
app.put('/admin/drops/:id', authenticateToken, authorizeAdmin, dropController.updateDrop);
app.delete('/admin/drops/:id', authenticateToken, authorizeAdmin, dropController.deleteDrop);

// Waitlist routes (protected)
app.post('/drops/:id/join', authenticateToken, waitlistController.joinWaitlist);
app.post('/drops/:id/leave', authenticateToken, waitlistController.leaveWaitlist);

// Claim route (protected)
app.post('/drops/:id/claim', authenticateToken, claimController.claimDrop);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor.`);
  });
}

export default app;
