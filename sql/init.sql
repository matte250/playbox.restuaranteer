DROP DATABASE IF EXISTS restu_db;
CREATE DATABASE restu_db; 

USE restu_db;

--Users
CREATE TABLE users(
    id VARCHAR(36) NOT NULL PRIMARY KEY,  -- guid
    email VARCHAR(320) NOT NULL UNIQUE, -- Maxmimum length of an email address defined by RFC 3696
    password VARCHAR(120) NOT NULL,
    name varchar(40) NOT NULL
);

INSERT INTO users (id, email, password, name) VALUES("19a5e8cd-edab-40ce-82ea-d4420ec6873a","test@test.test","testtest","Test McTester");

--Places
CREATE TABLE places(
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    [by] VARCHAR(36) NOT NULL,  
    googleMapsLink VARCHAR(300), -- Meant for links, 300 is quite arbitary.
    FOREIGN KEY (by) REFERENCES users(id)
);

INSERT INTO places (id, name, by) 
VALUES(
    "37ad7834-e117-42d1-bf6c-760fff93c2e8",
    "McDownlads",
    "19a5e8cd-edab-40ce-82ea-d4420ec6873a"
);

--Experiences
CREATE TABLE experiences(
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    at VARCHAR(36) NOT NULL,
    when DATETIME NOT NULL,
    [by] VARCHAR(36) NOT NULL,
    FOREIGN KEY (at) REFERENCES places(id),
    FOREIGN KEY (by) REFERENCES users(id)
);

--Reviews
CREATE TABLE reviews(
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    [by] VARCHAR(36) NOT NULL,
    score FLOAT NOT NULL,
    created DATETIME NOT NULL,
    experience VARCHAR(36) NOT NULL,
    mealName VARCHAR(40) NOT NULL, -- Arbitrary length
    note TEXT -- Maybe use VARCHAR here? Need to read up on MySql data types
    FOREIGN KEY (by) REFERENCES users(id),
    FOREIGN KEY (experience) REFERENCES experiences(id),
);