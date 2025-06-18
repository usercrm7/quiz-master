// Kimlik doğrulama (register, login) işlemleri için route
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Kullanıcı kaydı endpoint'i
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body; // İstekten kullanıcı adı, email ve şifre alınır
  try {
    // Email veya username zaten var mı kontrol et
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'Kullanıcı zaten mevcut.' });
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    // Yeni kullanıcı oluştur
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Kayıt başarılı.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// Kullanıcı girişi endpoint'i
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Email ile kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Kullanıcı bulunamadı.' });
    // Şifreyi karşılaştır
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Şifre hatalı.' });
    // JWT token oluştur
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

export default router;
