#################################
# dataset preprocess of covid dataset
# 1. exclude unused attributes
# 2. generalize attribute name
# 3. compute number of Confirmed/ recovered / deaths per day (original dataset records cumulative number)
#################################

import csv
import json
import datetime
from collections import defaultdict
import numpy as np

path={
    "vaccine":{
        "readFilePath": 'owid-covid-data.csv',
        "writeFilePath" : 'vaccine.json'
    },
}

stop = False

include_column = {"continent","location","date","new_cases","new_deaths","people_vaccinated","people_fully_vaccinated","new_vaccinations",
                    "total_vaccinations_per_hundred", "total_deaths_per_million", "total_cases_per_million"}
days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
ages = [0,10,20,30,40,50,60,70,80,90,100]

def CSV2Json(csvFilePath, include):
    csv_rows = []
    with open(csvFilePath,encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        field = reader.fieldnames
        for row in reader:
            csv_rows.append({key : row[key] for key in field if key in include})
    return csv_rows

def writeJson(data, jsonFilePath):
    with open(jsonFilePath, "w",encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False,sort_keys=True, indent=4, separators=(',', ': '))

def main():
    i = 1
    dataset = "vaccine"
    datas = CSV2Json(path[dataset]["readFilePath"], include_column) 
    result = []
    curr_date = {}

    if dataset == "vaccine":
        for data in datas:
            temp = {key:value for key,value in data.items() if key!="date"}
            # print(temp)

            # skip continent
            if temp["continent"] == "":
                continue

            # str to float
            for key, value in temp.items():
                if key not in ["location","continent"]:
                    temp[key] = 0.0 if value == "" else float(value)

            try:
                # compute date
                date = data['date'].split("-")

                temp['Year'] = int(date[0])
                temp['Month'] = int(date[1])
                temp['Day'] = int(date[2])
                temp['Weekday'] = days[datetime.date(int(date[0]), int(date[1]), int(date[2])).weekday()]
                temp['Date'] = date[0][2:4] + "/" + date[1].zfill(2) +"/" + date[2].zfill(2)
                temp['No'] = i

                # skip the newest month
                if (temp['Year'] == 2022 and temp['Month'] == 5):
                    continue
                
                # first/second vaccinated
                #temp['first_vaccinated'] = temp['people_vaccinated'] - temp['people_fully_vaccinated']
                #temp['second_vaccinated'] = temp.pop('people_fully_vaccinated')

                # Rename key
                temp['Country']= temp.pop('location')
                temp['Continent']= temp.pop('continent')
                temp['Confirm']= temp.pop('new_cases')
                temp['Death']= temp.pop('new_deaths')
                temp['Vaccinate']= temp.pop('new_vaccinations')

                # fill the closet value if it is 0
                if temp['Country'] in curr_date.keys():
                    for key in temp.keys():
                        if temp[key] == 0:
                            temp[key] = curr_date[temp['Country']][key]
                    
                curr_date[temp['Country']] = temp
                result.append(temp)

                i+=1

            except:
                pass
    
    writeJson(result,path[dataset]["writeFilePath"])

if __name__ == "__main__":
    main()    