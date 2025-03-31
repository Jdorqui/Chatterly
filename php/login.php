<?php
require 'conexion.php';
session_start();

$usuario = $_POST['usuario'] ?? '';
$password = $_POST['password'] ?? '';

try 
{
    //consulta preparada para obtener el usuario
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE username = :usuario");
    $stmt->bindParam(':usuario', $usuario, PDO::PARAM_STR);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC); //obtener la fila de la consulta

    if ($row) //si el usuario existe 
    {
        if (password_verify($password, $row['password'])) //verificar la contraseña
        {
            $_SESSION['usuario'] = $usuario;
            $_SESSION['password'] = $password;

            $update_stmt = $pdo->prepare("UPDATE usuarios SET en_linea = 1 WHERE username = :usuario"); //actualiza el campo en_linea a 1
            $update_stmt->bindParam(':usuario', $usuario, PDO::PARAM_STR);
            $update_stmt->execute();

            echo json_encode(["status" => "success", "message" => "Inicio de sesión exitoso."]);
        } 
        else 
        {
            echo json_encode(["status" => "error", "message" => "Usuario o contraseña no válidos."]);
        }
    }
    else 
    {
        echo json_encode(["status" => "error", "message" => "Usuario o contraseña no válidos."]);
    }
} 
catch (PDOException $e) 
{
    echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
}
?>