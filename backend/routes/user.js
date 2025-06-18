// Kullanıcıya ait işlemler (profil bilgisi) için route
import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Giriş yapan kullanıcının profilini getirir
router.get('/me', auth, async (req, res) => {
  try {
    // Kullanıcıyı id ile bul, şifreyi gönderme
    const user = await User.findById(req.user.id).select('-password');
    res.json(user); // Kullanıcı bilgilerini döndür
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

export default router;
