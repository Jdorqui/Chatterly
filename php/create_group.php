<?php
session_start();
require_once "conexion.php";

if (!isset($_SESSION['usuario'])) 
{
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit();
}

$usuario = $_SESSION['usuario'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') 
{
    $nombreGrupo = $_POST['nombre_grupo'] ?? null;
    if (!$nombreGrupo || !isset($_FILES['imagen_grupo'])) 
    {
        echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
        exit();
    }

    // 1) Obtener ID del usuario que crea el grupo
    $stmt = $pdo->prepare("SELECT id_user FROM usuarios WHERE username = ?");
    $stmt->execute([$usuario]);
    $usuarioData = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$usuarioData) 
    {
        echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
        exit();
    }
    $idCreador = $usuarioData['id_user'];

    // 2) Insertar grupo (sin imagen aún)
    $stmt = $pdo->prepare("INSERT INTO grupos (nombre, id_creador) VALUES (?, ?)");
    $stmt->execute([$nombreGrupo, $idCreador]);
    $idGrupo = $pdo->lastInsertId();

    // 3) Preparar directorio y nombre de archivo
    $baseDir = __DIR__ . "/../assets/users/$usuario/groups/$idGrupo/img_profile/";
    if (!is_dir($baseDir)) 
    {
        mkdir($baseDir, 0777, true);
    }

    $originalName = basename($_FILES['imagen_grupo']['name']);
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if (!in_array($ext, ['png', 'jpg', 'jpeg'])) 
    {
        echo json_encode(['success' => false, 'error' => 'Tipo de imagen no permitido.']);
        exit();
    }

    // Forzamos siempre nombre 'icon.ext'
    $dbFileName = "icon.$ext";
    $targetFile = $baseDir . $dbFileName;

    // 4) Mover el archivo y luego actualizar BD
    if (move_uploaded_file($_FILES['imagen_grupo']['tmp_name'], $targetFile)) 
    {
        // Guardar el nombre de la imagen en la tabla grupos
        $update = $pdo->prepare("UPDATE grupos SET imagen = ? WHERE id_grupo = ?");
        $update->execute([$dbFileName, $idGrupo]);

        echo json_encode([
            'success'     => true,
            'group_id'    => $idGrupo,
            'image_path'  => "../assets/users/$usuario/groups/$idGrupo/img_profile/$dbFileName"
        ]);
    } 
    else 
    {
        echo json_encode(['success' => false, 'error' => 'Error al mover el archivo.']);
    }
} 
else 
{
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
?>