async function enviarMensajes_Api(usuario, destinatario, mensaje)
{
    await fetch("../php/chat.php",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `usuario=${encodeURIComponent(usuario)}&destinatario=${encodeURIComponent(destinatario)}&mensaje=${encodeURIComponent(mensaje)}`
        });
}

async function enviarArchivos_Api(usuario, destinatario, file) //poner asi todos los fetchs..........
{
    const formData = new FormData();
    formData.append('usuario', usuario)
    formData.append('destinatario', destinatario); //añade el destinatario al formData
    formData.append('archivo', file); //añade el archivo al formData

    let fetchData = await fetch('../php/uploadfiles.php', { //envia el archivo al servidor
        method: 'POST',
        body: formData,
    })
    return await fetchData.json();
}

async function cargarMensajes_Api(usuario, destinatario) 
{
    let fetchData = await fetch("../php/chat.php",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `usuario=${encodeURIComponent(usuario)}&destinatario=${encodeURIComponent(destinatario)}`
        });
    let data = await fetchData.json();
    return data; //devuelve un array con los mensajes en formato json
}

async function usuarioNumero_Api(usuario) 
{
    let fetchData = await fetch("../php/usuarioNumero_Api.php",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `usuario=${encodeURIComponent(usuario)}`
        });
    let data = await fetchData.json();
    return data.id_user;
}

async function numeroUsuario_Api(id_user) 
{
    let fetchData = await fetch("../php/numeroUsuario_Api.php",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id_user=${encodeURIComponent(id_user)}`
        });
    let data = await fetchData.json();
    return data.alias;
}

function crearGrupo_Api() {
    const nombreGrupo = document.getElementById('nombreServidor').value;
    const imagen = document.getElementById('file-input').files[0];

    if (!nombreGrupo || !imagen) {
        alert("Debes proporcionar un nombre y una imagen.");
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
        if (data.success) {
            alert("Grupo creado con éxito con ID " + data.group_id);
            // Opcional: cerrar el modal, refrescar lista de grupos, etc.
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Ocurrió un error al enviar la solicitud.");
    });
}
