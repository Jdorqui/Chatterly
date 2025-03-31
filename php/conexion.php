<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "chatterly";

try 
{
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname;", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} 
catch (PDOException $e) 
{
    echo json_encode(["status" => "error", "message" => "Conexión fallida: " . $e->getMessage()]);
    exit();
}
