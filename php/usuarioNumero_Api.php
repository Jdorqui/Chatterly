<?php
require 'conexion.php';

$stmt = $pdo->prepare("SELECT id_user FROM usuarios WHERE :usuario = alias");
$stmt->bindParam(':usuario', $_POST['usuario'], PDO::PARAM_STR);
$stmt->execute();
$row = $stmt->fetch(PDO::FETCH_ASSOC);
echo json_encode($row);
?>