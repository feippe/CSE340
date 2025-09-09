CREATE TABLE "user" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "lastname" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" TEXT NOT NULL
);
