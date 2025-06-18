// Admin paneli için backend route'ları
import express from 'express';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Admin yetkisi kontrolü
const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Yetkisiz.' });
  next();
};

// Tüm quizleri getir
router.get('/quizzes', auth, isAdmin, async (req, res) => {
  const quizzes = await Quiz.find().populate('createdBy', 'email username');
  res.json(quizzes);
});

// Quiz düzenle (admin)
router.put('/quiz/:id', auth, isAdmin, async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(quiz);
});

// Quiz sil (admin)
router.delete('/quiz/:id', auth, isAdmin, async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.id);
  res.json({ message: 'Quiz silindi.' });
});

// Quiz canlı başlat (admin)
router.post('/quiz/:id/start', auth, isAdmin, async (req, res) => {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, { isActive: true, roomCode }, { new: true });
  if (!quiz) return res.status(404).json({ message: 'Quiz bulunamadı.' });
  res.json({ roomCode });
});

// Quiz canlı oturumu sonlandır (admin)
router.post('/quiz/:id/end', auth, isAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isActive: false, roomCode: null },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ message: 'Quiz bulunamadı.' });
    res.json({ message: 'Quiz sonlandırıldı.' });
  } catch (err) {
    res.status(500).json({ message: 'Quiz sonlandırılamadı.' });
  }
});

// Tüm kullanıcıları getir
router.get('/users', auth, isAdmin, async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

// Kullanıcı profili ve geçmişi
router.get('/user/:id', auth, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id, '-password').populate('quizHistory.quizId', 'title');
  res.json(user);
});

// Basit analitik
router.get('/analytics', auth, isAdmin, async (req, res) => {
  const quizCount = await Quiz.countDocuments();
  const userCount = await User.countDocuments();
  const mostPlayed = await Quiz.aggregate([
    { $unwind: '$questions' },
    { $group: { _id: '$title', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  res.json({ quizCount, userCount, mostPlayed });
});

export default router;
