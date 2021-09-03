    DROP DATABASE IF EXISTS restu_db;
    CREATE DATABASE restu_db; 

    USE restu_db;

    CREATE TABLE users(
        id VARCHAR(36) PRIMARY KEY,  -- guid
        email VARCHAR(320), -- Maxmimum length of an email address defined by RFC 3696
        password VARCHAR(120),
        name varchar(40)
    );