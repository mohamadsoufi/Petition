DROP TABLE IF EXISTS signatures;


CREATE TABLE signatures
(
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- SELECT *
-- FROM signatures;
-- CREATE TABLE signatures
-- (
--     id SERIAL PRIMARY KEY,
--     first VARCHAR NOT NULL CHECK (first != ''),
--     last VARCHAR NOT NULL CHECK (last != ''),
--     signature TEXT NOT NULL CHECK (signature != ''),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );





