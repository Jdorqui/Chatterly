function cerrarLogin()
{
    document.getElementById("loginDiv").style.display = "none";
}

function mostrarLogin() //animacion
{
    document.getElementById("registroDiv").classList.remove("show");
    setTimeout(() => {
        document.getElementById("registroDiv").style.display = "none";
    }, 500);

    document.getElementById("loginDiv").style.display = "block";
    setTimeout(() => {
        document.getElementById("loginDiv").classList.add("show");
    }, 10);
}

function mostrarRegistro() //animacion
{
    document.getElementById("loginDiv").classList.remove("show");
    setTimeout(() => {
        document.getElementById("loginDiv").style.display = "none";
    }, 500);

    document.getElementById("registroDiv").style.display = "block";
    setTimeout(() => {
        document.getElementById("registroDiv").classList.add("show");
    }, 10); 
}

async function registrarUsuario_Api() //verifica errores del registro y registra los usuarios
{
    const formData = new FormData(document.getElementById("form-registro")); 

    let fetchData = await fetch(`../php/registro.php`, {
        method: "POST",
        body: formData,
    });

    let data = await fetchData.json();

    try
    {
        const errorMessage = document.getElementById("error-message-registro");
        errorMessage.style.display = "none";  //reseteamos el mensaje de error

        if (data.status === "success") 
        {
            mostrarLogin();  //vuelve al login
        } 
        else //muestra el mensaje de error si hubo un problema 
        {
            errorMessage.style.display = "block";
            errorMessage.style.color = "#f7767a";  //mostramos el mensaje de error
            errorMessage.textContent = data.message;
        }
    }
    catch(e)
    {
        console.error("Error:", error);
        const errorMessage = document.getElementById("error-message-registro");
        errorMessage.style.display = "block";
        errorMessage.textContent = "Hubo un error al procesar la solicitud. Intenta nuevamente más tarde.";
    }
}

async function login()
{
    const usuario = document.getElementById("usuario-login").value;
    const password = document.getElementById("password-login").value;

    let data = await loginUsuario_Api();
    if(data.status === 'success')
    {
        await fetch(`../php/login.php`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}`
        });
        
        window.location.href = "../php/chatterly.php";
    }
}

async function login_Api(usuario, password) //devuelve si login.php success
{
    let fetchData = await fetch("../php/login.php",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}`
        });

    let data = await fetchData.json();
    return data;
}

async function loginUsuario_Api() //verifica errores del login
{
    const usuario = document.getElementById("usuario-login").value;
    const password = document.getElementById("password-login").value;
    const errorMessage = document.getElementById("error-message");

    errorMessage.style.display = "none";
    errorMessage.textContent = "";

    let data = await login_Api(usuario, password); //se usa el metodo login_api                                               

    if (data.status !== "success") 
        {
            errorMessage.textContent = data.message;

            errorMessage.style.color = "#f7767a";
            document.getElementById("ms3").style.color = "#f7767a";
            document.getElementById("ms4").style.color = "#f7767a";
            
            if(document.getElementById("ms3").textContent.includes(data.message) == false)
            {
                document.getElementById("ms3").textContent = document.getElementById("ms3").textContent + ` - ${data.message}`;
                document.getElementById("ms4").textContent = document.getElementById("ms4").textContent + ` - ${data.message}`;

            }
        } 
    return data;
}