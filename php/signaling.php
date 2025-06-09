<?php
session_start();
require __DIR__ . '/conexion.php'; // asegura que la conexion a la base de datos se haya establecido correctamente
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') //esta funcion maneja las peticiones POST para actualizar datos de la llamada en curso
{
  $data = json_decode(file_get_contents("php://input"), true);
  $id_emisor = $data['id_emisor'] ?? null;
  $id_receptor = $data['id_receptor'] ?? null;
  $type = $data['type'] ?? null; //type es 'offer', 'answer' o 'ice'
  $payload = $data['data'] ?? null; //payload es el objeto que contiene la oferta, respuesta o candidatos ICE

  if (!$id_emisor || !$id_receptor || !$type || !$payload) // verifica que no falten datos obligatorios
  {
    echo json_encode(["error"=>"Faltan parámetros"]); exit;
  }

  if ($type === 'ice') //si type es 'ice', se maneja de forma especial
  {
    $stmt = $pdo->prepare("SELECT ice FROM llamadas WHERE id_emisor = ? AND id_receptor = ?"); // consulta para obtener los candidatos ICE existentes
    $stmt->execute([$id_emisor, $id_receptor]); // ejecuta la consulta
    $existing = $stmt->fetchColumn(); // obtiene los candidatos ICE existentes
    $candidates = $existing ? json_decode($existing, true) : []; // decodifica los candidatos ICE existentes o crea un array vacio si no hay
    $candidates[] = $payload; // agrega el nuevo candidato ICE al array
    $json = json_encode($candidates); // convierte el array de candidatos ICE a JSON
    $pdo->prepare("UPDATE llamadas SET ice = ? WHERE id_emisor = ? AND id_receptor = ?") // actualiza los candidatos ICE
        ->execute([$json, $id_emisor, $id_receptor]); // ejecuta la actualizacion
    echo json_encode(["status"=>"ok"]); // responde con el estado de la operacion
    exit;
  }

  //si es 'offer' o 'answer', se guarda directamente el objeto
  $json = json_encode($payload);
  $pdo->prepare("UPDATE llamadas SET {$type} = ? WHERE id_emisor = ? AND id_receptor = ?")
      ->execute([$json, $id_emisor, $id_receptor]);
  echo json_encode(["status"=>"ok"]);
  exit;
}

// maneja las peticiones GET para obtener datos de la llamada
if ($_GET['modo'] === 'obtener')
{
  $type = $_GET['type'] ?? null; // type es 'offer', 'answer' o 'ice'
  $id_emisor = $_GET['id_emisor'] ?? null; // id_emisor es el ID del emisor
  $id_receptor = $_GET['id_receptor'] ?? null; // id_receptor es el ID del receptor

  if (!$type || !$id_emisor || !$id_receptor) // verifica que no falten datos obligatorios
  {
    echo json_encode(["error"=>"Faltan parámetros"]); exit;
  }

  $stmt = $pdo->prepare("SELECT $type FROM llamadas WHERE id_emisor = ? AND id_receptor = ?"); // prepara la consulta para obtener el tipo de dato solicitado (ice, offer o answer)
  $stmt->execute([$id_emisor, $id_receptor]);
  $row = $stmt->fetchColumn();

  if ($type === 'ice') // para ICE devolvemos array, para offer/answer el objeto
  {
    $data = json_decode($row, true) ?: []; // decodifica el JSON a un array, si no hay datos devuelve un array vacio
  }
  else // para offer y answer devolvemos el objeto directamente
  {
    $data = json_decode($row); // decodifica el JSON a un objeto
  }
  echo json_encode(["data"=>$data]);
  exit;
}