<?php
// responder_llamada.php
session_start();
require 'conexion.php';
header('Content-Type: application/json');

// Leer el JSON del body
$data = json_decode(file_get_contents("php://input"), true);

// Obtener los parámetros principales
$id_emisor = isset($data['id_emisor']) ? $data['id_emisor'] : null;
$id_receptor = isset($data['id_receptor']) ? $data['id_receptor'] : null;
$respuesta = isset($data['respuesta']) ? $data['respuesta'] : null;

if (!$id_emisor || !$id_receptor || !$respuesta) // Verificar que no falten datos obligatorios
{
   echo json_encode([
      "status" => "error",
      "msg"    => "Faltan datos"
   ]);
   exit;
}

// Actualizar el estado de la llamada (y la fecha_fin si corresponde)
$stmt = $pdo->prepare("UPDATE llamadas SET estado = ?, fecha_fin = CASE WHEN ? = 'finalizada' THEN NOW() ELSE NULL END WHERE id_emisor = ? AND id_receptor = ?");
$ok = $stmt->execute(array($respuesta, $respuesta, $id_emisor, $id_receptor));

if ($ok) // Responder con el estado de la operación
{
    echo json_encode(array("status" => "ok"));
}
else
{
    echo json_encode(array("status" => "fail"));
}
?>