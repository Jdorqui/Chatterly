async function enviarMensajes_Api(usuario, destinatario, mensaje)
{
    await fetch("../php/chat.php",
    {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `usuario=${encodeURIComponent(usuario)}&destinatario=${encodeURIComponent(destinatario)}&mensaje=${encodeURIComponent(mensaje)}`
    });
}

async function enviarArchivos_Api(usuario, destinatario, file)
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