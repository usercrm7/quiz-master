// JWT tabanlı kimlik doğrulama middleware'ı
import jwt from 'jsonwebtoken';

// Bu fonksiyon, gelen istekteki JWT token'ı doğrular. Token geçerliyse kullanıcı bilgisini req.user'a ekler.
export default function (req, res, next) {
  // Authorization header'dan token'ı al
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token> formatı
  if (!token) return res.status(401).json({ message: 'Yetkisiz erişim.' }); // Token yoksa hata dön
  try {
    // Token'ı doğrula ve çöz
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Kullanıcı bilgisini req.user'a ekle
    next(); // Bir sonraki middleware'a geç
  } catch (err) {
    // Token geçersizse hata dön
    res.status(403).json({ message: 'Geçersiz token.' });
  }
}
