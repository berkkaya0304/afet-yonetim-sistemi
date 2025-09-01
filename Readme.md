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

Bu proje, afet yönetim sistemi için geliştirilmiş mikroservis mimarisinde bir backend uygulamasıdır. Spring Boot ve Spring Cloud teknolojileri kullanılarak geliştirilmiştir.

### 🏗️ Proje Yapısı

Proje aşağıdaki mikroservislerden oluşmaktadır:

- **user-service** - Kullanıcı yönetimi ve kimlik doğrulama
- **api-gateway-service** - API Gateway ve yönlendirme
- **assignment-service** - Görev atama ve yönetimi
- **websocket-service** - Gerçek zamanlı iletişim
- **notification-service** - Bildirim yönetimi
- **information-service** - Bilgi yönetimi
- **request-service** - Talep yönetimi
- **discovery-service** - Servis keşfi (Eureka)

### 🚀 Başlangıç

#### Gereksinimler

- Java 17
- Maven 3.6+
- PostgreSQL 12+
- Docker (opsiyonel)

#### Kurulum

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd havelsan-staj-backend
```

2. **Veritabanını kurun:**
```bash
# PostgreSQL'de yeni veritabanı oluşturun
createdb disastermanagement
```

3. **Veritabanı bağlantı bilgilerini güncelleyin:**
`user-service/src/main/resources/application.properties` dosyasında:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/disastermanagement
spring.datasource.username=your_username
spring.datasource.password=your_password
```

4. **Projeyi derleyin:**
```bash
mvn clean install
```

5. **Servisleri başlatın:**
```bash
# Discovery Service'i başlatın
cd discovery-service
mvn spring-boot:run

# User Service'i başlatın (yeni terminal)
cd user-service
mvn spring-boot:run
```

### 🔐 User Service Detayları

#### Özellikler

- **Kullanıcı Yönetimi**: Kayıt, giriş, profil güncelleme
- **Rol Tabanlı Yetkilendirme**: VATANDAS, GONULLU, YONETICI rolleri
- **JWT Token Kimlik Doğrulama**: Güvenli API erişimi
- **PostgreSQL Veritabanı**: Liquibase ile veritabanı migrasyonu
- **Spring Security**: Güvenlik yapılandırması

#### API Endpoints

##### Kimlik Doğrulama (Auth)
```
POST /api/v1/auth/register - Kullanıcı kaydı
POST /api/v1/auth/login - Kullanıcı girişi
POST /api/v1/auth/debug/register - Debug kayıt (geliştirme)
```

##### Kullanıcı Yönetimi
```
GET  /api/v1/users/me - Kendi profil bilgileri
PATCH /api/v1/users/me - Kendi profilini güncelle
GET  /api/v1/users/{id} - Belirli kullanıcı bilgileri
PUT  /api/v1/users/{id} - Kullanıcı bilgilerini güncelle
GET  /api/v1/users - Tüm kullanıcıları listele
```

##### Admin İşlemleri
```
GET  /api/v1/admin/users - Tüm kullanıcıları yönet
POST /api/v1/admin/users/{id}/badges - Kullanıcıya rozet ver
```

##### Yetenek Yönetimi
```
GET  /api/v1/skills - Tüm yetenekleri listele
POST /api/v1/skills - Yeni yetenek ekle
```

#### Güvenlik Yapılandırması

##### Public Endpoints
- `/api/v1/auth/login`
- `/api/v1/auth/register`
- `/api/v1/auth/debug/**`

##### Yetkilendirme Gerektiren Endpoints
- `/api/v1/admin/**` - Sadece YONETICI rolü
- `/api/v1/users/me/**` - Kimlik doğrulama gerekli
- `/api/v1/users/{id}` - Kimlik doğrulama gerekli
- Diğer tüm endpoint'ler kimlik doğrulama gerektirir

#### Veritabanı Şeması

##### Ana Tablolar
- **users**: Kullanıcı bilgileri
- **skills**: Yetenekler
- **user_skills**: Kullanıcı-yetenek ilişkisi
- **badges**: Rozetler
- **user_badges**: Kullanıcı-rozet ilişkisi

##### Kullanıcı Rolleri
- **VATANDAS**: Sıradan vatandaş
- **GONULLU**: Gönüllü çalışan
- **YONETICI**: Sistem yöneticisi

### 🛠️ Teknolojiler

#### Backend
- **Spring Boot 3.5.4** - Ana framework
- **Spring Security** - Güvenlik
- **Spring Data JPA** - Veritabanı erişimi
- **Spring Cloud** - Mikroservis altyapısı
- **PostgreSQL** - Veritabanı
- **Liquibase** - Veritabanı migrasyonu
- **JWT** - Token tabanlı kimlik doğrulama
- **Lombok** - Kod tekrarını azaltma
- **Maven** - Bağımlılık yönetimi

#### Mikroservis Altyapısı
- **Eureka Server** - Servis keşfi
- **API Gateway** - Merkezi giriş noktası
- **OpenFeign** - Servisler arası iletişim

### 📁 Proje Dizin Yapısı

```
havelsan-staj-backend/
├── user-service/                 # Kullanıcı yönetimi servisi
│   ├── src/main/java/com/afet/userservice/
│   │   ├── controller/          # REST API controller'ları
│   │   ├── service/             # İş mantığı katmanı
│   │   ├── repository/          # Veri erişim katmanı
│   │   ├── entity/              # Veritabanı varlıkları
│   │   ├── dto/                 # Veri transfer nesneleri
│   │   ├── security/            # Güvenlik yapılandırması
│   │   └── config/              # Uygulama yapılandırması
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/changelog/        # Liquibase migrasyon dosyaları
│   └── pom.xml
├── api-gateway-service/          # API Gateway servisi
├── assignment-service/            # Görev atama servisi
├── websocket-service/            # WebSocket servisi
├── notification-service/          # Bildirim servisi
├── information-service/           # Bilgi servisi
├── request-service/               # Talep servisi
├── discovery-service/             # Eureka servis keşfi
└── pom.xml                       # Ana proje POM
```

### 🔧 Yapılandırma

#### Environment Variables

```properties
# Veritabanı
spring.datasource.url=jdbc:postgresql://localhost:5432/disastermanagement
spring.datasource.username=root
spring.datasource.password=root

# JWT
jwt.secret-key=your-secret-key
jwt.expiration=86400000

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka

# Port
server.port=8081
```

#### Liquibase Migrasyonları

Veritabanı şeması Liquibase ile yönetilmektedir. Yeni değişiklikler için:

1. `db/changelog/changes/` dizininde yeni XML dosyası oluşturun
2. `db.changelog-master.xml` dosyasına include ekleyin
3. Uygulamayı yeniden başlatın

### 🚀 Deployment

#### Docker ile (Önerilen)

```bash
# Docker image oluştur
mvn clean package -DskipTests
docker build -t user-service .

# Container çalıştır
docker run -p 8081:8081 user-service
```

#### Manuel Deployment

```bash
# JAR dosyası oluştur
mvn clean package -DskipTests

# Uygulamayı çalıştır
java -jar target/user-service-0.0.1-SNAPSHOT.jar
```

### 📊 Monitoring ve Logging

- **Spring Boot Actuator** - Uygulama sağlığı ve metrikler
- **Eureka Dashboard** - Servis durumu (http://localhost:8761)
- **Application Logs** - Console ve dosya logları

### 🔍 Test

```bash
# Unit testleri çalıştır
mvn test

# Integration testleri çalıştır
mvn verify

# Test coverage raporu
mvn jacoco:report
```

## Frontend Bilgileri

Bu proje, afet durumlarında vatandaşlar, gönüllüler ve yöneticiler arasında koordinasyonu sağlayan modern bir web uygulamasıdır. Angular 20 framework'ü kullanılarak geliştirilmiştir.

### 🚀 Özellikler

#### 👥 Kullanıcı Rolleri
- **Vatandaş**: Yardım talebi oluşturma, güvenli bölge bilgilerini görüntüleme
- **Gönüllü**: Yardım taleplerini kabul etme, görev atamaları, takım çalışması
- **Yönetici**: Sistem yönetimi, kullanıcı yönetimi, raporlama

#### 🗺️ Harita ve Konum Özellikleri
- Gerçek zamanlı harita entegrasyonu (Leaflet)
- Kullanıcı konum takibi
- Güvenli bölge işaretleme
- Yardım taleplerinin harita üzerinde görüntülenmesi

#### 📱 Modern Web Teknolojileri
- Angular 20 ile geliştirilmiş
- Responsive tasarım (Tailwind CSS)
- WebSocket desteği ile gerçek zamanlı iletişim
- JWT tabanlı kimlik doğrulama

### 🛠️ Teknoloji Stack'i

#### Frontend Framework
- **Angular**: 20.2.1
- **TypeScript**: 5.8.0
- **SCSS**: Stil dosyaları için

#### UI ve Stil
- **Tailwind CSS**: 3.4.17 - Modern ve responsive tasarım
- **PostCSS**: CSS işleme
- **Autoprefixer**: Tarayıcı uyumluluğu

#### Harita ve Gerçek Zamanlı İletişim
- **Leaflet**: 1.9.4 - Harita entegrasyonu
- **WebSocket**: STOMP protokolü ile gerçek zamanlı iletişim
- **SockJS**: WebSocket fallback desteği

#### Test ve Geliştirme
- **Jasmine**: Unit test framework
- **Karma**: Test runner
- **Angular CLI**: Geliştirme araçları

### 📁 Proje Yapısı

```
src/
├── app/
│   ├── core/                    # Çekirdek servisler ve modeller
│   │   ├── guards/             # Route koruma servisleri
│   │   ├── interceptors/       # HTTP interceptor'ları
│   │   ├── models/             # Veri modelleri
│   │   └── services/           # API ve iş mantığı servisleri
│   ├── features/               # Özellik modülleri
│   │   ├── admin/             # Yönetici paneli
│   │   ├── auth/              # Kimlik doğrulama
│   │   ├── dashboard/         # Ana dashboard
│   │   ├── help-requests/     # Yardım talepleri
│   │   ├── volunteer/         # Gönüllü modülü
│   │   └── user/              # Kullanıcı yönetimi
│   └── shared/                # Paylaşılan bileşenler
└── environments/               # Ortam konfigürasyonları
```

### 🚀 Kurulum ve Çalıştırma

#### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- Angular CLI

#### Kurulum Adımları

1. **Projeyi klonlayın**
   ```bash
   git clone [repository-url]
   cd disaster-management-system
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Geliştirme sunucusunu başlatın**
   ```bash
   npm start
   ```

4. **Tarayıcıda açın**
   ```
   http://localhost:4200
   ```

#### Diğer Komutlar

```bash
# Production build
npm run build

# Test çalıştırma
npm test

# Build izleme (development)
npm run watch
```

### 🔧 Konfigürasyon

#### Proxy Ayarları
`proxy.conf.json` dosyasında backend API endpoint'leri tanımlanmıştır.

#### Ortam Değişkenleri
- `src/environments/environment.ts` - Geliştirme ortamı
- `src/environments/environment.prod.ts` - Production ortamı

### 📱 Kullanım Senaryoları

#### Vatandaş Kullanımı
1. Sisteme kayıt olma
2. Yardım talebi oluşturma
3. Güvenli bölge bilgilerini görüntüleme
4. Bildirim alma

#### Gönüllü Kullanımı
1. Gönüllü olarak kayıt olma
2. Becerilerini belirtme
3. Yardım taleplerini kabul etme
4. Takım çalışması yapma

#### Yönetici Kullanımı
1. Kullanıcıları yönetme
2. Gönüllüleri koordine etme
3. Sistem raporlarını görüntüleme
4. Afet durumlarını takip etme

### 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Role-based access control (RBAC)
- Route koruma servisleri
- Güvenli HTTP interceptor'ları

### 🌐 API Entegrasyonu

- RESTful API desteği
- WebSocket ile gerçek zamanlı iletişim
- HTTP interceptor ile otomatik token yönetimi

### 📊 Test

```bash
# Unit testleri çalıştır
npm test

# Test coverage raporu
npm run test:coverage
```

### 🚀 Deployment

#### Production Build
```bash
npm run build
```

Build çıktısı `dist/` klasöründe oluşturulur.

#### Sunucu Gereksinimleri
- Node.js web sunucusu
- HTTPS desteği (production için)
- WebSocket desteği

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje özel bir proje olup, ticari kullanım için geliştirilmiştir.

## 📞 İletişim

Proje hakkında sorularınız için:
- **Geliştirici**: HAVELSAN Staj Projesi
- **Proje**: Afet Yönetim Sistemi Frontend

## 🔄 Güncellemeler

### v0.0.0
- İlk sürüm
- Temel kullanıcı rolleri
- Harita entegrasyonu
- WebSocket desteği
- JWT kimlik doğrulama

---

**Not**: Bu proje afet yönetimi alanında kullanılmak üzere tasarlanmıştır ve sürekli geliştirilmektedir.
