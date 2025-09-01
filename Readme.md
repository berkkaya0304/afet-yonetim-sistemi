# 🌐 Afet İletişim ve Koordinasyon Sistemi
English Medium Article: [Click the Link!](https://blog.berkkaya.me/disaster-management-system-my-full-stack-project-81bad2e3e15c)


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
* **Saat Eklentisi(!!)**:
* **Containerization**: Docker
  
---

## 🗄️ Database Bilgileri

### ER Diagram

<img width="2166" height="1588" alt="Untitled (2)" src="https://github.com/user-attachments/assets/11292e7f-881e-4143-b7fc-eb0b5fe556d6" />

### Database Kodu

```sql
CREATE TYPE "user_role" AS ENUM (
  'vatandas',
  'gonullu',
  'yonetici'
);

CREATE TYPE "disaster_type" AS ENUM (
  'DEPREM',
  'SEL',
  'CIG',
  'FIRTINA'
);

CREATE TYPE "request_type_enum" AS ENUM (
  'gida',
  'su',
  'tibbi',
  'enkaz',
  'barinma'
);

CREATE TYPE "request_status_enum" AS ENUM (
  'beklemede',
  'onaylandi',
  'atanmis',
  'tamamlandi',
  'reddedildi'
);

CREATE TYPE "urgency_enum" AS ENUM (
  'dusuk',
  'orta',
  'yuksek'
);

CREATE TYPE "assignment_status_enum" AS ENUM (
  'atanmis',
  'yolda',
  'tamamlandi',
  'iptal_edildi'
);

CREATE TYPE "zone_type_enum" AS ENUM (
  'toplanma_alani',
  'yardim_dagitim'
);

CREATE TABLE "Locations" (
  "id" SERIAL PRIMARY KEY,
  "name" "VARCHAR(150)",
  "latitude" "DECIMAL(10,7)",
  "longitude" "DECIMAL(10,7)",
  "created_at" "TIMESTAMPTZ"
);

CREATE TABLE "Users" (
  "id" SERIAL PRIMARY KEY,
  "full_name" "VARCHAR(100)" NOT NULL,
  "email" "VARCHAR(100)" UNIQUE NOT NULL,
  "password_hash" "VARCHAR(255)" NOT NULL,
  "phone_number" "VARCHAR(20)" UNIQUE,
  "role" user_role NOT NULL DEFAULT 'vatandas',
  "last_known_location_id" INT,
  "created_at" "TIMESTAMPTZ"
);

CREATE TABLE "HelpRequests" (
  "id" SERIAL PRIMARY KEY,
  "requester_id" INT,
  "request_type" request_type_enum NOT NULL,
  "details" TEXT,
  "location_id" INT,
  "disaster_type" disaster_type,
  "status" request_status_enum NOT NULL DEFAULT 'beklemede',
  "urgency" urgency_enum NOT NULL DEFAULT 'orta',
  "created_at" "TIMESTAMPTZ"
);

CREATE TABLE "Assignments" (
  "id" SERIAL PRIMARY KEY,
  "volunteer_id" INT,
  "request_id" INT UNIQUE,
  "status" assignment_status_enum NOT NULL DEFAULT 'atanmis',
  "assigned_at" "TIMESTAMPTZ",
  "completed_at" "TIMESTAMPTZ"
);

CREATE TABLE "Badges" (
  "id" SERIAL PRIMARY KEY,
  "name" "VARCHAR(100)" UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "icon_url" "VARCHAR(255)",
  "criteria_text" "VARCHAR(255)"
);

CREATE TABLE "UserBadges" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "badge_id" INT NOT NULL,
  "earned_at" "TIMESTAMPTZ"
);

CREATE TABLE "Skills" (
  "id" SERIAL PRIMARY KEY,
  "skill_name" "VARCHAR(100)" UNIQUE NOT NULL
);

CREATE TABLE "UserSkills" (
  "user_id" INT NOT NULL,
  "skill_id" INT NOT NULL,
  PRIMARY KEY ("user_id", "skill_id")
);

CREATE TABLE "Announcements" (
  "id" SERIAL PRIMARY KEY,
  "admin_id" INT,
  "title" "VARCHAR(255)" NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" "TIMESTAMPTZ"
);

CREATE TABLE "SafeZones" (
  "id" SERIAL PRIMARY KEY,
  "name" "VARCHAR(150)" NOT NULL,
  "zone_type" zone_type_enum NOT NULL,
  "location_id" INT NOT NULL,
  "added_by_admin_id" INT,
  "created_at" "TIMESTAMPTZ"
);

CREATE UNIQUE INDEX ON "UserBadges" ("user_id", "badge_id");

ALTER TABLE "Users" ADD FOREIGN KEY ("last_known_location_id") REFERENCES "Locations" ("id");

ALTER TABLE "HelpRequests" ADD FOREIGN KEY ("location_id") REFERENCES "Locations" ("id");

ALTER TABLE "HelpRequests" ADD FOREIGN KEY ("requester_id") REFERENCES "Users" ("id");

ALTER TABLE "Assignments" ADD FOREIGN KEY ("request_id") REFERENCES "HelpRequests" ("id");

ALTER TABLE "Assignments" ADD FOREIGN KEY ("volunteer_id") REFERENCES "Users" ("id");

ALTER TABLE "UserBadges" ADD FOREIGN KEY ("user_id") REFERENCES "Users" ("id");

ALTER TABLE "UserBadges" ADD FOREIGN KEY ("badge_id") REFERENCES "Badges" ("id");

ALTER TABLE "UserSkills" ADD FOREIGN KEY ("user_id") REFERENCES "Users" ("id");

ALTER TABLE "UserSkills" ADD FOREIGN KEY ("skill_id") REFERENCES "Skills" ("id");

ALTER TABLE "Announcements" ADD FOREIGN KEY ("admin_id") REFERENCES "Users" ("id");

ALTER TABLE "SafeZones" ADD FOREIGN KEY ("location_id") REFERENCES "Locations" ("id");

ALTER TABLE "SafeZones" ADD FOREIGN KEY ("added_by_admin_id") REFERENCES "Users" ("id");

ALTER TABLE "Assignments" ADD FOREIGN KEY ("volunteer_id") REFERENCES "Assignments" ("request_id");


```
### Database PostGIS Integration

```sql
CREATE EXTENSION postgis;
```
### Database Liquibase Extension

In the project, I am using Liquibase for managing database.

## Backend Bilgileri
