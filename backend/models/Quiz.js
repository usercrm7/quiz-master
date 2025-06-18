// Quiz (Sınav) modelini tanımlar
import mongoose from 'mongoose';

// Quiz şeması: başlık, açıklama, sorular, oluşturan kullanıcı, aktiflik ve oda kodu
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Quiz başlığı
  description: { type: String }, // Quiz açıklaması
  questions: [ // Quizdeki sorular dizisi
    {
      text: { type: String, required: true }, // Soru metni
      options: [String], // Şıklar
      correctIndex: { type: Number, required: true } // Doğru şık indeksi
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Quiz'i oluşturan kullanıcı
  isActive: { type: Boolean, default: false }, // Canlı quiz için aktiflik durumu
  roomCode: { type: String, default: null } // Canlı quiz için oda kodu
});

// Quiz modelini dışa aktar
export default mongoose.model('Quiz', quizSchema);
