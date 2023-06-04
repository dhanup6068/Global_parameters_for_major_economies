-- MySQL dump 10.13  Distrib 8.0.27, for macos11 (arm64)
--
-- Host: localhost    Database: edfs75
-- ------------------------------------------------------
-- Server version	8.0.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `FileData`
--

DROP TABLE IF EXISTS `FileData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FileData` (
  `blockId` int NOT NULL AUTO_INCREMENT,
  `inode` int NOT NULL,
  `data` json NOT NULL,
  `partitionValue` varchar(100) NOT NULL,
  PRIMARY KEY (`blockId`)
) ENGINE=InnoDB AUTO_INCREMENT=5205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `FileExtensions`
--

DROP TABLE IF EXISTS `FileExtensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FileExtensions` (
  `inode` int NOT NULL,
  `extension` varchar(10) NOT NULL DEFAULT 'json',
  PRIMARY KEY (`inode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `FileMetaData`
--

DROP TABLE IF EXISTS `FileMetaData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FileMetaData` (
  `inode` int NOT NULL AUTO_INCREMENT COMMENT 'inode for the file',
  `parentInode` int NOT NULL COMMENT 'inode for the parent directory',
  `name` varchar(255) NOT NULL COMMENT 'name of the file',
  `type` tinyint NOT NULL DEFAULT '0' COMMENT 'type of the file (0: directory, 1: file)',
  `size` int DEFAULT '0' COMMENT 'size of the file/dir',
  `createdTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'time when the file/dir was created',
  `mtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'last modified time',
  `ctime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'last changed time',
  `atime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'last accessed time',
  `permission` smallint DEFAULT '700' COMMENT 'permission for the file/dir',
  `path` varchar(200) DEFAULT '/1/',
  `partitionedOn` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`inode`),
  UNIQUE KEY `parentInode` (`parentInode`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=305 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-11-22  4:31:45
