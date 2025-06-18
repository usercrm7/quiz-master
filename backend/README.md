# Kahoot-Clone Backend

## Özellikler
- Node.js + Express.js tabanlı REST API
- MongoDB (Mongoose ile)
- JWT tabanlı kimlik doğrulama ve rol tabanlı erişim (admin/user)
- Gerçek zamanlı quiz akışı (Socket.io)
- Quiz oluşturma, başlatma, bitirme, oda kodu ile katılım
- Kullanıcıya özel quiz geçmişi ve skor kaydı (hem tekil hem canlı quizler için)
- Modern, güvenli ve ölçeklenebilir altyapı
- **Çok oyunculu canlı quiz:** PIN ile katılım, lobby (bekleme odası), zamanlayıcı, eşzamanlı soru akışı, skor tablosu, quiz geçmişi ve kullanıcı profili
- **Gerçek zamanlı otomasyon:** Her oyuncu kendi cevabını verebilir, tüm oyuncular cevap verince veya süre dolunca otomatik olarak yeni soruya geçilir
- **Bağlantı ve edge-case yönetimi:** Bağlantı kopması, yeniden katılım gibi durumlar için temel altyapı
- **Admin paneli:** Kullanıcı, quiz ve analytics yönetimi, canlı quiz başlatma/sonlandırma, quiz düzenleme/silme, sadece admin rolü için erişim
- **Canlı quiz bekleme odasında quiz sonlandırma:** Sadece quiz sahibi/admin için
- **Arka plan müziği:** Canlı ve tekil quizlerde frontend ile entegre şekilde desteklenir

## Kurulum
1. Gerekli paketleri yükleyin:
   ```powershell
   cd backend
   npm install
   ```
2. `.env` dosyasındaki ayarları kontrol edin (MongoDB bağlantı adresi, JWT secret, port).
3. Sunucuyu başlatın:
   ```powershell
   npm run dev
   ```

## API Endpointleri

### Auth
- `POST /api/auth/register` : Kullanıcı kaydı (username, email, password)
- `POST /api/auth/login` : Kullanıcı girişi (JWT döner, rol bilgisi ile)

### Kullanıcı
- `GET /api/user/me` : Kullanıcı profilini ve quiz geçmişini getir (JWT ile korumalı)

### Quiz
- `POST /api/quiz` : Quiz oluştur (JWT ile korumalı)
- `GET /api/quiz` : Tüm quizleri listele
- `GET /api/quiz/:id` : Belirli quiz detayını getir
- `PUT /api/quiz/:id` : Quiz güncelle (JWT ile korumalı)
- `DELETE /api/quiz/:id` : Quiz sil (JWT ile korumalı)
- `POST /api/quiz/:id/start` : Quiz başlat (oda kodu üretir, quiz'i aktif yapar)
- `POST /api/quiz/:id/end` : Quiz bitir (quiz'i pasif yapar)
- `GET /api/quiz/room/:roomCode` : Oda kodu ile aktif quiz bul

### Admin API (Sadece admin rolü için)
- `GET /api/admin/users` : Tüm kullanıcıları getir
- `GET /api/admin/quizzes` : Tüm quizleri getir
- `GET /api/admin/analytics` : Analytics verilerini getir
- `PUT /api/admin/quiz/:id` : Quiz düzenle
- `DELETE /api/admin/quiz/:id` : Quiz sil
- `POST /api/admin/quiz/:id/start` : Quiz başlat (admin)
- `POST /api/admin/quiz/:id/end` : Quiz bitir (admin)

## Socket.io Eventleri
- `joinRoom` : { roomCode, username, userId } ile odaya katılım
- `getQuestion` : Odanın mevcut sorusunu getirir
- `sendAnswer` : { roomCode, answer, userId, username } ile cevap gönderir
- `nextQuestion` : Sonraki soruya geçer (backend otomasyonu ile)
- `autoNextQuestion` : Süre dolunca veya tüm oyuncular cevap verince backend tarafından otomatik tetiklenir
- `updateScores` : Skor tablosunu günceller
- `quizEnd` : Quiz bittiğinde skorları gönderir ve quiz geçmişini kaydeder
- `lobbyStarted`, `lobbyTimer`, `lobbyPlayers`, `lobbyEnd` : Lobby yönetimi için eventler
- `receiveAnswer` : Her oyuncunun cevabı geldiğinde tetiklenir

## Canlı Quiz Akışı
- Her oyuncu kendi cevabını verebilir, cevap verdikten sonra cevabı kilitlenir ve "Diğer oyuncular bekleniyor" mesajı gösterilir
- Tüm oyuncular cevap verirse veya süre dolarsa backend otomatik olarak yeni soruya geçer
- Soruya hiç cevap verilmezse de otomatik geçiş sağlanır
- Skor tablosu puana göre sıralanır, quiz sonunda geçmiş ve skorlar kaydedilir (artık canlı quizler de dahil)
- Admin veya quiz sahibi canlı oturumu sonlandırabilir

## Quiz Geçmişi
- Her kullanıcıya özel quiz geçmişi ve skorlar otomatik kaydedilir
- Tekil ve canlı quiz oturumları için geçmiş kaydı yapılır
- `/api/user/me` endpointi ile geçmiş görüntülenebilir
- Admin panelinde tüm kullanıcıların ve quizlerin geçmişi yönetilebilir

## Notlar
- Kodda tüm endpointler ve socket eventleri için detaylı açıklamalar mevcuttur
- Son kullanıcı deneyimi ve hata yönetimi için ek testler ve iyileştirmeler yapılmıştır
- Modern admin paneli ve canlı quiz yönetimi için backend kodunu inceleyiniz
- Admin, tüm quizleri canlı başlatabilir, oda kodunu görebilir ve oturumu sonlandırabilir
- Proje production-ready mimariye sahiptir, yeni özellikler için modüler yapı korunmalıdır

---