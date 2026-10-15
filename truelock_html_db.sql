-- =====================================================================
-- Base de datos: truelock_html_db (MySQL 8)
-- Proyecto: TrueLock - Control Parental
-- =====================================================================

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS truelock_html_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 
USE truelock_html_db;
 
 
CREATE TABLE roles (
    role_id            BIGINT NOT NULL AUTO_INCREMENT,
    role_code          VARCHAR(30) NOT NULL,
    role_name          ENUM('DIRECTOR', 'ADMINISTRATOR', 'PARTICIPANT') NOT NULL,
    role_description   TEXT NOT NULL,
    role_created_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    role_created_by    BIGINT DEFAULT NULL,
    role_update_at     DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) NULL,
    role_updated_by    BIGINT DEFAULT NULL,
    PRIMARY KEY (role_id),
    UNIQUE KEY role_code_UNIQUE (role_code),
    UNIQUE KEY role_name_UNIQUE (role_name)
) ENGINE=InnoDB;
 
 
-- =====================================================================
-- USUARIOS Y ACCESO
-- =====================================================================
 
-- ---------------------------------------------------------------------
-- Datos personales del formulario "Crear Cuenta"
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id                  BIGINT NOT NULL AUTO_INCREMENT,
    role_id                  BIGINT NOT NULL,
    user_names               VARCHAR(100) NOT NULL,
    user_last_names          VARCHAR(100) NOT NULL,
    user_birth_date          DATE NOT NULL,
    user_sex                 ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NOT NULL,
    user_gender              ENUM('MAN', 'WOMAN', 'OTHER', 'PREFER_NOT_TO_SAY') NOT NULL,
    user_document_type       ENUM('P.P', 'C.C', 'P.P.T', 'T.I', 'OTHER') NOT NULL,
    user_document_number     VARCHAR(40) NOT NULL,
    user_country_code        VARCHAR(6) NOT NULL DEFAULT '+57',
    user_phone_number        VARCHAR(20) NOT NULL,
    user_email               VARCHAR(100) NOT NULL,
    user_status              ENUM('ACTIVE', 'INACTIVE', 'PENDING') NOT NULL DEFAULT 'PENDING',
    user_created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    user_created_by          BIGINT DEFAULT NULL,
    user_update_at           DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) NULL,
    user_updated_by          BIGINT DEFAULT NULL,
    user_username            VARCHAR(40) NOT NULL,
    user_password_hash       VARCHAR(255) NOT NULL,
	user_password_changed_at DATETIME(6) DEFAULT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY user_email_UNIQUE (user_email),
    UNIQUE KEY user_document_UNIQUE (user_document_type, user_document_number),
    UNIQUE KEY user_username_UNIQUE (user_username),
    KEY fk_users_role_idx (role_id),
    CONSTRAINT fk_users_role_id
    FOREIGN KEY (role_id)
    REFERENCES roles (role_id)
) ENGINE=InnoDB;
 
-- ---------------------------------------------------------------------
-- Credenciales de acceso
-- ---------------------------------------------------------------------
 
CREATE TABLE IF NOT EXISTS permissions (
    perm_id                 BIGINT NOT NULL AUTO_INCREMENT,
    perm_name               VARCHAR(30) NOT NULL,
    perm_code               VARCHAR(30) NOT NULL,
    perm_created_at         DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    perm_created_by         BIGINT DEFAULT NULL,
    perm_update_at          DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) NULL,
    perm_update_by          BIGINT DEFAULT NULL,
    PRIMARY KEY (perm_id),
    UNIQUE KEY perm_name_UNIQUE (perm_name)
) ENGINE=InnoDB;
 
 
CREATE TABLE accesses (
    acce_id                     BIGINT NOT NULL AUTO_INCREMENT,
    acce_description            TEXT NOT NULL,
    acce_failed_attempts        INT NOT NULL DEFAULT 0,
    acce_locked_until           DATETIME(6) DEFAULT NULL,
    acce_last_login_at          DATETIME(6) DEFAULT NULL,
    acce_created_at             DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    acce_created_by             BIGINT DEFAULT NULL,
    acce_update_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) NULL,
    acce_updated_by             BIGINT DEFAULT NULL,
    user_id                     BIGINT NOT NULL,
    perm_id                     BIGINT NOT NULL,
    PRIMARY KEY (acce_id),
    CONSTRAINT fk_accesses_user_id
    FOREIGN KEY (user_id)
    REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_accesses_perm_id
    FOREIGN KEY (perm_id)
    REFERENCES permissions (perm_id) ON DELETE CASCADE
) ENGINE=InnoDB;
 
 
CREATE TABLE IF NOT EXISTS roles_permissions (
    rope_id              BIGINT NOT NULL AUTO_INCREMENT,
    perm_id              BIGINT NOT NULL,
    role_id              BIGINT NOT NULL,
    PRIMARY KEY (rope_id),
    CONSTRAINT fk_role_permissions_perm_id
    FOREIGN KEY (perm_id)
    REFERENCES permissions (perm_id) ON DELETE CASCADE,
    CONSTRAINT fk_permissions_role_id
    FOREIGN KEY (role_id)
    REFERENCES roles (role_id) ON DELETE CASCADE
) ENGINE=InnoDB;
 
 
-- =====================================================================
-- VERIFICAR CUENTA (verificacion.js)
-- Guarda el código de 4 dígitos enviado por correo o SMS
-- =====================================================================
CREATE TABLE verification_codes (
    veri_id             BIGINT NOT NULL AUTO_INCREMENT,
    user_id             BIGINT NOT NULL,
    veri_channel        ENUM('EMAIL', 'PHONE') NOT NULL,
    veri_purpose        ENUM('REGISTER', 'PASSWORD_RESET') NOT NULL DEFAULT 'REGISTER',
    veri_destination    VARCHAR(100) NOT NULL,
    veri_code           CHAR(4) NOT NULL,
    veri_attempts       INT NOT NULL DEFAULT 0,
    veri_expires_at     DATETIME(6) NOT NULL,
    veri_verified_at    DATETIME(6) NULL,
    veri_created_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (veri_id),
    KEY idx_verification_lookup (user_id, veri_purpose, veri_expires_at),
    CONSTRAINT fk_verification_user_id
    FOREIGN KEY (user_id)
    REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
 
 
-- =====================================================================
-- SESIONES
-- Se guarda el HASH SHA-256 del token, nunca el token en claro.
-- =====================================================================
CREATE TABLE sessions (
    sess_id             BIGINT NOT NULL AUTO_INCREMENT,
    sess_token_hash     CHAR(64) NOT NULL,
    sess_ip             VARCHAR(45) NULL,
    sess_user_agent     VARCHAR(255) NULL,
    sess_expires_at     DATETIME(6) NOT NULL,
    sess_revoked_at     DATETIME(6) NULL,
    sess_created_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
	user_id             BIGINT NOT NULL,
    PRIMARY KEY (sess_id),
    UNIQUE KEY sess_token_UNIQUE (sess_token_hash),
    KEY sessions_user_id (user_id),
    CONSTRAINT fk_sessions_user_id
    FOREIGN KEY (user_id)
    REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
 

-- =====================================================================
-- INSERTS de prueba para truelock_html_db (esquema v3)
-- Contraseña de TODOS los usuarios:  Test1234*   (bcrypt $2b$10)
--
-- Cambios respecto a la versión anterior:
-- - user_username / user_password_hash / user_password_changed_at
--   ahora viven en `users` (antes estaban en `accesses`).
-- - `accesses` ya NO tiene username, password ni status: solo guarda
--   intentos fallidos, bloqueo, último login, descripción y permiso.
-- =====================================================================
USE truelock_html_db;

-- ---------------------------------------------------------------------
-- roles
-- ---------------------------------------------------------------------
INSERT INTO roles (role_code, role_name, role_description) VALUES
('ROL-001', 'DIRECTOR',      'Propietario de la cuenta familiar. Control total.'),
('ROL-002', 'ADMINISTRATOR', 'Gestiona usuarios, dispositivos y reglas.'),
('ROL-003', 'PARTICIPANT',   'Miembro supervisado. Solo consulta.');

-- ---------------------------------------------------------------------
-- permissions
-- ---------------------------------------------------------------------
INSERT INTO permissions (perm_name, perm_code) VALUES
('Ver usuarios',           'USER_READ'),
('Crear usuarios',         'USER_CREATE'),
('Editar usuarios',        'USER_UPDATE'),
('Eliminar usuarios',      'USER_DELETE'),
('Gestionar roles',        'ROLE_MANAGE'),
('Controlar dispositivos', 'DEVICE_CONTROL'),
('Ver reportes',           'REPORT_VIEW'),
('Editar configuración',   'SETTINGS_EDIT');

-- ---------------------------------------------------------------------
-- roles_permissions
-- DIRECTOR: todos | ADMINISTRATOR: todos menos ROLE_MANAGE | PARTICIPANT: USER_READ y REPORT_VIEW
-- ---------------------------------------------------------------------
INSERT INTO roles_permissions (perm_id, role_id)
SELECT p.perm_id, r.role_id
FROM roles r
JOIN permissions p
  ON  r.role_name = 'DIRECTOR'
  OR (r.role_name = 'ADMINISTRATOR' AND p.perm_code <> 'ROLE_MANAGE')
  OR (r.role_name = 'PARTICIPANT'   AND p.perm_code IN ('USER_READ', 'REPORT_VIEW'));

-- ---------------------------------------------------------------------
-- users
-- Ahora incluye login: user_username, user_password_hash, user_password_changed_at
-- sofia = PENDING (probar verificación) | mateo = ACTIVE con accesses bloqueado
-- ---------------------------------------------------------------------
INSERT INTO users
(role_id, user_names, user_last_names, user_birth_date, user_sex, user_gender,
 user_document_type, user_document_number, user_country_code, user_phone_number,
 user_email, user_status, user_username, user_password_hash, user_password_changed_at)
VALUES
((SELECT role_id FROM roles WHERE role_code = 'ROL-001'),
 'Carlos Andrés', 'Ramírez Gómez', '1985-03-14', 'MALE', 'MAN',
 'C.C', '1098123456', '+57', '3001112233', 'director@truelock.test', 'ACTIVE',
 'director', '$2b$10$8UinpDgHlBhOyj/g87WGL.GvZOuJVh81NPBgdmDwojMyojni9teIK', NOW(6)),
((SELECT role_id FROM roles WHERE role_code = 'ROL-002'),
 'Laura Marcela', 'Pérez Díaz', '1990-07-22', 'FEMALE', 'WOMAN',
 'C.C', '1098765432', '+57', '3102223344', 'admin@truelock.test', 'ACTIVE',
 'admin', '$2b$10$8UinpDgHlBhOyj/g87WGL.GvZOuJVh81NPBgdmDwojMyojni9teIK', NOW(6)),
((SELECT role_id FROM roles WHERE role_code = 'ROL-003'),
 'Sofía', 'Ramírez Pérez', '2012-11-05', 'FEMALE', 'WOMAN',
 'T.I', '1122334455', '+57', '3203334455', 'sofia@truelock.test', 'PENDING',
 'sofia', '$2b$10$8UinpDgHlBhOyj/g87WGL.GvZOuJVh81NPBgdmDwojMyojni9teIK', NOW(6)),
((SELECT role_id FROM roles WHERE role_code = 'ROL-003'),
 'Mateo', 'Ramírez Pérez', '2010-01-30', 'MALE', 'MAN',
 'T.I', '1199887766', '+57', '3154445566', 'mateo@truelock.test', 'ACTIVE',
 'mateo', '$2b$10$8UinpDgHlBhOyj/g87WGL.GvZOuJVh81NPBgdmDwojMyojni9teIK', NOW(6));

-- ---------------------------------------------------------------------
-- accesses
-- Ya sin username/password/status: solo seguridad (intentos, bloqueo)
-- y el permiso "principal" (director = ROLE_MANAGE)
-- ---------------------------------------------------------------------
INSERT INTO accesses
(acce_description, acce_failed_attempts, acce_locked_until, acce_last_login_at, user_id, perm_id)
VALUES
('Acceso del director de la cuenta familiar', 0, NULL, NOW(6),
 (SELECT user_id FROM users WHERE user_email = 'director@truelock.test'),
 (SELECT perm_id FROM permissions WHERE perm_code = 'ROLE_MANAGE')),
('Acceso del administrador', 0, NULL, NOW(6),
 (SELECT user_id FROM users WHERE user_email = 'admin@truelock.test'),
 (SELECT perm_id FROM permissions WHERE perm_code = 'USER_CREATE')),
('Acceso de participante (pendiente de verificar)', 0, NULL, NULL,
 (SELECT user_id FROM users WHERE user_email = 'sofia@truelock.test'),
 (SELECT perm_id FROM permissions WHERE perm_code = 'REPORT_VIEW')),
('Acceso de participante bloqueado por intentos fallidos', 5, DATE_ADD(NOW(6), INTERVAL 15 MINUTE), NOW(6),
 (SELECT user_id FROM users WHERE user_email = 'mateo@truelock.test'),
 (SELECT perm_id FROM permissions WHERE perm_code = 'REPORT_VIEW'));

-- ---------------------------------------------------------------------
-- verification_codes
-- ---------------------------------------------------------------------
INSERT INTO verification_codes
(user_id, veri_channel, veri_purpose, veri_destination, veri_code, veri_attempts, veri_expires_at, veri_verified_at) VALUES
-- Vigente y sin usar (código correcto: 4821)
((SELECT user_id FROM users WHERE user_email = 'sofia@truelock.test'),
 'EMAIL', 'REGISTER', 'sofia@truelock.test', '4821', 0, DATE_ADD(NOW(6), INTERVAL 10 MINUTE), NULL),
-- Ya verificado
((SELECT user_id FROM users WHERE user_email = 'director@truelock.test'),
 'EMAIL', 'REGISTER', 'director@truelock.test', '1234', 1, DATE_ADD(NOW(6), INTERVAL 10 MINUTE), NOW(6)),
-- Expirado (probar "código vencido")
((SELECT user_id FROM users WHERE user_email = 'admin@truelock.test'),
 'PHONE', 'REGISTER', '+573102223344', '9999', 0, DATE_SUB(NOW(6), INTERVAL 1 HOUR), NULL),
-- Recuperación de contraseña vigente
((SELECT user_id FROM users WHERE user_email = 'mateo@truelock.test'),
 'EMAIL', 'PASSWORD_RESET', 'mateo@truelock.test', '5555', 0, DATE_ADD(NOW(6), INTERVAL 10 MINUTE), NULL);

-- ---------------------------------------------------------------------
-- sessions  (token en claro de prueba: token-de-prueba-director)
-- ---------------------------------------------------------------------
INSERT INTO sessions (user_id, sess_token_hash, sess_ip, sess_user_agent, sess_expires_at, sess_revoked_at) VALUES
((SELECT user_id FROM users WHERE user_email = 'director@truelock.test'),
 SHA2('token-de-prueba-director', 256), '127.0.0.1', 'TrueLock-Test', DATE_ADD(NOW(6), INTERVAL 8 HOUR), NULL),
-- Sesión revocada (probar que el backend la rechaza)
((SELECT user_id FROM users WHERE user_email = 'admin@truelock.test'),
 SHA2('token-revocado-admin', 256), '127.0.0.1', 'TrueLock-Test', DATE_ADD(NOW(6), INTERVAL 8 HOUR), NOW(6));
 
 
DROP TABLE IF EXISTS codigos_verificacion;

DROP TABLE IF EXISTS codigos_verificacion;

DROP TABLE IF EXISTS codigos_verificacion;

CREATE TABLE codigos_verificacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    codigo_hash CHAR(64) NOT NULL,
    intentos INT NOT NULL DEFAULT 0,
    usado TINYINT(1) NOT NULL DEFAULT 0,
    creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira DATETIME NOT NULL,
    INDEX idx_email (email)
);

-- =====================================================================
-- Verificación rápida (descomenta si quieres). Esperado: 3, 8, 17, 4, 4, 4, 2
-- SELECT 'roles', COUNT(*) FROM roles UNION ALL SELECT 'permissions', COUNT(*) FROM permissions
-- UNION ALL SELECT 'roles_permissions', COUNT(*) FROM roles_permissions UNION ALL SELECT 'users', COUNT(*) FROM users
-- UNION ALL SELECT 'accesses', COUNT(*) FROM accesses UNION ALL SELECT 'verification_codes', COUNT(*) FROM verification_codes
-- UNION ALL SELECT 'sessions', COUNT(*) FROM sessions;
-- =====================================================================