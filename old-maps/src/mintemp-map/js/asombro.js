//******Call function to reposition windows on resize
window.addEventListener('resize', resizePanels);

//******Adjust div position to ensure that it isn't overflowing window
function resizePanels() {
  var bodyRect = document.body.getBoundingClientRect();
  var tmpWindows = ["infoDiv", "locateDiv", "legendDiv"];
        
  tmpWindows.forEach(function(win) {
    var winRect = document.getElementById(win).getBoundingClientRect();
    if(winRect.bottom > bodyRect.bottom) {
      d3.select("#" + win).style("top", bodyRect.height - winRect.height + "px");
    }
    if(winRect.right > bodyRect.right) {
      d3.select("#" + win).style("left", bodyRect.width - winRect.width + "px");
    }
  });
  d3.select("#legendImgDiv").style("min-width", "0px").style("width", "auto");
  var legRect = document.getElementById("legendImgDiv").getBoundingClientRect();
  d3.select("#legendImgDiv").style("min-width", legRect.width + "px");
}


function initPage() {
  //******Initialize bootstrap tooltip
  $(function() {
    $('[data-toggle="tooltip"]').tooltip();
  });

  map = new L.Map('map', {attributionControl: false, zoomControl: false, minZoom: 3, maxZoom: 20, inertiaDeceleration: 1000, worldCopyJump: true, maxBounds: [[115,-240],[-115,240]]});
  map.fitBounds([[30, -115],[48,-95]]);

  //******Watch events and get data from postgres when level is appropriate and add as SVG
  map.on("moveend", function(event) {
    //check4Json();
  });

  function check4Json() {
    /*
    console.log(map.getZoom());
    if(map.getZoom() == 5) {
      var tmpData = {bounds: map.getBounds(), tmpLayers: [], infoID: []};
      var i = 0;
      map.eachLayer(function(layer) {
        if(typeof layer.options.layers != "undefined" && layer.options.layers.slice(4) == "tl_2017_us_state_wgs84" && i == 0) {
          tmpData.tmpLayers.push(layer.options.layers.slice(4));
          tmpData.infoID.push(infoIDField[layer.options.layers.slice(4)]);
          i += 1;
        }
      });
    }

    if(map.getZoom() == 6) {
      var tmpData = {bounds: map.getBounds(), tmpLayers: [], infoID: []};
      var i = 0;
      map.eachLayer(function(layer) {
        if(typeof layer.options.layers != "undefined" && (layer.options.layers.slice(4) == "tl_2017_us_state_wgs84" || layer.options.layers.slice(4) == "mlra_v42_wgs84") && i == 0) {
          tmpData.tmpLayers.push(layer.options.layers.slice(4));
          tmpData.infoID.push(infoIDField[layer.options.layers.slice(4)]);
          i += 1;
        }
      });
    }

    else if(map.getZoom() >= 7) {
      var tmpData = {bounds: map.getBounds(), tmpLayers: [], infoID: []};
      var i = 0;
      map.eachLayer(function(layer) {
        if(typeof layer.options.layers != "undefined") {
          tmpData.tmpLayers.push(layer.options.layers.slice(4));
          tmpData.infoID.push(infoIDField[layer.options.layers.slice(4)]);
          i += 1;
        }
      });
    }

    if(i > 0) {
      socket.emit("getLayers", tmpData);
    }
    */
  }

  //******Make d3 vector layers variable
  topoSVG = d3.select(map.getPanes().overlayPane).append("svg").attr("id", "topoSVG");
  topos = {};
  transform = d3.geoTransform({point: projectPoint});
  path = d3.geoPath().projection(transform);


  L.control.mousePosition().addTo(map);

  //***Bing geocoder control
  var tmpPoint = new L.marker;
  var bingGeocoder = new L.Control.BingGeocoder('At3gymJqaoGjGje-JJ-R5tJOuilUk-gd7SQ0DBZlTXTsRoMfVWU08ZWF1X7QKRRn', { callback: function (results)
    {
      if(results.statusCode == 200) {
        if(d3.select("#bingGeocoderSubmit").classed("fa-search")) {
          $(document).ready(function(){
            $('[data-toggle="tooltip"]').tooltip();   
          });
          document.getElementById("bingGeocoderInput").blur();
          var bbox = results.resourceSets[0].resources[0].bbox,
            first = new L.LatLng(bbox[0], bbox[1]),
            second = new L.LatLng(bbox[2], bbox[3]),
            tmpBounds = new L.LatLngBounds([first, second]);
          this._map.fitBounds(tmpBounds);
          this._map.removeLayer(tmpPoint);
          tmpPoint = new L.marker(results.resourceSets[0].resources[0].point.coordinates);
          this._map.addLayer(tmpPoint);
          d3.select(".leaflet-marker-icon")
            .attr("id","mapIcon")
            .attr("value", results.resourceSets[0].resources[0].name)
            .attr("data-toggle", "tooltip")
            .attr("data-container", "body")
            .attr("data-placement", "top")
            .attr("data-html", "true")
            .attr("title", '<p><b>' + results.resourceSets[0].resources[0].name + '</b></p>');
          d3.select(tmpPoint)
            .on("click", function() { clearSearch(); });
          d3.select("#bingGeocoderSubmit")
            .classed("fa-search", false)
            .classed("fa-times", true)
            .property("title", "Click to clear locate results");
        }
        else {
          clearSearch();
        }
      }
      else {
        d3.select("#bingGeocoderInput").property("value","No matching results");    
      }
    }
  });


  //******Make headerControls div
  d3.select("body")
    .insert("div", ":first-child")
    .attr("id", "headerControls");




  //******Make div for geolocater
  d3.select("body")
    .append("div")
    .attr("class", "legend gradDown")
    .attr("id", "locateDiv");

  $('#locateDiv').draggable({containment: "html", cancel: ".toggle-group,input,textarea,button,select,option"});

  d3.select("#locateDiv")
    .append("h4")
    .text("Locate")
    .attr("class", "legTitle")
    .attr("id", "locateTitle")
    .append("span")
    .html('<span class="fa fa-info-circle" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p><u><b>Locate</b></u></p><p>Enter name or coordinates to zoom to a location on the map.</p>"</span>');
 
  d3.select("#locateTitle")
    .html(d3.select("#locateTitle").html() + '<div class="exitDiv"><span id="hideLocate" class="fa fa-times-circle" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>Click to hide window</p>"</span></div>'); 

  d3.select("#hideLocate")
    .on("click", function() { toolWindowToggle("locate"); });

  d3.select("#locateDiv")
    .append("div")
    .attr("id", "bingGeoLocate");



  document.getElementById('bingGeoLocate').appendChild(bingGeocoder.onAdd(map));
  d3.select("#bingGeocoderInput")
    .on("mouseup", function() { if(this.value == "No matching results") { this.value = ""; } else { $(this).select(); } })
    .on("blur", function() { modifySearch(this, "blur"); })
    .on("keyup", function() { modifySearch(this, "key"); });

  function modifySearch(tmpEl, tmpEvent) {
    if(tmpEvent == "blur") {
      if((tmpEl.value == "" || tmpEl.value == "No matching results") && document.getElementById("mapIcon")) { 
        tmpEl.value = d3.select("#mapIcon").attr("value"); 
        d3.select("#bingGeocoderSubmit").classed("fa-times", true).classed("fa-search", false);
      }
      else if(tmpEl.value == "No matching results" && !document.getElementById("mapIcon")) {
        tmpEl.value = "";
      }
    } 
    else if(document.getElementById("mapIcon")) {
      if(tmpEl.value != d3.select("#mapIcon").attr("value")) {
        d3.select("#bingGeocoderSubmit").classed("fa-times", false).classed("fa-search", true);
      }
      else {
        d3.select("#bingGeocoderSubmit").classed("fa-times", true).classed("fa-search", false);
      }
    }
  }





  //******Clear the results of the geo search
  function clearSearch() {
    map.removeLayer(tmpPoint);
    d3.select(".tooltip").remove();
    d3.select("#bingGeocoderInput").property("value", "");

    d3.select("#bingGeocoderSubmit")
      .classed("fa-times", false)
      .classed("fa-search", true)
      .style("background", "")
      .property("title", "Click to zoom to specified location");
  }


  //***Add in backgrounds
  var googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
  });
  var googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
  }); 
  var googleStreet = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
  });
  var googleTerrain = L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
  });
/*
  var usgsTopo = new L.tileLayer('https://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 15,
    zIndex: 0,
    attribution: '<a href="http://www.doi.gov">U.S. Department of the Interior</a> | <a href="https://www.usgs.gov">U.S. Geological Survey</a> | <a href="https://www.usgs.gov/laws/policies_notices.html">Policies</a>'
  });
*/
  var countries = L.tileLayer.wms('https://jornada.nmsu.edu/geoserver/jornada/wms', {
    layers: 'jornada:countries_wgs84',
    format: 'image/png',
    transparent: true,
    tiled: true,
    version: '1.3.0',
    maxZoom: 20
  });

  var blank = new L.tileLayer('');


  //***Add in overlays
  var states = L.tileLayer.wms('https://jornada.nmsu.edu/geoserver/jornada/wms', {
    layers: 'jornada:tl_2017_us_state_wgs84',
    format: 'image/png',
    transparent: true,
    tiled: true,
    version: '1.3.0',
    maxZoom: 20
  });

/*
  var counties = L.tileLayer.wms('https://jornada-ldc2.jrn.nmsu.edu/geoserver/wms', {
    layers: 'ldc:tl_2017_us_county_wgs84',
    format: 'image/png',
    transparent: true,
    tiled: true,
    version: '1.3.0',
    maxZoom: 20
  });

  var surf = L.tileLayer.wms('https://jornada-ldc2.jrn.nmsu.edu/geoserver/wms', {
    layers: 'ldc:surface_mgt_agency_wgs84',
    format: 'image/png',
    transparent: true,
    tiled: true,
    version: '1.3.0',
    maxZoom: 20
  });

  var mlra = L.tileLayer.wms('https://jornada-ldc2.jrn.nmsu.edu/geoserver/wms', {
    layers: 'ldc:mlra_v42_wgs84',
    format: 'image/png',
    transparent: true,
    tiled: true,
    version: '1.3.0',
    maxZoom: 20
  });

  var statsgo = L.tileLayer.wms('https://jornada-ldc2.jrn.nmsu.edu/geoserver/wms', {
    layers: 'ldc:statsgo_wgs84',
    format: 'image/png',
    transparent: true,
    tiled: true,
    version: '1.3.0',
    maxZoom: 20
  });

  var huc8 = L.tileLayer.wms('https://jornada-ldc2.jrn.nmsu.edu/geoserver/wms', {
    layers: 'ldc:wbdhu8_wgs84',
    format: 'image/png',
    transparent: true,
    tiled: true,
    version: '1.3.0',
    maxZoom: 20
  });
*/

  var minTempAnn = L.tileLayer.wms('https://jornada.nmsu.edu/geoserver/jornada/wms', {
    layers: 'jornada:mintempbycounty_wgs84',
    format: 'image/png',
    transparent: true,
    tiled: true,
    version: '1.3.0',
    maxZoom: 20
  });



  var opaVar = [minTempAnn];
  var infoObj = { "mintempbycounty_wgs84": "Min Annual Temp-County"};
  var infoIDField = { "mintempbycounty_wgs84": "d_tmin_ann"};
  var overlayID = d3.keys(infoObj);
  var baselayers = {"Google Terrain": googleTerrain, "Google Hybrid": googleHybrid, "Google Satellite": googleSatellite, "Google Street": googleStreet, "Country Borders": countries, "None": blank};
  var overlays = { "Change in Min Temp": minTempAnn};
  var overlayTitles = d3.keys(overlays);
  //L.control.layers(baselayers, overlays).addTo(map);

  //******Make layer controller
  //***baselayers
  var layerNames = {};
  layerNames.baseLayers = baselayers; //{"Google Terrain": googleTerrain, "Google Hybrid": googleHybrid, "Google Satellite": googleSatellite, "Google Street": googleStreet, "None": blank};
  layerNames.baseLayers.keys = d3.keys(layerNames.baseLayers);
  layerNames.baseLayers.values = d3.values(layerNames.baseLayers);


  //***Overlay layers
  layerNames.overlays = {};
  overlayTitles.forEach(function(tmpTitle,i) {
    layerNames.overlays[tmpTitle] = opaVar[i];
  });
  layerNames.overlays.keys = d3.keys(overlays);
  layerNames.overlays.values = d3.values(overlays);



  d3.select("#headerControls")
    .insert("div", ":first-child")
    .attr("id", "mapTools")
    .append("div")
    .attr("id", "baselayerSelect")
    .attr("class", "layerList")
    .append("div")
    .attr("id", "baselayerList")
    .attr("class", "cl_select")
    .property("title", "Click to change map baselayer")
    .html('<span id="baselayerListHeader">Change Baselayer</span><span class="fa fa-caret-down pull-right" style="position:relative;top:3px;"></span>')
    .on("click", function() { if(d3.select("#baselayerListDropdown").style("display") == "none") {d3.select("#baselayerListDropdown").style("display", "inline-block");} else {d3.select("#baselayerListDropdown").style("display", "none");} });;

  d3.select("#baselayerSelect")
    .append("div")
    .attr("id", "baselayerListDropdown")
    .attr("class", "layerListDropdown")
    .on("mouseleave", function() { d3.select(this).style("display", "none") });

  //******Add baselayer options
  d3.select("#baselayerListDropdown").selectAll("div")
    .data(layerNames.baseLayers.keys)
    .enter()
      .append("div")
      .attr("class", "layerName")
      .text(function(d) { return d; })
      .property("value", function(d,i) { return i; })
      .property("title", function(d) { return d; })
      .on("click", function() { changeBaselayer(this); })
      .append("span")
      .attr("class", "fa fa-check pull-right activeOverlay")
      .style("visibility", function(d,i) { if(i == 0) {return "visible";} else {return "hidden";} });

  //******Initialize baselayer
  map.addLayer(googleTerrain);

  //******Function to change baselayer on select change
  function changeBaselayer(tmpDiv) {
    //***Remove old layer
    var layerDivs = d3.select("#baselayerListDropdown").selectAll("div");
      
    layerDivs._groups[0].forEach(function(tmpLayer) {
      if(d3.select(tmpLayer).select("span").style("visibility") == "visible") {
        d3.select(tmpLayer).select("span").style("visibility", "hidden");
        map.removeLayer(layerNames.baseLayers.values[d3.select(tmpLayer).property("value")]);
      }
    });

    //***Add new layer
    d3.select(tmpDiv).select("span").style("visibility", "visible");
    map.addLayer(layerNames.baseLayers.values[tmpDiv.value]);
    layerNames.baseLayers.values[tmpDiv.value].bringToBack();       
  }



  //***Overlay layers
  d3.select("#mapTools")
    .append("div")
    .attr("id", "overlaySelect")
    .attr("class", "layerList")
    .append("div")
    .attr("id", "overlayList")
    .attr("class", "cl_select")
    .property("title", "Click to select overlay layers to display on map")
    .html('<span id="overlayListHeader">View Overlay Layers</span><span class="fa fa-caret-down pull-right" style="position:relative;top:3px;"></span>')
    .on("click", function() { if(d3.select("#overlayListDropdown").style("display") == "none") {d3.select("#overlayListDropdown").style("display", "inline-block");} else {d3.select("#overlayListDropdown").style("display", "none");} });;
   d3.select("#overlaySelect")
    .append("div")
    .attr("id", "overlayListDropdown")
    .attr("class", "layerListDropdown")
    .on("mouseleave", function() { d3.select(this).style("display", "none") });

  //******Add overlay options
  d3.select("#overlayListDropdown").selectAll("div")
    .data(layerNames.overlays.keys)
    .enter()
      .append("div")
      .attr("class", "layerName")
      .text(function(d) { return d; })
      .property("value", function(d,i) { return i; })
      .property("title", function(d) { return d; })
      .property("name", function(d,i) { return overlayID[i]; })
      .on("click", function() { changeOverlay(this); })
      .append("span")
      .attr("class", "fa fa-check pull-right activeOverlay")
      .style("visibility", "hidden"); //function(d) { if(d == "US States") { map.addLayer(states); return "visible"; } else { return "hidden"; } });

  //******Function to add/remove overlay layer
  function changeOverlay(tmpDiv) {
    if(d3.select(tmpDiv).select("span").style("visibility") == "hidden") {
      d3.select(tmpDiv).select("span").style("visibility", "visible");
      map.addLayer(layerNames.overlays.values[tmpDiv.value]);
      check4Json();
      layerNames.overlays.values[tmpDiv.value].bringToFront();
      addLegendImg(tmpDiv.name, tmpDiv.title, layerNames.overlays.values[tmpDiv.value], ["overlays",tmpDiv.title]);
    } 
    else {
      d3.select(tmpDiv).select("span").style("visibility", "hidden");
      removeTopo(topos[d3.select(tmpDiv).property("name")]);
      map.removeLayer(layerNames.overlays.values[tmpDiv.value]);
      remLegendImg(tmpDiv.name);
    }
    //check4Json();
  }


  //******Add SVG group for each overlay layer
  d3.select("#topoSVG").selectAll("g")
    .data(overlayID)
    .enter()
      .append("g")
      .attr("id", function(d) { topos[d] = {"g": this, "class": d}; return d + "G"; })
      .attr("class", "leaflet-zoom-hide");

  for(var obj in infoIDField) {
    topos[obj].id = infoIDField[obj];
    topos[obj].gids = [];
    topos[obj].feats = [];
  }


  //Add panel icons
  d3.select("#headerControls")
    .append("div")
    .attr("id", "panelTools");

  var hcPanels = ["info", "legend", "locate", "extent"];
  var hcGlyphs = ["fa-info", "fa-th-list", "fa-search", "fa-globe"];
  var hcLabel = ["Identify", "Legend", "Locate", "Zoom"]
  d3.select("#panelTools").selectAll("divs")
    .data(hcPanels)
    .enter()
      .append("div")
      .attr("id", function(d) { return "hc" + d.charAt(0).toUpperCase() + d.slice(1) + "Div"; })
      .attr("class", "hcPanelDivs layerList")
      .property("title", function(d,i) {
        if(d == "extent") {
          return "Click to zoom to initial extent";
        }
        else {
          return "Click to show " + hcLabel[i] + " window"; 
        }
      })
      .html(function(d,i) { if(d != "search") { return '<span class="fa ' + hcGlyphs[i] + '"></span>'; } else { return '<span class="fa ' + hcGlyphs[i] + '" data-toggle="collapse" data-target="#bingGeoLocate"></span>'; } })
      .on("click", function(d) { 
        switch (d) {
          case "info":
            toolWindowToggle(d);
            break;
          case "legend":
            toolWindowToggle(d);               
            break;
          case "extent":
            map.fitBounds([[30, -115],[48,-95]]);
            break;
          case "locate":
            toolWindowToggle(d);               
            break;
        }
      });



      //******Function to toggle tool windows
      toggleWords = {"legend":"Legend", "info":"Identify", "locate": "Locate"}
/*
      function toolWindowToggle(tmpDiv) {
        if (d3.select("#" + tmpDiv + "Div").style("opacity") == "1") {
          d3.select("#" + tmpDiv + "Div").transition().style("opacity", "0").style("visibility", "hidden");
          d3.select("#hc" + tmpDiv.charAt(0).toUpperCase() + tmpDiv.slice(1) + "Div").property("title", "Click to show " + toggleWords[tmpDiv] + " window");
        }
        else {
          d3.select("#" + tmpDiv + "Div").transition().duration(250).ease(d3.easeCubic).style("opacity", "1").style("display", "block").style("visibility", "visible").on("end", resizePanels);            
          d3.select("#hc" + tmpDiv.charAt(0).toUpperCase() + tmpDiv.slice(1) + "Div").property("title", "Click to hide " + toggleWords[tmpDiv] + " window");
          setZ(d3.select("#" + tmpDiv + "Div")._groups[0][0]);
        }
      }


      function setZ(tmpWin) {
        if (d3.select("#map").classed("introjs-showElement") == false) {
          d3.selectAll("#legendDiv,#infoDiv").style("z-index", function() { if(d3.select(this).style("opacity") == 1) {return 1001;} else {return 7500;} }); 
          d3.select(tmpWin).style("z-index", 1002);
        }
      }
*/



  //******Make div for info
  d3.select("body")
    .append("div")
    .attr("class", "legend gradDown")
    .attr("id", "infoDiv");

  $('#infoDiv').draggable({containment: "html", cancel: ".toggle-group,input,textarea,button,select,option"});

  d3.select("#infoDiv")
    .append("h4")
    .text("Identify")
    .attr("class", "legTitle")
    .attr("id", "infoTitle")
    .append("span")
    .html('<span class="fa fa-info-circle" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p><u><b>Identify</b></u></p><p>Displays attribute values for selected counties on the map and enables them to be downloaded to a CSV file.</p>"</span>');
 
  d3.select("#infoTitle")
    .html(d3.select("#infoTitle").html() + '<div class="exitDiv"><span id="hideInfo" class="fa fa-times-circle" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>Click to hide window</p>"</span></div>'); 

  d3.select("#hideInfo")
    .on("click", function() { toolWindowToggle("info"); });

  d3.select("#infoDiv")
    .append("div")
    .attr("id", "info");

  d3.select("#infoDiv")
    .append("div")
    .attr("id", "infoCtls")
    .html('<div id="infoClear" class="infoCtls" title="Clear selected counties">Clear</div><div id="infoDownload" class="infoCtls" title="Download data for selected counties to a CSV file"><a id="infoDownloadA" href="#" download="min_temp.csv">Download</a></div>');

  d3.select("#infoClear")
    .on("click", function() { d3.selectAll(".svgSelected").classed("svgSelected", false); d3.selectAll(".infoDiv").remove(); });


  //******Make div for legend
  d3.select("body")
    .append("div")
    .attr("class", "legend gradDown")
    .attr("id", "legendDiv");

  $('#legendDiv').draggable({containment: "html", cancel: ".toggle-group,textarea,button,select,option"});

  d3.select("#legendDiv")
    .append("h4")
    .text("Legend")
    .attr("class", "legTitle")
    .attr("id", "legendTitle")
    .append("span")
    .html('<span class="fa fa-info-circle" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p><u><b>Legend</b></u></p><p>Displays the legend for the predicted change in minimum temperature enabling interpretation along with control over the transparency of the layer.</p>"</span>');
 
  d3.select("#legendTitle")
    .html(d3.select("#legendTitle").html() + '<div class="exitDiv"><span id="hideLegend" class="fa fa-times-circle" data-toggle="tooltip" data-container="body" data-placement="auto" data-html="true" title="<p>Click to hide window</p>"</span></div>'); 

  d3.select("#hideLegend")
    .on("click", function() { toolWindowToggle("legend"); });

  d3.select("#legendDiv")
    .append("div")
    .attr("id", "legendDefault")
    .text("Add a map layer to view its legend...");

  d3.select("#legendDiv")
    .append("div")
    .attr("id", "legendImgDiv");

    //$("#legendImgDiv").sortable({appendTo: "#legendImgDiv", containment: "#legendImgDiv", cancel: "input,textarea,button,select,option", forcePlaceholderSize: true, placeholder: "sortable-placeholder", helper: "original", tolerance: "pointer", stop: function(event, ui) { reorder(event, ui); }, start: function(event, ui) { helperPlaceholder(event, ui); }});


  //******Change the layer orders after drag and drop
  function reorder(tmpEvent, tmpUI) {
     var tmpCnt = tmpEvent.target.children.length;
     var i = 0
     for (let child of tmpEvent.target.children) {
       overlays[infoObj[child.id.slice(0,-6)]].setZIndex(tmpCnt - i);
       i += 1;
     }
  }

  //******Style the helper and placeholder when dragging/sorting
  function helperPlaceholder(tmpEvent, tmpUI) {
    d3.select(".ui-sortable-placeholder.sortable-placeholder").style("width", d3.select("#" + tmpUI.item[0].id).style("width")).style("height", "37px");  //.style("background", "rgba(255,255,255,0.25)"); 
  }


  //******Adds images to the legend
  function addLegendImg(tmpName, tmpTitle, tmpLayer, tmpPath) {
    if(tmpName.includes("temp") || tmpName.includes("precip")) {
      var tmpOpa = 0.7;
    }
    else {
      var tmpOpa = 1;
    }
    tmpLayer.setOpacity(tmpOpa);

    d3.select("#legendImgDiv")
      .insert("div", ":first-child")
      .attr("id", tmpName + "Legend")
      .attr("value", tmpPath)
      .attr("class", "layerLegend")
      .append("div")
      .attr("id", tmpName + "LegendHeader")
      .attr("data-toggle", "collapse")
      .attr("data-target", "#" + tmpName + "collapseDiv")
      .on("click", function() { changeCaret(d3.select(this).select("span")._groups[0][0]); })
      .append("div")
      .attr("class", "legendTitle")
      .html('<h6>' + tmpTitle + '</h6><div class="exitDiv"><span class="fa fa-caret-down legendCollapse" title="View legend"></span></div>');

    $("#" + tmpName + "LegendHeader").on("shown.bs.collapse", function() { resizePanels(); });
    $("#" + tmpName + "LegendHeader").on("hidden.bs.collapse", function() { resizePanels(); });

    function changeCaret(tmpSpan) {
      if(d3.select(tmpSpan).classed("fa-caret-down")) {
        d3.select(tmpSpan).classed("fa-caret-down", false).classed("fa-caret-up", true).property("title", "Hide legend");
      }
      else {
        d3.select(tmpSpan).classed("fa-caret-up", false).classed("fa-caret-down", true).property("title", "View legend");
      }
    }

    d3.select("#" + tmpName + "Legend")
      .append("div")
      .attr("id", tmpName + "collapseDiv")
      .attr("class", "collapseDiv collapse")
      .append("div")
      .attr("id", tmpName + "LegImgDiv")
      .attr("class","legImgDiv")
      .append("img")
      .attr("id", tmpName + "LegendImg")
      .attr("class", "legendImg")
      .property("title", tmpTitle);

    //***Set div width and offset after the image has been loaded
    $("#" + tmpName + "LegendImg").one("load", function() {
      var tmpRect = document.getElementById(tmpName + "LegendImg").getBoundingClientRect();
      d3.select("#" + tmpName + "LegImgDiv").style({"max-height":tmpRect.height - 67 + "px", "max-width": tmpRect.width + "px"});
      d3.select("#" + tmpName + "Legend").style("opacity", "1");
      $(d3.select("#mintempbycounty_wgs84LegendHeader").select("div")._groups[0][0]).trigger("click"); 
    }).attr("src", "https://jornada.nmsu.edu/geoserver/jornada/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=30&HEIGHT=30&LAYER=ldc:" + tmpName);

    d3.select("#" + tmpName + "collapseDiv")
      .append("div")
      .attr("id", tmpName + "LegendSlider")
      .property("title", tmpTitle + " Layer Opacity: " + tmpOpa * 100 + "%");

    $("#" + tmpName + "LegendSlider").slider({animate: "fast", min: 0, max: 100, value: tmpOpa * 100, slide: function(event, ui) { layerOpacity(ui, tmpLayer); d3.select("#" + tmpName + "LegendSlider").property("title", tmpTitle + " Layer Opacity: " + ui.value + "%");  } });

    d3.select("#legendDefault").style("display", "none");

    d3.select("#legendImgDiv")
      .style("display", "block");

    if(d3.select("#legendDiv").style("opacity") == 0) {
      toolWindowToggle("legend");
    }

    resizePanels();
  }


  //******Removes images to the legend
  function remLegendImg(tmpName) {
    d3.select("#" + tmpName + "Legend").remove();

    if(d3.select("#legendImgDiv").selectAll("div")._groups[0].length == 0) {
      d3.select("#legendImgDiv").style("display", "none");
      d3.select("#legendDefault").style("display", "block");
    }
  }


  //******Change transparency of current legend layer
  function layerOpacity(tmpSlider, tmpLayer) {
    var tmpOpacity = tmpSlider.value/100; 
    tmpSlider.title = "Opacity: " + tmpSlider.value + "%"; 
    tmpLayer.setOpacity(tmpOpacity);
  } 




  //******Set z-indexes of moveable divs so that clicked one is always on top
  d3.selectAll("#legendDiv,#infoDiv,#locateDiv")
    .on("mousedown", function() { setZ(this); });



  //******Read in json file
  d3.json("min/gis/minTemp_simp.json").then(function(data) {
    tmpTopo = topojson.feature(data, data.objects.minTemp);
    addTopo(tmpTopo);
  });

  //******Make tooltip for displaying attribute data
  tooltip = d3.select("body")
    .append("div")
    .attr("id", "d3Tooltip")
    .attr("class", "d3Tooltip");



  //******Add minTemp layer
  $(d3.select("#overlayListDropdown").select("div")._groups[0][0]).trigger("click");

  //******Add states layer
  map.addLayer(states);
  states.setZIndex(2);


  //map.addEventListener("click", onMapClick);

  function onMapClick(e) {
    //console.log(e.latlng.lat.toFixed(3) + ", " + e.latlng.lng.toFixed(3));
    var i = -1;
    var tmpLayers = "";
    map.eachLayer(function(layer) { 
      i += 1;
      if(typeof layer.options.layers != "undefined") {
        if(tmpLayers == "") {
          tmpLayers = layer.options.layers;
        }
        else {
          tmpLayers = layer.options.layers + "," + tmpLayers;
        }
      }
    });

    var bbox = map.getBounds(); //.toBBoxString();
    var tmpStr = bbox._southWest.lat + "," + bbox._southWest.lng + "," + bbox._northEast.lat + "," + bbox._northEast.lng;
    var tmpWidth = map.getSize().x;
    var tmpHeight = map.getSize().y;
    var tmpI = map.layerPointToContainerPoint(e.layerPoint).x;
    var tmpJ = map.layerPointToContainerPoint(e.layerPoint).y;

    var tmpUrl = 'https://jornada.nmsu.edu/geoserver/jornada/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=' + tmpLayers + '&QUERY_LAYERS=' + tmpLayers + '&BBOX=' + tmpStr + '&FEATURE_COUNT=' + (i * 5) + '&HEIGHT=' + tmpHeight + '&WIDTH=' + tmpWidth + '&INFO_FORMAT=application/json&CRS=EPSG:4326&i=' + tmpI + '&j=' + tmpJ;
    //console.log(tmpUrl);

    //send the request using jQuery $.ajax
    $.ajax({
      url: tmpUrl,
      dataType: "json",
      type: "GET",
      success: function(data) {
        var tmpText = "";
        data.features.forEach(function(tmpFeat,j) {
          var tmpID = tmpFeat.id.split(".")[0];
          if(tmpID != "") {
            addInfo(tmpID, tmpFeat.properties[infoIDField[tmpID]]);
          }
          else if(tmpID == "") {
            if(tmpID == "") { tmpID = "aspect_elevation"; }
            addInfo(tmpID, Math.round(tmpFeat.properties.GRAY_INDEX));
          }
          else {
            addInfo(tmpID, "");
          }
        });
        d3.select("#infoP").text(tmpText);
        if(d3.select("#infoDiv").style("opacity") == 0) { toolWindowToggle("info"); }
        resizePanels();

        function addInfo(tmpId, tmpInfo) {
          if(tmpText == "") {
            tmpText = infoObj[tmpId] + ": " + tmpInfo;
          }
          else {
            tmpText += "\n" + infoObj[tmpId] + ": " + tmpInfo;
          }
        }
      }
    });
  }
}







//******Use Leaflet to implement a D3 geometric transformation.
function projectPoint(x, y) {
  var point = map.latLngToLayerPoint(new L.LatLng(y, x));
  this.stream.point(point.x, point.y);
}



//******Add topo layer to map
function addTopo(topo) {
  var tmpFeats = topo.features;  //.filter(function(d) { return topo.gids.indexOf(d.id) == -1; });
  //tmpFeats.forEach(function(d) { topo.gids.push(d.id); topo.feats.push(d); });

  //d3.select(topo.g).selectAll("." + topo.class).remove();
  
  d3.select("#mintempbycounty_wgs84G").selectAll(".minTemp")
    .data(topo.features)
    .enter().append("path")
      .attr("d", path)
      .attr("class", "minTemp activeTopo")
      .property("data-tt", function(d) { return d.properties.CountyName + ", " + d.properties.State_Abb + ": " + d.properties.D_Tmin_ANN.toFixed(1) + " C"; })
      .on("mouseenter", function() { d3.select(this).classed("svgHover", true); showIt(d3.select(this).property("data-tt")); resizeTooltip();})
      .on("mousemove", function() { tooltip.style("top", (d3.event.pageY-50) + "px").style("left", (d3.event.pageX) + "px"); resizeTooltip(); })
      .on("mouseleave", function() { d3.select(this).classed("svgHover", false); tooltip.style("visibility", "hidden");})
      .call(d3.drag()) //.on("start", function() { d3.select(this).style("cursor", ""); console.log("drag start"); }).on("end", function() { d3.select(this).style("cursor", ""); console.log("drag end"); }))
      .on("click", function(d) { if(d3.select(this).classed("svgSelected") == true) { d3.select(this).classed("svgSelected", false); remInfo(d.properties); } else { d3.select(this).classed("svgSelected", true); addInfo(d.properties); addCSV(); } })
      .on("touchend", function() { if(d3.select(this).classed("svgSelected") == true) { d3.select(this).classed("svgSelected", false); } else { d3.select(this).classed("svgSelected", true); } });

  map.on("movestart", function() { d3.select("#map").style("cursor", "grabbing"); });
  map.on("moveend", reset);
    
  reset();

  //*****Reposition the SVG to cover the features.
  function reset() {
    d3.select("#map").style("cursor", "");

    //******Set bounds ()
    var tmpPoint = map.latLngToLayerPoint(new L.LatLng(-85, -180))
    var bottomLeft = [tmpPoint.x, tmpPoint.y];
    var tmpPoint = map.latLngToLayerPoint(new L.LatLng(85, 180))
    var topRight = [tmpPoint.x, tmpPoint.y];
          
    topoSVG.attr('width', topRight[0] - bottomLeft[0])
      .attr('height', bottomLeft[1] - topRight[1])
      .style('margin-left', bottomLeft[0] + 'px')
      .style('margin-top', topRight[1] + 'px');

    var translation = -bottomLeft[0] + ',' + -topRight[1];

    //******Select all layer g elements
    var tmpG = topoSVG.selectAll("g");

    //******Loop through each g element and transform the path
    tmpG._groups[0].forEach(function(g) {
      var curG = d3.select(g);
      var feature = curG.selectAll("path");
      curG.attr('transform', 'translate(' + -bottomLeft[0] + ',' + -topRight[1] + ')');
      feature.attr("d", path);
    });  
  }
}


//******Remove topo layer from map
function removeTopo(topo) {
  d3.select(topo.g).selectAll("." + topo.class).remove();
}


//*******Show crossings attribute in tooltip
function showIt(tmpID) {
  tooltip.text(tmpID);
  tooltip.style("visibility", "visible");
  tooltip.property("title", tmpID);
}
  
//******Make sure tooltip is in window bounds
function resizeTooltip() {
  var mapRect = document.getElementById("map").getBoundingClientRect();
  var tmpWindows = ["d3Tooltip"];
        
  tmpWindows.forEach(function(win) {
    var winRect = document.getElementById(win).getBoundingClientRect();
    if(winRect.bottom > mapRect.bottom) {
      d3.select("#" + win).style("top", mapRect.height - winRect.height + "px");
    }
    if(winRect.right > mapRect.right) {
      d3.select("#" + win).style("left", mapRect.width - winRect.width + "px");
    }
  });
}


function addInfo(d) {
  console.log(d);
  d3.select("#info")
    .insert("div", ":first-child")
    .attr("id", "div_" + d.FIPS)
    .attr("class", "infoDiv")
      .append("div")
      .attr("class", "infoTable")
      .html('<p>' + d.CountyName + ", " + d.StateName + '</p>')
        .append("table")
        .attr("id", "tab_" + d.FIPS)
          .append("tr")
          .html('<th>Time Period</th><th>Current</th><th>Future</th><th>Change</th>');

  d3.select("#tab_" + d.FIPS)
    .append("tr")
    .html('<td>Winter</td><td>' + d.Tmin_DJF.toFixed(1) + '</td><td>' + d.F_Tmin_DJF.toFixed(1) + '</td><td>' + d.D_Tmin_DJF.toFixed(1) + '</td>');
  d3.select("#tab_" + d.FIPS)
    .append("tr")
    .html('<td>Spring</td><td>' + d.Tmin_MAM.toFixed(1) + '</td><td>' + d.F_Tmin_MAM.toFixed(1) + '</td><td>' + d.D_Tmin_MAM.toFixed(1) + '</td>');       
  d3.select("#tab_" + d.FIPS)
    .append("tr")
    .html('<td>Summer</td><td>' + d.Tmin_JJA.toFixed(1) + '</td><td>' + d.F_Tmin_JJA.toFixed(1) + '</td><td>' + d.D_Tmin_JJA.toFixed(1) + '</td>');
  d3.select("#tab_" + d.FIPS)
    .append("tr")
    .html('<td>Fall</td><td>' + d.Tmin_SON.toFixed(1) + '</td><td>' + d.F_Tmin_SON.toFixed(1) + '</td><td>' + d.D_Tmin_SON.toFixed(1) + '</td>');
  d3.select("#tab_" + d.FIPS)
    .append("tr")
    .html('<td>Annual</td><td>' + d.Tmin_ANN.toFixed(1) + '</td><td>' + d.F_Tmin_ANN.toFixed(1) + '</td><td>' + d.D_Tmin_ANN.toFixed(1) + '</td>');

  if(d3.select("#infoDiv").style("opacity") == 0) { toolWindowToggle("info"); }
  resizePanels();
}

function remInfo(d) {
  d3.select("#div_" + d.FIPS).remove();
} 


function addCSV() {
  var tmpCSV = "County" + "," + "State" + "," + "Time Period" + "," + "Current" + "," + "Future" + "," + "Change" + "\r\n";
  d3.selectAll(".svgSelected").data().forEach(function(d) {
    tmpCSV += d.properties.CountyName + "," + d.properties.StateName + "," + "Winter" + "," +  + d.properties.Tmin_DJF + "," + d.properties.F_Tmin_DJF + "," + d.properties.D_Tmin_DJF + "\r\n";
    tmpCSV += d.properties.CountyName + "," + d.properties.StateName + "," + "Spring" + "," +  + d.properties.Tmin_MAM + "," + d.properties.F_Tmin_MAM + "," + d.properties.D_Tmin_MAM + "\r\n";
    tmpCSV += d.properties.CountyName + "," + d.properties.StateName + "," + "Summer" + "," +  + d.properties.Tmin_JJA + "," + d.properties.F_Tmin_JJA + "," + d.properties.D_Tmin_JJA + "\r\n";
    tmpCSV += d.properties.CountyName + "," + d.properties.StateName + "," + "Fall" + "," +  + d.properties.Tmin_SON + "," + d.properties.F_Tmin_SON + "," + d.properties.D_Tmin_SON + "\r\n";
    tmpCSV += d.properties.CountyName + "," + d.properties.StateName + "," + "Annual" + "," +  + d.properties.Tmin_ANN + "," + d.properties.F_Tmin_ANN + "," + d.properties.D_Tmin_ANN + "\r\n";
  });

  d3.select("#infoDownloadA").attr("href", "data:attachment/csv," + encodeURIComponent(tmpCSV));
}


function toolWindowToggle(tmpDiv) {
  if (d3.select("#" + tmpDiv + "Div").style("opacity") == "1") {
    d3.select("#" + tmpDiv + "Div").transition().style("opacity", "0").style("visibility", "hidden");
    d3.select("#hc" + tmpDiv.charAt(0).toUpperCase() + tmpDiv.slice(1) + "Div").property("title", "Click to show " + toggleWords[tmpDiv] + " window");
  }
  else {
    d3.select("#" + tmpDiv + "Div").transition().duration(250).ease(d3.easeCubic).style("opacity", "1").style("display", "block").style("visibility", "visible").on("end", resizePanels);            
    d3.select("#hc" + tmpDiv.charAt(0).toUpperCase() + tmpDiv.slice(1) + "Div").property("title", "Click to hide " + toggleWords[tmpDiv] + " window");
    setZ(d3.select("#" + tmpDiv + "Div")._groups[0][0]);
  }
}


function setZ(tmpWin) {
  if (d3.select("#map").classed("introjs-showElement") == false) {
    d3.selectAll("#legendDiv,#infoDiv").style("z-index", function() { if(d3.select(this).style("opacity") == 1) {return 1001;} else {return 7500;} }); 
    d3.select(tmpWin).style("z-index", 1002);
  }
}
