<?php
// responder_llamada.php
session_start();
require 'conexion.php';
header('Content-Type: application/json');
$d = json_decode(file_get_contents("php://input"), true);
$e = $d['id_emisor']   ?? null;
$r = $d['id_receptor'] ?? null;
$x = $d['respuesta']   ?? null;
if (!$e||!$r||!$x) { echo json_encode(["status"=>"error","msg"=>"Faltan datos"]); exit; }

$stmt = $pdo->prepare(
  "UPDATE llamadas
     SET estado = ?,
         fecha_fin = CASE WHEN ?='finalizada' THEN NOW() ELSE NULL END
   WHERE id_emisor=? AND id_receptor=?"
);
$ok = $stmt->execute([$x,$x,$e,$r]);
echo json_encode(["status"=>$ok?"ok":"fail"]);
