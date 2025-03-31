<?php
session_start();
require 'conexion.php';

if (isset($_SESSION['usuario'])) 
{
    try 
    {
        $usuario = $_SESSION['usuario'];

        //cambia el campo en linea a 0
        $update_stmt = $pdo->prepare("UPDATE usuarios SET en_linea = 0 WHERE username = :usuario");
        $update_stmt->bindParam(':usuario', $usuario, PDO::PARAM_STR);
        $update_stmt->execute();

        //cierra la sesion
        session_unset(); 
        session_destroy();

        //redidrecciona al index
        header("Location: ../html/index.html");
        echo json_encode(["status" => "success", "message" => "Sesión cerrada correctamente."]);
    } 
    catch (PDOException $e) 
    {
        echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
    }
} 
else 
{
    echo json_encode(["status" => "error", "message" => "No hay sesión activa."]);
}
?>