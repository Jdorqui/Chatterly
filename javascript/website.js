document.getElementById("header").style.display = "none";
document.getElementById("section1").style.display = "none";
document.getElementById("section2").style.display = "none";
document.getElementById("section3").style.display = "none";
document.getElementById("footer-bg").style.display = "none";

document.body.style.overflow = "hidden";

function closeStart() 
{
  // 1) Elemento del overlay inicial
  const startOverlayElement = document.getElementById("start");

  // 2) Duración del fade-out en ms (debes tener el mismo valor en tu CSS)
  const overlayFadeOutDurationMs = 350;

  // 3) Retardo antes de empezar a animar las secciones
  //    Lo solapamos con el fade-out (por ejemplo a la mitad)
  const sectionAnimationKickoffMs = Math.floor(overlayFadeOutDurationMs / 2);

  // 4) Paso entre cada sección para el efecto “stagger”
  const sectionStaggerStepMs = 200;

  // 5) Listado de IDs de las secciones a animar
  const sectionIds = [
    "header",
    "section1",
    "section2",
    "section3",
    "footer-bg"
  ];

  // 6) Arrancamos el fade-out del overlay (CSS .hidden con transition: opacity)
  startOverlayElement.classList.add("hidden");

  // 7) Un timeout parcial para preparar y arrancar las animaciones de sección
  setTimeout(() => {
    // 7.1) Recojo los elementos y los dejo visibles en estado “inicial” (invisibles)
    const sectionElements = sectionIds.map(id => {
      const el = document.getElementById(id);
      el.style.display = "";           // hacemos display:block (o el predeterminado)
      el.classList.add("fade-element"); // state: opacity:0 + translateY(20px)
      return el;
    });

    // 7.2) Forzamos reflow para que reconozca el estado inicial
    void document.body.offsetWidth;

    // 7.3) Arrancamos el header inmediatamente
    sectionElements[0].style.animationDelay = "0ms";
    sectionElements[0].classList.add("fade-in");

    // 7.4) Y escalonamos el resto de secciones
    for (let i = 1; i < sectionElements.length; i++) {
      const delayMs = sectionStaggerStepMs * i;
      sectionElements[i].style.animationDelay = delayMs + "ms";
      sectionElements[i].classList.add("fade-in");
    }

    // 7.5) Rehabilitamos el scroll en cuanto arranquen las secciones
    document.body.style.overflow = "";
  }, sectionAnimationKickoffMs);

  // 8) Un segundo timeout para ocultar el overlay al completo
  setTimeout(() => {
    startOverlayElement.style.display = "none";
  }, overlayFadeOutDurationMs);
}