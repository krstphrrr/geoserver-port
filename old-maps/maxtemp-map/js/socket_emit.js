function socket_emit() {
  socket = io();
  
  socket.on('connect', function () {
    console.log('connected!');
  });

  socket.on("test", function(tmpData) {
    console.log(tmpData);
  });

  socket.on("getLayers", function(tmpData) {
    tmpData.layers.forEach(function(layer) {
      if(typeof tmpData[layer] != "undefined") {
        //console.log(JSON.stringify(tmpData[layer]));
        topos[layer].topo = topojson.feature(tmpData[layer], tmpData[layer].objects.temp);
        addTopo(topos[layer]);
      }
    });
    //console.log(topos);
  });

}