async function login_Api(usuario, password) 
{
  const body = new URLSearchParams({ usuario, password }).toString();
  const res  = await fetch('../php/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  return res.json();
}

async function registrarUsuarioApi() 
{
  const formData = new FormData(document.getElementById("form-registro"));
  const res = await fetch("../php/registro.php", {
    method: "POST",
    body: formData
  });
  return res.json();
}

async function enviarMensajes_Api(usuario, destinatario, mensaje)
{
  await fetch("../php/chat.php",{
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
  let fetchData = await fetch("../php/chat.php",{
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `usuario=${encodeURIComponent(usuario)}&destinatario=${encodeURIComponent(destinatario)}`
  });
  let data = await fetchData.json();
  return data; //devuelve un array con los mensajes en formato json
}

async function usuarioNumero_Api(usuario) 
{
  let fetchData = await fetch("../php/usuarioNumero_Api.php",{
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `usuario=${encodeURIComponent(usuario)}`
  });
  let data = await fetchData.json();
  return data.id_user;
}

async function numeroUsuario_Api(id_user) 
{
  let fetchData = await fetch("../php/numeroUsuario_Api.php",{
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id_user=${encodeURIComponent(id_user)}`
  });
  let data = await fetchData.json();
  return data.alias;
}

async function cambiarFotoPerfil_Api() //sube la imagen al servidor
{
  const formData = new FormData(document.getElementById('uploadForm'));
  return fetch('../php/upload.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json());
}

function forgotPassword_Api()  //con correo
{
  const form = document.getElementById('form-forgotPassword');
  const body = new URLSearchParams(new FormData(form)).toString();

  return fetch('../php/forgotPassword.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body
  })
  .then(res => res.json());
}

function changePassword_Api() //con contraseña
{
  const old_password = document.getElementById('old_password').value;
  const new_password = document.getElementById('new_password').value;

  return fetch('../php/forgotPassword.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_user: id_usuario_actual,
      old_password,
      new_password
    })
  })
  .then(res => res.json());
}