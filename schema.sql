DROP TABLE IF EXISTS search;

CREATE TABLE search (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude VARCHAR(255),
    longitude VARCHAR(255)
);

INSERT INTO search (search_query, formatted_query, latitude, longitude) VALUES ('Carrington', 'Beard');

SELECT * FROM search;