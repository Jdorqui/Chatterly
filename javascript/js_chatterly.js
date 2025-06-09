const normalPanel = document.getElementById("chatterly");
const optionsPanel = document.getElementById("options");
const initialpanel = document.getElementById("initialpanel");
const chat = document.getElementById("chatcontainer");
const pendingMenu = document.getElementById('pendingmenu');
const inputMensaje = document.getElementById('mensaje');
const botonEnviar = document.getElementById('enviarMensaje');
const emojiList = document.getElementById('emojiList');
const mensajeInput = document.getElementById('mensaje');
let destinatario = null;

document.getElementById("container_options_header").style.display = "none";

function showoptionspanel()
{
    optionsPanel.style.display = "flex";
    document.getElementById('barra2').style.display = "none";
    document.getElementById('initialpanel').style.display = "none";
    document.getElementById('chatcontainer').style.display = "none";
}

function closeoptionspanel()
{
    optionsPanel.style.display = "none";
    document.getElementById('barra2').style.display = "";
    document.getElementById('initialpanel').style.display = "flex";
    document.getElementById("profileinfo").style.display = "none";
    document.getElementById("openonlinemenu").style.display = "none";
    document.getElementById("password_autentication").style.display = "none";
    document.getElementById("container_options_header").style.display = "none";
    document.getElementById("chatcontainer").style.display = "none";
}

function closechat()
{
    chat.style.display = "none";
    initialpanel.style.display = "";
}

function openaddfriendmenu()
{
    pendingMenu.hidden = true;
    optionsPanel.style.display = "none";
    document.getElementById('barra2').style.display = "";
    document.getElementById("addfriendmenu").style.display = "block";
    document.getElementById("openonlinemenu").style.display = "none";
    document.getElementById("allfriends").style.display = "none";
    closechat();
}

function openpendingmenu() 
{    
    pendingMenu.hidden = false;
    optionsPanel.style.display = "none";
    document.getElementById('barra2').style.display = "";
    document.getElementById("addfriendmenu").style.display = "none";
    document.getElementById("openonlinemenu").style.display = "none";
    document.getElementById("allfriends").style.display = "none";
    closechat();
}

function openonlinemenu() 
{    
    pendingMenu.hidden = true;
    optionsPanel.style.display = "none";
    document.getElementById('barra2').style.display = "";
    document.getElementById("openonlinemenu").style.display = "block";
    document.getElementById("addfriendmenu").style.display = "none";
    document.getElementById("profileinfo").style.display = "none";
    document.getElementById("allfriends").style.display = "none";
    closechat();
}

function openallfriends()
{
    pendingMenu.hidden = true;
    optionsPanel.style.display = "none";
    document.getElementById('barra2').style.display = "";
    document.getElementById("openonlinemenu").style.display = "none";
    document.getElementById("addfriendmenu").style.display = "none";
    document.getElementById("profileinfo").style.display = "none";
    document.getElementById("allfriends").style.display = "block";
    closechat();
}

function openeditname()
{
    document.getElementById("change_name_container").style.display = "block";
}

function closeeditname()
{
    document.getElementById("change_name_container").style.display = "none";
}

function openeditusername()
{
    document.getElementById("change_username_container").style.display = "block";
}

function closeeditusername()
{
    document.getElementById("change_username_container").style.display = "none";
}

function openeditemail()
{
    document.getElementById("change_email_container").style.display = "flex";
}

function closeeditemail()
{
    document.getElementById("change_email_container").style.display = "none";
}

function openchangepassword()
{
    document.getElementById("change_password_container").style.display = "block";
}

function closechangepassword()
{
    document.getElementById("change_password_container").style.display = "none";
}

function opendeleteaccount()
{
    document.getElementById("delete_account_container").style.display = "block";
}

function closecdeleteaccount()
{
    document.getElementById("delete_account_container").style.display = "none";
}

//amigos
function selectFriend(nombre, foto, destinatarioID) 
{
    destinatario = destinatarioID;
    count = 0;
    chat.style.display = "block";
    pendingMenu.hidden = true;
    document.getElementById("addfriendmenu").style.display = "none";
    initialpanel.style.display = "none";

    // ACTUALIZA CABECERA
    document.getElementById('foto-amigo').src = foto;
    document.getElementById('nombre-amigo').textContent = nombre;

    // Guarda la foto en variable global para cargar mensajes
    window.fotoAmigoActual = foto;
    window.nombreAmigoActual = nombre;
    console.log('destinatario' + destinatarioID);
    console.log('actual' + id_usuario_actual);
    openchat(destinatarioID)
    cargarMensajes();
}


//chat
function openchat(destinatarioID) //abre el chat con el destinatario seleccionado
{
    destinatario = destinatarioID; //establece el destinatario del chat
    count = 0; //resetea el contador de mensajes
    chat.style.display = "block";
    pendingMenu.hidden = true;
    document.getElementById("addfriendmenu").style.display = "none";
    initialpanel.style.display = "none";
    cargarMensajes();
}

//chat enter mandar mensaje
inputMensaje.addEventListener('keydown', function(event) //evento al presionar enter en el input de mensaje
{
  if (event.key === 'Enter') 
  {
    botonEnviar.click();
  }
});

$('#enviarMensaje').click(async function() //evento al enviar un mensaje
{
    const mensaje = $('#mensaje').val();
    if (mensaje.trim() !== '') 
    {
        let mensaje = $('<div>').text($('#mensaje').val()).html().trim();

        enviarMensajes_Api(id_usuario_actual, destinatario, mensaje, 0); //envia el mensaje (chatterly)

        $('#mensaje').val(''); //limpiar el input
        cargarMensajes();
    }
});

count = 0;
async function cargarMensajes() //carga los mensajes
{
    if (destinatario === null) return; //verifica si hay un destinatario seleccionado

    const imgProfileUrl = document.getElementById("profileImg2").src; //obtiene la imagen de perfil
    const fotoFriendUrl = window.fotoAmigoActual; // << Esta es la foto correcta del amigo

        try
        {
            let mensajes = await cargarMensajes_Api(id_usuario_actual, destinatario); //carga los mensajes
            if(mensajes.length > count || mensajes.length == 0) //si hay mensajes nuevos
            {
                count = mensajes.length; //actualiza el contador de mensajes
                $('#chat-messages').empty(); //limpia los mensajes
                
                mensajes.forEach(function(mensaje) //recorre los mensajes y los muestra
                {
                    let fechaEnvio;
                    let imgUrl;

                    if (mensaje.id_emisor == id_usuario_actual) // obtiene la imagen del emisor 
                    {
                        imgUrl = imgProfileUrl;
                    }
                    else 
                    {
                        imgUrl = fotoFriendUrl;
                    }

                    if (mensaje.fecha_envio)
                    {
                        fechaEnvio = new Date(mensaje.fecha_envio).toLocaleString();
                    }
                    else 
                    {
                        fechaEnvio = "Fecha no disponible";
                    }

                    let mensajeHtml = `<div style="padding-left: 10px; padding-top: 10px; margin-top: 5px; display: flex; align-items: flex-start;">`; // crea un div para el mensaje
                    mensajeHtml += `<img src="${imgUrl}" alt="Imagen de perfil" style="width: 30px; height: 30px; border-radius: 50%; ">`; // muestra la imagen de perfil

                    // contenedor del mensaje
                    mensajeHtml += `<div style="display: flex; flex-direction: column; justify-content: flex-start;">`;

                    // fecha y nombre (Nombre arriba, fecha al lado)
                    mensajeHtml += `<div style="display: flex; align-items: center;">`;
                    mensajeHtml += `<strong style="padding-left: 8px; padding-right: 8px; padding-bottom: 5px; font-size: 1.2em; ">${mensaje.username}</strong>`;
                    mensajeHtml += `<div style="font-size: 0.8em;  color: #888;">${fechaEnvio}</div>`;
                    mensajeHtml += `</div>`;

                    // mensaje o archivo
                    if (mensaje.tipo === 'archivo') 
                    {
                        const fileName = mensaje.contenido.split('/').pop(); // obtiene el nombre del archivo
                        const fileExtension = fileName.split('.').pop().toLowerCase(); // obtiene la extensión del archivo
                        let downloadLink = `<a id='link' style="text-align: center; margin-top: 5px;" href="${mensaje.contenido}" download>Descargar [${fileName}]</a>`; // crea un enlace de descarga

                        // Muestra la imagen del archivo adjunto y el enlace de descarga debajo 
                        if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(fileExtension)) 
                        {
                            mensajeHtml += `<div style=" display: block; margin-top: 10px; padding-left: 10px;">`;
                            mensajeHtml += `<img src="${mensaje.contenido}" alt="Imagen adjunta" style="max-width: 200px; max-height: 200px; display: block;">`;
                            mensajeHtml += `<div> ${downloadLink} </div>`;
                            mensajeHtml += `</div>`;
                        } 
                        else if (['pdf'].includes(fileExtension)) 
                        {
                            mensajeHtml += `<div style=" margin-top: 10px;  display: block;">`;
                            mensajeHtml += `<img src="../assets/placeholders/otros.png" alt="Archivo PDF adjunto" style="max-width: 200px; max-height: 200px; display: block;">`;
                            mensajeHtml += downloadLink;
                            mensajeHtml += `</div>`;
                        } 
                        else if (['mp4', 'mov', 'avi'].includes(fileExtension)) 
                        {
                            mensajeHtml += `<div style=" margin-top: 10px; display: block;">`;
                            mensajeHtml += `<video controls style="max-width: 500px; max-height: 300px; display: block;">`;
                            mensajeHtml += `<source src="${mensaje.contenido}" type="video/mp4">`;
                            mensajeHtml += `Tu navegador no soporta el elemento de video.`;
                            mensajeHtml += `</video>`;
                            mensajeHtml += downloadLink;
                            mensajeHtml += `</div>`;
                        } 
                        else if (['mp3'].includes(fileExtension)) 
                        {
                            mensajeHtml += `<div style="margin-top: 10px; display: block;">`;
                            mensajeHtml += `<audio controls style="display: block; margin-bottom: 10px;">`;
                            mensajeHtml += `<source src="${mensaje.contenido}" type="audio/mpeg">`;
                            mensajeHtml += `Tu navegador no soporta el elemento de audio.`;
                            mensajeHtml += `</audio>`;
                            mensajeHtml += downloadLink;
                            mensajeHtml += `</div>`;
                        }
                        else if (['zip'].includes(fileExtension)) 
                        {
                            mensajeHtml += `<div style="margin-top: 10px; display: block;">`;
                            mensajeHtml += `<img src="../assets/placeholders/comprimido.png" alt="Archivo comprimido adjunto" style="max-width: 200px; max-height: 200px; display: block; margin-bottom: 10px;">`;
                            mensajeHtml += downloadLink;
                            mensajeHtml += `</div>`;
                        } 
                        else if (['exe', 'msi'].includes(fileExtension)) 
                        {
                            mensajeHtml += `<div style="margin-top: 10px; display: block;">`;
                            mensajeHtml += `<img src="../assets/placeholders/otros.png" alt="Archivo ejecutable adjunto" style="max-width: 200px; max-height: 200px; display: block; margin-bottom: 10px;">`;
                            mensajeHtml += downloadLink;
                            mensajeHtml += `</div>`;
                        }
                        else 
                        {
                            mensajeHtml += `<div style="margin-top: 10px; display: block;">`;
                            mensajeHtml += `<img src="../assets/placeholders/otros.png" alt="Archivo adjunto" style="max-width: 200px; max-height: 200px; display: block; margin-bottom: 10px;">`;
                            mensajeHtml += downloadLink;
                            mensajeHtml += `</div>`;
                        }
                    }
                    else //si el mensaje es de texto
                    { 
                        let contenido = mensaje.contenido;

                        let urlRegex = /(https?:\/\/[^\s]+)/g; //detecta si el mensaje contiene enlaces

                        contenido = contenido.replace(urlRegex, function (url)  //reemplaza los enlaces por enlaces clicables
                        { 
                            let youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]+)/); //comprueba si el enlace es de youtube
                            if (youtubeMatch) //si el enlace es de youtube se muestra el video
                            { 
                                let videoId = youtubeMatch[1]; //extrae el ID del video
                                return `<br><iframe width="500" height="300" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe><br>`; // muestra el video
                            }
                            return `<a href="${url}" target="_blank" id="link">${url}</a>`; //enlace normal
                        });

                        mensajeHtml += `<div style="margin-bottom: 10px;">${contenido}</div>`; //mensaje de texto normal
                    }

                    mensajeHtml += `</div></div>`; // cierra el div del mensaje

                    $('#chat-messages').prepend(mensajeHtml); //añade el mensaje al chat
                });
            }
        }
        catch (e) 
        {
            console.error("Error al parsear JSON:", e);
            console.log("Respuesta del servidor:", data);
        }
}

//enviar archivo
$('#uploadfile').click(function() //evento al hacer clic en el botón de subir archivo 
{
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', async function(event) //evento al pinchar en el input para subir un archivo
{
    const file = event.target.files[0]; //obtiene el archivo seleccionado
    if (file && destinatario !== null)
    {
        //extensiones permitidas
        const allowedExtensions = [ 
            'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff', 'svg',
            'mp4', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'webm',
            'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a',
            'pdf', 'txt', 'rtf', 'csv',
            'doc', 'docx', 'odt', 'xls', 'xlsx', 'ods', 'ppt', 'pptx', 'odp',
            'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
            'exe', 'msi', 'apk', 'dmg', 'iso',
            'html', 'css', 'js', 'php', 'py', 'java', 'c', 'cpp', 'cs', 'sh', 'bat', 'sql', 'torrent'
        ];
        
        const fileExtension = file.name.split('.').pop().toLowerCase(); //obtiene la extensión del archivo
        if (allowedExtensions.includes(fileExtension)) //comprueba si la extensión del archivo es válida
        {
            const resp = await enviarArchivos_Api(await numeroUsuario_Api(id_usuario_actual), destinatario, file);
            if (!resp.success) 
            {
                alert(resp.error);
            }
        } 
        else 
        {
            alert('Formato de archivo no permitido. Selecciona un archivo valido.');
            event.target.value = ''; //limpia el input
        }
    } 
});

setInterval(cargarMensajes, 500); //cargar mensajes cada 500ms

//emojis
const emojis = {
    "😄 Gente": [
        "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "😊", "😇", "🙂", "🙃", "😉", "😌",
        "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😜", "😝", "🤪", "🤨", "🧐", "🤓", "😎",
        "🥸", "🤩", "🥳", "😏", "😒", "🙄", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫",
        "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰",
        "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧",
        "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🤑", "🤠", "😷", "🤒", "🤕", "🤢", "🤮",
        "🤧", "😵‍💫", "😎", "🥳"
    ],
    "🐾 Animales y naturaleza": [
        "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸",
        "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇",
        "🐺", "🐗", "🐴", "🦄", "🐝", "🪲", "🐛", "🦋", "🐌", "🐞", "🐜", "🪳", "🦂", "🦟", "🦗",
        "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦀", "🦞", "🦐", "🦪", "🐡", "🐠", "🐟", "🐬",
        "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🦣", "🐘", "🦛", "🦏", "🐪", "🐫",
        "🦙", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦌", "🦃", "🐓", "🦤", "🦚", "🦜", "🦢",
        "🦩", "🦔", "🦦", "🦥", "🐿️", "🦨", "🦡", "🦃"
    ],
    "🍕 Comida": [
        "🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍", "🥭", "🍎", "🍏", "🍐", "🍑", "🍒", "🍓",
        "🫐", "🥝", "🍅", "🫒", "🥥", "🥑", "🍆", "🥔", "🥕", "🌽", "🌶️", "🫑", "🥒", "🥦", "🧄",
        "🧅", "🍄", "🥜", "🌰", "🍞", "🥐", "🥖", "🫓", "🥨", "🥯", "🥞", "🧇", "🧀", "🍖", "🍗",
        "🥩", "🥓", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🫔", "🥙", "🧆", "🥗", "🥘", "🫕",
        "🍝", "🍜", "🍲", "🍛", "🍣", "🍤", "🍚", "🍙", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧",
        "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🧂", "🥤", "🧋", "🧃",
        "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🫖", "🫛", "🫚"
    ],
    "⚙️ Herramientas y objetos": [
        "🪓", "🔪", "🗡️", "⚔️", "🛡️", "🔧", "🔨", "⛏️", "⚒️", "🛠️", "🪛", "🔩", "⚙️", "🗜️", "🧱",
        "🪜", "🧰", "🪠", "🔗", "⛓️", "🪝", "🧲", "🪤", "🪜", "🪦", "🛢️", "🛡️", "🔒", "🔓", "🔑",
        "🗝️", "🧨", "🪃", "📿", "💎", "🪙"
    ],
    "🚗 Transporte y vehículos": [
        "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🛴", "🚲",
        "🛵", "🏍️", "🛺", "🚁", "✈️", "🛫", "🛬", "🛸", "🚢", "🛳️", "⛴️", "🛥️", "🚤", "🛶", "⛵"
    ],
    "🌍 Lugares y naturaleza": [
        "🏔️", "⛰️", "🗻", "🌋", "🏕️", "🏖️", "🏝️", "🏜️", "🏞️", "🏟️", "🏛️", "🏗️", "🗽", "🗿",
        "🗼", "🏰", "🏯", "🏚️", "🏠", "🏡", "🏢", "🏣", "🏤", "🏥", "🏦", "🏨", "🏩", "🏪", "🏫",
        "🏬", "🏭", "⛪", "🕌", "🛕", "🕍", "⛩️", "🕋", "⛲"
    ],
    "⚽ Deportes": [
        "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓", "🏸", "🥋", "🥊", "🎯", "🤿",
        "🏹", "⛷️", "🏂", "🏋️", "🏌️", "🏄", "🏊", "🚴", "🚵"
    ]
};

function showEmojis() //muestra los emojis
{
    document.getElementById("gifPickerContainer").style.display = 'none';

    const emojisDiv = document.getElementById('emojisDiv');
    if (emojisDiv.style.display === 'none') 
    {
        emojisDiv.style.display = 'block';
    } 
    else 
    {
        emojisDiv.style.display = 'none';
    }
}

for (let category in emojis) //recorre las categorías de emojis
{
    const categoryTitle = document.createElement('div'); //crea un div para el titulo de la categoría
    categoryTitle.textContent = category;
    categoryTitle.style = "font-size: 14px; color: #fff; padding-bottom: 10px; padding-top: 10px; font-weight: bold;";
    emojiList.appendChild(categoryTitle); //añade el titulo al emojiList

   
    const emojiContainer = document.createElement('div'); //crea un div para los emojis 
    emojiContainer.style = "display: flex; flex-wrap: wrap; gap: 10px;";  

    emojis[category].forEach((emoji) => { //recorre los emojis de la categoría
        const emojiItem = document.createElement('div'); //crea un div para el emoji
        emojiItem.textContent = emoji;
        emojiItem.style = `font-size: 20px; cursor: pointer; gap: 5px; text-align: center;`;
        
        emojiItem.addEventListener('click', () => { //evento al hacer clic en el emoji
            mensajeInput.value += emoji; //añade el emoji al input
        });

        emojiContainer.appendChild(emojiItem); //añade el emoji al contenedor
    });

    emojiList.appendChild(emojiContainer); //añade el contenedor al emojiList
    
    const divisor = document.createElement('div'); //crea un divisor
    divisor.style = "height: 1px; background-color: #123b5c; margin: 15px 0;";
    emojiList.appendChild(divisor); //añade el divisor al emojiList
}

//imagen perfil
function showprofileinfo() //muestra el panel de información del perfil
{
    showoptionspanel();
    document.getElementById("profileinfo").style.display = "block";
    document.getElementById("password_autentication").style.display = "block";
    document.getElementById("container_options_header").style.display = "flex";
}

const img = document.getElementById('profileImg');
const img2 = document.getElementById('profileImg2');
const fileProfile = document.getElementById('fotoProfile');

//abre el selector de archivos al hacer clic en la imagen
img.addEventListener('click', () => {
    fileProfile.click();
});

//cambia la imagen de perfil
fileProfile.addEventListener('change', async () => {
    let data = await cambiarFotoPerfil_Api();
    
    if(data.success)
    {
        img.src = data.newImagePath; //actualiza la imagen de perfil
        img2.src = data.newImagePath; 
    }
    else
    {
        alert("Error al cambiar la imagen de perfil");
    } 
});

//opciones modificar perfil
async function cambiar_alias() 
{
    const nuevo = document.getElementById('new_name').value.trim();
    const change_name_texterror = document.getElementById('change_name_texterror');
    
    if (!nuevo)
    {
        change_name_texterror.textContent = 'Introduce un nombre valido.';
        change_name_texterror.style.display = 'block';
        change_name_texterror.style.marginTop = '5px';
        return;
    } 

    const res = await fetch('../php/cambiar_alias.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        id_user: id_usuario_actual,
        new_name: nuevo
        })
    });

    const { success, message } = await res.json();
    if (success)
    {
        change_name_texterror.textContent = 'Nombre cambiado.';
        change_name_texterror.style.marginTop = '5px';
        document.getElementById('user-alias').textContent = nuevo;
    } 
}

async function cambiar_username() 
{
    const nuevo = document.getElementById('new_username').value.trim();
    const change_username_texterror = document.getElementById('change_username_texterror');

    if (!nuevo)
    {
        change_username_texterror.textContent = 'Introduce un nombre de usuario valido.';
        change_username_texterror.style.display = 'block';
        change_username_texterror.style.marginTop = '5px';
    } 

    const res = await fetch('../php/cambiar_username.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        id_user: id_usuario_actual,
        new_username: nuevo
        })
    });

    const { success, message } = await res.json();
    if (success)
    {
        change_username_texterror.textContent = 'Nombre de usuario cambiado.';
        document.getElementById('user-username').textContent = nuevo;
        change_username_texterror.style.marginTop = '5px';
        window.location.href='../html/login.html';
    } 
}

async function cambiar_email() 
{
    const nuevo = document.getElementById('new_email').value.trim();
    const change_email_texterror = document.getElementById('change_email_texterror');
    
    if (!nuevo)
    {
        change_email_texterror.textContent = 'Introduce un correo valido.';
        change_email_texterror.style.display = 'block';
        change_email_texterror.style.marginTop = '5px';
    } 
  
    const res = await fetch('../php/cambiar_correo.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_user: id_usuario_actual,
        new_email: nuevo
      })
    });
  
    const { success, message } = await res.json();
    if (success)
    {
        change_email_texterror.textContent = 'Correo cambiado.';
        change_email_texterror.style.marginTop = '5px';
        document.getElementById('user-email').textContent = nuevo;
    }
}

function changePassword() 
{
    const out = document.getElementById('mensajeChange');
    const oldPwd = document.getElementById('old_password').value.trim();
    const newPwd = document.getElementById('new_password').value.trim();
    const confirmNew = document.getElementById('confirm_new_password').value.trim();

    // limpiamos mensaje previo
    out.textContent = '';
    out.classList.remove('success','error');

    if (!oldPwd || !newPwd || !confirmNew) // validaciones
    {
        console.log('[changePassword] Falta algún campo');
        out.textContent = 'Completa todos los campos.';
        out.classList.add('error');
        return;
    }

    if (newPwd !== confirmNew) 
    {
        out.textContent = 'Las nuevas contraseñas no coinciden.';
        out.classList.add('error');
        return;
    }

    // se llama a la api
    changePassword_Api().then(data => {
        out.textContent = data.message;
        if (data.success) 
        {
            out.classList.add('success');
        } 
        else 
        {
            out.classList.add('error');
        }
    })
    .catch(err => {
        out.textContent = 'Error de conexión. Intenta más tarde.';
        out.classList.add('error');
    });
}

async function eliminar_cuenta() 
{
    const delete_account_texterror = document.getElementById('delete_account_texterror');
    delete_account_texterror.style.marginTop = '5px';
    delete_account_texterror.textContent = 'Eliminando cuenta...';

    const res = await fetch('../php/eliminar_cuenta.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_user: id_usuario_actual })
    });

    //espera 2 segundos y redirige al index
    setTimeout(() => {
        window.location.href = '../html/index.html';
    }, 2000);
}

//listener para los top-links
document.addEventListener('click', e => { //evento al hacer clic en cualquier parte del documento
  
    const isLinkTop = e.target.matches('[id="link-top"]'); //guarda si el elemento clicado es un link-top
    const isButton = e.target.matches('button'); //guarda si el elemento clicado es un boton

    if (isLinkTop || isButton) //si el elemento clicado es un link-top o un boton
    {
        document.querySelectorAll('[id="link-top"]').forEach(link => { //se recorre todos los links-top para quitarles la clase .active
            link.classList.remove('active'); //quita la clase .active
        });

        if (isLinkTop) //si el elemento clicado es un link-top
        {
            e.target.classList.add('active'); //se le añade la clase .active al link clicado
        } 
    }
});