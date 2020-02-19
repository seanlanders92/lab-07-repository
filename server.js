'use strict';

// brings in the expresss library which is our server
const express = require('express');

// instantiates the express library in app
const app = express();

const superAgent = require('superagent');
// lets us go into the .env and get the variables
require('dotenv').config();

// the policeman - lets the server know that it is OK to give information to the front end
const cors = require('cors');
app.use(cors());

// get the port from the env
const PORT = process.env.PORT || 3001;

app.get('/weather', (request, response) => {
    let{search_query, formatted_query, latitude, longitude} = request.query;
    let weatherData = require('./data/darksky.json')

    let allData = []

    weatherData.daily.data.forEach((element) => {
        let forecast = new Weather(element)
        allData.push(forecast);
    })

    response.send(allData);
})

app.get('/location', (request, response) => {
  try{
    let city = request.query.city;
    let geoData = require('./data/geo.json');
    //let geoData = JSON.parse(geo);
  
    let location = new City(city, geoData[0])
   
    response.send(location);
  }
  catch (err){
      response.status(200).send(location);
  }
})

function City(city, obj){
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

function Weather(obj){
    this.forecast = obj.summary;
    this.time = new Date(obj.time).toDateString;

}
// turn on the server
app.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
})