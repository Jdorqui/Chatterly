<?php
require 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

//valida que new_name existe y no es vacío tras hacer trim, valida si el id user no esta vacio y si es un numero
if (!isset($data['new_name']) || trim($data['new_name']) === '' || !isset($data['id_user']) || !is_numeric($data['id_user']))
{
    echo json_encode([
        'success' => false,
    ]);
    exit;
}

$new_alias = trim($data['new_name']);
$id_user = (int) $data['id_user'];

$stmt = $pdo-> prepare("UPDATE usuarios SET alias = ? WHERE id_user = ?");
$result = $stmt-> execute([$new_alias, $id_user]);

if ($result)
{
    echo json_encode(['success' => true]);
}
else
{
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar el nombre'
    ]);
}
?>