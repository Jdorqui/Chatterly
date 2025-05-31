<?php
require 'conexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id   = isset($data['id_user']) ? intval($data['id_user']) : 0;

if ($id <= 0) 
{
    echo json_encode(['success'=>false,'message'=>'ID de usuario inválido']);
    exit;
}

try 
{
    $pdo->beginTransaction();

    $pdo->prepare("DELETE FROM mensajes WHERE id_emisor = ? OR id_receptor = ?")->execute([$id, $id]);
    $pdo->prepare("DELETE FROM amigos WHERE id_user1 = ? OR id_user2 = ?")->execute([$id, $id]);
    $pdo->prepare("DELETE FROM llamadas WHERE id_emisor = ? OR id_receptor = ?")->execute([$id, $id]);
    $pdo->prepare("DELETE FROM usuarios WHERE id_user = ?")->execute([$id]);

    $pdo->commit();
    echo json_encode(['success'=>true,'message'=>'Tu cuenta y todos tus datos han sido eliminados.']);
} 

catch (PDOException $e)
{
    $pdo->rollBack();
    echo json_encode(['success'=>false,'message'=>'Error interno al eliminar cuenta']);
}