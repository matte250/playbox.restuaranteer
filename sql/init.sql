DROP DATABASE IF EXISTS restu_db;
CREATE DATABASE restu_db; 

USE restu_db;

CREATE TABLE users(
    id VARCHAR(36) NOT NULL PRIMARY KEY,  -- guid
    email VARCHAR(320) NOT NULL UNIQUE, -- Maxmimum length of an email address defined by RFC 3696
    password VARCHAR(120) NOT NULL,
    name varchar(40) NOT NULL
);

INSERT INTO users (id, email, password, name) VALUES("19a5e8cd-edab-40ce-82ea-d4420ec6873a","test@test.test","testtest","Test McTester");

CREATE TABLE places(
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    createdBy VARCHAR(36) NOT NULL,  
    googleMapsLink VARCHAR(2000), -- Meant for links, value is quite arbitary.
    FOREIGN KEY (createdBy) REFERENCES users(id)
);

INSERT INTO places (id, name, createdBy, googleMapsLink) 
VALUES(
    "37ad7834-e117-42d1-bf6c-760fff93c2e8",
    "McDonalds",
    "19a5e8cd-edab-40ce-82ea-d4420ec6873a",
    "https://www.google.se/maps/search/mcdonalds/@57.7200922,12.8978709,12z"
);

CREATE TABLE experiences(
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    at VARCHAR(36) NOT NULL,
    `when` DATETIME NOT NULL,
    createdBy VARCHAR(36) NOT NULL,
    FOREIGN KEY (at) REFERENCES places(id),
    FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE TABLE reviews(
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    createdBy VARCHAR(36) NOT NULL,
    score FLOAT NOT NULL,
    created DATETIME NOT NULL,
    experience VARCHAR(36) NOT NULL,
    mealName VARCHAR(40) NOT NULL, -- Arbitrary length
    note TEXT, -- Maybe use VARCHAR here? Need to read up on MySql data types
    FOREIGN KEY (createdBy) REFERENCES users(id),
    FOREIGN KEY (experience) REFERENCES experiences(id),
);