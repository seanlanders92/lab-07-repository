DROP TABLE IF EXISTS search;

CREATE TABLE search (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude NUMERIC(9, 9),
    longitude NUMERIC(9, 9)
);

INSERT INTO search (search_query, formatted_query, latitude, longitude) VALUES ('Carrington', 'Beard');

SELECT * FROM search;