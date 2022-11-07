function AnyChartBarMain(stage, poster_num, chart_data, nChart, focusDataPoint, drawLeave){
    var divBound = document.getElementById("main_container_"+poster_num).getBoundingClientRect(),
    width = divBound.width-10, height = divBound.height-10;
    var canvas_info = {'width':Math.floor(width),'height':Math.floor(height), 'regions':[], 'insights':[]};
    
    anychart.onDocumentReady(function () {
        var datas = [];
        var insight_id = new Array(focusDataPoint.length).fill({});
        for(j=0; j < chart_data.datas[0].data.length; j++){
            var tmp = [chart_data.labels[0][j]]
            tmp.push(chart_data.datas[0].data[j])
            var filter_value = Object.values(chart_data.filters[0]).join(',')
            var pointStyle = []
            // find focusDataPoints that match curr yaxis
            var index = findIndexOfArrayObj(focusDataPoint, ["parent_y", "parent_insight_key", "parent_filter_value"], [chart_data.y[0], tmp[0], filter_value])
            if (index !== -1){
                pointStyle.push("forward-diagonal");
                insight_id[index] = {"nChart":0, "dPoint":j};
            }
            else pointStyle.push(null)
            for(i=1; i<nChart; i++){
                var pt_id = chart_data.labels[i].indexOf(tmp[0]);
                tmp.push(chart_data.datas[i].data[pt_id]);
                filter_value = Object.values(chart_data.filters[i]).join(',')
                // find focusDataPoints that match curr yaxis
                var index = findIndexOfArrayObj(focusDataPoint, ["parent_y", "parent_insight_key", "parent_filter_value"], [chart_data.y[i], tmp[0], filter_value])
                if (index !== -1){
                    pointStyle.push("forward-diagonal");
                    insight_id[index] = {"nChart":i, "dPoint":j}; // 第i個chart的第j個data point
                }
                else pointStyle.push(null)
            }
            tmp = tmp.concat(pointStyle);
            datas.push(tmp);
        }
        //console.log(datas);

        // create column chart
        var chart = anychart.column();

        // set chart padding
        chart.padding([10, 20, 10, 20]);

        // create data set on our data
        var dataSet = anychart.data.set(datas);

        // map data for the series, take value from column of data set
        for(i=0;i<nChart;i++){
            // setup first series
            var seriesTemp = dataSet.mapAs({ x: 0, value: i+1, hatchFill: i+1+nChart});

            // create first series with mapped data
            var series = chart.column(seriesTemp);
            series.xPointPosition((i+1)*0.2+0.05);

            // series label
            var labelsJoint = legendLabelJoint(chart_data, i);
            var legend = labelsJoint[0];
            var filter_joint = labelsJoint[1];

            series.name(legend);
            series.selected().fill('#f48fb1 0.8').stroke('1.5 #c2185b');

            series.normal().fill(unique_color(chart_data.y[i], filter_joint));
            series.normal().stroke("#ECECEC", 1);

            // adjust tooltip
            var tooltip = series.tooltip();
            tooltip.enabled(false);
            tooltip.format("{%x}, {%value}");
            tooltip.fontColor("white");

            var tooltipBackground = series.tooltip().background();
            tooltipBackground.fill("#406181");
            tooltipBackground.stroke("white");
            tooltipBackground.cornerType("round");
            tooltipBackground.corners(4);

            plot_chart_objects[poster_num]['main'][legend] = series;
        }

        // Axis Title Setting
        var y_axis = "", x_axis = chart_data.x[0]
        if(curr_dataset == "AQ") y_axis = 'Air unit';
        else y_axis = chart_data.y[0];

        // theme setting
        var customTheme = {
            "column": MainBackgroundStyle(0, width, height, x_axis, y_axis),
            "chart": {
                "barGroupsPadding": 0.3
            }
        };

        anychart.theme([customTheme]);

        // adjust grid
        //chart.xGrid().enabled(true);
        //chart.xGrid().stroke({color: "gray", dash: "3 5"});
        //chart.xGrid().palette([null, "black 0.1"]);
        
        chart.yGrid().enabled(true);
        chart.yGrid().stroke({color: "gray", dash: "3 5"});

        // turn on legend
        chart.legend().enabled(true).fontColor(poster_color.main.text).fontSize(15).fontFamily(FONT).padding([0, 0, 20, 0]);
  
        chart.interactivity().hoverMode('single');
  
        // set container id for the chart
        chart.container(stage);
        chart.animation(false);
  
        // initiate chart drawing
        chart.draw();

        // Calculate Regions and Leaf Placement
        var info = AnyChartBarBBox(poster_num, datas, insight_id, [divBound.x, divBound.y]);
        canvas_info['regions'] = info[0];
        canvas_info['insights'] = info[1];
        saveSVGFeatures(poster_num, canvas_info, 1, info[2], drawLeave);
    }); 
}

function AnyChartBarBBox(poster_num, datas, insight_id, startXY){
    //console.log(insight_id);
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
          ////!!!!!! why bbox.height == 0? animation doesn't finish ////
          var find = findIndexOfArrayObj(insight_id, ['nChart','dPoint'], [gCount, c]);
          if(find >= 0){
            regions.push({'points':[bbox.x, bbox.y, bbox.width, bbox.height], 'alpha':1});
            lineStartDiv[find] = g[i].children[c];
              insight_center[find] = [bbox.x+bbox.width/2, bbox.y];
          }else{
            regions.push({'points':[bbox.x, bbox.y, bbox.width, bbox.height], 'alpha':0.5});
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
Number.prototype.clamp = Number.prototype.clamp || function (min, max) {
    return this < min ? min : (this > max ? max : this);
};

function parentBarChartJS(parent_div, poster_num, chart_data, layer){

  var width = parent_div.getBoundingClientRect().width;
  var height = parent_div.getBoundingClientRect().height-20;

  var canvas = document.createElement("canvas");
  setAttributes(canvas, {"id":layer, "style":"padding:10px 20px;"});
      canvas.width = width;
      canvas.height = height;
  var ctx = canvas.getContext("2d");
  var chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chart_data.labels[0],
        datasets: ChartJSBarDatasets("parents", chart_data.datas.length, chart_data)
      },
      options: ChartJSOptions("parents"),
    });
    parent_div.appendChild(canvas);

    plot_chart_objects[poster_num]['parents'][layer] = chart;
}

function focusBarChartJS(stage, chart_data, layer){

    var leave_div = document.getElementById(stage)
    var canvas_div = document.createElement("div")
    var resolution = (window.devicePixelRatio>=1)? 150:200;
    setAttributes(canvas_div, {"id":layer, "class":"annoBox", "style":"width:"+resolution+"px"});
    leave_div.appendChild(canvas_div)
    
    var canvas = document.createElement("canvas");
        canvas.width = resolution;
        canvas.height = resolution;
    var ctx = canvas.getContext("2d");
    var title_text = ""; //Object.values(chart_data.filters[0]).join("_")
    
    $( "#"+layer ).draggable();
    //console.log(chart_data);
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chart_data.labels[0],
          datasets: ChartJSBarDatasets("leaves", chart_data.datas.length, chart_data)
        },
        options: ChartJSOptions("leaves",title_text),
    });
    var textbox = TextBoxDiv(chart_data, layer);
    document.getElementById(layer).appendChild(canvas);
    document.getElementById(layer).appendChild(textbox);

    plot_chart_objects[parseInt(layer.substring(0))]['leaves'][layer] = chart;
}