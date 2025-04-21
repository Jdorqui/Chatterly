function openandclosecreategroup() //abre o cierra el menu para crear los grupos
{
    if (document.getElementById('container-group').style.display === "block") 
    {
        document.getElementById('container-group').style.display = "none";
    } 
    else 
    {
        document.getElementById('container-group').style.display = "block";
    }
}

function uploadGroupImage() //abre el explorador de archivos para subir una imagen
{
    document.getElementById('file-input').click();
}

function previewGroupImage(event) //muestra la imagen seleccionada en el input de tipo file
{
    var reader = new FileReader();
    reader.onload = function(){
        var output = document.getElementById('group-image-preview');
        output.src = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}