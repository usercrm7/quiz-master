// Quiz işlemleri (oluşturma, listeleme, başlatma, bitirme, oda kodu ile bulma) için route
import express from 'express';
import Quiz from '../models/Quiz.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Quiz oluştur (sadece giriş yapan kullanıcı)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, questions } = req.body; // Quiz bilgileri alınır
    const quiz = new Quiz({
      title,
      description,
      questions,
      createdBy: req.user.id // Quiz'i oluşturan kullanıcı
    });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Quiz oluşturulamadı.' });
  }
});

// Tüm quizleri listele
router.get('/', async (req, res) => {
  try {
    // Quizleri ve oluşturan kullanıcının emailini getir
    const quizzes = await Quiz.find().populate('createdBy', 'email');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Quizler alınamadı.' });
  }
});

// Belirli bir quizin sorularını getir
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz bulunamadı.' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Quiz alınamadı.' });
  }
});

// Quiz başlat (canlı oyun için)
router.post('/:id/start', async (req, res) => {
  try {
    // Oda kodu oluştur ve quiz'i aktif yap
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isActive: true, roomCode },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ message: 'Quiz bulunamadı.' });
    res.json({ roomCode });
  } catch (err) {
    res.status(500).json({ message: 'Quiz başlatılamadı.' });
  }
});

// Quiz bitir (canlı oyun için)
router.post('/:id/end', async (req, res) => {
  try {
    // Quiz'i pasif yap ve oda kodunu kaldır
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

// Oda kodu ile aktif quiz bul
router.get('/room/:roomCode', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ roomCode: req.params.roomCode, isActive: true });
    if (!quiz) return res.status(404).json({ message: 'Aktif quiz bulunamadı.' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Quiz alınamadı.' });
  }
});

// Quiz güncelle (sadece quiz sahibi)
router.put('/:id', auth, async (req, res) => {
  try {
    // Quiz'i id ile bul
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz bulunamadı.' });
    // Sadece quiz'i oluşturan kullanıcı güncelleyebilir
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Sadece quiz sahibi güncelleyebilir.' });
    }
    // Güncellenecek alanlar
    const { title, description, questions } = req.body;
    quiz.title = title ?? quiz.title;
    quiz.description = description ?? quiz.description;
    quiz.questions = questions ?? quiz.questions;
    await quiz.save();
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Quiz güncellenemedi.' });
  }
});

// Quiz sil (sadece quiz sahibi)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Quiz'i id ile bul
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz bulunamadı.' });
    // Sadece quiz'i oluşturan kullanıcı silebilir
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Sadece quiz sahibi silebilir.' });
    }
    await quiz.deleteOne();
    res.json({ message: 'Quiz silindi.' });
  } catch (err) {
    res.status(500).json({ message: 'Quiz silinemedi.' });
  }
});

// Bireysel quiz tamamlandığında quiz geçmişi ekle
router.post('/:id/history', auth, async (req, res) => {
  try {
    const { score, date, mode } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz bulunamadı.' });
    const user = await (await import('../models/User.js')).default.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    // Aynı quiz için tekrar tekrar kayıt eklenmesini önlemek için kontrol (isteğe bağlı)
    const already = user.quizHistory.find(q => q.quizId.toString() === req.params.id && q.mode === (mode || 'bireysel'));
    if (already) return res.status(400).json({ message: 'Bu quiz geçmişte zaten kaydedilmiş.' });
    user.quizHistory.push({ quizId: req.params.id, score, date: date ? new Date(date) : new Date(), mode: mode || 'bireysel' });
    await user.save();
    res.json({ message: 'Quiz geçmişi kaydedildi.' });
  } catch (err) {
    res.status(500).json({ message: 'Quiz geçmişi kaydedilemedi.' });
  }
});

export default router;
