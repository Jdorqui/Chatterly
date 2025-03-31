<?php
    session_start(); // Iniciamos la sesión

    if (!isset($_SESSION['usuario']) || !isset($_SESSION['password']))  // Si el usuario no ha iniciado sesión
    { 
        header("Location: index.html"); // Redirecciona al index
        exit();
    }

    $usuario = $_SESSION['usuario'];

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['profile_picture'])) 
    {
        // Obtener el nombre del usuario (puedes modificar para usar sesiones o entradas dinámicas)
        $userName = $usuario ?? 'default_user'; // Cambia según tu lógica de usuario
        $baseDir = "../assets/users/";
        $userDir = $baseDir . $userName;
        $targetDir = $userDir . "/img_profile/";

        
        if (!is_dir($userDir)) //verifica si el directorio del usuario existe
        {
            mkdir($userDir, 0777, true); //crea el directorio del usuario
        }
        if (!is_dir($targetDir)) 
        {
            mkdir($targetDir, 0777, true); //crea el directorio de img_profile
        }

        $fileName = basename($_FILES['profile_picture']['name']); //obtiene el nombre del archivo
        $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION)); //obtiene la extensión del archivo
        $targetFile = $targetDir . $fileType; //se crea el nombre del archivo
        
        if (in_array($fileType, ['png', 'jpg', 'jpeg'])) //valida que el archivo sea una imagen
        {
            if (move_uploaded_file($_FILES['profile_picture']['tmp_name'], $targetFile)) 
            {
                echo json_encode(['success' => true, 'newImagePath' => $targetFile]);
            } 
            else 
            {
                echo json_encode(['success' => false, 'error' => 'Error al mover el archivo.']);
            }
        } 
        else 
        {
            echo json_encode(['success' => false, 'error' => 'Tipo de archivo no permitido.']);
        }
    } 
    else 
    {
        echo json_encode(['success' => false, 'error' => 'Solicitud inválida.']);
    }
?>