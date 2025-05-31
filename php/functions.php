<?php 
function get_id_user(PDO $pdo, string $usuario) //esta funcion obtiene el id del usuario
{
    $stmt = $pdo->prepare('SELECT id_user FROM usuarios WHERE username = ? LIMIT 1');
    $stmt->execute([$usuario]);
    $usuarioData = $stmt->fetch(PDO::FETCH_ASSOC);

    return (int) $usuarioData['id_user'];
}

function mostrarSolicitudesPendientes(PDO $pdo, string $usuario): void {
    $miId = get_id_user($pdo, $usuario); //obtiene el id del usario
    if (!$miId) //verifica si el usuario existe
    {
        echo '<p>Usuario no encontrado.</p>';
        return;
    }

    // 2) recuperar solicitudes
    $sql = "
        SELECT a.id_user1 AS solicitante_id, u.alias AS solicitante_alias
        FROM amigos AS a
        JOIN usuarios AS u ON a.id_user1 = u.id_user
        WHERE a.id_user2 = :me
          AND a.estado  = 'pendiente'
        ORDER BY a.fecha_amistad DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':me' => $miId]); 
    $sols = $stmt->fetchAll();

    if (count($sols) > 0) //se muestran las solicitudes pendientes si hay
    {
        foreach ($sols as $sol) //recorre las solicitudes
        {
            ?>
            <div class="solicitud">
              <span><?= htmlspecialchars($sol['solicitante_alias']) ?> quiere ser tu amigo.</span>
              <form action="gestionar_solicitud.php" method="post">
                <input type="hidden" name="solicitante" value="<?= (int)$sol['solicitante_id'] ?>">
                <div class="container" style="margin: 0;">
                    <button type="submit" id="boton-solicitud" class="accept-button" name="accion" value="aceptar">Aceptar</button>
                    <button type="submit" id="boton-solicitud" class="reject-button" name="accion" value="rechazar">Rechazar</button>
                </div>
              </form>
            </div>
            <?php
        }
    } 
    else //si no hay solicitudes pendientes se muestra el mensaje
    {
        echo '<p id="no_friends">No hay solicitudes pendientes.</p>';
    }
}

function get_direct_messages(PDO $pdo, string $usuario): void
{
    // 1⃣ Obtengo el id_user del usuario
    $stmt = $pdo->prepare("SELECT id_user FROM usuarios WHERE username = ?");
    $stmt->execute([$usuario]);
    $u = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$u) {
        echo "<p style='text-align:center;'>Usuario no encontrado</p>";
        return;
    }
    $id_usuario_actual = (int)$u['id_user'];

    // 2⃣ Recupero la lista de amigos aceptados
    $stmt = $pdo->prepare("
      SELECT 
        u.username,
        a.id_user1,
        a.id_user2
      FROM amigos a
      JOIN usuarios u 
        ON (u.id_user = a.id_user1 OR u.id_user = a.id_user2)
      WHERE (a.id_user1 = :me OR a.id_user2 = :me)
        AND a.estado = 'aceptado'
        AND u.id_user != :me
    ");
    $stmt->execute(['me' => $id_usuario_actual]);
    $amigos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3⃣ Pinto cada botón tal cual tu HTML original
    if (count($amigos) > 0) {
        foreach ($amigos as $amigo) {
            $amigoDir     = "../assets/users/{$amigo['username']}/img_profile/";
            $defaultImage = '../assets/imgs/default_profile.png';
            $files        = glob($amigoDir . '*.{jpg,jpeg,png}', GLOB_BRACE) ?: [];
            if ($files) {
                usort($files, fn($a,$b)=>filemtime($b)-filemtime($a));
                $foto = $files[0];
            } else {
                $foto = $defaultImage;
            }

            $destinatario = ($amigo['id_user1'] === $id_usuario_actual)
                          ? $amigo['id_user2']
                          : $amigo['id_user1'];

            $nombreEsc = htmlspecialchars($amigo['username'], ENT_QUOTES, 'UTF-8');
            $fotoEsc   = htmlspecialchars($foto, ENT_QUOTES, 'UTF-8');

            echo "
            <button 
                onclick=\"selectFriend('{$nombreEsc}', '{$fotoEsc}', {$destinatario})\" 
                id='options-button' 
                style='display: flex; align-items: center; gap: 10px; border: none; padding: 10px; border-radius: 5px; margin-bottom: 5px; cursor: pointer; width: 100%; text-align: left;'>
                <img src='{$fotoEsc}' id='fotoFriend' alt='Foto de perfil' style='width: 30px; height: 30px; border-radius: 50%;'>
                <span id='nombreboton'>{$nombreEsc}</span>
            </button>";
        }
    } else {
        echo "<p style='text-align: center;'>No tienes amigos en la lista</p>";
    }
}

function render_user_panel_button(PDO $pdo, string $usuario): void
{
    // obtengo carpeta del usuario
    $baseDir      = "../assets/users/{$usuario}/img_profile/";
    $defaultImage = '../assets/imgs/default_profile.png';
    $files        = glob($baseDir . '*.{jpg,jpeg,png}', GLOB_BRACE) ?: [];
    if ($files) {
        usort($files, fn($a,$b)=>filemtime($b)-filemtime($a));
        $foto = $files[0];
    } else {
        $foto = $defaultImage;
    }
    $fotoEsc = htmlspecialchars($foto, ENT_QUOTES, 'UTF-8');

    echo "
    <button id='panel_button' class='panel_button' onclick='showprofileinfo()'> 
      <img id='profileImg2' src='{$fotoEsc}' alt='profile' 
           style='border-radius: 50%; width: 30px; height: 30px;'> 
      <span style='color: white; font-size: 16px;'>{$usuario}</span>
    </button>";
}

function get_online_friends(PDO $pdo, string $usuario): void
{
    // ID del usuario
    $stmt = $pdo->prepare("SELECT id_user FROM usuarios WHERE username = ?");
    $stmt->execute([$usuario]);
    $u = $stmt->fetch(PDO::FETCH_ASSOC);
    $me = $u ? (int)$u['id_user'] : 0;

    // Amigos en línea SOLO si la amistad está aceptada
    $stmt = $pdo->prepare("
      SELECT u.username, u.id_user
      FROM amigos a
      JOIN usuarios u 
        ON (u.id_user = a.id_user1 OR u.id_user = a.id_user2)
      WHERE (a.id_user1 = :me OR a.id_user2 = :me)
        AND u.en_linea = 1
        AND u.id_user != :me
        AND a.estado = 'aceptado'
    ");
    $stmt->execute(['me' => $me]);
    $amigos_en_linea = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($amigos_en_linea) > 0) {
        foreach ($amigos_en_linea as $amigo) {
            $dir          = "../assets/users/{$amigo['username']}/img_profile/";
            $defaultImage = '../assets/imgs/default_profile.png';
            $files        = glob($dir . '*.{jpg,jpeg,png}', GLOB_BRACE) ?: [];
            if ($files) {
                usort($files, fn($a,$b)=>filemtime($b)-filemtime($a));
                $foto = $files[0];
            } else {
                $foto = $defaultImage;
            }
            $fotoEsc = htmlspecialchars($foto, ENT_QUOTES, 'UTF-8');
            $nameEsc = htmlspecialchars($amigo['username'], ENT_QUOTES, 'UTF-8');
            $idEsc   = (int)$amigo['id_user'];

            echo "
            <button onclick='openchat({$idEsc})' class='friend-tab-button' id='button_name'>
              <img src='{$fotoEsc}' id='fotoFriend' alt='Foto de perfil'>
              <span id='nombreboton'>{$nameEsc}</span>
            </button>";
        }
    } else {
        echo "<p id='no_friends'>No tienes amigos en línea</p>";
    }
}

function get_all_friends(PDO $pdo, string $usuario): void
{
    // ID del usuario
    $stmt = $pdo->prepare("SELECT id_user FROM usuarios WHERE username = ?");
    $stmt->execute([$usuario]);
    $u = $stmt->fetch(PDO::FETCH_ASSOC);
    $me = $u ? (int)$u['id_user'] : 0;

    // Todos los amigos aceptados
    $stmt = $pdo->prepare("
      SELECT u.username
      FROM amigos a
      JOIN usuarios u 
        ON (u.id_user = a.id_user1 OR u.id_user = a.id_user2)
      WHERE (a.id_user1 = :me OR a.id_user2 = :me)
        AND a.estado = 'aceptado'
        AND u.id_user != :me
    ");
    $stmt->execute(['me' => $me]);
    $amigos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($amigos) > 0) {
        foreach ($amigos as $amigo) {
            $dir          = "../assets/users/{$amigo['username']}/img_profile/";
            $defaultImage = '../assets/imgs/default_profile.png';
            $files        = glob($dir . '*.{jpg,jpeg,png}', GLOB_BRACE) ?: [];
            if ($files) {
                usort($files, fn($a,$b)=>filemtime($b)-filemtime($a));
                $foto = $files[0];
            } else {
                $foto = $defaultImage;
            }
            $fotoEsc = htmlspecialchars($foto, ENT_QUOTES, 'UTF-8');
            $nameEsc = htmlspecialchars($amigo['username'], ENT_QUOTES, 'UTF-8');

            echo "
            <div id='allfriends-container'>
              <img src='{$fotoEsc}' id='fotoFriend' alt='Foto de perfil'>
              <span id='nombreboton'>{$nameEsc}</span>
            </div>";
        }
    } else {
        echo "<p id='no_friends'>No tienes amigos en la lista</p>";
    }
}

function render_profile_header(PDO $pdo, string $usuario): void //renderiza el header en opciones (foto y nombre)
{
    // Carpeta de imágenes de perfil
    $baseDir       = "../assets/users/{$usuario}/img_profile/";
    $defaultImage  = '../assets/imgs/default_profile.png';
    $profileImages = glob($baseDir . '*.{jpg,jpeg,png}', GLOB_BRACE) ?: [];

    if (!empty($profileImages)) {
        usort($profileImages, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });
        $foto = $profileImages[0];
    } else {
        $foto = $defaultImage;
    }

    // Escape de valores
    $fotoEsc    = htmlspecialchars($foto,    ENT_QUOTES, 'UTF-8');
    $usuarioEsc = htmlspecialchars($usuario, ENT_QUOTES, 'UTF-8');

    echo "
    <div class='profile-header'>
      <form id='uploadForm' method='POST' enctype='multipart/form-data' class='upload-form'>
        <input type='file' id='fotoProfile' name='profile_picture' accept='.png, .jpg, .jpeg' class='file-input'>
        <img id='profileImg' src='{$fotoEsc}' alt='profile' class='profile-img'>
        <span id='user-username' class='profile-username'>{$usuarioEsc}</span>
      </form>
    </div>";
}
?>