<?php
session_start();
require "conexion.php";

header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['group_id'])) {
  echo json_encode(['success'=>false, 'error'=>'Falta group_id']);
  exit;
}
$group_id = (int)$data['group_id'];

$stmt = $pdo->prepare(
  "SELECT id_canal, nombre, tipo 
     FROM canales 
    WHERE id_grupo = ?
 ORDER BY fecha_creacion"
);
$stmt->execute([$group_id]);
$all = $stmt->fetchAll(PDO::FETCH_ASSOC);

$text  = [];
$voice = [];
foreach ($all as $ch) {
  if ($ch['tipo'] === 'voz') {
    $voice[] = $ch;
  } else {
    $text[] = $ch;
  }
}

echo json_encode(['success'=>true, 'text'=>$text, 'voice'=>$voice]);
