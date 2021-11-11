-- --------------------------------------------------------
-- 호스트:                          localhost
-- 서버 버전:                        5.7.32 - MySQL Community Server (GPL)
-- 서버 OS:                        Linux
-- HeidiSQL 버전:                  11.1.0.6116
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- expc4ei 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `expc4ei` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;
USE `expc4ei`;

-- 테이블 expc4ei.address 구조 내보내기
CREATE TABLE IF NOT EXISTS `address` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `address` varchar(63) COLLATE utf8_unicode_ci NOT NULL,
  `inputcount` bigint(20) DEFAULT '0',
  `outputcount` bigint(20) DEFAULT '0',
  `cur_bal` varchar(37) COLLATE utf8_unicode_ci DEFAULT '0',
  `regdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_reg` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_id` int(11) NOT NULL DEFAULT '0',
  `useYN` char(1) COLLATE utf8_unicode_ci DEFAULT 'Y' COMMENT '사용자에게 나눠줘도 되는 계정인지 (최초50개는 안됨)',
  `privateKey` varchar(69) COLLATE utf8_unicode_ci DEFAULT NULL,
  `mappingYN` char(1) COLLATE utf8_unicode_ci DEFAULT 'N' COMMENT '사용자에게 할당되면 Y',
  PRIMARY KEY (`address`),
  UNIQUE KEY `address` (`address`),
  KEY `idx` (`idx`)
) ENGINE=InnoDB AUTO_INCREMENT=1053 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 expc4ei.block 구조 내보내기
CREATE TABLE IF NOT EXISTS `block` (
  `id` bigint(20) NOT NULL,
  `blockhash` varchar(67) COLLATE utf8_unicode_ci NOT NULL,
  `miner` varchar(43) COLLATE utf8_unicode_ci DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `size` bigint(20) DEFAULT NULL,
  `transactions` varchar(4000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `number` bigint(20) DEFAULT NULL,
  `uncle_hash` varchar(67) COLLATE utf8_unicode_ci DEFAULT NULL,
  `data` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `gasused` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`blockhash`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 expc4ei.sendlog 구조 내보내기
CREATE TABLE IF NOT EXISTS `sendlog` (
  `tidx` bigint(20) NOT NULL AUTO_INCREMENT,
  `userIdx` bigint(20) DEFAULT NULL,
  `fromAddr` varchar(67) COLLATE utf8_unicode_ci NOT NULL,
  `fromAmt` varchar(37) COLLATE utf8_unicode_ci NOT NULL,
  `toAddr` varchar(67) COLLATE utf8_unicode_ci NOT NULL,
  `toAmt` varchar(37) COLLATE utf8_unicode_ci DEFAULT NULL,
  `sendAmt` varchar(37) COLLATE utf8_unicode_ci NOT NULL,
  `successYN` char(1) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'N',
  `regdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `regip` varchar(15) COLLATE utf8_unicode_ci DEFAULT '',
  `blockNumber` bigint(20) DEFAULT '0',
  `contractAddress` varchar(67) COLLATE utf8_unicode_ci DEFAULT NULL,
  `blockHash` varchar(67) COLLATE utf8_unicode_ci DEFAULT NULL,
  `transactionHash` varchar(67) COLLATE utf8_unicode_ci DEFAULT NULL,
  `last_reg` datetime DEFAULT NULL,
  PRIMARY KEY (`tidx`) USING BTREE,
  KEY `idxAddr` (`fromAddr`,`toAddr`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 expc4ei.transaction 구조 내보내기
CREATE TABLE IF NOT EXISTS `transaction` (
  `txid` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `value` decimal(38,0) DEFAULT NULL,
  `gas` bigint(20) DEFAULT NULL,
  `gasprice` bigint(20) DEFAULT NULL,
  `nonce` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `txdata` varchar(1500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `block_id` bigint(20) DEFAULT NULL,
  `sender` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `receiver` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 expc4ei.user 구조 내보내기
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(25) COLLATE utf8_unicode_ci NOT NULL,
  `password` char(60) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `role` enum('Admin','SuperUser','User') COLLATE utf8_unicode_ci DEFAULT 'User',
  `loginCnt` bigint(20) NOT NULL DEFAULT '0' COMMENT 'loginCntPerDay+1',
  `c4ei_addr` varchar(63) COLLATE utf8_unicode_ci DEFAULT NULL,
  `c4ei_balance` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  `c4ei_block_bal` varchar(40) COLLATE utf8_unicode_ci DEFAULT '0',
  `regip` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `regdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_reg` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_ip` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `username` (`username`) USING BTREE,
  UNIQUE KEY `email` (`email`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;