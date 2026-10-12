-- Expense Voucher Management System
-- Production MySQL Database Schema

CREATE DATABASE IF NOT EXISTS `expense_voucher_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `expense_voucher_db`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('employee', 'director', 'accounts') NOT NULL,
  `employee_id` VARCHAR(50) DEFAULT NULL,
  `department` VARCHAR(100) DEFAULT NULL,
  `default_signature` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expense Vouchers Table
CREATE TABLE IF NOT EXISTS `vouchers` (
  `id` VARCHAR(36) NOT NULL,
  `voucher_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` VARCHAR(36) NOT NULL,
  `employee_name` VARCHAR(100) NOT NULL,
  `employee_id` VARCHAR(50) DEFAULT NULL,
  `department` VARCHAR(100) NOT NULL,
  `expense_title` VARCHAR(200) NOT NULL,
  `expense_category` VARCHAR(100) NOT NULL,
  `expense_description` TEXT DEFAULT NULL,
  `expense_date` DATE NOT NULL,
  `voucher_date` DATE NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `status` ENUM('draft', 'pending_approval', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
  `employee_signature` LONGTEXT DEFAULT NULL,
  `employee_signature_date` TIMESTAMP NULL DEFAULT NULL,
  `director_signature` LONGTEXT DEFAULT NULL,
  `approval_date` TIMESTAMP NULL DEFAULT NULL,
  `approved_by_id` VARCHAR(36) DEFAULT NULL,
  `approved_by_name` VARCHAR(100) DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,
  `payment_status` ENUM('unpaid', 'processing', 'reimbursed') NOT NULL DEFAULT 'unpaid',
  `payment_reference` VARCHAR(100) DEFAULT NULL,
  `payment_date` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_vouchers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_vouchers_status` (`status`),
  INDEX `idx_vouchers_user_id` (`user_id`),
  INDEX `idx_vouchers_department` (`department`),
  INDEX `idx_vouchers_category` (`expense_category`),
  INDEX `idx_vouchers_dates` (`expense_date`, `voucher_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Voucher Audit Logs Table
CREATE TABLE IF NOT EXISTS `voucher_audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `voucher_id` VARCHAR(36) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `actor_id` VARCHAR(36) NOT NULL,
  `actor_name` VARCHAR(100) NOT NULL,
  `actor_role` VARCHAR(50) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_audit_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE CASCADE,
  INDEX `idx_audit_voucher_id` (`voucher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
