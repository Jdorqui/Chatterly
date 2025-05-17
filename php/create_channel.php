<?php
session_start();
require "conexion.php";

header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['group_id'] || empty($data['nombre']) || empty($data['tipo']))) {
  echo json_encode(['success'=>false, 'error'=>'Faltan parámetros']);
  exit;
}

$group_id = (int)$data['group_id'];
$nombre   = trim($data['nombre']);
$tipo     = $data['tipo']; // 'texto' o 'voz'

if (!in_array($tipo, ['texto','voz'])) {
  echo json_encode(['success'=>false, 'error'=>'Tipo inválido']);
  exit;
}

$stmt = $pdo->prepare(
  "INSERT INTO canales (id_grupo, nombre, tipo) 
        VALUES (?, ?, ?)"
);
$res = $stmt->execute([$group_id, $nombre, $tipo]);

if (!$res) {
  echo json_encode(['success'=>false, 'error'=>'Error al insertar']);
  exit;
}

echo json_encode([
  'success' => true,
  'channel' => [
    'id_canal' => $pdo->lastInsertId(),
    'nombre'   => $nombre,
    'tipo'     => $tipo
  ]
]);
