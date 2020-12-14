$(document).ready(function(){

    //**Global Variables */
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];   
    var mapClick_lat, mapClick_lng, marker,mapClickCity;
    var homepos = [];
    var tunit='C';
    const leaflet_key = config.LEALET_KEY;
        
   //**Point User to their current location */
    function getHomeLocation(callback){
        var homeloc_api = new XMLHttpRequest();
        homeloc_api.overrideMimeType("application/json");        
        homeloc_api.open("GET", "https://geolocation-db.com/json/", true);
        homeloc_api.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {                
                callback(JSON.parse(this.responseText));                                        
            }
        };     
        homeloc_api.send(); 
    }
    
    function getCityName(position,callback){     
        
        var cityname_api = new XMLHttpRequest();
           cityname_api.overrideMimeType("application/json");     
           cityname_api.open("GET",'apicall.php?q=cityname&lat='+position[0]+'&lon='+position[1],true);
           cityname_api.onreadystatechange = function() {
               if (this.readyState == 4 && this.status == 200) {
                    callback(JSON.parse(this.responseText));                                                                   
                  }                 
        };     
        cityname_api.send(); 
    }
 

//**Setup LeafletJS MAP  */
    var mymap = L.map('mapid').setView([40.71, -74], 13); 
    mapClick_lat = 40.71;
    mapClick_lng = -74;
    homepos[0] = 40.71;
    homepos[1] = -74;
    mapClickCity = 'New York';
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token='+leaflet_key, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: leaflet_key
    }).addTo(mymap);
    
    getHomeLocation(function(homelatlon) {          
    homepos = [homelatlon.latitude,homelatlon.longitude];
       getCityName(homepos,function(citydata){                                  
        marker = L.marker(homepos).addTo(mymap);
        marker.bindPopup(citydata.list[0].name).openPopup();
        mymap.panTo(new L.LatLng(homepos[0],homepos[1]),13); 
        mapClickCity = citydata.list[0].name;
       });  
    });

    //** Handle Map Mouse Clicks */ 
        var popup = L.popup();
        function onMapClick(e) {  
            mapClick_lat = e.latlng.lat;
            mapClick_lng = e.latlng.lng;
            getCityName([mapClick_lat,mapClick_lng],function(citydata){                                
                popup
                .setLatLng(e.latlng)
                // .setContent("You clicked the map at " + e.latlng.toString())
                .setContent(citydata.list[0].name)
                .openOn(mymap);
                mapClickCity =  citydata.list[0].name;       
               });           
          
        }
        mymap.on('click', onMapClick);

    //** Handle Home Location Button */
    
        $("#homeloc").click(function(){
            mymap.flyTo(new L.LatLng(homepos[0], homepos[1]),13);
        });   
     
    //** Handle C-F switch change */    
         $("#aBtnGroup button").on("click", function () {
            $(this).addClass("active").siblings().removeClass("active");
            $(this).addClass("btn-primary").siblings().removeClass("btn-primary"),
            tunit = $(this).val();   
            $("#getweather").click();      
         });       
     
   
    //** Handle Get Weather and Display Functionality */

       $("#getweather").click(function() {        
        
        //Switch to Weather Tab
        $("#weather-tab").removeClass("disabled");
        $("#weather-tab").click();
         
        //Initialize variables
        $("#fd-time").text(''); 
        $('.weekly-weather').text('');
        $('#fd-icon').text('');     
       
        // Call OpenWeatherMap API     
        var forecast_api = new XMLHttpRequest();
        forecast_api.overrideMimeType("application/json");       
        forecast_api.open("GET",'apicall.php?q=getweather&lat='+mapClick_lat+'&lon='+mapClick_lng, true);        
        forecast_api.onreadystatechange = function() {
               if (this.readyState == 4){
                  if(this.status == 200) {
                     var jData = JSON.parse(this.responseText);
                     weatherDisplay(jData);                
                     } else {
                        alert("Something went wrong with Geolocation or API Key. Try again later or contact the developer.");                   
                     }
                   }
        };                 
        forecast_api.send();        
   
        //Display Weather Data 
        function weatherDisplay(jData) {       
            var wiconcode = jData.current.weather[0].icon + "@2x.png";  
            $('#results').css('display','');        
            $("#fd-icon").html('<img src="http://openweathermap.org/img/wn/'+wiconcode+'"/>');
            $("#fd-icon").append('<br/><h6 class="text-center">'+ jData.current.weather[0].main +'</h6>');                           
            $("#fd-place").text(mapClickCity);    
            $("#fd-date").text((new Date(1000 * jData.current.dt)).toLocaleDateString(undefined,options)); 
            $("#fd-time").append((new Date(1000 * jData.current.dt)).toLocaleTimeString());  
            if(tunit == 'F'){
                let fhtday = (1.8 * jData.current.temp)+32;
                $("#fd-temp").text(fhtday.toFixed(0)+'ºF'); 
                let fhtfl = (1.8 * jData.current.feels_like)+32;
                $("#fd-fl").text(fhtfl.toFixed(0)+'ºF');

            }else{
                $("#fd-temp").text(jData.current.temp.toFixed(0)+'ºC'); 
                $("#fd-fl").text(jData.current.feels_like.toFixed(0)+'ºC');                  
            } 
            $("#fd-hum").text(jData.current.humidity+"%");          
            $("#fd-clouds").text(jData.current.clouds+"%");  
            $("#fd-vis").text((jData.current.visibility/1000).toFixed(1)+"Km"); 
            
            //Write to CSVdata file
            if(tunit == 'F'){
                var csvdata = [[',Current\n,Day','Place','Date','Time','Temperature ºF','Feels_Like ºF','Weather','Humidity(%)','Clouds(%)','Visibility(Km)\n']];
            }else{
                var csvdata = [[',Current\n,Day','Place','Date','Time','Temperature ºC','Feels_Like ºC','Weather','Humidity(%)','Clouds(%)','Visibility(Km)\n']];
            }
            
            var date_without_comma = (new Date(1000 * jData.current.dt)).toLocaleDateString(undefined,options).replace(/[,]/g," ");            
            if(tunit == 'F'){
                csvdata.push([weekdays[(new Date(1000 * jData.current.dt)).getDay()],
                jData.timezone,
                date_without_comma,
                (new Date(1000 * jData.current.dt)).toLocaleTimeString(),
                ((jData.current.temp*1.8)+32),
                ((jData.current.feels_like*1.8)+32),
                jData.current.weather[0].main,
                jData.current.humidity,
                jData.current.clouds,
                (jData.current.visibility/1000) +'\n\n']);
            }else{
                csvdata.push([weekdays[(new Date(1000 * jData.current.dt)).getDay()],
                jData.timezone,
                date_without_comma,
                (new Date(1000 * jData.current.dt)).toLocaleTimeString(),
                jData.current.temp,
                jData.current.feels_like,
                jData.current.weather[0].main,
                jData.current.humidity,
                jData.current.clouds,
                (jData.current.visibility/1000) +'\n\n']);
            }
            
         
        // Fetch and display forecasted weather data for 7 days at the footer                 
            var forecast_length = jData.daily.length;
            var i=0;
            var dt=jData.daily[0].dt;
            $('.weekly-weather').on('click', 'div', function() {});
            if(tunit == 'F'){
                csvdata.push(['Forecast\n,Date','Time','Place','Day Temperature ºF','Min ºC','Max ºF','Feels_Like ºF','Weather','Humidity(%)','Clouds(%)','Chance of Rain(%)\n']);
            }else{
                csvdata.push(['Forecast\n,Date','Time','Place','Day Temperature ºC','Min ºC','Max ºC','Feels_Like ºC','Weather','Humidity(%)','Clouds(%)','Chance of Rain(%)\n']);           }            
            
            do{
               var wday = weekdays[(new Date(1000 * dt)).getDay()];
               if(tunit == 'F'){                   
                var forcast_wkday_div = '<div id="weather-day-'+i+'" class="weekly-weather-item">' +
                '<p id="dd" class="m-0">'+ wday +'</p>' + 
                '<img src="http://openweathermap.org/img/wn/'+jData.daily[i].weather[0].icon+'.png"/>' +
                '<p id="temp" class="m-0">'+ ((jData.daily[i].temp.day * 1.8) +32).toFixed(0) +'°F </p>' +                                                    
                '</div>';    
               }else{
                var forcast_wkday_div = '<div id="weather-day-'+i+'" class="weekly-weather-item">' +
                '<p id="dd" class="m-0">'+ wday +'</p>' + 
                '<img src="http://openweathermap.org/img/wn/'+jData.daily[i].weather[0].icon+'.png"/>' +
                '<p id="temp" class="m-0">'+ jData.daily[i].temp.day.toFixed(0) +'°C </p>' +                                                    
                '</div>';

               }
               
               $('.weekly-weather').append(forcast_wkday_div);   

            //Write to CSV array                     
             var date_without_comma = (new Date(1000 * jData.daily[i].dt)).toLocaleDateString(undefined,options).replace(/[,]/g," "); 
             if(tunit == 'F'){
                csvdata.push([date_without_comma,(new Date(1000 * jData.daily[i].dt)).toLocaleTimeString(),
                         jData.timezone,
                         jData.daily[i].temp.day,
                         ((jData.daily[i].temp.min*1.8)+32),
                         ((jData.daily[i].temp.max*1.8)+32),
                         ((jData.daily[i].feels_like.day*1.8)+32),
                         jData.daily[i].weather[0].main,
                         jData.daily[i].humidity,
                         jData.daily[i].clouds,
                         jData.daily[i].pop*100 +'\n']); 
            }else{
                csvdata.push([date_without_comma,(new Date(1000 * jData.daily[i].dt)).toLocaleTimeString(),
                        jData.timezone,
                        jData.daily[i].temp.day,
                        jData.daily[i].temp.min,
                        jData.daily[i].temp.max,
                        jData.daily[i].feels_like.day,
                        jData.daily[i].weather[0].main,
                        jData.daily[i].humidity,
                        jData.daily[i].clouds,
                        jData.daily[i].pop*100 +'\n']); 
            }           
             
                         
            dt=dt+86400;
            i++;

            }while(i<forecast_length);        
           
//** Handle Display of Forecasted Weather on main screen*/ 

            $(".weekly-weather-item").click(function(){

                let id = this.id;
                let num = id.replace(/[^0-9]/g,'');
                let fdate = (new Date(1000 * jData.daily[num].dt)).toLocaleDateString(undefined,options); 
                let ftime = (new Date(1000 * jData.daily[num].dt)).toLocaleTimeString();  
                if(tunit == 'F'){
                    var main_display = '<div class="d-flex justify-content-between flex-wrap">'+
                                    '<div class="weather-date-location">'+
                                        '<h3 id="fd-place">'+jData.timezone+'</h3>'+
                                        '<p class="text-gray"> <span id="fd-date">'+fdate+'</span><span> | </span><span id="fd-time">'+ftime+'</span> </p>'+
                                    '</div>'+
                                    '<div>'+
                                        '<h4 id="fd-temp" class="display-3 text-center">'+((jData.daily[num].temp.day * 1.8)+32).toFixed(0)+'°F</h4>'+                                        
                                        '<h4 class="text-center"> Day Feels like '+ ((jData.daily[num].feels_like.day * 1.8)+32).toFixed(0) +'°F</h4>'+
                                        '<p class="text-center"> Min:'+((jData.daily[num].temp.min *1.8)+32).toFixed(0)+'°F | Max:'+((jData.daily[num].temp.max *1.8)+32).toFixed(0) +'°F</p>'+                         
                                    '</div>'+
                                   '</div>'+
                                   '<div id="other-weather-data" class="d-flex justify-content-between flex-wrap ml-auto mt-auto">'+
                                    '<div id="fd-icon">'+ 
                                    '<img src="http://openweathermap.org/img/wn/'+jData.daily[num].weather[0].icon+'@2x.png"/> <br>'+                    
                                    '<h6 id="fd-icon" class="text-center">'+ jData.daily[num].weather[0].main +'</h6>'+
                                    '</div>'+ 
                                    '<div>'+
                                    '<h6 class="text-gray text-center">Humidity</h6>'+
                                    '<h3 class="text-center"> '+ jData.daily[num].humidity +'%</h3>'+
                                    '</div>'+ 
                                    '<div>'+
                                    '<h6 class="text-gray text-center">Clouds</h6>'+
                                    '<h3 class="text-center"> '+ jData.daily[num].clouds +'% </h3>'+
                                    '</div>'+  
                                    '<div>'+
                                    '<h6 class="text-gray text-center">Chance of Rain</h6>'+
                                    '<h3 class="text-center">'+ jData.daily[num].pop *100 +'%</h3>'+
                                    '</div>'+
                                   '</div>';
                }else{
                    var main_display = '<div class="d-flex justify-content-between flex-wrap">'+
                                    '<div class="weather-date-location">'+
                                        '<h3 id="fd-place">'+jData.timezone+'</h3>'+
                                        '<p class="text-gray"> <span id="fd-date">'+fdate+'</span><span> | </span><span id="fd-time">'+ftime+'</span> </p>'+
                                    '</div>'+
                                    '<div>'+
                                    '<h4 id="fd-temp" class="display-3 text-center">'+jData.daily[num].temp.day.toFixed(0)+'°C</h4>'+                                        
                                    '<h4 class="text-center"> Day Feels like '+ jData.daily[num].feels_like.day.toFixed(0) +'°C</h4>'+
                                    '<p class="text-center"> Min:'+jData.daily[num].temp.min.toFixed(0)+'°C | Max:'+jData.daily[num].temp.max.toFixed(0) +'°C</p>'+                        
                                    '</div>'+
                                   '</div>'+
                                   '<div id="other-weather-data" class="d-flex justify-content-between flex-wrap ml-auto mt-auto">'+
                                    '<div id="fd-icon">'+ 
                                    '<img src="http://openweathermap.org/img/wn/'+jData.daily[num].weather[0].icon+'@2x.png"/> <br>'+                    
                                    '<h6 id="fd-icon" class="text-center">'+ jData.daily[num].weather[0].main +'</h6>'+
                                    '</div>'+ 
                                    '<div>'+
                                    '<h6 class="text-gray text-center">Humidity</h6>'+
                                    '<h3 class="text-center"> '+ jData.daily[num].humidity +'%</h3>'+
                                    '</div>'+ 
                                    '<div>'+
                                    '<h6 class="text-gray text-center">Clouds</h6>'+
                                    '<h3 class="text-center"> '+ jData.daily[num].clouds +'% </h3>'+
                                    '</div>'+  
                                    '<div>'+
                                    '<h6 class="text-gray text-center">Chance of Rain</h6>'+
                                    '<h3 class="text-center">'+ jData.daily[num].pop *100 +'%</h3>'+
                                    '</div>'+
                                   '</div>';
                }
                
                  $('#main-display').html(main_display);
                });

             }        
        

            });       

    // Handle Downloading of CSV file    
        
        $('#download').click(function(){
     
        console.log(csvdata);
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvdata);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'WeatherData.csv';
        hiddenElement.click();

    });
    

//** Handle Reset Functionality */

    $("#reset").click(function(){
        location.reload();
    });

//** Screen Width and Footer Placement */
var windowsize = $(window).width();

$(window).resize(function() {
  windowsize = $(window).width();
  if (windowsize < 1000) {
    //if the window is less than 1000px remove fixed-bottom for footer
    $(".page-footer").removeClass("fixed-bottom");   
  }else{
    $(".page-footer").addClass("fixed-bottom");  
  }
});
   
});

$(window).on("load",function() {
    windowsize = $(window).width();   
    if (windowsize < 1000) {
      //if the window is less than 1000px remove fixed-bottom for footer
      $(".page-footer").removeClass("fixed-bottom");   
    }else{
      $(".page-footer").addClass("fixed-bottom");  
    }
  });