<?php
session_start();
require "conexion.php";

header('Content-Type: application/json; charset=utf-8');

// Leer JSON de entrada
$data = json_decode(file_get_contents('php://input'), true);
$cid  = isset($data['channel_id']) ? (int)$data['channel_id'] : 0;
if (!$cid) {
    echo json_encode(['success'=>false, 'error'=>'channel_id inválido']);
    exit;
}

// Traer mensajes de este canal
$stmt = $pdo->prepare("
  SELECT m.id_mensaje, m.contenido, m.fecha_envio, u.alias, u.id_user AS id_emisor, m.tipo
    FROM mensajes_de_canal m
    JOIN usuarios u ON u.id_user = m.id_emisor
   WHERE m.id_canal = ?
ORDER BY m.fecha_envio ASC
");
$stmt->execute([$cid]);
$msgs = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success'=>true, 'messages'=>$msgs], JSON_UNESCAPED_UNICODE);
