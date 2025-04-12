
-- Database Schema for Trading Journal Application

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `isAdmin` BOOLEAN DEFAULT FALSE,
  `isBlocked` BOOLEAN DEFAULT FALSE,
  `createdAt` DATETIME NOT NULL,
  `lastLogin` DATETIME NULL,
  `profileImage` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trades Table
CREATE TABLE IF NOT EXISTS `trades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `account` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `pair` VARCHAR(20) NOT NULL,
  `type` ENUM('Buy', 'Sell') NOT NULL,
  `entry` DECIMAL(12, 6) NOT NULL,
  `exit` DECIMAL(12, 6) NOT NULL,
  `lotSize` DECIMAL(10, 2) NOT NULL,
  `stopLoss` DECIMAL(12, 6) NULL,
  `takeProfit` DECIMAL(12, 6) NULL,
  `riskPercentage` DECIMAL(6, 2) NOT NULL,
  `returnPercentage` DECIMAL(6, 2) NOT NULL,
  `profitLoss` DECIMAL(10, 2) NOT NULL,
  `durationMinutes` INT NOT NULL,
  `notes` TEXT NULL,
  `imageUrl` VARCHAR(255) NULL,
  `beforeImageUrl` VARCHAR(255) NULL,
  `afterImageUrl` VARCHAR(255) NULL,
  `instrumentType` ENUM('forex', 'crypto', 'stock', 'index', 'commodity', 'other') NOT NULL DEFAULT 'forex',
  `commission` DECIMAL(8, 2) NULL,
  `createdAt` DATETIME NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tags Table
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `userId` INT NULL, -- NULL for system tags
  `category` ENUM('mistake', 'setup', 'habit', 'general') NOT NULL DEFAULT 'general',
  `count` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `lastUsed` DATETIME NULL,
  UNIQUE KEY `unique_name_user` (`name`, `userId`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trade Tags (Junction table for many-to-many relationship)
CREATE TABLE IF NOT EXISTS `trade_tags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tradeId` INT NOT NULL,
  `tagId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  UNIQUE KEY `unique_trade_tag` (`tradeId`, `tagId`),
  FOREIGN KEY (`tradeId`) REFERENCES `trades`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reports Table
CREATE TABLE IF NOT EXISTS `reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('daily', 'weekly', 'monthly', 'custom') NOT NULL,
  `config` JSON NOT NULL, -- Storing report configuration as JSON
  `createdAt` DATETIME NOT NULL,
  `lastRun` DATETIME NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE KEY `unique_user_setting` (`userId`, `key`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- System Settings Table (for admin only)
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT NOT NULL,
  `description` TEXT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Playbooks Table
CREATE TABLE IF NOT EXISTS `playbooks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `content` TEXT NOT NULL,
  `imageUrl` VARCHAR(255) NULL,
  `isPublic` BOOLEAN DEFAULT FALSE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notes Table
CREATE TABLE IF NOT EXISTS `notes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `content` TEXT NOT NULL,
  `tags` JSON NULL, -- Store tags as JSON array
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Calendar Events Table
CREATE TABLE IF NOT EXISTS `calendar_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `startDate` DATETIME NOT NULL,
  `endDate` DATETIME NULL,
  `allDay` BOOLEAN DEFAULT FALSE,
  `category` VARCHAR(50) NULL,
  `color` VARCHAR(20) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Translations Table (for dynamic translations)
CREATE TABLE IF NOT EXISTS `translations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `locale` VARCHAR(10) NOT NULL,
  `key` VARCHAR(255) NOT NULL,
  `value` TEXT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE KEY `unique_locale_key` (`locale`, `key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default system settings
INSERT INTO `system_settings` (`key`, `value`, `description`, `createdAt`, `updatedAt`)
VALUES
  ('default_theme', 'light', 'Default theme for new users', NOW(), NOW()),
  ('default_language', 'en', 'Default language for new users', NOW(), NOW()),
  ('enable_registration', 'true', 'Whether new user registration is enabled', NOW(), NOW()),
  ('max_upload_size', '5', 'Maximum file upload size in MB', NOW(), NOW()),
  ('allowed_file_types', 'jpg,jpeg,png,gif', 'Allowed file types for uploads', NOW(), NOW());

-- Insert default tags
INSERT INTO `tags` (`name`, `userId`, `category`, `count`, `createdAt`, `lastUsed`)
VALUES
  ('momentum', NULL, 'setup', 0, NOW(), NULL),
  ('breakout', NULL, 'setup', 0, NOW(), NULL),
  ('retracement', NULL, 'setup', 0, NOW(), NULL),
  ('support', NULL, 'setup', 0, NOW(), NULL),
  ('resistance', NULL, 'setup', 0, NOW(), NULL),
  ('trend-following', NULL, 'setup', 0, NOW(), NULL),
  ('reversal', NULL, 'setup', 0, NOW(), NULL),
  ('range-bound', NULL, 'setup', 0, NOW(), NULL),
  ('gap', NULL, 'setup', 0, NOW(), NULL),
  ('fakeout', NULL, 'mistake', 0, NOW(), NULL),
  ('overtrading', NULL, 'mistake', 0, NOW(), NULL),
  ('revenge-trading', NULL, 'mistake', 0, NOW(), NULL),
  ('fomo', NULL, 'mistake', 0, NOW(), NULL),
  ('no-plan', NULL, 'mistake', 0, NOW(), NULL),
  ('moving-stop', NULL, 'mistake', 0, NOW(), NULL),
  ('patience', NULL, 'habit', 0, NOW(), NULL),
  ('discipline', NULL, 'habit', 0, NOW(), NULL),
  ('journaling', NULL, 'habit', 0, NOW(), NULL),
  ('risk-management', NULL, 'habit', 0, NOW(), NULL),
  ('consistency', NULL, 'habit', 0, NOW(), NULL);
