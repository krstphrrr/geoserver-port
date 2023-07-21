var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var topojson = require("topojson-server");
var topoSimp = require("topojson-simplify");
var async = require('async');

const { Pool } = require("pg");

app.get("/", function(req, res) {
  res.send('<h1>Landscape Data Commons</h1><p style="color:blue;">Listening for queries...</p>');
});

io.on("connection", function(socket) {
  console.log("a user connected");

  socket.on("disconnect", function() {
    console.log("user disconnected");
  });

  socket.on("test", function(tmpData) {
    console.log(tmpData);
    socket.emit("test", tmpData + " back at ya!");
  });

  socket.on("getLayers", function(tmpData) {
    console.log("Getting layers...");
   
    var tmpQueries = [];
    tmpData.tmpLayers.forEach(function(layer, i) {
      tmpQueries.push("SELECT gid, " + tmpData.infoID[i] + ", ST_AsGeoJSON(geom, 6) from gis." + layer + " a WHERE ST_Intersects(a.geom, ST_MakeEnvelope(" + tmpData.bounds._southWest.lng + ", "  + tmpData.bounds._southWest.lat + ", " + tmpData.bounds._northEast.lng + ", " + tmpData.bounds._northEast.lat + ", 4326)) = 't';");
    }); 

    const pool = new Pool({
      user: "ldc2",
      host: "localhost",
      database: "gisdb",
      password: "pg#ldc2",
      port: 5432,
    });

    var tmpOut = {};
    var queue = [];
    tmpQueries.forEach(function(query,i) {
      //console.log(query);
      queue.push(pool.query.bind(pool, query));
    });

    async.parallel(queue, function(err, results) {
      for(var i in results) {
        if(results[i].rowCount > 0) {
          var tmpJSON = {"type": "FeatureCollection", "features": []}
          var tmpKeys = Object.keys(results[i].rows[0]);
          results[i].rows.forEach(function(row) {
            var tmpProps = {};
            tmpKeys.forEach(function(key) {
              if(key != "st_asgeojson") {
                tmpProps[key] = row[key];
              }
            });
            tmpJSON.features.push({"type": "Feature", "id": row.gid, "properties": tmpProps, "geometry": JSON.parse(row.st_asgeojson)});
          });

          var tmpTopo = topojson.topology({temp: tmpJSON});
          var tmpTopoPre = topoSimp.presimplify(tmpTopo);
          var tmpTopoSimp = topoSimp.simplify(tmpTopoPre, 0.0001);
          tmpOut[tmpData.tmpLayers[i]] = tmpTopoSimp;
        }
      }
      tmpOut.layers = tmpData.tmpLayers;
      tmpOut.id = tmpData.infoID;
      socket.emit("getLayers", tmpOut);
      pool.end();
    });
  });
});



http.listen(3121, function() {
  console.log("listening on *:3121");
});