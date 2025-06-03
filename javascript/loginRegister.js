function mostrarLogin() //animacion
{
    document.getElementById("registroDiv").classList.remove("show");
    setTimeout(() => {
        document.getElementById("registroDiv").style.display = "none";
    }, 500);

    document.getElementById("bg-registro").classList.remove("show");
    setTimeout(() => {
        document.getElementById("bg-registro").style.display = "none";
    }, 500);

    document.getElementById("forgotPasswordDiv").classList.remove("show");
    setTimeout(() => {
        document.getElementById("forgotPasswordDiv").style.display = "none";
    }, 500);

    document.getElementById("bg-forgot").classList.remove("show");
    setTimeout(() => {
        document.getElementById("bg-forgot").style.display = "none";
    }, 500);

    document.getElementById("loginDiv").style.display = "block";
    setTimeout(() => {
        document.getElementById("loginDiv").classList.add("show");
    }, 10); 

    document.getElementById("bg-login").style.display = "block";
    setTimeout(() => {
        document.getElementById("bg-login").classList.add("show");
    }, 10); 
}

function mostrarRegistro() //animacion
{
    document.getElementById("loginDiv").classList.remove("show");
    setTimeout(() => {
        document.getElementById("loginDiv").style.display = "none";
    }, 500);

    document.getElementById("bg-login").classList.remove("show");
    setTimeout(() => {
        document.getElementById("bg-login").style.display = "none";
    }, 500);

    document.getElementById("registroDiv").style.display = "block";
    setTimeout(() => {
        document.getElementById("registroDiv").classList.add("show");
    }, 10);

    document.getElementById("bg-registro").style.display = "block";
    setTimeout(() => {
        document.getElementById("bg-registro").classList.add("show");
    }, 10);
}

function mostrarForgotPassword() //animacion
{
    document.getElementById("loginDiv").classList.remove("show");
    setTimeout(() => {
        document.getElementById("loginDiv").style.display = "none";
    }, 500);

    document.getElementById("bg-login").classList.remove("show");
    setTimeout(() => {
        document.getElementById("bg-login").style.display = "none";
    }, 500);

    document.getElementById("forgotPasswordDiv").style.display = "block";
    setTimeout(() => {
        document.getElementById("forgotPasswordDiv").classList.add("show");
    }, 10);

    document.getElementById("bg-forgot").style.display = "block";
    setTimeout(() => {
        document.getElementById("bg-forgot").classList.add("show");
    }, 10);
}

async function registrarUsuario()
{
    const err = document.getElementById("error-message-registro");
    const bgRegistro  = document.getElementById('bg-registro');
    err.textContent = "";
    err.style.display = "none";
    err.classList.remove("success","error");

    try 
    {
        const data = await registrarUsuarioApi();

        if (data.status === "success") // si consigue registrarse vuelve al login
        {
            mostrarLogin(); 
        } 
        else // errores capturados en data.message
        {
            err.textContent = data.message;
            err.classList.add("error");
            err.style.color = "#f7767a";
            err.style.display = "block";
            bgRegistro.style.height = '720px';
        }
    } 
    catch (e) 
    {
        console.error("Error en registro:", e);
        err.textContent = "error de conexion vuelve a intentarlo.";
        err.classList.add("error");
        err.style.color = "#f7767a";
        err.style.display = "block";
        bgRegistro.style.height = '720px';
    }
}

async function login() 
{
    const user = document.getElementById('usuario-login').value.trim();
    const pass = document.getElementById('password-login').value.trim();
    const err  = document.getElementById('error-message');
    const bglogin = document.getElementById('bg-login');
    
    err.style.display = 'none';
    err.textContent = '';
    err.style.color = '';

    if (!user || !pass) // si no introduce ni usuario o contraseña
    {
        err.textContent = 'Introduce usuario y contraseña.';
        err.style.color = "#f7767a";
        err.style.display = 'block';
        bglogin.style.height = '425px';
        return;
    }

    try 
    {
        const data = await login_Api(user, pass);

        if (data.status === 'success')
        {
            window.location.href = '../php/chatterly.php';
        } 
        else // Mostrar mensaje de error
        {
            err.textContent = data.message;
            err.style.color = "#f7767a";
            err.style.display = 'block';
            bglogin.style.height = '425px';   
        }
    } 
    catch (e) 
    {
        console.error('Login error:', e);
        err.textContent = 'error de conexion.';
        err.style.color = "#f7767a";
        err.style.display = 'block';
    }
}

function forgotPassword() 
{
    const out = document.getElementById('mensaje');
    const bgForgot = document.getElementById('bg-forgot');
    out.textContent = '';
    out.style.color = '';
    out.classList.remove('success','error');

    forgotPassword_Api().then(data => {
        out.textContent = data.message;

        if (data.success) // se consigue cambiar la contraseña
        {
            out.style.color = '#7af776'; // verde claro
            bgForgot.style.height = '408px';
        }
        else // error al cambiarla
        {
            out.style.color = '#f7767a';
            bgForgot.style.height = '408px';
        }
    })
    .catch(err => {
        console.error('forgotPassword error:', err);
        out.textContent = 'Error de conexion. Intenta más tarde.';
        out.style.color = '#f7767a';
        bgForgot.style.height = '408px';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register') 
    {
        mostrarRegistro();
    }
});