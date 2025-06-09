<?php
    session_start();
    require 'conexion.php';

    $usuario = $_POST['usuario'];

    //obtiene el id del usuario actual
    $stmt = $pdo->prepare("SELECT id_user FROM usuarios WHERE username = ?");
    $stmt->execute([$usuario]);
    $usuarioData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuarioData) 
    {
        echo json_encode(['success' => false, "error" => "Usuario no encontrado."]);
        exit();
    }
    $id_usuario_actual = $usuarioData['id_user'];

    //se definen las variables para el archivo, el directorio y el destinatario
    $baseDir = "../assets/users/"; //directorio base
    $userName = isset($usuario) ? htmlspecialchars($usuario, ENT_QUOTES, 'UTF-8') : ''; //formatear el nombre de usuario para evitar inyecciones
    $destinatario = isset($_POST['destinatario']) ? htmlspecialchars($_POST['destinatario'], ENT_QUOTES, 'UTF-8') : ''; //formatear el destinatario para evitar inyecciones
    $targetDir = $baseDir . $userName . "/chat_files/"; //destino

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['archivo']) && !empty($destinatario)) // Verificar si se ha recibido la solicitud correctamente
    {
        //se crean los directorios de usuario si no existe
        if (!is_dir($baseDir . $userName))
        {
            mkdir($baseDir . $userName, 0777, true); //se crea el directorio del usuario
        }
        if (!is_dir($targetDir)) 
        {
            mkdir($targetDir, 0777, true); //se crea el directorio de chat_files
        }

        // Variables del archivo
        $fileName = basename($_FILES['archivo']['name']); 
        $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $targetFile = $targetDir . $fileName; //se crea el nombre del archivo

        if ($_FILES['archivo']['size'] > 10485760) //tamaño maximo del archivo
        {
            echo json_encode(['success' => false, 'error' => 'El archivo excede el tamaño máximo permitido (10 MB).']);
            exit();
        }

        if (move_uploaded_file($_FILES['archivo']['tmp_name'], $targetFile)) //se mueve el archivo al directorio chat_files
        {
            //se inserta el mensaje en la base de datos
            $stmt = $pdo->prepare("INSERT INTO mensajes (id_emisor, id_receptor, contenido, tipo) VALUES (:id_emisor, :id_receptor, :contenido, 'archivo')");
            $stmt->execute([
                'id_emisor' => $id_usuario_actual,
                'id_receptor' => $destinatario,
                'contenido' => $targetFile
            ]); //se inserta el mensaje en la base de datos

            echo json_encode([
                'success' => true,
                'newFilePath' => $targetFile,
                'fileName' => $fileName
            ]); //se envia la respuesta
        }
    } 
    else 
    {
        echo json_encode(['success' => false, 'error' => 'Solicitud inválida o falta destinatario.']);
    }
?>