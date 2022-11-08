function drawCollage(tree_structure,chart_datas){
    all_chart_data = chart_datas;
    //console.log(all_chart_data);
    //console.log(tree_structure);
    collage_user_logs = {
        curr_dataset: curr_dataset,
        charts: all_chart_data,
        pages: [],
        captions: [],
    }
    var max_depth = [];
    const clusters = generateCluster(tree_structure, max_depth);
    Global_Clusters = clusters;
    max_depth.sort(function(a, b){
        return (b.depth - a.depth);
    })
    var infoGroup = generateLayer(max_depth, clusters);

    //console.log(infoGroup);

    anychart.onDocumentReady(function () {
        console.log("drawCollage");

        all_user_captions = new Array(Global_InfoGroup.length).fill().map((e,i) => {
            return {headline:{text:"",source:""}, viewTitles:{main:[], parents:[]},overall_facts:{text:[],filter:[]},story:""}});

        for(var num=0;num<infoGroup.length;num++){
            plot_chart_objects.push({'parents':[],'main':[],'leaves':[]});
            curr_poster_layout.push(1);
            collage_user_logs.pages.push({
                info: infoGroup[num],
                layout: [{num: 1,
                          origin_theme: [Global_InfoGroup[num].theme[0].cluster],
                          theme: new Array(Math.max(...Global_InfoGroup[num].total_clusters)+1).fill().map((e,i) => {
                            return {origin:{scale:0, annoBox:[]}, final:{scale:0, annoBox:[]}, canvas_info:""}})

                }],
            });
            AddContainer(num);
            generateNewPoster(num, infoGroup[num]);
        }
        FindAllTheme();
    });
}

function generateNewPoster(num, info){
    loader(true);
    HeadlineDiv(num);

    var main_stage = "main_container_"+num;
    var focusDataPoint = findFocus(info.leaves);
    drawMajorPlot(main_stage, num, info.main, focusDataPoint);

    var parent_stage = "parent_chart_div_"+num;
    drawGeneralPlot(parent_stage, num, info.parents);

    var leave_stage = "leave_chart_div_"+num;
    drawDetailPlot(leave_stage, num, info.leaves);
}

function updatePoster(main_c_id){
    var poster_num = curr_poster_num;
    
    var layout_length = collage_user_logs.pages[poster_num].layout.length;
    collage_user_logs.pages[poster_num].layout[layout_length-1].origin_theme.push(main_c_id);
    
    closeNav();
    // console.log(main_c_id);
    document.getElementById('nextTheme_'+poster_num).value = main_c_id;
    clearPosterView(poster_num);
    
    var find = findIndexOfArrayObj(Global_InfoGroup[poster_num].theme, ['cluster'], [main_c_id]);
    generateNewPoster(poster_num, Global_InfoGroup[poster_num].theme[find].info);
}

function clearPosterView(poster_num){
    // remove leaderline
    var leader_line = document.getElementsByClassName('leader-line');
    try{
        while(leader_line) leader_line[0].remove();
    }catch(exception){}

    var main_chart_div = document.getElementById('main_chart_div_'+poster_num);
    while (main_chart_div.lastElementChild) {
        main_chart_div.lastChild.remove();
    }
    var parent_chart_div = document.getElementById('parent_chart_div_'+poster_num);
    for(var i=0; i<parent_chart_div.children.length; i++){
        if(parent_chart_div.children[0].className == "chartjs-size-monitor") parent_chart_div.children[0].remove();
    }
    while (parent_chart_div.lastElementChild) {
        parent_chart_div.lastChild.remove();
    }
    var headline_div = document.getElementById('headline_div_'+poster_num);
    while (headline_div.lastElementChild) {
        headline_div.lastChild.remove();
    }
    var leave_chart_div = document.getElementById('leave_chart_div_'+poster_num);
    while (leave_chart_div.lastElementChild) {
        leave_chart_div.lastChild.remove();
    }
    var story_div = document.getElementById('story_div_'+poster_num);
    while (story_div.lastElementChild.id !== "textarea") {
        story_div.lastChild.remove();
    }
    
    all_user_captions = new Array(Global_InfoGroup.length).fill().map((e,i) => {
        return {headline:{text:"",source:""}, viewTitles:{main:[], parents:[]},overall_facts:{text:[],filter:[]},story:""}});
    unique_color_model = {"y_axis":[], "filter":[]};
}

function saveSVGFeatures(poster_num, canvas_info, weight, lineStartDiv, drawLeave){
    // console.log('poster_num',poster_num, canvas_info)
    data = {'canvas': canvas_info, 'weight':weight}
    annoBox_infos[poster_num] = {'canvas': canvas_info, 'weight':weight, 'lineStartDiv':lineStartDiv};
    
    // save svg features
    if(drawLeave == true){
        $.ajax({
            type: 'POST',
            url:"http://127.0.0.1:5000/save_svgfeatures",
            data:JSON.stringify(data)
        }).done(function(responce){
            // console.log('scaleMain')
            scaleMain(responce[0], poster_num)
            // console.log('moveLeafChart')
            moveLeafChart(poster_num, canvas_info, responce[1], responce[0])
            // console.log("Save SVG Features");
            if(document.getElementById('list_topics_'+poster_num).childElementCount < Global_InfoGroup[poster_num].total_clusters.length){
                tmp_screenshot(poster_num)
            }
            for(var i=0; i<lineStartDiv.length; i++){
                var leave = document.getElementById(poster_num+'page_leave'+i);
                drawForceLine(poster_num, leave, lineStartDiv[i]);
            }
            loader(false);
            if(poster_num != curr_poster_num){
                document.getElementById('poster_'+poster_num).style.display="none";
            }
            saveUserCaptions(poster_num);
        });
    }else{
        for(var i=0; i<lineStartDiv.length; i++){
            var leave = document.getElementById(poster_num+'page_leave'+i);
            drawForceLine(poster_num, leave, lineStartDiv[i]);
        }
    }
}

function moveLeafChart(poster_num, canvas_info, leafPos, scale){
    var mainDivBound = document.getElementById("main_container_0").getBoundingClientRect();
    var posterDivBound = document.getElementById("poster_0").getBoundingClientRect();
    //console.log(poster_num, leafPos, mainDivBound, posterDivBound);

    var layout_length = collage_user_logs.pages[poster_num].layout.length;
    var theme_value = document.getElementById('nextTheme_'+poster_num).value;
    collage_user_logs.pages[poster_num].layout[layout_length-1].theme[theme_value].canvas_info = canvas_info;
    collage_user_logs.pages[poster_num].layout[layout_length-1].theme[theme_value].origin.scale = scale;
    
    for(var i=0; i<leafPos.length; i++){
        var leave = document.getElementById(poster_num+'page_leave'+i);

        var x = (mainDivBound.x-posterDivBound.x) + leafPos[i][0]; // 位移用算的?
        var y = (mainDivBound.y-posterDivBound.y) + leafPos[i][1]; // 位移用算的?

        leave.style.position = "absolute";
        leave.style.inset = y+"px auto auto "+x+"px";
        //console.log("move: ", x, y);

        collage_user_logs.pages[poster_num].layout[layout_length-1].theme[theme_value].origin.annoBox[i] =[x, y];
        collage_user_logs.pages[poster_num].layout[layout_length-1].theme[theme_value].final.annoBox[i] =[x, y];
    }
    if(leafPos.length == 0){
        var leaves = document.getElementById('leave_chart_div_'+poster_num);
        for(var i=0; i<leaves.childElementCount; i++){
            var leave = leaves.children[i];
            var x = mainDivBound.x + 300*(i+1);
            var y = mainDivBound.y;
            leave.style.position = "absolute";
            leave.style.inset = y+"px auto auto "+x+"px";
        }
    }
}

function drawForceLine(poster_num, leave, lineStartDiv){
    var path_type = ['grid','magnet','fluid','arc','straight']

    var line = new LeaderLine(leave,lineStartDiv,{
            startPlug: "arrow1",
            endPlug: "behind",
            size: 3,
            startPlugSize: 1,
            endPlugSize: 1,
            startSocket: 'auto',
            endSocket: 'auto',
            color: "#e9931c",
            dash: false,
            path: "grid"
        }
    );

    leave.addEventListener('click', function(){ 
        var path_id = path_type.findIndex(path => path === line.path);
        line.show();
        line.path = path_type[(path_id+1)%5];
    });
    leave.addEventListener('dblclick', function (e) {
        line.hide();
    });

    var draggable = new PlainDraggable(leave, {
        onMove: function() {
            line.position();
        },
        onMoveStart: function() { line.dash = {animation: true}; },
        onDragEnd: function() {
            line.dash = false;
            
            //console.log(leave.style.inset);
            //console.log(leave.id);
            var page_num = parseInt(leave.id.slice(0,1));
            var leave_id = parseInt(leave.id.slice(-1));
            var y = parseInt(leave.style.inset.split("px")[0]);
            var x = parseInt(leave.style.inset.split(" ")[3].split("px")[0]);
            var layout_length = collage_user_logs.pages[page_num].layout.length;
            var theme_value = document.getElementById('nextTheme_'+page_num).value;
            collage_user_logs.pages[page_num].layout[layout_length-1].theme[theme_value].final.annoBox[leave_id] = [x,y];
        }
    });


}

function cleanObjectLabels(chart_datas){
    var item = chart_datas
    Object.entries(item).forEach(([key,value]) => {
        if(["invoice_month", "month", "Month"].includes(value.x)){
            value.labels = value.labels.map(element => month_abbrev[element]);
        }
    })
    return item
}

function findFocus(leaveCharts){
    var focusDataPoint = []
    for(var p=0; p<leaveCharts.length; p++){
        leave_chart_data = all_chart_data[leaveCharts[p]];
        if(leave_chart_data.expandType == "1"){
            focusDataPoint.push({"parent_x": all_chart_data[leave_chart_data.parent_chart_id].x, 
                             "parent_y": all_chart_data[leave_chart_data.parent_chart_id].y,
                             "parent_insight_key": leave_chart_data.parent_insight_key,
                             "parent_filter_value": Object.values(all_chart_data[leave_chart_data.parent_chart_id].filters).join(',')});
        }
        
    }
    return focusDataPoint
}

function generateCluster(tree_structure, max_depth){
    var clusters = [];
    
    for (const [key, value] of Object.entries(all_chart_data)) { 
        if(Object.keys(tree_structure).includes("#"+key)){ //(value.is_selected || key=="a_chart_1" )
            // group by same filter level, same filter key, and same type, x
            var push = false;
            var q_group = getKeyByValueinArray(Q_Group[curr_dataset], value.y.split("(")[0]);
            var tmp_pattern = [Object.keys(value.filters).length, value.x, q_group, value.type, Object.keys(value.filters).join('_')];
            if(Object.keys(value.filters).includes("Continent") && (value.x=="Country" || Object.keys(value.filters).includes("Country"))){
                tmp_pattern.push(value.filters.Continent[0]);
            }
            var filter_value = Object.values(value.filters).join(',');
            if(tmp_pattern[4] == '') tmp_pattern[4] = 'Overall';

            for(i=0; i<clusters.length; i++){
                if(arrayEquals(clusters[i]["pattern"],tmp_pattern)){
                    clusters[i]["charts"].push(key);
                    clusters[i]["expandType"].push(all_chart_data[key].expandType);
                    if(all_chart_data[key].expandType == '1'){
                        clusters[i]["chart_parent"].push(all_chart_data[key].parent_chart_id);
                        clusters[i]["filter_values"].push(filter_value);
                    }
                    push = true;
                    break;
                }
            }
            if(!push){
                clusters.push({"pattern":tmp_pattern,
                                "charts":[key],
                                "chart_parent":[all_chart_data[key].parent_chart_id],
                                "expandType": [all_chart_data[key].expandType],
                                "filter_values":[filter_value] });
            }
            if(tree_structure["#"+key].length === 0 && all_chart_data[key].expandType=='1'){
                max_depth.push({
                    chart: key,
                    used: false,
                    depth: Object.keys(value.filters).length
                })
            }
        }
    }

    return clusters;
}

function getClusterID(clusters, chart_id, key='charts'){
    var rt = [];
    for(var c=0; c<clusters.length; c++){
        if(clusters[c][key].includes(chart_id)){
            rt.push(c);
        }
    }
    if(rt.length > 0) return rt;
    else return [null];
}

function generateLayer(max_depth, clusters){
    var l=0, leave_c, main_c, parent_c;
    var info_group=[];
    for(var d=0; d < max_depth.length; d++){
        if(max_depth[d].used) continue;
        // find leaves
        var leave_c_id = getClusterID(clusters, max_depth[d].chart)[0];
        leave_c = clusters[leave_c_id];
        if(leave_c){ // not null
            info_group.push({"main":[], "leaves":leave_c.charts, "parents":[], "cluster_id":[leave_c_id], "main_c_id":0});
            leave_c.charts.forEach(function(cc, id){
                var max_depth_id = findIndexOfArrayObj(max_depth, ['chart'], [cc])
                if(max_depth_id > -1) max_depth[max_depth_id].used = true;
                // find main
                if(info_group[l].main.indexOf(leave_c.chart_parent[id]) === -1 && leave_c.expandType[id]=="1"){
                    var main_c_id = getClusterID(clusters, leave_c.chart_parent[id])[0];
                    if(info_group[l].cluster_id.indexOf(main_c_id) === -1) info_group[l].cluster_id.push(main_c_id);
                    info_group[l].main_c_id = main_c_id;
                    main_c = clusters[main_c_id];
                    if(main_c){
                        main_c.charts.forEach(function(cpc){
                            info_group[l].main.push(cpc);
                            max_depth_id = findIndexOfArrayObj(max_depth, ['chart'], [cpc]);
                            if(max_depth_id > -1) max_depth[max_depth_id].used = true;
                        });
                    }
                }
                // find parent
                parent_c = main_c;
                while(!parent_c.chart_parent.includes(undefined)){
                    parent_c.chart_parent.forEach(function(mcp){
                        var parent_c_id = getClusterID(clusters, mcp)[0];
                        // find comparison c from parent_c

                        var comparID = findIndexOfArrayObj(clusters, ["chart_parent","expandType"], [mcp,"2"]);
                        if(comparID !== -1 && !arrayAlreadyHasArray(info_group[l].parents, clusters[comparID])){
                            if(info_group[l].cluster_id.indexOf(comparID) === -1) {
                                info_group[l].cluster_id.push(comparID);
                                info_group[l].parents.push(clusters[comparID].charts);
                            }
                        }

                        if(info_group[l].cluster_id.indexOf(parent_c_id) === -1){
                            info_group[l].cluster_id.push(parent_c_id);
                        }
                        parent_c = clusters[parent_c_id];
                        if(parent_c && !arrayAlreadyHasArray(info_group[l].parents, parent_c.charts)){
                            info_group[l].parents.push(parent_c.charts);
                        }
                    })
                }
            });
            info_group[l].cluster_id.sort((a, b) => a - b);
        }
        Global_InfoGroup.push({
            total_clusters: info_group[l].cluster_id,
            theme: [{cluster: info_group[l].main_c_id, info: info_group[l]}]
        });
        l += 1;
    }
    return info_group;
}

function FindAllTheme(){
    for(var i=0; i<Global_InfoGroup.length; i++){
        var total_clusters = Global_InfoGroup[i].total_clusters;
        total_clusters.forEach(function(main_c_id){
            if(Global_InfoGroup[i].theme.map(item => Object.values(item)[0]).includes(main_c_id) == false){

                var leave_c=[], main_c=[], parent_c=[];
                var info_group = {"main":[], "leaves":[], "parents":[], "cluster_id":[], "main_c_id":main_c_id};

                // modify infoGroup:main,parent,leave
                var main_c = Global_Clusters[main_c_id];
                info_group.main = main_c.charts;
                info_group.cluster_id.push(main_c_id);
                //console.log(info_group.main);
                main_c.charts.forEach(function(c){
                    
                    var leave_c_id = getClusterID(Global_Clusters, c, key='chart_parent')[0];
                    if(leave_c_id){
                        leave_c = Global_Clusters[leave_c_id];
                        if(info_group.cluster_id.indexOf(leave_c_id) === -1) info_group.cluster_id.push(leave_c_id);
                        info_group.leaves = info_group.leaves.concat(leave_c.charts);
                    }
                });
                info_group.leaves = [...new Set(info_group.leaves)];
                //console.log(info_group.leaves);
                // find parent
                parent_c = main_c;
                while(!parent_c.chart_parent.includes(undefined)){
                    parent_c.chart_parent.forEach(function(mcp){
                        var parent_c_id = getClusterID(Global_Clusters, mcp)[0];
                        if(info_group.cluster_id.indexOf(parent_c_id) === -1) info_group.cluster_id.push(parent_c_id);
                        parent_c = Global_Clusters[parent_c_id];
                        if(parent_c && !arrayAlreadyHasArray(info_group.parents, parent_c.charts)){
                            info_group.parents.push(parent_c.charts);
                        }
                    });
                }
                //console.log(info_group.parents);
                info_group.cluster_id.sort((a, b) => a - b);
                Global_InfoGroup[i].theme.push({cluster: main_c_id, info: info_group});
            }
        })
    }
    //console.log(Global_InfoGroup)
}

function drawMajorPlot(stage, poster_num, mainChart, focusDataPoint, drawLeave=true){
    var main_div = document.getElementById("main_chart_div_"+poster_num);
    var main_chart_data = [];
    mainChart.forEach(function(chart) {
        main_chart_data.push(all_chart_data[chart]);
    })
    main_chart_data = combineChartData(main_chart_data);
    //console.log(main_chart_data);
    var title = all_user_captions[poster_num].viewTitles.main[0];
    title = title==null? Chart_Title(main_chart_data) : title;
    main_div.appendChild(viewTitleDiv(title));
    main_div.appendChild(zoomDiv());
    
    // overall container
    if(curr_poster_layout[curr_poster_num] == 3){
        overAllFacts(poster_num, main_chart_data, 'story_div')
    }else{
        overAllFacts(poster_num, main_chart_data, 'main_chart_div')
    }
    
    var container = document.createElement('div');
    setAttributes(container, {class:"main_container", id:"main_container_"+poster_num});
    main_div.appendChild(container);
    if(main_chart_data.x[0] == "city"){
        $.ajax({
            type: 'POST',
            url:"http://127.0.0.1:5000/get_taiwan_map",
            data:JSON.stringify([])
        }).done(function(responce){
            drawTaiwanMap(stage, poster_num, responce[0],responce[1],main_chart_data, mainChart.length, focusDataPoint, drawLeave);
        });
    }
    else if(["Country", "Continent", "Country/Region"].includes(main_chart_data.x[0])){
        $.ajax({
            type: 'POST',
            url:"http://127.0.0.1:5000/get_world_map",
            data:JSON.stringify(main_chart_data.x[0])
        }).done(function(responce){
            drawWorldMap(stage, poster_num, responce[0],responce[1],main_chart_data, mainChart.length, focusDataPoint, drawLeave);
        });
    }
    else if(main_chart_data.type[0] == "line"){
        stage = anychart.graphics.create(stage);
        AnyChartLineMain(stage, poster_num, main_chart_data, mainChart.length, focusDataPoint, drawLeave);
    }
    else if(main_chart_data.type[0] == "bar"){
        stage = anychart.graphics.create(stage);
        AnyChartBarMain(stage, poster_num, main_chart_data, mainChart.length, focusDataPoint, drawLeave);
    }else if(main_chart_data.type[0] == "doughnut"){
        stage = anychart.graphics.create(stage);
        AnyChartPieMain(stage, poster_num, main_chart_data, mainChart.length, focusDataPoint, drawLeave);
    }
    defaultStory(poster_num, main_chart_data, focusDataPoint);
    
}

function drawGeneralPlot(stage, poster_num, parentCharts){
    //console.log(parentCharts)
    // 最多只畫三個 parent chart
    var parent_div = document.getElementById(stage);
    for(var p=(parentCharts.length>3)? parentCharts.length-3:0; p<parentCharts.length; p++){
        var parent_chart_data = [];
        parentCharts[parentCharts.length-1-p].forEach(function(chart) {
            parent_chart_data.push(all_chart_data[chart]);
        })
        parent_chart_data = combineChartData(parent_chart_data);

        //console.log(parent_chart_data);
        var title = all_user_captions[poster_num].viewTitles.parents[p];
        title = title==null? Chart_Title(parent_chart_data) : title;
        var view = document.createElement('div');
        if(curr_poster_layout[curr_poster_num] == 1 || curr_poster_layout[curr_poster_num] == 2){
            var fix_height = (parentCharts.length<=2)? "height:49%":""
            setAttributes(view, {class:"view vertical", style:fix_height});
        }else{
            var fix_width = (parentCharts.length<=2)? "width:49%":""
            setAttributes(view, {class:"view horizontal", style:fix_width});
        }
        view.appendChild(viewTitleDiv(title));
        parent_div.appendChild(view);
        if(parent_chart_data.type[0] == "line"){
            parentLineChartJS(view, poster_num, parent_chart_data, "parent" + p.toString());
        }
        else if(parent_chart_data.type[0] == "bar"){
            parentBarChartJS(view, poster_num, parent_chart_data, "parent" + p.toString());
        }
        else if(parent_chart_data.type[0] == "doughnut"){
            parentPieChartJS(view, poster_num, parent_chart_data, "parent" + p.toString());
        }
    }
    if(parentCharts.length == 0){
        // if general plot is empty, change layout

    }
}

function drawDetailPlot(stage, poster_num, leaveCharts){
    var combine_leaves_charts = combineLeaves(leaveCharts);
    for(var p=0; p<combine_leaves_charts.length; p++){
        //leave_chart_data = all_chart_data[leaveCharts[p]];
        //console.log(leave_chart_data)
        if(leave_chart_data.type == "line"){
            focusLineChartJS(stage, combine_leaves_charts[p], poster_num+"page_leave"+p.toString());
        }
        else if(leave_chart_data.type == "bar"){
            focusBarChartJS(stage, combine_leaves_charts[p], poster_num+"page_leave"+p.toString());
        }else if(leave_chart_data.type == "doughnut"){
            focusPieChartJS(stage, combine_leaves_charts[p], poster_num+"page_leave"+p.toString())
        }
    }
    
}

function combineLeaves(leaveCharts){
    var combination_charts = {}
    leaveCharts.forEach(function(item){
        //console.log(all_chart_data[item])
        if(all_chart_data[item].expandType == "1" || leaveCharts.length == 1){
            var new_chart_datas = {};
            for (const [key, value] of Object.entries(all_chart_data[item])) {
                if(key=="datas"){
                    new_chart_datas[key] = [value[0]];
                }
                else if(key=="aggre" || key=="expandType" || key=="is_selected" || key=="multiple_yAxes" || key=="parent_chart_id" || key=="parent_insight_key" || key=="rank" || key=="rec" || key=="chart_index") continue;
                else{
                    new_chart_datas[key] = [value];
                }
            }
            combination_charts[item] = new_chart_datas;
        }
        else if(all_chart_data[item].expandType == "2"){
            for (const [key, value] of Object.entries(all_chart_data[item])) {
                var parent_chart_id = all_chart_data[item].parent_chart_id;
                if(key=="datas"){
                    combination_charts[parent_chart_id][key].push(value[0]);
                }
                else if(key=="aggre" || key=="expandType" || key=="is_selected" || key=="multiple_yAxes" || key=="parent_chart_id" || key=="parent_insight_key" || key=="rank" || key=="rec" || key=="chart_index") continue;
                else{
                    combination_charts[parent_chart_id][key].push(value);
                }
            }
        }
    });
    return Object.values(combination_charts);
}

function combineChartData(combine_chart_datas){
    var new_chart_datas = {};
    for (const [key, value] of Object.entries(combine_chart_datas[0])) {
        if(key=="datas"){
            new_chart_datas[key] = [value[0]];
            for(i=1; i<combine_chart_datas.length; i++){
                new_chart_datas[key].push(combine_chart_datas[i][key][0]);
            }
        }
        else if(key=="expandType" || key=="is_selected" || key=="multiple_yAxes" || key=="parent_chart_id" || key=="parent_insight_key" || key=="rank" || key=="rec") continue;
        else{
            new_chart_datas[key] = [value];
            for(i=1; i<combine_chart_datas.length; i++){
                new_chart_datas[key].push(combine_chart_datas[i][key]);
            }
        }
    }
    return new_chart_datas;
}

function Chart_Title(chart_datas){

    var x_ = (curr_dataset == "Transaction")? TR_labels[chart_datas.x[0]] : chart_datas.x[0];
    var y_ = "";
    var y_tmp = [];
    for(var i=0;i<chart_datas.y.length;i++){
        if(!y_tmp.includes(chart_datas.y[i].split("(")[0])){
            y_tmp.push(chart_datas.y[i].split("(")[0])
        }
    }
    for(var i=0;i<y_tmp.length;i++){
        y_ += (curr_dataset == "Transaction")? TR_labels[y_tmp[i]] : y_tmp[i]
        y_ += (i < y_tmp.length-1)? " & " : "" 
    }
    var title_name = ""
    if(Object.keys(chart_datas.filters[0]).length===0){
        title_name = y_+" by "+x_;
    }
    else{
        title_name = y_+" by "+x_;

        // Add the same filter to title
        var filter_value = []
        for(var i=0;i<chart_datas.filters.length;i++){
            filter_value.push(Object.values(chart_datas.filters[i]).join(', '))
        }
        //console.log(filter_value)
        if(allEqual(filter_value)){
            title_name += ", " + Object.values(chart_datas.filters[0]).join(', ');
        }
    }
    //console.log(title_name)
    return title_name;
}

function defaultStory(poster_num, main_chart_data, focusDataPoint){
    //console.log(main_chart_data)
    //console.log(focusDataPoint)
    var tmp = all_user_captions[poster_num].story;
    var story_div = document.getElementById('story_div_'+poster_num);
    var storyline = "", H_or_L = "highest";
    //highlight_text = {'M_column':[], 'rank':[], 'H_or_L':[]};
    if(tmp == ""){
        focusDataPoint.forEach(function(item, id){
            // find in main_chart_data
            var m = 0, rank = 0;
            for(var i=0; i<main_chart_data.y.length; i++){
                if(main_chart_data.y[i] == item.parent_y && main_chart_data.x[i] == item.parent_x && Object.values(main_chart_data.filters[i]).join(',') == item.parent_filter_value){
                    m = i;
                    var tmpSet = main_chart_data.labels[i].map(function(x, j){
                        return {"x": x, "y": main_chart_data.datas[i].data[j]};
                    });
                    var sortSet = tmpSet.sort(function(a, b){
                        return b.y - a.y;
                    })
                    rank = sortSet.findIndex(object => {
                        return object.x === item.parent_insight_key;
                    });
                    if(rank >= sortSet.length/2){
                        H_or_L = "lowest";
                        rank = sortSet.length - rank;
                    }else{
                        H_or_L = "highest";
                        rank += 1;
                    }
    
                    break;
                }
            }
            switch(rank){
                case 1:
                    rank = '';
                    break;
                case 2:
                    rank = 'second';
                    break;
                case 3:
                    rank = 'third';
                    break;
                default:
                    rank = rank+'th'
                    break;
            }
            var M_column = item.parent_y.split("(")[0];
            var D_column = item.parent_x;
            var D_value = (["invoice_month", "month", "Month"].includes(D_column))? month_abbrev[item.parent_insight_key]:item.parent_insight_key
            var F_value = item.parent_filter_value
            
            D_column = D_column.charAt(0).toUpperCase() + D_column.slice(1);
            storyline += D_column + " " + D_value + " in " + F_value +" has the " + rank + " " + H_or_L + " " + M_column + ". ";
        })
    }
    else{
        storyline = tmp;
    }

    if(storyline == "") storyline = "You can write the finding story here."
    story_div.getElementsByTagName('h4')[0].innerText = storyline;
}
