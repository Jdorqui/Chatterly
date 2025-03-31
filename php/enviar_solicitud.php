<?php
session_start();
require 'conexion.php';

$usuario = $_SESSION['usuario']; //obtener el nombre de usuario desde la sesión

//verificar si el usuario existe en la base de datos
$stmt = $pdo->prepare("SELECT id_user FROM usuarios WHERE username = ?");
$stmt->execute([$usuario]);
$usuarioData = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$usuarioData) 
{
    echo "El usuario no existe en la base de datos.";
    exit();
}

$emisor = $usuarioData['id_user']; //obtener el id del usuario

//obtener el alias del amigo desde el formulario
if (isset($_POST['alias_amigo'])) 
{
    $alias_amigo = $_POST['alias_amigo']; //alias del amigo
}
else 
{
    echo "No se ha proporcionado el alias del amigo.";
    exit();
}

//verificar si el alias del amigo existe en la base de datos
$stmt = $pdo->prepare("SELECT id_user FROM usuarios WHERE alias = ?");
$stmt->execute([$alias_amigo]);
$amigoData = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$amigoData) 
{
    echo "El amigo no existe en la base de datos.";
    exit();
}

$id_amigo = $amigoData['id_user']; //obtiene el id del amigo

//verificar si ya existen relaciones de amistad o solicitudes pendientes
$stmt = $pdo->prepare("SELECT * FROM amigos WHERE (id_user1 = ? AND id_user2 = ?) OR (id_user1 = ? AND id_user2 = ?)");
$stmt->execute([$emisor, $id_amigo, $id_amigo, $emisor]);
$relacion = $stmt->fetch(PDO::FETCH_ASSOC);

if ($relacion) 
{
    echo "Ya existe una solicitud pendiente o ya son amigos.";
    exit();
}

//insertar la nueva solicitud de amistad
$stmt = $pdo->prepare("INSERT INTO amigos (id_user1, id_user2, estado) VALUES (?, ?, 'pendiente')");
$stmt->execute([$emisor, $id_amigo]);
header('Location: chatterly.php');
?>