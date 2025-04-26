const PROXY_URL = '../php/tenor_proxy.php';
const FAVORITES_KEY = 'gifFavorites';
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
  {label: 'locura', key: 'locura'},
];

let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); //array de favoritos
let currentCategory = null;

// svgs de la estrella (favoritos)
const SVG_OUTLINE = `<svg viewBox="0 0 24 24"> <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" fill="none" stroke="#fff" stroke-width="2"/> </svg>`;
const SVG_FILLED = `<svg viewBox="0 0 24 24"> <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" fill="#fff"/> </svg>`;

function initGifPicker() 
{
    // Contenedor principal del picker
    var container = document.getElementById('gifPickerContainer');
  
    // --- Cabecera ---
    var header = document.createElement('div');
    header.className = 'header';
  
    var back = document.createElement('button');
    back.className = 'back-btn';
    back.innerText = '←';
    back.onclick = showCategories; //al hacer clic en el boton atras (flecha), se muestran las categorias
  
    var input = document.createElement('input');
    input.placeholder = 'Buscar en Tenor…';
  
    // Montamos la cabecera
    header.append(back);
    header.append(input);
    container.append(header);
  
    // --- Categorías ---
    var cats = document.createElement('div');
    cats.className = 'cats';
  
    // Recorremos cada categoría definida en CATEGORIES
    for (var i = 0; i < CATEGORIES.length; i++) 
    {
        (function(cat) 
        {
            var btn = document.createElement('button');
            btn.innerHTML = '<span>' + cat.label + '</span>';
            btn.dataset.key = cat.key;
    
            // Al hacer clic en la categoría, cargamos sus GIFs
            btn.onclick = function() 
            {
                selectCategory(cat.key);
            };
    
            cats.append(btn);
    
            // Pre-cargamos un GIF para usarlo como fondo del botón
            var url = PROXY_URL + '?action=search&q=' + encodeURIComponent(cat.key) + '&limit=1';
            fetch(url, { cache: 'no-store' })
                .then(function(response) 
                {
                    return response.json();
                })
                .then(function(json) 
                {
                    // json.results puede no existir; usamos &&
                    if (json.results && json.results[0] && json.results[0].media_formats && json.results[0].media_formats.tinygif && json.results[0].media_formats.tinygif.url) 
                    {
                        // Asignamos la imagen de fondo
                        btn.style.backgroundImage = 'url(' + json.results[0].media_formats.tinygif.url + ')';
                    }
                })
                .catch(function() 
                {
                    // Ignoramos errores de carga de fondo
                });
        })(CATEGORIES[i]);
    }
  
    container.append(cats);
  
    // --- Contenedor de resultados ---
    var results = document.createElement('div');
    results.className = 'results';
    container.append(results);
  
    // --- Buscar con Enter ---
    input.addEventListener('keydown', function(ev) 
    {
        if (ev.key === 'Enter') 
        {
            var q = input.value.trim();
            if (q !== '') 
            {
                selectCategory('search', q);
            }
        }
    });
  
    // --- Cerrar al clicar fuera ---
    document.addEventListener('click', function(ev) 
    {
        // Si el clic no es dentro de nuestro picker ni en el botón de abrir
        if (!container.contains(ev.target) && ev.target.id !== 'gifButton') 
        {
            hideGif();
        }
    });
}  

function showGif() //toogle de gifpicker
{
    const p  = document.getElementById('gifPickerContainer'), st = getComputedStyle(p);
    if (st.display !== 'none') 
    {
        p.style.display = 'none';
    } 
    else 
    {
        p.style.display = 'flex';
        p.classList.remove('show-gifs');
        clearResults();
        currentCategory = null;
        highlightActiveCategory();
    }
}

function hideGif() //ocultar gifpicker
{
    document.getElementById('gifPickerContainer').style.display = 'none';
}

function showCategories() //muestra las categorias
{
    document.getElementById('gifPickerContainer').classList.remove('show-gifs');
}

function selectCategory(key, q='') //seleccion de categoria (busqueda o favoritos)
{
    currentCategory = key;
    highlightActiveCategory();
    const p = document.getElementById('gifPickerContainer');
    p.classList.add('show-gifs');

    if (key === 'favorites')
    {
        renderFavorites();
    } 
    else if (key === 'search')
    {
        loadGifs('search', q);
    } 
    else
    {
        loadGifs('search', key);
    } 
}

//action - 'search' para búsqueda o cualquier otro valor para trending.
//q - Texto de búsqueda (solo se usa cuando action === 'search').
 
async function loadGifs(action, q) //Carga los GIFs desde Tenor vía nuestro proxy.
{
    // Aseguramos que q tenga al menos una cadena (evita undefined)
    if (typeof q !== 'string') 
    {
        q = '';
    }
  
    // Construcción de la URL base según la acción
    var url;
    if (action === 'search') 
    {
        // Si queremos buscar, usamos 'search'
        url = PROXY_URL + '?action=search';
    } 
    else 
    {
        // Si no, traemos trending
        url = PROXY_URL + '?action=trending';
    }
  
    // Si es búsqueda y tenemos término, añadimos el parámetro q
    if (action === 'search' && q.length > 0) 
    {
        // encodeURIComponent escapa caracteres especiales en la consulta
        url = url + '&q=' + encodeURIComponent(q);
    }
  
    try 
    {
        // 'cache: no-store' fuerza siempre petición nueva, sin usar caché del navegador
        var response = await fetch(url, { cache: 'no-store' });
  
        // Si la respuesta no es 2xx, lanzamos un error para ir al catch
        if (!response.ok)
        {
            throw new Error('Respuesta no OK: ' + response.status);
        }
  
        // Parseamos la respuesta JSON
        var data = await response.json();
  
        // data.results puede ser undefined, así que usamos [] como fallback
        renderGifs(data.results || []);
    } 
    catch (error) // En caso de fallo de red o parseo, limpiamos la lista para no mostrar nada roto
    {
        console.error('Error cargando GIFs:', error);
        clearResults();
    }
}

function renderFavorites() //renderiza los favoritos
{
    renderGifs(favorites);
}

function renderGifs(arr) // 8) Render lista de GIFs
{
    // Seleccionamos el contenedor donde pintaremos los GIFs y lo limpiamos
    var results = document.querySelector('#gifPickerContainer .results');
    results.innerHTML = '';
  
    // Recorremos cada elemento del arreglo de GIFs
    arr.forEach(function(item) 
    {
        var thumb = item.media_formats.tinygif.url;
        var full  = item.media_formats.gif.url;
        
        // Creamos el wrapper del GIF
        var wrap = document.createElement('div');
        wrap.className = 'gif-item';
        
        // — Imagen —
        var img = document.createElement('img');
        img.src = thumb;
        wrap.appendChild(img);
        
        // — Estrella de favorito —
        var star = document.createElement('div');
        star.className = 'star';
        
        // Comprobamos si el GIF ya está en favoritos
        var isFav = false;
        for (var i = 0; i < favorites.length; i++) 
        {
            if (favorites[i].media_formats.gif.url === full) 
            {
                isFav = true;
                break;
            }
        }
        // Asignamos el SVG correspondiente
        if (isFav) 
        {
            star.innerHTML = SVG_FILLED;
        } 
        else 
        {
            star.innerHTML = SVG_OUTLINE;
        }
      
        // Manejo del clic en la estrella
        star.onclick = function(ev) 
        {
            ev.stopPropagation(); // Evita que el clic en la estrella dispare el handler de wrap.onclick
            
            // Buscamos el índice en el array de favoritos
            var idx = -1;
            for (var j = 0; j < favorites.length; j++) 
            {
                if (favorites[j].media_formats.gif.url === full) 
                {
                    idx = j;
                    break;
                }
            }
          
            // Si ya estaba, lo quitamos; si no, lo añadimos
            if (idx >= 0) 
            {
                favorites.splice(idx, 1);
            } 
            else 
            {
                favorites.push(item);
            }
            // Actualizamos el almacenamiento local
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
          
            // Si estamos viendo la categoría “Favoritos”, re-renderizamos la lista
            if (currentCategory === 'favorites') 
            {
                renderFavorites();
            }
          
            // Volvemos a comprobar y actualizar el SVG para reflejar el nuevo estado
            var nowFav = false;
            for (var k = 0; k < favorites.length; k++)
            {
                if (favorites[k].media_formats.gif.url === full) 
                {
                    nowFav = true;
                    break;
                }
            }
            if (nowFav) 
            {
                star.innerHTML = SVG_FILLED;
            } 
            else 
            {
                star.innerHTML = SVG_OUTLINE;
            }
        };
        wrap.appendChild(star);
      
        // — Clic en el GIF: lo enviamos y ocultamos el picker —
        wrap.onclick = function() 
        {
            // 'full' queda guardado en este closure
            sendSelectedGif(full)
            .then(function() 
            {
                hideGif();
            })
            .catch(function(err) 
            {
                console.error('Error enviando GIF:', err);
            });
        };
      
        // Finalmente añadimos el wrapper al contenedor
        results.appendChild(wrap);
    });
}

function clearResults() //limpia los resultados
{
    document.querySelector('#gifPickerContainer .results').innerHTML = '';
}

function highlightActiveCategory() //resalta la categoria activa
{
    document.querySelectorAll('#gifPickerContainer .cats button').forEach(b => b.classList.toggle('active', b.dataset.key === currentCategory));
}

async function urlToFile(url, name) //convierte url a file
{
    const r = await fetch(url, { cache:'no-store' });
    const blob = await r.blob();
    return new File([blob], name, { type: blob.type });
}

async function sendSelectedGif(url) //enviar gif seleccionado
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

//inicializar gifpicker en el DOM y se añade el evento al hacer click en el boton de gif 
document.addEventListener('DOMContentLoaded', () => {
    initGifPicker();
    document.getElementById('gifButton').addEventListener('click', ev => {
          ev.stopPropagation();
          showGif();
    });
});