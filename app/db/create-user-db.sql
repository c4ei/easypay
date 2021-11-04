-- DROP DATABASE IF EXISTS test_db;   
-- CREATE DATABASE IF NOT EXISTS test_db;   
USE test_db; 

-- DROP TABLE IF EXISTS user; 

-- CREATE TABLE IF NOT EXISTS user 
--   ( 
--      id         INT PRIMARY KEY auto_increment, 
--      username   VARCHAR(25) UNIQUE NOT NULL, 
--      password   CHAR(60) NOT NULL, 
--    --   first_name VARCHAR(50) NOT NULL, 
--    --   last_name  VARCHAR(50) NOT NULL, 
--      email      VARCHAR(100) UNIQUE NOT NULL, 
--      role       ENUM('Admin', 'SuperUser', 'User') DEFAULT 'User', 
--      age        INT(11) DEFAULT 0 
--   ); 
  
  CREATE TABLE `user` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`username` VARCHAR(25) NOT NULL COLLATE 'utf8_unicode_ci',
	`password` CHAR(60) NOT NULL COLLATE 'utf8_unicode_ci',
	`email` VARCHAR(100) NOT NULL COLLATE 'utf8_unicode_ci',
	`role` ENUM('Admin','SuperUser','User') NULL DEFAULT 'User' COLLATE 'utf8_unicode_ci',
	`loginCnt` BIGINT(20) NOT NULL DEFAULT '0' COMMENT 'loginCntPerDay+1',
	`c4ei_addr` VARCHAR(63) NULL COLLATE 'utf8_unicode_ci',
	`c4ei_balance` DECIMAL(18,18) NULL DEFAULT '0.000000000000000000',
	`regip` VARCHAR(30) NULL COLLATE 'utf8_unicode_ci',
	`regdate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_reg` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_ip` VARCHAR(30) NULL COLLATE 'utf8_unicode_ci',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `username` (`username`) USING BTREE,
	UNIQUE INDEX `email` (`email`) USING BTREE
)
COLLATE='utf8_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=4
;
