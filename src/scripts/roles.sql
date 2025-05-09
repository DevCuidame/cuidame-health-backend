-- Script para crear roles básicos en la base de datos

-- Verificar si existe la tabla role
CREATE TABLE IF NOT EXISTS role (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  status BOOLEAN NOT NULL DEFAULT TRUE
);

-- Insertar rol de usuario si no existe
INSERT INTO role (name, status)
SELECT 'User', TRUE
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'User');

-- Insertar rol de administrador si no existe
INSERT INTO role (name, status)
SELECT 'Agent', TRUE
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'Agent');

-- Insertar rol de profesional de salud si no existe
INSERT INTO role (name, status)
SELECT 'admin', TRUE
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'admin');