-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: sistema_avaliacao_docente
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alocacoes`
--

DROP TABLE IF EXISTS `alocacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alocacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `avaliacao_id` int NOT NULL,
  `turma` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `avaliacao_id` (`avaliacao_id`),
  CONSTRAINT `alocacoes_ibfk_1` FOREIGN KEY (`avaliacao_id`) REFERENCES `avaliacoes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alocacoes`
--

LOCK TABLES `alocacoes` WRITE;
/*!40000 ALTER TABLE `alocacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `alocacoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avaliacoes`
--

DROP TABLE IF EXISTS `avaliacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avaliacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `criado_por` int DEFAULT NULL,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `criado_por` (`criado_por`),
  CONSTRAINT `avaliacoes_ibfk_1` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avaliacoes`
--

LOCK TABLES `avaliacoes` WRITE;
/*!40000 ALTER TABLE `avaliacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `avaliacoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opcoes_questao`
--

DROP TABLE IF EXISTS `opcoes_questao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `opcoes_questao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `questao_id` int NOT NULL,
  `texto_opcao` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `questao_id` (`questao_id`),
  CONSTRAINT `opcoes_questao_ibfk_1` FOREIGN KEY (`questao_id`) REFERENCES `questoes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opcoes_questao`
--

LOCK TABLES `opcoes_questao` WRITE;
/*!40000 ALTER TABLE `opcoes_questao` DISABLE KEYS */;
/*!40000 ALTER TABLE `opcoes_questao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questoes`
--

DROP TABLE IF EXISTS `questoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `avaliacao_id` int NOT NULL,
  `texto` text NOT NULL,
  `tipo` enum('MULTIPLA_ESCOLHA','CAIXAS_SELECAO','ESCALA','TEXTO_CURTO','PARAGRAFO') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `avaliacao_id` (`avaliacao_id`),
  CONSTRAINT `questoes_ibfk_1` FOREIGN KEY (`avaliacao_id`) REFERENCES `avaliacoes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questoes`
--

LOCK TABLES `questoes` WRITE;
/*!40000 ALTER TABLE `questoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `questoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `respostas`
--

DROP TABLE IF EXISTS `respostas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `respostas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `avaliacao_id` int NOT NULL,
  `questao_id` int NOT NULL,
  `texto_resposta` text,
  `opcao_id` int DEFAULT NULL,
  `data_resposta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `aluno_id` (`aluno_id`),
  KEY `avaliacao_id` (`avaliacao_id`),
  KEY `questao_id` (`questao_id`),
  KEY `opcao_id` (`opcao_id`),
  CONSTRAINT `respostas_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `respostas_ibfk_2` FOREIGN KEY (`avaliacao_id`) REFERENCES `avaliacoes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `respostas_ibfk_3` FOREIGN KEY (`questao_id`) REFERENCES `questoes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `respostas_ibfk_4` FOREIGN KEY (`opcao_id`) REFERENCES `opcoes_questao` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `respostas`
--

LOCK TABLES `respostas` WRITE;
/*!40000 ALTER TABLE `respostas` DISABLE KEYS */;
/*!40000 ALTER TABLE `respostas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo` enum('ADMIN','DOCENTE','ALUNO') NOT NULL,
  `matricula` varchar(20) DEFAULT NULL,
  `siape` varchar(20) DEFAULT NULL,
  `curso` varchar(100) DEFAULT NULL,
  `turma` varchar(50) DEFAULT NULL,
  `precisa_trocar_senha` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (4,'Administrador','admin@ifnmg.edu.br','$2b$10$i01VGd7n.iT5THFSNPKkE.zImY9BhNledjT2P8IEmX8L6D/oUEhPe','ADMIN',NULL,NULL,NULL,NULL,0,'2025-06-27 00:31:00'),(32,'Capa celular','capa@gmail.com','$2b$10$XZLNMIWLyQhVEkEDRLcIf.WkSDwLJtUKcGFr1h3YUDvbFneLOawlW','DOCENTE',NULL,'777777',NULL,NULL,1,'2025-06-28 19:11:17'),(33,'JOÃO','joao@ifnmg.edu.br','$2b$10$B1/uF.Kale6fytHTVWzfVeEoCSvQYbajVrPdSL34/W.WWjgJeuEPG','ALUNO','jhjhljh',NULL,'Informática','0125',1,'2025-06-29 19:02:43'),(34,'Ana Beatriz','ana.beatriz@ifnmg.edu.br','$2b$10$XbEfwKWK5R9CsT3urtF7QOdTcPgDcMcABUGGt7NI5mYVXAmLWHpai','ALUNO','20231234',NULL,'Informática','A',1,'2025-06-29 21:20:16'),(35,'Carlos Silva','carlos.silva@ifnmg.edu.br','$2b$10$8FuzwHj/YF.Qtt.N4BL6SOZNi/Te//kHkyuNzU6yavGICGA5Zddfa','ALUNO','20239876',NULL,'Agropecuária','B',1,'2025-06-29 21:20:16'),(36,'João Pedro','joao.pedro@ifnmg.edu.br','$2b$10$Emfmc/1js41blO7O9mbBJ.oYgNpuB3Bp74qRbLCRWhpAdx3wIebgy','ALUNO','20235678',NULL,'Edificações','C',1,'2025-06-29 21:20:16'),(37,'deeee','deee@aluno.ifnmg.edu.br','$2b$10$iq7/U.dQrZmipFXGfi1yDeHlCy6PkKijmQ2WTC6eyKiXrnTWRzHTK','ALUNO','114545445',NULL,'Técnico em Informática','0125',1,'2025-06-29 21:55:47'),(39,'João Silva','joao.silva@escola.edu','$2b$10$LgEO.XgnWE4xZprnTLn7C.CCsnfy1SSR7yB4TbquMeEkDUnLI1hgq','DOCENTE',NULL,'1925806',NULL,NULL,1,'2025-06-29 21:57:01'),(40,'pedro','pedro@ifnmg.edu.br','$2b$10$G4ppk8GrYr757XtuQKt5pOGkyJFtsPG9vuPQFq/y7puisBkkNuNV.','ALUNO','115599',NULL,'Técnico em Zootecnia','0125',1,'2025-06-29 22:16:28');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-29 19:48:34
