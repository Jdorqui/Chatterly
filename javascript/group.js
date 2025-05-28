function openandclosecreategroup() //abre o cierra el menu para crear los grupos
{
  if (document.getElementById('container-group').style.display === "none") 
  {
      document.getElementById('container-group').style.display = "block";
      document.getElementById('bg-create-group').style.display = "block";
  } 
  else 
  {
      document.getElementById('container-group').style.display = "none";
      document.getElementById('bg-create-group').style.display = "none";
  }
}

function uploadGroupImage() //abre el explorador de archivos para subir una imagen
{
  document.getElementById('file-input').click();
}

function closegroup()
{
  document.getElementById('barra2').style.display = "";
  document.getElementById('initialpanel').style.display = "";

  document.getElementById("options").style.display = "none";
  document.getElementById('barra2_group').style.display = "none";
  document.getElementById('initialpanel_group').style.display = "none";
  document.getElementById('chatcontainer_group').style.display = "none";
  document.getElementById('chatcontainer').style.display = "none"; 
}

//grupos
function crearGrupo() 
{
    const nombreGrupo = document.getElementById('nombreServidor').value;
    const imagen = document.getElementById('file-input').files[0];

    if (!nombreGrupo) 
    {
        alert("Debes proporcionar un nombre.");
        return;
    }

    const formData = new FormData();
    formData.append("nombre_grupo", nombreGrupo);
    formData.append("imagen_grupo", imagen);

    fetch('../php/create_group.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) 
        {
            document.getElementById('container-group').style.display = "none";   
        }
        else 
        {
            alert("Error: " + data.error);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Ocurrió un error al enviar la solicitud.");
    });
}

// abre panel de grupo
// abre panel de grupo y actualiza nombre e imagen dinámica
function opengroup(el)
{
    // 1) ocultar paneles anteriores
    document.getElementById('barra2').style.display             = 'none'
    document.getElementById('initialpanel').style.display       = 'none'
    document.getElementById('chatcontainer').style.display      = 'none'
    document.getElementById('initialpanel_group').style.display = 'none'

    // 2) mostrar sidebar de grupo
    document.getElementById('barra2_group').style.display = 'flex'

    // 3) leer id y nombre del grupo
    var groupId   = el.dataset.groupId
    var groupName = el.dataset.groupName

    // 4) actualizar título
    var titleEl             = document.getElementById('groupname')
    titleEl.textContent     = groupName
    titleEl.dataset.groupId = groupId

    // 5) calcular alias de usuario actual a partir de la imagen de perfil
    var profileImgEl = document.getElementById('profileImg2')
    var userAlias    = 'default_user'
    if (profileImgEl && profileImgEl.src)
    {
        var parts = profileImgEl.src.split('/')
        var idx   = parts.indexOf('users')
        if (idx !== -1 && parts.length > idx + 1)
        {
            userAlias = parts[idx + 1]
        }
    }

    // 6) construir ruta de la imagen del grupo
    var imgPath = '../assets/users/'
                + encodeURIComponent(userAlias)
                + '/groups/'
                + encodeURIComponent(groupId)
                + '/img_profile/icon.png'

    // 7) asignar la imagen y manejar fallback
    var imgEl = document.getElementById('groupimage')
    imgEl.src = imgPath
    imgEl.onerror = function()
    {
        this.onerror = null
        this.src     = '../assets/imgs/default_group.png'
    }

    // 8) cargar canales de texto/voz
    loadChannels(groupId)
}


// carga lista de canales
function loadChannels(groupId)
{
    fetch('../php/get_channels.php',
    {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId })
    })
    .then(function(res)
    {
        return res.json();
    })
    .then(function(data)
    {
        if (!data.success)
        {
            console.error('get_channels error:', data.error);
        }
        else
        {
            var ulTxt = document.getElementById('lista-texto');
            var ulVoz = document.getElementById('lista-voz');
            ulTxt.innerHTML = '';
            ulVoz.innerHTML = '';

            for (var i = 0; i < data.text.length; i++)
            {
                var ch = data.text[i];
                var li = document.createElement('li');
                li.textContent = '# ' + ch.nombre;
                li.style.cursor = 'pointer';
                li.onclick = (function(id, name)
                {
                    return function()
                    {
                        openGroupChannel(id, name);
                    };
                })(ch.id_canal, ch.nombre);
                ulTxt.appendChild(li);
            }

            for (var j = 0; j < data.voice.length; j++)
            {
                var cv = data.voice[j];
                var li2 = document.createElement('li');
                li2.textContent = cv.nombre;
                li2.style.cursor = 'pointer';
                li2.onclick = (function(name)
                {
                    return function()
                    {
                        alert('entrando al canal de voz \"' + name + '\"');
                    };
                })(cv.nombre);
                ulVoz.appendChild(li2);
            }
        }
    })
    .catch(function(err)
    {
        console.error('fetch get_channels fallido:', err);
    });
}

// crear canal de texto
function crearCanalTexto()
{
    var name = prompt('nombre del nuevo canal de texto:');
    if (name)
    {
        createChannel(name, 'texto');
    }
}

// crear canal de voz
function crearCanalVoz()
{
    var name = prompt('nombre del nuevo canal de voz:');
    if (name)
    {
        createChannel(name, 'voz');
    }
}

// crear canal comun
function createChannel(name, type)
{
  var titleEl = document.getElementById('groupname');
  var groupId = titleEl.dataset.groupId;

  var payload = { group_id: groupId, nombre: name, tipo: type };

  fetch('../php/create_channel.php',{
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(function(res){
    return res.json();
  })
  .then(function(data){
    if (!data.success)
    {
      alert('error al crear canal: ' + data.error);
    }
    else
    {
      loadChannels(groupId);
    }
  })
  .catch(function(err){
    console.error('fetch create_channel fallido:', err);
  });
}

// toggle acordeon
function toggleAccordion(contenidoId)
{
  var content = document.getElementById(contenidoId);
  var isActive;
  if (content.classList.contains('active'))
  {
    content.classList.remove('active');
    isActive = false;
  }
  else
  {
    content.classList.add('active');
    isActive = true;
  }

  var icon;
  if (contenidoId === 'contenido-texto')
  {
    icon = document.getElementById('icono-texto');
  }
  else
  {
    icon = document.getElementById('icono-voz');
  }

  if (isActive)
  {
    icon.textContent = '▾';
  }
  else
  {
    icon.textContent = '▸';
  }
}

// contador de mensajes del canal del grupo
var countGroup = 0

// abre chat de canal de grupo
function openGroupChannel(channelId, channelName)
{
  console.log('openGroupChannel llamado con:', channelId, channelName)

  document.getElementById('initialpanel_group').style.display = 'none'

  var chatG = document.getElementById('chatcontainer_group')
  chatG.style.display        = 'block'
  chatG.dataset.channelId    = channelId

  var header = document.getElementById('nombre-canal-grupo')
  header.textContent         = '# ' + channelName

  countGroup = 0
  loadGroupMessages(channelId)
}

// carga los mensajes del canal de grupo
function loadGroupMessages(channelId)
{
    console.log('loadGroupMessages llamado con channelId:', channelId)

    fetch('../php/get_group_messages.php',
    {
        method:      'POST',
        credentials: 'same-origin',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ channel_id: channelId })
    })
    .then(function(res)
    {
        return res.json()
    })
    .then(function(data)
    {
        console.log('get_group_messages respuesta:', data)

        if (!data.success)
        {
            console.error('error al cargar mensajes:', data.error)
            return
        }

        // solo repintar si hay nuevos mensajes o ninguno
        if (data.messages.length > countGroup || data.messages.length === 0)
        {
            countGroup = data.messages.length

            var container = document.getElementById('chat-messages-group')
            container.innerHTML = ''

            // inyectar de antiguo a reciente
            for (var i = 0; i < data.messages.length; i++)
            {
                var msg = data.messages[i]

                // contenedor exterior con estilos
                var div = document.createElement('div')
                div.style.paddingLeft   = '10px'
                div.style.paddingTop    = '10px'
                div.style.marginTop     = '5px'
                div.style.display       = 'flex'
                div.style.alignItems    = 'flex-start'

                // avatar
                var avatar = document.createElement('img')
                avatar.src               = msg.foto || '../assets/imgs/default_profile.png'
                avatar.style.width       = '30px'
                avatar.style.height      = '30px'
                avatar.style.borderRadius= '50%'
                div.appendChild(avatar)

                // cuerpo mensaje (fila interna)
                var body = document.createElement('div')
                body.style.display       = 'flex'
                body.style.flexDirection = 'column'
                body.style.marginLeft    = '8px'
                body.style.wordBreak     = 'break-word'

                // header alias + fecha
                var header = document.createElement('div')
                var fecha  = ''
                if (msg.fecha_envio)
                {
                    fecha = new Date(msg.fecha_envio).toLocaleString()
                }
                header.innerHTML = '<strong>' + msg.alias + '</strong>' +
                                   '<span style="font-size:0.8em;color:#888;margin-left:8px;">' +
                                   fecha +
                                   '</span>'
                body.appendChild(header)

                // contenido texto
                var content = document.createElement('div')
                content.textContent     = msg.contenido
                content.style.marginTop = '4px'
                body.appendChild(content)

                div.appendChild(body)
                container.appendChild(div)
            }

            // desplazar al final
            container.scrollTop = container.scrollHeight
        }
    })
    .catch(function(err)
    {
        console.error('fetch get_group_messages fallido:', err)
    })
}

// envía un mensaje al canal de grupo
function sendGroupMessage()
{
    var input     = document.getElementById('mensaje-grupo')
    var raw       = input.value.trim()
    if (raw === '')
    {
        return
    }

    var tmp = document.createElement('div')
    tmp.textContent = raw
    var contenido = tmp.innerHTML

    var chatG = document.getElementById('chatcontainer_group')
    var channelId  = chatG.dataset.channelId
    if (!channelId)
    {
      console.error('no hay channelId en data-channel-id')
      return
    }

    var payload = {
        channel_id: channelId,
        contenido: contenido,
        user_id: id_usuario_actual 
      }
    console.log('payload send_group_message:', payload)

    fetch('../php/send_group_message.php',
    {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(function(res)
    {
        return res.json()
    })
    .then(function(data)
    {
        console.log('send_group_message respuesta:', data)
        if (!data.success)
        {
          alert('error al enviar mensaje: ' + data.error)
        }
        else
        {
          input.value = ''
          loadGroupMessages(channelId)
        }
    })
    .catch(function(err)
    {
      console.error('fetch send_group_message fallido:', err)
    })
}

// asociar envio a botón y Enter
document.getElementById('mensaje-grupo').addEventListener('keydown', function(e){
  if (e.key === 'Enter')
  {
    e.preventDefault()
    sendGroupMessage()
  }
})

// polling cada 5s si el chat de grupo está visible
setInterval(function()
{
  if (document.getElementById('chatcontainer_group').style.display === 'flex' && document.getElementById('chatcontainer_group').dataset.channelId)
  {
    loadGroupMessages(document.getElementById('chatcontainer_group').dataset.channelId)
  }
}, 500)