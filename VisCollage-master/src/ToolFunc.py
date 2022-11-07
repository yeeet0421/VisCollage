import InsightFinding
import dataInfos_help
import numpy as np
import json
import dill
import math
import time
import operator
import os
from collections import defaultdict
from scipy.optimize import linprog
import statistics
from itertools import chain
import hashlib
import pickle
from sklearn.preprocessing import OneHotEncoder,LabelEncoder
from shapely.geometry import Polygon
from scipy.optimize import dual_annealing


# load data
curr_data = ""
dataInfos_path = "dataInfos" #pre stored visualizations
Vis_index_path = "vis_index" 
dataInfos = dataInfos_help.dataInfos

############### VisGuide 2.0 ################
mapInfos = dataInfos_help.mapInfos

#aggregate
aggregates = {'sum','avg','cnt'}
globalAggre = {'per'} # 要加none

#chart types
chartTypes = {'line','bar','doughnut'}


# data io
def readFile(path):
    with open(path,encoding='utf-8') as f:
        return json.load(f)

def wirteFile(directory, fileName,data):
    valid = False
    user_ctn = 1
    while(not valid):
        filePath = directory+'/user_'+str(user_ctn)+'_'+fileName+'.json'
        if os.path.exists(filePath):
           user_ctn+=1 
        else:
            valid = True
    
    with open(filePath,'a',encoding='utf-8') as f:
        json.dump(data,f,ensure_ascii=False,sort_keys = True, indent = 4)

def save_data(model,fileName):
    valid = False
    user_ctn = 1
    while(not valid):
        filePath = 'model/user/user_'+str(user_ctn)+'_'+fileName+'.pickle'
        if os.path.exists(filePath):
           user_ctn+=1 
        else:
            valid = True
    
    with open(filePath,'wb') as f:
        pickle.dump(model,f)

def save_training_data(data,fileName):
    filePath = 'TR_data/' + fileName+'.pickle'
    with open(filePath,'wb') as f:
        pickle.dump(data,f)

def read_data(fileName):
    filePath = 'model/'+fileName+'.pickle'
    with open(filePath,'rb') as f:
        model = pickle.load(f)
    return model

def save_dill(data,path):
    with open(path,'wb') as f:
        dill.dump(data,f)


def read_dill(path):
    with open(path,'rb') as f:
        return dill.load(f)


# Create the list of feature values
def twoDigits(a):
    return '0'+str(a) if a<10 else str(a)

def getDateInfo(data):
    tmp=[]
    year=[]
    month=[]
    days=[]
    max_day=0

    for point in data.values():
        if str(point["Year"])+"/"+str(point["Month"]) not in tmp:
            tmp.append(str(point["Year"])+"/"+str(point["Month"]))
            month.append(point["Month"])
            year.append(point["Year"])
            if max_day!=0:
                days.append(max_day)
            max_day=0
        
        if point["Day"]>max_day:
            max_day = point["Day"]
    
    days.append(max_day)

    return year,month,days
        

def getColFeatures(dataName,dataInfo):
    # get distinct value of "nominal" and "temporal" features
    # colFeatures = {
    #      'month':[1,2,3,4,...12]
    # }

    colFeatures = defaultdict(lambda:set())
    data = dataInfo['data']

    # get distinct value of "nomial" and "temporal" features
    for point in data.values():
        for key,value in point.items():
            if key in dataInfo['nominal'] or key in dataInfo['temporal']:  # city,station,year,month,day,weekday
                if key!='' and key!='number':
                    colFeatures[key].add(value)
                    # city : {'Tainan', 'Keelung', ...}
                    # day : {1, 2, 3, ...}
                    # month : {1, 2, ...}
                    # year : {2014, 2015, ...}
                    # ...
            elif key in dataInfo['quantitative']:
                colFeatures[key] = []
                # NO2(ppb) : []
                # O3(ppb) : []
                # ...

    # sort the "temporal" feature values in an increasing order
    for key,value in colFeatures.items():
        if key == 'year' or key == 'month' or key =='day'or key =='invoice_month'or key =='invoice_day' \
            or key == 'Year' or key == 'Month' or key ==' Day' :
            colFeatures[key] = sorted(value)
        elif key == 'weekDay' or key =='invoice_weekday' or key =='weekday' or key == 'Weekday':
            colFeatures[key] = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
        elif key == 'Date': # handle the covid dataset
            years,months,days = getDateInfo(data)
            #print(years, months, days)
            colFeatures[key] = [ str(k)[2:4] +"/"+ twoDigits(months[i]) + "/" + twoDigits(j) for k in years for i in range(len(months)) for j in range(1,days[i-1]+1)]
            colFeatures[key] = sorted(colFeatures[key])
        else:
            colFeatures[key] = list(value)
        #print(colFeatures[key])
    print('set col feature: '+ dataName + " dataset.")
    return colFeatures

def getEncoding2Type(dataInfo,dataName):
    
    result = defaultdict(lambda:dict())
    columns = list(dataInfo['colFeatures'].keys()) # ['NO2(ppb)', 'O3(ppb)', 'PM2.5(ug/m3)', 'SO2(ppb)', 'city', 'day', 'month', 'station', 'weekDay', 'year']
    columns = [column for column in columns if column in dataInfo['nominal'] or column in dataInfo['temporal'] or column in dataInfo['quantitative']] 

    #LabelEncoder
    labelencoder = LabelEncoder()
    all_types = [col1+col2 for col1 in columns for col2 in columns if col1!=col2] # ['NO2(ppb)O3(ppb)', 'NO2(ppb)PM2.5(ug/m3)', ...,'yearstation', 'yearweekDay']
    all_types_label = labelencoder.fit_transform(all_types)
    all_types_label = np.reshape(all_types_label,(-1,1))
        
    #one hot encoding 
    onehotencoder = OneHotEncoder(categories='auto')
    ohe_X = onehotencoder.fit_transform(all_types_label).toarray()

    index = 0
    noneType = [0]*len(list(ohe_X[0]))
    result[''] = noneType

    for col1 in columns:
        for col2 in columns:
            if col1 != col2:
                result[col1][col2] = list(ohe_X[index]) # index_0: result['NO2(ppb)']['O3(ppb)']  = [1.0, 0.0, 0.0, ..., 0.0]
                index+=1
            else: 
                result[col1][col2] = noneType
    return result

def getExpand2Type():
    return {'':[0,0,0],'drill_down':[1,0,0],'roll_up':[0,1,0],'comparison':[0,0,1]} 

def enumerateVis(dataInfo,dataName = 'AQ'): # based on DeepEye P.8  # y不能是nominal
    global aggregates,globalAggre,curr_data
    
    curr_data = dataName
    enumerateVizs = []

    q_cols = dataInfo['quantitative']
    n_cols = dataInfo['nominal']
    t_cols = dataInfo['temporal']
    aggres = aggregates 

    # x is nominal
    if q_cols and n_cols:
        y_aggre = "avg" if dataName == "AQ" else "sum"
        enumerateVizs.extend([Vis(x=n_col,x_type='n',y=q_col,y_type='q',y_aggre=y_aggre) for n_col in n_cols for q_col in q_cols])
    if n_cols and (dataName=='police' or dataName=='Transaction' or dataName=='Netflix'):
        enumerateVizs.extend([Vis(x=n_col_x,x_type='n',y=n_col_x,y_type='n',y_aggre=y_aggre,globalAggre=gloAggre) for n_col_x in n_cols for y_aggre in aggres for gloAggre in globalAggre if y_aggre == 'cnt'])

    # x is numerical
    #if q_cols:
        #enumerateVizs.extend([Vis(x=q_col_x,x_type='q',y=q_col,y_type='q',y_aggre=y_aggre) for q_col_x in q_cols for q_col in q_cols for y_aggre in aggres if q_col_x != q_col])
    #if q_cols and n_cols:
    #   vizs.extend([Vis(x=q_col,x_type='q',y=n_col,y_type='n',y_aggre=y_aggre) for q_col in q_cols for n_col in n_cols for y_aggre in aggres if y_aggre == 'cnt'])

    # x is temporal
    if t_cols and q_cols:
        y_aggre = "avg" if dataName == "AQ" else "sum"
        enumerateVizs.extend([Vis(x=t_col,x_type='t',y=q_col,y_type='q',y_aggre=y_aggre) for t_col in t_cols for q_col in q_cols])
    #if t_cols and n_cols:
    #    vizs.extend([Vis(x=t_col,x_type='t',y=n_col,y_type='n',y_aggre=y_aggre) for t_col in t_cols for n_col in n_cols for y_aggre in aggres if y_aggre == 'cnt'])
    
    
    for vis in enumerateVizs:
        vis.insights = InsightFinding.findExtreme(vis)
        # [{'tag': 0, 'insightType': 'max', 'key': 'Sanchong', 'value': 35.697779642058165, 'description': 'Sanchong has the highest value 35.70 for avg of NO2(ppb) ', 'sig': 0.00029242329484272856}, 
        #  {'tag': 1, 'insightType': 'min', 'key': 'Hengchun', 'value': 1.8582649472450177, 'description': 'Hengchun has the lowest value 1.86 for avg of NO2(ppb) ', 'sig': 0.04807215520410534}]
        

    return enumerateVizs
    
def columnEncoding(column):
    columns = list(dataInfos[curr_data]['colFeatures'].keys())
    return columns.index(column)

def getCopyVis(pre_vis,autoSetVisInfo=True):
    vis = Vis(mark=pre_vis.mark,x=pre_vis.x,x_type=pre_vis.x_type,y=pre_vis.y,y_type=pre_vis.y_type,y_aggre=pre_vis.y_aggre,z=pre_vis.z,z_type=pre_vis.z_type,globalAggre=pre_vis.globalAggre,Filter=pre_vis.filter.copy(),autoSetVisInfo=autoSetVisInfo)
    return vis

def hasSameVis(check_vis,enumerateVizs):
    #addFitler = {
    # 'city':['sss']
    # }

    for i,vis in np.ndenumerate(np.array(enumerateVizs)):
        if check_vis == vis:
            list(enumerateVizs)
            return vis,i
        #if isSameVis(check_vis,vis):
        #    list(enumerateVizs)
        #    return vis,i
    list(enumerateVizs)
    return None,None

def isSameVis(vis1,vis2):
    if len(vis1.filter)!=len(vis2.filter):
        return False
    for key,value in vis1.filter.items():
        if key not in vis2.filter: 
            return False
        elif set(vis1.filter[key]) != set(vis2.filter[key]):
            return False
    if vis1.x != vis2.x : return False
    if vis1.y != vis2.y : return False
    
    return True

class Vis():
    index = 0
    def __init__(self,x='',x_type='',y='',y_type='',y_aggre='sum',z='',z_type='',mark='bar',scale='',order='',bin='',Filter=defaultdict(list),globalAggre='',autoSetVisInfo=True):
        #self.mark = mark
        if x_type == "n" and y_type == "q":
            self.mark = "bar" 
        elif x_type == "t" and y_type == "q":
            self.mark = "line"
        elif x_type == "n" and y_type == "n":
            self.mark = "doughnut"
        else: 
            self.mark = "bar" 

        self.x = x
        self.x_type = x_type
        self.y = y
        self.y_type = y_type
        self.y_aggre = y_aggre
        self.z = z
        self.z_type = z_type
        self.globalAggre = globalAggre
        self.filter = Filter
        self.filter_percent =0.0

        
        self.expandType = '' # 1: drill down , 2: comparison
        self.insightType = ''
        self.points = {}
        self.subgroup = {}
        self.insights = []
        self.edgeValue = 0.0
        self.pre_vis = None # 算IG的 (reference vis)
        self.par_vis = None # sequence parent
        self.children ={}
        self.features = defaultdict(lambda:0.0)
        self.euclidean = 0.0

        self.pilot_children =[]
        self.pilot_parents =[]

        Vis.index += 1
        self.index = Vis.index

        if autoSetVisInfo:
            self.setVisInfo()

    def setVisInfo(self):
        start = time.time()
        
        self.points = self.getPoints()
        self.subgroup = self.getSubgroup()
        #self.insights = findExtreme(vis)

        end = time.time()
        #print('setVisInfo : ' + str(end-start))

    def getPoints(self):
        # points = {
        #   '2014': {'10':10,'4':5}  => id:value 
        # }
        # points = {
        #   '嘉義':{
        #       '2014': {'10':10,'4':5}  => id:value 
        #    }
        # }
        points = defaultdict(lambda:defaultdict(lambda:defaultdict(lambda:0))) if self.z else defaultdict(lambda:defaultdict())
        data = dataInfos[curr_data]['data']
        
        if not self.pre_vis: #沒有前人的
            for id,point in data.items():
                if self.matchFilter(point,self.filter) and self.y in point and point[self.y] != '-':
                    
                    if self.z:
                        points[point[self.z]][point[self.x]][id] = point[self.y]
                    else:
                        points[point[self.x]][id]=point[self.y] #TODO 變成tuple
                        
            points = {key:value for key,value in points.items() if len(value)>0 and key!= "nan" and key!=""}
            total = len(data)

        else: #比之前再多加filter而已
            #TODO handle有Z軸的
            for key,old_points in self.pre_vis.points.items():
                try:
                    points[key] = { pointID :value for pointID,value in old_points.items() if self.matchFilter(data[pointID],self.filter)}
                except:
                    print("Key Error: ")
            points = {key:value for key,value in points.items() if len(value)>0}
            total = sum([len(value) for key,value in self.pre_vis.points.items()])

        return points

    def getSubgroup(self,y_aggre=""):
        subgroup = defaultdict(lambda:defaultdict(lambda:0)) if self.z else defaultdict(lambda:0)
        newSubgroup = defaultdict(lambda:defaultdict(lambda:0)) if self.z else defaultdict(lambda:0)
        
        #為了讓 x 軸的排序一樣
        colFeatures = dataInfos[curr_data]['colFeatures']
        
        for key in list(colFeatures[self.x]):
            if key in self.points:
                y_aggre = self.y_aggre if y_aggre =="" else y_aggre # sum, avg, cnt
                subgroup[key] = self.aggregate(y_aggre,self.points[key].values()) # key: 2018  #subgroup[key]: 20.0
                
        if self.globalAggre=='per':
            for key,values in subgroup.items():
                if isinstance(values,dict): # 判断一个对象是否是一个已知的类型
                    total = sum(values.values())
                    for key_x,value in values.items():
                        newSubgroup[key][key_x] = value / total if total!= 0 else 0

                else:
                    total = sum(subgroup.values()) 
                    newSubgroup[key] = values / total if total!= 0 else 0
            
            if self.x in dataInfos[curr_data]['nominal']:
                subgroup = dict(sorted(newSubgroup.items(),key=lambda x : x[1],reverse=True))
            else:
                subgroup = newSubgroup
        #subgroup = {key:value for key,value in subgroup.items() if len(value)>0}
        return subgroup    
              
    def matchFilter(self,point,filters):
        for key,values in filters.items():
            if point[key] not in values : return False
        return True

    def aggregate(self,aggre,points):
        if len(points) == 0:
            return 0

        switcher = {
            'cnt' : lambda x: len(x),
            'sum' :  lambda x: sum(x),
            'avg' : lambda x: statistics.mean(x),
        }
        
        if aggre!='cnt':
            points = list(map(lambda value : float(value.replace(',','')) if isinstance(value,str) else float(value),points)) #handle 1,134.58

        return switcher.get(aggre,'nothing')(points)
    
    
    def __hash__(self):
        return int(hashlib.md5(str(self.index).encode('utf-8')).hexdigest(),16)
    
    def __eq__(self,other):
        if other == None:
            return False
        if len(self.filter)!=len(other.filter):
            return False
        for key,value in self.filter.items():
            if key not in other.filter: 
                return False
            elif set(self.filter[key]) != set(other.filter[key]):
                return False
        if self.x != other.x : return False
        if self.y != other.y : return False

        return True

def setDataInfos():
    global dataInfos
    for dataName,dataInfo in dataInfos.items():  
        data_point = readFile(dataInfo['readFilePath'])
        print(len(data_point))
        dataInfo['data'] = {point[dataInfo['ID_col']] : point for point in data_point}
        dataInfo['colFeatures'] = getColFeatures(dataName,dataInfo)
        dataInfo['encoding2Type'] = getEncoding2Type(dataInfo,dataName) 
        dataInfo['expand2Type'] = getExpand2Type()
        dataInfo['enumerateVizs'] = enumerateVis(dataInfo,dataName)
        dataInfo['rootVizs'] = [vis for vis in dataInfo['enumerateVizs'] if len(vis.filter)==0]

    print("setDataInfos Done")
    
def init(data=None):
    #local version 
    global dataInfos
    presave = True

    if presave:
        # read presave dataInfos
        try:
            with open(dataInfos_path) as f:
                print("dataInfos exists!")
            
            dataInfos = read_dill(dataInfos_path) #直接讀取前處理好的dataInfos
            Vis.index = read_dill(Vis_index_path)

        except IOError:
            setDataInfos()
    else:
        setDataInfos()

############### VisGuide 2.0 ###############
def getTaiwanMap():
    taiwan_map = readFile(mapInfos['Taiwan']['readFilePath'])
    return taiwan_map

def getTaiwanCity():
    taiwan_city = readFile(mapInfos['Taiwan']['citiesFilePath'])
    return taiwan_city

def getWorldMap(flag):
    worldmap = ""
    if flag == "Country" or flag == "Country/Region":
        world_map = readFile(mapInfos['World']['readFilePath'])
    elif flag == "Continent":
        world_map = readFile(mapInfos['Continent']['readFilePath'])
    return world_map

def getWorldCountry(flag):
    world_country = ""
    if flag == "Country" or flag == "Country/Region":
        world_country = readFile(mapInfos['World']['countriesFilePath'])
    elif flag == "Continent":
        world_country = readFile(mapInfos['Continent']['continentsFilePath'])
    return world_country

def optimal_scale_placement(canvas_info, weight):
    save_info_scale = {}
    scale_hyperparam = [1, 0.95, 0.9, 0.85, 0.8]

    best_score, best_scale, best_scale_pos = float('inf'), 1, None
    origin_info = {'shape_regions':[], 'alpha_regions':[], 'insights':canvas_info['insights']}

    for i in range (0,len(canvas_info['regions'])):
        origin_info['shape_regions'].append(canvas_info['regions'][i]['points'])
        origin_info['alpha_regions'].append(canvas_info['regions'][i]['alpha'])

    for scaling in scale_hyperparam:
        print('scale: ', scaling)
        info_scale = scaleRegions(canvas_info['width'], canvas_info['height'], origin_info, scaling)
        save_info_scale['scale_'+str(scaling)] = {'info': info_scale}

        #MIN_C, MIN_SCORE = find_leaf_placement(info_scale, weight)
        MIN_C, MIN_SCORE = optimization(info_scale, weight)

        save_info_scale['scale_'+str(scaling)]['center'] = MIN_C
        save_info_scale['scale_'+str(scaling)]['score'] = MIN_SCORE

        print('scale Penalty:', sum(MIN_SCORE)*(2-scaling*scaling))
        if sum(MIN_SCORE)*(2-scaling*scaling) < best_score:
            best_score = sum(MIN_SCORE)*(2-scaling*scaling)
            best_scale = scaling
            best_scale_pos = MIN_C

    #with open('info_scale.json', 'w') as f:
    #    json.dump(save_info_scale, f)

    return best_scale, best_scale_pos

def scaleRegions(W, H, origin_info, scaling):
    
    info_scale = {'width': W,'height': H, 'regions':[], 'insights':[]}

    for r in range(0, len(origin_info['shape_regions'])):
        points = origin_info['shape_regions'][r]
        alpha = origin_info['alpha_regions'][r]
        points[0] = round((points[0]-W/2) * scaling + W/2, 2)
        points[1] = round((points[1]-H/2) * scaling + H/2, 2)
        points[2] = round(points[2] * scaling, 2)
        points[3] = round(points[3] * scaling, 2)
        info_scale['regions'].append({'points': points, 'alpha': alpha})

    for p in range(0, len(origin_info['insights'])):
        scale_insight = origin_info['insights'][p]
        scale_insight[0] = round((scale_insight[0]-W/2) * scaling + W/2, 2)
        scale_insight[1] = round((scale_insight[1]-H/2) * scaling + H/2, 2)
        info_scale['insights'].append(scale_insight)
    
    return info_scale
'''
def find_leaf_placement(info, weight):
    BBOX_SIZE = (200, 400)
    BBOX_C = (100, 200)
    
    polys = info['regions']
    TARGET_C = info['insights']
    MIN_C, MIN_SCORE = [], []
    
    for t in range(0, len(TARGET_C)):
        min_score, min_pos, min_poly = float('inf'), None, None
        # rough estimate
        for i in range(0, info['width']-BBOX_SIZE[0], 100):
            for j in range(0, info['height']-BBOX_SIZE[1], 100):
                # Calculate Intersection
                grid = Polygon([(i,j+BBOX_SIZE[1]), (i+BBOX_SIZE[0],j+BBOX_SIZE[1]), (i+BBOX_SIZE[0], j), (i,j)])
                penalty = 0
                for p in range(len(polys)):
                    poly1 = Polygon(find_coordinate(polys[p]['points']))
                    area = getIntersectArea(poly1, grid)
                    if area > 0:
                        penalty += area * polys[p]['alpha']
                # Calculate Distance
                distance = getDistance([i+BBOX_C[0], j+BBOX_C[1]], TARGET_C[t])
                score = 0.9*penalty + 0.1*distance
                if score < min_score:
                    min_pos = (i, j)
                    min_score = score
                    min_poly = grid
        
        # pixel one by one in a minimal section
        # print(min_poly.exterior.coords[3])
        start = min_poly.exterior.coords[3]
        min_score, min_pos, min_poly = float('inf'), None, None
        for i in range(int(start[0])-100, int(start[0])+100, 10):
            for j in range(int(start[1])-100, int(start[1])+100, 10):
                # Calculate Intersection
                grid = Polygon([(i,j+BBOX_SIZE[1]), (i+BBOX_SIZE[0],j+BBOX_SIZE[1]), (i+BBOX_SIZE[0], j), (i,j)])
                penalty = 0
                for p in range(len(polys)):
                    poly1 = Polygon(find_coordinate(polys[p]['points']))
                    area = getIntersectArea(poly1, grid)
                    if area > 0:
                        penalty += area * polys[p]['alpha']
                # Calculate Distance
                distance = getDistance([i+BBOX_C[0], j+BBOX_C[1]], TARGET_C[t])
                score = 0.9*penalty + 0.1*distance
                if score < min_score:
                    min_pos = (i+BBOX_C[0], j+BBOX_C[1])
                    min_score = score
                    min_poly = grid
        
        #print(min_score, min_pos, min_poly)
        MIN_C.append(min_pos)
        MIN_SCORE.append(min_score)
        polys.append({'points': [min_pos[0], min_pos[1], BBOX_SIZE[0], BBOX_SIZE[1]], 'alpha': weight})
    return MIN_C, MIN_SCORE
'''
def getIntersectArea(poly1, poly2):
    intersectPoint = poly1.intersects(poly2)
    if intersectPoint:
        return poly1.intersection(poly2).area
    else:
        return 0

def getDistance(p1, p2):
    return pow(pow(p2[0]-p1[0], 2)+pow(p2[1]-p1[1], 2), 0.5)

def find_coordinate(pt):
    x, y, w, h = int(pt[0]), int(pt[1]), int(pt[2]), int(pt[3])
    p1 = (x, y+h)
    p2 = (x+w, y+h)
    p3 = (x+w, y)
    p4 = (x, y)
    return [p1, p2, p3, p4]


def AABBCollision(A, Bs):
    overall = 0
    for i in range(len(Bs)):
        r = Bs[i]["points"]
        alpha = Bs[i]["alpha"]
        B = {"x": r[0], "y": r[1], "w": r[2], "h": r[3], "i": alpha}
        
        if (A["x"] <= B["x"] + B["w"] and A["x"] + A["w"] >= B["x"] and A["y"] <= B["y"] + B["h"] and A["y"] + A["h"] >= B["y"]) or\
            (B["x"] <= A["x"] + A["w"] and B["x"] + B["w"] >= A["x"] and B["y"] <= A["y"] + A["h"] and B["y"] + B["h"] >= A["y"]):
            #print("Collision Detected")
            width = AABBArea(A, B, "x", "w")
            height = AABBArea(A, B, "y", "h")
            overall += (width * height) * B["i"]
        else:
            overall += 0
    return overall
        
def AABBArea(A, B, pt, ln):
    length = 0
    if A[pt] <= B[pt] and A[pt] + A[ln] <= B[pt] + B[ln]: length = A[pt] + A[ln] - B[pt]
    elif A[pt] <= B[pt] and A[pt] + A[ln] >= B[pt] + B[ln]: length = B[ln]
    elif A[pt] >= B[pt] and A[pt] + A[ln] >= B[pt] + B[ln]: length = B[pt] + B[ln] - A[pt]
    elif A[pt] >= B[pt] and A[pt] + A[ln] <= B[pt] + B[ln]: length = A[ln]
    return length

def Distance(A, Target):
    return pow(pow(A["x"] - Target[0], 2) + pow(A["y"] - Target[1], 2), 1/2)

# objective function
def objective(v, polys, Target, BBOX_SIZE):
    x, y = v
    AnnoBox = {"x": x, "y": y, "w": BBOX_SIZE[0], "h": BBOX_SIZE[1]}
    return 0.6*AABBCollision(AnnoBox, polys) + 0.4*Distance(AnnoBox, Target)
    #return (x**2 + y - 11)**2 + (x + y**2 -7)**2

def optimization(info, weight):
    BBOX_SIZE = (150, 300)
    polys = info['regions']
    TARGET_C = info['insights']
    MIN_C, MIN_SCORE = [], []

    for t in range(0, len(TARGET_C)):
        # define the bounds on the search
        bounds = [[0, info['width']-BBOX_SIZE[0]], [0, info['height']-BBOX_SIZE[1]]]
        # perform the simulated annealing search
        result = dual_annealing(objective, bounds, args=(polys, TARGET_C[t], BBOX_SIZE))
        # summarize the result
        #print('Status : %s' % result['message'])
        #print('Total Evaluations: %d' % result['nfev'])
        # evaluate solution
        solution = list(result['x'])
        evaluation = objective(solution, polys, TARGET_C[t], BBOX_SIZE)
        print('Solution: f(%s) = %.5f' % (solution, evaluation))

        solution_c = (solution[0] + BBOX_SIZE[0]/2, solution[1] + BBOX_SIZE[1]/2)
        
        MIN_C.append(solution_c)
        MIN_SCORE.append(evaluation)
        polys.append({'points': [solution[0], solution[1], BBOX_SIZE[0], BBOX_SIZE[1]], 'alpha': weight})

    return MIN_C, MIN_SCORE