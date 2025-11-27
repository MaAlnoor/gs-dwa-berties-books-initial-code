# Insert data into the tables

USE berties_books;


INSERT INTO users (username, first_name, last_name, email, hashedPassword)
VALUES (
    'gold',
    'Gold',
    'Smiths',
    'gold@smiths.co.uk',
    '$2b$12$CCDHKU9ztSaOeHRuvR2vkegiPAoFINLhdJHB63qDhZx6jpKrVVA.C'
);
