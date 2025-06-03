<?php
require 'conexion.php';
header('Content-Type: application/json');

// 1) Leer JSON o fallback a $_POST
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) 
{
    $data = $_POST;
}

// Campos potenciales
if (isset($data['email'])) 
{
    $email = trim($data['email']);
} 
else 
{
    $email = '';
}

if (isset($data['new_password'])) 
{
    $new_password = $data['new_password'];
} 
else 
{
    $new_password = '';
}

if (isset($data['confirm_password'])) 
{
    $confirm_password = $data['confirm_password'];
} 
else 
{
    $confirm_password = '';
}

if (isset($data['id_user'])) 
{
    $id_user = intval($data['id_user']);
}
else 
{
    $id_user = 0;
}

if (isset($data['old_password'])) 
{
    $old_password = $data['old_password'];
} 
else 
{
    $old_password = '';
}

function respuesta($success, $message) 
{
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}


if ($email !== '') // recuperacion por email
{
    if (!$new_password || !$confirm_password) 
    {
        respuesta(false, 'Faltan los datos de la nueva contraseña.');
    }
    if ($new_password !== $confirm_password) 
    {
        respuesta(false, 'Las contraseñas no coinciden.');
    }
    if (!preg_match('/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{5,}$/', $new_password)) 
    {
        respuesta(false, 'La contraseña debe tener al menos 5 caracteres, una mayúscula y un carácter especial.');
    }

    // ¿Existe el email?
    $stmt = $pdo->prepare("SELECT id_user FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    if (!$stmt->fetch(PDO::FETCH_ASSOC)) 
    {
        respuesta(false, 'El correo no está registrado.');
    }

    // Actualizar contraseña
    $hash = password_hash($new_password, PASSWORD_DEFAULT);
    $pdo->prepare("UPDATE usuarios SET password = ? WHERE email = ?")
        ->execute([$hash, $email]);

    respuesta(true, 'Contraseña restablecida.');
}


if ($id_user > 0 && $old_password !== '' && $new_password !== '')  //Flujo de cambio logueado
{
    // Comprobar antigua
    $stmt = $pdo->prepare("SELECT password FROM usuarios WHERE id_user = ?");
    $stmt->execute([$id_user]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || !password_verify($old_password, $row['password'])) 
    {
        respuesta(false, 'Contraseña actual incorrecta.');
    }

    // Validar nueva
    if (!preg_match('/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{5,}$/', $new_password)) 
    {
        respuesta(false, 'La contraseña debe tener al menos 5 caracteres, una mayuscula y un caracter especial.');
    }

    // Hacer hash y UPDATE
    $hash = password_hash($new_password, PASSWORD_DEFAULT);
    $pdo->prepare("UPDATE usuarios SET password = ? WHERE id_user = ?")
        ->execute([$hash, $id_user]);

    respuesta(true, 'Contraseña cambiada.');
}

// Si no coincide ningún flujo
respuesta(false, 'Parámetros inválidos.');