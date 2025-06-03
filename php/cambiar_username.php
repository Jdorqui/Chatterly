<?php
require 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);


//verificaciones para comprobar si existen 
if (!isset($data['new_username']) || trim($data['new_username']) === '' || !isset($data['id_user']) || !is_numeric($data['id_user']))
{
    echo json_encode([
        'success' => false,
    ]);
    exit;
}

$new_username = trim($data['new_username']);
$id_user = (int)$data['id_user'];

$stmt = $pdo->prepare("UPDATE usuarios SET username = ? WHERE id_user = ?");
$result = $stmt->execute([$new_username, $id_user]);

if ($result)
{
    echo json_encode(['success' => true]);
}
else
{
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar el nombre de usuario'
    ]);
}
?>