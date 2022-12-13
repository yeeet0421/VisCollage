const allEqual = arr => arr.every( v => v === arr[0] )
Array.prototype.unique = function(){
    return Array.from(new Set(this));
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
}

function indexOfAll(array, searchItem) {
    var i = array.indexOf(searchItem),
        indexes = [];
    while (i !== -1) {
      indexes.push(i);
      i = array.indexOf(searchItem, ++i);
    }
    return indexes;
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function getKeyByValueinArray(object, value){
    var searchKey = "";
    Object.keys(object).forEach((key) => {
        if(object[key].find(element => element === value)){
            searchKey= key;
        }
    })
    return searchKey;
}

function findIndexOfArrayObj(ArrObj, key=[], val=[]){
    var multiID = [];
    var onlyID = -1;
    for(var i=0; i<ArrObj.length; i++){
        if(key.length === 0){
            var allFounded = val.every(ai => ArrObj[i].values.includes(ai));
            // var isFounded = ArrObj[i].values.some(ai => val.includes(ai));
            if(allFounded) multiID.push(i);
        }else{
            var match = 0;
            for(var k=0; k<key.length; k++){
                if(ArrObj[i][key[k]] == val[k]) match++;
            }
            if(match == key.length){
                multiID.push(i);
                onlyID = i;
            }
        }
    }
    if(val.length === 0) return multiID;
    else return onlyID;
}

function arrayAlreadyHasArray(arr, testArr){
    for(var i = 0; i<arr.length; i++){
        let checker = []
        for(var j = 0; j<arr[i].length; j++){
            if(arr[i][j] === testArr[j]){
                checker.push(true)
            } else {
                checker.push(false)
            }
        }
        if (checker.every(check => check === true)){
            return true
        }
    }
    return false
}

/////////////// Generate Text ///////////////

/*function MatchDataPointLabels(data, base_label, label){
    var new_data = [];
    for(i=0; i<base_label.length; i++){
        var id = label.indexOf(base_label[i]);
        new_data.push(data[id]);
    }
    return new_data;
}*/

function legendLabelJoint(chart_data, i){
    var label_name = "";
    if(allEqual(chart_data.y)) label_name = "filter";
    else label_name = "yAxis";

    var filter_joint = Object.values(chart_data.filters[i]).join('_');
    var legend = chart_data.y[0].split("(")[0];

    
    if(label_name == "filter"){
        legend += filter_joint == ""? "" : "(" + filter_joint + ")";
    }else if(label_name == "yAxis"){
        legend = chart_data.y[i].split("(")[0];
    }
    return [legend, filter_joint];
}

function generateDataFact(chart_data){
    var filter_value = Object.values(chart_data.filters[0]).join("_");
    var data_fact = ""/*"In " + filter_value + ", "*/;
    for(var i=0; i<chart_data.y.length; i++){
        var y_encoding = chart_data.y[i].split("(")[0];
        var x_encoding = chart_data.x[i]
        var insight_min = getKeyByValue(chart_data.insights[i],"min");
        var insight_max = getKeyByValue(chart_data.insights[i],"max");
        data_fact += /*"("+x_encoding+") "+*/insight_max+" has the highest "+y_encoding+", and "+insight_min+" has the lowest "+y_encoding+". ";
    }
    return data_fact
}

function scaleMain(rate, poster_num){
    var main_div = document.querySelector("#main_chart_div_"+poster_num);
    var main_svg = main_div.querySelector('#main_svg');
    if(main_svg==null) main_svg = main_div.querySelector('.anychart-ui-support');
    main_svg.setAttribute("transform", "scale("+rate+")");
    var zoom_div = $('#main_chart_div_'+poster_num+' > #zoom_icon');
    zoom_div.data('value', rate);

    var layout_length = collage_user_logs.pages[poster_num].layout.length;
    var theme_value = document.getElementById('nextTheme_'+poster_num).value;
    collage_user_logs.pages[poster_num].layout[layout_length-1].theme[theme_value].final.scale = rate;
}

function zoomMain(in_or_out){
    var zoom_scale = [1, 0.95, 0.9, 0.85, 0.8];
    var zoom_div = $('#main_chart_div_'+curr_poster_num+' > #zoom_icon');
    // console.log("+++++++++++++++")
    // console.log(zoom_div.data())
    // console.log("+++++++++++++++")
    var now_zoom = zoom_div.data('value');
    var scale_id = zoom_scale.indexOf(now_zoom)
    if(in_or_out === 1){ // zoom in
        if(scale_id > 0){
            scaleMain(zoom_scale[scale_id-1], curr_poster_num);
        }
    }else if(in_or_out === 2){ // zoom out
        if(scale_id < 4){
            scaleMain(zoom_scale[scale_id+1], curr_poster_num);
        }
    }
}

/////////////// Create HTML DIV ///////////////
function TextBoxDiv(chart_data, layer){
    var textbox = document.createElement("div");
    //setAttributes(textbox, {"id":layer+"_textbox", "style":"width:200px; height:100px; background-color:transparent; border: none; font-size:14px; display:inline-block;"});
    //textbox.value = generateDataFact(chart_data);
    var resolution = (window.devicePixelRatio>=1)? 130:180;
    setAttributes(textbox, {id:layer+"_textbox", style:"width:"+resolution+"px; height:auto; max-height:80px; Overflow:auto; text-align:left; display:inline-block;"});
    var facttext = document.createElement("div");
    setAttributes(facttext, {contenteditable:"true", id:"textarea", style:"font-size: 12px;"});
    facttext.innerHTML = generateDataFact(chart_data);
    textbox.appendChild(facttext);
    return textbox;
}

function HeadlineDiv(poster_num){
    var headline_div = document.getElementById("headline_div_"+poster_num);
    var tmp = ""
    var p1 = document.createElement("div");
    setAttributes(p1, {id:"headline_title", contenteditable:"true"});
    // console.log("all_user_captions", all_user_captions,"poster_num", poster_num,"all_user_captions[poster_num]", all_user_captions[poster_num], "all_user_captions[poster_num].headline", all_user_captions[poster_num].headline, "all_user_captions[poster_num].headline.text",all_user_captions[poster_num].headline.text)
    tmp = all_user_captions[poster_num].headline.text;
    // console.log('headline_text',headline_text,'curr_dataset',curr_dataset,'headline_text[curr_dataset]', headline_text[curr_dataset])
    p1.innerHTML = (tmp=="")? headline_text[curr_dataset].text : tmp;
    var p2 = document.createElement("div");
    setAttributes(p2, {id:"headline_source", contenteditable:"true"});
    tmp = all_user_captions[poster_num].headline.source;
    p2.innerHTML = (tmp=="")? headline_text[curr_dataset].source_date : tmp;

    headline_div.appendChild(p1);
    headline_div.appendChild(p2);
}

function LogoDiv(poster_num){
    var logo = document.createElement('div');
    setAttributes(logo, {id:"logo"});
    var img = document.createElement('img');
    setAttributes(img, {src:"icons/viscollage_logo.png", alt:"logo"});
    var p = document.createElement('p');
    p.innerHTML = "VisCollage";
    logo.appendChild(img);
    logo.appendChild(p);

    return logo;
}

function NextThemeBtn(poster_num){
    var nextTheme = document.createElement('button');
    var main_c_id = Global_InfoGroup[poster_num].theme[0].cluster;

    //setAttributes(nextTheme, {id:'nextTheme_'+poster_num, class:'circular ui icon button', onclick:'updatePoster()', value:''+main_c_id, style:'position:absolute; bottom:1rem; left:1rem;'});
    setAttributes(nextTheme, {id:'nextTheme_'+poster_num, class:'circular ui icon button', onclick:'openNav()', value:''+main_c_id, style:'position:absolute; bottom:1rem; left:1rem;'});
    var icon = document.createElement('i');
    setAttributes(icon, {class:'caret square right icon'});
    nextTheme.appendChild(icon);
    return nextTheme;
}
function PaletteBtn(poster_num){
    var button = document.createElement('button');
    setAttributes(button, {id:'palette_btn', class:'circular ui icon button', onclick:'openPalette()', style:'position:absolute; bottom:1rem; right:50px;'});
    var icon = document.createElement('i');
    setAttributes(icon, {class:'paint brush icon'});
    button.appendChild(icon); 
    
    return button;
}
function PaletteDiv(poster_num){
    var palette = document.createElement('div');
    setAttributes(palette, {id:"palette", style:"display:none;"});
    var examples = document.createElement('div');
    setAttributes(examples, {class:"examples", id:"examples_container"});

    var button = document.createElement('button');
    setAttributes(button, {id:'confirm_color', class:'circular ui icon button', onclick:'changeColor()', style:'position:absolute; top:5px; right:5px;'});
    var icon = document.createElement('i');
    setAttributes(icon, {class:'check icon'});
    button.appendChild(icon); 

    palette.appendChild(examples);
    palette.appendChild(button)
    return palette;
}
function openPalette(){
    /*
    var examples = document.getElementById("examples_container");
    if(document.getElementById('palette').style.display == "none"){
        for(var i=0; i<unique_color_model.y_axis.length; i++){
            var y_axis = unique_color_model.y_axis[i];
            for (const [key, value] of Object.entries(unique_color_model.filter[i])) {
                var example = addColorEdit(y_axis + (key==""? "(overall)":"("+ key+")"), value);
                examples.appendChild(example);
            }
        }
        document.getElementById('palette').style.display = 'block';
    }else{
        var child = examples.lastElementChild; 
        while (child) {
            examples.removeChild(child);
            child = examples.lastElementChild;
        }
        document.getElementById('palette').style.display = 'none';
    }
    */
}
function addColorEdit(stringText, colorCode){
    var example = document.createElement('div');
    setAttributes(example, {class:"example full"});
    var clr_field = document.createElement('div');
    setAttributes(clr_field, {class:"clr-field", style:"color:"+colorCode});
    var input = document.createElement('input');
    setAttributes(input, {type:"text", class:"coloris", value:colorCode});
    var colorText = document.createElement('div');
    setAttributes(colorText, {style:"float:left; font-size:10px;"});
    colorText.innerHTML = stringText;
    
    clr_field.innerHTML = '<button type="button" aria-labelledby="clr-open-label"></button>';
    clr_field.appendChild(input);
    example.appendChild(clr_field);
    example.appendChild(colorText);

    return example;
}
function SaveLogsBtn(poster_num){
    var button = document.createElement('button');
    setAttributes(button, {id:'save_logs', class:'circular ui icon button', onclick:'saveCollageLogs()', style:'position:absolute; bottom:1rem; right:10px;'});
    var icon = document.createElement('i');
    setAttributes(icon, {class:'save icon'});
    button.appendChild(icon);
    return button;
}
function saveCollageLogs(){
    
    saveUserCaptions(curr_poster_num)
    collage_user_logs.captions = all_user_captions;

    $.ajax({
        type: 'POST',
        url:"http://127.0.0.1:5000/save_collage_logs",
        data:JSON.stringify(collage_user_logs)
    }).done(function(responce){
        //screenshot(curr_poster_num);
        console.log('Save collage user logs!')
    });

    alert('You have saved collage logs.');
}
function SideNavDiv(poster_num){
    var sidenav = document.createElement('div');
    setAttributes(sidenav, {id:"sidenav_"+poster_num, class:"sidenav"});
    var navText = document.createElement('div');
    setAttributes(navText, {class:"navText"});
    navText.innerHTML = "Select Topic";
    var closenav = document.createElement('a');
    setAttributes(closenav, {href:"javascript:void(0)", class:"closenav", onclick:"closeNav()"})
    closenav.innerHTML = "&times;"
    var listTopics = document.createElement('div');
    setAttributes(listTopics, {id:"list_topics_"+poster_num, sylte:"text-align:center; padding: 5px;"});

    sidenav.appendChild(navText);
    sidenav.appendChild(closenav);
    sidenav.appendChild(listTopics);
    return sidenav;
}

function zoomDiv(){
    var zoom_icon = document.createElement('div');
    setAttributes(zoom_icon, {id:"zoom_icon", 'data-value':1});

    var zoom_in = document.createElement('button');
    setAttributes(zoom_in, {class:'ui icon button', onclick:"zoomMain(1)", style:"border:none;background:none;"});
    var i = document.createElement('i');
    setAttributes(i, {class:'large zoom-in icon'});
    zoom_in.appendChild(i);
    var zoom_out = document.createElement('button');
    setAttributes(zoom_out, {class:'ui icon button', onclick:"zoomMain(2)", style:"border:none;background:none;"});
    var i = document.createElement('i');
    setAttributes(i, {class:'large zoom-out icon'});
    zoom_out.appendChild(i);

    zoom_icon.appendChild(zoom_in);
    zoom_icon.appendChild(zoom_out);

    return zoom_icon;
}

function viewTitleDiv(title){
    var view_title = document.createElement('div');
    setAttributes(view_title, {id:"view_title", contenteditable:"true", style:"background-color:#a66914;"});
    view_title.innerHTML = title;

    return view_title;
}

function overAllFacts(poster_num, main_chart_data, div_name){
    var main_div = document.getElementById(div_name+'_' +poster_num);

    var overall_facts = document.createElement('div');
    setAttributes(overall_facts, {class:"overall_facts"});

    for(var i=0; i<main_chart_data.y.length; i++){
        // find max value and label
        var max_value = Math.max(...main_chart_data.datas[i].data)
        var percent_text = Math.round(max_value / main_chart_data.datas[i].data.reduce((a, b) => a + b, 0)*1000)/10;
        var label_text = main_chart_data.labels[i][main_chart_data.datas[i].data.indexOf(max_value)];
        if(["invoice_month", "month", "Month"].includes(main_chart_data.x[i])){
            label_text = month_abbrev[label_text];
        }
        var filter_text = [];
        for (const [key, value] of Object.entries(main_chart_data.filters[i])) {
            if(key=='month' || key =="invoice_month" || key=="Month"){
                filter_text.push(month_abbrev[value[0]]);
            }else{
                filter_text.push(value[0]);
            }
        }
        filter_text = filter_text.join(', ')

        // create elements
        var oneFact = document.createElement('div');
        var w = Math.floor(100/main_chart_data.y.length, 0)-1;
        if(curr_poster_layout[curr_poster_num] == 3){
            setAttributes(oneFact, {id:"oneFact", style:"width:100%;"});
        }else{
            if(main_chart_data.y.length<=2){
                setAttributes(oneFact, {id:"oneFact", style:"width:49%;"});
            }else{
                setAttributes(oneFact, {id:"oneFact", style:"width:33%;"});
            }
        }
        
        var img = document.createElement('img');
        // console.log('seems to be? ',main_chart_data.y[i].split("(")[0])
        setAttributes(img, {src: Q_icon_path[main_chart_data.y[i].split("(")[0]],
                            onmouseover:"hoverImg(this);", onmouseout:"unhoverImg(this);"});

        var button = document.createElement('button');
        setAttributes(button, {id:'close_overall', class:'circular mini ui icon button', style:'position:absolute; top:0; left:0; display: none;', 
                                onclick:'closeOverall(this)'});
        var icon = document.createElement('i');
        setAttributes(icon, {class:'close icon'});
        button.appendChild(icon); 

        var oneFactText = document.createElement('div');
        setAttributes(oneFactText, {id:"oneFactText"});
        var fact = document.createElement('div');
        setAttributes(fact, {id:"fact", contenteditable:"true"});
        var highlight_fact = document.createElement('div');
        setAttributes(highlight_fact, {id:"highlight_fact", contenteditable:"true"});
        highlight_fact.innerHTML = percent_text + '%';
        fact.appendChild(highlight_fact);
        fact.innerHTML += 'in ' + label_text;

        var filter_fact = document.createElement('div');
        setAttributes(filter_fact, {id:'filter_fact', contenteditable:"true"});
        filter_fact.innerHTML = (filter_text!=="")? 'in ' + filter_text : "Overall";

        oneFactText.appendChild(fact);
        oneFactText.appendChild(filter_fact);

        oneFact.appendChild(img);
        oneFact.appendChild(oneFactText);
        oneFact.appendChild(button);

        overall_facts.appendChild(oneFact);
    }
    main_div.appendChild(overall_facts);
}
function closeOverall(element){
    var oneFactDiv = element.parentElement;
    oneFactDiv.remove();
    var overall_facts = document.querySelector("#main_chart_div_"+curr_poster_num+" > .overall_facts");
    if(overall_facts.childElementCount == 0){
        overall_facts.remove();
        var main_container = document.querySelector("#main_container_"+curr_poster_num);
        main_container.style.height = '92%';
    }
}
function hoverImg(element){
    var oneFact = element.parentElement;
    oneFact.querySelector("#close_overall").style.display = 'block';
    //element.style.visibility = 'visible';
}
function unhoverImg(element){
    var oneFact = element.parentElement;
    oneFact.querySelector("#close_overall").style.display = 'none';
    //element.style.visibility = 'hidden';
}
/////////////// Create Poster Layout ///////////////
function AddContainer(poster_num){
    var poster_view = document.getElementById('poster_view');
    var poster_banner = document.getElementById('poster_banner');

    // poster tag
    var tag = document.createElement('button')
    var button_class = (poster_num === 0)? "ui inverted active button":"ui inverted button";
    setAttributes(tag, {"class":button_class, "tabindex":poster_num, "id":"P"+poster_num, "style":"float:right;"})
    tag.innerHTML = "Poster"+poster_num;
    poster_banner.appendChild(tag);

    // new poster container
    var new_poster = document.createElement('div')
    setAttributes(new_poster, {"class": "design1", "id": "poster_"+poster_num, "style":"display:block; width:100%; height:97%; position:relative;"});/*width:100%; height:97%; */
    
    var inline = document.createElement('div');
    setAttributes(inline, {style:"display:inline-flex; width: 100%; height: 99%;  border-radius:20px; border: solid #a44c3c;"});
    
    //// left canvas
    var left_canvas = document.createElement('div');
    setAttributes(left_canvas, {class:"left_canvas"});

    // logo and header
    var logo = LogoDiv(poster_num);
           
    // headline container
    var headline_div = document.createElement('div');
    setAttributes(headline_div, {class:"headline_div bottomline", id:"headline_div_"+poster_num});
    

    // parent container
    var parent_div = document.createElement('div');
    setAttributes(parent_div, {class:"parent_chart_div", id:"parent_chart_div_"+poster_num});

    // select theme
    var nextTheme = NextThemeBtn(poster_num);

    left_canvas.appendChild(logo);
    left_canvas.appendChild(headline_div);
    left_canvas.appendChild(parent_div);
    left_canvas.appendChild(nextTheme);

    //// right canvas
    var right_canvas = document.createElement('div');
    setAttributes(right_canvas, {class:"right_canvas"});

    // main container
    var main_div = document.createElement('div');
    setAttributes(main_div, {class:"main_chart_div bottomline", id:"main_chart_div_"+poster_num});

    // story container
    var story_div = document.createElement('div');
    setAttributes(story_div, {class:"story_div", id:"story_div_"+poster_num});
    var storyline = document.createElement("h4");
    setAttributes(storyline, {"contenteditable":"true", "id":"textarea", "style":"font-weight:bold;line-height:1.5;"});
    storyline.innerHTML = "You can write the finding story here.";
    story_div.appendChild(storyline);

    var leave_div = document.createElement('div');
    setAttributes(leave_div, {id:"leave_chart_div_"+poster_num});

    // save collage logs
    var saveLogs = SaveLogsBtn(poster_num);
    var paletteBtn = PaletteBtn(poster_num);
    var paletteDiv = PaletteDiv(poster_num);

    right_canvas.appendChild(main_div);
    right_canvas.appendChild(story_div);
    right_canvas.appendChild(saveLogs);
    right_canvas.appendChild(paletteBtn);
    right_canvas.appendChild(paletteDiv);

    inline.appendChild(left_canvas);
    inline.appendChild(right_canvas);

    // sideNav
    var sidenav = SideNavDiv(poster_num);

    new_poster.appendChild(inline);
    new_poster.appendChild(sidenav);
    new_poster.appendChild(leave_div);

    poster_view.appendChild(new_poster);
}
function EditPosterLayout(layout_num){
    var poster_num = curr_poster_num;
    var poster_view = document.getElementById('poster_'+poster_num);
    var leader_line = document.getElementsByClassName('leader-line');
    
    saveUserCaptions(poster_num);

    try{
        while(leader_line) leader_line[0].remove();
    }catch(exception){}

    while(poster_view.children[0]){
        poster_view.children[0].remove();
    }    

    collage_user_logs.pages[poster_num].layout.push({
        num: layout_num,
        origin_theme: [Global_InfoGroup[poster_num].theme[0].cluster],
        theme: new Array(Math.max(...Global_InfoGroup[poster_num].total_clusters)+1).fill().map((e,i) => {
            return {origin:{scale:0, annoBox:[]}, final:{scale:0, annoBox:[]}, canvas_info:""}})
    });

    switch(layout_num){
        case 1:
            poster_view.className = "design1";
            var inline = document.createElement('div');
            setAttributes(inline, {style:"display:inline-flex; width: 100%; height: 99%;  border-radius:20px; border: solid #a44c3c;"});
            
            //// left canvas
            var left_canvas = document.createElement('div');
            setAttributes(left_canvas, {class:"left_canvas"});

            // logo and header
            var logo = LogoDiv(poster_num);
           
            // headline container
            var headline_div = document.createElement('div');
            setAttributes(headline_div, {class:"headline_div bottomline", id:"headline_div_"+poster_num});

            // parent container
            var parent_div = document.createElement('div');
            setAttributes(parent_div, {class:"parent_chart_div", id:"parent_chart_div_"+poster_num});

            // select theme
            var nextTheme = NextThemeBtn(poster_num);
            
            left_canvas.appendChild(logo);
            left_canvas.appendChild(headline_div);
            left_canvas.appendChild(parent_div);
            left_canvas.appendChild(nextTheme);

            //// right canvas
            var right_canvas = document.createElement('div');
            setAttributes(right_canvas, {class:"right_canvas"});

            // main container
            var main_div = document.createElement('div');
            setAttributes(main_div, {class:"main_chart_div bottomline", id:"main_chart_div_"+poster_num});

            // story container
            var story_div = document.createElement('div');
            setAttributes(story_div, {class:"story_div", id:"story_div_"+poster_num});
            var storyline = document.createElement("h4");
            setAttributes(storyline, {"contenteditable":"true", "id":"textarea", "style":"font-weight:bold;line-height:1.5;"});
            storyline.innerHTML = "You can write the finding story here.";
            story_div.appendChild(storyline);
            
            var leave_div = document.createElement('div');
            setAttributes(leave_div, {id:"leave_chart_div_"+poster_num});

            // save collage logs
            var saveLogs = SaveLogsBtn(poster_num);
            var paletteBtn = PaletteBtn(poster_num);
            var paletteDiv = PaletteDiv(poster_num);

            right_canvas.appendChild(main_div);
            right_canvas.appendChild(story_div);
            right_canvas.appendChild(saveLogs);
            right_canvas.appendChild(paletteBtn);
            right_canvas.appendChild(paletteDiv);

            inline.appendChild(left_canvas);
            inline.appendChild(right_canvas);

            // sideNav
            var sidenav = SideNavDiv(poster_num);

            poster_view.appendChild(inline);
            poster_view.appendChild(sidenav);
            poster_view.appendChild(leave_div);

            break;
        case 2:
            poster_view.className = "design1";
            var inline = document.createElement('div');
            setAttributes(inline, {style:"display:inline-flex; width: 100%; height: 99%;  border-radius:20px; border: solid #a44c3c;"});
            
            //// left canvas
            var left_canvas = document.createElement('div');
            setAttributes(left_canvas, {class:"left_canvas", style:"width:60%;"});

            // main container
            var main_div = document.createElement('div');
            setAttributes(main_div, {class:"main_chart_div bottomline", id:"main_chart_div_"+poster_num});

            // story container
            var story_div = document.createElement('div');
            setAttributes(story_div, {class:"story_div", id:"story_div_"+poster_num});
            var storyline = document.createElement("h4");
            setAttributes(storyline, {"contenteditable":"true", "id":"textarea", "style":"font-weight:bold;line-height:1.5;"});
            storyline.innerHTML = "You can write the finding story here.";
            story_div.appendChild(storyline);

            var leave_div = document.createElement('div');
            setAttributes(leave_div, {id:"leave_chart_div_"+poster_num});

            // select theme
            var nextTheme = NextThemeBtn(poster_num);
            
            left_canvas.appendChild(main_div);
            left_canvas.appendChild(story_div);
            left_canvas.appendChild(nextTheme);

            //// right canvas
            var right_canvas = document.createElement('div');
            setAttributes(right_canvas, {class:"right_canvas", style:"width:40%;"});

            // logo and header
            var logo = LogoDiv(poster_num);
            
            // headline container
            var headline_div = document.createElement('div');
            setAttributes(headline_div, {class:"headline_div bottomline", id:"headline_div_"+poster_num});

            // parent container
            var parent_div = document.createElement('div');
            setAttributes(parent_div, {class:"parent_chart_div", id:"parent_chart_div_"+poster_num});

            // save collage logs
            var saveLogs = SaveLogsBtn(poster_num);
            var paletteBtn = PaletteBtn(poster_num);
            var paletteDiv = PaletteDiv(poster_num);

            right_canvas.appendChild(logo);
            right_canvas.appendChild(headline_div);
            right_canvas.appendChild(parent_div);
            right_canvas.appendChild(saveLogs);
            right_canvas.appendChild(paletteBtn);
            right_canvas.appendChild(paletteDiv);

            inline.appendChild(left_canvas);
            inline.appendChild(right_canvas);

            // sideNav
            var sidenav = SideNavDiv(poster_num);
            
            poster_view.appendChild(inline);
            poster_view.appendChild(sidenav);
            poster_view.appendChild(leave_div);

            break;
        case 3:
            poster_view.className = "design0";
            var inline = document.createElement('div');
            setAttributes(inline, {style:"width: 100%; height: 99%;  border-radius:20px; border: solid #a44c3c;"});
            
            // logo and header
            var logo = LogoDiv(poster_num);
           
            // headline container
            var headline_div = document.createElement('div');
            setAttributes(headline_div, {class:"headline_div bottomline", id:"headline_div_"+poster_num});

            //// upper canvas
            var upper_canvas = document.createElement('div');
            setAttributes(upper_canvas, {class:"upper_canvas"});

            // parent container
            var parent_div = document.createElement('div');
            setAttributes(parent_div, {class:"parent_chart_div", id:"parent_chart_div_"+poster_num});

            upper_canvas.appendChild(parent_div);

            //// lower canvas
            var lower_canvas = document.createElement('div');
            setAttributes(lower_canvas, {class:"lower_canvas"});

            // main container
            var main_div = document.createElement('div');
            setAttributes(main_div, {class:"main_chart_div bottomline", id:"main_chart_div_"+poster_num});

            // story container
            var story_div = document.createElement('div');
            setAttributes(story_div, {class:"story_div", id:"story_div_"+poster_num});
            var storyline = document.createElement("h4");
            setAttributes(storyline, {"contenteditable":"true", "id":"textarea", "style":"font-weight:bold;line-height:1.5;"});
            storyline.innerHTML = "You can write the finding story here.";
            story_div.appendChild(storyline);

            var leave_div = document.createElement('div');
            setAttributes(leave_div, {id:"leave_chart_div_"+poster_num});

            // select theme
            var nextTheme = NextThemeBtn(poster_num);
            // save collage logs
            var saveLogs = SaveLogsBtn(poster_num);
            var paletteBtn = PaletteBtn(poster_num);
            var paletteDiv = PaletteDiv(poster_num);

            lower_canvas.appendChild(main_div);
            lower_canvas.appendChild(story_div);
            lower_canvas.appendChild(nextTheme);
            lower_canvas.appendChild(saveLogs);
            lower_canvas.appendChild(paletteBtn);
            lower_canvas.appendChild(paletteDiv);

            var clear_div = document.createElement('div');
            setAttributes(clear_div, {style:"clear:both;"});

            inline.appendChild(logo);
            inline.appendChild(headline_div);
            inline.appendChild(upper_canvas);
            inline.appendChild(clear_div);
            inline.appendChild(lower_canvas);

            // sideNav
            var sidenav = SideNavDiv(poster_num);

            poster_view.appendChild(inline);
            poster_view.appendChild(sidenav);
            poster_view.appendChild(leave_div);

    }
    console.log("poster_num: ",poster_num, " Global_InfoGroup: ", Global_InfoGroup, " Global_InfoGroup[poster_num]: ", Global_InfoGroup[poster_num], " Global_InfoGroup[poster_num].theme[0]: ",Global_InfoGroup[poster_num].theme[0], " Global_InfoGroup[poster_num].theme[0].info: ", Global_InfoGroup[poster_num].theme[0].info)
    generateNewPoster(poster_num, Global_InfoGroup[poster_num].theme[0].info);
}

function saveUserCaptions(poster_num){
    var poster_div = document.getElementById("poster_"+poster_num);
    all_user_captions[poster_num].headline.text = poster_div.querySelector("#headline_div_"+poster_num+" > #headline_title").innerText;
    all_user_captions[poster_num].headline.source = poster_div.querySelector("#headline_div_"+poster_num+" > #headline_source").innerText;
    var main_div = document.getElementById("main_chart_div_"+poster_num);
    all_user_captions[poster_num].viewTitles.main = [...main_div.querySelectorAll("#view_title")].map(({innerText})=>innerText);
    var parent_div = document.getElementById("parent_chart_div_"+poster_num);
    all_user_captions[poster_num].viewTitles.parents = [...parent_div.querySelectorAll("#view_title")].map(({innerText})=>innerText);

    var overall_facts = poster_div.querySelector(".overall_facts").children
    for(var i=0; i<overall_facts.length; i++){
        var text = overall_facts[i].querySelector("#oneFactText > #fact").innerText;
        var filter = overall_facts[i].querySelector("#oneFactText > #filter_fact").innerText
        all_user_captions[poster_num].overall_facts.text.push(text);
        all_user_captions[poster_num].overall_facts.filter.push(filter);
    }

    all_user_captions[poster_num].story = poster_div.querySelector(".story_div > #textarea").innerText;
}

/* Set the width of the side navigation to 250px */
function openNav() {
    // 打開Theme nav之前，先看過所有的可能並截圖
    var now_c_id, main_c_id, poster_num = curr_poster_num;
    if(document.getElementById('list_topics_'+poster_num).childElementCount < Global_InfoGroup[poster_num].total_clusters.length){
        now_c_id = parseInt(document.getElementById('nextTheme_'+curr_poster_num).value);

        var total_clusters = Global_InfoGroup[curr_poster_num].total_clusters;
        main_c_id = total_clusters[(total_clusters.findIndex(id => id === now_c_id)+1)%total_clusters.length];
        updatePoster(main_c_id);
    }
    else{
        document.getElementById("sidenav_"+curr_poster_num).style.width = "300px";
        document.getElementById("sidenav_"+curr_poster_num).style.border = "2px solid #a44c3c";
    }
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("sidenav_"+curr_poster_num).style.width = "0";
    document.getElementById("sidenav_"+curr_poster_num).style.border = "none";
}

/* screenshot canvas to put in side nav */
function tmp_screenshot(poster_num){
    console.log('screenshot')
    html2canvas(document.getElementById('poster_'+poster_num)).then(function(canvas) {
        var img_div = document.createElement('div');
        var now_c_id = parseInt(document.getElementById('nextTheme_'+poster_num).value);
        setAttributes(img_div, {class:"topic_item", onclick:"updatePoster("+now_c_id+")", id:"clusterid_"+now_c_id});
        canvas.style.width = '250px';
        canvas.style.height = 'auto';
        canvas.style.border = "1px solid #a44c3c";
        img_div.appendChild(canvas);
        var text = document.createElement('div');
        setAttributes(text, {class:"topic_descrip"});
        text.innerHTML = Global_Clusters[now_c_id].pattern[2] + " by " + Global_Clusters[now_c_id].pattern[1];
      
        img_div.appendChild(text)
        document.getElementById('list_topics_'+poster_num).appendChild(img_div);
    });
}

function getAbsPosition(el){
    var el2 = el;
    var curtop = 0;
    var curleft = 0;
    var curwidth = el.offsetWidth;
    var curheight = el.offsetHeight;
    if ((document.getElementById || document.all) && el.offsetParent) {
        do  {
            curleft += el.offsetLeft-el.scrollLeft;
            curtop += el.offsetTop-el.scrollTop;
            el = el.offsetParent;
            el2 = el2.parentNode;
            while (el2 != el) {
                curleft -= el2.scrollLeft;
                curtop -= el2.scrollTop;
                el2 = el2.parentNode;
            }
        } while (el.offsetParent);

    } else if (document.layers) {
        curtop += el.y;
        curleft += el.x;
    }
    return [curleft, curtop, curwidth, curheight];
};

/////////////// Color Controller ///////////////
var fullColorHex = function(rgb) {   
    rgb = rgb.split("(")[1].split(",")
    var r = parseInt(rgb[0]);
    var g = parseInt(rgb[1]);
    var b = parseInt(rgb[2].split(")")[0]);
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);
    return '#'+red+green+blue;
};
var rgbToHex = function (rgb) { 
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};
function changeColor(){
    var palette = document.getElementsByClassName('example full');
    for(var i=0; i<palette.length; i++){
      var rgb = palette[i].children[0].style.color;
      //console.log(fullColorHex(rgb));
    }
}
function getListGradientColor(color, num){
    var colorset = []
    for(i=0; i<num; i++){
        if(num<10) colorset.push(increase_brightness(color,i*10));
        else colorset.push(increase_brightness(color,i*100/num));
    }
    //console.log(colorset);
    return colorset;
}
function increase_brightness(hex, percent){
    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if(hex.length == 3){
        hex = hex.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
       ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

function unique_color(y_axis, filter_joint=""){
    var color = "";
    y_axis = y_axis.split("(")[0];
    if(unique_color_model.y_axis.indexOf(y_axis) === -1){
        unique_color_model.y_axis.push(y_axis);
        var color_id = unique_color_model.y_axis.indexOf(y_axis)
        color = category_color[color_id][0];
        unique_color_model.filter.push({});
        unique_color_model.filter[color_id][filter_joint] = color;
        unique_color_model.filter[color_id][""] = color;
    }
    else{
        var color_id = unique_color_model.y_axis.indexOf(y_axis);
        // find whether the filter label has already exist
        if(unique_color_model.filter[color_id].hasOwnProperty(filter_joint)){
            color = unique_color_model.filter[color_id][filter_joint]
        }
        else{
            // ex. "2019_6" is substring in ["2019", "2014"]
            const match = Object.keys(unique_color_model.filter[color_id]).find(element => {
                if(filter_joint.includes(element) || element.includes(filter_joint)){
                    return element;
                }
            })
            if(match !== undefined){
                color = unique_color_model.filter[color_id][match];
            }
            else{
                var filter_length = Object.keys(unique_color_model.filter[color_id]).length;
                color = category_color[color_id][filter_length];
                unique_color_model.filter[color_id][filter_joint] = color;
            }
        }
    }
    return color;
}

/////////////// Draw Chart Options ///////////////
function MainBackgroundStyle(num, width, height, x_axis, y_axis){
    var style = [{
        "defaultXAxisSettings": {
            "title": {
            enabled: true,
            text: x_axis,
            fontColor: poster_color.main.text,
            fontFamily: FONT,
            fontSize: 18
            },
            "labels": {
            enabled: true,
            fontColor: poster_color.main.text,
            height: 30,
            vAlign: "middle",
            wordWrap: "break-word",
            wordBreak: "break-all"
            }
        },
        "defaultYAxisSettings": {
            "title": {
                enabled: true,
                text: y_axis,
                fontColor: poster_color.main.text,
                fontFamily: FONT,
                fontSize: 18
            },
            "labels": {
                enabled: true,
                fontColor: poster_color.main.text,
                format: function(){
                    var value = this.value;
                    if(value>=1000 && value<1000000){
                    return parseInt(value / 1000).toString() + "K" ;
                    }else if(value>=1000000 && value<1000000000){
                    return parseFloat(value / 1000000).toString() + "M" ;
                    }else if(value>=1000000000){
                    return parseFloat(value / 1000000000).toString() + "B" ;
                    }
                    return value;
                },
            }
        },
        "yAxis": {
            ticks: null,
            minorTicks: null,
            stroke: poster_color.main.text,
            fontFamily: FONT,
            fontSize: 15
        },
        "yScale": {
            //maximum: 100,
            //ticks: {
            //interval: 20,
            //}
        },
        "xAxis": {
            stroke: poster_color.main.text,
            fontFamily: FONT,
            fontSize: 15
        },
        "xScale": {
            //type: 'ordinal',
            //names: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        "background":{
            fill: poster_color.main.background, //["#406181", "#6DA5DB"]
            opacity: 0.5
            //angle: 90
        },
        "palette": {
            //type: "distinct",
            //items: ["#9f8170", "#000", "#911e42", "#21421e"]
        },
        "bounds": [0, 0, '100%', '100%']
    }]
    return style[num];
}

function ChartJSLineDatasets(layer, nChart, chart_data){
    var dataset = []
    var radius = (layer==="parents")? 5 : 1;

    for(i=0; i<nChart; i++){
        var filter_joint = Object.values(chart_data.filters[i]).join('_');
        var tmp = {
            label: chart_data.y[i].split("(")[0]+((filter_joint=="")? "":"("+filter_joint+")"),
            borderColor: unique_color(chart_data.y[i], filter_joint),
            data: chart_data.datas[i].data,
            fill: false,
            pointRadius: radius,
            pointBackgroundColor: unique_color(chart_data.y[i], filter_joint),
            pointStyle: 'circle',
        };
        dataset.push(tmp)
    }
    return dataset;
}

function ChartJSBarDatasets(layer, nChart, chart_data){
    var labels = chart_data.labels[0];
    var dataset = []
    for(i=0; i<nChart; i++){
        var filter_joint = Object.values(chart_data.filters[i]).join('_');
        if(i==0){
            var tmp = {
                label: chart_data.y[i].split("(")[0]+ ((filter_joint=="")? "":"("+filter_joint+")"),
                backgroundColor: unique_color(chart_data.y[i], filter_joint),
                data: chart_data.datas[i].data,
            };
        }else{
            var reorder_data = [];
            for(j=0;j<labels.length;j++){
                var id = chart_data.labels[i].findIndex(item => item===labels[j]);
                reorder_data.push(chart_data.datas[i].data[id]);
            }
            var tmp = {
                label: chart_data.y[i].split("(")[0]+ ((filter_joint=="")? "":"("+filter_joint+")"),
                backgroundColor: unique_color(chart_data.y[i], filter_joint),
                data: reorder_data,
            };
        }
        dataset.push(tmp)
    }
    return dataset;
}

function ChartJSPieDatasets(layer, nChart, chart_data){
    var labels = chart_data.labels[0];
    var dataset = []
    for(i=0; i<nChart; i++){
        var filter_joint = Object.values(chart_data.filters[i]).join('_');
        var color = unique_color(chart_data.y[i], filter_joint);
        var num = chart_data.datas[i].data.length;
        if(i==0){
            var tmp = {
                label: chart_data.y[i].split("(")[0]+((filter_joint=="")? "":"("+filter_joint+")"),
                data: chart_data.datas[i].data,
                backgroundColor: getListGradientColor(color, num),
            };
        }else{
            var reorder_data = [];
            for(j=0;j<labels.length;j++){
                var id = chart_data.labels[i].findIndex(item => item===labels[j]);
                reorder_data.push(chart_data.datas[i].data[id]);
            }
            var tmp = {
                label: chart_data.y[i].split("(")[0],
                backgroundColor: getListGradientColor(color, num),
                data: reorder_data,
            };
        }
        dataset.push(tmp)
    }
    return dataset;
}

function ChartJSOptions(layer, title_text="", x_text="", y_text="", showLegend=true){
    var options = {
        plugins: {
            title: {
                display: (title_text=="")? false:true,
                text: title_text,
                padding: {
                    top: 10,
                    bottom: 30
                }
            },
          zoom: {
            pan: {
                enabled: true,
                mode: 'x',
                rangeMin: {
                    y: 0
                },
            },
            zoom: {
                enabled: true,
                sensitivity: 0.001,
                speed: 10,
                mode: 'x',
                rangeMin: {
                    y: 0
                },
                rangeMax: {
                    y: 500
                },
                
            }
          },
          datalabels: {
              display: false,
          }
        },
        legend: {
          display: showLegend,
          labels: {
            fontSize: 10,
            usePointStyle: true,
          },
          position: 'bottom'
        },
        tooltips:{
            displayColors: false,
        },
        scales: {
          yAxes: [{
              ticks: {
                  min: 0,
                  fontColor: "#888888",
                  fontSize: (layer=="parents")? 12 : (layer=="leaves")? 10 : 12,
                  autoSkip: true,
                  maxTicksLimit: (layer=="parents")? 8: (layer=="leaves")? 8 : "",
              },
              scaleLabel: {
                display: (y_text==="")? false : true,
                labelString: y_text,
                fontStyle: "bold"
              },
              grid: {
                display: false
              },
              afterTickToLabelConversion : function (q){
                  for(var tick in q.ticks){
                      var value = parseInt(q.ticks[tick]) 
                      if(value>=1000 && value<1000000){
                          q.ticks[tick] = parseInt(value / 1000).toString() + "K" ;
                      }else if(value>=1000000 && value<1000000000){
                          q.ticks[tick] = parseFloat(value / 1000000).toString() + "M" ;
                      }else if(value>=1000000000){
                          q.ticks[tick] = parseFloat(value / 1000000000).toString() + "B" ;
                      }
                  }
              }
          }],
          xAxes: [{
              ticks: {
                  fontColor: "#888888",
                  fontSize: (layer=="parents")? 12 : (layer=="leaves")? 10 : 12,
                  autoSkip: true,
                  maxTicksLimit: (layer=="parents")? 13 : (layer=="leaves")? 8 : "",
              },
              scaleLabel: {
                display: (x_text==="")? false : true,
                labelString: x_text,
                fontStyle: "bold"
              },
              grid: {
                display: false
              },
              afterTickToLabelConversion : function(q){
                  for(var tick in q.ticks){
                      if(q.ticks[tick].length>10){
                        q.ticks[tick] = q.ticks[tick].substring(0,6) + '...';
                      }
                  }
              }
          }]
        },
      }
      return options;
}
