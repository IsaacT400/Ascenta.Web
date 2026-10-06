-- Additive account verification and traveler contact data; existing accounts remain usable.
ALTER TABLE `users`
  ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE `email_verification_tokens` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `consumed_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `email_verification_tokens_user_id_key` (`user_id`),
  UNIQUE INDEX `email_verification_tokens_token_hash_key` (`token_hash`),
  INDEX `email_verification_tokens_expires_at_idx` (`expires_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `email_verification_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `reservations`
  MODIFY COLUMN `destination_address` VARCHAR(300) NULL,
  ADD COLUMN `passenger_name` VARCHAR(160) NULL,
  ADD COLUMN `passenger_email` VARCHAR(254) NULL,
  ADD COLUMN `passenger_phone` VARCHAR(32) NULL,
  ADD COLUMN `duration_hours` DECIMAL(8,2) NULL,
  ADD COLUMN `request_hash` CHAR(64) NOT NULL DEFAULT '';

ALTER TABLE `reservations` ALTER COLUMN `request_hash` DROP DEFAULT;
