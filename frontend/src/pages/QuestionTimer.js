// Soru için geri sayım zamanlayıcısı bileşeni
import React, { useEffect, useState } from 'react';

// duration: toplam süre (saniye), onTimeout: süre bitince çağrılacak fonksiyon
function QuestionTimer({ duration, onTimeout }) {
  const [time, setTime] = useState(duration); // Kalan süre state'i

  // Her saniye bir azalt, süre bitince onTimeout'u çağır
  useEffect(() => {
    if (time === 0) {
      onTimeout(); // Süre bittiğinde callback fonksiyonu çağır
      return;
    }
    // 1 saniye sonra time'ı azalt
    const timer = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(timer); // Temizlik: timer'ı temizle
  }, [time, onTimeout]);

  return (
    // Son 5 saniyede kırmızı, diğer zamanlarda siyah renkli kalan süreyi göster
    <div style={{ fontWeight: 'bold', color: time < 5 ? 'red' : 'black' }}>
      Kalan Süre: {time} sn
    </div>
  );
}

export default QuestionTimer;
