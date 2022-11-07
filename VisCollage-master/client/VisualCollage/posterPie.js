function AnyChartPieMain(stage, poster_num, chart_data, nChart, focusDataPoint, drawLeave){
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

        // set chart_2
        var chart = anychart.pie(datas);

        // set chart padding
        chart.padding([10, 20, 10, 20]);

        // create range color palette with color ranged between light blue and dark blue
        var filter_joint = Object.values(chart_data.filters[0]).join('_');
        var color = unique_color(chart_data.y[0], filter_joint);

        var palette = anychart.palettes.rangeColors();
        palette.items([{ color: color }, { color: increase_brightness(color,90) }]);

        chart.innerRadius("40%").palette(palette);

        var label = anychart.standalones.label();
        label.text(chart_data.x[0]);
        label.width("100%");
        label.height("100%");
        label.fontColor(poster_color.main.text);
        label.fontSize(15);
        label.hAlign("center");
        label.vAlign("middle");

        var tooltip = chart.tooltip();
  	    tooltip.enabled(false);
        tooltip.format("{%x}, {%value}");
        tooltip.fontColor("white");

        var tooltipBackground = chart.tooltip().background();
        tooltipBackground.fill("#406181");
        tooltipBackground.stroke("white");
        tooltipBackground.cornerType("round");
        tooltipBackground.corners(4);

        chart.center().content(label);

        chart.interactivity().hoverMode('single');

        // set container id for the chart
        chart.container(stage);
        chart.animation(false);
  
        // initiate chart drawing
        chart.draw();

        // Calculate Regions and Leaf Placement
        var info = AnyChartPieBBox(poster_num, datas, insight_id, [divBound.x, divBound.y]);
        canvas_info['regions'] = info[0]
        canvas_info['insights'] = info[1];

        plot_chart_objects[poster_num]['main'][stage] = chart;
        saveSVGFeatures(poster_num, canvas_info, 1, info[2], drawLeave);
    });
}
function AnyChartPieBBox(poster_num, datas, insight_id, startXY){
    var articles_element = document.querySelectorAll('[role="article"]');
    var g = articles_element[0].getElementsByTagName("g");
    var regions = [];
    var insight_center = [];
    var gCount = 0;
    var lineStartDiv = [];

    var bbox = g[4].getBBox();
    regions.push({'points':[bbox.x, bbox.y, bbox.width, bbox.height], 'alpha':0.5});

    for(var c=0; c<datas.length;c++){
        if(datas[c][1]>0){
            bbox = g[4].children[c].getBBox();
            var find = findIndexOfArrayObj(insight_id, ['nChart','dPoint'], [gCount, c]);
            if(find >= 0){
                //regions.push({'points':[bbox.x-bbox.width*1.5, bbox.y-bbox.height*1.5, bbox.width*3, bbox.height*3], 'alpha':1});
                lineStartDiv[find] = g[4].children[c];
                insight_center[find] = [bbox.x+bbox.width/2, bbox.y+bbox.height/2];
            }
        }
    }
    for(var i=0; i<g.length; i++){
        if(g[i].getAttribute("transform")){
            var bbox = g[i].getBoundingClientRect();
            regions.push({'points':[bbox.x-startXY[0], bbox.y-startXY[1], bbox.width, bbox.height], 'alpha':0.5});
        }
    } 
    return [regions, insight_center, lineStartDiv];
}
function parentPieChartJS(parent_div, poster_num, chart_data, layer){

    var width = parent_div.getBoundingClientRect().width;
    var height = parent_div.getBoundingClientRect().height-20;
  
    var canvas = document.createElement("canvas");
    setAttributes(canvas, {"id":layer, "style":"padding:10px 20px;"});
        canvas.width = width;
        canvas.height = height;
    var ctx = canvas.getContext("2d");
    var chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: chart_data.labels[0],
          datasets: ChartJSPieDatasets("parents", chart_data.datas.length, chart_data)
        },
        options: ChartJSPieOptions("", chart_data.x, "", (chart_data.labels[0].length>8)?false:true),
      });
    parent_div.appendChild(canvas);

    plot_chart_objects[poster_num]['parents'][layer] = chart;
}

function ChartJSPieOptions(title_text="", x_text="", y_text="", showLegend=true){
    var options={
        plugins: {
            datalabels: {
                color: 'white',
                display: true,
                formatter: function(value, context){
                    if(context.dataIndex<3) {
                        return context.chart.data.labels[context.dataIndex].substring(0,8);
                    }
                    else return "";
                },

            }
        },
        legend: {
            display: false,
            labels: {
                fontSize: 12,
                usePointStyle: true,
            },
            position: 'right',
        },
        elements: {
            center:{
                text: x_text,
                fontSize: 12,
            }
        },
        title: {
            display: true,
            text: (title_text=="")? "" : "Percentage of " + title_text,
            fontColor: "gray"
        },
        tooltips:{
            displayColors: false,
            callbacks:{
                title:function(tooltipItem,data){
                    let title = data.labels[tooltipItem[0].index];
                    return title;
                },
                label:function(tooltipItem, data){
                    let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return Math.floor(value*100) + "%";
                }
            }
        }
    }
    return options;
}

function focusPieChartJS(stage, chart_data, layer){
    var leave_div = document.getElementById(stage)
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
        type: 'doughnut',
        data: {
          labels: chart_data.labels[0],
          datasets: ChartJSPieDatasets("leaves", chart_data.datas.length, chart_data)
        },
        options: ChartJSPieOptions("", chart_data.x, "", (chart_data.labels[0].length>8)?false:true),
      });

    var textbox = TextBoxDiv(chart_data, layer);
    document.getElementById(layer).appendChild(canvas);
    document.getElementById(layer).appendChild(textbox);

    plot_chart_objects[poster_num]['parents'][layer] = chart;
}