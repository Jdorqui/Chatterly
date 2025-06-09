<?php
//permitir el acceso desde cualquier origen para evitar problemas de CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

//api key de tenor v2
$key = 'AIzaSyCeCaypgsTf-yUHZ--IqK7oyraMnntqf7E';
$clientKey = 'chatterly_gif_picker'; //identificador de cliente 

//se obtiene el action y q de los parametros de la url
$action = isset($_GET['action']) ? $_GET['action'] : 'trending';
$q = isset($_GET['q']) ? $_GET['q'] : '';

//se monta la url de la peticion a tenor
if ($action === 'trending') // si no se especifica action, se asume que es trending
{
    $url = "https://tenor.googleapis.com/v2/trending" . "?key={$key}" . "&client_key={$clientKey}" . "&limit=24"; // trending gifs
} 
else 
{
    $url = "https://tenor.googleapis.com/v2/search" . "?key={$key}" . "&client_key={$clientKey}" . "&q=" . urlencode($q) . "&limit=24"; // search gifs
}

//peticion a tenor y se obtiene el codigo de respuesta
$ch = curl_init($url); // se inicializa la conexion
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // para que curl devuelva la respuesta como string
$response = curl_exec($ch); // se ejecuta la peticion
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE); // se obtiene el codigo de respuesta HTTP
curl_close($ch); // se cierra la conexion

//se reenvia la respuesta al cliente
http_response_code($code);
echo $response;
?>