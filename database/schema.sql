-- BAMS: Boarding & Accommodation Management System
-- Database schema — run this once in phpMyAdmin (or via `mysql < schema.sql`)
-- to create the database and all tables.
--
-- Safe to re-run: it drops any existing "bams" database first, so if
-- something goes wrong you can just run this again for a clean slate.

DROP DATABASE IF EXISTS bams;
CREATE DATABASE bams CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bams;

-- ---------------------------------------------------------------------
-- Users: students, boarding providers, and admins all live in one table,
-- distinguished by `role`. This mirrors the "Register / Login" use case
-- shared by all three actors.
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,     -- hashed with PHP's password_hash()
  role ENUM('student', 'provider', 'admin') NOT NULL,
  status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Listings: created by providers, verified by admins before students
-- can see them. Matches "Manage accommodation listings" / "Verify
-- listings" / "Search accommodation" use cases.
-- ---------------------------------------------------------------------
CREATE TABLE listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  provider_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  location VARCHAR(150) NOT NULL,
  distance_km DECIMAL(4,1) DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  type ENUM('Annex', 'Boarding House', 'Apartment', 'Hostel') NOT NULL,
  occupancy VARCHAR(50) NOT NULL,
  description TEXT,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  hue SMALLINT DEFAULT 168,           -- just drives the card's colour swatch
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Amenities: a fixed lookup list (WiFi, Water, Furnished, etc.), linked
-- to listings via a join table since one listing can have many
-- amenities and one amenity applies to many listings.
-- ---------------------------------------------------------------------
CREATE TABLE amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE listing_amenities (
  listing_id INT NOT NULL,
  amenity_id INT NOT NULL,
  PRIMARY KEY (listing_id, amenity_id),
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Inquiries: a student contacts a provider about a listing; the
-- provider can reply once. Matches "Contact boarding provider" and the
-- reply step in the sequence diagram.
-- ---------------------------------------------------------------------
CREATE TABLE inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  student_id INT NULL,                -- NULL allowed for guest inquiries
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  reply_message TEXT NULL,
  reply_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Activity log: powers the admin's "Monitor system activity" screen.
-- ---------------------------------------------------------------------
CREATE TABLE activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  detail VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Seed data: fixed amenity list + one admin account so the admin panel
-- is usable immediately.
-- Admin login: admin@bams.lk / admin123
-- ---------------------------------------------------------------------
INSERT INTO amenities (name) VALUES
  ('WiFi'), ('Water'), ('Furnished'), ('Kitchen access'),
  ('Parking'), ('Electricity included'), ('Study table');

-- password hash below = "admin123" hashed with PHP's password_hash()
INSERT INTO users (name, email, password, role, status) VALUES
  ('System Admin', 'admin@bams.lk', '$2y$10$L.uMeRbQYWOnP1VOWnoQyOOvJtuTtFBLtz7dTZNMFGVFUGMskpEMO', 'admin', 'active');