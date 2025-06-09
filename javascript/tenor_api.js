const PROXY_URL = '../php/tenor_proxy.php'; // URL del proxy para evitar CORS al hacer peticiones a la API de Tenor
const FAVORITES_KEY = 'gifFavorites'; // Clave para almacenar los favoritos en localStorage
const CATEGORIES = [
  {label: 'Favoritos', key: 'favorites'},
  {label: 'incómodo', key: 'incómodo'},
  {label: 'asco', key: 'asco'},
  {label: 'enfadado', key: 'enfadado'},
  {label: 'atónito', key: 'atónito'},
  {label: 'por que', key: 'por que'},
  {label: 'me gusta', key: 'me gusta'},
  {label: 'wow', key: 'wow'},
  {label: 'ayayai', key: 'ayayai'},
  {label: 'ups', key: 'ups'},
  {label: 'denada', key: 'denada'},
  {label: 'flojera', key: 'flojera'},
  {label: 'estresado', key: 'estresado'},
  {label: 'increíble', key: 'increíble'},
  {label: 'te la creiste', key: 'te la creiste'},
  {label: 'buena suerte', key: 'buena suerte'},
  {label: 'chócala', key: 'chócala'},
  {label: 'nervios', key: 'nervios'},
  {label: 'obvio', key: 'obvio'},
  {label: 'aww', key: 'aww'},
  {label: 'asustado', key: 'asustado'},
  {label: 'aburrido', key: 'aburrido'},
  {label: 'suspiro', key: 'suspiro'},
  {label: 'besos', key: 'besos'},
  {label: 'triste', key: 'triste'},
  {label: 'buenas noches', key: 'buenas noches'},
  {label: 'buenos dias', key: 'buenos dias'},
  {label: 'confundido', key: 'confundido'},
  {label: 'calma', key: 'calma'},
  {label: 'amor', key: 'amor'},
  {label: 'feliz', key: 'feliz'},
  {label: 'llorar', key: 'llorar'},
  {label: 'si', key: 'si'},
  {label: 'no', key: 'no'},
  {label: 'risa', key: 'risa'},
  {label: 'emocionado', key: 'emocionado'},
  {label: 'chao', key: 'chao'},
  {label: 'lo siento', key: 'lo siento'},
  {label: 'enhorabuena', key: 'enhorabuena'},
  {label: 'con sueño', key: 'con sueño'},
  {label: 'hola', key: 'hola'},
  {label: 'abrazos', key: 'abrazos'},
  {label: 'vale', key: 'vale'},
  {label: 'porfavor', key: 'porfavor'},
  {label: 'gracias', key: 'gracias'},
  {label: 'te extraño', key: 'te extraño'},
  {label: 'guiño', key: 'guiño'},
  {label: 'me vale', key: 'me vale'},
  {label: 'hambre', key: 'hambre'},
  {label: 'bailar', key: 'bailar'},
  {label: 'molesto', key: 'molesto'},
  {label: 'dios mio', key: 'dios mio'},
  {label: 'loco', key: 'loco'},
  {label: 'loquesea', key: 'loquesea'},
  {label: 'sonrisa', key: 'sonrisa'},
];

let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); // array de favoritos
let currentCategory = null;

// svgs de la estrella (favoritos)
const SVG_OUTLINE =`<svg viewBox="0 0 24 24"> <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" fill="none" stroke="#fff" stroke-width="2"/></svg>`;
const SVG_FILLED =`<svg viewBox="0 0 24 24"> <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" fill="#fff"/></svg>`;

// Para lazy-load de fondos
const backgroundCache = {};     // { key: url }
let backgroundsLoaded = false;

// Para debounce en búsqueda
let searchDebounce;

function initGifPicker() //inicializa el gif picker
{
    //construccion del contenido de gifPickerContainer
    var container = document.getElementById('gifPickerContainer');

    //cabecera del gif picker
    var header = document.createElement('div');
    header.className = 'header';

    var back = document.createElement('button');
    back.className = 'back-btn';
    back.innerText = '←';
    back.onclick = showCategories;

    var input = document.createElement('input');
    input.placeholder = 'Buscar en Tenor…';

    header.append(back);
    header.append(input);
    container.append(header);

    //categorias (solo botones, sin fetch)
    var cats = document.createElement('div');
    cats.className = 'cats';

    for (var i = 0; i < CATEGORIES.length; i++)
    {
        (function(cat)
        {
            var btn = document.createElement('button');
            btn.innerHTML = '<span>' + cat.label + '</span>';
            btn.dataset.key = cat.key;
            btn.onclick = function()
            {
                selectCategory(cat.key);
            };
            cats.append(btn);
        })(CATEGORIES[i]);
    }

    container.append(cats);

    //resultados
    var results = document.createElement('div');
    results.className = 'results';
    container.append(results);

    //listeners:

    //debounce es una tecnica para evitar que se llame a una funcion demasiadas veces en un corto periodo de tiempo
    //esta permite que la busqueda no se haga hasta que el usuario deje de escribir por un tiempo
    //permitiendo que no se hagan demasiadas peticiones a la api de tenor
    //consiguiendo que la busqueda sea mas rapida y eficiente
    input.addEventListener('input', function(ev)
    {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(function()
        {
            var q = ev.target.value.trim();
            if (q !== '')
            {
                selectCategory('search', q);
            }
        }, 300);
    });

    // permite buscar gifs al presionar enter
    input.addEventListener('keydown', function(ev) 
    {
        if (ev.key === 'Enter')
        {
            clearTimeout(searchDebounce);
            var q = input.value.trim();
            if (q !== '')
            {
                selectCategory('search', q);
            }
        }
    });

    //al hacer click fuera se cierra el gif picker
    document.addEventListener('click', function(ev) 
    {
        if (!container.contains(ev.target) && ev.target.id !== 'gifButton')
        {
            hideGif();
        }
    });
}

function loadCategoryBackgrounds() //precarga un fondo por categoria
{
    for (var i = 0; i < CATEGORIES.length; i++) //recorremos las categorias
    {
        (function(cat) //funcion para cada categoria
        {
            if (backgroundCache[cat.key]) //si ya hay un fondo en el cache, lo aplicamos directamente
            {
                applyBackground(cat.key, backgroundCache[cat.key]);
                return;
            }
            var url = PROXY_URL + '?action=search&q=' + encodeURIComponent(cat.key) + '&limit=1'; //se busca un gif por categoria mediante la api de tenor
            fetch(url, { cache: 'no-store' }) //se hace la peticion a la api
                .then(function(response) //verificamos que la respuesta sea correcta
                {
                    return response.json();
                })
                .then(function(json) //procesamos la respuesta
                {
                    //obtenemos la url del gif mediante el formato tinygif con el que se va a mostrar en el fondo
                    var imgUrl = json.results && json.results[0] && json.results[0].media_formats && json.results[0].media_formats.tinygif && json.results[0].media_formats.tinygif.url; 
                                
                    if (imgUrl) //si hay un gif, lo guardamos en el cache y lo aplicamos
                    {
                        backgroundCache[cat.key] = imgUrl;
                        applyBackground(cat.key, imgUrl);
                    }
                })
                .catch(function()
                {
                    // ignoramos fallos puntuales
                });
        })(CATEGORIES[i]);
    }
}

function applyBackground(key, url) //aplica el fondo a la categoria
{
    var btn = document.querySelector('.cats button[data-key="' + key + '"]'); // buscamos el boton de la categoria 
    if (btn) //si existe el boton
    {
        btn.style.backgroundImage = 'url(' + url + ')'; //aplicamos el fondo al boton
    }
}

function showGif() //muestra el gif picker
{
    document.getElementById("emojisDiv").style.display = 'none'; //oculta el div de emojis

    const p  = document.getElementById('gifPickerContainer');
    const st = getComputedStyle(p);
    
    if (st.display !== 'none') //si el gif picker ya esta visible
    {
        p.style.display = 'none'; //lo ocultamos
    }
    else // si no esta visible
    {
        if (!backgroundsLoaded) //si los fondos no han sido cargados
        {
            loadCategoryBackgrounds(); // cargamos los fondos de las categorias
            backgroundsLoaded = true;
        }
        p.style.display = 'flex';
        p.classList.remove('show-gifs');
        clearResults(); //limpiamos los resultados
        currentCategory = null; //reiniciamos la categoria actual
        highlightActiveCategory(); // resalta la categoria activa
    }
}

function hideGif() //oculta el gif picker
{
    document.getElementById('gifPickerContainer').style.display = 'none';
}

function showCategories() //muestra las categorias de gifs
{
    document.getElementById('gifPickerContainer').classList.remove('show-gifs');
}

function selectCategory(key, q = '') //selecciona una categoria de gifs
{
    currentCategory = key; //establece la categoria actual
    highlightActiveCategory(); //resalta la categoria activa
    const p = document.getElementById('gifPickerContainer');
    p.classList.add('show-gifs');

    if (key === 'favorites') //si la categoria es favoritos
    {
        renderFavorites(); //renderiza los favoritos
    }
    else if (key === 'search') //si la categoria es busqueda
    {
        loadGifs('search', q); //carga los gifs de la busqueda
    }
    else //si la categoria es otra
    {
        loadGifs('search', key); //carga los gifs de la categoria
    }
}

async function loadGifs(action, q) //carga los gifs de la api de tenor
{
    if (typeof q !== 'string') //verifica que q sea un string
    {
        q = ''; //si no lo es, lo convierte a string vacio
    }

    var url;
    if (action === 'search') //si la accion es busqueda
    {
        url = PROXY_URL + '?action=search'; //establece la url de busqueda
    }
    else if (action === 'trending') //si la accion es tendencia
    {
        url = PROXY_URL + '?action=trending'; //establece la url de tendencias
    }

    if (action === 'search' && q.length > 0) //si la accion es busqueda y q tiene contenido
    {
        url = url + '&q=' + encodeURIComponent(q); //agrega el parametro de busqueda a la url
    }

    try //intenta hacer la peticion a la api de tenor
    {
        var response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) //verifica que la respuesta sea correcta
        {
            throw new Error('Respuesta no OK: ' + response.status); //lanza un error si la respuesta no es correcta
        }
        var data = await response.json();
        renderGifs(data.results || []); //renderiza los gifs obtenidos de la respuesta, si no hay resultados, renderiza un array vacio
    }
    catch (error) //maneja el error al hacer la peticion
    {
        console.error('Error cargando GIFs:', error);
        clearResults();
    }
}

function renderFavorites() //renderiza los gifs favoritos
{
    renderGifs(favorites);
}

function renderGifs(arr) //renderiza los gifs en el contenedor de resultados arr es un array de objetos que contienen los gifs
{
    var results = document.querySelector('#gifPickerContainer .results');
    results.innerHTML = '';

    arr.forEach(function(item) //recorre cada item del array y crea un elemento div con la clase gif-item
    {
        var thumb = item.media_formats.tinygif.url; // obtiene la url del gif en miniatura
        var full  = item.media_formats.gif.url; // obtiene la url del gif completo

        var wrap = document.createElement('div'); //crea un div para envolver el gif
        wrap.className = 'gif-item'; // establece la clase del div envolvente

        var img = document.createElement('img'); //crea un elemento img para mostrar el gif
        img.src = thumb; // establece la url del gif en miniatura
        wrap.appendChild(img); // agrega el gif al div envolvente

        var star = document.createElement('div'); //crea un div para la estrella de favoritos
        star.className = 'star';

        //gestion de favoritos
        var isFav = favorites.some(function(f) // verifica si el gif ya esta en favoritos
        {
            return f.media_formats.gif.url === full; // compara la url del gif completo con los favoritos
        });
        star.innerHTML = isFav ? SVG_FILLED : SVG_OUTLINE; // establece el svg de la estrella dependiendo si es favorito o no

        star.onclick = function(ev) //maneja el evento de click en la estrella
        {
            ev.stopPropagation(); // evita que el click se propague al div envolvente es decir que no se envíe el gif al destinatario debido a que se hizo click en la estrella

            var idx = favorites.findIndex(function(f) // verifica si el gif ya esta en favoritos
            {
                return f.media_formats.gif.url === full; // compara la url del gif completo con los favoritos 
            });
            if (idx >= 0) // si el gif ya esta en favoritos
            {
                favorites.splice(idx, 1); // lo elimina del array de favoritos
            }

            else // si el gif no esta en favoritos
            {
                favorites.push(item); // lo agrega al array de favoritos
            }

            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); // guarda el array de favoritos en el localStorage
            if (currentCategory === 'favorites') // si la categoria actual es favoritos
            {
                renderFavorites(); // vuelve a renderizar los favoritos para actualizar la lista
            }

            var nowFav = favorites.some(function(f) // verifica si el gif ahora es favorito
            {
                return f.media_formats.gif.url === full;
            });
            star.innerHTML = nowFav ? SVG_FILLED : SVG_OUTLINE; // actualiza el svg de la estrella
        };
        wrap.appendChild(star);

        //llama a enviar gif seleccionado
        wrap.onclick = function() //maneja el evento de click en el div envolvente
        {
            sendSelectedGif(full) //envia el gif seleccionado al destinatario
            .then(function() //cuando se envia el gif
            {
                hideGif(); //oculta el gif picker
            })
            .catch(function(err) //maneja el error al enviar el gif
            {
                console.error('Error enviando GIF:', err);
            });
        };

        results.appendChild(wrap); // agrega el div envolvente al contenedor de resultados
    });
}

function clearResults() //limpia los resultados del gif picker
{
    document.querySelector('#gifPickerContainer .results').innerHTML = ''; // limpia el contenedor de resultados
}

function highlightActiveCategory() //resalta la categoria activa
{
    document.querySelectorAll('#gifPickerContainer .cats button') // selecciona todos los botones de las categorias
    .forEach(function(b) // recorre cada boton
    {
        b.classList.toggle('active', b.dataset.key === currentCategory); // si el dataset key del boton es igual a la categoria actual, le agrega la clase active
    });
}

async function urlToFile(url, name) //convierte una url a un archivo para poder enviarlo
{
    const r = await fetch(url, { cache:'no-store' }); // hacemos la peticion a la url
    const blob = await r.blob();  // obtenemos el blob de la respuesta
    return new File([blob], name, { type: blob.type }); // creamos un archivo a partir del blob
}

async function sendSelectedGif(url) //envia el gif seleccionado al destinatario
{
    try
    {
        const file = await urlToFile(url, `sticker_${Date.now()}.gif`);
        const me = await numeroUsuario_Api(id_usuario_actual);
        await enviarArchivos_Api(me, destinatario, file);
    } 
    catch(e)
    {
        console.error(e);
    }
}

//inicializamos el menu de los gif al cargar la pagina
document.addEventListener('DOMContentLoaded', function()
{
    initGifPicker();
});