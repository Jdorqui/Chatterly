<?php
// php/eliminar_cuenta.php
require 'conexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id   = isset($data['id_user']) ? intval($data['id_user']) : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>'ID de usuario inválido']);
    exit;
}

try {
    // Opcional: agrupar en transacción
    $pdo->beginTransaction();

    // Eliminamos registros relacionados
    $pdo->prepare("DELETE FROM conexiones_voz           WHERE id_user = ?")->execute([$id]);
    $pdo->prepare("DELETE FROM mensajes                  WHERE id_emisor = ? OR id_receptor = ?")
        ->execute([$id, $id]);
    $pdo->prepare("DELETE FROM mensajes_de_canal         WHERE id_emisor = ?")->execute([$id]);
    $pdo->prepare("DELETE FROM miembros_de_grupo        WHERE id_user = ?")->execute([$id]);
    $pdo->prepare("DELETE FROM amigos                   WHERE id_user1 = ? OR id_user2 = ?")
        ->execute([$id, $id]);
    // Canales de grupos que creó este usuario
    $pdo->prepare(
      "DELETE c 
         FROM canales c
         JOIN grupos g ON c.id_grupo = g.id_grupo
        WHERE g.id_creador = ?"
    )->execute([$id]);
    // Grupos creados por el usuario
    $pdo->prepare("DELETE FROM grupos                   WHERE id_creador = ?")
        ->execute([$id]);
    // Por último, el propio usuario
    $pdo->prepare("DELETE FROM usuarios                 WHERE id_user = ?")
        ->execute([$id]);

    $pdo->commit();
    echo json_encode(['success'=>true,'message'=>'Tu cuenta y todos tus datos han sido eliminados.']);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Error interno al eliminar cuenta']);
}
