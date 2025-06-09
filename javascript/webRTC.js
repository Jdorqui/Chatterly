//variables globales
let callerId = null;
let calleeId = null;
let pc;
let localStream;
let remoteStream = new MediaStream();
let videoTransceiver;
const notification_audio = new Audio('../assets/audio/call.wav');
notification_audio.volume = 0.3;

async function initDeviceSelection() //inicializa los dispositvos 
{
  try //intenta acceder a dispositivos multimedia
  { 
    await navigator.mediaDevices.getUserMedia({ audio: true }); //pide permiso para acceder al microfono
  }

  catch(e) //si audio no es true
  {
    /* permiso audio denegado */
  }

  const devices = await navigator.mediaDevices.enumerateDevices(); //enumera los dispositivos conectados
  const as = document.getElementById('audioSelect');
  const vs = document.getElementById('videoSelect');

  //se recorren los dispositivos
  devices.forEach(d => {
    if (d.kind === 'audioinput') //si es un dispositivo de audio
    {
      as.add(new Option(d.label || 'Micrófono', d.deviceId)); //lo añade una nueva opcion de audio
    }
      
    if (d.kind === 'videoinput') //si es un dispositivo de video
    {
      vs.add(new Option(d.label || 'Cámara', d.deviceId)); //lo añade como opcion de video
    }
  });

  setInterval(checkIncoming, 2000); //cada 2s revisa llamadas
}
window.addEventListener('load', initDeviceSelection); //al cargar la pagina te pide permisos ejecutando la funcion initDeviceSelection()

async function checkIncoming() //realiza un fetch a check_llamadas.php y comprueba que llega 
{
  try 
  {
    const res = await fetch(`../php/check_llamadas.php?id=${id_usuario_actual}`);
    const j = await res.json();
    if (j.status === 'llamada') 
    {
      notification_audio.play(); //hace que suene el audio de notificacion para las llamadas
      mostrarPopupLlamada(j.username, j.id_emisor); //muestra el popup con el nombre y emisor del php
    }
  } 
  catch(e)
  {
    console.warn('checkIncoming fallo:', e); //warning por si falla
  }
}

async function llamarAmigo(idReceptor) // funcion para llamar
{
  //se asignan los ids pertinentes dependiendo si es el emisor o receptor
  callerId = id_usuario_actual; 
  calleeId = idReceptor;

  //fetch a iniciar_llamada.php
  const resp = await fetch('../php/iniciar_llamada.php',{
    method:'POST', headers:{'Content-Type' : 'application/json'},
    body:JSON.stringify({id_emisor:callerId, id_receptor:calleeId})
  });

  //se recibe el json del php y si el estado es ok se inicia la llamada si no error.
  const j = await resp.json();
  if(j.status !== 'ok')
  {
    return alert('Error: ' + j.msg);
  } 
  await iniciarLlamada(true);
}

async function aceptarLlamada(idEmisor) //esta funcion acepta la llamada 
{
  callerId = idEmisor;
  calleeId = id_usuario_actual;

  //se reinicia la musica
  notification_audio.pause();
  notification_audio.currentTime = 0;

  //se oculta el popup de las llamadas
  document.getElementById('popup-llamada').style.display='none';

  //se hace el fetch a el php responder llamadas
  await fetch('../php/responder_llamada.php',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      id_emisor:callerId,
      id_receptor:calleeId,
      respuesta:'aceptada'
    })
  });

  //cambia el estado de iniciar llamada a false
  await iniciarLlamada(false);
}

function rechazarLlamada(idEmisor) //rechaza la llamada
{
  //fetch al php responder llamada con la respuesta rechazada
  fetch('../php/responder_llamada.php',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      id_emisor:idEmisor,
      id_receptor:id_usuario_actual,
      respuesta:'rechazada'
    })
  });

  //se resetea el audio de la notificacion de la llamada y se oculta el popup
  notification_audio.pause();
  notification_audio.currentTime = 0;
  document.getElementById('popup-llamada').style.display='none';
}

function mostrarPopupLlamada(username, idEmisor) //construccion del div popup + mostrarlo
{
  const pop = document.getElementById('popup-llamada');

  //se construye el div popup
  pop.innerHTML = `
    <div class="popup">
      📞 Llamada entrante de <strong>${username}</strong><br>
      <button class="accept-button" onclick="aceptarLlamada(${idEmisor})">Aceptar</button>
      <button class="reject-button" onclick="rechazarLlamada(${idEmisor})">Rechazar</button>
    </div>`;
  pop.style.display='block'; //se muestra el div popup
}

function colgar() //cuelga la llamada
{
  if(pc) //si hay una conexion activa
  {
    pc.close();
  }

  //oculta la ui y hace el fetch a responder_llamada para cambiar el estado a finalizada
  document.getElementById('call-ui').style.display = 'none';
  fetch('../php/responder_llamada.php',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      id_emisor:callerId,
      id_receptor:calleeId,
      respuesta:'finalizada'
    })
  });
}

function toggleMute() //alterna entre mutearse y desmutearse
{ 
  const img = document.getElementById('mute-img-button');
  if (img.src.includes('desmuteado.png')) 
  {
    img.src = '../assets/imgs/muteado.png';
  }
  else 
  {
    img.src = '../assets/imgs/desmuteado.png';
  }

  //hace un for en las pistas de audio y lo activa o desactiva
  localStream.getAudioTracks().forEach(t => t.enabled =! t.enabled)
}

function toggleDeafen() //alterna el ensordecimiento.
{
  const img = document.getElementById('ensordecer-img-button');
  if (img.src.includes('desensordecido.png')) 
  {
    img.src = '../assets/imgs/ensordecido.png';
  } 
  else 
  {
    img.src = '../assets/imgs/desensordecido.png';
  }

  //se recorre  
  remoteStream.getAudioTracks().forEach(t => t.enabled =! t.enabled)
}

function toggleCamera() //alterna activar o desactivar la camara.
{
  const img = document.getElementById('camara-img-button');
  if (img.src.includes('camaraoff.png')) 
  {
    img.src = '../assets/imgs/camaraon.png';
  } 
  else 
  {
    img.src = '../assets/imgs/camaraoff.png';
  }

  const t = localStream.getVideoTracks()[0]; //recupera la pista de video de la camara

  if(t) //se activa o desactiva
  { 
    t.enabled = !t.enabled;
  }
}

async function changeAudioDevice() //cambia el dispositivo de audio
{
  const deviceId = document.getElementById('audioSelect').value; // obtiene el id del dispositivo de audio seleccionado
  const s = await navigator.mediaDevices.getUserMedia({ audio:{deviceId} }); // solicita el nuevo dispositivo de audio
  const nt = s.getAudioTracks()[0]; // obtiene la nueva pista de audio
  const sender = pc.getSenders().find(s => s.track.kind === 'audio'); // busca el sender de audio en la conexion RTC
  await sender.replaceTrack(nt); // reemplaza la pista de audio actual con la nueva pista

  localStream.removeTrack(localStream.getAudioTracks()[0]); // elimina la pista de audio actual del stream local
  localStream.addTrack(nt); // añade la nueva pista de audio al stream local
}

async function changeVideoDevice() //cambia el dispositivo de video
{
  const deviceId = document.getElementById('videoSelect').value;
  const s = await navigator.mediaDevices.getUserMedia({ video:{deviceId} });
  const nt = s.getVideoTracks()[0];
  const sender = pc.getSenders().find(s => s.track.kind === 'video');
  await sender.replaceTrack(nt);

  localStream.removeTrack(localStream.getVideoTracks()[0]);
  localStream.addTrack(nt);
  document.getElementById('localVideo').srcObject = localStream; //actualiza el video local con la nueva pista de video
}

async function compartirPantalla() //funcion asincrona para compartir pantalla
{
  try 
  {
    //comprueba si el navegador soporta getDisplayMedia
    if (!navigator.mediaDevices.getDisplayMedia) 
    {
      alert('Compartir pantalla no soportado en este navegador.');
      return;
    }

    //solicita permiso al usuario para capturar la pantalla
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });

    //obtiene la pista de video de la pantalla capturada
    const screenTrack = screenStream.getVideoTracks()[0];

    //encuentra el sender(emisor) en la conexion RTC (pc) 
    const sender = pc.getSenders().find(s => s.track && s.track.kind === "video");

    if (sender && screenTrack) //si hay sender y screenTrack se reemplaza la camara por la pantalla compartida
    {
      await sender.replaceTrack(screenTrack); //remplaza la pista de video actual(camara) por la de la pantalla

      document.getElementById('localVideo').srcObject = screenStream; //muestra la pantalla compartida
      
      screenTrack.onended = async () => { // cuando termina de compartir, vuelve a la camara
        const cam = localStream.getVideoTracks()[0] || null; //recupera la pista de video de la camara
        if (cam)
        {
          await sender.replaceTrack(cam);
        } 
        document.getElementById('localVideo').srcObject = localStream;
      };
    } 
    else 
    {
      alert('No hay canal de vídeo para compartir pantalla.');
    }
  } 
  catch (e) 
  {
    alert('No se pudo compartir pantalla: ' + e.message);
  }
}

//nucleo WebRTC + signaling.
//esta funcion controla todo el flujo de webrtc añadiendo como parametro true o false si se acepta o rechaza la llamada
async function iniciarLlamada(isCaller) 
{
  document.getElementById('call-ui').style.display = 'flex';

  pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }); //crea una nueva conexion RTC con un servidor STUN de Google
  remoteStream = new MediaStream(); // crea un nuevo MediaStream para el video remoto

  pc.onicecandidate = ev => { //maneja los candidatos ICE
    if (ev.candidate) {
      fetch('../php/signaling.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_emisor: callerId,
          id_receptor: calleeId,
          type: 'ice',
          data: ev.candidate
        })
      });
    }
  };

  pc.ontrack = ev => { //maneja los tracks entrantes (video y audio)
    if (ev.track.kind === 'video') {
      remoteStream.getVideoTracks().forEach(track => remoteStream.removeTrack(track));
      remoteStream.addTrack(ev.track);
      const rv = document.getElementById('remoteVideo');
      rv.srcObject = remoteStream;
      rv.autoplay = true;
      rv.playsInline = true;
      rv.muted = false;
    }
    
    if (ev.track.kind === 'audio') {
      remoteStream.getAudioTracks().forEach(track => remoteStream.removeTrack(track));
      remoteStream.addTrack(ev.track);
      const ra = document.getElementById('remoteAudio');
      ra.style.display = 'block';
      ra.srcObject = remoteStream;
      ra.play().catch(() => {});
    }
  };

  // Intentar obtener cámara y micro
  let audio = true; 
  let video = true;
  try 
  {
    localStream = await navigator.mediaDevices.getUserMedia({ audio, video });
  } 
  catch (e) 
  {
    console.warn("Sin cámara, usando solo micro:", e);
    // Si falla la cámara, usamos solo micro y pista de vídeo vacía
    try 
    {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Añadir pista de vídeo fake (negra)
      const fakeStream = crearPistaVideoNegra();
      localStream.addTrack(fakeStream.getVideoTracks()[0]);
    }
    catch (ee) 
    {
      alert("No se pudo obtener ni cámara ni micro.");
      throw ee;
    }
  }

  // Mostrar tu propio vídeo siempre (aunque sea negro)
  const lv = document.getElementById('localVideo');
  lv.srcObject = localStream;
  lv.autoplay = true;
  lv.playsInline = true;
  lv.muted = true;
  lv.style.display = ''; // nunca ocultar

  // Añadir todas las pistas (audio y vídeo, real o fake)
  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

  // ---- Signalización estándar ----
  if (isCaller) 
  {
    const off = await pc.createOffer();
    await pc.setLocalDescription(off);
    await fetch('../php/signaling.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_emisor: callerId,
        id_receptor: calleeId,
        type: 'offer',
        data: off
      })
    });

    // Espera respuesta
    let ans = null;
    while (!ans) 
    {
      const res = await fetch(
        `../php/signaling.php?modo=obtener&type=answer` +
        `&id_emisor=${callerId}` +
        `&id_receptor=${calleeId}`
      );
      ans = (await res.json()).data;
      if (!ans) 
      {
        await new Promise(r => setTimeout(r, 300)); 
      }
    }
    await pc.setRemoteDescription(new RTCSessionDescription(ans));
  }
  else 
  {
    // receptor espera offer
    let of = null;
    while (!of) 
    {
      const res = await fetch(
        `../php/signaling.php?modo=obtener&type=offer` +
        `&id_emisor=${callerId}` +
        `&id_receptor=${calleeId}`
      );
      of = (await res.json()).data;

      if (!of)
      {
        await new Promise(r => setTimeout(r, 300));
      }
    }
    await pc.setRemoteDescription(new RTCSessionDescription(of));

    // crear + enviar answer
    const ans = await pc.createAnswer();
    await pc.setLocalDescription(ans);
    await fetch('../php/signaling.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_emisor: callerId,
        id_receptor: calleeId,
        type: 'answer',
        data: ans
      })
    });
  }

  // Polling ICE remoto significa que se añaden candidatos ICE remotos cada segundo hasta que se complete la conexión.
  // Esto es necesario porque los candidatos ICE pueden llegar en cualquier momento.
  setInterval(async () => {
    //se hace un fetch a signaling.php para obtener los candidatos ICE
    const res = await fetch( 
      `../php/signaling.php?modo=obtener&type=ice` + `&id_emisor=${callerId}` + `&id_receptor=${calleeId}`
    );
    const arr = (await res.json()).data || []; // obtiene los candidatos ICE del servidor
    const list = Array.isArray(arr) ? arr : [arr]; // asegura que sea un array
    for (const c of list)  // recorre los candidatos ICE
    {
      try 
      { 
        await pc.addIceCandidate(new RTCIceCandidate(c)); // añade el candidato ICE a la conexión
      }
      catch (e) { }
    }
  }, 1000);
}

//crea un canvas en negro y lo convierte en stream
//se hace por si alguien no tiene camara evita errores en el flujo RTC
function crearPistaVideoNegra() 
{
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const stream = canvas.captureStream(10); // 10 FPS
  return stream;
}