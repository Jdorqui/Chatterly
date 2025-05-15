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

function initGifPicker()
{
    // Contenedor principal
    var container = document.getElementById('gifPickerContainer');

    // --- Cabecera ---
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

    // --- Categorías (solo botones, sin fetch aún) ---
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

    // --- Resultados ---
    var results = document.createElement('div');
    results.className = 'results';
    container.append(results);

    // --- Debounce en búsqueda ---
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

    // --- Cerrar al clicar fuera ---
    document.addEventListener('click', function(ev)
    {
        if (!container.contains(ev.target) && ev.target.id !== 'gifButton')
        {
            hideGif();
        }
    });
}

function loadCategoryBackgrounds()
{
    // Precarga un fondo por categoría (si no está en cache)
    for (var i = 0; i < CATEGORIES.length; i++)
    {
        (function(cat)
        {
            if (backgroundCache[cat.key])
            {
                applyBackground(cat.key, backgroundCache[cat.key]);
                return;
            }
            var url = PROXY_URL + '?action=search&q=' + encodeURIComponent(cat.key) + '&limit=1';
            fetch(url, { cache: 'no-store' })
                .then(function(response)
                {
                    return response.json();
                })
                .then(function(json)
                {
                    var imgUrl = json.results &&
                                 json.results[0] &&
                                 json.results[0].media_formats &&
                                 json.results[0].media_formats.tinygif &&
                                 json.results[0].media_formats.tinygif.url;
                    if (imgUrl)
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

function applyBackground(key, url)
{
    var btn = document.querySelector('.cats button[data-key="' + key + '"]');
    if (btn)
    {
        btn.style.backgroundImage = 'url(' + url + ')';
    }
}

function showGif()
{
    const p  = document.getElementById('gifPickerContainer'),
          st = getComputedStyle(p);
    if (st.display !== 'none')
    {
        p.style.display = 'none';
    }
    else
    {
        // Lazy-load de fondos solo la primera vez
        if (!backgroundsLoaded)
        {
            loadCategoryBackgrounds();
            backgroundsLoaded = true;
        }
        p.style.display = 'flex';
        p.classList.remove('show-gifs');
        clearResults();
        currentCategory = null;
        highlightActiveCategory();
    }
}

function hideGif()
{
    document.getElementById('gifPickerContainer').style.display = 'none';
}

function showCategories()
{
    document.getElementById('gifPickerContainer').classList.remove('show-gifs');
}

function selectCategory(key, q = '')
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

async function loadGifs(action, q)
{
    if (typeof q !== 'string')
    {
        q = '';
    }

    var url;
    if (action === 'search')
    {
        url = PROXY_URL + '?action=search';
    }
    else
    {
        url = PROXY_URL + '?action=trending';
    }

    if (action === 'search' && q.length > 0)
    {
        url = url + '&q=' + encodeURIComponent(q);
    }

    try
    {
        var response = await fetch(url, { cache: 'no-store' });
        if (!response.ok)
        {
            throw new Error('Respuesta no OK: ' + response.status);
        }
        var data = await response.json();
        renderGifs(data.results || []);
    }
    catch (error)
    {
        console.error('Error cargando GIFs:', error);
        clearResults();
    }
}

function renderFavorites()
{
    renderGifs(favorites);
}

function renderGifs(arr)
{
    var results = document.querySelector('#gifPickerContainer .results');
    results.innerHTML = '';

    arr.forEach(function(item)
    {
        var thumb = item.media_formats.tinygif.url;
        var full  = item.media_formats.gif.url;

        var wrap = document.createElement('div');
        wrap.className = 'gif-item';

        var img = document.createElement('img');
        img.src = thumb;
        wrap.appendChild(img);

        var star = document.createElement('div');
        star.className = 'star';

        var isFav = favorites.some(function(f) 
        {
            return f.media_formats.gif.url === full;
        });
        star.innerHTML = isFav ? SVG_FILLED : SVG_OUTLINE;

        star.onclick = function(ev)
        {
            ev.stopPropagation();
            var idx = favorites.findIndex(function(f) 
            {
                return f.media_formats.gif.url === full;
            });
            if (idx >= 0)
            {
                favorites.splice(idx, 1);
            }
            else
            {
                favorites.push(item);
            }
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            if (currentCategory === 'favorites')
            {
                renderFavorites();
            }
            var nowFav = favorites.some(function(f) 
            {
                return f.media_formats.gif.url === full;
            });
            star.innerHTML = nowFav ? SVG_FILLED : SVG_OUTLINE;
        };
        wrap.appendChild(star);

        wrap.onclick = function()
        {
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

        results.appendChild(wrap);
    });
}

function clearResults()
{
    document.querySelector('#gifPickerContainer .results').innerHTML = '';
}

function highlightActiveCategory()
{
    document.querySelectorAll('#gifPickerContainer .cats button')
    .forEach(function(b)
    {
        b.classList.toggle('active', b.dataset.key === currentCategory);
    });
}

async function urlToFile(url, name)
{
    const r    = await fetch(url, { cache:'no-store' });
    const blob = await r.blob();
    return new File([blob], name, { type: blob.type });
}

async function sendSelectedGif(url)
{
    try
    {
        const file = await urlToFile(url, `sticker_${Date.now()}.gif`);
        const me   = await numeroUsuario_Api(id_usuario_actual);
        await enviarArchivos_Api(me, destinatario, file);
    } 
    catch(e)
    {
        console.error(e);
    }
}

// Inicializamos al cargar la página
document.addEventListener('DOMContentLoaded', function()
{
    initGifPicker();
    document.getElementById('gifButton').addEventListener('click', function(ev)
    {
        ev.stopPropagation();
        showGif();
    });
});
