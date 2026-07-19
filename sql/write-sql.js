const fs = require("fs");
const p = require("path");

// SQL content split into chunks to avoid single-string issues
const lines = [
'-- ============================================================',
'-- Fruit Shop Database - Full Schema',
'-- Features: FE-01 to FE-11',
'-- ============================================================',
'',
'CREATE DATABASE IF NOT EXISTS fruit_shop',
'  CHARACTER SET utf8mb4',
'  COLLATE utf8mb4_unicode_ci;',
'',
'USE fruit_shop;',
'',
'-- ============================================================',
'-- FE-01: USER ACCOUNT MANAGEMENT',
'-- ============================================================',
'',
'CREATE TABLE users (',
'    id INT PRIMARY KEY AUTO_INCREMENT,',
'    fullname VARCHAR(100) NOT NULL,',
'    email VARCHAR(100) UNIQUE NOT NULL,',
'    password VARCHAR(255) NOT NULL,',
'    phone VARCHAR(15),',
'    avatar_url VARCHAR(255),',
'    date_of_birth DATE,',
"    role ENUM('user', 'admin', 'shopowner', 'shipper') NOT NULL DEFAULT 'user',",
"    status VARCHAR(20) DEFAULT 'active',",
'    email_verified_at TIMESTAMP NULL,',
'    last_login_at TIMESTAMP NULL,',
'    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,',
'    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
');',
];
fs.writeFileSync(p.join("E:\\KI7Project\\SWD_G1\\sql\\fruit_shop_full.sql"), lines.join("\r\n"), "utf8");
console.log("Written " + lines.length + " lines");
