function drawComics(tree_structure,chart_datas){
    var chartInfos = getChartInfos(chart_datas);
    console.log(chartInfos)

    var layoutData = hac(Object.assign({}, chartInfos, {
        sizeThreshold: 4,
        edgeWeightThreshold: 14,
        linkageCriteria: "averageLinkage"
    }))
    console.log(layoutData)
    var total_storypieces = layoutData.length;
    determineLayout(layoutData);

    addComicPageTag(total_storypieces);

}
function addComicPageTag(pieces_num){
    var comics_banner = document.getElementById('comics_banner');
    for(var i=0; i<pieces_num; i++){
        var tag = document.createElement('button');
        var button_class = (i === 0)? "ui inverted active button":"ui inverted button";
        setAttributes(tag, {"class":button_class, "tabindex":i, "id":"C"+i, "style":"float:right;"})
        tag.innerHTML = "StoryPiece"+i;
        comics_banner.appendChild(tag);

        var storypiece_container = document.getElementById('piece'+i);
        storypiece_container.style.display = (i==0)? "block":"none";
    }
}

function getChartInfos(data){
    var chartInfos = []
    for (const [key, value] of Object.entries(data)) {
        if(value.is_selected || key=="a_chart_1"){
            var partOfChartInfo = {
                chartType: value.type,
                specificChartType: "simple"+value.type+"chart",
                fields:{
                    xAxisField: (curr_dataset == "Transaction")? TR_labels[value.x] : value.x,
                    yAxisField: (curr_dataset == "Transaction")? TR_labels[value.y.split("(")[0]] : value.y,
                    colorField: "",
                    columnField: "",
                    sizeField: ""
                },
                dataList: {
                    y: value.datas[0].data,
                    x: value.labels
                },
                parent: value.parent_chart_id
            }
            var sourceCode = {
                mark: { type: value.type },
                encoding:{
                    x:{
                        type: (value.type=="line")? "temporal":"nominal",
                        field: (curr_dataset == "Transaction")? TR_labels[value.x] : value.x,
                        sort: value.sort
                    },
                    y:{
                        aggregate: value.aggre,
                        type: "quantitative",
                        field: (curr_dataset == "Transaction")? TR_labels[value.y.split("(")[0]] : value.y,
                    },
                    transform:{
                        filter: value.filters
                    }
                }
            }
            chartInfos.push({
                chartID: key,
                chartInfo: Object.assign(
                    {},
                    partOfChartInfo,
                    {
                        sourceCode: sourceCode,
                        title: value.y + " vs. " + value.x,
                        dataFacts: getDataFact(partOfChartInfo),
                        dataFactsContents: []
                    }
                )
            });
        }
    }
    var similarityMatrix = getSimilarityMatrix(chartInfos);
    //console.log(similarityMatrix)
    var returnData = {
        matrix: similarityMatrix,
        arrayOfCharts: chartInfos
    };
    return returnData;
}

function getSimilarityMatrix(data){
    //console.log(data)
    var arrayOfCharts = data;
    var numberOfCharts = arrayOfCharts.length;

    //encoding choice
    var matrix = [];
    for(var index = 0; index < numberOfCharts; index++) {
      var arr;
      (arr = []).length = numberOfCharts;
      arr.fill(0.001);
      matrix.push(arr);
    }

    for(var indexI = 0; indexI < numberOfCharts; indexI++) {
        var firstChartInfo = arrayOfCharts[indexI].chartInfo;
        var firstFields = arrayOfCharts[indexI].chartInfo.fields;
        var firstChart = arrayOfCharts[indexI].chartInfo.sourceCode;
        //transform part
        var firstTransEdit = getTransEdit(firstChart.encoding);
        //encoding part
        var firstX = firstFields.xAxisField;
        var firstY = firstFields.yAxisField;
        for(var indexJ = 0; indexJ < numberOfCharts; indexJ++) {
            var secondChartInfo = arrayOfCharts[indexJ].chartInfo;
            var secondFields = arrayOfCharts[indexJ].chartInfo.fields;
            var secondChart = arrayOfCharts[indexJ].chartInfo.sourceCode;
            //transform part
            var secondTransEdit = getTransEdit(secondChart.encoding);
            //encoding part
            var secondX = secondFields.xAxisField;
            var secondY = secondFields.yAxisField;

            //graphscape mark edit
            var markEditType = firstChart.type < secondChart.mark.type ? firstChart.mark.type + "_" + secondChart.mark.type : secondChart.mark.type + "_" + firstChart.mark.type;

            if(firstChart.mark.type != secondChart.mark.type) {
                switch(markEditType) {
                    case "bar_line":
                        matrix[indexI][indexJ] += 0.04;
                        break;
                    case "bar_doughnut":
                        matrix[indexI][indexJ] += 0.02;
                        break;
                    case "doughnut_line":
                        matrix[indexI][indexJ] += 0.06;
                        break;
                    default:
                        matrix[indexI][indexJ] += 0.04;
                        break;
                }
            }

            //graphscape transform edit
            matrix[indexI][indexJ] += 0.61 * Math.abs(firstTransEdit.sort - secondTransEdit.sort)
                                    + 0.63 * Math.abs(firstTransEdit.aggregate - secondTransEdit.aggregate);
            var transKeyDiff = firstTransEdit.filterKeys.filter(x => !secondTransEdit.filterKeys.includes(x)).concat(secondTransEdit.filterKeys.filter(x => !firstTransEdit.filterKeys.includes(x)));;
            var transKeyIntersect = firstTransEdit.filterKeys.filter(x => secondTransEdit.filterKeys.includes(x));
            var transValue = 0;
            transKeyIntersect.forEach(function(item){
                var firstID = firstTransEdit.filterKeys.indexOf(item);
                var secondID =  secondTransEdit.filterKeys.indexOf(item);

                if(firstTransEdit.filterValues[firstID] !== secondTransEdit.filterValues[secondID]){
                    transValue += 1;
                }
            });
            var transFilterCost = 1.0 * transKeyDiff.length + 0.1 * transValue;
            matrix[indexI][indexJ] += 0.6 * transFilterCost;

            //graphscape encoding edit

            //x
            if(firstX != secondX) {
                if(firstX != "" && secondX !== "" && firstX == secondY && secondX == firstY) { 
                    matrix[indexI][indexJ] += 4.42; //swap x y
                } else if(firstX != "" && secondX !== "") {
                    matrix[indexI][indexJ] += 4.71; //modify x
                } else if((firstX != "" && secondX == "") || (firstX == "" && secondX != "")) {
                    matrix[indexI][indexJ] += 4.59; //add x
                }
            }
            //y
            if(firstY != secondY) {
                if(firstY != "" && secondY !== "" && firstX == secondY && secondX == firstY) { 
                    matrix[indexI][indexJ] += 0; //swap x y
                } else if(firstY != "" && secondY != "") {
                    matrix[indexI][indexJ] += 4.71; //modify y
                } else if((firstY != "" && secondY == "") || (firstY == "" && secondY != "")) {
                    matrix[indexI][indexJ] += 4.59; //add y
                }
            }

            // VisGuide link
            if(firstChartInfo.chartID == secondChartInfo.parent || secondChartInfo.chartID == firstChartInfo.parent){
                matrix[indexI][indexJ] *= 0.5;
            }
        }
    }

    encodingChoiceMatrix = matrix;
    return matrix;
}

//get transform edit
function getTransEdit(encoding) {
    var transEdit = { 
      sort: 0,
      aggregate: 0,
      filter: [],
      filterKeys: [],
      filterValues: []
    };
  
    if(encoding === undefined) {
      return transEdit;
    }
  
    Object.keys(encoding).forEach((d) => {
      if(encoding[d].sort !== undefined) {
        transEdit.sort += 1;
      }
      if(encoding[d].aggregate !== undefined) {
        transEdit.aggregate += 1;
      }
    });

    for (const [key, value] of Object.entries(encoding.transform.filter)) {
        transEdit.filter.push({key: key, value: value[0]});
    }
    transEdit.filterKeys = Object.values(transEdit.filter).map(item => item.key);
    transEdit.filterValues = Object.values(transEdit.filter).map(item => item.value);
    
    return transEdit;
}


////////// Hierarchical Agglomerative Clustering //////////
function hac(arg){
    var options = arg || {},
        arrayOfCharts = options.arrayOfCharts || [],
        matrix = options.matrix || [],
        sizeThreshold = options.sizeThreshold || 1000,
        edgeWeightThreshold = options.edgeWeightThreshold || 1000,
        linkageCriteria = options.linkageCriteria || "noLinkage";

    var similarityMatrix = matrix.map(arr => {
        return arr.slice();
    });

    var nodeList = [];
	var numOfNode = arrayOfCharts.length;
	for(var index = 0; index < numOfNode; index++) {
  	nodeList.push({
			elem: [index]
		});
	}


    if(linkageCriteria == "singleLinkage") {
		let groupList = singleLinkage({
			similarityMatrix: similarityMatrix,
			nodeList: nodeList,
			sizeThreshold: sizeThreshold,
			edgeWeightThreshold: edgeWeightThreshold
		});

		groupList.sort();

		return groupList.map(arr => {
			return mst({
				arrayOfCharts: arr.map(d => { return arrayOfCharts[d]; }),
				matrix: getNewSimilarityMatrix(similarityMatrix, arr)
			});
		});
    }
    else if(linkageCriteria == "averageLinkage"){
        let relationMatrix = similarityMatrix.map(arr => {
            return arr.slice();
        });
        let groupList = averageLinkage({
            similarityMatrix: similarityMatrix,
            relationMatrix: relationMatrix,
            nodeList: nodeList,
            sizeThreshold: sizeThreshold,
            edgeWeightThreshold: edgeWeightThreshold
        });

        groupList.forEach(d => {
            d.sort((a, b) => {
                if (a < b)
                    return -1;
                if (a > b)
                    return 1;
                return 0;
            });
        });
        groupList.sort();

        return groupList.map(arr => {
            return mst({
                arrayOfCharts: arr.map(d => { return arrayOfCharts[d]; }),
                matrix: getNewSimilarityMatrix(similarityMatrix, arr)
            });
        });
    }
    else {
		return [mst({
			arrayOfCharts: arrayOfCharts,
			matrix: similarityMatrix
  	    })];
    }
}

// single-linkage agglomerative algorithm
function singleLinkage(arg){
    let options = arg || {},
			similarityMatrix = options.similarityMatrix || [],
			nodeList = options.nodeList || [],
			sizeThreshold = options.sizeThreshold || 1000,
			edgeWeightThreshold = options.edgeWeightThreshold || 1000;

	let numOfNode = nodeList.length;

    let edgeArray = [];
    for(let indexI = 0; indexI < numOfNode - 1; indexI++) {
        for(let indexJ = indexI + 1; indexJ < numOfNode; indexJ++) {
            edgeArray.push({
                startNode: nodeList[indexI].elem[0],
                endNode: nodeList[indexJ].elem[0],
                edgeWeight: similarityMatrix[indexI][indexJ]
            });
        }
    }

    if(edgeArray.length == 0) {
        return [[nodeList[0].elem[0]]];
    }

    edgeArray.sort((a, b) => {
        if (a.edgeWeight < b.edgeWeight)
            return -1;
        if (a.edgeWeight > b.edgeWeight)
            return 1;
        return 0;
    });
  
    let groupHash = {};
    let groupSet = new Set();
    let edgeList = [];
    let numOfEdge = edgeArray.length;
    for(let index = 0; index < numOfEdge; index++) {
        let startNode = edgeArray[index].startNode;
        let endNode = edgeArray[index].endNode;

        if(groupHash[startNode] == undefined) {
            groupHash[startNode] = [startNode];
            groupSet.add(groupHash[startNode]);
        }
        if(groupHash[endNode] == undefined) {
            groupHash[endNode] = [endNode];
            groupSet.add(groupHash[endNode]);
        }
        if(edgeArray[index].edgeWeight > edgeWeightThreshold) {
            break;
        }
        if(groupHash[startNode] != groupHash[endNode]) {
            if(groupHash[startNode].length + groupHash[endNode].length <= sizeThreshold) {
                groupSet.delete(groupHash[startNode]);
                groupSet.delete(groupHash[endNode]);
                groupHash[startNode] = groupHash[startNode].concat(groupHash[endNode]);
                groupHash[startNode].forEach(d => {
                    groupHash[d] = groupHash[startNode];
                }); 
                groupSet.add(groupHash[startNode]);
                edgeList.push(edgeArray[index]);
            }
        }
    }
    return [...groupSet];
}

// average-linkage agglomerative algorithm
function averageLinkage(arg){
    let options = arg || {},
			similarityMatrix = options.similarityMatrix || [],
			relationMatrix = options.relationMatrix || [],
			nodeList = options.nodeList || [],
			sizeThreshold = options.sizeThreshold || 1000,
			edgeWeightThreshold = options.edgeWeightThreshold || 1000;

	let numOfNode = nodeList.length;

	let edgeArray = [];
	for(let indexI = 0; indexI < numOfNode - 1; indexI++) {
		for(let indexJ = indexI + 1; indexJ < numOfNode; indexJ++) {
			edgeArray.push({
				startNode: indexI,
				endNode: indexJ,
				edgeWeight: relationMatrix[indexI][indexJ]
			});
		}
	}

	edgeArray.sort((a, b) => {
		if (a.edgeWeight < b.edgeWeight)
			return -1;
		if (a.edgeWeight > b.edgeWeight)
			return 1;
		return 0;
	});

	let groupHash = {};
    let groupSet = new Set();
    let edgeList = [];
    let numOfEdge = edgeArray.length;
    for(let index = 0; index < numOfEdge; index++) {
        if(edgeArray[index].edgeWeight > edgeWeightThreshold) {
            break;
        }
        let startNodeIndex = edgeArray[index].startNode;
        let endNodeIndex = edgeArray[index].endNode;
        let startNodeElem = nodeList[startNodeIndex].elem.slice();
        let endNodeElem = nodeList[endNodeIndex].elem.slice();
        if(startNodeElem.length + endNodeElem.length <= sizeThreshold) {
            let newMatrix = removeOldEdges(relationMatrix, startNodeIndex, endNodeIndex);
                nodeList.splice(endNodeIndex, 1);
                nodeList.splice(startNodeIndex, 1);

                let newNode = {elem: startNodeElem.concat(endNodeElem)};
                newMatrix = buildNewMatrix(similarityMatrix, newMatrix, nodeList, newNode);
                nodeList.push(newNode);
                return averageLinkage({
                    similarityMatrix: similarityMatrix,
                    relationMatrix: newMatrix,
                    nodeList: nodeList,
                    sizeThreshold: sizeThreshold,
                    edgeWeightThreshold: edgeWeightThreshold
                });
        }
    }
    return nodeList.map(arr => arr.elem);
}

function removeOldEdges(oldMatrix, index1, index2) {
	let copyMatrix = oldMatrix.map(function(arr) {
		return arr.slice();
	});
	copyMatrix.forEach(d => {
		d.splice(index2, 1);
		d.splice(index1, 1);
	});
	copyMatrix.splice(index2, 1);
	copyMatrix.splice(index1, 1);
	return copyMatrix;
}

function buildNewMatrix(similarityMatrix, oldMatrix, nodeList, newNode) {
	if(oldMatrix.length == 0) {
		return [[0.001]];
	}
	let copyMatrix = oldMatrix.map(function(arr) {
		return arr.slice();
	});
	copyMatrix.forEach(d => {
		d.push(0.001);
	});
	copyMatrix.push(copyMatrix[0].slice());
	let lastIndex = copyMatrix.length - 1;
	for(let index = 0; index < lastIndex; index++) {
		copyMatrix[index][lastIndex] = calculateSimilarity(similarityMatrix, nodeList[index], newNode);
	}
	for(let index = 0; index < lastIndex; index++) {
		copyMatrix[lastIndex][index] = copyMatrix[index][lastIndex];
	}
	return copyMatrix;
}

function calculateSimilarity(similarityMatrix, nodeA, nodeB) {
	let similaritySum = 0;
	nodeA.elem.forEach(index1 => {
		nodeB.elem.forEach(index2 => {
			similaritySum += similarityMatrix[index1][index2];
		});
	});
	return similaritySum / (nodeA.elem.length * nodeB.elem.length);
}

function getNewSimilarityMatrix(similarityMatrix, array) {
	let matrix = [];

  for(let index = 0; index < array.length; index++) {
    let arr;
    (arr = []).length = array.length;
    arr.fill(0.001);
    matrix.push(arr);
  }

  for(let indexI = 0; indexI < array.length; indexI++) {
  	for(let indexJ = 0; indexJ < array.length; indexJ++) {
  		matrix[indexI][indexJ] = similarityMatrix[array[indexI]][array[indexJ]];
  	}
  }

  return matrix;
}

// minimum spanning tree
function mst(arg){
    
	let options = arg || {},
    arrayOfCharts = options.arrayOfCharts || [],
    matrix = options.matrix || [];

    let mst = {};
    mst.findTheRoot = function(node) {
        if(node.parent != null) {
            return mst.findTheRoot(node.parent);
        } else {
            return node;
        }
    }
    mst.reverseTree = function(node) {
        if(node.parent !== null) {
            node.parent.children.forEach((d, i) => {
                if(d === node) {
                    node.parent.children.splice(i, 1);
                }
            });
            node.children.push(node.parent);
            mst.reverseTree(node.parent);
            node.parent.parent = node;
            node.parent = null;
        }
    }

    let nodeList = [];
    let numOfNode = arrayOfCharts.length;
    for(let index = 0; index < numOfNode; index++) {
        nodeList.push({
            name: arrayOfCharts[index].chartID,
            parent: null,
            children: [],
            groupSize: 1,
            chartInfo: arrayOfCharts[index].chartInfo
        });
    }

    let edgeArray = [];
    for(let indexI = 0; indexI < numOfNode - 1; indexI++) {
        for(let indexJ = indexI + 1; indexJ < numOfNode; indexJ++) {
            edgeArray.push({
                startNode: nodeList[indexI],
                endNode: nodeList[indexJ],
                edgeWeight: matrix[indexI][indexJ]
            });
        }
    }

    edgeArray.sort((a, b) => {
        if (a.edgeWeight < b.edgeWeight)
            return -1;
        if (a.edgeWeight > b.edgeWeight)
            return 1;
        return 0;
    });

    let edgeList = [];
    let numOfEdge = edgeArray.length;
    for(let index = 0; index < numOfEdge; index++) {
        let startNode = edgeArray[index].startNode;
        let endNode = edgeArray[index].endNode;
        let rootOfStartNode = mst.findTheRoot(startNode, 0);
        let rootOfEndNode = mst.findTheRoot(endNode, 0);
        if(rootOfStartNode != rootOfEndNode) {
            if(rootOfStartNode.groupSize >= rootOfEndNode.groupSize) {
                rootOfStartNode.groupSize += rootOfEndNode.groupSize;
                mst.reverseTree(endNode);
                endNode.parent = startNode;
                startNode.children.push(endNode);
                edgeList.push(edgeArray[index]);
            } else {
                rootOfEndNode.groupSize += rootOfStartNode.groupSize;
                mst.reverseTree(startNode);
                startNode.parent = endNode;
                endNode.children.push(startNode);
                edgeList.push(edgeArray[index]);
            }
        }
    }

    mst.mst = mst.findTheRoot(nodeList[0]);
    mst.nodeList = nodeList;
    mst.edgeList = edgeList;

    return mst;
}


////////// generateDataFact //////////
let highExtremeKeywords = ["best","good","high","highest","increase","increasing","extreme"];
let lowExtremeKeywords = ["worst","bad","low","lowest","least","decrease","decreasing","extreme"];
let correlationKeywords = ["correlation","correlate","compare"];
let distributionKeywords = ["distribution","spread","range","compare"];
let outlierKeywords = ["outlier","outliers","anomaly","anomalies"];

function getDataFact(data){
    var dataList = data.dataList;
    switch(data.specificChartType) {
        case "simplelinechart":
        case "simplebarchart":
        case "simpledoughnutchart":
            return getCommonFacts_SimpleBarAndLineAndAreaChart_NxQ(data.fields.xAxisField, 
				data.fields.yAxisField, dataList);
            break;
        default:
            break;
    }
    return [];
}

function getCommonFacts_SimpleBarAndLineAndAreaChart_NxQ(categoryAttr, valueAttr, dataList) {
    let potentialDataFacts = [];
	let potentialDataFact;
    
    // data preprocessing
    var newDataList = [];

    for(var i=0; i<dataList.x.length; i++){
        var newDataItem = {};
        newDataItem[categoryAttr] = dataList.x[i];
        newDataItem[valueAttr] = dataList.y[i];
        newDataList.push(newDataItem);
    }
    var sortedDataList = newDataList.sort((a,b) => 
		(a[valueAttr] > b[valueAttr]) ? 1 : ((b[valueAttr] > a[valueAttr]) ? -1 : 0));

	var listLength = sortedDataList.length;

    /*
	=====================
	  ExtremeValueFacts
	=====================
	*/

    // category with lowest value
    potentialDataFact = getExtremeValueDataFactObject();
	potentialDataFact['extremeFunction'] = "MIN";
	potentialDataFact['primaryTargetObjectType'] = "category";
	potentialDataFact['primaryTargetObject'] = sortedDataList[0][categoryAttr];
	potentialDataFact['tier'] = 1;
	potentialDataFact['content'] = sortedDataList[0][categoryAttr] + 
		" (" + categoryAttr + ")" + " has the lowest " + valueAttr + 
		" (" + sortedDataList[0][valueAttr] + ")" + ".";
	potentialDataFact['attributes'] = [categoryAttr, valueAttr];
	potentialDataFact['keywords'] = lowExtremeKeywords;

    potentialDataFacts.push(potentialDataFact);

    // category with highest value
	potentialDataFact = getExtremeValueDataFactObject();
	potentialDataFact['extremeFunction'] = "MAX";
	potentialDataFact['primaryTargetObjectType'] = "category";
	potentialDataFact['primaryTargetObject'] = sortedDataList[listLength - 1][categoryAttr];
	potentialDataFact['tier'] = 1;
	potentialDataFact['content'] = sortedDataList[listLength - 1][categoryAttr] + 
		" (" + categoryAttr + ")" + " has the highest " + valueAttr + 
		" (" + sortedDataList[listLength - 1][valueAttr] + ")" + ".";
	potentialDataFact['attributes'] = [categoryAttr, valueAttr];
	potentialDataFact['keywords'] = highExtremeKeywords;

	potentialDataFacts.push(potentialDataFact);

    /*
	=====================
    RelativeValueDistributionFacts
  =====================
	*/
    if(listLength <= 100) { // ignoring computation of facts if this length is more than 25 since this increases time and size like crazy
        var relativeValueDistributionDiffThreshold = 1.5
        var relativeValueDistributionDiffList = []
    
        for(var i = 0; i < listLength - 1; i ++) {
            for(var j = i + 1; j < listLength; j++) {
                var sourceDataObj = sortedDataList[i];
                var targetDataObj = sortedDataList[j];
                var sourceVal = parseFloat(sourceDataObj[valueAttr]);
                var targetVal = parseFloat(targetDataObj[valueAttr]);
    
                if(sourceVal > 0) { // ignoring 0 values for now TODO: change logic if necessary
                    var diffFactor = (targetVal - sourceVal) / sourceVal;
                    if(diffFactor > relativeValueDistributionDiffThreshold) {
                        relativeValueDistributionDiffList.push({
                            sourceCategory: sourceDataObj[categoryAttr],
                            targetCategory: targetDataObj[categoryAttr],
                            diffFactor: diffFactor
                        })
                    }
                }
            }
        }
    
        relativeValueDistributionDiffList.sort((a,b) => 
            (a.diffFactor > b.diffFactor) ? 1 : ((b.diffFactor > a.diffFactor) ? -1 : 0));

        relativeValueDistributionDiffList.forEach((distributionDiffListObj, i) => {
            potentialDataFact = getRelativeValueDataFactObject();
            potentialDataFact['primaryTargetObjectType'] = 'category';
            potentialDataFact['sourceCategory'] = distributionDiffListObj.sourceCategory;
            potentialDataFact['targetCategory'] = distributionDiffListObj.targetCategory;
            potentialDataFact['diffFactor'] = Math.round((distributionDiffListObj.diffFactor + 0.00001) * 100) / 100;
            potentialDataFact['tier'] = 3;
            potentialDataFact['attributes'] = [categoryAttr, valueAttr];
            potentialDataFact['keywords'] = distributionKeywords;
            potentialDataFact['content'] = "The " + valueAttr + " for " + 
                    potentialDataFact['targetCategory'] + " is " + potentialDataFact['diffFactor'] + 
                    " times of that for " + potentialDataFact['sourceCategory'] + ".";

            if(i == relativeValueDistributionDiffList.length - 1) {
                potentialDataFact['tier'] = 1
            }
        
            else if(i == relativeValueDistributionDiffList.length - 2) {
                        potentialDataFact['tier'] = 2
                    }
        
            potentialDataFacts.push(potentialDataFact);
        });
    }
    /*
	=====================
  	DerivedValueFact : Overall Average
    =====================
    */

    // overall sum
    let sumAcrossCategories = 0;
    sortedDataList.forEach(dataObj => {
        sumAcrossCategories += parseFloat(dataObj[valueAttr]);
    });
    sumAcrossCategories = Math.round((sumAcrossCategories + 0.00001) * 100) / 100;

    potentialDataFact = getDerivedValueDataFactObject()
    potentialDataFact['primaryTargetObjectType'] = 'value'
    potentialDataFact['value'] = sumAcrossCategories;
    potentialDataFact['content'] = "Total " + valueAttr + " across all " + categoryAttr + "s is " + sumAcrossCategories + ".";
    potentialDataFact['tier'] = 1;
    potentialDataFact['attributes'] = [categoryAttr, valueAttr];

    potentialDataFacts.push(potentialDataFact);

    // average across categories
    let avgAcrossCategories = 0;
    sortedDataList.forEach(dataObj => {
        avgAcrossCategories += parseFloat(dataObj[valueAttr]);
    });
    avgAcrossCategories = Math.round((avgAcrossCategories / listLength + 0.00001) * 100) / 100;
    potentialDataFact = getDerivedValueDataFactObject();
    potentialDataFact['primaryTargetObjectType'] = 'value';
    potentialDataFact['value'] = avgAcrossCategories;
    potentialDataFact['content'] = "Average " + valueAttr + " across all " + categoryAttr + "s is " + avgAcrossCategories + ".";
    potentialDataFact['tier'] = 1;
    potentialDataFact['attributes'] = [categoryAttr, valueAttr];

    potentialDataFacts.push(potentialDataFact);

    return potentialDataFacts; 
}

///// dataFactObject /////
function getExtremeValueDataFactObject(){
    let dfObject = {};
    dfObject['id'] = "";
    dfObject['type'] = "ExtremeValueFact";
    dfObject['tier'] = ""; // 1, 2
    dfObject['interestingness'] = 0.0;
    dfObject['taskCategory'] = "Extremum";

    dfObject['extremeFunction'] = "" // MIN, MAX
    dfObject['primaryTargetObjectType'] = ""; // category, item, value
    dfObject['secondaryTargetObjectType'] = ""; // category, item, value
    dfObject['primaryTargetObject'] = "";
    dfObject['secondaryTargetObject'] = "";

    return dfObject;
}

function getRelativeValueDataFactObject(){
    let dfObject = {};
    dfObject['id'] = "";
    dfObject['type'] = "RelativeValueFact";
    dfObject['tier'] = ""; // 1, 2
    dfObject['interestingness'] = 0.0;
    dfObject['taskCategory'] = "Distribution";

    dfObject['primaryTargetObjectType'] = ""; // category, item, value
    dfObject['secondaryTargetObjectType'] = ""; // category, item, value
    dfObject['primaryTargetObject'] = "";
    dfObject['secondaryTargetObject'] = "";
    dfObject['diffFactor'] = "empty";

    return dfObject;
}

function getDerivedValueDataFactObject(){
    let dfObject = {};
    dfObject['id'] = "";
    dfObject['type'] = "DerivedValueFact";
    dfObject['tier'] = ""; // 1
    dfObject['interestingness'] = 0.0;
    dfObject['taskCategory'] = "DerivedValue";

    dfObject['primaryTargetObjectType'] = ""; // category, item, value
    dfObject['secondaryTargetObjectType'] = ""; // category, item, value
    dfObject['value'] = "empty";

    return dfObject;
}

///// sortDataFacts /////
function sortDataFacts(arg) {
	let sortedDataFacts = [];

	let options = arg || {},
			originalTargetChartDataFacts = options.targetChartDataFacts,
			originalFirstRelatedChartDataFacts = options.firstRelatedChartDataFacts || [],
			originalSecondRelatedChartDataFacts = options.secondRelatedChartDataFacts || [],
			originalThirdRelatedChartDataFacts = options.thirdRelatedChartDataFacts || [];

	let targetChartDataFacts = originalTargetChartDataFacts.slice();
	let firstRelatedChartDataFacts = originalFirstRelatedChartDataFacts.slice();
	let secondRelatedChartDataFacts = originalSecondRelatedChartDataFacts.slice();
	let thirdRelatedChartDataFacts = originalThirdRelatedChartDataFacts.slice();

	if(targetChartDataFacts.length == 0) {
		sortedDataFacts = [];
	} else if(firstRelatedChartDataFacts.length == 0) {
		let targetToFirstDataFactsCorrelation = getDataFactsCorrelation({
			firstChartDataFacts: targetChartDataFacts,
			secondChartDataFacts: []
		});
		sortedDataFacts = targetToFirstDataFactsCorrelation.sort((a,b) => 
			(a.interestingness < b.interestingness) ? 1 : ((b.interestingness < a.interestingness) ? -1 : 0));
	} else if(secondRelatedChartDataFacts.length == 0) {
		let targetToFirstDataFactsCorrelation = getDataFactsCorrelation({
			firstChartDataFacts: targetChartDataFacts,
			secondChartDataFacts: firstRelatedChartDataFacts
		});
		sortedDataFacts = targetToFirstDataFactsCorrelation.sort((a,b) => 
			(a.interestingness < b.interestingness) ? 1 : ((b.interestingness < a.interestingness) ? -1 : 0));
	} else if(thirdRelatedChartDataFacts.length == 0) {
		let targetToFirstDataFactsCorrelation = getDataFactsCorrelation({
			firstChartDataFacts: targetChartDataFacts,
			secondChartDataFacts: firstRelatedChartDataFacts
		});
		let targetToSecondDataFactsCorrelation = getDataFactsCorrelation({
			firstChartDataFacts: targetChartDataFacts,
			secondChartDataFacts: secondRelatedChartDataFacts
		});
		targetToFirstDataFactsCorrelation.forEach((dataFact, i) => {
			dataFact.interestingness += targetToSecondDataFactsCorrelation[i].interestingness;
		});
		sortedDataFacts = targetToFirstDataFactsCorrelation.sort((a,b) => 
			(a.interestingness < b.interestingness) ? 1 : ((b.interestingness < a.interestingness) ? -1 : 0));
	} else {
		let targetToFirstDataFactsCorrelation = getDataFactsCorrelation({
			firstChartDataFacts: targetChartDataFacts,
			secondChartDataFacts: firstRelatedChartDataFacts
		});
		let targetToSecondDataFactsCorrelation = getDataFactsCorrelation({
			firstChartDataFacts: targetChartDataFacts,
			secondChartDataFacts: secondRelatedChartDataFacts
		});
		let targetToThirdDataFactsCorrelation = getDataFactsCorrelation({
			firstChartDataFacts: targetChartDataFacts,
			secondChartDataFacts: thirdRelatedChartDataFacts
		});
		targetToFirstDataFactsCorrelation.forEach((dataFact, i) => {
			dataFact.interestingness += targetToSecondDataFactsCorrelation[i].interestingness;
			dataFact.interestingness += targetToThirdDataFactsCorrelation[i].interestingness;
		});
		sortedDataFacts = targetToFirstDataFactsCorrelation.sort((a,b) => 
			(a.interestingness < b.interestingness) ? 1 : ((b.interestingness < a.interestingness) ? -1 : 0));
	}

	return sortedDataFacts;
}

function getDataFactsCorrelation(arg) {
	let dataFactsCorrelation = [];

	let options = arg || {},
			firstChartDataFacts = options.firstChartDataFacts.slice(),
			secondChartDataFacts = options.secondChartDataFacts.slice();

	if(firstChartDataFacts.length == 0) {
		return [];
	} else if(secondChartDataFacts.length == 0) {
		//sum
    let tierCoefficient = 4;
    
    firstChartDataFacts.forEach(dataFact => {
    	dataFact.interestingness = tierCoefficient * (1 / dataFact.tier);
    });

		dataFactsCorrelation = firstChartDataFacts;
		return dataFactsCorrelation;
	} else {
		let firstLength = firstChartDataFacts.length;
		let secondLength = secondChartDataFacts.length;

		//type
    let typeMatrix = [];
    for(let index = 0; index < firstLength; index++) {
      let arr;
      (arr = []).length = secondLength;
      arr.fill(0.0);
      typeMatrix.push(arr);
    }
    for(let indexI = 0; indexI < firstLength; indexI++) {
    	for(let indexJ = 0; indexJ < secondLength; indexJ++) {
    		typeMatrix[indexI][indexJ] = compareDataFactsType(firstChartDataFacts[indexI], secondChartDataFacts[indexJ]);
    	}
    }
    for(let indexI = 0; indexI < firstLength; indexI++) {
    	let sum = 0;
    	for(let indexJ = 0; indexJ < secondLength; indexJ++) {
    		sum += typeMatrix[indexI][indexJ];
    	}
    	firstChartDataFacts[indexI].typeInterestingness = sum / secondLength;
    }
    for(let indexJ = 0; indexJ < secondLength; indexJ++) {
    	let sum = 0;
    	for(let indexI = 0; indexI < firstLength; indexI++) {
    		sum += typeMatrix[indexI][indexJ];
    	}
    	secondChartDataFacts[indexJ].typeInterestingness = sum / firstLength;
    }

    //attribute
    let attributeMatrix = [];
    for(let index = 0; index < firstLength; index++) {
      let arr;
      (arr = []).length = secondLength;
      arr.fill(0.0);
      attributeMatrix.push(arr);
    }
    for(let indexI = 0; indexI < firstLength; indexI++) {
    	for(let indexJ = 0; indexJ < secondLength; indexJ++) {
    		attributeMatrix[indexI][indexJ] = compareDataFactsAttribute(firstChartDataFacts[indexI], secondChartDataFacts[indexJ]);
    	}
    }
    for(let indexI = 0; indexI < firstLength; indexI++) {
    	let sum = 0;
    	for(let indexJ = 0; indexJ < secondLength; indexJ++) {
    		sum += attributeMatrix[indexI][indexJ];
    	}
    	firstChartDataFacts[indexI].attributeInterestingness = sum / secondLength;
    }
    for(let indexJ = 0; indexJ < secondLength; indexJ++) {
    	let sum = 0;
    	for(let indexI = 0; indexI < firstLength; indexI++) {
    		sum += attributeMatrix[indexI][indexJ];
    	}
    	secondChartDataFacts[indexJ].attributeInterestingness = sum / firstLength;
    }

    //sum
    let typeCoefficient = 1;
    let attributeCoefficient = 1;
    let tierCoefficient = 2;
    
    firstChartDataFacts.forEach(dataFact => {
    	dataFact.interestingness = typeCoefficient * dataFact.typeInterestingness 
    														+ attributeCoefficient * dataFact.attributeInterestingness 
    														+ tierCoefficient * (1 / dataFact.tier);
    });

		dataFactsCorrelation = firstChartDataFacts;
		return dataFactsCorrelation;
	}
}

function compareDataFactsType(dataFactOne, dataFactTwo) {
	return dataFactOne.type == dataFactTwo.type;
}

function compareDataFactsAttribute(dataFactOne, dataFactTwo) {
	let attributeSetOne = new Set(dataFactOne.attributes);
	let attributeSetTwo = new Set(dataFactTwo.attributes);
	let union = new Set([...attributeSetOne, ...attributeSetTwo]);
	let intersection = new Set(
    [...attributeSetOne].filter(x => attributeSetTwo.has(x)));
	return intersection.size / union.size;
}