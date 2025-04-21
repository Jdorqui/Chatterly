<?php
    session_start();
    require 'conexion.php';

    if (!isset($_SESSION['usuario']) || !isset($_SESSION['password']))  //si el usuario no ha iniciado sesion
    { 
        header("Location: ../html/index.html"); //redirecciona al index
        exit(); //finaliza la ejecucion del script
    }

    //recupera el usuario y contraseña de la sesion
    $usuario = $_SESSION['usuario'];
    
    //obtiene el id del usuario
    $stmt = $pdo->prepare("SELECT id_user FROM usuarios WHERE username = ?");
    $stmt->execute([$usuario]);
    $usuarioData = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$usuarioData) 
    {
        echo "Usuario no encontrado.";
        exit();
    }
    $id_usuario_actual = $usuarioData['id_user'];

    //obtiene las solicitudes pendientes
    $stmt = $pdo->prepare("SELECT usuarios.alias, amigos.id_user1 FROM amigos 
                        JOIN usuarios ON amigos.id_user1 = usuarios.id_user 
                        WHERE amigos.id_user2 = ? AND amigos.estado = 'pendiente'");
    $stmt->execute([$id_usuario_actual]);
    $solicitudes_pendientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //obtener la lista de amigos del usuario
    $stmt = $pdo->prepare("
        SELECT usuarios.username, 
            amigos.id_user1,
            amigos.id_user2
        FROM amigos 
        JOIN usuarios ON amigos.id_user1 = usuarios.id_user OR amigos.id_user2 = usuarios.id_user 
        WHERE (amigos.id_user1 = :id_usuario OR amigos.id_user2 = :id_usuario) 
        AND amigos.estado = 'aceptado' 
        AND usuarios.id_user != :id_usuario
    ");
    $stmt->execute(['id_usuario' => $id_usuario_actual]);
    $amigos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //obtener amigos en linea
    $stmt = $pdo->prepare("
        SELECT u.username, u.id_user, u.en_linea
        FROM amigos a
        JOIN usuarios u ON (a.id_user1 = u.id_user OR a.id_user2 = u.id_user)
        WHERE (a.id_user1 = :id_usuario_actual OR a.id_user2 = :id_usuario_actual)
        AND u.en_linea = 1
        AND u.id_user != :id_usuario_actual
    ");
    $stmt->execute(['id_usuario_actual' => $id_usuario_actual]);
    $amigos_en_linea = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chatterly</title>
        <link rel="stylesheet" href="../css/style.css">
        <link rel="stylesheet" href="../css/style_options.css">
        <link rel="stylesheet" href="../css/style_chatterly.css">
        <link rel="stylesheet" href="../css/style_chat.css">
        <link rel="stylesheet" href="../css/style_groups.css">
        <link rel="icon" href="../assets/imgs/logo_bg.ico">
    </head>
    <body>

        <div id="container-group" style="display: none;">
            <button id="group-exit"></button>
            <div id="create-group">
                <h1>Personaliza tu servidor</h1>
                <a>Dale una personalidad propia a tu nuevo servidor con un nombre y un icono. Siempre puedes cambiarlo más tarde.</a>
                <img id="selectImageGroup" src="../assets/imgs/uploadPhoto.png" onclick="uploadGroupImage()"><br>
                <input type="file" id="file-input" style="display: none;">
                <label id="nombreServidor-text">NOMBRE DEL SERVIDOR</label>
                <input type="text" id="nombreServidor" placeholder="Nombre del servidor" required>
                <p>Al crear un servidor, aceptas las <link><a id="link" href="../html/comunity.html">Directivas de la comunidad</a></link>  de Chatterly.</p>

                <div id="button-container">
                    <button id="btn-group1" onclick="openandclosecreategroup()">Atras</button>
                    <button id="btn-group2" onclick="crearGrupo_Api()">Crear</button>
                </div>
            </div>
        </div>
        
        <div id="chatterly">
            <div style="display: flex; flex-direction: column; width: 100vw; height: 100vh;">
                <div style="background-color: #1e1f22; color: white; padding: 5px; text-align: left; height: 20px;"> <!-- barra superior -->
                    <span style="font-weight: bold; color: #949ba4;">Chatterly</span>
                </div>
                <div style="display: flex; flex: 1;">
                    <div style="background-color: #1e1f22; width: 2.7vw; padding: 10px; color: white; min-width: 50px;"> <!-- barra1 -->
                        <div>
                            <img id="message-logo" src="../assets/imgs/message_logo.png" alt="logo" onclick=""><br>
                            <div style="height: 2px; background-color: #393e42"></div><br>
                            <img id="message" src="../assets/imgs/newServer_logo.png" alt="logo" onclick="openandclosecreategroup()" style="padding: 10px; width: 30px; height: 30px;"><br>
                        </div>
                    </div>
                    <div style="background-color: #2b2d31; width: 14%; color: white; min-width: 200px;"> <!-- barra2 -->
                        <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                            <div style="padding: 10px;">
                                <button id="options-button" style="text-align: center; display: flex; align-items: center;" onclick="closechat();">
                                    <img src="../assets/imgs/default_profile.png" alt="account" style="width: 20px; height: 20px; margin-right: 15px;">
                                    <span>Amigos</span>
                                </button>
                                <div style="height: 2px; background-color: #393e42"></div>
                                <p style="text-align: center;">MENSAJES DIRECTOS</p>
                                    <?php //se recorre la lista de amigos para mostrar los mensajes directos con cada uno de ellos 
                                        if (count($amigos) > 0) 
                                        {
                                            foreach ($amigos as $amigo) //recorre la lista de amigos
                                            {
                                                $amigoDir = "../assets/users/{$amigo['username']}/img_profile/";
                                                $defaultImage = '../assets/imgs/default_profile.png';

                                                $amigoImages = glob($amigoDir . '*.{jpg,jpeg,png}', GLOB_BRACE); //glob — busca coincidencias de nombres de ruta de acuerdo a un patrón por tanto busca las imagenes en la carpeta del amigo y las guarda en un array para luego ordenarlas por fecha de modificacion y mostrar la mas reciente

                                                if (!empty($amigoImages)) //si hay imagenes en la carpeta del amigo
                                                {
                                                    usort($amigoImages, function ($a, $b)  //con usort se ordena el array para ordenar las imagenes por fecha de modificacion
                                                    {
                                                        return filemtime($b) - filemtime($a); //filemtime — obtiene la fecha de modificación de un archivo y se ordenan las imagenes por fecha de modificacion
                                                    });

                                                    $foto = $amigoImages[0]; //se guarda la imagen mas reciente
                                                }
                                                else 
                                                {
                                                    $foto = $defaultImage; //si no hay imagenes se muestra la imagen por defecto
                                                }

                                                $destinatario = ($amigo['id_user1'] == $id_usuario_actual) ? $amigo['id_user2'] : $amigo['id_user1']; //se obtiene el id del destinatario
                                                $nombre = htmlspecialchars($amigo['username'], ENT_QUOTES, 'UTF-8'); //se obtiene el nombre del amigo
                                                $foto = htmlspecialchars($foto, ENT_QUOTES, 'UTF-8'); //se obtiene la foto del amigo

                                                echo "
                                                    <button 
                                                        onclick=\"selectFriend('$nombre', '$foto', $destinatario)\" 
                                                        id='options-button' 
                                                        style='display: flex; align-items: center; gap: 10px; border: none; padding: 10px; border-radius: 5px; margin-bottom: 5px; cursor: pointer; width: 100%; text-align: left;'>
                                                        <img src='$foto' id='fotoFriend' alt='Foto de perfil' style='width: 30px; height: 30px; border-radius: 50%;'>
                                                        <span id='nombreboton'>$nombre</span>
                                                    </button>";
                                            }
                                        } 
                                        else 
                                        {
                                            echo "<p style='text-align: center;'>No tienes amigos en la lista</p>";
                                        }
                                    ?>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background-color: #232428; width: 100%;"> <!-- userpanel -->
                                <?php 
                                    $baseDir = "../assets/users/$usuario/img_profile/";
                                    $defaultImage = '../assets/imgs/default_profile.png';
                                    
                                    $profileImages = glob($baseDir . '*.{jpg,jpeg,png}', GLOB_BRACE);
                                    
                                    if (!empty($profileImages)) 
                                    {
                                        usort($profileImages, function($a, $b) 
                                        {
                                            return filemtime($b) - filemtime($a);
                                        });
                                    
                                        $foto = $profileImages[0];
                                    } 
                                    else 
                                    {   
                                        $foto = $defaultImage;
                                    }

                                     echo"
                                     <button id='panel_button' class='panel_button' style='display: flex; align-items: center; gap: 5px; padding: 5px 10px; max-width: 140px; cursor: pointer;' onclick='showprofileinfo()'> 
                                        <img id='profileImg2' src='$foto' alt='profile' style='border-radius: 50%; width: 30px; height: 30px;'> 
                                        <span style='color: white; font-size: 16px;'>$usuario</span>
                                    </button>";
                                ?> 
                                <div style="display: flex; padding-right: 19px;"> <!-- icono -->
                                    <div id="options_button">
                                        <img src="../assets/imgs/options_icon.png" alt="options" id="options_icon" onclick="showoptionspanel()">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="initialpanel" style="background-color: #313338; flex: 1; display: flex; flex-direction: column; min-width: 500px;"> <!-- initialpanel -->
                        <div style="background-color: #313338; display: flex; padding: 10px; align-items: center; color: white; gap: 10px;"> 
                            <img src="../assets/imgs/default_profile.png" alt="friends" style="padding: 10px; width: 24px; height: 24px;">
                            <span style="font-size: 16px;">Amigos</span>
                            <div style="width: 2px; background-color: #393e42; height: 100%;"></div>
                            <button class="friend-tab-button" style="width: 60px;" onclick="openonlinemenu()">En linea</button>
                            <button class="friend-tab-button" style="width: 50px;" onclick="openallfriends()">Todos</button>
                            <button class="friend-tab-button" onclick="openpendingmenu()">Pendiente</button>
                            <button class="add-friend-button" onclick="openaddfriendmenu()">Añadir amigo</button>
                        </div>

                        <div id="openonlinemenu" style="display: column; padding: 30px; padding-top: 0;" hidden>
                                <span>AMIGOS EN LINEA</span>
                                <p>Estos son tus amigos que están en linea:</p>
                                <div id="friend-list-container" style="display: background-color: #313338;">
                                    <?php
                                        if (count($amigos_en_linea) > 0) 
                                        {
                                            foreach ($amigos_en_linea as $amigo) 
                                            {
                                                $amigoDir = "../assets/users/{$amigo['username']}/img_profile/";
                                                $defaultImage = '../assets/imgs/default_profile.png';

                                                $amigoImages = glob($amigoDir . '*.{jpg,jpeg,png}', GLOB_BRACE); 

                                                if (!empty($amigoImages)) 
                                                {
                                                    usort($amigoImages, function($a, $b) 
                                                    {
                                                        return filemtime($b) - filemtime($a);
                                                    });

                                                    $foto = $amigoImages[0];
                                                } 
                                                else 
                                                {
                                                    $foto = $defaultImage;
                                                }
                                                
                                                echo "
                                                    <button onclick='openchat({$amigo['id_user']})' class='friend-tab-button' style='display: flex; align-items: center; gap: 10px; border: none; padding: 10px; border-radius: 5px; width: 100%; cursor: pointer; text-align: left; margin-bottom: 5px;'>
                                                        <img src='$foto' id='fotoFriend' alt='Foto de perfil' style='width: 30px; height: 30px; border-radius: 50%;'>
                                                        <span id='nombreboton'>{$amigo['username']}</span>
                                                    </button>
                                                    <div style='height: 2px; background-color: #393e42; margin-bottom: 5px;'></div>
                                                ";
                                            }
                                        } 
                                        else 
                                        {
                                            echo "<p style='text-align: center;'>No tienes amigos en línea</p>";
                                        }
                                    ?>
                                </div>

                            <p id="resultado"></p>
                        </div>

                        <div id="addfriendmenu" style="display: column; padding: 30px; padding-top: 0;" hidden>
                                <span>AÑADIR AMIGO</span>
                                <p>Puedes añadir amigos con su nombre de usuario de Chatterly.</p>
                            <div style="display: flex; overflow: hidden; background-color: #313338;">
                                <form action="../php/enviar_solicitud.php" method="post" style="width: 100%; position: relative;">
                                    <input id="alias_amigo" name="alias_amigo" required type="text" style="border-color: #1e1f22; background-color: #1e1f22; width: 100%; box-sizing: border-box; height: 50px; padding-left: 10px; position: relative;" placeholder="Puedes añadir amigos con su nombre de usuario de Chatterly.">
                                    <button id="enviar_solicitud" type="submit" style="width: 200px; position: absolute; right: 5px; top: 5px; height: 40px; font-size: 14px; background-color: #5865F2; cursor: pointer; padding: 0 15px; border: none;">Enviar solicitud de amistad</button>
                                </form>
                            </div>
                            <p id="resultado"></p>
                        </div>

                        <div id="pendingmenu" style="padding: 30px; padding-top: 0;" hidden>
                        <span>SOLICITUDES PENDIENTES</span>
                            <?php
                                if (isset($solicitudes_pendientes) && count($solicitudes_pendientes) > 0) 
                                {
                                    //comprueba si hay solicitudes penddientes
                                    foreach ($solicitudes_pendientes as $solicitud): ?> 
                                        <div class="solicitud" style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background-color: #2b2d31; margin-bottom: 10px; border-radius: 5px;">
                                            <span><?php echo htmlspecialchars($solicitud['alias']) . " quiere ser tu amigo."; ?></span>
                                            <form action="gestionar_solicitud.php" method="post" style="display: flex; gap: 10px;">
                                                <input type="hidden" name="solicitante" value="<?php echo $solicitud['id_user1']; ?>">
                                                <button type="submit" name="accion" value="aceptar" style="background-color: #5865F2; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Aceptar</button>
                                                <button type="submit" name="accion" value="rechazar" style="background-color: #FF5C5C; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Rechazar</button>
                                            </form>
                                        </div>
                                    <?php endforeach;
                                }
                                else 
                                {
                                    echo "<p>No hay solicitudes pendientes.</p>"; //si no hay solicitudes pendientes
                                }
                            ?>
                        </div>

                        <div id="allfriends" style="padding: 30px; padding-top: 0;" hidden>
                            <span>TODOS TUS AMIGOS</span>
                                <?php
                                    if (count($amigos) > 0) 
                                    {
                                        foreach ($amigos as $amigo) 
                                        {
                                            $amigoDir = "../assets/users/{$amigo['username']}/img_profile/";
                                            $defaultImage = '../assets/imgs/default_profile.png';

                                            $amigoImages = glob($amigoDir . '*.{jpg,jpeg,png}', GLOB_BRACE); //glob — busca coincidencias de nombres de ruta de acuerdo a un patrón por tanto busca las imagenes en la carpeta del amigo y las guarda en un array para luego ordenarlas por fecha de modificacion y mostrar la mas reciente

                                            if (!empty($amigoImages)) //si hay imagenes en la carpeta del amigo
                                            {
                                                usort($amigoImages, function($a, $b) //usort — ordena un array según sus valores usando una función de comparación definida por el usuario  y se ordenan las imagenes por fecha de modificacion 
                                                {
                                                    return filemtime($b) - filemtime($a); //filemtime — obtiene la fecha de modificación de un archivo y se ordenan las imagenes por fecha de modificacion 
                                                });

                                                $foto = $amigoImages[0]; //se guarda la imagen mas reciente
                                            } 
                                            else 
                                            {
                                                $foto = $defaultImage; //si no hay imagenes se muestra la imagen por defecto
                                            }

                                            $destinatario = ($amigo['id_user1'] == $id_usuario_actual) ? $amigo['id_user2'] : $amigo['id_user1']; //se obtiene el id del amigo
                                            echo "
                                                <div style='display: flex; align-items: center; gap: 10px; padding: 10px;'>
                                                    <img src='$foto' id='fotoFriend' alt='Foto de perfil' style='width: 30px; height: 30px; border-radius: 50%;'>
                                                    <span id='nombreboton'>{$amigo['username']}</span>
                                                </div>
                                            ";
                                        }
                                    } 
                                    else 
                                    {
                                        echo "<p style='text-align: center;'>No tienes amigos en la lista</p>";
                                    }
                                ?>
                        </div>
                    </div>

                    <div id="chatcontainer" style="display: none;">
                        <div class="chat-header">
                            <div class="chat-header-content">
                                <img id="foto-amigo" src="../assets/imgs/default_profile.png" alt="Foto del amigo" class="friend-photo">
                                <span id="nombre-amigo" class="friend-name"></span>
                                <!--<img src="../assets/imgs/call_button.png" style="width: 30px; height: 30px; cursor: pointer;" onclick="startCall()">-->
                            </div>
                        </div>

                        <div id="chat-separator" style="position: absolute; top: 60px; width: 100%; height: 2px; background-color: #393e42; z-index: 10;"></div>

                        <div id="chat-messages" class="chat-messages"></div>

                        <div class="chat-input">
                            <input type="text" id="mensaje" class="message-input" placeholder="Escribe un mensaje..." />
                            <img src="../assets/imgs/upload.png" id="uploadfile" alt="Upload" class="upload-icon">
                            <input type="file" id="fileInput" class="hidden-file-input">
                            <img src="../assets/imgs/emojis.png" onclick="showEmojis()" class="emoji-icon">
                            <button id="enviarMensaje" class="send-button">Enviar</button>
                        </div>

                        <div class="emoji-container">
                            <div id="emojisDiv" class="emoji-div">
                                <div id="emojiList" class="emoji-list"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="options" hidden>
            <div class="options-container">
                <div class="header-bar">
                    <span class="header-title">Chatterly</span>
                </div>
                <div class="content-wrapper">
                    <div class="sidebar">
                        <div class="form-container">
                            <p class="section-title">AJUSTES DE USUARIO</p>
                            <button id="options-button" onclick="showprofileinfo()">Mi cuenta</button>
                        </div>
                        <div class="divider"></div>
                        <div class="form-container">
                            <button id="options-button" onclick="window.location.href='../php/logout.php'">Cerrar sesión</button>
                            <button id="options-button" onclick="closeoptionspanel()">Volver</button>
                        </div>
                    </div>
                    <div class="main-content">
                        <div>
                            <div class="container_options_header" id="container_options_header">
                                <h1 id="myaccount_text">Mi cuenta</h1>
                                <img id="exit_button_image" src="../assets/imgs/exit_button.png" alt="" onclick="closeoptionspanel()">
                            </div>
                            <div id="profileinfo" class="profile-info" hidden>
                                <?php
                                    $baseDir = "../assets/users/$usuario/img_profile/";
                                    $defaultImage = '../assets/imgs/default_profile.png';
                                    $profileImages = glob($baseDir . '*.{jpg,jpeg,png}', GLOB_BRACE); 

                                    if (!empty($profileImages)) 
                                    {
                                        usort($profileImages, function($a, $b) 
                                        {
                                            return filemtime($b) - filemtime($a);
                                        });
                                        $foto = $profileImages[0];
                                    } 
                                    else 
                                    {
                                        $foto = $defaultImage;
                                    }

                                    echo "
                                    <div class='profile-header'>
                                        <form id='uploadForm' method='POST' enctype='multipart/form-data' class='upload-form'>
                                            <input type='file' id='fotoProfile' name='profile_picture' accept='.png, .jpg, .jpeg' class='file-input'>
                                            <img id='profileImg' src='$foto' alt='profile' class='profile-img'>
                                            <span class='profile-username'>$usuario</span>
                                        </form>
                                    </div>";
                                ?>
                                <div class="profile-details">
                                    <p id="text_name">NOMBRE</p>

                                    <div class="container">
                                        <p><?php echo htmlspecialchars($usuario, ENT_QUOTES, 'UTF-8'); ?></p>
                                        <button class="change_button" id="edit_name">Editar</button>
                                    </div>
                                    
                                    <p id="text_username">NOMBRE DE USUARIO</p>

                                    <div class="container">
                                        <p><?php echo htmlspecialchars($usuario, ENT_QUOTES, 'UTF-8'); ?></p>
                                        <button class="change_button" id="edit_username">Editar</button>
                                    </div>

                                    <p id="text_email">CORREO ELECTRONICO</p>

                                    <div class="container">
                                        <p>
                                            <?php
                                                $stmt = $pdo->prepare("SELECT email FROM usuarios WHERE id_user = ?"); //se realiza una consulta para obtener el email del usuario
                                                $stmt->execute([$id_usuario_actual]);
                                                $emailData = $stmt->fetch(PDO::FETCH_ASSOC); //se obtiene el email del usuario
                                                echo htmlspecialchars($emailData['email'], ENT_QUOTES, 'UTF-8'); //se muestra el email del usuario 
                                            ?>
                                        </p>
                                        <button class="change_button" id="edit_email">Editar</button>
                                    </div>
                                </div>
                            </div>
                            <div class="password_autentication" id="password_autentication">
                                <p style="font-size: 20px; font-weight: 400;">Contraseña y autentificacion</p>
                                <button class="change_password" id="">Cambiar contraseña</button>

                                <p id="text_disabled_account">Suspension de cuenta</p>
                                <p id="text2_disabled_account">Puedes recuperar la cuenta en cualquier momento despues de deshabilitarla.</p>

                                <div class="container_account">
                                    <button id="delete_acount">Eliminar cuenta</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script defer src="../javascript/api.js"></script>
        <script defer src="../javascript/group.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script> 
        <script defer src="../javascript/js_chatterly.js"></script>
        <script>var id_usuario_actual = <?php echo $id_usuario_actual; ?>;</script> <!-- se guarda el id del usuario en una variable de javascript -->
    </body>
</html>