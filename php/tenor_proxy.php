<?php
//permitir el acceso desde cualquier origen para evitar problemas de CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

//api key de tenor v2
$key = 'AIzaSyCeCaypgsTf-yUHZ--IqK7oyraMnntqf7E';
$clientKey = 'chatterly_gif_picker'; //identificador de cliente 

//parametros de la peticion GET
$action = isset($_GET['action']) ? $_GET['action'] : 'trending';
$q = isset($_GET['q']) ? $_GET['q'] : '';

//se monta la url de la peticion a tenor
if ($action === 'trending') 
{
    $url = "https://tenor.googleapis.com/v2/trending" . "?key={$key}" . "&client_key={$clientKey}" . "&limit=24";
} 
else 
{
    $url = "https://tenor.googleapis.com/v2/search" . "?key={$key}" . "&client_key={$clientKey}" . "&q=" . urlencode($q) . "&limit=24";
}

//peticion a tenor y se obtiene el codigo de respuesta
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

//se reenvia la respuesta al cliente
http_response_code($code);
echo $response;
?>