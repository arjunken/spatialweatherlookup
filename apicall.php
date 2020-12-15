<?php

include('config/.config.php');

// get the q parameter from URL  
$q = $_REQUEST["q"];

// $arr = array("text"=>"PHP Connected");
// echo json_encode($arr);

if ($q == "homeloc") {
  
  $curl_handle=curl_init();
  curl_setopt($curl_handle,CURLOPT_URL,'https://geolocation-db.com/json/'.$GEOCODEDB_KEY);
  curl_setopt($curl_handle,CURLOPT_CONNECTTIMEOUT,2);
  curl_setopt($curl_handle,CURLOPT_RETURNTRANSFER,1);
  $response1 = curl_exec($curl_handle);
  curl_close($curl_handle);
  if (empty($response1)){
      echo "Error";
  }
  else{
      echo $response1;
  }  
} 

if ($q == "cityname") {
  $lat = $_REQUEST["lat"];
  $lon = $_REQUEST["lon"];
  $curl_handle=curl_init();
  curl_setopt($curl_handle,CURLOPT_URL,'https://api.openweathermap.org/data/2.5/find?lat='.$lat.'&lon='.$lon.'&cnt=1&appid='.$OPENWEATHERMAP_KEY);
  curl_setopt($curl_handle,CURLOPT_CONNECTTIMEOUT,2);
  curl_setopt($curl_handle,CURLOPT_RETURNTRANSFER,1);
  $response2 = curl_exec($curl_handle);
  curl_close($curl_handle);
  if (empty($response2)){
      echo "Error";
  }
  else{
      echo $response2;
  }  
} 

if ($q == "getweather") {
  $mapclick_lat = $_REQUEST["lat"];
  $mapclick_lng = $_REQUEST["lon"];
  $curl_handle=curl_init();
  curl_setopt($curl_handle,CURLOPT_URL,'https://api.openweathermap.org/data/2.5/onecall?lat='.$mapclick_lat.'&lon='.$mapclick_lng.'&exclude=minutely&units=metric&appid='.$OPENWEATHERMAP_KEY);
  curl_setopt($curl_handle,CURLOPT_CONNECTTIMEOUT,2);
  curl_setopt($curl_handle,CURLOPT_RETURNTRANSFER,1);
  $response3 = curl_exec($curl_handle);
  curl_close($curl_handle);
  if (empty($response3)){
      echo "Error";
  }
  else{
      echo $response3;
  }  
} 


















  

?>