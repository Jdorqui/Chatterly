<?php
session_start();
require_once "conexion.php"; // asegúrate de tener esto apuntando a tu conexión PDO

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit();
}

$usuario = $_SESSION['usuario'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombreGrupo = $_POST['nombre_grupo'] ?? null;

    if (!$nombreGrupo || !isset($_FILES['imagen_grupo'])) {
        echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
        exit();
    }

    // Obtener ID del usuario que crea el grupo
    $stmt = $pdo->prepare("SELECT id_user FROM usuarios WHERE username = ?");
    $stmt->execute([$usuario]);
    $usuarioData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuarioData) {
        echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
        exit();
    }

    $idCreador = $usuarioData['id_user'];

    // Insertar grupo (sin imagen aún)
    $stmt = $pdo->prepare("INSERT INTO grupos (nombre, id_creador) VALUES (?, ?)");
    $stmt->execute([$nombreGrupo, $idCreador]);

    $idGrupo = $pdo->lastInsertId();

    // Ruta para imagen
    $baseDir = "../assets/users/$usuario/groups/$idGrupo/img_profile/";
    if (!is_dir($baseDir)) {
        mkdir($baseDir, 0777, true);
    }

    $fileName = basename($_FILES['imagen_grupo']['name']);
    $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $targetFile = $baseDir . "icon." . $fileType;

    if (in_array($fileType, ['png', 'jpg', 'jpeg'])) {
        if (move_uploaded_file($_FILES['imagen_grupo']['tmp_name'], $targetFile)) {
            echo json_encode([
                'success' => true,
                'group_id' => $idGrupo,
                'image_path' => $targetFile
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al mover el archivo.']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Tipo de imagen no permitido.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
?>
