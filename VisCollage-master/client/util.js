//// Global Variable ////
var curr_poster_num = '0';
var curr_comic_num = '0';
var curr_poster_layout = [];
var unique_color_model = {"y_axis":[], "filter":[]};
var comic_color_model = {};
var all_chart_data;

var Global_Clusters;
var Global_InfoGroup = [];
var collage_user_logs = {};
var all_user_captions = [];

var plot_chart_objects = [];
var annoBox_infos = [];

//// Title Bar ////
const change_user_button_color = "#5F8995"

//// Sequence View ////
const white = "#FFFFFF"
const black = "#000000"
const word_color = "#ECECEC"

/// Tree view - Connectors
const drill_connector_color = "#72B36E" 
const comparison_connector_color ="#B3856E" 

/// chart / card
const hover_background_color = "#DCDBDB"
const card_content_color = "#ECECEC"
const center_color = "#818181"

// chart colors
const chart_colors = {
    "bar":[
        {
            main:"#3e95cd",
            insight_border:"#243E57", //#ff9ea5
            click:"#E95380",
            click_border:"#E95380",
        },
        {
            main:"#c9dfee",
            insight:"#ffe6e8"
        }
    ],
    "line":[
        {
            main:"#3e95cd",
            insight_border:"#243E57", //#ff9ea5
            click:"#FFFFFF",
            click_border:"#E95380",//"#70abaf",
            hover:"#FFFFFF"

        },
        {
            main:"#c9dfee",
            insight:"#ffe6e8"
        }
    ],
    "doughnut":[
        {
            main:["#015C92","#1A6C9E","#337DAA","#4C8EB6","#659FC2","#71B0CE","#97C1DA","#B0D2E6","#C9E3F2","#E2F4FF","#ECECEC"],
            click:"#E95380",
            hightlight_border:"#70abaf",
        },
        {
            main:["#015C92","#1A6C9E","#337DAA","#4C8EB6","#659FC2","#71B0CE","#97C1DA","#B0D2E6","#C9E3F2","#E2F4FF","#ECECEC"],
            click:"#EB628B",
        }
    ],
    "pie":[
        {
            main:["#015C92","#1A6C9E","#337DAA","#4C8EB6","#659FC2","#71B0CE","#97C1DA","#B0D2E6","#C9E3F2","#E2F4FF","#ECECEC"],
            click:"#E95380",
            hightlight_border:"#70abaf",
        },
        {
            main:["#015C92","#1A6C9E","#337DAA","#4C8EB6","#659FC2","#71B0CE","#97C1DA","#B0D2E6","#C9E3F2","#E2F4FF","#ECECEC"],
            click:"#EB628B",
        }
    ]
}

// other colors
const chart_border_color = "#99BBFF"

// chart card size
const chart_block_width = 375 //375 //270
const chart_block_height = 375 //375 //270
const chart_card_width = 350 //350 //250
const chart_card_height = 350 //350 //250
const chart_canvas_width = 300 //300 //200
const chart_canvas_height = 300 //300 //200

// chart_block 
const hide_block = "0px"
const hightlight_block = "3px " + chart_border_color + " solid"
const drill_block = "3px " + drill_connector_color + " solid"
const comparison_block = "3px " + comparison_connector_color + " solid"
const block_radius = "5px"

const max_filter_word_num = 35

//// Recommendation View ////
const list_item_padding = "10px"


//// Exploration View ////
const exploration_view_width = "100%"
const exploration_view_height = "100%"
const exploration_view_border = "3px solid #DDD"
const exploration_view_border_radius = "3px"

const node_size = "10px"
const node_hover_size = "12px" 

const node_selected_color = "#AAAAAA"
const edge_color = "#ccc"

//// Menu ////
const menu_item_margin_left = "10px"
const menu_item_padding = "6px"

//// Poster ////
const poster_color = {"main": {
                          "background": "#FFFFFF",
                          "text": "#888888"
                      },
                      "parent": {
                          "background": "#F0F8FF",
                          "text": "white"
                      },
                      "insight": {
                          "line": "#E95380",
                          "bar": "#E95380",
                          "map": "#E95380"
                      }
                    }

const category_color = [["#003065", "#0068b2", "#0095C7", "#83c7e0", "#cbe5f1"],
                        ["#652F00", "#B25900", "#C79D00", "#E0BE83", "#F1E6CB"],
                        ["#006508", "#00B24E", "#9DC700", "#D1E083", "#DEF1CB"],
                        ["#510065", "#6F00B2", "#A300C7", "#C783E0", "#EBCBF1"]
                        ]
const category_color1 = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#bcbd22", "#17becf"];

const FONT = "Lato,'Helvetica Neue',Arial,Helvetica,sans-serif";

//// Title Cleaning ////
const month_abbrev = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const TR_userlevel = {"A":"LevelA","B":"LevelB","C":"LevelC"}
const TR_labels = {
    // 'invoice_price':"Revenue",
    'revenue':"Revenue",
    'points_gained':"PointsGained",
    'branch_name':"Branch",
    'category':"Category",
    'user_level':"UserLevel",
    'address_code':"AddressCode",
    'gender':"Gender",
    'is_taiwan':"IsTaiwanese",
    'percentage of count':"ConsumptionTimes",
    'invoice_month':"month",
    'invoice_day':"day",
    'invoice_weekday':"weekday"
}
const TR_branch = {
    'Breeze Center':"Center",
    'Breeze Xinyi':"Xinyi",
    'Breeze Songgao':"Songgao",
    'Breeze Nanjing':"Nanjing",
    'Breeze Taipei Station':"Taipei Station",
    'Breeze Super':"Super",
    'Breeze NTU Hospital':"NTU Hospital",
    'Breeze TSG Hospital':"TSG Hospital"
}

//// GeoWorld Map Code ////
const continent_code = {
    'Asia': '142',
    'South America': '005',
    'Europe': '150',
    'North America': '019', //'021, 029, 013'
    'Africa': '002',
    'Oceania': '009'
}

const x_to_resolution = {
    'Country/Region': 'countries',
    'Province/State': 'provinces',
    'Country': 'countries',
    'Continent': 'continents'
}

//// D3 World Map ////
const continent_lat_lon = [{
    // Window Screen 80% //
    'Asia': {'center':[85, 30], 'scale':400 },
    'South America':  {'center':[-70, -25], 'scale':400 },
    'Europe':  {'center':[5, 50], 'scale':700 },
    'North America':  {'center':[-100, 50], 'scale':300 },
    'Africa':  {'center':[1, 5], 'scale':400 },
    'Oceania':  {'center':[140, -25], 'scale':600 },
},
{    // Window Screen 100% //
    'Asia': {'center':[100, 25], 'scale':380 },
    'South America':  {'center':[-50, -30], 'scale':320 },
    'Europe':  {'center':[10, 53], 'scale':500 },
    'North America':  {'center':[-80, 45], 'scale':260 },
    'Africa':  {'center':[21, -3], 'scale':320 },
    'Oceania':  {'center':[150, -30], 'scale':480 },
}]
const month_to_Abbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//// Cluster Group ////
const Q_Group = {
    'AQ':          {'AirQuality': ['SO2','NO2','O3','PM2.5', 'value']},
    'Transaction': {'Revenue': ['invoice_price', 'money'],
                    'Points': ['points_gained', 'point']},
    'YT':          {'Records': ['comment_count','dislikes','likes','views', 'frequency']},
    'Covid':       {'Epidemic': ['Confirmed','Deaths','Recovered' ,'people']},
    'Covid19':     {'Epidemic': ['Confirm','Death','Vaccinate', 'people'],
                    'Vaccinated': ['people_vaccinated','people_fully_vaccinated', 'people'],
                    'Epidemic_Density': ['total_vaccinations_per_hundred', 'total_deaths_per_million', 'total_cases_per_million', 'percent']},
    'Netflix':     {'Records': ['video_count']},
    // temporary example
    'covid':       {'Epidemic': ['Confirmed','Deaths','Recovered']},
    '2023':        {'AirQuality': ['pm10_avg', 'aqi', 'pm2.5', 'no2', 'nox','so2_avg', 'so2', 'pm2.5_avg', 'co_8hr', 'co', 'no', 'o3', 'o3_8hr','pm10']}
}

//// Transition ////
const transTemporal = ['year','month','weekDay','day','date']
const transNominal = ['continent','country','city','station']

//// headline temporal ////
const headline_text = {
    'AQ': {'text': "Air Quality in Taiwan",
           'source_date': "The data source comes from 2014 to 2019"},
    'Covid': {'text': "Covid-19 data in the world",
              'source_date': "The data source comes from 2020 to 2021"},
    'Covid19': {'text': "Covid-19 data in the world",
                'source_date': "The data source comes from 2020 to 2022 Apr."},
    'Transaction': {'text': "Transaction data in the department store",
                    'source_date': "The data source comes from 2017"},
    'YT': {'text': "Youtube data in the world",
           'source_date': "The data source comes from 2019"},
    'Netflix': {'text': "Netflix data in the world",
                'source_date': "The movies or tv shows added from 2015 to 2021"},
    // temporary example
    'covid': {'text': 'covid example headline text',
              'source_date': 'covid data from 2020_01 to 2021_04'},
    '2023': {'text': 'example headline text',
              'source_date': 'data from 2023_01 to 2023_04'}
}

//// map region count ////
const subRegion = ["Africa", "South America", "Europe", "North America",
                   "Saudi Arabia", "Kazakhstan", "Indonesia", "China",
                   "Canada", "Mexico", "Brazil", "Argentina", "Greenland",
                   "United Kingdom", "Sweden", "Finland",
                   "Egypt", "Libya", "Algeria", "Nigeria", "Democratic Republic of Congo", "Namibia", "Mozambique", "Ethiopia",
                   "Australia"]

const subsubRegion = {'Europe': ["Greece", "Romania", "Ukraine", "Poland", "Germany", "United Kingdom", "Spain", "Italy", "Sweden", "Finland", "Iceland", "Kazakhstan"],
                      'Asia': ["China", "Kazakhstan", "Pakistan", "Iran", "Turkey", "Saudi Arabia", "Thailand", "Indonesia"],
                      'North America': ["Canada", "Greenland", "Mexico"],
                      'South America': ["Brazil", "Argentina", "Peru"],
                      'Africa': ["Egypt", "Libya", "Algeria", "Mauritania", "Mauritania", "Ghana", "Nigeria", "Gabon", "Democratic Republic of Congo", "Namibia", "Mozambique", "Tanzania", "Ethiopia", "Sudan", "Madagascar"],
                      'Oceania': ["Australia", "Papua New Guinea"]
}

//// quantitative attributes icon ////
const Q_icon_path = {
    'SO2': "icons/SO2.png",
    'PM2.5': "icons/PM25.png",
    'NO2': "icons/NO2.png",
    'O3': "icons/O3.png",

    'invoice_price': "icons/revenue.png",
    'revenue': "icons/revenue.png",
    'points_gained': "icons/token.png",
    'percentage of count': "icons/percentage.png",

    'comment_count': "icons/comment.png",
    'dislikes': "icons/dislike.png",
    'likes': "icons/like.png",
    'views': "icons/view.png",

    'Confirm': "icons/covid-19.png",
    'Death': "icons/death.png",
    'Vaccinate': "icons/vaccine.png",
    'people_vaccinated': "icons/people_vaccination.png",
    'people_fully_vaccinated': "icons/fully_vaccinated.png",
    'total_vaccinations_per_hundred': "icons/people_vaccination.png",
    'total_deaths_per_million': "icons/death_percentage.png",
    'total_cases_per_million': "icons/covid_percentage.png",

    'video_count': "icons/video.png",

    // temporary example
    'Confirmed': "icons/like.png",
    'Deaths': "icons/view.png"
}