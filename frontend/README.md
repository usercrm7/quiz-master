# Kahoot-Clone Frontend (React)

Bu proje, gelişmiş çok oyunculu canlı quiz deneyimi sunan bir platformun React tabanlı frontend uygulamasıdır. Modern dashboard, kullanıcı profili, admin paneli ve canlı quiz yönetimi ile tam entegre bir deneyim sunar.

## Özellikler
- Modern ve kullanıcı dostu arayüz (React + Material UI)
- Gerçek zamanlı canlı quiz akışı (Socket.io ile backend entegrasyonu)
- PIN ile quiz odasına katılım ve lobby (bekleme odası)
- Quiz başlatma ve canlı quiz bekleme odasında quiz sonlandırma (sadece quiz sahibi veya admin için)
- Sadece admin rolüne sahip kullanıcılar için admin paneli erişimi
- **Admin paneli:** kullanıcı, quiz ve analytics yönetimi, canlı quiz başlatma/sonlandırma, quiz kartında oda kodu gösterimi ve kopyalama, End Live ile oturumu bitirme
- Quiz oluşturma, düzenleme, silme ve oynama
- Her oyuncunun kendi cevabını verebilmesi, cevap sonrası butonların kilitlenmesi ve "Diğer oyuncular bekleniyor" mesajı
- Soru başına zamanlayıcı, otomatik yeni soruya geçiş (tüm oyuncular cevap verince veya süre dolunca)
- Gerçek zamanlı skor tablosu (puan sıralı)
- Quiz geçmişi ve kullanıcı profili dashboard'u
- Hata yönetimi ve kullanıcı deneyimi odaklı UX iyileştirmeleri
- Arka plan müziği ile quiz deneyimini zenginleştirme

## Kurulum ve Çalıştırma
1. Gerekli paketleri yükleyin:
   ```powershell
   cd frontend
   npm install
   ```
2. Uygulamayı başlatın:
   ```powershell
   npm start
   ```
   Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Temel Sayfalar ve Akış
- **Ana Sayfa:** Kullanıcı girişi, quiz geçmişi ve yönlendirmeler
- **Quiz Listesi:** Tüm quizleri görüntüleme, quiz oluşturma, düzenleme, silme ve başlatma
- **Quiz Oluştur:** Modern form ile yeni quiz ekleme
- **Lobby:** Oda PIN'i ile katılım, bekleme odası, oyuncu listesi ve quiz sahibi/admin için quiz sonlandırma
- **Canlı Quiz:** Soru akışı, zamanlayıcı, cevaplama, skor tablosu ve quiz bitişi
- **Profil:** Kullanıcı bilgileri, quiz geçmişi ve istatistikler (dashboard)
- **Admin Paneli:** Sadece admin rolü için, kullanıcı/quiz yönetimi, analytics ve canlı quiz kontrolü, oda kodu gösterimi ve End Live

## Gelişmiş Canlı Quiz Akışı
- Her oyuncu kendi cevabını verir, cevap verdikten sonra butonlar kilitlenir ve bekleme mesajı gösterilir
- Tüm oyuncular cevap verince veya süre dolunca otomatik olarak yeni soruya geçilir
- Soruya hiç cevap verilmezse de otomatik geçiş sağlanır
- Skor tablosu puana göre anlık güncellenir
- Quiz sonunda skorlar ve geçmiş kaydedilir (hem tekil hem canlı quizler için)
- Admin panelde veya quiz listesinde admin, canlı quiz başlatabilir, oda kodunu görebilir/kopyalayabilir ve End Live ile oturumu sonlandırabilir

## Geliştirici Notları
- Kodda tüm önemli event ve state yönetimi açıklamalı olarak yazılmıştır
- Socket.io eventleri ve quiz akışı backend ile tam entegredir
- Modern dashboard ve admin paneli ile tam yönetim deneyimi
- Son kullanıcı deneyimi ve hata yönetimi için ek testler ve UX iyileştirmeleri yapılmıştır
- Rol tabanlı erişim ve güvenlik için localStorage'da role ve token kontrolü yapılır
- API servisleri `src/services/api.js` dosyasında merkezi olarak yönetilir

---

Aşağıdaki komutlar Create React App altyapısı için geçerlidir.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
