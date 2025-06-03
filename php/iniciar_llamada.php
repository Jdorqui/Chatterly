<?php
session_start();
header('Content-Type: application/json');
require 'conexion.php';


$d = json_decode(file_get_contents("php://input"), true);
$e = $d['id_emisor']   ?? null;
$r = $d['id_receptor'] ?? null;

if (!$e||!$r) 
{ 
  echo json_encode(["status"=>"error","msg"=>"Faltan datos"]); 
  exit; 
}

$pdo->prepare("DELETE FROM llamadas WHERE id_emisor=? AND id_receptor=?")->execute([$e,$r]);

$stmt = $pdo->prepare(
  "INSERT INTO llamadas
    (id_emisor, id_receptor, estado, ice, offer, answer)
   VALUES (?,?,'pendiente','[]',NULL,NULL)"
);
$ok = $stmt->execute([$e,$r]);
echo json_encode(["status"=>$ok?"ok":"fail"]);