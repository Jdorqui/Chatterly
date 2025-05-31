document.getElementById("header").style.display = "none";
document.getElementById("section1").style.display = "none";
document.getElementById("section2").style.display = "none";
document.getElementById("section3").style.display = "none";
document.getElementById("footer-bg").style.display = "none";
document.getElementById("video").style.display = "none";
document.body.style.overflow = "hidden";

function playIntroVideo() 
{
  document.getElementById("start").style.display = "none";
  const videoDiv = document.getElementById("video");
  videoDiv.style.display = "";
  setTimeout(() => {
    videoDiv.classList.add("visible");
  }, 10);

  const vid = document.getElementById("introVideo");
  vid.currentTime = 0;
  vid.muted = false;
  vid.play().catch(() => {
    console.log("no se puede reproducir el video")
  });

 let fadeOutDone = false; //para que no se haga 2 veces
 function handleFadeOut() {
    if (!fadeOutDone) 
    {
      fadeOutDone = true;
      vid.pause();
      videoDiv.classList.remove("visible");
      setTimeout(() => {
        videoDiv.style.display = "none";
        closeStart();
      }, 200);
    }
  }

  setTimeout(handleFadeOut, 7000);//se llama al fade en 7 segundos
  vid.onended = handleFadeOut;//se llama al fade si el video acaba
}

function closeStart() //fade in de los elementos poco a poco 
{
  const sectionAnimationKickoffMs = 175
  const sectionStaggerStepMs = 200;

  const sectionIds = [
    "header",
    "section1",
    "section2",
    "section3",
    "footer-bg"
  ];

  setTimeout(() => {
    const sectionElements = sectionIds.map(id => {
      const el = document.getElementById(id);
      el.style.display = "";
      el.classList.add("fade-element");
      return el;
    });

    sectionElements[0].style.animationDelay = "0ms";
    sectionElements[0].classList.add("fade-in");

    for (let i = 1; i < sectionElements.length; i++) //recorre los sectionelements y los va haciendo visibles animando que aparezca cada seccion poco a poco
    {
      const delayMs = sectionStaggerStepMs * i;
      sectionElements[i].style.animationDelay = delayMs + "ms";
      sectionElements[i].classList.add("fade-in");
    }
    document.body.style.overflow = "";
  }, sectionAnimationKickoffMs);
}

function mostrarRegistroWeb() //muestra el registro
{
  window.location.href = 'login.html?mode=register';
}