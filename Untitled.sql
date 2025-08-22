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
