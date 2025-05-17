<?php
session_start();
require "conexion.php";
header('Content-Type: application/json; charset=utf-8');

// 0) Log para depurar
error_log('SESSION user_id=' . ($_SESSION['user_id'] ?? 'NULL'));

// 1) Leer cuerpo, intentar JSON y si falla fallback a $_POST
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    parse_str($raw, $data);
}
error_log('RAW INPUT: ' . $raw);
error_log('PARSED DATA: ' . print_r($data, true));

// 2) Extraer valores
$cid  = isset($data['channel_id'])    ? (int)$data['channel_id']    : 0;
$cont = isset($data['contenido'])     ? trim($data['contenido'])    : '';
// 3) Tomar user de sesión o del JSON si viene
$user = $_SESSION['user_id'] ?? null;
if (!$user && isset($data['user_id'])) {
    $user = (int)$data['user_id'];
}

error_log("EXTRACTED -> channel_id={$cid}, contenido='{$cont}', user_id={$user}");

// 4) Validar
if (!$cid || $cont === '' || !$user) {
    echo json_encode(['success'=>false,'error'=>'Parámetros inválidos']);
    exit;
}

// 5) Insertar, con tipo ‘texto’
try {
    $stmt = $pdo->prepare("
        INSERT INTO mensajes_de_canal 
          (id_canal, id_emisor, contenido, tipo) 
        VALUES (?, ?, ?, 'texto')
    ");
    $res = $stmt->execute([$cid, $user, $cont]);
    if (!$res) {
        throw new Exception('Error al ejecutar INSERT');
    }
    echo json_encode(['success'=>true]);
} catch (Exception $e) {
    error_log('DB ERROR: ' . $e->getMessage());
    echo json_encode(['success'=>false,'error'=>'Error al insertar mensaje']);
}
