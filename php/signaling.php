<?php
// signaling.php
session_start();
require __DIR__ . '/conexion.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents("php://input"), true);
  $id_emisor   = $data['id_emisor']   ?? null;
  $id_receptor = $data['id_receptor'] ?? null;
  $type        = $data['type']        ?? null;
  $payload     = $data['data']        ?? null;
  if (!$id_emisor || !$id_receptor || !$type || !$payload) {
    echo json_encode(["error"=>"Faltan parámetros"]); exit;
  }

  if ($type === 'ice') {
    // leer existentes
    $stmt = $pdo->prepare("SELECT ice FROM llamadas WHERE id_emisor=? AND id_receptor=?");
    $stmt->execute([$id_emisor, $id_receptor]);
    $existing = $stmt->fetchColumn();
    $candidates = $existing ? json_decode($existing, true) : [];
    $candidates[] = $payload;
    $json = json_encode($candidates);
    $pdo->prepare("UPDATE llamadas SET ice=? WHERE id_emisor=? AND id_receptor=?")
        ->execute([$json, $id_emisor, $id_receptor]);
    echo json_encode(["status"=>"ok"]);
    exit;
  }

  // offer / answer
  $json = json_encode($payload);
  $pdo->prepare("UPDATE llamadas SET {$type} = ? WHERE id_emisor = ? AND id_receptor = ?")
      ->execute([$json, $id_emisor, $id_receptor]);
  echo json_encode(["status"=>"ok"]);
  exit;
}

// GET => obtener datos
if ($_GET['modo'] === 'obtener') {
  $type        = $_GET['type']        ?? null;
  $id_emisor   = $_GET['id_emisor']   ?? null;
  $id_receptor = $_GET['id_receptor'] ?? null;
  if (!$type || !$id_emisor || !$id_receptor) {
    echo json_encode(["error"=>"Faltan parámetros"]); exit;
  }

  $stmt = $pdo->prepare("SELECT $type FROM llamadas WHERE id_emisor=? AND id_receptor=?");
  $stmt->execute([$id_emisor, $id_receptor]);
  $row = $stmt->fetchColumn();

  // para ICE devolvemos array, para offer/answer el objeto
  if ($type === 'ice') {
    $data = json_decode($row, true) ?: [];
  } else {
    $data = json_decode($row);
  }
  echo json_encode(["data"=>$data]);
  exit;
}
