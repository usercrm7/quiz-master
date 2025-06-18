// Kahoot-Clone backend ana uygulama dosyası
// Express.js, Socket.io, MongoDB ve JWT tabanlı kimlik doğrulama ile gerçek zamanlı quiz platformu sunar
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js'; // Kimlik doğrulama endpointleri
import userRoutes from './routes/user.js'; // Kullanıcı endpointleri
import quizRoutes from './routes/quiz.js'; // Quiz endpointleri
import adminRoutes from './routes/admin.js'; // Admin endpointleri
import Quiz from './models/Quiz.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
// Socket.io sunucusu başlatılır
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 5000;

app.use(cors(
  {
    origin: ["https://kahoot-clone-frontend.vercel.app", "http://localhost:3000"], // İzin verilen frontend URL'leri
    methods: ["GET", "POST"], // İzin verilen HTTP metodları
    credentials: true // Çerezler ve kimlik doğrulama bilgileri gönderilsin
  }
));
app.use(bodyParser.json());

// API route'ları
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);

// Oda skorları ve quiz state'leri için bellek içi objeler
const roomQuizState = {};
// Lobby zamanlayıcılarını tutmak için
const lobbyTimers = {};
// Soru zamanlayıcılarını tutmak için
const questionTimers = {};

io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı:', socket.id);

  // Kullanıcı quiz odasına katılır
  socket.on('joinRoom', async ({ roomCode, username }) => {
    socket.join(roomCode);
    // Oda için quiz ve state başlat
    if (!roomQuizState[roomCode]) {
      const quiz = await Quiz.findOne({ roomCode, isActive: true });
      if (quiz) {
        roomQuizState[roomCode] = {
          quiz,
          currentQ: 0,
          scores: {}, // { userId: { score, username } }
          answered: new Set(),
          players: []
        };
      }
    }
    // Kullanıcıyı skor tablosuna ekle (ilk girişte)
    if (roomQuizState[roomCode]) {
      roomQuizState[roomCode].scores[socket.id] = roomQuizState[roomCode].scores[socket.id] || { score: 0 };
      roomQuizState[roomCode].scores[socket.id].username = username;
      if (!roomQuizState[roomCode].players.includes(socket.id)) {
        roomQuizState[roomCode].players.push(socket.id);
      }
    }
    socket.to(roomCode).emit('userJoined', socket.id);
    // Skor tablosu gönder
    const scores = Object.entries(roomQuizState[roomCode]?.scores || {}).map(([userId, data]) => ({ userId, username: data.username, score: data.score }));
    io.to(roomCode).emit('updateScores', scores);
    // Quiz burada başlamaz, sadece lobbyde beklenir
  });

  // Oyun sahibi quiz başlatınca lobby başlat
  socket.on('startLobby', async ({ roomCode }) => {
    if (!roomQuizState[roomCode]) return;
    // Katılımcı listesini başlat
    roomQuizState[roomCode].players = roomQuizState[roomCode].players || [];
    if (!roomQuizState[roomCode].players.includes(socket.id)) {
      roomQuizState[roomCode].players.push(socket.id);
    }
    io.to(roomCode).emit('lobbyStarted', { roomCode });
    // 20 saniyelik geri sayım başlat (katılımcıdan bağımsız)
    if (!lobbyTimers[roomCode]) {
      let seconds = 20;
      lobbyTimers[roomCode] = setInterval(() => {
        seconds--;
        io.to(roomCode).emit('lobbyTimer', { seconds });
        if (seconds <= 0) {
          clearInterval(lobbyTimers[roomCode]);
          delete lobbyTimers[roomCode];
          io.to(roomCode).emit('lobbyEnd'); // Oyun başlasın
        }
      }, 1000);
    }
  });

  // Katılımcı PIN ile odaya katılır
  socket.on('joinLobby', ({ roomCode, username }) => {
    socket.join(roomCode);
    if (roomQuizState[roomCode]) {
      roomQuizState[roomCode].players = roomQuizState[roomCode].players || [];
      if (!roomQuizState[roomCode].players.includes(socket.id)) {
        roomQuizState[roomCode].players.push(socket.id);
      }
      // Katılımcı listesi güncellenir
      io.to(roomCode).emit('lobbyPlayers', { players: roomQuizState[roomCode].players.length });
    }
  });

  // Oda için mevcut soruyu gönder
  socket.on('getQuestion', (roomCode) => {
    const state = roomQuizState[roomCode];
    if (state && state.quiz.questions[state.currentQ]) {
      io.to(roomCode).emit('question', {
        index: state.currentQ,
        question: state.quiz.questions[state.currentQ]
      });
      state.answered = new Set();
      // Soru zamanlayıcısını başlat (ör. 20 saniye)
      if (questionTimers[roomCode]) {
        clearTimeout(questionTimers[roomCode]);
      }
      questionTimers[roomCode] = setTimeout(() => {
        io.to(roomCode).emit('autoNextQuestion');
      }, 20000); // 20 saniye sonra otomatik geç
    }
  });

  // Kullanıcı cevap gönderdiğinde
  socket.on('sendAnswer', ({ roomCode, answer, userId, username }) => {
    const state = roomQuizState[roomCode];
    if (!state || state.answered.has(userId)) return;
    state.answered.add(userId);
    const q = state.quiz.questions[state.currentQ];
    const isCorrect = q.options[q.correctIndex] === answer;
    // Her zaman username'i güncelle
    state.scores[userId] = state.scores[userId] || { score: 0 };
    state.scores[userId].username = username || state.scores[userId].username || '?';
    if (isCorrect) state.scores[userId].score += 1;
    io.to(roomCode).emit('receiveAnswer', { userId, answer, isCorrect });
    // Skor tablosu gönder
    const scores = Object.entries(state.scores).map(([userId, data]) => ({ userId, username: data.username, score: data.score }));
    io.to(roomCode).emit('updateScores', scores);
    // Tüm oyuncular cevap verdiyse otomatik olarak sonraki soruya geç
    const totalPlayers = state.players.length;
    if (state.answered.size >= totalPlayers) {
      // Soru zamanlayıcısını temizle
      if (questionTimers[roomCode]) {
        clearTimeout(questionTimers[roomCode]);
        delete questionTimers[roomCode];
      }
      setTimeout(() => {
        io.to(roomCode).emit('autoNextQuestion');
      }, 1000); // 1 sn bekle, sonra otomatik geç
    }
  });

  // Otomatik olarak sonraki soruya geç (autoNextQuestion event'i)
  socket.on('autoNextQuestion', (roomCode) => {
    const state = roomQuizState[roomCode];
    if (state) {
      state.currentQ += 1;
      state.answered = new Set();
      if (state.quiz.questions[state.currentQ]) {
        io.to(roomCode).emit('question', {
          index: state.currentQ,
          question: state.quiz.questions[state.currentQ]
        });
      } else {
        // Quiz bittiğinde skorları kullanıcıya kaydet
        const quizId = state.quiz._id;
        const scoresArr = Object.entries(state.scores).map(([userId, data]) => ({ userId, username: data.username, score: data.score }));
        // Her kullanıcı için quizHistory'ye ekle
        scoresArr.forEach(async ({ userId, score }) => {
          // userId artık socket.id değil, frontend'den userId gönderilmeli veya username ile birlikte localStorage'dan alınmalı
          // Daha güvenli olması için username yerine userId ile bulmaya çalış
          let user = null;
          if (userId && userId.length === 24) {
            // Muhtemelen bir ObjectId (userId)
            user = await User.findById(userId);
          }
          if (!user) {
            // Fallback: username ile bul
            user = await User.findOne({ username: state.scores[userId]?.username });
          }
          if (user) {
            // Aynı quiz ve mode için tekrar kayıt eklenmesin
            const already = user.quizHistory.find(q => q.quizId.toString() === quizId.toString() && q.mode === 'canli');
            if (!already) {
              user.quizHistory.push({ quizId, score, date: new Date(), mode: 'canli' });
              await user.save();
            }
          }
        });
        io.to(roomCode).emit('quizEnd', { scores: scoresArr });
      }
    }
  });

  // Sonraki soruya geç (manuel)
  socket.on('nextQuestion', (roomCode) => {
    // Soru zamanlayıcısını temizle
    if (questionTimers[roomCode]) {
      clearTimeout(questionTimers[roomCode]);
      delete questionTimers[roomCode];
    }
    const state = roomQuizState[roomCode];
    if (state) {
      state.currentQ += 1;
      state.answered = new Set();
      if (state.quiz.questions[state.currentQ]) {
        io.to(roomCode).emit('question', {
          index: state.currentQ,
          question: state.quiz.questions[state.currentQ]
        });
        // Yeni soru için zamanlayıcı başlat
        if (questionTimers[roomCode]) {
          clearTimeout(questionTimers[roomCode]);
        }
        questionTimers[roomCode] = setTimeout(() => {
          io.to(roomCode).emit('autoNextQuestion');
        }, 20000);
      } else {
        // Quiz bittiğinde skorları kullanıcıya kaydet
        const quizId = state.quiz._id;
        const scoresArr = Object.entries(state.scores).map(([userId, data]) => ({ userId, username: data.username, score: data.score }));
        // Her kullanıcı için quizHistory'ye ekle
        scoresArr.forEach(async ({ userId, score }) => {
          // userId artık socket.id değil, frontend'den userId gönderilmeli veya username ile birlikte localStorage'dan alınmalı
          // Daha güvenli olması için username yerine userId ile bulmaya çalış
          let user = null;
          if (userId && userId.length === 24) {
            // Muhtemelen bir ObjectId (userId)
            user = await User.findById(userId);
          }
          if (!user) {
            // Fallback: username ile bul
            user = await User.findOne({ username: state.scores[userId]?.username });
          }
          if (user) {
            // Aynı quiz ve mode için tekrar kayıt eklenmesin
            const already = user.quizHistory.find(q => q.quizId.toString() === quizId.toString() && q.mode === 'canli');
            if (!already) {
              user.quizHistory.push({ quizId, score, date: new Date(), mode: 'canli' });
              await user.save();
            }
          }
        });
        io.to(roomCode).emit('quizEnd', { scores: scoresArr });
      }
    }
  });

  // Kullanıcı bağlantıyı kopardığında
  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
    // GEREKSİZ: roomScores ile skor tablosundan çıkarma kodu kaldırıldı
    // Skor yönetimi roomQuizState ile yapılmalı
    // Eğer oyuncu roomQuizState'den çıkarılacaksa, burada eklenebilir
  });
});

// MongoDB bağlantısı ve sunucu başlatma
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected to', process.env.MONGODB_URI);
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

export default app;
