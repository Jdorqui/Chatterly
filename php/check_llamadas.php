<?php
header('Content-Type: application/json');
require __DIR__ . '/conexion.php';

$id = $_GET['id'] ?? null;

if (!$id) 
{
  echo json_encode(["status" => "error", "msg" => "Falta ID"]);
  exit;
}

$stmt = $pdo->prepare("
  SELECT l.id_emisor, u.alias
  FROM llamadas l
  JOIN usuarios u ON u.id_user = l.id_emisor
  WHERE l.id_receptor = ? AND l.estado = 'pendiente'
  ORDER BY l.fecha_inicio DESC
  LIMIT 1
");
$stmt->execute([$id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) 
{
  echo json_encode([
    "status" => "llamada",
    "id_emisor" => $row['id_emisor'],
    "alias" => $row['alias']
  ]);
} 
else 
{
  echo json_encode(["status" => "libre"]);
}