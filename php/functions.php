<?php 
function get_id_user(PDO $pdo, string $usuario) //esta funcion obtiene el id del usuario
{
    $stmt = $pdo->prepare('SELECT id_user FROM usuarios WHERE username = ? LIMIT 1');
    $stmt->execute([$usuario]);
    $usuarioData = $stmt->fetch(PDO::FETCH_ASSOC);

    return (int) $usuarioData['id_user'];
}

function obtenerAlias(PDO $pdo, int $id_user): string 
{
    $stmt = $pdo->prepare("SELECT alias FROM usuarios WHERE id_user = ?");
    $stmt->execute([$id_user]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? $row['alias'] : '';
}

function mostrarSolicitudesPendientes(PDO $pdo, string $usuario): void 
{
    $miId = get_id_user($pdo, $usuario); //obtiene el id del usario
    if (!$miId) //verifica si el usuario existe
    {
        echo '<p>Usuario no encontrado.</p>';
        return;
    }

    // recuperar solicitudes
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

function get_online_friends(PDO $pdo, string $usuario): void
{
    // 1. Obtener el id_user del usuario a partir de su username
    $userQuery = $pdo->prepare("SELECT id_user FROM usuarios WHERE username = ?");
    $userQuery->execute(array($usuario));
    $userRow = $userQuery->fetch(PDO::FETCH_ASSOC);
    if ($userRow)
    {
        $userId = (int)$userRow['id_user'];
    }
    else
    {
        $userId = 0;
    }

    // 2. Obtener los amigos en línea con relación aceptada
    $friendsQuery = $pdo->prepare("
        SELECT u.username, u.id_user
        FROM amigos a
        JOIN usuarios u 
            ON (u.id_user = a.id_user1 OR u.id_user = a.id_user2)
        WHERE (a.id_user1 = :me OR a.id_user2 = :me)
            AND u.en_linea = 1
            AND u.id_user != :me
            AND a.estado = 'aceptado'
    ");
    $friendsQuery->execute(array('me' => $userId));
    $onlineFriends = $friendsQuery->fetchAll(PDO::FETCH_ASSOC);

    // 3. Mostrar botones de amigos en línea
    if (count($onlineFriends) > 0)
    {
        foreach ($onlineFriends as $friend)
        {
            // Carpeta de imágenes del amigo
            $friendDir = "../assets/users/" . $friend['username'] . "/img_profile/";
            $defaultImage = '../assets/imgs/default_profile.png';

            // Buscar imágenes en la carpeta del amigo
            $pattern = $friendDir . '*.{jpg,jpeg,png}';
            $files = glob($pattern, GLOB_BRACE);
            if ($files === false || empty($files))
            {
                $files = array();
            }

            // Si hay imágenes, seleccionar la más reciente, si no, usar imagen por defecto
            if (!empty($files))
            {
                usort($files, function($a, $b)
                {
                    return filemtime($b) - filemtime($a);
                });
                $profileImage = $files[0];
            }
            else
            {
                $profileImage = $defaultImage;
            }

            // Escapar valores para HTML
            $profileImageEscaped = htmlspecialchars($profileImage, ENT_QUOTES, 'UTF-8');
            $friendNameEscaped = htmlspecialchars($friend['username'], ENT_QUOTES, 'UTF-8');
            $friendId = (int)$friend['id_user'];

            // Imprimir el botón HTML del amigo
            echo "
            <button onclick='openchat(" . $friendId . ")' class='friend-tab-button' id='button_name'>
                <img src='" . $profileImageEscaped . "' id='fotoFriend' alt='Foto de perfil'>
                <span id='nombreboton'>" . $friendNameEscaped . "</span>
            </button>";
        }
    }
    else
    {
        // Mensaje si no hay amigos en línea
        echo "<p id='no_friends'>No tienes amigos en línea</p>";
    }
}

function get_all_friends(PDO $pdo, string $usuario): void
{
    // 1. Obtener el ID del usuario actual a partir del nombre de usuario
    $userQuery = $pdo->prepare("SELECT id_user FROM usuarios WHERE username = ?");
    $userQuery->execute(array($usuario));
    $userRow = $userQuery->fetch(PDO::FETCH_ASSOC);
    if ($userRow)
    {
        $userId = (int)$userRow['id_user'];
    }
    else
    {
        $userId = 0;
    }

    // 2. Recuperar todos los amigos aceptados (que no sean el propio usuario)
    $friendsQuery = $pdo->prepare("
        SELECT u.username
        FROM amigos a
        JOIN usuarios u 
            ON (u.id_user = a.id_user1 OR u.id_user = a.id_user2)
        WHERE (a.id_user1 = :me OR a.id_user2 = :me)
            AND a.estado = 'aceptado'
            AND u.id_user != :me
    ");
    $friendsQuery->execute(array('me' => $userId));
    $friendsList = $friendsQuery->fetchAll(PDO::FETCH_ASSOC);

    // 3. Mostrar cada amigo con su foto de perfil
    if (count($friendsList) > 0)
    {
        foreach ($friendsList as $friend)
        {
            // Ruta de la carpeta de imagen del amigo
            $friendDir = "../assets/users/" . $friend['username'] . "/img_profile/";
            $defaultImage = '../assets/imgs/default_profile.png';

            // Buscar imágenes jpg, jpeg o png en la carpeta del amigo
            $pattern = $friendDir . '*.{jpg,jpeg,png}';
            $imageFiles = glob($pattern, GLOB_BRACE);
            if ($imageFiles === false || empty($imageFiles))
            {
                $imageFiles = array();
            }

            // Si hay imágenes, ordenarlas por fecha y elegir la más reciente, si no usar la imagen por defecto
            if (!empty($imageFiles))
            {
                usort($imageFiles, function($a, $b)
                {
                    return filemtime($b) - filemtime($a);
                });
                $profileImage = $imageFiles[0];
            }
            else
            {
                $profileImage = $defaultImage;
            }

            // Escapar los valores para evitar problemas en el HTML
            $profileImageEscaped = htmlspecialchars($profileImage, ENT_QUOTES, 'UTF-8');
            $friendNameEscaped = htmlspecialchars($friend['username'], ENT_QUOTES, 'UTF-8');

            // Imprimir el bloque HTML para cada amigo
            echo "
            <div id='allfriends-container'>
                <img src='" . $profileImageEscaped . "' id='fotoFriend' alt='Foto de perfil'>
                <span id='nombreboton'>" . $friendNameEscaped . "</span>
            </div>";
        }
    }
    else
    {
        // Mostrar mensaje si no tiene amigos en la lista
        echo "<p id='no_friends'>No tienes amigos en la lista</p>";
    }
}

function get_direct_messages(PDO $pdo, string $usuario): void
{
    // 1. Obtener el id_user del usuario actual
    $userQuery = $pdo->prepare("SELECT id_user FROM usuarios WHERE username = ?");
    $userQuery->execute([$usuario]);
    $userRow = $userQuery->fetch(PDO::FETCH_ASSOC);

    if (!$userRow) 
    {
        echo "<p style='text-align:center;'>Usuario no encontrado</p>";
        return;
    }

    $id_usuario_actual = (int)$userRow['id_user'];

    // 2. Recuperar la lista de amigos aceptados (AS id_amigo)
    $friendsQuery = $pdo->prepare("
        SELECT 
            u.username,
            u.id_user,
            a.id_user1,
            a.id_user2
        FROM amigos a
        JOIN usuarios u 
            ON (u.id_user = a.id_user1 OR u.id_user = a.id_user2)
        WHERE (a.id_user1 = :me OR a.id_user2 = :me)
            AND a.estado = 'aceptado'
            AND u.id_user != :me
    ");
    $friendsQuery->execute(['me' => $id_usuario_actual]);
    $friendsList = $friendsQuery->fetchAll(PDO::FETCH_ASSOC);

    // 3. Recorrer y mostrar los amigos como botones
    if ($friendsList && count($friendsList) > 0) 
    {
        foreach ($friendsList as $friend) 
        {
            // Ruta de la carpeta de imágenes del amigo
            $friendDir = "../assets/users/" . $friend['username'] . "/img_profile/";
            $defaultImage = '../assets/imgs/default_profile.png';

            // Buscar archivos de imagen válidos
            $pattern = $friendDir . '*.{jpg,jpeg,png}';
            $imageFiles = glob($pattern, GLOB_BRACE);

            // Seleccionar la foto más reciente o la imagen por defecto
            if (!empty($imageFiles)) 
            {
                usort($imageFiles, function($a, $b) 
                {
                    return filemtime($b) - filemtime($a);
                });
                $profilePhoto = $imageFiles[0];
            } 
            else 
            {
                $profilePhoto = $defaultImage;
            }

            // Determinar el id del destinatario (el amigo, no el usuario actual)
            if ($friend['id_user1'] == $id_usuario_actual) 
            {
                $destinatario = (int)$friend['id_user2'];
            } 
            else 
            {
                $destinatario = (int)$friend['id_user1'];
            }

            // Escapar los valores para el HTML
            $friendNameEscaped = htmlspecialchars($friend['username'], ENT_QUOTES, 'UTF-8');
            $profilePhotoEscaped = htmlspecialchars($profilePhoto, ENT_QUOTES, 'UTF-8');

            // Imprimir el botón de chat directo (tu botón original)
            echo "
            <button 
                onclick=\"selectFriend('".$friendNameEscaped."', '".$profilePhotoEscaped."', ".$destinatario.")\" 
                id='options-button' 
                style='display: flex; align-items: center; gap: 10px; border: none; padding: 10px; border-radius: 5px; margin-bottom: 5px; cursor: pointer; width: 100%; text-align: left;'>
                <img src='".$profilePhotoEscaped."' class='fotoFriend' alt='Foto de perfil' style='width: 30px; height: 30px; border-radius: 50%;'>
                <span id='nombreboton'>".$friendNameEscaped."</span>
            </button>";
        }
    } 
    else 
    {
        // Si no tiene amigos, mostrar mensaje
        echo "<p style='text-align: center;'>No tienes amigos en la lista</p>";
    }
}

function render_user_panel_button(PDO $pdo, string $usuario): void
{
    // obtengo carpeta del usuario
    $baseDir = "../assets/users/" . $usuario . "/img_profile/";
    $defaultImage = '../assets/imgs/default_profile.png';

    // Buscar archivos
    $pattern = $baseDir . '*.{jpg,jpeg,png}';
    $files = glob($pattern, GLOB_BRACE);
    if ($files === false || empty($files)) 
    {
        $files = [];
    }

    // Si hay archivos, ordeno por fecha de modificación
    if (!empty($files)) 
    {
        usort($files, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });
        $foto = $files[0];
    } 
    else 
    {
        $foto = $defaultImage;
    }

    // Escapar la ruta de la foto
    $fotoEsc = htmlspecialchars($foto, ENT_QUOTES, 'UTF-8');

    echo "
    <button id='panel_button' class='panel_button' onclick='showprofileinfo()'> 
      <img id='profileImg2' src='{$fotoEsc}' alt='profile' 
           style='border-radius: 50%; width: 30px; height: 30px;'> 
      <span style='color: white; font-size: 16px;'>{$usuario}</span>
    </button>";
}

function render_profile_header(PDO $pdo, string $usuario): void // Renderiza el header en opciones (foto y nombre)
{
    // 1. Carpeta de imágenes de perfil del usuario
    $baseDir = "../assets/users/" . $usuario . "/img_profile/";
    $defaultImage = '../assets/imgs/default_profile.png';

    // 2. Buscar imágenes de perfil jpg, jpeg o png
    $pattern = $baseDir . '*.{jpg,jpeg,png}';
    $profileImages = glob($pattern, GLOB_BRACE);
    if ($profileImages === false || empty($profileImages))
    {
        $profileImages = array();
    }

    // 3. Seleccionar la imagen más reciente si existe, o la imagen por defecto
    if (!empty($profileImages))
    {
        usort($profileImages, function($a, $b)
        {
            return filemtime($b) - filemtime($a);
        });
        $selectedPhoto = $profileImages[0];
    }
    else
    {
        $selectedPhoto = $defaultImage;
    }

    // 4. Escapar los valores para el HTML
    $photoEscaped = htmlspecialchars($selectedPhoto, ENT_QUOTES, 'UTF-8');
    $usernameEscaped = htmlspecialchars($usuario, ENT_QUOTES, 'UTF-8');

    // 5. Imprimir el bloque HTML del encabezado de perfil
    echo "
    <div class='profile-header'>
      <form id='uploadForm' method='POST' enctype='multipart/form-data' class='upload-form'>
        <input type='file' id='fotoProfile' name='profile_picture' accept='.png, .jpg, .jpeg' class='file-input'>
        <img id='profileImg' src='" . $photoEscaped . "' alt='profile' class='profile-img'>
        <span id='user-username' class='profile-username'>" . $usernameEscaped . "</span>
      </form>
    </div>";
}
?>