<?php
require 'conexion.php';

$stmt = $pdo->prepare("SELECT alias FROM usuarios WHERE :id_user = id_user");
$stmt->bindParam(':id_user', $_POST['id_user'], PDO::PARAM_STR);
$stmt->execute();
$row = $stmt->fetch(PDO::FETCH_ASSOC);
echo json_encode($row);
?>