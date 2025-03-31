<?php
require 'conexion.php';

$email = $_POST['email'];
$alias = $_POST['alias'];
$username = $_POST['username'];
$password = $_POST['password'];
$fecha_nacimiento = $_POST['fecha_nacimiento'];
$terminos_aceptados = isset($_POST['terminos']) ? 1 : 0; // 1 si se aceptaron los términos, 0 si no

//validacion para campos no vacios
if (empty($email)) 
{
    echo json_encode(["status" => "error", "message" => "El correo electrónico es obligatorio."]);
    exit();
}
if (empty($alias)) 
{
    echo json_encode(["status" => "error", "message" => "El nombre de usuario es obligatorio."]);
    exit();
}
if (empty($password)) 
{
    echo json_encode(["status" => "error", "message" => "La contraseña es obligatoria."]);
    exit();
}
if (empty($fecha_nacimiento)) 
{
    echo json_encode(["status" => "error", "message" => "La fecha de nacimiento es obligatoria."]);
    exit();
}

//formato de correo electronico
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) 
{
    echo json_encode(["status" => "error", "message" => "El formato del correo electronico no es valido."]);
    exit();
}

//contraseña (5 caracteres, 1 mayuscula, 1 caracter especial)
if (!preg_match('/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{5,}$/', $password)) 
{
    echo json_encode(["status" => "error", "message" => "La contraseña debe tener al menos 5 caracteres, una mayuscula y un caracter especial."]);
    exit();
}

//fecha de nacimiento (mínimo 18 años y no puede ser futura)
$fecha_actual = new DateTime();
$fecha_minima = $fecha_actual->modify('-18 years');
$fecha_nacimiento_dt = DateTime::createFromFormat('Y-m-d', $fecha_nacimiento);

if (!$fecha_nacimiento_dt || $fecha_nacimiento_dt > new DateTime() || $fecha_nacimiento_dt > $fecha_minima) 
{
    echo json_encode(["status" => "error", "message" => "Debe tener al menos 18 años y la fecha no puede ser futura."]);
    exit();
}

//terminos y condiciones aceptados
if ($terminos_aceptados === 0) 
{
    echo json_encode(["status" => "error", "message" => "Debe aceptar los términos y condiciones."]);
    exit();
}

try 
{
    //verifica si el alias ya esta registrado
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE alias = :alias");
    $stmt->bindParam(':alias', $alias, PDO::PARAM_STR);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) 
    {
        echo json_encode(["status" => "error", "message" => "El nombre de usuario ya está registrado."]);
        exit();
    }

    //hashea la contraseña
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    //se inserta el usuario en la base de datos
    $stmt = $pdo->prepare("INSERT INTO usuarios (email, alias, password, username, fecha_nacimiento, terminos_aceptados) VALUES (:email, :alias, :password, :username, :fecha_nacimiento, :terminos_aceptados)");
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->bindParam(':alias', $alias, PDO::PARAM_STR);
    $stmt->bindParam(':password', $hashed_password, PDO::PARAM_STR);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->bindParam(':fecha_nacimiento', $fecha_nacimiento, PDO::PARAM_STR);
    $stmt->bindParam(':terminos_aceptados', $terminos_aceptados, PDO::PARAM_INT);

    if ($stmt->execute())
    {
        echo json_encode(["status" => "success", "message" => "Registro exitoso."]);
    } 
    else 
    {
        echo json_encode(["status" => "error", "message" => "Error al registrar."]);
    }
} 
catch (PDOException $e) 
{
    echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
}
?>