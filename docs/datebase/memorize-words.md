## 背单词功能，数据库设计

### 数据库创建 personal

```sql
CREATE DATABASE personal
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;
USE personal;
```

### 用户表 users

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

### 单词表

数据来源[english-vocabulary](https://github.com/KyleBing/english-vocabulary)

创建 junior senior ETC4 ETC6

### 创建已阅表

user_id 关联 users 表的 id，word 关联单词表的 word，type 对关联内容分类属于哪个表的单词

```sql
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE recitation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    word VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    type ENUM('junior', 'senior', 'CET4', 'CET6') COLLATE utf8mb4_general_ci NOT NULL,
    recite_count INT DEFAULT 0,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_word_type (user_id, word, type)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;
```
