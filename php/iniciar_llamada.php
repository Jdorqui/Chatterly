<?php
session_start();
header('Content-Type: application/json');
require 'conexion.php';

$d = json_decode(file_get_contents("php://input"), true); //lee el JSON del body
$e = $d['id_emisor']   ?? null; // Obtener el ID del emisor
$r = $d['id_receptor'] ?? null; // Obtener el ID del receptor

if (!$e || !$r) //verifica que no falten datos obligatorios
{ 
  echo json_encode(["status"=>"error","msg"=>"Faltan datos"]); //responde con un error
  exit; 
}

//elimina cualquier llamada existente entre emisor y receptor
$pdo->prepare("DELETE FROM llamadas WHERE id_emisor=? AND id_receptor=?")->execute([$e,$r]); 

//inserta una nueva llamada con estado pendiente
$stmt = $pdo->prepare(
  "INSERT INTO llamadas (id_emisor, id_receptor, estado, ice, offer, answer) VALUES (?,?,'pendiente','[]',NULL,NULL)"
);

// ejecuta la insercion y devuelve el estado de la operacion
$ok = $stmt->execute([$e,$r]);
echo json_encode(["status"=>$ok?"ok":"fail"]);