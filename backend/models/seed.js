// Veritabanına örnek kullanıcı ve quiz eklemek için seed scripti
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './User.js';
import Quiz from './Quiz.js';

dotenv.config();

// Seed işlemini başlatan asenkron fonksiyon
async function seed() {
  // MongoDB'ye bağlan
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Örnek kullanıcı ekle
  const user = new User({
    email: 'testuser@example.com', // Kullanıcı emaili
    password: '$2b$10$123456789012345678901uQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', // Hashlenmiş şifre örneği
    username: 'testuser' // Kullanıcı adı
  });
  await user.save();

  // Örnek quiz ve sorular ekle
  const quiz = new Quiz({
    title: 'Genel Kültür Testi', // Quiz başlığı
    description: 'Basit genel kültür soruları', // Quiz açıklaması
    questions: [
      {
        text: 'Türkiye’nin başkenti neresidir?', // Soru metni
        options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'], // Şıklar
        correctIndex: 1 // Doğru şık indeksi
      },
      {
        text: 'En büyük gezegen hangisidir?',
        options: ['Mars', 'Venüs', 'Jüpiter', 'Dünya'],
        correctIndex: 2
      }
    ],
    createdBy: user._id // Quiz'i oluşturan kullanıcı
  });
  await quiz.save();

  console.log('Seed işlemi tamamlandı!'); // Bilgilendirme
  await mongoose.disconnect(); // Bağlantıyı kapat
}

// Seed fonksiyonunu çalıştır
seed();
