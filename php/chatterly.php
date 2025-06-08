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
        <link rel="stylesheet" href="../css/style_menuGIF.css">
        <link rel="stylesheet" href="../css/style_call.css">
        <link rel="icon" href="../assets/imgs/logo_bg.ico">
    </head>
    <body>
        <div id="change_name_container" class="container-panels" style="display: none;"> <!-- change_alias_container -->
            <div class="change_username" id="change_username">
                <div class="change_name">
                    <div class="container">
                        <p id="text_change_name">Cambiar nombre</p>
                        <img id="exit_button_image" src="../assets/imgs/exit_button.png" alt="" onclick="closeeditname()">
                    </div>
                    <input type="text" name="new_name" id="new_name" placeholder="Nuevo nombre" required>
                    <button type="submit" class="accept-button" onclick="cambiar_alias()">Cambiar nombre</button>
                    <div id="change_name_texterror"></div>
                </div>
            </div>
            <div id="change_name_container_background"></div>  
        </div>
        
        <div id="change_username_container" class="container-panels" style="display: none;"> <!-- change_username_container -->
            <div class="change_username" id="change_username">
                <div class="change_username_container">
                    <div class="change_username">
                        <div class="container">
                            <p id="text_change_username">Cambiar nombre de usuario</p>
                            <img id="exit_button_image" src="../assets/imgs/exit_button.png" alt="" onclick="closeeditusername()">
                        </div>
                        <input type="text" name="new_username" id="new_username" placeholder="Nuevo nombre de usuario" required>
                        <button type="submit" class="accept-button" onclick="cambiar_username()">Cambiar nombre de usuario</button>
                        <div id="change_username_texterror"></div>
                    </div>
                </div>
            </div>
            <div id="change_username_container_background"></div>  
        </div>

        <div id="change_email_container" class="container-panels" style="display: none;"> <!-- change_email_container -->
            <div class="change_email" id="change_email"> 
                <div class="change_email">
                    <div class="container">
                        <p id="text_change_email">Cambiar correo electronico</p>
                        <img id="exit_button_image" src="../assets/imgs/exit_button.png" alt="" onclick="closeeditemail()">
                    </div>
                    <input type="email" name="new_email" id="new_email" placeholder="Nuevo correo electronico" required>
                    <button type="submit" class="accept-button" onclick="cambiar_email()">Cambiar correo electronico</button>
                    <div id="change_email_texterror"></div>
                </div>
            </div>
            <div id="change_email_container_background"></div>  
        </div>
        
        <div id="change_password_container" class="container-panels" style="display: none;"> <!-- change_password_container -->
            <div class="change_password" id="change_password">
                <div class="change_oldpassword">
                    <div class="container">
                        <p id="text_change_password">Cambiar contraseña</p>
                        <img id="exit_button_image" src="../assets/imgs/exit_button.png" onclick="closechangepassword()">
                    </div>
                    <input type="password" name="old_password" id="old_password" placeholder="Contraseña actual" required>
                    <input type="password" name="new_password" id="new_password" placeholder="Nueva contraseña" required>
                    <input type="password" name="confirm_new_password" id="confirm_new_password" placeholder="Confirmar nueva contraseña" required>
                    <button type="button" class="accept-button" onclick="changePassword()">Cambiar contraseña</button>
                    <div id="mensajeChange"></div>
                </div>
            </div>
            <div id="change_password_container_background"></div>
        </div>
        
        <div id="delete_account_container" class="container-panels" style="display: none;"> <!-- delete_account -->
            <div id="delete_account" class="delete_account">
                <div class="container">
                    <p id="text_delete_account">Eliminar cuenta</p>
                    <img id="exit_button_image" src="../assets/imgs/exit_button.png" onclick="closecdeleteaccount()">
                </div>
                <p id="text_delete_account2">¿Estas seguro de que deseas eliminar tu cuenta? Esta accion no se puede deshacer.</p>
                <div class="container">
                    <button type="button" class="reject-button" id="btn-confirmar-eliminar" onclick="eliminar_cuenta()">Eliminar cuenta</button>
                    <button type="button" class="accept-button" id="btn-confirmar-eliminar" onclick="closecdeleteaccount()">Volver</button>
                </div>
                <div id="delete_account_texterror"></div>
            </div>
            <div id="delete_account_background"></div>
        </div>

        <div id="call-ui" style="display:none;"> <!-- ui llamada -->
            <div class="videos">
                <video id="localVideo" playsinline autoplay></video>
                <video id="remoteVideo" playsinline autoplay></video>
                <audio id="remoteAudio" autoplay controls style="display: none;"></audio>
            </div>
            <div class="controles, container">
                <button class="call-button" id="colgar" onclick="colgar()">
                    <img id="colgar-img-button" src="../assets/imgs/colgar.png">
                </button>

                <button class="call-button" id="mute" onclick="toggleMute()">
                    <img id="mute-img-button" src="../assets/imgs/desmuteado.png">
                </button>

                <button class="call-button" id="ensordecer" onclick="toggleDeafen()">
                    <img id="ensordecer-img-button" src="../assets/imgs/desensordecido.png">
                </button>

                <button class="call-button" id="camara-on/off" onclick="toggleCamera()">
                    <img id="camara-img-button" src="../assets/imgs/camaraon.png">
                </button>

                <button class="call-button" id="compartir-pantalla" onclick="compartirPantalla()">
                    <img id="compartir-pantalla-img-button" src="../assets/imgs/compartir-pantalla.png">
                </button>
            </div>
            <div class="dispositivos">
                <select id="audioSelect"></select>
                <button class="call-button-change" onclick="changeAudioDevice()">Cambiar micrófono</button>
                <select id="videoSelect"></select>
                <button class="call-button-change" onclick="changeVideoDevice()">Cambiar cámara</button>
            </div>
        </div>
        <div id="popup-llamada" style="display: none;"></div> <!-- popup llamada -->

        <div id="chatterly"> <!-- Chatterly main-content -->
            <div id="chatterly-container">
                <div id="barra-superior"> <!-- barra superior -->
                    <div id="barra-superior-buttons"> 
                        <img id="message-logo" src="../assets/imgs/message_logo.png" onclick="closeoptionspanel()" alt="logo">
                        <p id="top-separator">|</p>
                        <button class="friend-tab-button" onclick="openaddfriendmenu()"><p id="link-top">Añadir amigo</p></button>
                        <p id="top-separator">|</p>
                        <button class="friend-tab-button" onclick="openpendingmenu()"><p id="link-top">Solicitudes de amistad</p></button>
                        <p id="top-separator">|</p>
                        <button class="friend-tab-button" onclick="openonlinemenu()"><p id="link-top">Amigos en linea</p></button>
                        <p id="top-separator">|</p>
                        <button class="friend-tab-button" onclick="openallfriends()"><p id="link-top">Todos tus amigos</p></button>
                    </div>
                </div>

                <div id="barras-container">
                    <div id="barra1"></div> <!-- barra1 -->
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
                                    
                    <div id="initialpanel"> <!-- initialpanel -->
                        <div id="addfriendmenu" hidden>
                                <div class="title-container">
                                    <span>Añadir amigo</span>
                                </div>
                                <div id="separator"></div>
                                <p>Puedes añadir amigos buscando su nombre de usuario de Chatterly.</p>
                            <div id="addfriendmenu-container">
                                <form id="addfriendmenu-form" action="../php/enviar_solicitud.php" method="post">
                                    <input id="alias_amigo" name="alias_amigo" required type="text" placeholder="Busca a tus amigos.">
                                    <button id="enviar_solicitud" class="accept-button" type="submit">Enviar solicitud de amistad</button>
                                </form>
                            </div>
                            <p id="resultado"></p>
                        </div>

                        <div id="pendingmenu" hidden>
                            <div class="title-container">
                                <span>Solicitudes de amistad</span>
                            </div>
                            <div id="separator"></div>
                            
                            <?php mostrarSolicitudesPendientes($pdo,  $usuario)?>
                        </div>
                        
                        <div id="openonlinemenu" hidden>
                            <div class="title-container">
                                <span>Amigos en linea</span>
                            </div>
                            <div id="separator"></div>
                            
                            <div id="friend-list-container">
                                <?php get_online_friends($pdo, $usuario) ?>
                            </div>

                            <p id="resultado"></p>
                        </div>

                        <div id="allfriends" hidden>
                            <div class="title-container">
                                <span>Todos tus amigos</span>
                            </div>
                            <div id="separator"></div>
                            
                            <?php get_all_friends($pdo, $usuario) ?>
                        </div>
                    </div>

                    <div id="chatcontainer" style="display: none;">
                        <div class="chat-header">
                            <div class="chat-header-content">
                                <img id="foto-amigo" src="../assets/imgs/default_profile.png" alt="Foto del amigo" class="friend-photo">
                                <span id="nombre-amigo" class="friend-name"></span>
                                <div id="call_button" style="height: 30px; width: 100%; justify-content: flex-end; margin-right: 10px; display: flex; text-align: left;">
                                    <img id="call-image" src="../assets/imgs/call_button.svg" onclick="if (typeof destinatario !== 'undefined') llamarAmigo(destinatario);">
                                </div>
                            </div>
                        </div>
                        
                        <div id="chat-separator"></div>
                        <div id="chat-messages" class="chat-messages"></div>

                       <div class="chat-input">
                            <input type="text" id="mensaje" class="message-input" placeholder="Escribe un mensaje..." />
                            <div class="chat-actions">
                                <img src="../assets/imgs/upload.png" id="uploadfile" alt="Upload" class="action-icon upload-icon">
                                <input type="file" id="fileInput" class="hidden-file-input">
                                <img src="../assets/imgs/gif_button.png" onclick="showGif();" id="gifButton" class="action-icon">
                                <img src="../assets/imgs/emojis.png" onclick="showEmojis()" class="action-icon emoji-icon">
                                <button id="enviarMensaje" class="send-button">Enviar</button>
                            </div>
                        </div>
                        <div id="gifPickerContainer"></div>
                        
                        <div class="emoji-container">
                            <div id="emojisDiv" class="emoji-div">
                                <div id="emojiList" class="emoji-list"></div>
                            </div>
                        </div>
                    </div>

                    <div id="options" hidden>                        
                        <div class="options-left-panel">
                            <div id="buttons_options_container">
                                <h1 class="section-title">Ajustes</h1>
                                <div class="options_container">
                                    <button id="buttons-options-panel" class="buttons-options-panel" onclick="showprofileinfo()">Mi cuenta</button>
                                    <button id="buttons-options-panel" class="buttons-options-panel" onclick="window.location.href='../php/logout.php'">Cerrar sesión</button><br>
                                    <button id="buttons-options-panel" class="buttons-options-panel" onclick="closeoptionspanel()">Volver</button>
                                </div>
                            </div>
                        </div>
                        <div class="main-content">
                            <div class="container_options_header" id="container_options_header">
                                <h1 id="myaccount_text">Mi cuenta</h1>
                                <img id="exit_button_image" src="../assets/imgs/exit_button.png" alt="" onclick="closeoptionspanel()">
                            </div>
                            <div id="profileinfo" class="profile-info" hidden>
                                <?php render_profile_header($pdo, $usuario)?>
                                <div class="profile-details">
                                    <p id="text_name">ALIAS</p>

                                    <div class="container">
                                        <p id="user-alias"><?php echo htmlspecialchars(obtenerAlias($pdo, $id_usuario_actual), ENT_QUOTES, 'UTF-8'); ?></p>
                                        <button class="change_button" id="edit_name" onclick="openeditname()">Editar</button>
                                    </div>
                                    
                                    <p id="text_username">NOMBRE DE USUARIO</p>

                                    <div class="container">
                                        <p id="user-username"><?php echo htmlspecialchars($usuario, ENT_QUOTES, 'UTF-8'); ?></p>
                                        <button class="change_button" id="edit_username" onclick="openeditusername()">Editar</button>
                                    </div>

                                    <p id="text_email">CORREO ELECTRONICO</p>

                                    <div class="container">
                                        <p id="user-email">
                                            <?php
                                                $stmt = $pdo->prepare("SELECT email FROM usuarios WHERE id_user = ?"); // obtiene el email del usuario
                                                $stmt->execute([$id_usuario_actual]);
                                                $emailData = $stmt->fetch(PDO::FETCH_ASSOC); //se obtiene el email del usuario

                                                if ($emailData && isset($emailData['email'])) 
                                                {
                                                    echo htmlspecialchars($emailData['email'], ENT_QUOTES, 'UTF-8'); //se muestra el email del usuario
                                                } 
                                                else 
                                                {
                                                    echo 'Correo no disponible';
                                                }
                                            ?>
                                        </p>
                                        <button class="change_button" id="edit_email" onclick="openeditemail()">Editar</button>
                                    </div>
                                </div>
                            </div>
                            <div class="password_autentication" id="password_autentication">
                                <p style="font-size: 20px; font-weight: 400; color: #fb9a4f;">Contraseña y autentificacion</p>
                                <button id="change_password" class="accept-button" onclick="openchangepassword()">Cambiar contraseña</button>

                                <p id="text_disabled_account">Suspension de cuenta</p>
                                <p id="text2_disabled_account">No podras recuperar la cuenta despues de eliminarla.</p>

                                <div class="container_account">
                                    <button id="delete_acount" class="reject-button" onclick="opendeleteaccount()">Eliminar cuenta</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script defer src="../javascript/api.js"></script>
        <script src="../javascript/tenor_api.js"></script>
        <script defer src="../javascript/webRTC.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script> 
        <script defer src="../javascript/js_chatterly.js"></script>
        <script>var id_usuario_actual = <?php echo $id_usuario_actual; ?>;</script> <!-- se guarda el id del usuario en una variable de javascript -->
    </body>
</html>