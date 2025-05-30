//variables globales
let callerId = null;
let calleeId = null;
let pc;
let localStream;
let remoteStream = new MediaStream();
let videoTransceiver;

// —————————————————————
// 1) Init dispositivos & check llamadas
// —————————————————————
async function initDeviceSelection() 
{
  try 
  { 
    await navigator.mediaDevices.getUserMedia({ audio: true }); 
  }
  catch(e)
  {
    /* permiso audio denegado */
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const as = document.getElementById('audioSelect');
  const vs = document.getElementById('videoSelect');

  devices.forEach(d => {
    if (d.kind === 'audioinput')
      as.add(new Option(d.label||'Micrófono', d.deviceId));
    if (d.kind === 'videoinput')
      vs.add(new Option(d.label||'Cámara', d.deviceId));
  });

  document.getElementById('remoteAudio').style.display = 'none';
  
  setInterval(checkIncoming, 2000); //cada 2s revisa llamadas
}
window.addEventListener('load', initDeviceSelection); //al cargar te pide permisos

async function checkIncoming()
{
  try {
    const res = await fetch(`../php/check_llamadas.php?id=${id_usuario_actual}`);
    const j   = await res.json();
    if (j.status === 'llamada') {
      mostrarPopupLlamada(j.alias, j.id_emisor);
    }
  } catch(e){
    console.warn('checkIncoming fallo:', e);
  }
}

// —————————————————————
// 2) UI de llamada
// —————————————————————
async function llamarAmigo(idReceptor)
{
  callerId = id_usuario_actual;
  calleeId = idReceptor;
  const resp = await fetch('../php/iniciar_llamada.php',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ id_emisor:callerId, id_receptor:calleeId })
  });
  const j = await resp.json();
  if(j.status!=='ok') return alert('Error: '+j.msg);
  await iniciarLlamada(true);
}

async function aceptarLlamada(idEmisor)
{
  callerId = idEmisor;
  calleeId = id_usuario_actual;
  document.getElementById('popup-llamada').style.display='none';
  await fetch('../php/responder_llamada.php',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      id_emisor:callerId,
      id_receptor:calleeId,
      respuesta:'aceptada'
    })
  });
  await iniciarLlamada(false);
}

function rechazarLlamada(idEmisor)
{
  fetch('../php/responder_llamada.php',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      id_emisor:idEmisor,
      id_receptor:id_usuario_actual,
      respuesta:'rechazada'
    })
  });
  document.getElementById('popup-llamada').style.display='none';
}

function mostrarPopupLlamada(alias,idEmisor) //construccion del div popup + mostrarlo
{
  const pop = document.getElementById('popup-llamada');
  pop.innerHTML = `
    <div class="popup">
      📞 Llamada entrante de <strong>${alias}</strong><br>
      <button class="accept-button" onclick="aceptarLlamada(${idEmisor})">Aceptar</button>
      <button class="reject-button" onclick="rechazarLlamada(${idEmisor})">Rechazar</button>
    </div>`;
  pop.style.display='block';
}

function colgar()
{
  if(pc) pc.close();
  document.getElementById('call-ui').style.display='none';
  fetch('../php/responder_llamada.php',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      id_emisor:callerId,
      id_receptor:calleeId,
      respuesta:'finalizada'
    })
  });
}

// —————————————————————
// 3) Mute / cámara / dispositivos
// —————————————————————
function toggleMute()
{ 
  localStream.getAudioTracks().forEach(t=>t.enabled=!t.enabled) 
}

function toggleDeafen()
{ 
  remoteStream.getAudioTracks().forEach(t=>t.enabled=!t.enabled) 
}

function toggleCamera()
{
  const t = localStream.getVideoTracks()[0];
  if(t) t.enabled = !t.enabled;
}

async function changeAudioDevice()
{
  const deviceId = document.getElementById('audioSelect').value;
  const s = await navigator.mediaDevices.getUserMedia({ audio:{deviceId} });
  const nt= s.getAudioTracks()[0];
  const sender = pc.getSenders().find(s=>s.track.kind==='audio');
  await sender.replaceTrack(nt);
  localStream.removeTrack(localStream.getAudioTracks()[0]);
  localStream.addTrack(nt);
}

async function changeVideoDevice()
{
  const deviceId = document.getElementById('videoSelect').value;
  const s = await navigator.mediaDevices.getUserMedia({ video:{deviceId} });
  const nt= s.getVideoTracks()[0];
  const sender = pc.getSenders().find(s=>s.track.kind==='video');
  await sender.replaceTrack(nt);
  localStream.removeTrack(localStream.getVideoTracks()[0]);
  localStream.addTrack(nt);
  document.getElementById('localVideo').srcObject = localStream;
}

// —————————————————————
// 4) Compartir pantalla
// —————————————————————
async function compartirPantalla()
{
  if(!navigator.mediaDevices.getDisplayMedia)
  {
    return alert('Compartir pantalla no soportado');
  }

  const sender = videoTransceiver?.sender;

  if(!sender)
  {
    return alert('No hay sender de vídeo para reemplazar');
  }

  try 
  {
    const screen = await navigator.mediaDevices.getDisplayMedia({video:true});
    const st = screen.getVideoTracks()[0];
    await sender.replaceTrack(st);
    document.getElementById('localVideo').srcObject = screen;
    st.onended = async ()=>{
      const cam = localStream.getVideoTracks()[0]||null;
      if(cam){
        await sender.replaceTrack(cam);
        document.getElementById('localVideo').srcObject = localStream;
      }
    };
  } 
  catch(e)
  {
    console.error('Error compartiendo pantalla:', e);
    alert('No se pudo compartir pantalla');
  }
}

// —————————————————————
// 5) Core WebRTC + signaling
// —————————————————————
async function iniciarLlamada(isCaller){
  document.getElementById('call-ui').style.display='flex';

  pc = new RTCPeerConnection({ iceServers:[{urls:'stun:stun.l.google.com:19302'}] });

  // ICE → servidor (siempre caller→callee)
  pc.onicecandidate = ev=>{
    if(!ev.candidate) return;
    fetch('../php/signaling.php',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        id_emisor:callerId,
        id_receptor:calleeId,
        type:'ice',
        data:ev.candidate
      })
    });
  };

  // Recibir tracks
  pc.ontrack = ev=>{
    remoteStream.addTrack(ev.track);
    const rv = document.getElementById('remoteVideo');
    rv.srcObject    = remoteStream;
    rv.autoplay     = true;
    rv.playsInline  = true;
    rv.muted        = true; // para autoplay en móvil
    if(ev.track.kind==='audio'){
      const ra = document.getElementById('remoteAudio');
      ra.style.display='block';
      ra.srcObject = remoteStream;
      ra.play().catch(()=>{});
    }
  };

  // Obtener media local
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio:true, video:true });
  } catch(e){
    console.warn('Sin vídeo:', e);
    localStream = await navigator.mediaDevices.getUserMedia({ audio:true });
  }
  const lv = document.getElementById('localVideo');
  lv.srcObject = localStream;
  lv.autoplay = true;
  lv.playsInline = true;
  lv.muted = true;

  // Añadir audio
  localStream.getAudioTracks().forEach(t=>pc.addTrack(t, localStream));

  // ————— Crear transceiver fijo de vídeo —————
  videoTransceiver = pc.addTransceiver('video',{ direction:'sendrecv' });
  // si tengo pista de cámara, la reemplazo:
  const cam = localStream.getVideoTracks()[0]||null;
  if(cam){
    await videoTransceiver.sender.replaceTrack(cam);
  }

  // Offer / Answer inicial
  if(isCaller){
    const off = await pc.createOffer();
    await pc.setLocalDescription(off);
    await fetch('../php/signaling.php',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        id_emisor:callerId,
        id_receptor:calleeId,
        type:'offer',
        data:off
      })
    });
    // espera respuesta
    let ans=null;
    while(!ans){
      const res = await fetch(
        `../php/signaling.php?modo=obtener&type=answer`+
        `&id_emisor=${callerId}`+
        `&id_receptor=${calleeId}`
      );
      ans = (await res.json()).data;
      if(!ans) await new Promise(r=>setTimeout(r,300));
    }
    await pc.setRemoteDescription(new RTCSessionDescription(ans));
  } else {
    // receptor espera offer
    let of=null;
    while(!of){
      const res = await fetch(
        `../php/signaling.php?modo=obtener&type=offer`+
        `&id_emisor=${callerId}`+
        `&id_receptor=${calleeId}`
      );
      of=(await res.json()).data;
      if(!of) await new Promise(r=>setTimeout(r,300));
    }
    await pc.setRemoteDescription(new RTCSessionDescription(of));

    // crear + enviar answer
    const ans = await pc.createAnswer();
    await pc.setLocalDescription(ans);
    await fetch('../php/signaling.php',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        id_emisor:callerId,
        id_receptor:calleeId,
        type:'answer',
        data:ans
      })
    });
  }

  // Polling ICE remoto (misma fila)
  setInterval(async ()=>{
    const res = await fetch(
      `../php/signaling.php?modo=obtener&type=ice`+
      `&id_emisor=${callerId}`+
      `&id_receptor=${calleeId}`
    );
    const arr = (await res.json()).data || [];
    const list=Array.isArray(arr)?arr:[arr];
    for(const c of list){
      try{ await pc.addIceCandidate(new RTCIceCandidate(c)); }
      catch(e){}
    }
  },1000);
}

// —————————————————————
// 6) Exportar global
// —————————————————————
window.llamarAmigo = llamarAmigo;
window.aceptarLlamada = aceptarLlamada;
window.rechazarLlamada = rechazarLlamada;
window.mostrarPopupLlamada = mostrarPopupLlamada;
window.colgar = colgar;
window.toggleMute = toggleMute;
window.toggleDeafen = toggleDeafen;
window.toggleCamera = toggleCamera;
window.changeAudioDevice = changeAudioDevice;
window.changeVideoDevice = changeVideoDevice;
window.compartirPantalla = compartirPantalla;