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

// Ejecuta el UPDATE directo
$pdo ->prepare("UPDATE usuarios SET email = ? WHERE id_user = ?") ->execute([$data['new_email'], $data['id_user']]);
echo json_encode(['success' => true,'message' => 'Correo actualizado']);