// Kullanıcı (User) modelini tanımlar
import mongoose from 'mongoose';

// Kullanıcı şeması: email, şifre, kullanıcı adı, oluşturulma tarihi ve quiz geçmişi
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Kullanıcı emaili (benzersiz)
  password: { type: String, required: true }, // Hashlenmiş şifre
  username: { type: String }, // Kullanıcı adı
  createdAt: { type: Date, default: Date.now }, // Kayıt tarihi
  quizHistory: [ // Kullanıcının geçmişte katıldığı quizler ve skorları
    {
      quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }, // Quiz referansı
      score: Number, // Kullanıcının bu quizdeki skoru
      date: { type: Date, default: Date.now }, // Quizin tamamlandığı tarih
      mode: { type: String, default: 'bireysel' } // Oynama modu: 'canli' veya 'bireysel'
    }
  ],
  role: { type: String, enum: ['user', 'admin'], default: 'user' } // Kullanıcı rolü (admin paneli için)
});

// User modelini dışa aktar
export default mongoose.model('User', userSchema);
