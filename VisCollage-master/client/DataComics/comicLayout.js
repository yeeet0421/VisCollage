function determineLayout(layoutData){
    var comics_view = document.getElementById('comics_view');

    var storyPiece;
    layoutData.forEach(function(item, index){
        switch(item.mst.groupSize){
            case 1:
                storyPiece = oneNode(item, index);
                break;
            case 2:
                storyPiece = twoNodes(item, index);
                break;
            case 3:
                if(item.mst.children.length == 1) storyPiece = threeNodesLinear(item, index);
                else storyPiece = threeNodesBranch(item, index);
                break;
            case 4:
                if(item.mst.children.length == 1){
                    if(item.mst.children[0].children.length == 1) {
                        storyPiece = fourNodesLinear(item, index);
                    } else {
                        storyPiece = oneNode(item, index);
                    }
                } else if(item.mst.children.length == 2){
                    if(item.mst.children[0].children.length == 1) {
                        storyPiece = fourNodesLeftUnequalBranch(item, index);
                    } else {
                        storyPiece = fourNodesRightUnequalBranch(item, index);
                    }
                } else {
                    storyPiece = fourNodesEqualBranch(item, index);
                }
                break;
            default:
                storyPiece = oneNode(item, index);
        }
        comics_view.appendChild(storyPiece);
    });
}

function oneNode(data, index){
    var piece = document.createElement("div");
    setAttributes(piece, {"class":"single-motif-container", "id":"piece"+index});
    var sortedDataFacts, textPanel, visPanel;

    //// Left ////
    var leftId  = document.createElement("div");
    setAttributes(leftId, {"id":"leftId", "class":"split single-node-container", "style":"width: 49.5%; height: 99%; display: inline-block;"});
    var leftTitlePanelId = document.createElement("div");
    setAttributes(leftTitlePanelId, {"id":"leftTitlePanelId", "class":"split"});
    var leftVisPanelId  = document.createElement("div");
    setAttributes(leftVisPanelId, {"id":"leftVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.chartInfo);
    leftTitlePanelId.appendChild(titlePanel);


    // Insert Vis
    visPanel = drawVis(data.mst.chartInfo, leftVisPanelId);
    leftVisPanelId.appendChild(visPanel);
 
    leftId.appendChild(leftTitlePanelId);
    leftId.appendChild(leftVisPanelId);

    //// Right ////
    var rightId  = document.createElement("div");
    setAttributes(rightId, {"id":"rightId", "class":"split single-node-container", "style":"width: 49.5%; height: 99%; display: inline-block;"});
    var rightTextPanelId  = document.createElement("div");
    setAttributes(rightTextPanelId, {"id":"rightTextPanelId", "class":"split"});

    // Insert Text
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.chartInfo.dataFacts
    });
    data.mst.chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightTextPanelId.appendChild(textPanel);

    rightId.appendChild(rightTextPanelId);

    // Combine
    piece.appendChild(leftId);
    piece.appendChild(rightId);
    return piece;
}

function twoNodes(data, index){
    var piece = document.createElement("div");
    setAttributes(piece, {"class":"single-motif-container", "id":"piece"+index});
    var sortedDataFacts, textPanel, visPanel;

    //// Left ////
    var leftId  = document.createElement("div");
    setAttributes(leftId, {"id":"leftId", "class":"split single-node-container", "style":"width: 49.5%; height: 99%; display: inline-block;"});
    var leftTextPanelId  = document.createElement("div");
    setAttributes(leftTextPanelId, {"id":"leftTextPanelId", "class":"split"});
    var leftTitlePanelId = document.createElement("div");
    setAttributes(leftTitlePanelId, {"id":"leftTitlePanelId", "class":"split"});
    var leftVisPanelId  = document.createElement("div");
    setAttributes(leftVisPanelId, {"id":"leftVisPanelId", "class":"split"});
    
    // Insert title
    titlePanel = drawTitle(data.mst.chartInfo);
    leftTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
    });
    data.mst.chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    leftTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.chartInfo, leftVisPanelId);
    leftVisPanelId.appendChild(visPanel);
    
    leftId.appendChild(leftTextPanelId);
    leftId.appendChild(leftTitlePanelId);
    leftId.appendChild(leftVisPanelId);

    //// Right ////
    var rightId  = document.createElement("div");
    setAttributes(rightId, {"id":"rightId", "class":"split single-node-container", "style":"width: 49.5%; height: 99%; display: inline-block;"});
    var rightTextPanelId  = document.createElement("div");
    setAttributes(rightTextPanelId, {"id":"rightTextPanelId", "class":"split"});
    var rightTitlePanelId = document.createElement("div");
    setAttributes(rightTitlePanelId, {"id":"rightTitlePanelId", "class":"split"});
    var rightVisPanelId  = document.createElement("div");
    setAttributes(rightVisPanelId, {"id":"rightVisPanelId", "class":"split"});
    
    // Insert title
    titlePanel = drawTitle(data.mst.children[0].chartInfo);
    rightTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.chartInfo.dataFacts,
    });
    data.mst.children[0].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[0].chartInfo, rightVisPanelId);
    rightVisPanelId.appendChild(visPanel);
    
    rightId.appendChild(rightTextPanelId);
    rightId.appendChild(rightTitlePanelId);
    rightId.appendChild(rightVisPanelId);

    // Combine
    piece.appendChild(leftId);
    piece.appendChild(rightId);
    return piece;
}

function threeNodesBranch(data, index){
    var piece = document.createElement("div");
    setAttributes(piece, {"class":"single-motif-container", "id":"piece"+index});
    var sortedDataFacts, textPanel, visPanel;

    //// Left ////
    var leftId  = document.createElement("div");
    setAttributes(leftId, {"id":"leftId", "class":"split single-node-container one-view", "style":"width: 49.5%; height: 99%; display: inline-block;"});
    var leftTextPanelId  = document.createElement("div");
    setAttributes(leftTextPanelId, {"id":"leftTextPanelId", "class":"split"});
    var leftTitlePanelId = document.createElement("div");
    setAttributes(leftTitlePanelId, {"id":"leftTitlePanelId", "class":"split"});
    var leftVisPanelId  = document.createElement("div");
    setAttributes(leftVisPanelId, {"id":"leftVisPanelId", "class":"split"});
    
    // Insert title
    titlePanel = drawTitle(data.mst.chartInfo);
    leftTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
        secondRelatedChartDataFacts: data.mst.children[1].chartInfo.dataFacts
    });
    data.mst.chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    leftTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.chartInfo, leftVisPanelId);
    leftVisPanelId.appendChild(visPanel);
    
    leftId.appendChild(leftTextPanelId);
    leftId.appendChild(leftTitlePanelId);
    leftId.appendChild(leftVisPanelId);

    //// Right ////
    var rightId  = document.createElement("div");
    setAttributes(rightId, {"id":"rightId", "class":"split", "style":"width: 49.5%; height: 100%; display: inline-block;"});
    // Right Upper
    var rightUpperId = document.createElement("div");
    setAttributes(rightUpperId, {"id":"rightUpperId", "class":"split single-node-container", "style":"width: 99%; height: 49%;"});
    var rightUpperTextPanelId  = document.createElement("div");
    setAttributes(rightUpperTextPanelId, {"id":"rightUpperTextPanelId", "class":"split"});
    var rightUpperTitlePanelId = document.createElement("div");
    setAttributes(rightUpperTitlePanelId, {"id":"rightUpperTitlePanelId", "class":"split"});
    var rightUpperVisPanelId  = document.createElement("div");
    setAttributes(rightUpperVisPanelId, {"id":"rightUpperVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[0].chartInfo);
    rightUpperTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.chartInfo.dataFacts,
    });
    data.mst.children[0].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightUpperTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[0].chartInfo, rightUpperVisPanelId);
    rightUpperVisPanelId.appendChild(visPanel);

    rightUpperId.appendChild(rightUpperTextPanelId);
    rightUpperId.appendChild(rightUpperTitlePanelId);
    rightUpperId.appendChild(rightUpperVisPanelId);

    // Right Bottom
    var rightBottomId = document.createElement("div");
    setAttributes(rightBottomId, {"id":"rightBottomId", "class":"split single-node-container", "style":"width: 99%; height: 49%;"});
    var rightBottomTextPanelId  = document.createElement("div");
    setAttributes(rightBottomTextPanelId, {"id":"rightBottomTextPanelId", "class":"split"});
    var rightBottomTitlePanelId = document.createElement("div");
    setAttributes(rightBottomTitlePanelId, {"id":"rightBottomTitlePanelId", "class":"split"});
    var rightBottomVisPanelId  = document.createElement("div");
    setAttributes(rightBottomVisPanelId, {"id":"rightBottomVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[1].chartInfo);
    rightBottomTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[1].chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.chartInfo.dataFacts,
    });
    data.mst.children[1].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightBottomTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[1].chartInfo, rightBottomVisPanelId);
    rightBottomVisPanelId.appendChild(visPanel);

    rightBottomId.appendChild(rightBottomTextPanelId);
    rightBottomId.appendChild(rightBottomTitlePanelId);
    rightBottomId.appendChild(rightBottomVisPanelId);

    rightId.appendChild(rightUpperId);
    rightId.appendChild(rightBottomId);

    // Combine
    piece.appendChild(leftId);
    piece.appendChild(rightId);
    return piece;
}

function threeNodesLinear(data, index){
    var piece = document.createElement("div");
    setAttributes(piece, {"class":"single-motif-container", "id":"piece"+index});
    var sortedDataFacts, textPanel, visPanel;

    //// Left ////
    var leftId  = document.createElement("div");
    setAttributes(leftId, {"id":"leftId", "class":"split single-node-container", "style":"width: 33%; height: 99%; display: inline-block;"});
    var leftTextPanelId  = document.createElement("div");
    setAttributes(leftTextPanelId, {"id":"leftTextPanelId", "class":"split"});
    var leftTitlePanelId = document.createElement("div");
    setAttributes(leftTitlePanelId, {"id":"leftTitlePanelId", "class":"split"});
    var leftVisPanelId  = document.createElement("div");
    setAttributes(leftVisPanelId, {"id":"leftVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.chartInfo);
    leftTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
    });
    data.mst.chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    leftTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.chartInfo, leftVisPanelId);
    leftVisPanelId.appendChild(visPanel);
    
    leftId.appendChild(leftTextPanelId);
    leftId.appendChild(leftTitlePanelId);
    leftId.appendChild(leftVisPanelId);

    //// Middle ////
    var middleId  = document.createElement("div");
    setAttributes(middleId, {"id":"middleId", "class":"split single-node-container", "style":"width: 33%; height: 99%; display: inline-block;"});
    var middleTextPanelId  = document.createElement("div");
    setAttributes(middleTextPanelId, {"id":"middleTextPanelId", "class":"split"});
    var middleTitlePanelId = document.createElement("div");
    setAttributes(middleTitlePanelId, {"id":"middleTitlePanelId", "class":"split"});
    var middletVisPanelId  = document.createElement("div");
    setAttributes(middletVisPanelId, {"id":"middletVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[0].chartInfo);
    middleTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.chartInfo.dataFacts,
        secondRelatedChartDataFacts: data.mst.children[0].children[0].chartInfo.dataFacts
    });
    data.mst.children[0].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    middleTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[0].chartInfo, middletVisPanelId);
    middletVisPanelId.appendChild(visPanel);
    
    middleId.appendChild(middleTextPanelId);
    middleId.appendChild(middleTitlePanelId);
    middleId.appendChild(middletVisPanelId);

    //// Right ////
    var rightId  = document.createElement("div");
    setAttributes(rightId, {"id":"rightId", "class":"split single-node-container", "style":"width: 33%; height: 99%; display: inline-block;"});
    var rightTextPanelId  = document.createElement("div");
    setAttributes(rightTextPanelId, {"id":"rightTextPanelId", "class":"split"});
    var rightTitlePanelId = document.createElement("div");
    setAttributes(rightTitlePanelId, {"id":"rightTitlePanelId", "class":"split"});
    var rightVisPanelId  = document.createElement("div");
    setAttributes(rightVisPanelId, {"id":"rightVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[0].children[0].chartInfo);
    rightTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[0].children[0].chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.children[0].chartInfo.dataFacts
    });
    data.mst.children[0].children[0].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[0].children[0].chartInfo, rightVisPanelId);
    rightVisPanelId.appendChild(visPanel);
    
    rightId.appendChild(rightTextPanelId);
    rightId.appendChild(rightTitlePanelId);
    rightId.appendChild(rightVisPanelId);

    // Combine
    piece.appendChild(leftId);
    piece.appendChild(middleId);
    piece.appendChild(rightId);
    return piece;
}

function fourNodesEqualBranch(data, index){
    var piece = document.createElement("div");
    setAttributes(piece, {"class":"single-motif-container", "id":"piece"+index});
    var sortedDataFacts, textPanel, visPanel;

    //// Left ////
    var leftId  = document.createElement("div");
    setAttributes(leftId, {"id":"leftId", "class":"split single-node-container", "style":"width: 49.5%; height: 99%; display: inline-block;"});
    var leftTextPanelId  = document.createElement("div");
    setAttributes(leftTextPanelId, {"id":"leftTextPanelId", "class":"split"});
    var leftTitlePanelId = document.createElement("div");
    setAttributes(leftTitlePanelId, {"id":"leftTitlePanelId", "class":"split"});
    var leftVisPanelId  = document.createElement("div");
    setAttributes(leftVisPanelId, {"id":"leftVisPanelId", "class":"split"});
    
    // Insert title
    titlePanel = drawTitle(data.mst.chartInfo);
    leftTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
        secondRelatedChartDataFacts: data.mst.children[1].chartInfo.dataFacts,
        thirdRelatedChartDataFacts: data.mst.children[2].chartInfo.dataFacts
    });
    data.mst.chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    leftTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.chartInfo, leftVisPanelId);
    leftVisPanelId.appendChild(visPanel);
    
    leftId.appendChild(leftTextPanelId);
    leftId.appendChild(leftTitlePanelId);
    leftId.appendChild(leftVisPanelId);

    //// Right ////
    var rightId  = document.createElement("div");
    setAttributes(rightId, {"id":"rightId", "class":"split", "style":"width: 49.5%; height: 100%; display: inline-block;"});
    // Right Upper
    var rightUpperId = document.createElement("div");
    setAttributes(rightUpperId, {"id":"rightUpperId", "class":"split single-node-container", "style":"width: 99%; height: 32.6%;"});
    var rightUpperTextPanelId  = document.createElement("div");
    setAttributes(rightUpperTextPanelId, {"id":"rightUpperTextPanelId", "class":"split"});
    var rightUpperTitlePanelId = document.createElement("div");
    setAttributes(rightUpperTitlePanelId, {"id":"rightUpperTitlePanelId", "class":"split"});
    var rightUpperVisPanelId  = document.createElement("div");
    setAttributes(rightUpperVisPanelId, {"id":"rightUpperVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[0].chartInfo);
    rightUpperTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
		firstRelatedChartDataFacts: data.mst.chartInfo.dataFacts
    });
    data.mst.children[0].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightUpperTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[0].chartInfo, rightUpperVisPanelId);
    rightUpperVisPanelId.appendChild(visPanel);

    rightUpperId.appendChild(rightUpperTextPanelId);
    rightUpperId.appendChild(rightUpperTitlePanelId);
    rightUpperId.appendChild(rightUpperVisPanelId);

    // Right Middle
    var rightMiddleId = document.createElement("div");
    setAttributes(rightMiddleId, {"id":"rightMiddleId", "class":"split single-node-container", "style":"width: 99%; height: 32.6%;"});
    var rightMiddleTextPanelId  = document.createElement("div");
    setAttributes(rightMiddleTextPanelId, {"id":"rightMiddleTextPanelId", "class":"split"});
    var rightMiddleTitlePanelId = document.createElement("div");
    setAttributes(rightMiddleTitlePanelId, {"id":"rightMiddleTitlePanelId", "class":"split"});
    var rightMiddleVisPanelId  = document.createElement("div");
    setAttributes(rightMiddleVisPanelId, {"id":"rightMiddleVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[1].chartInfo);
    rightMiddleTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[1].chartInfo.dataFacts,
		firstRelatedChartDataFacts: data.mst.chartInfo.dataFacts
    });
    data.mst.children[1].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightMiddleTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[1].chartInfo, rightMiddleVisPanelId);
    rightMiddleVisPanelId.appendChild(visPanel);

    rightMiddleId.appendChild(rightMiddleTextPanelId);
    rightMiddleId.appendChild(rightMiddleTitlePanelId);
    rightMiddleId.appendChild(rightMiddleVisPanelId);

    // Right Bottom
    var rightBottomId = document.createElement("div");
    setAttributes(rightBottomId, {"id":"rightBottomId", "class":"split single-node-container", "style":"width: 99%; height: 32.6%;"});
    var rightBottomTextPanelId  = document.createElement("div");
    setAttributes(rightBottomTextPanelId, {"id":"rightBottomTextPanelId", "class":"split"});
    var rightBottomTitlePanelId = document.createElement("div");
    setAttributes(rightBottomTitlePanelId, {"id":"rightBottomTitlePanelId", "class":"split"});
    var rightBottomVisPanelId  = document.createElement("div");
    setAttributes(rightBottomVisPanelId, {"id":"rightBottomVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[2].chartInfo);
    rightBottomTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[2].chartInfo.dataFacts,
		firstRelatedChartDataFacts: data.mst.chartInfo.dataFacts
    });
    data.mst.children[2].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightBottomTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[2].chartInfo, rightBottomVisPanelId);
    rightBottomVisPanelId.appendChild(visPanel);

    rightBottomId.appendChild(rightBottomTextPanelId);
    rightBottomId.appendChild(rightBottomTitlePanelId);
    rightBottomId.appendChild(rightBottomVisPanelId);


    rightId.appendChild(rightUpperId);
    rightId.appendChild(rightMiddleId);
    rightId.appendChild(rightBottomId);

    // Combine
    piece.appendChild(leftId);
    piece.appendChild(rightId);
    return piece;
}

function fourNodesLeftUnequalBranch(data, index){
    var piece = document.createElement("div");
    setAttributes(piece, {"class":"single-motif-container", "id":"piece"+index});
    var sortedDataFacts, textPanel, visPanel;

    //// Left ////
    var leftId  = document.createElement("div");
    setAttributes(leftId, {"id":"leftId", "class":"split single-node-container", "style":"width: 49.5%; height: 99%; display: inline-block;"});
    var leftTextPanelId  = document.createElement("div");
    setAttributes(leftTextPanelId, {"id":"leftTextPanelId", "class":"split"});
    var leftTitlePanelId = document.createElement("div");
    setAttributes(leftTitlePanelId, {"id":"leftTitlePanelId", "class":"split"});
    var leftVisPanelId  = document.createElement("div");
    setAttributes(leftVisPanelId, {"id":"leftVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.chartInfo);
    leftTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
        secondRelatedChartDataFacts: data.mst.children[1].chartInfo.dataFacts
    });
    data.mst.chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    leftTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.chartInfo, leftVisPanelId);
    leftVisPanelId.appendChild(visPanel);

    leftId.appendChild(leftTextPanelId);
    leftId.appendChild(leftTitlePanelId);
    leftId.appendChild(leftVisPanelId);

    //// Right ////
    var rightId  = document.createElement("div");
    setAttributes(rightId, {"id":"rightId", "class":"split", "style":"width: 49.5%; height: 100%; display: inline-block;"});
    // Right Upper
    var rightUpperId = document.createElement("div");
    setAttributes(rightUpperId, {"id":"rightUpperId", "class":"split", "style":"width: 100%; height: 49.5%;"});
    // Right Upper Left
    var rightUpperLeftId = document.createElement("div");
    setAttributes(rightUpperLeftId, {"id":"rightUpperLeftId", "class":"split single-node-container", "style":"width: 48.7%; height: 97.4%; display: inline-block;"});
    var rightUpperLeftTextPanelId  = document.createElement("div");
    setAttributes(rightUpperLeftTextPanelId, {"id":"rightUpperLeftTextPanelId", "class":"split"});
    var rightUpperLeftTitlePanelId = document.createElement("div");
    setAttributes(rightUpperLeftTitlePanelId, {"id":"rightUpperLeftTitlePanelId", "class":"split"});
    var rightUpperLeftVisPanelId  = document.createElement("div");
    setAttributes(rightUpperLeftVisPanelId, {"id":"rightUpperLeftVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[0].chartInfo);
    rightUpperLeftTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.chartInfo.dataFacts,
        secondRelatedChartDataFacts: data.mst.children[0].children[0].chartInfo.dataFacts
    });
    data.mst.children[0].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightUpperLeftTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[0].chartInfo, rightUpperLeftVisPanelId);
    rightUpperLeftVisPanelId.appendChild(visPanel);

    rightUpperLeftId.appendChild(rightUpperLeftTextPanelId);
    rightUpperLeftId.appendChild(rightUpperLeftTitlePanelId);
    rightUpperLeftId.appendChild(rightUpperLeftVisPanelId);

    // Right Upper Right
    var rightUpperRightId = document.createElement("div");
    setAttributes(rightUpperRightId, {"id":"rightUpperRightId", "class":"split single-node-container", "style":"width: 48.7%; height: 97.4%; display: inline-block;"});
    var rightUpperRightTextPanelId  = document.createElement("div");
    setAttributes(rightUpperRightTextPanelId, {"id":"rightUpperRightTextPanelId", "class":"split"});
    var rightUpperRightTitlePanelId = document.createElement("div");
    setAttributes(rightUpperRightTitlePanelId, {"id":"rightUpperRightTitlePanelId", "class":"split"});
    var rightUpperRightVisPanelId  = document.createElement("div");
    setAttributes(rightUpperRightVisPanelId, {"id":"rightUpperRightVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[0].children[0].chartInfo);
    rightUpperRightTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[0].children[0].chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.children[0].chartInfo.dataFacts
    });
    data.mst.children[0].children[0].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightUpperRightTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[0].children[0].chartInfo, rightUpperRightVisPanelId);
    rightUpperRightVisPanelId.appendChild(visPanel);

    rightUpperRightId.appendChild(rightUpperRightTextPanelId);
    rightUpperRightId.appendChild(rightUpperRightTitlePanelId);
    rightUpperRightId.appendChild(rightUpperRightVisPanelId);
    
    rightUpperId.appendChild(rightUpperLeftId);
    rightUpperId.appendChild(rightUpperRightId);

    // Right Bottom
    var rightBottomId = document.createElement("div");
    setAttributes(rightBottomId, {"id":"rightBottomId", "class":"split single-node-container", "style":"width: 99%; height: 49.5%;"});
    var rightBottomTextPanelId  = document.createElement("div");
    setAttributes(rightBottomTextPanelId, {"id":"rightBottomTextPanelId", "class":"split"});
    var rightBottomTitlePanelId = document.createElement("div");
    setAttributes(rightBottomTitlePanelId, {"id":"rightBottomTitlePanelId", "class":"split"});
    var rightBottomVisPanelId  = document.createElement("div");
    setAttributes(rightBottomVisPanelId, {"id":"rightBottomVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[1].chartInfo);
    rightBottomTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[1].chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.chartInfo.dataFacts,
    });
    data.mst.children[1].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightBottomTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[1].chartInfo, rightBottomVisPanelId);
    rightBottomVisPanelId.appendChild(visPanel);

    rightBottomId.appendChild(rightBottomTextPanelId);
    rightBottomId.appendChild(rightBottomTitlePanelId);
    rightBottomId.appendChild(rightBottomVisPanelId);

    rightId.appendChild(rightUpperId);
    rightId.appendChild(rightBottomId);

    // Combine
    piece.appendChild(leftId);
    piece.appendChild(rightId);
    return piece;
}

function fourNodesRightUnequalBranch(data, index){
    var piece = document.createElement("div");
    setAttributes(piece, {"class":"single-motif-container", "id":"piece"+index});
    var sortedDataFacts, textPanel, visPanel;

    //// Left ////
    var leftId  = document.createElement("div");
    setAttributes(leftId, {"id":"leftId", "class":"split single-node-container", "style":"width: 49.5%; height: 99%; display: inline-block;"});
    var leftTextPanelId  = document.createElement("div");
    setAttributes(leftTextPanelId, {"id":"leftTextPanelId", "class":"split"});
    var leftTitlePanelId = document.createElement("div");
    setAttributes(leftTitlePanelId, {"id":"leftTitlePanelId", "class":"split"});
    var leftVisPanelId  = document.createElement("div");
    setAttributes(leftVisPanelId, {"id":"leftVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.chartInfo);
    leftTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
        secondRelatedChartDataFacts: data.mst.children[1].chartInfo.dataFacts
    });
    data.mst.chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    leftTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.chartInfo, leftVisPanelId);
    leftVisPanelId.appendChild(visPanel);

    leftId.appendChild(leftTextPanelId);
    leftId.appendChild(leftTitlePanelId);
    leftId.appendChild(leftVisPanelId);

    //// Right ////
    var rightId  = document.createElement("div");
    setAttributes(rightId, {"id":"rightId", "class":"split", "style":"width: 49.5%; height: 100%; display: inline-block;"});
    // Right Upper
    var rightUpperId = document.createElement("div");
    setAttributes(rightUpperId, {"id":"rightUpperId", "class":"split single-node-container", "style":"width: 99%; height: 49.5%;"});
    var rightUpperTextPanelId  = document.createElement("div");
    setAttributes(rightUpperTextPanelId, {"id":"rightUpperTextPanelId", "class":"split"});
    var rightUpperTitlePanelId = document.createElement("div");
    setAttributes(rightUpperTitlePanelId, {"id":"rightUpperTitlePanelId", "class":"split"});
    var rightUpperVisPanelId  = document.createElement("div");
    setAttributes(rightUpperVisPanelId, {"id":"rightUpperVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[0].chartInfo);
    rightUpperTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.chartInfo.dataFacts,
    });
    data.mst.children[0].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightUpperTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[0].chartInfo, rightUpperVisPanelId);
    rightUpperVisPanelId.appendChild(visPanel);

    rightUpperId.appendChild(rightUpperTextPanelId);
    rightUpperId.appendChild(rightUpperTitlePanelId);
    rightUpperId.appendChild(rightUpperVisPanelId);

    // Right Bottom
    var rightBottomId = document.createElement("div");
    setAttributes(rightBottomId, {"id":"rightBottomId", "class":"split", "style":"width: 100%; height: 49.5%;"});
    // Right Bottom Left
    var rightBottomLeftId = document.createElement("div");
    setAttributes(rightBottomLeftId, {"id":"rightBottomLeftId", "class":"split single-node-container", "style":"width: 48.7%; height: 97.4%; display: inline-block;"});
    var rightBottomLeftTextPanelId  = document.createElement("div");
    setAttributes(rightBottomLeftTextPanelId, {"id":"rightBottomLeftTextPanelId", "class":"split"});
    var rightBottomLeftTitlePanelId = document.createElement("div");
    setAttributes(rightBottomLeftTitlePanelId, {"id":"rightBottomLeftTitlePanelId", "class":"split"});
    var rightBottomLeftVisPanelId  = document.createElement("div");
    setAttributes(rightBottomLeftVisPanelId, {"id":"rightBottomLeftVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[1].chartInfo);
    rightBottomLeftTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[1].chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.chartInfo.dataFacts,
        secondRelatedChartDataFacts: data.mst.children[1].children[0].chartInfo.dataFacts
    });
    data.mst.children[1].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightBottomLeftTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[1].chartInfo, rightBottomLeftVisPanelId);
    rightBottomLeftVisPanelId.appendChild(visPanel);

    rightBottomLeftId.appendChild(rightBottomLeftTextPanelId);
    rightBottomLeftId.appendChild(rightBottomLeftTitlePanelId);
    rightBottomLeftId.appendChild(rightBottomLeftVisPanelId);

    // Right Bottom Right
    var rightBottomRightId = document.createElement("div");
    setAttributes(rightBottomRightId, {"id":"rightBottomRightId", "class":"split single-node-container", "style":"width: 48.7%; height: 97.4%; display: inline-block;"});
    var rightBottomRightTextPanelId  = document.createElement("div");
    setAttributes(rightBottomRightTextPanelId, {"id":"rightBottomRightTextPanelId", "class":"split"});
    var rightBottomRightTitlePanelId = document.createElement("div");
    setAttributes(rightBottomRightTitlePanelId, {"id":"rightBottomRightTitlePanelId", "class":"split"});
    var rightBottomRightVisPanelId  = document.createElement("div");
    setAttributes(rightBottomRightVisPanelId, {"id":"rightBottomRightVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[1].children[0].chartInfo);
    rightBottomRightTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[1].children[0].chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.children[1].chartInfo.dataFacts
    });
    data.mst.children[1].children[0].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    rightBottomRightTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[1].children[0].chartInfo, rightBottomRightVisPanelId);
    rightBottomRightVisPanelId.appendChild(visPanel);

    rightBottomRightId.appendChild(rightBottomRightTextPanelId);
    rightBottomRightId.appendChild(rightBottomRightTitlePanelId);
    rightBottomRightId.appendChild(rightBottomRightVisPanelId);

    rightBottomId.appendChild(rightBottomLeftId);
    rightBottomId.appendChild(rightBottomRightId);

    rightId.appendChild(rightUpperId);
    rightId.appendChild(rightBottomId);

    // Combine
    piece.appendChild(leftId);
    piece.appendChild(rightId);
    return piece;
}

function fourNodesLinear(data, index){
    var piece = document.createElement("div");
    setAttributes(piece, {"class":"single-motif-container", "id":"piece"+index});
    var sortedDataFacts, textPanel, visPanel;

    //// Upper ////
    var UpperId  = document.createElement("div");
    setAttributes(UpperId, {"id":"UpperId", "class":"split", "style":"width: 99.5%; height: 50%;"});
    // Upper Left
    var UpperLeftId = document.createElement("div");
    setAttributes(UpperLeftId, {"id":"UpperLeftId", "class":"split single-node-container", "style":"width: 49.4%; height: 97.5%; display: inline-block;"});
    var UpperLeftTextPanelId  = document.createElement("div");
    setAttributes(UpperLeftTextPanelId, {"id":"UpperLeftTextPanelId", "class":"split"});
    var UpperLeftTitlePanelId = document.createElement("div");
    setAttributes(UpperLeftTitlePanelId, {"id":"UpperLeftTitlePanelId", "class":"split"});
    var UpperLeftVisPanelId  = document.createElement("div");
    setAttributes(UpperLeftVisPanelId, {"id":"UpperLeftVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.chartInfo);
    UpperLeftTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
    });
    data.mst.chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    UpperLeftTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.chartInfo, UpperLeftVisPanelId);
    UpperLeftVisPanelId.appendChild(visPanel);

    UpperLeftId.appendChild(UpperLeftTextPanelId);
    UpperLeftId.appendChild(UpperLeftTitlePanelId);
    UpperLeftId.appendChild(UpperLeftVisPanelId);

    // Upper Right
    var UpperRightId = document.createElement("div");
    setAttributes(UpperRightId, {"id":"UpperRightId", "class":"split single-node-container", "style":"width: 49.4%; height: 97.5%; display: inline-block;"});
    var UpperRightTextPanelId  = document.createElement("div");
    setAttributes(UpperRightTextPanelId, {"id":"UpperRightTextPanelId", "class":"split"});
    var UpperRightTitlePanelId = document.createElement("div");
    setAttributes(UpperRightTitlePanelId, {"id":"UpperRightTitlePanelId", "class":"split"});
    var UpperRightVisPanelId  = document.createElement("div");
    setAttributes(UpperRightVisPanelId, {"id":"UpperRightVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[0].chartInfo);
    UpperRightTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
        firstRelatedChartDataFacts: data.mst.chartInfo.dataFacts,
		secondRelatedChartDataFacts: data.mst.children[0].children[0].chartInfo.dataFacts
    });
    data.mst.children[0].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    UpperRightTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[0].chartInfo, UpperRightVisPanelId);
    UpperRightVisPanelId.appendChild(visPanel);

    UpperRightId.appendChild(UpperRightTextPanelId);
    UpperRightId.appendChild(UpperRightTitlePanelId);
    UpperRightId.appendChild(UpperRightVisPanelId);

    UpperId.appendChild(UpperLeftId);
    UpperId.appendChild(UpperRightId);

    //// Bottom ////
    var BottomId  = document.createElement("div");
    setAttributes(BottomId, {"id":"BottomId", "class":"split", "style":"width: 99.5%; height: 50%;"});
    // Bottom Left
    var BottomLeftId = document.createElement("div");
    setAttributes(BottomLeftId, {"id":"BottomLeftId", "class":"split single-node-container", "style":"width: 49.4%; height: 97.5%; display: inline-block;"});
    var BottomLeftTextPanelId  = document.createElement("div");
    setAttributes(BottomLeftTextPanelId, {"id":"BottomLeftTextPanelId", "class":"split"});
    var BottomLeftTitlePanelId = document.createElement("div");
    setAttributes(BottomLeftTitlePanelId, {"id":"BottomLeftTitlePanelId", "class":"split"});
    var BottomLeftVisPanelId  = document.createElement("div");
    setAttributes(BottomLeftVisPanelId, {"id":"BottomLeftVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[0].children[0].chartInfo);
    BottomLeftTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[0].children[0].chartInfo.dataFacts,
		firstRelatedChartDataFacts: data.mst.children[0].chartInfo.dataFacts,
		secondRelatedChartDataFacts: data.mst.children[0].children[0].children[0].chartInfo.dataFacts
    });
    data.mst.children[0].children[0].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    BottomLeftTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[0].children[0].chartInfo, BottomLeftVisPanelId);
    BottomLeftVisPanelId.appendChild(visPanel);

    BottomLeftId.appendChild(BottomLeftTextPanelId);
    BottomLeftId.appendChild(BottomLeftTitlePanelId);
    BottomLeftId.appendChild(BottomLeftVisPanelId);

    // Bottom Right
    var BottomRightId = document.createElement("div");
    setAttributes(BottomRightId, {"id":"BottomRightId", "class":"split single-node-container", "style":"width: 49.4%; height: 97.5%; display: inline-block;"});
    var BottomRightTextPanelId  = document.createElement("div");
    setAttributes(BottomRightTextPanelId, {"id":"BottomRightTextPanelId", "class":"split"});
    var BottomRightTitlePanelId = document.createElement("div");
    setAttributes(BottomRightTitlePanelId, {"id":"BottomRightTitlePanelId", "class":"split"});
    var BottomRightVisPanelId  = document.createElement("div");
    setAttributes(BottomRightVisPanelId, {"id":"BottomRightVisPanelId", "class":"split"});

    // Insert title
    titlePanel = drawTitle(data.mst.children[0].children[0].children[0].chartInfo);
    BottomRightTitlePanelId.appendChild(titlePanel);

    // Insert Text and Vis
    sortedDataFacts = sortDataFacts({
        targetChartDataFacts: data.mst.children[0].children[0].children[0].chartInfo.dataFacts,
		firstRelatedChartDataFacts: data.mst.children[0].children[0].chartInfo.dataFacts
    });
    data.mst.children[0].children[0].children[0].chartInfo.sortedDataFacts = sortedDataFacts;
    textPanel = drawText(sortedDataFacts);
    BottomRightTextPanelId.appendChild(textPanel);

    visPanel = drawVis(data.mst.children[0].children[0].children[0].chartInfo, BottomRightVisPanelId);
    BottomRightVisPanelId.appendChild(visPanel);

    BottomRightId.appendChild(BottomRightTextPanelId);
    BottomRightId.appendChild(BottomRightTitlePanelId);
    BottomRightId.appendChild(BottomRightVisPanelId);
        

    BottomId.appendChild(BottomLeftId);
    BottomId.appendChild(BottomRightId);


    // Combine
    piece.appendChild(UpperId);
    piece.appendChild(BottomId);
    return piece;
}

function drawText(sortedDataFacts){
    var text = document.createElement("h3");
    setAttributes(text, {"contenteditable":"true", "id":"textarea"});
    text.innerHTML = "";
    for(var i=0; i<3; i++){
        text.innerHTML += sortedDataFacts[i].content + " ";
    }
    return text;
}
function drawVis(chartInfo, stage){
    var width = stage.getBoundingClientRect().width;
    var height = stage.getBoundingClientRect().height;

    var sourceCode = chartInfo.sourceCode;
    var x_ = sourceCode.encoding.x.field;
    var y_ = sourceCode.encoding.y.field.split("(")[0];
    var title_name = "";

    // color controller
    var comic_color = "";
    if(Object.keys(comic_color_model).includes(y_)){
        comic_color = comic_color_model[y_];
    }else{
        comic_color_model[y_] = category_color[Object.keys(comic_color_model).length][0];
        comic_color = comic_color_model[y_];
    }

    // set dataset
    var markType = chartInfo.chartType;
    var dataset = []
    var temp = {}
    switch(markType){
        case "line":
            temp = {
                label: chartInfo.fields.yAxisField,
                borderColor: comic_color,//chart_colors[markType][0].main,
                data: chartInfo.dataList.y,
                fill: true,
                pointRadius: (chartInfo.dataList.y.length < 20)? 5 : 0,
                pointBackgroundColor: "white",
                pointStyle: 'circle',
            };
            break;
        case "bar":
            temp = {
                label: chartInfo.fields.yAxisField,
                backgroundColor: comic_color,//chart_colors[markType][0].main,
                data: chartInfo.dataList.y,
            }
            break;
        case "doughnut":
            temp = {
                label: chartInfo.fields.yAxisField,
                backgroundColor: getListGradientColor(comic_color, chartInfo.dataList.y.length),
                data: chartInfo.dataList.y,
            }
            break;
        default:
            break;
    }
        
    dataset.push(temp);

    // draw canvas
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    
    if(markType == "doughnut"){
        new Chart(ctx,{
            type: chartInfo.chartType,
            data: {
                labels: chartInfo.dataList.x,
                datasets: dataset
            },
            options: ChartJSDoughnutOptions(title_name, chartInfo.fields.xAxisField, "", (chartInfo.dataList.x.length>8)?false:true),
        });
    }else{
        new Chart(ctx,{
            type: chartInfo.chartType,
            data: {
                labels: chartInfo.dataList.x,
                datasets: dataset
            },    
            options: ChartJSOptions("", title_name, chartInfo.fields.xAxisField, chartInfo.fields.yAxisField, false),
        });
    }
    
    return canvas;
}

function ChartJSDoughnutOptions(title_text="", x_text="", y_text="", showLegend=true){
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
            text: (title_text=="")? "":"Percentage of " + title_text,
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
        },
        
    }
    return options;
}

function drawTitle(chartInfo){
    var text = document.createElement("div");
    setAttributes(text, {"contenteditable":"true", "id":"textarea", "style":"font-size: 12pt; text-align:center; color:gray; font-weight: bold;"});

    // title
    var sourceCode = chartInfo.sourceCode;
    var x_ = sourceCode.encoding.x.field;
    var y_ = sourceCode.encoding.y.field.split("(")[0];
    var title_name = "";
    if(Object.keys(sourceCode.encoding.transform.filter).length===0){
        title_name = y_+" in overall "+x_;
    }else{
        title_name = y_+" in the " + x_ + " of ";
        var filterValue = Object.values(sourceCode.encoding.transform.filter);
        var filterKey = Object.keys(sourceCode.encoding.transform.filter);
        filterValue.forEach(function(value, i){
            if(filterKey[i] == "month" || filterKey[i] == "invoice_month"){
                title_name += month_abbrev[parseInt(value[0])];
            }else if(filterKey[i] == "user_level"){
                title_name += TR_userlevel[value[0]];
            }else{
                title_name += value[0];
            }
            if(i < filterValue.length-1) title_name += ", ";
        })
    }

    text.innerHTML = title_name;
    return text;
}