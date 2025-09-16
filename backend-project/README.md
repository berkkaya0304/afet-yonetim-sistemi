# HAVELSAN Staj Backend Projesi

Bu proje, afet yönetim sistemi için geliştirilmiş mikroservis mimarisinde bir backend uygulamasıdır. Spring Boot ve Spring Cloud teknolojileri kullanılarak geliştirilmiştir.

## 🏗️ Proje Yapısı

Proje aşağıdaki mikroservislerden oluşmaktadır:

- **user-service** - Kullanıcı yönetimi ve kimlik doğrulama
- **api-gateway-service** - API Gateway ve yönlendirme
- **assignment-service** - Görev atama ve yönetimi
- **websocket-service** - Gerçek zamanlı iletişim
- **notification-service** - Bildirim yönetimi
- **information-service** - Bilgi yönetimi
- **request-service** - Talep yönetimi
- **discovery-service** - Servis keşfi (Eureka)

## 🚀 Başlangıç

### Gereksinimler

- Java 17
- Maven 3.6+
- PostgreSQL 12+
- Docker (opsiyonel)

### Kurulum

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

## 🔐 User Service Detayları

### Özellikler

- **Kullanıcı Yönetimi**: Kayıt, giriş, profil güncelleme
- **Rol Tabanlı Yetkilendirme**: VATANDAS, GONULLU, YONETICI rolleri
- **JWT Token Kimlik Doğrulama**: Güvenli API erişimi
- **PostgreSQL Veritabanı**: Liquibase ile veritabanı migrasyonu
- **Spring Security**: Güvenlik yapılandırması

### API Endpoints

#### Kimlik Doğrulama (Auth)
```
POST /api/v1/auth/register - Kullanıcı kaydı
POST /api/v1/auth/login - Kullanıcı girişi
POST /api/v1/auth/debug/register - Debug kayıt (geliştirme)
```

#### Kullanıcı Yönetimi
```
GET  /api/v1/users/me - Kendi profil bilgileri
PATCH /api/v1/users/me - Kendi profilini güncelle
GET  /api/v1/users/{id} - Belirli kullanıcı bilgileri
PUT  /api/v1/users/{id} - Kullanıcı bilgilerini güncelle
GET  /api/v1/users - Tüm kullanıcıları listele
```

#### Admin İşlemleri
```
GET  /api/v1/admin/users - Tüm kullanıcıları yönet
POST /api/v1/admin/users/{id}/badges - Kullanıcıya rozet ver
```

#### Yetenek Yönetimi
```
GET  /api/v1/skills - Tüm yetenekleri listele
POST /api/v1/skills - Yeni yetenek ekle
```

### Güvenlik Yapılandırması

#### Public Endpoints
- `/api/v1/auth/login`
- `/api/v1/auth/register`
- `/api/v1/auth/debug/**`

#### Yetkilendirme Gerektiren Endpoints
- `/api/v1/admin/**` - Sadece YONETICI rolü
- `/api/v1/users/me/**` - Kimlik doğrulama gerekli
- `/api/v1/users/{id}` - Kimlik doğrulama gerekli
- Diğer tüm endpoint'ler kimlik doğrulama gerektirir

### Veritabanı Şeması

#### Ana Tablolar
- **users**: Kullanıcı bilgileri
- **skills**: Yetenekler
- **user_skills**: Kullanıcı-yetenek ilişkisi
- **badges**: Rozetler
- **user_badges**: Kullanıcı-rozet ilişkisi

#### Kullanıcı Rolleri
- **VATANDAS**: Sıradan vatandaş
- **GONULLU**: Gönüllü çalışan
- **YONETICI**: Sistem yöneticisi

## 🛠️ Teknolojiler

### Backend
- **Spring Boot 3.5.4** - Ana framework
- **Spring Security** - Güvenlik
- **Spring Data JPA** - Veritabanı erişimi
- **Spring Cloud** - Mikroservis altyapısı
- **PostgreSQL** - Veritabanı
- **Liquibase** - Veritabanı migrasyonu
- **JWT** - Token tabanlı kimlik doğrulama
- **Lombok** - Kod tekrarını azaltma
- **Maven** - Bağımlılık yönetimi

### Mikroservis Altyapısı
- **Eureka Server** - Servis keşfi
- **API Gateway** - Merkezi giriş noktası
- **OpenFeign** - Servisler arası iletişim

## 📁 Proje Dizin Yapısı

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

## 🔧 Yapılandırma

### Environment Variables

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

### Liquibase Migrasyonları

Veritabanı şeması Liquibase ile yönetilmektedir. Yeni değişiklikler için:

1. `db/changelog/changes/` dizininde yeni XML dosyası oluşturun
2. `db.changelog-master.xml` dosyasına include ekleyin
3. Uygulamayı yeniden başlatın

## 🚀 Deployment

### Docker ile (Önerilen)

```bash
# Docker image oluştur
mvn clean package -DskipTests
docker build -t user-service .

# Container çalıştır
docker run -p 8081:8081 user-service
```

### Manuel Deployment

```bash
# JAR dosyası oluştur
mvn clean package -DskipTests

# Uygulamayı çalıştır
java -jar target/user-service-0.0.1-SNAPSHOT.jar
```

## 📊 Monitoring ve Logging

- **Spring Boot Actuator** - Uygulama sağlığı ve metrikler
- **Eureka Dashboard** - Servis durumu (http://localhost:8761)
- **Application Logs** - Console ve dosya logları

## 🔍 Test

```bash
# Unit testleri çalıştır
mvn test

# Integration testleri çalıştır
mvn verify

# Test coverage raporu
mvn jacoco:report
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje HAVELSAN için geliştirilmiştir.

## 📞 İletişim

- **Proje Sahibi**: HAVELSAN
- **Geliştirici**: [İsim]
- **Email**: [Email]

## 🙏 Teşekkürler

- Spring Boot ekibine
- PostgreSQL topluluğuna
- Açık kaynak topluluğuna

---

**Not**: Bu proje geliştirme aşamasındadır. Production ortamında kullanmadan önce güvenlik testlerinden geçirilmelidir.
