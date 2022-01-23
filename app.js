//Autor: L.C.C. Sergio Carapia González
//Ultima modificacion: Enero 2022
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
var session2 = driver.session();
var session3 = driver.session();
var session4 = driver.session();

app.get('/', function(req, res){
  session // Station Label
    .run('MATCH (n:Station) RETURN n ')
    .then(function(result) {
      
      var stationGraphsArr = []; // Array de Station Grafos

      result.records.forEach(function(record) {
        stationGraphsArr.push({
          id: record._fields[0].identity.low, // Datos de Grafos
          name: record._fields[0].properties.name, // Station
          latitude: record._fields[0].properties.latitude,
          longitude: record._fields[0].properties.longitude
          //distance: record._fields[0].properties.distance

        });
        
      });

      session // Location Label
        .run('MATCH (n:Location) RETURN n ')
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
  var latitude = Number.parseInt(req.body.station_latitude); //Number.parseInt convierte texto de usuario a numero en texto
  var longitude = Number.parseInt(req.body.station_longitude); //Number.parseInt convierte texto de usuario a numero en texto

  session // Codigo Crea nodo en Label Station
    //.run('CREATE (n:Station {name: $nameParam, latitude: $latitudeParam, longitude: $longitudeParam }) RETURN n.name', {nameParam:name, latitudeParam:latitude, longitudeParam:latitude})
    //MERGE SOLO permite nodos con Nombres DIFERENTES
    .run(' MERGE (n:Station {name: $nameParam, latitude: $latitudeParam, longitude: $longitudeParam}) RETURN n.name', {nameParam:name, latitudeParam:latitude, longitudeParam:longitude})
    .then(function(result){
      res.redirect('/');

      session.close();
    })
    .catch(function(err){
      console.log(err);
    });


  res.redirect('/');
  //session.close(); // cerrar session despues de cada run

});



app.post('/station/startfinish/add',function(req,res) { //Conecta Nodos en Station
  var name1 = req.body.stationStart_name;
  var name2= req.body.stationFinish_name;
  var distance = Number.parseInt(req.body.station_distance);

  session // Codigo Crea relacion de nodos en Label Station
    //.run('MATCH(a:Station {name1:$nameParam1}), (b:Station{name2:$nameParam2}) MERGE (a)-[r:CONNECTION]-(b) RETURN a,b', {nameParam1:name1,nameParam2:name2})
    .run(' MATCH (a:Station {name: $nameParam1}), (b:Station {name: $nameParam2}) MERGE( (a)-[r:CONNECTION{distance:$distanceParam}]->(b)) RETURN a.name, b.name ', {nameParam1:name1,nameParam2:name2,distanceParam:distance})
    .then(function(result){
      res.redirect('/');

      session.close();
    })
    .catch(function(err){
      console.log(err);
    });


  res.redirect('/');
  //session.close(); // cerrar session despues de cada run

});

app.post('/station/delete',function(req,res) { //Borra Nodo  en  Station
  var name = req.body.stationDelete_name;
  //var latitude = Number.parseInt(req.body.station_latitude); //Number.parseInt convierte texto de usuario a numero en texto
  //var longitude = Number.parseInt(req.body.station_longitude); //Number.parseInt convierte texto de usuario a numero en texto

  session // Codigo Borra nodo en Label Station
    //.run('CREATE (n:Station {name: $nameParam, latitude: $latitudeParam, longitude: $longitudeParam }) RETURN n.name', {nameParam:name, latitudeParam:latitude, longitudeParam:latitude})
    //MERGE SOLO permite nodos con Nombres DIFERENTES
    .run('  MATCH (n {name: $nameParam})DETACH DELETE n', {nameParam:name})
    .then(function(result){
      res.redirect('/');

      session.close();
    })
    .catch(function(err){
      console.log(err);
    });


  res.redirect('/');
  //session.close(); // cerrar session despues de cada run

});

app.post('/station/AStar',function(req,res) { //Escribe la Relacion  A*STAR  en Nodos en Station
  var name1 = req.body.stationAStarSource_name;
  var name2= req.body.stationAStarTarget_name;
  var distance = Number.parseInt(req.body.station_distance);

  session //Escribe A-Star* en Station
    //.run('MATCH(a:Station {name1:$nameParam1}), (b:Station{name2:$nameParam2}) MERGE (a)-[r:CONNECTION]-(b) RETURN a,b', {nameParam1:name1,nameParam2:name2})
    .run("  MATCH (source:Station {name: $nameParam1}), (target:Station {name: $nameParam2}) CALL gds.shortestPath.astar.write('myGraphStar2', { sourceNode: source, targetNode: target, latitudeProperty: 'latitude', longitudeProperty: 'longitude', relationshipWeightProperty: 'distance', writeRelationshipType: 'ASTAR', writeNodeIds: true, writeCosts: true }) YIELD relationshipsWritten RETURN relationshipsWritten", {nameParam1:name1,nameParam2:name2,distanceParam:distance})
    .then(function(result){
      res.redirect('/');

      session.close();
    })
    .catch(function(err){
      console.log(err);
    });


  res.redirect('/');
  //session.close(); // cerrar session despues de cada run

});

app.post('/station/AStar/delete',function(req,res) { //Borra camino ASTAR  en  Station
  var name = req.body.stationDelete_name;
  //var latitude = Number.parseInt(req.body.station_latitude); //Number.parseInt convierte texto de usuario a numero en texto
  //var longitude = Number.parseInt(req.body.station_longitude); //Number.parseInt convierte texto de usuario a numero en texto

  session // Codigo Borra nodo en Label Station
    //.run('CREATE (n:Station {name: $nameParam, latitude: $latitudeParam, longitude: $longitudeParam }) RETURN n.name', {nameParam:name, latitudeParam:latitude, longitudeParam:latitude})
    //MERGE SOLO permite nodos con Nombres DIFERENTES
    .run('  MATCH (n {})-[r:ASTAR]->() DELETE r')
    .then(function(result){
      res.redirect('/');

      session.close();
    })
    .catch(function(err){
      console.log(err);
    });


  res.redirect('/');
  //session.close(); // cerrar session despues de cada run

});

app.post('/myGraphStar',function(req,res) { //myGraphStar
  

  session // Codigo Crear myGraphStar
    //.run('CREATE (n:Station {name: $nameParam, latitude: $latitudeParam, longitude: $longitudeParam }) RETURN n.name', {nameParam:name, latitudeParam:latitude, longitudeParam:latitude})
    .run("CALL gds.graph.create('myGraphStar2','Station','CONNECTION',{nodeProperties: ['latitude', 'longitude'],relationshipProperties: 'distance'})")
    .then(function(result){
      res.redirect('/');

      session.close();//faltaba cerrar session 
    })
    .catch(function(err){
      console.log(err);
    });
    
   


  res.redirect('/');
  //session.close(); //cerrar sesion despues de cada run

});

app.post('/myGraphStarAlgoYens',function(req,res) { //Corre Yens en myGraphStar
  

  session // Codigo Crear myGraphStar
    //.run('CREATE (n:Station {name: $nameParam, latitude: $latitudeParam, longitude: $longitudeParam }) RETURN n.name', {nameParam:name, latitudeParam:latitude, longitudeParam:latitude})
    .run(" MATCH (source:Station {name: 'Kings Cross'}), (target:Station {name: 'Kentish Town'})CALL gds.shortestPath.yens.stream('myGraphStar', {sourceNode: id(source), targetNode: id(target), k: 3,relationshipWeightProperty: 'distance'}) YIELD index, sourceNode, targetNode, totalCost, nodeIds, costs,path RETURN index,gds.util.asNode(sourceNode).name AS sourceNodeName,gds.util.asNode(targetNode).name AS targetNodeName,totalCost,[nodeId IN nodeIds | gds.util.asNode(nodeId).name] AS nodeNames,costs,path ORDER BY index")
    .then(function(result){
      res.redirect('/');

      session.close();//faltaba cerrar session 
    })
    .catch(function(err){
      console.log(err);
    });
    
   


  res.redirect('/');
  //session.close(); //cerrar sesion despues de cada run

});

app.post('/myGraphStarDelete',function(req,res) { //Borra myGraphStar
  

  session // Borrar myGraphStar
    //.run('CREATE (n:Station {name: $nameParam, latitude: $latitudeParam, longitude: $longitudeParam }) RETURN n.name', {nameParam:name, latitudeParam:latitude, longitudeParam:latitude})
    .run(" CALL gds.graph.drop('myGraphStar')")
    .then(function(result){
      res.redirect('/');

      session.close();//faltaba cerrar session 
    })
    .catch(function(err){
      console.log(err);
    });
    
   


  res.redirect('/');
  //session.close(); //cerrar sesion despues de cada run

});

app.post('/myGraphST',function(req,res) { //myGraphST
  

  session2 // Codigo Crear myGraphST
    //.run('CREATE (n:Station {name: $nameParam, latitude: $latitudeParam, longitude: $longitudeParam }) RETURN n.name', {nameParam:name, latitudeParam:latitude, longitudeParam:latitude})
    .run("CALL gds.graph.create('myGraphST','Location','ROAD',{relationshipProperties: 'cost'})")
    .then(function(result){
      res.redirect('/');

      session2.close();//faltaba cerrar session 
    })
    .catch(function(err){
      console.log(err);
    });
    
   


  res.redirect('/');
  //session.close(); //cerrar sesion despues de cada run

});
app.post('/myGraphSS',function(req,res) { //myGraphSS
  

  session3 // Codigo Crear myGraphSS
    //.run('CREATE (n:Station {name: $nameParam, latitude: $latitudeParam, longitude: $longitudeParam }) RETURN n.name', {nameParam:name, latitudeParam:latitude, longitudeParam:latitude})
    .run(" CALL gds.graph.create('myGraphSS','Location','ROAD',{relationshipProperties: 'cost'})")
    .then(function(result){
      res.redirect('/');

      session3.close();//faltaba cerrar session 
    })
    .catch(function(err){
      console.log(err);
    });
    
   


  res.redirect('/');
  //session.close(); //cerrar sesion despues de cada run

});

app.post('/myGraphYe',function(req,res) { //myGraphYe
  

  session4 // Codigo Crear myGraphYe
    //.run('CREATE (n:Station {name: $nameParam, latitude: $latitudeParam, longitude: $longitudeParam }) RETURN n.name', {nameParam:name, latitudeParam:latitude, longitudeParam:latitude})
    .run(" CALL gds.graph.create('myGraphYe','Location','ROAD',{relationshipProperties: 'cost'})")
    .then(function(result){
      res.redirect('/');

      session4.close();//faltaba cerrar session 
    })
    .catch(function(err){
      console.log(err);
    });
    
   


  res.redirect('/');
  //session.close(); //cerrar sesion despues de cada run

});



app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app;

//npm run start

