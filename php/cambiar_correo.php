<?php
require 'conexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

//formato de correo electronico
if (!filter_var($data['new_email'], FILTER_VALIDATE_EMAIL))
{
  echo json_encode(["status" => "error", "message" => "El formato del correo electronico no es valido."]);
  exit();
}

//ejecuta el update del correo si se ha verificado bien
$stmt = $pdo->prepare("UPDATE usuarios SET email = ? WHERE id_user = ?");
$result = $stmt->execute([$data['new_email'], $data['id_user']]);

if ($result) 
{
  echo json_encode(['success' => true, 'message' => 'Correo actualizado']);
} 
else 
{
  echo json_encode(['success' => false, 'message' => 'Error al actualizar el correo']);
}