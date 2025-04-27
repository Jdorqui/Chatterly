<?php
require 'conexion.php';
header('Content-Type: application/json');

// 1) Leer JSON o fallback a $_POST
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$id_user     = isset($data['id_user'])     ? intval($data['id_user']) : 0;
$old_password= $data['old_password'] ?? '';
$new_password= $data['new_password'] ?? '';

if ($id_user <= 0 || !$old_password || !$new_password) {
    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>'Parámetros inválidos']);
    exit;
}

try {
    // 2) Comprobar que la vieja coincide
    $stmt = $pdo->prepare("SELECT password FROM usuarios WHERE id_user = ?");
    $stmt->execute([$id_user]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || !password_verify($old_password, $row['password'])) {
        http_response_code(401);
        echo json_encode(['success'=>false,'message'=>'Contraseña actual incorrecta']);
        exit;
    }

    // 3) Hacer hash y UPDATE
    $hash = password_hash($new_password, PASSWORD_DEFAULT);
    $pdo->prepare("UPDATE usuarios SET password = ? WHERE id_user = ?")
        ->execute([$hash, $id_user]);

    echo json_encode(['success'=>true,'message'=>'Contraseña cambiada']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Error interno al actualizar']);
}
