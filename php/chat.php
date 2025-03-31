<?php
require 'conexion.php';
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); //establecer el modo de error a excepciones
$id_usuario_actual = $_POST['usuario']; //obtener el id del usuario actual

//obtener los mensajes entre el usuario actual y el destinatario
if (isset($_POST['destinatario'])) 
{
    $destinatario = $_POST['destinatario'];
    $stmt = $pdo->prepare("
    SELECT m.contenido, m.fecha_envio, u.alias, u.id_user AS id_emisor, m.tipo
    FROM mensajes m
    JOIN usuarios u ON m.id_emisor = u.id_user
    WHERE (m.id_emisor = :id_usuario AND m.id_receptor = :destinatario)
       OR (m.id_emisor = :destinatario AND m.id_receptor = :id_usuario)
    ORDER BY m.fecha_envio ASC
");
$stmt->execute(['id_usuario' => $id_usuario_actual, 'destinatario' => $destinatario]);
$mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($mensajes); //devuelve los mensajes en formato JSON

}

//enviar un mensaje de texto
if (isset($_POST['mensaje'])) {
    $mensaje = $_POST['mensaje'];
    $destinatario = $_POST['destinatario'];

    //si es un mensaje de texto
    if (isset($mensaje) && !empty($mensaje)) 
    {
        $stmt = $pdo->prepare("INSERT INTO mensajes (id_emisor, id_receptor, contenido, tipo) VALUES ($id_usuario_actual, $destinatario, '$mensaje', 'texto')");
        $stmt->execute([

        ]);
        echo json_encode(['success' => true]);
    }
}
?>