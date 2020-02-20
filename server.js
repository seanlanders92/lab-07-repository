'use strict';

// brings in the expresss library which is our server
const express = require('express');

// instantiates the express library in app
const app = express();

const superagent = require('superagent');

// lets us go into the .env and get the variables
require('dotenv').config();

// the policeman - lets the server know that it is OK to give information to the front end
const cors = require('cors');
app.use(cors());

// get the port from the env
const PORT = process.env.PORT || 3001;
app.get('/trails', (request, response) => {
let {latitude, longitude, search_query, formatted_query} = request.query;

let url = ``;

superagent.get(url)
  .then(results => {
    const dataObj = results.body.tails.map(trail => {
      new Trail(trail);
    })
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

let location =[];
app.get('/location', (request, response) => {

  let city = request.query.city;
  let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATION_IQ_API}&q=${city}&format=json`;

  superagent.get(url)
    .then(results => {
      let geoData = results.body;
      location = new City(city, geoData[0]);
      response.status(200).send(location);
    })
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

function Trail(obj){
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionStatus;
  this.condition_date = obj.conditionDate.slice(0,10);
  this.condition_time = obj.conditionDate.slice(11,19);
}

function Error(error, response) {
  console.error(error);
  return response.status(500).send('Oops! Something went wrong! Please try again in 401');
}
// turn on the server
app.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
})