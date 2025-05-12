<?php
session_start();
header('Content-Type: application/json');
require_once "conexion.php";

// Leer JSON
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Fallback a POST clásico si fuera necesario
$groupId = isset($data['group_id'])
    ? (int)$data['group_id']
    : (isset($_POST['group_id'])
        ? (int)$_POST['group_id']
        : null);

if (!$groupId) {
    echo json_encode(['success'=>false, 'error'=>'Falta group_id']);
    exit;
}

// Obtener nombre (por seguridad, aunque ya lo tienes en el front)
$stmt = $pdo->prepare("SELECT nombre FROM grupos WHERE id_grupo = ?");
$stmt->execute([$groupId]);
$grupo = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$grupo) {
    echo json_encode(['success'=>false, 'error'=>'Grupo no encontrado']);
    exit;
}

// Guardar en sesión si lo necesitas
$_SESSION['group_id']   = $groupId;
$_SESSION['group_name'] = $grupo['nombre'];

echo json_encode([
  'success'    => true,
  'group_name' => $grupo['nombre']
]);
