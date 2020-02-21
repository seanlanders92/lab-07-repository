'use strict';

const pg = require('pg');
require('dotenv').config();
const express = require('express');
const app = express();
const superagent = require('superagent');
const cors = require('cors');

app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

const PORT = process.env.PORT || 3001;

let location = [];
app.get('/location', (request, response) => {
  
  let { latitude, longitude, search_query, formatted_query } = location;
  let city = request.query.city;
  let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATION_IQ_API}&q=${city}&format=json`;
  let sqlSearch = 'SELECT * FROM search WHERE search_query=$1;';
  let safeValues = [city];
  let safeValues2 = [search_query, formatted_query, latitude, longitude];
  
  client.query(sqlSearch, safeValues)
  .then(results => {
    if (results.rows.length > 0) {
      response.send(results.rows[0])
      
    } else {
      superagent.get(url)
      .then(results => {
        let geoData = results.body;
        location = new City(city, geoData[0]);
        
        let SQL = "INSERT INTO search (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *";
        client.query(SQL, safeValues2);
        
        response.status(200).send(location);
        
      })
      .catch((error) => {
        Error(error, response);
      })
    }
  })
  .catch((error) => {
    Error(error, response);
  })
})

app.get('/trails', (request, response) => {

  let { latitude, longitude, search_query, formatted_query } = request.query;
  let url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&key=${process.env.TRAIL_API_KEY}`;

  superagent.get(url)
    .then(results => {
      //console.log(results);
      let dataObj = results.body.trails.map(trail => {
        return new Trail(trail);
      })
      //console.log(dataObj);
      response.send(dataObj);
    })
})

app.get('/weather', (request, response) => {
  let requestData = request.query;
  let url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${requestData.latitude},${requestData.longitude}`;


  superagent.get(url)
    .then(results => {
      //Creating an array of the weather and returning data to the webpage
      let weatherResults = results.body.daily.data;

      let weatherData = weatherResults.map(dayInfo => {
        return new Weather(dayInfo);
      });
      response.status(200).send(weatherData);
    })
    .catch((error) => {
      Error(error, response);
    });
})

function City(city, obj) {
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

function Weather(obj) {
  this.forecast = obj.summary;
  this.time = new Date(obj.time * 1000).toDateString();

}

function Trail(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionStatus;
  this.condition_date = obj.conditionDate.slice(0, 10);
  this.condition_time = obj.conditionDate.slice(11, 19);
}

function Error(error, response) {
  console.error(error);
  return response.status(500).send('Oops! Something went wrong! Please try again in 401');
}
// turn on the server
client.connect()
  .then(
    app.listen(PORT, () => {
      console.log(`listening to ${PORT}`);
    }))