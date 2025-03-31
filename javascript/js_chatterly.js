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

function showoptionspanel()
{
    optionsPanel.style.display = "block";
    normalPanel.style.display = "none";
}

function closeoptionspanel()
{
    normalPanel.style.display = "block";
    optionsPanel.style.display = "none";
    document.getElementById("profileinfo").style.display = "none";
    document.getElementById("openonlinemenu").style.display = "none";
    document.getElementById("password_autentication").style.display = "none";
}

function closechat()
{
    chat.style.display = "none";
    initialpanel.style.display = "block";
}

function openaddfriendmenu()
{
    pendingMenu.hidden = true;
    document.getElementById("addfriendmenu").style.display = "block";
    document.getElementById("openonlinemenu").style.display = "none";
    document.getElementById("allfriends").style.display = "none";
    closechat();
}

function openpendingmenu() 
{    
    pendingMenu.hidden = false;
    document.getElementById("addfriendmenu").style.display = "none";
    document.getElementById("openonlinemenu").style.display = "none";
    document.getElementById("allfriends").style.display = "none";
    closechat();
}

function openonlinemenu() 
{    
    pendingMenu.hidden = true;
    document.getElementById("openonlinemenu").style.display = "block";
    document.getElementById("addfriendmenu").style.display = "none";
    document.getElementById("profileinfo").style.display = "none";
    document.getElementById("allfriends").style.display = "none";
    closechat();
}

function openallfriends()
{
    pendingMenu.hidden = true;
    document.getElementById("openonlinemenu").style.display = "none";
    document.getElementById("addfriendmenu").style.display = "none";
    document.getElementById("profileinfo").style.display = "none";
    document.getElementById("allfriends").style.display = "block";
}

//sesion
function cerrarSesion()
{
    fetch("../php/logout.php", { method: "POST" })
        .then(() => {
            mostrarLogin();
        })
        .catch((error) => console.error("Error:", error));
}

//amigos
function selectFriend(nombre, foto, destinatario) 
{
    const nombreAmigo = document.getElementById('nombre-amigo'); //recoge el nombre del amigo
    const fotoAmigo = document.getElementById('foto-amigo'); //recoge la foto del amigo

    nombreAmigo.textContent = nombre; //muestra el nombre del amigo
    fotoAmigo.src = foto; //muestra la foto del amigo

    openchat(destinatario); //abre el chat con el amigo seleccionado
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
    const fotoFriendUrl = document.getElementById("fotoFriend").src; //obtiene la imagen del amigo

        try 
        {
            let mensajes = await cargarMensajes_Api(id_usuario_actual, destinatario); //carga los mensajes
            if(mensajes.length > count || mensajes.length == 0) //si hay mensajes nuevos
            {

                count = mensajes.length; //actualiza el contador de mensajes
                $('#chat-messages').empty(); //limpia los mensajes
                
                mensajes.forEach(function(mensaje) //recorre los mensajes y los muestra
                {
                    let fechaEnvio = mensaje.fecha_envio ? new Date(mensaje.fecha_envio).toLocaleString() : "Fecha no disponible"; //obtiene la fecha de envio 
                    let imgUrl = (mensaje.id_emisor == id_usuario_actual) ? imgProfileUrl : fotoFriendUrl; //obtiene la imagen del emisor 

                    let mensajeHtml = `<div style="padding-left: 10px; padding-top: 10px; margin-top: 5px; display: flex; align-items: flex-start;">`; // crea un div para el mensaje
                    mensajeHtml += `<img src="${imgUrl}" alt="Imagen de perfil" style="width: 30px; height: 30px; border-radius: 50%; ">`; // muestra la imagen de perfil

                    // Contenedor del mensaje
                    mensajeHtml += `<div style="display: flex; flex-direction: column; justify-content: flex-start;">`;

                    // Fecha y nombre (Nombre arriba, fecha al lado)
                    mensajeHtml += `<div style="display: flex; align-items: center;">`;
                    mensajeHtml += `<strong style="padding-left: 8px; padding-right: 8px; padding-bottom: 5px; font-size: 1.2em; ">${mensaje.alias}</strong>`;
                    mensajeHtml += `<div style="font-size: 0.8em;  color: #888;">${fechaEnvio}</div>`;
                    mensajeHtml += `</div>`;

                    // Mensaje o archivo
                    if (mensaje.tipo === 'archivo') 
                    {
                        const fileName = mensaje.contenido.split('/').pop(); // obtiene el nombre del archivo
                        const fileExtension = fileName.split('.').pop().toLowerCase(); // obtiene la extensión del archivo
                        let downloadLink = `<a id='link' style="text-align: center;" href="${mensaje.contenido}" download>Descargar [${fileName}]</a>`; // crea un enlace de descarga

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
                    else // si el mensaje es de texto
                    { 
                        let contenido = mensaje.contenido;

                        let urlRegex = /(https?:\/\/[^\s]+)/g; // detecta si el mensaje contiene enlaces

                        contenido = contenido.replace(urlRegex, function (url)  // reemplaza los enlaces por enlaces clicables
                        { 
                            let youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]+)/); // comprueba si el enlace es de youtube
                            if (youtubeMatch) // si el enlace es de youtube se muestra el video
                            { 
                                let videoId = youtubeMatch[1]; // extrae el ID del video
                                return `<br><iframe width="500" height="300" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe><br>`; // muestra el video
                            }
                            return `<a href="${url}" target="_blank" id="link">${url}</a>`; // enlace normal
                        });

                        mensajeHtml += `<div style="margin-bottom: 10px;">${contenido}</div>`; // mensaje de texto normal
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
            await enviarArchivos_Api(await numeroUsuario_Api(id_usuario_actual), destinatario, file);
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
    const emojisDiv = document.getElementById('emojisDiv');
    emojisDiv.style.display = emojisDiv.style.display === 'none' ? 'block' : 'none'; //alterna la visibilidad del emojisDiv
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
    divisor.style = "height: 1px; background-color: #444; margin: 15px 0;";
    emojiList.appendChild(divisor); //añade el divisor al emojiList
}

//imagen perfil
function showprofileinfo() //muestra el panel de información del perfil
{
    showoptionspanel();
    document.getElementById("profileinfo").style.display = "block";
    document.getElementById("password_autentication").style.display = "block";
}

const img = document.getElementById('profileImg');
const img2 = document.getElementById('profileImg2');
const fileProfile = document.getElementById('fotoProfile');
const uploadForm = document.getElementById('uploadForm');

//abre el selector de archivos al hacer clic en la imagen
img.addEventListener('click', () => {
    fileProfile.click();
});

//subir la imagen seleccionada al servidor
fileProfile.addEventListener('change', () => {
    const formData = new FormData(uploadForm);

    fetch('upload.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success)
        {
            img.src = data.newImagePath; //actualiza la imagen de perfil
            img2.src = data.newImagePath; 
        } 
        else 
        {
            alert(data.error);
        }
    })
    .catch(error => console.error('Error en la subida de la imagen:', error));
});