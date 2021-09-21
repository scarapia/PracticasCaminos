const fetch = require("node-fetch");
var neo4j = require('neo4j-driver');

var express = require('express');
var path = require('path');
var logger =require('morgan');
var bodyParser = require('body-parser');

var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'password'));
var session = driver.session();

app.get('/', function(req, res){
  session // Station Label
    .run('MATCH (n:Station) RETURN n LIMIT 25')
    .then(function(result) {
      
      var stationGraphsArr = []; // Array de Station Grafos

      result.records.forEach(function(record) {
        stationGraphsArr.push({
          id: record._fields[0].identity.low, // Datos de Grafos
          name: record._fields[0].properties.name, // Station
          latitude: record._fields[0].properties.latitude,
          longitude: record._fields[0].properties.longitude

        });
        
      });

      session // Location Label
        .run('MATCH (n:Location) RETURN n LIMIT 25')
        .then(function(result2) {
          var locationGraphsArr = [];
          result2.records.forEach(function(record){
            locationGraphsArr.push({
              id: record._fields[0].identity.low, // Datos de Grafos
              name: record._fields[0].properties.name, // Location
              
    
             });

          });
          res.render('index2', {
            station: stationGraphsArr,
            location: locationGraphsArr
          }); // index2.ejs
        })
        .catch(function(err){
          console.log(err);
        });

      
    })
    .catch(function(err) { 
      console.log(err);
    });
  
});

app.post('/station/add',function(req,res) { //agrega a Station
  var name = req.body.station_name;
  var latitude = req.body.station_latitude;
  var longitude = req.body.station_longitude;

  session // Codigo Crea nodo en Label Station
    .run('CREATE (n:Station {name: $nameParam, latitude: $latitudeParam, longitude: $longitudeParam }) RETURN n.name', {nameParam:name, latitudeParam:latitude, longitudeParam:latitude})
    .then(function(result){
      res.redirect('/');

      session.close();
    })
    .catch(function(err){
      console.log(err);
    });


  res.redirect('/');
  session.close(); // cerrar session despues de cada run

});

app.post('/',function(req,res) { //myGraphStar
  

  session // Codigo Crear myGraphStar
    //.run('CREATE (n:Station {name: $nameParam, latitude: $latitudeParam, longitude: $longitudeParam }) RETURN n.name', {nameParam:name, latitudeParam:latitude, longitudeParam:latitude})
    .run("CALL gds.graph.create('myGraphStar','Station','CONNECTION',{nodeProperties: ['latitude', 'longitude'],relationshipProperties: 'distance'})")
    .then(function(result){
      res.redirect('/');

      session.close();//faltaba cerrar session 
    })
    .catch(function(err){
      console.log(err);
    });
    
   


  res.redirect('/');
  session.close(); //cerrar sesion despues de cada run

});






app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app;

//npm run start

//fetch("https://pokeapi.co/api/v2/pokemon?limit=10&offset=0")  //Llama de 0 - 10 primeros pokemons 
//.then(promesaFetch => promesaFetch.json()) // With Promise
//.then(contenido => console.log(contenido));

// Create a driver instance, for the user `neo4j` with password `password`.
// It should be enough to have a single driver per database per application.



/* //Comiemza Comentario

var driver = neo4j.driver(
    'neo4j://localhost',
    neo4j.auth.basic('neo4j', 'password')
  )
console.log('conexion realizada');


// Create a session to run Cypher statements in.
// Note: Always make sure to close sessions when you are done using them!
var session = driver.session()

// the Promise way, where the complete result is collected before we act on it:
//.run('MERGE (james:Person {name : $nameParam}) RETURN james.name AS name', {
  //  nameParam: 'James'
  //})

session
  .run('MATCH (n:Station {name : $nameParam}) RETURN n.name AS name ', {
      nameParam:'Euston'
  })

  //.run('MATCH (n: {Station}.name) RETURN n.name AS name ')
  .then(result => {
    result.records.forEach(record => {
      console.log(record.get('name'))
    })
  })
  .catch(error => {
    console.log(error)
  })
  .then(() => session.close())

  
  // Close the driver when application exits.
  // This closes all used network connections.
  //await driver.close()
  
  //Termina Conmentario  
  */ 