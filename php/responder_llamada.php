<?php
session_start();
require 'conexion.php';
header('Content-Type: application/json');

//lee el JSON del body
$data = json_decode(file_get_contents("php://input"), true);

//obtiene los parametros principales
$id_emisor = isset($data['id_emisor']) ? $data['id_emisor'] : null;
$id_receptor = isset($data['id_receptor']) ? $data['id_receptor'] : null;
$respuesta = isset($data['respuesta']) ? $data['respuesta'] : null;

if (!$id_emisor || !$id_receptor || !$respuesta) //verifica que no falten datos obligatorios
{
   echo json_encode([
      "status" => "error",
      "msg" => "Faltan datos"
   ]);
   exit;
}

//actualiza el estado de la llamada (y la fecha_fin si corresponde)
//la consulta actualiza el estado de la llamada y la fecha_fin si la respuesta es 'finalizada' si no deja la fecha_fin como NULL y si no es 'finalizada' no cambia la fecha_fin
$stmt = $pdo->prepare("UPDATE llamadas SET estado = ?, fecha_fin = CASE WHEN ? = 'finalizada' THEN NOW() ELSE NULL END WHERE id_emisor = ? AND id_receptor = ?");
$ok = $stmt->execute(array($respuesta, $respuesta, $id_emisor, $id_receptor));

if ($ok) //responde con el estado de la operacion
{
    echo json_encode(array("status" => "ok"));
}
else
{
    echo json_encode(array("status" => "fail"));
}
?>