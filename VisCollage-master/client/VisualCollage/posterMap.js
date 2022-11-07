//d3.js
function getCityPos(chart_data, cityPos, nChart){
  // preprocessing data to suitable format
  var n_datapoints = chart_data.datas[0].data.length
  var points = []
  var val_max = 0
  var val_min = Infinity;
  for(j=0; j<n_datapoints; j++){
      var x_name = chart_data.labels[0][j];
      var city_ID = cityPos.findIndex(City => City.admin_name == x_name);
      if(city_ID!==-1){
        var item = []
        for(i=0; i<nChart; i++){
          var labelID = chart_data.labels[i].indexOf(x_name);
          var filters = Object.values(chart_data.filters[i]).join('_')
          item.push({"x":chart_data.y[i].split("(")[0]+"("+filters+")", "value":chart_data.datas[i].data[labelID]})
          if(chart_data.datas[i].data[labelID]>val_max) val_max = chart_data.datas[i].data[labelID];
          if(chart_data.datas[i].data[labelID]<val_min) val_min = chart_data.datas[i].data[labelID];
        }
        // 過濾缺少資料的data point
        if(item.filter(d => d.value === undefined).length > 0) continue;
        var tmp={ "flng": cityPos[city_ID].flng, 
                  "flat": cityPos[city_ID].flat,
                  "data":item,
                  "posLabel":cityPos[city_ID].admin_name
                };
        points.push(tmp);
      }
      //else console.log(x_name, city_ID);
  }
  return points;
}

function drawWorldMap(stage, poster_num, mapData, countyPos, chart_data, nChart, focusDataPoint, drawLeave){
  var divBound = document.getElementById(stage).getBoundingClientRect();
  var width = divBound.width, height = divBound.height;
  var points = getCityPos(chart_data, countyPos, nChart);
  var canvas_info = {'width':Math.floor(width),'height':Math.floor(height), 'regions':[], 'insights':[]};
  // Start to draw world map
  var svg = d3.select("#"+stage).append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("padding", "20px 20px 20px 20px")
      .attr("class", "tw-map")
      .attr("id", "main_svg")

  var resolution = (window.devicePixelRatio>=1)? [[40,20], 130]:[[0,40], 130];
  var projection = d3.geoMercator().center(resolution[0]).scale(resolution[1]);
  var continentScale = "";
  if(chart_data.filters[0].hasOwnProperty('Continent') && chart_data.x[0] != "Continent"){
    var continent_focus = (window.devicePixelRatio>=1)? continent_lat_lon[1][chart_data.filters[0].Continent[0]]:continent_lat_lon[0][chart_data.filters[0].Continent[0]];;
    //console.log(continent_focus)
    projection = d3.geoMercator().center(continent_focus.center).scale(continent_focus.scale);
    continentScale = chart_data.filters[0].Continent[0];
  }
  var path = d3.geoPath().projection(projection);
  var world = svg.append("g").attr("class","counties").attr("id","counties"+poster_num);
  topoObjects = (chart_data.x[0] == "Continent")? mapData.objects.continent : mapData.objects.countries;

  //console.log(topojson.feature(mapData, topoObjects).features)
  // 縣市/行政區界線
  world.append("path").attr("class","county-borders") 
        .attr("d", path(
            topojson.mesh(mapData, topoObjects, function (a, b) { return a !== b; })
        ));
  
  var insight_keys = focusDataPoint.map(({parent_insight_key}) => parent_insight_key)
  var countries = d3.select("#counties"+poster_num).selectAll("path")
        .data(topojson.feature(mapData, topoObjects).features)
        .enter().append("path")
        .attr("d", path)
        .attr("name",function(d) {
          if(insight_keys.includes(d.properties["name"])){
            var bbox = d3.select(this).node().getBBox();
            canvas_info['regions'].push({'points':[bbox.x, bbox.y, bbox.width, bbox.height], 'alpha':1});
          }else if(continentScale=="" && subRegion.includes(d.properties["name"])){
              var bbox = d3.select(this).node().getBBox();
              canvas_info['regions'].push({'points':[bbox.x, bbox.y, bbox.width, bbox.height], 'alpha':0.5});
          }else if(continentScale!=="" && subsubRegion[continentScale].includes(d.properties["name"])){
            var bbox = d3.select(this).node().getBBox();
              canvas_info['regions'].push({'points':[bbox.x, bbox.y, bbox.width, bbox.height], 'alpha':0.8});
          }

          return d.properties["name"];
        })
        .attr("value", function(d){
          var pt_id = points.findIndex(element=>element.posLabel==d.properties["name"])
          if(pt_id!==-1){
            var obj2string = points[pt_id].data.map(obj => obj.x+": "+obj.value);
            return obj2string.join("<br>");
          }
          else return "(No Data)";
        })
        .style("fill", "white")
  
  // insight highlight
  
  var insight_center = [];
  var lineStartDiv = [];
  world.selectAll("text")
          .data(countyPos)
          .enter()
          .append("text") // append text
          .attr("x", function(d) {return projection([d.flng, d.flat])[0];})
          .attr("y", function(d) {return projection([d.flng, d.flat])[1];})
          .attr("dy", 0) // set y position of bottom of text
          .attr("dx", -20)
          .style("font-size", "0.8rem")
          .style("font-weight", "bolder")
          .style("fill", "black") // fill the text with the colour black  
          .text(function(d) {
            //var index = insight_keys.findIndex(city => city === d.admin_name);
            var index = indexOfAll(insight_keys, d.admin_name);
            if(index.length>0){ // ex. "Taipei" in ["Kinmen", "Taipei", "Keelung"]
              var Cx = projection([d.flng, d.flat])[0], Cy = projection([d.flng, d.flat])[1];
              index.forEach(i => insight_center[i] = [Cx, Cy])
              //insight_center[index] = [Cx, Cy];
              lineStartDiv[index] = d.admin_name;
              return d.admin_name;
            }
          }); // define the text to display

  // get text div
  var text_div = document.getElementById('counties'+poster_num).getElementsByTagName('text');
  for(var i=0; i<text_div.length; i++){
    for(var l=0; l<lineStartDiv.length; l++){
      if(text_div[i].innerHTML == lineStartDiv[l]){
        lineStartDiv[l] = text_div[i];
      }
    }
  }
  // draw landmark image
  world.selectAll(".mark")
    .data(insight_center)
    .enter()
    .append("image")
    .attr('class','landmark')
    .attr('width', 20)
    .attr('height', 20)
    .attr("xlink:href",'icons/location.png')
    .attr("transform", d => "translate(" + d[0] + "," + d[1] + ")");

  if(nChart == 1){
    // Gradient Color Map
    gradientMap(poster_num, points, countries, svg)
  }
  else if(chart_data.type[0] == "bar" && nChart > 1){
    // Create a color scale
    var color = category_color.map(x => x[0]);
    // Small several combined charts
    //SmallBar(points, color, svg, projection);
    bivariateChoropleth(poster_num, points, countries, svg, color);
  }

  // insight color and hover color
  fillMapColor(countries, focusDataPoint);

  canvas_info['insights'] = insight_center;
  saveSVGFeatures(poster_num, canvas_info, 1, lineStartDiv, drawLeave);
}

function bivariateChoropleth(poster_num, points, cities, svg, color, oneD2twoD=false){
  
  var v1_max = d3.max(points.map(item=>{return item.data[0].value}))
  var v2_max = d3.max(points.map(item=>{return item.data[1].value}))
  var scale1 = d3.scaleLinear()
    .range(["gainsboro", color[0]])
    .domain([0, 5]);
  var scale2 = d3.scaleLinear()
    .range(["gainsboro", color[1]])
    .domain([0, 5]);
  
  //將讀取到的資料存到陣列values，令其索引號為各省的名稱
  var values = [];
  
  for(var i=0; i<points.length; i++){
    var name = points[i].posLabel;
    var value1 = points[i].data[0].value;
    var value2 = points[i].data[1].value;
    values[name] = {'col': Math.floor((value1/v1_max)*5), 'row': Math.floor((value2/v2_max)*5)}
  }

  //設定各省份的填充色
  cities.style("fill", function(d,i){
    var data = values[d.properties.name];
    if(data != undefined){
      return d3.scaleLinear()
        .range([scale1(data.col), scale2(data.row)])(0.5);
    }
    else return 'white';
  });

  //
  var data = d3.range(5).reduce(function(arr, elem) {
    return arr.concat(d3.range(5).map(function(d) {
      return {
        col: elem,
        row: d
      }
    }))
  }, []);

  //定義一個線性漸變
  /* 80%--> (50,500) (200,500) */
  /* 100%--> (50,450) (200,450) */
  var resolution = (window.devicePixelRatio>=1)? {x:30, y:320} : {x:30, y:420}

  if(oneD2twoD == false){
    var colordefs = svg.append("g").attr("class","colordef").attr("id","colordef"+poster_num);
    var rect = colordefs.selectAll(null)
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => d.col * 20 + resolution.x)
      .attr("y", d => Math.abs(d.row-5) * 20 + resolution.y)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", function(d) {
        return d3.scaleLinear()
          .range([scale1(d.col), scale2(d.row)])(0.5)
      })
      .attr("cursor", "pointer")
      .on("click", function(d, i) {
        var color = category_color.map(x => x[0]);
        bivariateChoropleth(poster_num, points, cities, svg, color, oneD2twoD=true)
      });
    //新增文字

    var vertical = colordefs.append("text")
              .attr("class","valueText")
              .attr("x", resolution.x+15)
              .attr("y", resolution.y+140)
              .attr("dy", "-0.3em")
              .text(function(){ return points[0].data[0].x;})
              .attr("cursor", "pointer")
              .on("click", function(d, i) { gradientMap(poster_num, points, cities, svg, 0, twoD2oneD=true) });
    
    var horizontal = colordefs.append("text")
              .attr("class","valueText")
              .attr("dy", "-0.3em")
              .attr("transform", "translate("+(resolution.x-10).toString()+","+(resolution.y+110).toString()+") rotate(-90)")
              .text(function(){ return points[0].data[1].x;})
              .attr("cursor", "pointer")
              .on("click", function(d, i) { gradientMap(poster_num, points, cities, svg, 1, twoD2oneD=true) });

  }
}
function drawTaiwanMap(stage, poster_num, mapData, cityPos, chart_data, nChart, focusDataPoint, drawLeave){
  var divBound = document.getElementById(stage).getBoundingClientRect();
  var width = divBound.width, height = divBound.height;
  var points = getCityPos(chart_data, cityPos, nChart);
  var canvas_info = {'width':Math.floor(width),'height':Math.floor(height), 'regions':[], 'insights':[]};

  //console.log(topojson.feature(mapData, mapData.objects.COUNTY_MOI_1090820).features);
  // Start to draw city map
  var svg = d3.select("#"+stage).append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("padding", "20px 20px 20px 20px")
      .attr("class","tw-map")
      .attr("id", "main_svg")

  var resolution = (window.devicePixelRatio>=1)? [[121, 23.5], 5000] : [[121,24], 6000]
  var projection = d3.geoMercator().center(resolution[0]).scale(resolution[1]); /* 80%--> [120, 24], 6000 */ /* 100%--> [121.5, 23.5], 5000 */
  var path = d3.geoPath().projection(projection);

  var taiwan = svg.append("g").attr("class","counties").attr("id","counties"+poster_num);;
  
  // 縣市/行政區界線
  taiwan.append("path").attr("class","county-borders")
        .attr("d", path(
            topojson.mesh(mapData, mapData.objects.COUNTY_MOI_1090820, function (a, b) { return a !== b; })
        ));
  var insight_keys = focusDataPoint.map(({parent_insight_key}) => parent_insight_key)

  var cities = d3.select("#counties"+poster_num).selectAll("path")
          .data(topojson.feature(mapData, mapData.objects.COUNTY_MOI_1090820).features)
          .enter().append("path")
          .attr("d", path)
          .attr("name",function(d) {
            if(insight_keys.includes(d.properties["name"]) && d.properties["name"] !== "Kaohsiung"){
              var bbox = d3.select(this).node().getBBox();
              canvas_info['regions'].push({'points':[bbox.x, bbox.y, bbox.width, bbox.height], 'alpha':1});
            }
            else if(d.properties["name"]=="Kinmen" || d.properties["name"]=="Penghu"){
              var bbox = d3.select(this).node().getBBox();
              canvas_info['regions'].push({'points':[bbox.x, bbox.y, bbox.width, bbox.height], 'alpha':0.5});
            }
            return d.properties["name"];
          })
          .attr("value", function(d){
            var pt_id = points.findIndex(element=>element.posLabel==d.properties["name"])
            var obj2string = points[pt_id].data.map(obj => obj.x+": "+obj.value)
            return obj2string.join("<br>");
          })

  // insight highlight
  
  var insight_center = [];
  var lineStartDiv = [];
  var landmark_pos = []
  taiwan.selectAll("text")
          .data(cityPos)
          .enter()
          .append("text") // append text
          .attr("x", function(d) {return projection([d.flng, d.flat])[0];})
          .attr("y", function(d) {return projection([d.flng, d.flat])[1];})
          .attr("dy", 30) // set y position of bottom of text
          .attr("dx", -20)
          .style("font-size", "0.8rem")
          .style("font-weight", "bolder")
          .style("fill", "black") // fill the text with the colour black  
          .text(function(d) {
            var index = insight_keys.findIndex(city => city === d.admin_name);
            if(index>=0){ // ex. "Taipei" in ["Kinmen", "Taipei", "Keelung"]
              var Cx = projection([d.flng, d.flat])[0], Cy = projection([d.flng, d.flat])[1];
              landmark_pos[index] = [projection([d.clng, d.clat])[0], Cy = projection([d.clng, d.clat])[1]];
              insight_center[index] = [Cx, Cy];
              //DistLeafChart(poster_num, Cx, Cy);
              lineStartDiv[index] = d.admin_name;
              return d.admin_name;
            }
          }); // define the text to display
  
  // get text div
  var text_div = document.getElementById('counties'+poster_num).getElementsByTagName('text');
  for(var i=0; i<text_div.length; i++){
    for(var l=0; l<lineStartDiv.length; l++){
      if(text_div[i].innerHTML == lineStartDiv[l]){
        lineStartDiv[l] = text_div[i];
      }
    }
  }

  // draw landmark image
  taiwan.selectAll(".mark")
        .data(landmark_pos)
        .enter()
        .append("image")
        .attr('class','landmark')
        .attr('width', 20)
        .attr('height', 20)
        .attr("xlink:href",'icons/location.png')
        .attr("transform", d => "translate(" + d[0] + "," + d[1] + ")");

  if(nChart == 1){
    // Gradient Color Map
    gradientMap(poster_num, points, cities, svg)
  }
  else if(chart_data.type[0] == "bar" && nChart > 1){
    // Create a color scale
    var color = category_color.map(x => x[0]);
    // Small several combined charts
    SmallBar(points, color, svg, projection);
  }

  var labelDiv = document.querySelector("#"+stage).querySelector("#main_svg");
  for(var g=0; g<labelDiv.childElementCount; g++){
    if(labelDiv.children[g].getAttribute("id")=='colordef'+poster_num || labelDiv.children[g].getAttribute("class")=='rectlabel'){
      var bbox = labelDiv.children[g].getBBox();
      if(labelDiv.children[g].getAttribute("transform")){
        var trans = labelDiv.children[2].getAttribute("transform").split("(")[1].split(",")
        bbox.x += parseInt(trans[0]);
        bbox.y += parseInt(trans[1].split(")")[0]);
      }
      canvas_info['regions'].push({'points': [bbox.x, bbox.y, bbox.width, bbox.height], 'alpha':0.8});
    }
  }
  

  // insight color and hover color
  fillMapColor(cities, focusDataPoint);

  // fill bbox
  var bbox = d3.selectAll(".county-borders").node().getBBox();
  canvas_info['regions'].push({'points': [bbox.x, bbox.y, bbox.width, bbox.height], 'alpha':0.8});
  canvas_info['insights'] = insight_center;
  saveSVGFeatures(poster_num, canvas_info, 1, lineStartDiv, drawLeave);
}

function fillMapColor(map, focusDataPoint){
  var previous_color;
  map.style("fill", function(d,i){
    var insight_keys = focusDataPoint.map(({parent_insight_key}) => parent_insight_key)
    if(insight_keys.includes(d.properties.name)&&false) return poster_color.insight.map;
    else return d3.select(this).style("fill");
  }).on('mouseover', function(d){
    previous_color = d3.select(this).style("fill");
    d3.select(this).style('fill', '#fcfadd');
  }).on('mouseout', function(d,i){
    d3.select(this).style('fill', previous_color);
  });
  
  // panel 隨滑鼠移動
  $(".counties").find('path').mouseover(function(e) {
    if($('#mapPanel').is(':visible')){
        $('#mapPanel').css({
            'top' : e.pageY,
            'left' : e.pageX,
        });
        $('#mapTooltip').html($(this).attr("name") + "<br>" + $(this).attr("value"));
    } else {
        $('#mapPanel').fadeIn('slow').delay(3000).fadeOut();
    }
  });
}

function getStandardDeviation (array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  const stddev = Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
  return stddev;
}

function gradientMap(poster_num, points, cities, svg, n=0, twoD2oneD=false){
  var logScale = getStandardDeviation(points.map(item=>{return item.data[n].value})) < 100.0 ? false : true;
  logScale = points.length<10? false: logScale;
  var maxvalue = d3.max(points.map(item=>{return item.data[n].value}));
  var minvalue = 0;
  var linear;
  if(logScale){
    linear = d3.scaleLog()
        .domain([1, maxvalue])
        .range([0, 1]);
  }else{
    linear = d3.scaleLinear()
        .domain([0, maxvalue])
        .range([0, 1]);
  }
  //定義最小值和最大值對應的顏色
  var a = d3.color("#ffffff");
  var b = d3.color(category_color.map(x => x[0])[n]);
  //顏色插值函式
  var computeColor = d3.interpolate(a, b);

  //將讀取到的資料存到陣列values，令其索引號為各省的名稱
  var values = [];
  for(var i=0; i<points.length; i++){
    var name = points[i].posLabel;
    var value = points[i].data[n].value;
    values[name] = value;
  }

  //設定各省份的填充色
  cities.style("fill", function(d,i){
    if(values[d.properties.name] === undefined) return "white";
    var t = linear( values[d.properties.name] );
    var color = computeColor(t);
    return color.toString();
  });

  if(twoD2oneD == false){  
    //定義一個線性漸變
    var colordefs = svg.append("g").attr("class","colordef").attr("id","colordef"+poster_num);
    var defs = colordefs.append("defs");
    var linearGradient = defs.append("linearGradient")
                .attr("id","linearColor"+poster_num)
                .attr("x1","0%")
                .attr("y1","0%")
                .attr("x2","100%")
                .attr("y2","0%");
    
    var stop1 = linearGradient.append("stop")
                .attr("offset","0%")
                .style("stop-color",a.toString());
    
    var stop2 = linearGradient.append("stop")
                .attr("offset","100%")
                .style("stop-color",b.toString());
    
    //新增一個矩形，並應用線性漸變
    /* 80%--> (50,500) (200,500) */
    /* 100%--> (50,450) (200,450) */
    var resolution = (window.devicePixelRatio>=1)? {x:50, y:450} : {x:50, y:550}
    var colorRect = colordefs.append("rect")
              .attr("x", resolution.x)
              .attr("y", resolution.y)
              .attr("width", 150)
              .attr("height", 10)
              .style("fill","url(#" + linearGradient.attr("id") + ")");
    
    //新增文字
    var minValueText = colordefs.append("text")
              .attr("class","valueText")
              .attr("x", resolution.x)
              .attr("y", resolution.y)
              .attr("dy", "-0.3em")
              .text(function(){ return minvalue;});
    
    var maxValueText = colordefs.append("text")
              .attr("class","valueText")
              .attr("x", resolution.x+150)
              .attr("y", resolution.y)
              .attr("dy", "-0.3em")
              .text(function(){ return maxvalue;});
    
    if(logScale){
      logScaleText = colordefs.append("text")
              .attr("class","valueText")
              .attr("x", resolution.x+30)
              .attr("y", resolution.y)
              .attr("dy", "-0.3em")
              .text(function(){ return "logarithmic scale";});
    }
  }
}

function SmallBar(points, color, svg, projection){
  width = 30;
  height = 30;

  var smallbar = svg.append("g").attr("class","smallbar");    
  var xScale = d3.scaleBand().range([0, width]).padding(0.4),
      yScale = d3.scaleLinear().range([height, 0]);
  
  var all_values = []
  for(var i=0; i<points.length; i++){
      all_values.push(points[i]["data"].map(function(d) { return d.value; }));
  }
  var maxRow = all_values.map(function(row){ return Math.max.apply(Math, row); });
  var max = Math.max.apply(null, maxRow);

  for(i=0; i<points.length; i++){

    // City Label
    var cityName = points[i].posLabel

    xScale.domain(points[i]["data"].map(function(d) { return d.x; }));
    yScale.domain([0, max]);

    // small chart should generate on each long lat
    g_x = projection([points[i].flng, points[i].flat])[0]-width/2
    g_y = projection([points[i].flng, points[i].flat])[1]-height/2

    
    var g = smallbar.append("g")
        .attr("transform", function(d){ return "translate(" + g_x + "," + g_y + ")"});

    // draw small bar chart
    g.selectAll(".bar")
      .data(points[i]["data"])
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return xScale(d.x); })
      .attr("y", function(d) { return yScale(d.value); })
      .attr("fill", function(d) { return unique_color(d.x.split("(")[0], d.x.split("(")[1].slice(0, -1))})
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return height - yScale(d.value); });
    
    /*g.selectAll("text.bar")
      .data(points[i]["data"])
      .enter().append("text")
      .attr("font-size","8px")
      .attr("class", "bar")
      .attr("text-anchor", "middle")
      .attr("x", function(d) { return xScale(d.x); })
      .attr("y", function(d) { return yScale(d.value)-10;  })
      .text(function(d) { return d.value; });*/

  }
  // Create Legend for small chart
  var legspacing = 25;
  var legend = svg.selectAll(".legend")
              .data(points[0].data.map(item=>{return item.x})) // d = "PM2.5(2019)""
              .enter()
              .append("g")
              .attr("class", "rectlabel")
              .attr("transform", function(d){ return "translate(" + 50 + "," + 100 + ")"});

      legend.append("rect")
          .attr("fill", function(d) { return unique_color(d.split("(")[0], d.split("(")[1].slice(0, -1))})
          .attr("width", 10)
          .attr("height", 10)
          .attr("y", function (d, i) {
              return i * legspacing - 60;
          })
          .attr("x", 0)

      legend.append("text")
          .attr("class", "label-small")
          .attr("y", function (d, i) {
              return i * legspacing - 46;
          })
          .attr("x", 30)
          .attr("text-anchor", "start")
          .text(function (d, i) {
              return points[0].data.map(item=>{return item.x})[i];
          })
          .style("fill", poster_color.main.text);
}
/*
function AnyChartTaiwan(stage, mapData, cityPos, chart_data, nChart, focusDataPoint){
  var divBound = document.getElementById("main_container_").children[0].getBoundingClientRect(),
  width = divBound.width, height = divBound.height;

    anychart.onDocumentReady(function () {
      map = anychart.map();
      
      var geojson = mapData;

      map.geoData(geojson);
      
      var mapScale = map.scale();
        // set scale minimums and maximums
        mapScale.minimumX(120);
        mapScale.maximumX(122);
        mapScale.minimumY(21);
        mapScale.maximumY(26);

      // Preprocessing data to suitable format
      var points = []
      var units = []
      var n_datapoints = chart_data.datas[0].data.length;
      for(i=0;i<nChart;i++){
        for(j=0; j<n_datapoints; j++){
          var tmp = {"id":chart_data.labels[i][j], "name":chart_data.labels[i][j], "value":chart_data.datas[i].data[j]};
          points.push(tmp);
        }
        units.push(chart_data.y[0]);
      }
      //console.log(points);
      var dataSet = anychart.data.set(points);  
      
      var colorRange = map.colorRange();
          colorRange
            .enabled(true)
            .padding([20, 0, 0, 0])
            .colorLineSize(10)
            .stroke('#B9B9B9')
            .labels({ padding: 3 })
            .labels({ size: 7 });
          colorRange
            .ticks()
            .enabled(true)
            .stroke('#B9B9B9')
            .position('outside')
            .length(10);
          colorRange
            .minorTicks()
            .enabled(true)
            .stroke('#B9B9B9')
            .position('outside')
            .length(5);

      var series = map.choropleth(dataSet);
          series.colorScale(
            anychart.scales.linearColor(
                    '#c2e9fb',
                    '#81d4fa',
                    '#01579b',
                    '#002746'
            )
          );
          series
            .hovered()
            .fill('#f48fb1')
            .stroke(anychart.color.darken('#f48fb1'));
          series
            .selected()
            .fill('#c2185b')
            .stroke(anychart.color.darken('#c2185b'));
          
          series
            .tooltip()
            .useHtml(true)
            .format(function () {
                return (
                '<span style="font-size: 13px">' +
                this.value + ' ' + units[0] + '</span>'
                );
            });

      // set background color
      var background = map.background();
      background.fill({
        // set colors position
        keys: [poster_color.main.background],
        // set angle of colors drawing
        angle: 90
      });

      map.bounds(0, 0, width, height);
      map.container(stage);
      map.transform(9.042687600355316, 41.9617928275597)
      map.draw();
  });
}*/

/*
function drawGeoWorldMap(poster_num, chart_data, nChart){
  // series label
  var labelsJoint = legendLabelJoint(chart_data, 0);
  var filter_joint = labelsJoint[1];

  google.charts.load('current', {
    'packages':['geochart'],
    'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
  });
  google.charts.setOnLoadCallback(drawRegionsMap);

  if (chart_data.x[0] == 'Country' || chart_data.x[0] == 'Country/Region'){
    var points = [['Country', chart_data.y[0]]];
    var n_datapoints = chart_data.datas[0].data.length
    for(j=0; j<n_datapoints; j++){
      var tmp = [chart_data.labels[0][j],chart_data.datas[0].data[j]];
      points.push(tmp);
    }
  }
  else if (chart_data.x[0] == 'Continent'){
    var points = [['Region Code', 'Continent', chart_data.y[0]]];
    var n_datapoints = chart_data.datas[0].data.length
    var NA_index = -1;
    var SA_index = -1;
    for(j=0; j<n_datapoints; j++){
      if(chart_data.labels[0][j] == "North America") NA_index = points.length;
      else if(chart_data.labels[0][j] == "South America") SA_index = points.length;
      var tmp = [continent_code[chart_data.labels[0][j]], chart_data.labels[0][j],chart_data.datas[0].data[j]];
      points.push(tmp);
    }
    // combine North America and South America due to Google GeoChart constraint
    points[NA_index][1] = "America";
    points[NA_index][2] += points[SA_index][2];
    points.splice(SA_index, 1);
  }
  //console.log(points);

  var options_region = "world";
  var options_resolution = x_to_resolution[chart_data.x[0]]
  if(chart_data.filters[0].hasOwnProperty('Continent')){
    options_region = continent_code[chart_data.filters[0].Continent[0]];
  }

  function drawRegionsMap() {
    var data = google.visualization.arrayToDataTable(points);
    //console.log(options_region + ", " + options_resolution);
    var options = {
      region: options_region,
      resolution: options_resolution,
      colorAxis: {colors: ["#C2D3E3", unique_color(points[0][1], filter_joint)]},
      backgroundColor: {
        fill: poster_color.main.background,
        fillOpacity: 0.8
      },
      //chartArea: {
      //  backgroundColor: {
      //    fill: '#7A8EA0',
      //    fillOpacity: 0.1
      //  },
      },
    };
   
    var chart = new google.visualization.GeoChart(document.getElementById('main_container_'+poster_num));
    chart.draw(data, options);
  }
}*/
