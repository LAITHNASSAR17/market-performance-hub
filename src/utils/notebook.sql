
-- Notebook Tables Schema for Trading Journal Application

-- Note Folders Table
CREATE TABLE IF NOT EXISTS `note_folders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `userId` INT NOT NULL,
  `color` VARCHAR(20) NULL,
  `icon` VARCHAR(50) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notes Table
CREATE TABLE IF NOT EXISTS `notes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `userId` INT NOT NULL,
  `folderId` INT NOT NULL,
  `tradeId` INT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`folderId`) REFERENCES `note_folders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tradeId`) REFERENCES `trades`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tags Table (if not already created in the main schema)
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `userId` INT NULL, -- NULL for system tags
  `category` ENUM('mistake', 'setup', 'habit', 'general', 'notebook') NOT NULL DEFAULT 'notebook',
  `createdAt` DATETIME NOT NULL,
  `lastUsed` DATETIME NULL,
  UNIQUE KEY `unique_name_user` (`name`, `userId`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Note Tags Junction Table
CREATE TABLE IF NOT EXISTS `note_tags` (
  `noteId` INT NOT NULL,
  `tagId` INT NOT NULL,
  PRIMARY KEY (`noteId`, `tagId`),
  FOREIGN KEY (`noteId`) REFERENCES `notes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Note Templates Table
CREATE TABLE IF NOT EXISTS `note_templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `type` ENUM('favorite', 'recommended', 'custom') NOT NULL DEFAULT 'custom',
  `userId` INT NULL, -- NULL for system templates
  `emoji` VARCHAR(10) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NULL,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default folders
INSERT INTO `note_folders` (`name`, `userId`, `color`, `createdAt`) VALUES
  ('Trade Notes', 1, '#9c59ff', NOW()),
  ('Daily Journal', 1, '#5974ff', NOW()),
  ('Sessions Recap', 1, '#5974ff', NOW()),
  ('Quarterly Goals', 1, '#f5cb42', NOW()),
  ('Trading Plan', 1, '#e45fff', NOW()),
  ('2023 Goals + Plan', 1, '#4269ff', NOW()),
  ('Plan of Action', 1, '#2dc653', NOW()),
  ('Templates', 1, '#c5d3e8', NOW());

-- Insert sample note templates
INSERT INTO `note_templates` (`title`, `content`, `type`, `userId`, `emoji`, `createdAt`) VALUES
  ('Pre-Market & Post-Session', '# PRE-MARKET CHECKLIST ✅\n\n- [ ] Check economic calendar\n- [ ] Review overnight news\n- [ ] Identify key levels\n- [ ] Check pre-market movers\n\n# FUTURES 🔮\n\n▼ ES\n- Support:\n- Resistance:\n- Plan:\n\n▼ NQ\n- Support:\n- Resistance:\n- Plan:\n\n▼ CL\n- Support:\n- Resistance:\n- Plan:', 'recommended', NULL, NULL, NOW()),
  
  ('Intra-day Check-in', '# Intra-day Check-in 📝\n\n## Current Market Conditions\n- Market sentiment:\n- Key levels:\n- Notable events:\n\n## My Current State\n- Mental state:\n- Physical state:\n- Focus level:\n\n## Trade Performance So Far\n- Number of trades:\n- P&L:\n- Best trade:\n- Worst trade:\n\n## Adjustments Needed\n- [ ] Adjust position size\n- [ ] Tighten stops\n- [ ] Wait for better setups\n- [ ] Take a break\n', 'favorite', NULL, '📝', NOW()),
  
  ('All-In-One Daily Journal', '# Daily Trading Journal 🚀\n\n## Pre-Market\n- Market outlook:\n- Key levels to watch:\n- Economic events:\n\n## Trade Log\n| Time | Symbol | Direction | Entry | Exit | P/L | Notes |\n|------|--------|-----------|-------|------|-----|-------|\n|      |        |           |       |      |     |       |\n|      |        |           |       |      |     |       |\n\n## Post-Market Review\n- What worked:\n- What didn't work:\n- Lessons learned:\n- Tomorrow's focus:\n', 'favorite', NULL, '🚀', NOW()),
  
  ('Mindset Assessment', '# Trading Mindset Assessment 🧠\n\n## Current Mindset\n- [ ] Focused and patient\n- [ ] Impulsive and emotional\n- [ ] Fearful of missing out\n- [ ] Fearful of loss\n- [ ] Overconfident\n- [ ] Distracted\n\n## Emotional Analysis\n- Emotions driving decisions:\n- Triggers identified:\n- Response plan:\n', 'custom', NULL, '🧠', NOW()),
  
  ('Morning Game-Plan', '# Morning Game-Plan 🌞\n\n## Market Analysis\n- Overall market direction:\n- Key economic events:\n- Important news:\n\n## Watchlist\n| Symbol | Direction | Entry Zone | Stop | Target | Setup |\n|--------|-----------|------------|------|--------|-------|\n|        |           |            |      |        |       |\n|        |           |            |      |        |       |\n\n## Risk Management\n- Max loss for today:\n- Position sizing plan:\n- Mental stops:\n', 'custom', NULL, '🌞', NOW()),
  
  ('Current Strengths & Weaknesses', '# Trading Strengths & Weaknesses Analysis\n\n## Current Strengths\n1. \n2. \n3. \n\n## Current Weaknesses\n1. \n2. \n3. \n\n## Action Plan\n- To leverage strengths:\n- To address weaknesses:\n- Specific exercises:\n', 'custom', NULL, NULL, NOW()),
  
  ('Quarterly Roadmap', '# Quarterly Trading Roadmap 📈\n\n## Review of Last Quarter\n- Performance metrics:\n- Key achievements:\n- Main challenges:\n\n## Goals for This Quarter\n1. \n2. \n3. \n\n## Action Steps\n- Trading strategy refinements:\n- Skill development focus:\n- Risk management adjustments:\n\n## Metrics to Track\n- Win rate target:\n- Risk-reward target:\n- Max drawdown limit:\n', 'custom', NULL, '📈', NOW());

-- Insert sample notebook tags
INSERT INTO `tags` (`name`, `userId`, `category`, `createdAt`)
VALUES
  ('FOMC', 1, 'notebook', NOW()),
  ('Equities', 1, 'notebook', NOW()),
  ('Futures', 1, 'notebook', NOW()),
  ('ES', 1, 'notebook', NOW()),
  ('MES', 1, 'notebook', NOW()),
  ('NQ', 1, 'notebook', NOW()),
  ('CL', 1, 'notebook', NOW()),
  ('plan', 1, 'notebook', NOW()),
  ('recap', 1, 'notebook', NOW()),
  ('psychology', 1, 'notebook', NOW());
