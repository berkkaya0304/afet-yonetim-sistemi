# 🌐 Afet İletişim ve Koordinasyon Sistemi

Türkiye’de meydana gelebilecek afetlerde;
* vatandaşların hızlıca yardım çağrısı yapabildiği,  
* gönüllü ve profesyonel ekiplerin kaynak–ihtiyaç eşleşmesini tek ekrandan yönetebildiği,  
* yöneticilerin anlık durumsal farkındalık edinerek ekipleri koordine edebildiği  

açık kaynaklı bir platform.

---

## 📑 İçindekiler
1. [Kullanıcı Rolleri](#-kullanıcı-rolleri)
2. [Sistemin Ana Amacı](#-sistemin-ana-amacı)
3. [Temel Use–Case’ler](#-temel-use-caseler)
   * [Vatandaş](#vatandaşlar-için-özellikler)
   * [Gönüllüler / Ekipler](#gönüllüler-ve-ekipler-için-özellikler)
   * [Yöneticiler](#yöneticiler-için-özellikler-admin-paneli)
4. [Teknolojiler](#-teknolojiler)

---

## 👥 Kullanıcı Rolleri
| # | Rol            |
|---|----------------|
| 1 | **Vatandaş**   |
| 2 | **AFAD Çalışanı** |
| 3 | **Kurtarma Ekibi / Gönüllü** |

---

## 🎯 Sistemin Ana Amacı
1. **Etkili İletişim ve Bilgi Akışı Sağlamak**  
2. **İhtiyaç ve Kaynakları Eşleştirmek**  
3. **Durumsal Farkındalık Yaratmak**  
4. **Gönüllü ve Ekip Organizasyonunu Kolaylaştırmak**
5. **Gönüllü Katılımını Teşvik Etmek ve Takdir Etmek**

---

## 📝 Temel Use-Caseler

### Vatandaşlar İçin Özellikler
* **Yardım Talebi Oluşturma**
  * Konum (GPS veya harita seçimi)
  * İhtiyaç türü (Su, Gıda, Tıbbi, Enkaz, Barınma…)
  * Kişi sayısı & aciliyet
* **“Güvendeyim” Butonu**
  * Tek tuş ile yakınlara/Sisteme konumlu mesaj
* **Harita Arayüzü**
  * Güvenli Toplanma Alanları & Yardım Noktaları
  * Isı haritası ile yoğun talepler
* **Bilgi Akışı**
  * Resmî duyurular & anlık bildirimler

### Gönüllüler ve Ekipler İçin Özellikler
* **Gönüllü Kaydı ve Profil**
  * Yetkinlik belirtme (Tıp, Şoförlük, Ekipman…)
* **Görev Listesi & Harita**
  * Onaylanmış/atanmamış talepleri görüntüleme
  * “Görevi üstlen” ile çakışmaları engelleme
* **Görev Yönetimi**
  * Durum güncelleme (Yola çıktım → Ulaştım → Tamamlandı)
  * Rozet ve Ödüllendirme Sistemi ✨
       * Otomatik Rozet Kazanımı: Belirli kriterler karşılandığında sistem tarafından otomatik olarak rozet kazanma. Örnekler:
           * "İlk Adım": İlk görevini başarıyla tamamladığında.
           * "Yardımsever" (Seviye 1-2-3): 5, 15, 30 görev tamamladığında.
           * "Sıhhiyeci": İlk yardım veya tıbbi destek içeren bir görevi tamamladığında.
           * "Lojistik Destek": Taşıma veya dağıtım içeren 5 görevi tamamladığında.
           * "Gece Kartalı": Gece saatlerinde bir görevi tamamladığında.
           * "Kararlı Gönüllü": Üst üste 3 gün boyunca en az bir görev tamamladığında.
       * Liderlik Tablosu 

### Yöneticiler İçin Özellikler (Admin Paneli)
* **Dashboard**
  * Toplam talep, aktif gönüllü, tamamlanan görev…
* **Talep Yönetimi**
  * Liste/harita görünümü
  * Doğrulama, önceliklendirme, reddetme, atama
* **Gönüllü Yönetimi**
  * Yetkinlik & konum takibi
* **Duyuru/Bildirim**
  * Bölgeye özel veya genel
* **Harita Yönetimi**
  * Toplanma alanı / dağıtım noktası ekleme-kaldırma
* **Rozet Yönetimi**
  * Rozet Oluşturma ve Düzenleme: Sisteme yeni rozetler ekleyebilme (rozet adı, açıklaması, ikonu, kazanma kriteri).
  * Kazanma Kriterlerini Belirleme: "10 görev tamamlayınca X rozetini kazan" gibi kuralları tanımlayabilme.
  * Manuel Rozet Verme: Olağanüstü çaba gösteren bir gönüllüye özel bir rozeti manuel olarak atayabilme (örn: "Günün Kahramanı" rozeti).

---

## 🛠️ Teknolojiler
* **Backend**: Java Spring Boot  
* **Database**: PostgreSQL  
* **Frontend (Web)**: Angular  
* **Mobile**: Flutter  
* **Saat Eklentisi(!!)**:

---

## 🗄️ Database Bilgileri
