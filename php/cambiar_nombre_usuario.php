<?php
require 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);
$pdo->prepare("UPDATE usuarios SET alias = ? WHERE id_user = ?") ->execute([$data['new_name'], $data['id_user']]);
echo json_encode(['success' => true]);
?>