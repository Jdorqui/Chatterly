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

  document.getElementById('barra2_group').style.display = "none";
  document.getElementById('initialpanel_group').style.display = "none";
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

function opengroup(el) 
{
  document.getElementById('barra2').style.display = "none";
  document.getElementById('initialpanel').style.display = "none";
  document.getElementById('chatcontainer').style.display = "none";
  
  document.getElementById('barra2_group').style.display = "block";
  document.getElementById('initialpanel_group').style.display = "block";

  //se lee el dataset del elemento clicado
  const groupId = el.dataset.groupId;
  const groupName = el.dataset.groupName;
  console.log('Clicked group:', groupId, groupName);

  //actualiza el nombre del grupo
  document.getElementById('groupname').textContent = groupName;

  //envia el id del grupo al php
  fetch('../php/select_group.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ group_id: groupId })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      console.error('Error al cargar grupo:', data.error);
    }
    //actualiza el chat......
  })
  .catch(err => console.error('Fetch fallido:', err));
}

crearCanalTexto()
{

}