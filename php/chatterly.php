<?php
session_start();
require 'conexion.php';
require 'functions.php';

if (!isset($_SESSION['usuario']) || !isset($_SESSION['password']))  //si el usuario no ha iniciado sesion
{ 
    header("Location: ../html/login.html"); //redirecciona al index
    exit(); //finaliza la ejecucion del script
}

//recupera el usuario
$usuario = $_SESSION['usuario'];

//se consigue el id actual
$id_usuario_actual = get_id_user($pdo, $usuario)
?>

<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chatterly</title>
        <link rel="stylesheet" href="../css/style_options.css">
        <link rel="stylesheet" href="../css/style_chatterly.css">
        <link rel="stylesheet" href="../css/style_chat.css">
        <link rel="stylesheet" href="../css/style_groups.css">
        <link rel="stylesheet" href="../css/style_menuGIF.css">
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
                <label id="nombreServidor-text">Nombre del servidor</label>
                <input type="text" id="nombreServidor" placeholder="Nombre del servidor" required>
                <p>Al crear un servidor, aceptas las <link><a id="link" href="../html/comunity.html">Directivas de la comunidad</a></link> de Chatterly.</p>

                <div id="button-container">
                    <button id="btn-group1" onclick="openandclosecreategroup()">Atras</button>
                    <button id="btn-group2" onclick="crearGrupo()">Crear</button>
                </div>
            </div>  
            <div id="bg-create-group" style="display: none;" class="background"></div>  
        </div>
        
        <div id="chatterly">
            <div id="chatterly-container">
                <div id="barra-superior"> <!-- barra superior -->
                    <div id="barra-superior-buttons"> 
                        <img id="message-logo" src="../assets/imgs/message_logo.png" alt="logo" onclick="closegroup()">
                        <button class="add-friend-button" onclick="openaddfriendmenu()"><p id="link-top">Añadir amigo</p></button>
                        <button class="friend-tab-button" onclick="openpendingmenu()"><p id="link-top">Solicitudes de amistad</p></button>
                        <button class="friend-tab-button" onclick="openonlinemenu()"><p id="link-top">Amigos en linea</p></button>
                        <button class="friend-tab-button" onclick="openallfriends()"><p id="link-top">Todos tus amigos</p></button>
                    </div>
                </div>

                <div id="barra1-container">
                    <div id="barra1"> <!-- barra1 -->
                        <div>
                            <?php get_group($pdo, $usuario); ?>
                            <img id="message" src="../assets/imgs/newServer_logo.png" alt="logo" onclick="openandclosecreategroup()"><br>
                        </div>
                    </div>
                    <div id="barra2"> <!-- barra2 -->
                        <div id="barra2-content-container">
                            <div id="direct_message_containter"> <!-- mensaje directo -->
                                <p style="text-align: center;">¿Con quién vas a hablar hoy?</p>
                                    <?php get_direct_messages($pdo, $usuario); ?>
                            </div>

                            <div id="userpanel"> <!-- userpanel -->
                                <?php render_user_panel_button($pdo, $usuario)?> 
                                <div> <!-- icono -->
                                    <div id="options_button_gear">
                                        <img src="../assets/imgs/options_icon.png" alt="options" id="options_icon" onclick="showoptionspanel()">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="barra2_group"> <!-- barra2_group -->
                        <div id="group_info">
                            <div id="serverthings" style="padding: 10px;">
                                <div class="container">
                                    <button class="groupname_buton" id="group-button">
                                        <div class="container">
                                            <img id="groupimage">
                                            <h1 id="groupname" style="padding-left: 5px;"></h1>
                                        </div>
                                        
                                    </button>
                                    <button class="add_member_button" id="group-button">
                                        <img id="add_member_image" src="../assets/imgs/add_member_icon.png">
                                    </button>
                                </div>
                                
                                <div style="background-color: #393e42; height: 2px; margin-bottom: 5px;"></div>
                                
                                <button id="group-button">
                                    <div class="container" style="padding: 0; margin: 0;">
                                        <img src="../assets/imgs/members_icon.png" style="width: 30px; height: 30px;">
                                        <p style="margin-right: 100000px;">Miembros</p>
                                    </div>
                                </button>
                                
                                <div style="background-color: #393e42; height: 2px; margin-bottom: 5px; margin-top: 5px;"></div>

                                <div id="canales">
                                    <div id="acordeon-texto" class="accordion"> <!-- texto -->
                                        <div id="header-texto" class="accordion-header" onclick="toggleAccordion('contenido-texto')">
                                            <span>📝 Canales de Texto</span>
                                            <span id="icono-texto">▸</span>
                                            <button id="add_text_channel" onclick="crearCanalTexto()">+</button>
                                        </div>
                                        <div id="contenido-texto" class="accordion-content">
                                            <ul class="channel-list" id="lista-texto">
                                                <!-- Aquí puedes inyectar tus <li> con canales -->
                                            </ul>
                                        </div>
                                    </div>

                                    <div id="acordeon-voz" class="accordion"> <!-- voz -->
                                        <div id="header-voz" class="accordion-header" onclick="toggleAccordion('contenido-voz')">
                                            <span>🔊 Canales de Voz</span>
                                            <span id="icono-voz">▸</span>
                                            <button id="add_voice_channel" onclick="crearCanalVoz()">+</button>
                                        </div>
                                        <div id="contenido-voz" class="accordion-content">
                                            <ul class="channel-list" id="lista-voz">
                                                <!-- Aquí puedes inyectar tus <li> con canales -->
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                               <!-- <?php //crearCanalTexto($pdo, $usuario)?> -->
                            </div>

                            <div id="userpanel_group"> <!-- userpanel -->
                                 <?php render_user_panel_button($pdo, $usuario)?> 
                                <div> <!-- icono -->
                                    <div id="options_button_gear">
                                        <img src="../assets/imgs/options_icon.png" alt="options" id="options_icon" onclick="showoptionspanel()">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                                    
                    <div id="initialpanel"> <!-- initialpanel -->

                        <div id="addfriendmenu" hidden>
                                <span>Añadir amigo</span>
                                <p>Puedes añadir amigos buscando su nombre de usuario de Chatterly.</p>
                            <div id="addfriendmenu-container">
                                <form id="addfriendmenu-form" action="../php/enviar_solicitud.php" method="post">
                                    <input id="alias_amigo" name="alias_amigo" required type="text" placeholder="Puedes añadir amigos con su nombre de usuario de Chatterly.">
                                    <button id="enviar_solicitud" type="submit">Enviar solicitud de amistad</button>
                                </form>
                            </div>
                            <p id="resultado"></p>
                        </div>

                        <div id="pendingmenu" hidden>
                            <span>Solicitudes de amistad</span>
                            <?php
                                if (isset($solicitudes_pendientes) && count($solicitudes_pendientes) > 0) 
                                {
                                    //comprueba si hay solicitudes penddientes
                                    foreach ($solicitudes_pendientes as $solicitud): ?> 
                                        <div class="solicitud">
                                            <span><?php echo htmlspecialchars($solicitud['alias']) . " quiere ser tu amigo."; ?></span>
                                            <form id="pendingmenu-form" action="gestionar_solicitud.php" method="post">
                                                <input type="hidden" name="solicitante" value="<?php echo $solicitud['id_user1']; ?>">
                                                <button id="button_aceptar" type="submit" name="accion" value="aceptar">Aceptar</button>
                                                <button id="button_rechazar" type="submit" name="accion" value="rechazar">Rechazar</button>
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
                        
                        <div id="openonlinemenu" hidden>
                                <span>Amigos en linea</span>
                                <div id="friend-list-container">
                                <?php get_online_friends($pdo, $usuario) ?>
                                </div>

                            <p id="resultado"></p>
                        </div>

                        <div id="allfriends" hidden>
                            <span>Todos tus amigos</span>
                            <?php get_all_friends($pdo, $usuario) ?>
                        </div>
                    </div>

                    <div id="chatcontainer" style="display: none;">
                        <div class="chat-header">
                            <div class="chat-header-content">
                                <img id="foto-amigo" src="../assets/imgs/default_profile.png" alt="Foto del amigo" class="friend-photo">
                                <span id="nombre-amigo" class="friend-name"></span>
                                <div id="call_button" style="height: 30px; width: 100%; justify-content: flex-end; margin-right: 10px; display: flex; text-align: left;">
                                    <img src="../assets/imgs/call_button.svg" style="width: 30px; height: 30px; cursor: pointer;" onclick="">
                                </div>
                                
                            </div>
                        </div>

                        <div id="chat-separator" style="position: absolute; top: 60px; width: 100%; height: 2px; background-color: #393e42; z-index: 10;"></div>

                        <div id="chat-messages" class="chat-messages"></div>

                        <div class="chat-input">
                            <input type="text" id="mensaje" class="message-input" placeholder="Escribe un mensaje..." />
                            <img src="../assets/imgs/upload.png" id="uploadfile" alt="Upload" class="upload-icon">
                            <input type="file" id="fileInput" class="hidden-file-input">
                            <img src="../assets/imgs/emojis.png" onclick="showEmojis()" class="emoji-icon">
                            <img src="../assets/imgs/gif_button.png" id="gifButton" class="gifButton">
                            <div id="gifPickerContainer"></div>
                            <button id="enviarMensaje" class="send-button">Enviar</button>
                        </div>

                        <div class="emoji-container">
                            <div id="emojisDiv" class="emoji-div">
                                <div id="emojiList" class="emoji-list"></div>
                            </div>
                        </div>
                    </div>

                    <div id="initialpanel_group"></div> <!-- initialpanel_group -->

                    <div id="chatcontainer_group">
                        <div class="chat-header-group">
                            <div class="chat-header-content-group">
                                <span id="nombre-canal-grupo"></span>
                            </div>
                        </div>
                        <div id="chat-separator-group"></div>

                        <div id="chat-messages-group" class="chat-messages"></div>

                        <div class="chat-input-group">
                            <input type="text" id="mensaje-grupo" class="message-input" placeholder="Escribe un mensaje...">
                            <img src="../assets/imgs/upload.png" id="uploadfile" alt="Upload" class="upload-icon">
                            <input type="file" id="fileInput" class="hidden-file-input">
                            <img src="../assets/imgs/emojis.png" onclick="showEmojis()" class="emoji-icon">
                            <img src="../assets/imgs/gif_button.png" id="gifButton" class="gifButton">
                            <div id="gifPickerContainer"></div>
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
            <div id="change_name_container" style="display: none;">
                <div class="change_username" id="change_username">
                    <div class="change_name">
                        <div class="container">
                            <p id="text_change_name">Cambiar nombre</p>
                            <img id="exit_button_image" src="../assets/imgs/exit_button.png" alt="" onclick="closeeditname()">
                        </div>
                        <input type="text" name="new_name" id="new_name" placeholder="Nuevo nombre" required>
                        <button type="submit" onclick="cambiar_alias()">Cambiar nombre</button>
                    </div>
                </div>
            </div>
            
            <div id="change_username_container" style="display: none;">
                <div class="change_username" id="change_username">
                    <div class="change_username_container">
                        <div class="change_username">
                            <div class="container">
                                <p id="text_change_username">Cambiar nombre de usuario</p>
                                <img id="exit_button_image" src="../assets/imgs/exit_button.png" alt="" onclick="closeeditusername()">
                            </div>
                            <input type="text" name="new_username" id="new_username" placeholder="Nuevo nombre de usuario" required>
                            <button type="submit" onclick="cambiar_username()">Cambiar nombre de usuario</button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="change_email_container" style="display: none;"> 
                <div class="change_email" id="change_email">
                    <div class="change_email">
                        <div class="container">
                            <p id="text_change_email">Cambiar correo electronico</p>
                            <img id="exit_button_image" src="../assets/imgs/exit_button.png" alt="" onclick="closeeditemail()">
                        </div>
                        <input type="email" name="new_email" id="new_email" placeholder="Nuevo correo electronico" required>
                        <button type="submit" onclick="cambiar_email()">Cambiar correo electronico</button>
                    </div>
                </div>
            </div>
            
            <div id="change_password_container" style="display: none;"> 
                <div class="change_password" id="change_password">
                    <div class="change_oldpassword">
                        <div class="container">
                            <p id="text_change_password">Cambiar contraseña</p>
                            <img id="exit_button_image" src="../assets/imgs/exit_button.png" alt="" onclick="closechangepassword()">
                        </div>
                        <input type="password" name="old_password" id="old_password" placeholder="Contraseña actual" required>
                        <input type="password" name="new_password" id="new_password" placeholder="Nueva contraseña" required>
                        <input type="password" name="confirm_new_password" id="confirm_new_password" placeholder="Confirmar nueva contraseña" required>
                        <button type="button" onclick="changePassword()">Cambiar contraseña</button>
                        <div id="mensajeChange"></div>
                    </div>
                </div>
            </div>
            <div class="delete_account" id="delete_account" hidden>
                <div class="delete_account_container">
                    <p id="text_delete_account">Eliminar cuenta</p>
                    <img id="exit_button_image" src="../assets/imgs/exit_button.png" alt="" onclick="closedeleteaccount()">
                    <p id="text_delete_account2">¿Estas seguro de que deseas eliminar tu cuenta? Esta accion no se puede deshacer.</p>
                    <button type="submit">Eliminar cuenta</button>
                </div>
            </div>
            
            <div class="options-container">
                <div id="barra-superior"> <!-- barra superior -->
                    <div id="barra-superior-buttons"> 
                        <img id="message-logo" src="../assets/imgs/message_logo.png" alt="logo" onclick="closeoptionspanel()">
                    </div>
                </div>
                <div class="content-wrapper">
                    <div class="sidebar">
                        <div id="buttons_options_container">
                            <p class="section-title">Ajustes de usuario</p>
                            <div class="options_container">
                                <button id="buttons-options-panel" class="buttons-options-panel" onclick="showprofileinfo()">Mi cuenta</button>
                            </div>
                        </div>
                            <div class="divider"></div>
                        <div id="buttons_options_container">
                            <div class="options_container">
                                <button id="buttons-options-panel" class="buttons-options-panel" onclick="window.location.href='../php/logout.php'">Cerrar sesión</button><br>
                                <button id="buttons-options-panel" class="buttons-options-panel" onclick="closeoptionspanel()">Volver</button>
                            </div>
                        </div>
                    </div>
                    <div class="main-content">
                        <div>
                            <div class="container_options_header" id="container_options_header">
                                <h1 id="myaccount_text">Mi cuenta</h1>
                                <img id="exit_button_image" src="../assets/imgs/exit_button.png" alt="" onclick="closeoptionspanel()">
                            </div>
                            <div id="profileinfo" class="profile-info" hidden>
                                <?php render_profile_header($pdo, $usuario)?>
                                <div class="profile-details">
                                    <p id="text_name">NOMBRE</p>

                                    <div class="container">
                                        <p><?php echo htmlspecialchars($usuario, ENT_QUOTES, 'UTF-8'); ?></p>
                                        <button class="change_button" id="edit_name" onclick="openeditname()">Editar</button>
                                    </div>
                                    
                                    <p id="text_username">NOMBRE DE USUARIO</p>

                                    <div class="container">
                                        <p><?php echo htmlspecialchars($usuario, ENT_QUOTES, 'UTF-8'); ?></p>
                                        <button class="change_button" id="edit_username" onclick="openeditusername()">Editar</button>
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
                                        <button class="change_button" id="edit_email" onclick="openeditemail()">Editar</button>
                                    </div>
                                </div>
                            </div>
                            <div class="password_autentication" id="password_autentication">
                                <p style="font-size: 20px; font-weight: 400;">Contraseña y autentificacion</p>
                                <button class="change_password" onclick="openchangepassword()">Cambiar contraseña</button>

                                <p id="text_disabled_account">Suspension de cuenta</p>
                                <p id="text2_disabled_account">Puedes recuperar la cuenta en cualquier momento despues de deshabilitarla.</p>

                                <div class="container_account">
                                    <button id="delete_acount" onclick="eliminar_cuenta()">Eliminar cuenta</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script defer src="../javascript/api.js"></script>
        <script src="../javascript/tenor_api.js"></script>
        <script defer src="../javascript/group.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script> 
        <script defer src="../javascript/js_chatterly.js"></script>
        <script>var id_usuario_actual = <?php echo $id_usuario_actual; ?>;</script> <!-- se guarda el id del usuario en una variable de javascript -->
    </body>
</html>