function AnyChartLineMain(stage, poster_num, chart_data, nChart, focusDataPoint, drawLeave){
  var divBound = document.getElementById("main_container_"+poster_num).getBoundingClientRect(),
  width = divBound.width-10, height = divBound.height-10;
  var canvas_info = {'width':Math.floor(width),'height':Math.floor(height), 'regions':[], 'insights':[]};

  anychart.onDocumentReady(function () {
    //var stage = anychart.graphics.create('chartdiv');
    var datas = [];
    var insight_id = new Array(focusDataPoint.length).fill({});
    for(j=0; j < chart_data.datas[0].data.length; j++){
      var tmp = [chart_data.labels[0][j]]
      var pointStyle = []
      for(i=0; i<nChart; i++){
        tmp.push(chart_data.datas[i].data[j])
        var filter_value = Object.values(chart_data.filters[i]).join(',');
        // find focusDataPoints that match curr yaxis
        var index = findIndexOfArrayObj(focusDataPoint, ["parent_y", "parent_insight_key" ,"parent_filter_value"], [chart_data.y[i], tmp[0], filter_value]);

        if(index !== -1){
          pointStyle.push({enabled:true, type:"star5", fill: poster_color.insight.line, stroke:"2 gray", size:10})
          insight_id[index] = {"nChart":i, "dPoint":j}; // 第i個chart的第j個data point
        }
        else{
          pointStyle.push('#ffffff')
        }
        
      }
      tmp = tmp.concat(pointStyle);
      datas.push(tmp);
    }
    //console.log(datas);

    // create line chart
    var chart = anychart.line();

    // turn on chart animation
    //chart.animation(true);

    // set chart padding
    chart.padding([10, 20, 10, 20]);

    // create data set on our data,also we can pud data directly to series
    var dataSet = anychart.data.set(datas);

    // map data for the series, take value from column of data set
    for(i=0;i<nChart;i++){
      // series label
      var labelsJoint = legendLabelJoint(chart_data, i);
      var legend = labelsJoint[0];
      var filter_joint = labelsJoint[1];

      // setup first series
      var seriesTemp = dataSet.mapAs({ x: 0, value: i+1, marker: i+nChart+1});

      var series = chart.line(seriesTemp);

      // set chart stroke color, thickness dash
      series.stroke({color: unique_color(chart_data.y[i], filter_joint), /*dash: "4 3",*/thickness: 3});
      series.hovered().stroke({color: "#BBDA00", dash: "4 3", thickness: 3});
      
      series.name(legend);
      series.selected().fill('#f48fb1 0.8').stroke('1.5 #c2185b');   

      // series.labels().enabled(true).anchor('left-bottom').padding(5);
      // enable series markers

      var markers = series.markers();
      markers.enabled(true);
      markers.fill(unique_color(chart_data.y[i], filter_joint));
      //markers.stroke("2 gray");
      var hoverMarkers = series.hovered().markers();
      hoverMarkers.fill("darkred");
      hoverMarkers.stroke("2 gray");

      // adjust tooltip
      var tooltip = series.tooltip();
      tooltip.enabled(false);
      tooltip.fontColor("white");

      var tooltipBackground = series.tooltip().background();
      tooltipBackground.fill("#406181");
      tooltipBackground.stroke("white");
      tooltipBackground.cornerType("round");
      tooltipBackground.corners(4);

      plot_chart_objects[poster_num]['main'][stage+i.toString()] = series;
    }

    // Axis Title Setting
    var y_axis = "", x_axis = chart_data.x[0]
    if(curr_dataset == "AQ") y_axis = 'Air unit';
    else y_axis = chart_data.y[0];
    
    // theme setting
    var customTheme = {
      "line": MainBackgroundStyle(0, width, height, x_axis, y_axis),
      "chart": {
        
      }
    };

    anychart.theme([customTheme]);


    // adjust grid
    //chart.xGrid().enabled(true);
    //chart.xGrid().stroke({color: "gray", dash: "3 5"});
    //chart.xGrid().palette([null, "black 0.1"]);
    
    chart.yGrid().enabled(true);
    chart.yGrid().stroke({color: "gray", dash: "3 5"});


    // turn the legend on
    chart.legend().enabled(true).fontSize(15).fontFamily(FONT).fontColor(poster_color.main.text).padding([0, 0, 20, 0]);

    // set container for the chart and define padding
    chart.container(stage);
    chart.animation(false);

    // initiate chart drawing
    chart.draw();

    // Calculate Regions and Leaf Placement
    var info = AnyChartLineBBox(poster_num, datas, insight_id, [divBound.x, divBound.y]);
    canvas_info['regions'] = info[0]
    canvas_info['insights'] = info[1];
    saveSVGFeatures(poster_num, canvas_info, 1, info[2], drawLeave);

  });
}

function AnyChartLineBBox(poster_num, datas, insight_id, startXY){
  var articles_element = document.querySelectorAll('[role="article"]');
  var g = articles_element[0].getElementsByTagName("g");
  var regions = [];
  var insight_center = [];
  var gCount = 0;
  var lineStartDiv = [];
  for(var i=0; i<g.length; i++){
    if(g[i].childElementCount>=datas.length && gCount<insight_id.length){
      for(var c=0; c<datas.length;c++){
        var bbox = g[i].children[c].getBBox();
        // line chart data point zoom in twice
        var find = findIndexOfArrayObj(insight_id, ['nChart','dPoint'], [gCount, c]);
        if(find >= 0){
          regions.push({'points':[bbox.x-bbox.width*1.5, bbox.y-bbox.height*1.5, bbox.width*3, bbox.height*3], 'alpha':1});
          lineStartDiv[find] = g[i].children[c];
          insight_center[find] = [bbox.x+bbox.width/2, bbox.y+bbox.height/2];
        }else{
          regions.push({'points':[bbox.x-bbox.width*1.5, bbox.y-bbox.height*1.5, bbox.width*3, bbox.height*3], 'alpha':0.8});
        }
      }
      gCount+=1;
    }
    else if(g[i].getAttribute("transform")){
      var bbox = g[i].getBoundingClientRect();
      regions.push({'points':[bbox.x-startXY[0], bbox.y-startXY[1], bbox.width, bbox.height], 'alpha':0.5});
    }
  }
  //console.log(insight_center);
  return [regions, insight_center, lineStartDiv];
}

function parentLineChartJS(parent_div, poster_num, chart_data, layer){

  var width = parent_div.getBoundingClientRect().width;
  var height = parent_div.getBoundingClientRect().height-20;

  var canvas = document.createElement("canvas");
  setAttributes(canvas, {"id":layer, "style":"padding:10px 20px;"});
      canvas.width = width;
      canvas.height = height;
  var ctx = canvas.getContext("2d");
  var chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chart_data.labels[0],
        datasets: ChartJSLineDatasets("parents", chart_data.datas.length, chart_data)
      },
      options: ChartJSOptions("parents"),
    });
  parent_div.appendChild(canvas);

  plot_chart_objects[poster_num]['parents'][layer] = chart;
}

function focusLineChartJS(stage, chart_data, layer){

  var leave_div = document.getElementById(stage);
  var canvas_div = document.createElement("div");
  var resolution = (window.devicePixelRatio>=1)? 150:200;
  setAttributes(canvas_div, {"id":layer, "class":"annoBox", "style":"width:"+resolution+"px"});
  leave_div.appendChild(canvas_div);

  var canvas = document.createElement("canvas");
      canvas.width = resolution;
      canvas.height = resolution;
  var ctx = canvas.getContext("2d");
  var title_text = ""//Object.values(chart_data.filters[0]).join("_")

  $( "#"+layer ).draggable();
  //console.log(chart_data)
  var chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chart_data.labels[0],
        datasets: ChartJSLineDatasets("leaves", chart_data.datas.length, chart_data)
      },
      options: ChartJSOptions("leaves",title_text),
    });
  var textbox = TextBoxDiv(chart_data, layer);
  document.getElementById(layer).appendChild(canvas);
  document.getElementById(layer).appendChild(textbox);

  plot_chart_objects[parseInt(layer.substring(0))]['leaves'][layer] = chart;
}