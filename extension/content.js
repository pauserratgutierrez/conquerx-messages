(() => {
  // Early return if not on the correct page
  if (!/\/schedules\/set\/update\/\d+\/?$/.test(location.pathname)) return;

  // Constants
  const DOMINIOS = { blocks: 'ConquerBlocks.com', finance: 'ConquerFinance.com', languages: 'ConquerLanguages.com' };
  
  const CLOSERS = Object.fromEntries(
    Object.entries({
      'conquerblocks.com': [
        ['Alejandro', '+34 604 56 04 46', 'alejandro.hortelano'],
        ['Alex', '+34 604 56 04 45', 'alexandro.vatca'],
        ['Beatrice', '+34 604 56 04 52', 'beatrice'],
        ['Daniel', '+34 604 56 04 53', 'daniel.alfonso'],
        ['Isabel', '+34 604 56 04 50', 'isabel.plana'],
        ['Julieta', '+34 604 56 04 48', 'julieta.arenas'],
        ['Laura', '+34 604 56 04 37', 'laura.castano'],
        ['María José', '+34 604 56 04 39', 'maria.jose'],
        ['Nazaret', '+34 604 56 06 31', 'nazaret.dinino'],
        ['Santos', '+34 604 56 04 36', 'santos.galindo']
      ],
      'conquerfinance.com': [
        ['Chema', '+34 604 56 04 40', 'chema.celada'],
        ['Corina', '+34 604 56 10 08', 'corina.pineiro'],
        ['Llibert', '+34 604 56 04 35', 'llibert.gutierrez'],
        ['Raúl', '+34 604 56 03 01', 'raul.barrios']
      ],
      'formacioneninversion.com': [
        ['Chema', '+34 604 56 04 40', 'chema.celada'],
        ['Corina', '+34 604 56 10 08', 'corina.pineiro'],
        ['Llibert', '+34 604 56 04 35', 'llibert.gutierrez'],
        ['Raúl', '+34 604 56 03 01', 'raul.barrios']
      ],
      'conquerlanguages.com': [
        ['Daniel', '+34 604 56 12 18', 'daniel.rodriguez'],
        ['Hugo', '+34 604 56 04 51', 'hugo.bernabeu'],
        ['Hugo Meseguer', '+34 604 56 04 42', 'hugo.meseguer'],
        ['Lucia', '+34 604 56 04 43', 'lucia.serrano'],
        ['Mario', '+34 604 56 06 32', 'mario.garcia']
      ]
    }).flatMap(([domain, list]) => 
      list.map(([name, phone, id]) => [`${id}@${domain}`, { name, phone }])
    )
  );

  const LATAM_LINKS = {
    blocks: 'https://www.conquerblocks.com/agenda/fullstack/latam',
    finance: 'https://calendly.com/d/3p4-8yy-cdm/sesion-de-consultoria-conquer-finance-latam',
    languages: 'https://calendly.com/d/cqpw-xd6-x4b/sesion-de-consultoria-conquer-languages-latam'
  };

  const SETTER = {
    name: 'Dani',
    phoneNumber: '+34 604 56 06 29',
  };

  // Memoized data extraction
  const memoize = (fn) => {
    let cache;
    return () => cache ??= fn();
  };

  const getText = memoize(() => {
    const textMap = new Map();
    document.querySelectorAll('span, div').forEach(el => {
      const text = el.textContent?.trim();
      if (text && !textMap.has(text)) {
        textMap.set(text, el.nextElementSibling?.textContent?.trim() ?? '');
      }
    });
    return textMap;
  });

  const getDataValue = (label) => getText().get(label) ?? '';

  const formatDate = (text) => {
    const parts = text.match(/\d+/g);
    if (!parts || parts.length < 5) return text;

    const [d, m, y, h, min] = parts.map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, h, min));
    
    try {
      const map = Object.fromEntries(
        new Intl.DateTimeFormat('es-ES', {
          weekday: 'long', day: 'numeric', month: 'long',
          hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false
        }).formatToParts(date).map(({ type, value }) => [type, value])
      );
      return `${map.weekday} ${map.day} de ${map.month} a las ${map.hour}:${map.minute}h de Madrid`;
    } catch {
      return text;
    }
  };

  // Cached data
  const getData = memoize(() => {
    const lead = getDataValue('Nombre');
    const correo = getDataValue('Closer').toLowerCase();
    const fechaTexto = getDataValue('Fecha de llamada');
    const evento = getDataValue('Evento');
    
    const closer = CLOSERS[correo];
    const fecha = formatDate(fechaTexto);
    const dominio = Object.entries(DOMINIOS).find(([key]) => 
      new RegExp(key, 'i').test(evento)
    )?.[1] ?? 'conquerx.com';
    const dominioKey = Object.keys(DOMINIOS).find(key => DOMINIOS[key] === dominio) ?? 'blocks';

    return { lead, closer, fecha, dominio, dominioKey };
  });

  // Message templates
  const mensajes = {
    'N1': () => {
      const { lead, dominio } = getData();
      return `¡Hola ${lead}! 👋\n\nSoy ${SETTER.name} del equipo de ${dominio}.\n\nTe acabo de llamar para confirmar la cita que has agendado con nosotros, pero parece que no fue un buen momento para ti ☺️\n\nEs esencial que tengamos una breve llamada para confirmar tu cita antes de la sesión. Si no puedo confirmarla por teléfono, tendré que cancelarla.\n\nTe volveré a llamar desde este número: ${SETTER.phoneNumber}\n\nPor favor, guarda mi número en tus contactos para identificarme fácilmente. 👌`;
    },
    'N1 (Latam)': () => {
      const { lead, dominio } = getData();
      return `¡Hola ${lead}! 👋\n\nSoy ${SETTER.name} del equipo de ${dominio}.\n\nTe acabo de llamar para confirmar la cita que has agendado con nosotros, pero me aparece un número de Latinoamérica 😊\n\nEs esencial que podamos saber si te encuentras viviendo en Europa o en algún país de Latinoamérica para que podamos asignarte al departamento correspondiente.\n\nQuedo atento a tu respuesta. ¡Muchas gracias!`;
    },
    'N2': () => {
      const { lead, fecha } = getData();
      return `Hola ${lead},\n\nTe he llamado varias veces y no logro contactar contigo. Te llamaba simplemente para comentarte cómo va a ser la llamada de *${fecha}*.\n\nAvísame cuando estés disponible y te vuelvo a llamar.`;
    },
    'N3': () => `${getData().lead}, he vuelto a intentar contactarte en varias ocasiones para confirmar tu llamada, pero veo que no hemos podido coincidir, ¿Podrías decirme cuándo podríamos cuadrar para confirmar la llamada?`,
    'N4': () => `${getData().lead}, si finalmente ya no quieres tener la llamada, con un "eres muy simpático ${SETTER.name}, pero ya no me interesa" también me haces feliz 😊`,
    'N5': () => `${getData().lead}, entiendo que puedas estar ocupado. Es importante confirmar tu sesión ya que hay otras personas interesadas. ¿Me confirmas que podrás asistir?`,
    'N1 Pre': () => {
      const { lead, dominio } = getData();
      return `¡Hola ${lead}! 👋\n\nSoy ${SETTER.name} del equipo de ${dominio}.\n\nTe acabo de llamar para agendar la cita que quedó pendiente con nosotros, pero parece que no fue un buen momento para ti ☺️\n\nEs esencial que tengamos una breve llamada para poder agendar tu sesión.\n\nTe volveré a llamar desde este número: ${SETTER.phoneNumber}\n\nPor favor, guarda mi número en tus contactos para identificarme fácilmente.👌`;
    },
    'N2 Pre': () => `Hola ${getData().lead} 😊\n\nTe he llamado de nuevo porque iniciaste el proceso para agendar una llamada con nosotros, pero faltó el último paso para elegir la hora.\n\nTe llamaba simplemente para ayudarte a cuadrar tu cita. Avísame cuando estés disponible y te vuelvo a llamar.👌`,
    '✅ Confirmar': () => {
      const { lead, dominio, closer, fecha } = getData();
      return `¡Hola ${lead}!\n\nSoy ${SETTER.name} del equipo de ${dominio}. Justo estamos hablando ahora mismo por teléfono 😊\n\nMuy pronto te va a contactar ${closer?.name || 'nuestro equipo'} para enviarte el enlace de Google Meet desde el siguiente número: ${closer?.phone || 'que te proporcionaremos'}\n\n✅ Tu cita está confirmada para el *${fecha}*.`;
    },
    '❌ Cancelar (Latam)': () => {
      const { lead, dominio, dominioKey } = getData();
      return `¡Hola ${lead}!\n\nSoy ${SETTER.name} del equipo de ${dominio} 😊\n\nTe dejo el enlace para poder agendar tu cita con el equipo de Latam. Te será más sencillo cuadrar horarios 💪\n\n${LATAM_LINKS[dominioKey]}`;
    }
  };

  // UI Creation
  const createUI = () => {
    // CSS injection (only once)
    if (!document.getElementById('message-bubble-styles')) {
      const style = document.createElement('style');
      style.id = 'message-bubble-styles';
      style.textContent = `
        .bubble-container{position:fixed;bottom:20px;right:20px;z-index:9999}
        .main-bubble{width:40px;height:40px;border-radius:50%;border:1px solid #d8d8d8ff;color:white;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.2);cursor:pointer;transition:all .2s ease}
        .main-bubble:hover{transform:scale(1.1)}
        .main-bubble.active{border: 1px solid #d8d8d8ff}
        .buttons-container{position:absolute;bottom:48px;right:0;display:flex;flex-direction:column;gap:6px;opacity:0;visibility:hidden;transition:all .2s ease}
        .buttons-container.show{opacity:1;visibility:visible}
        .action-button{background:white;border:1px solid #ddd;padding:6px 10px;border-radius:10px;cursor:pointer;font-size:12px;white-space:nowrap;color:#333;box-shadow:0 1px 3px rgba(0,0,0,0.1);transition:.2s}
        .action-button:hover{background:#d8d8d8ff;transform:translateX(-3px)}
        .no-contesta{border:1px solid #ffc700}
        .confirmar{border:1px solid #50cd89}
        .cancelar{border:1px solid #f1416c}
      `;
      document.head.appendChild(style);
    }

    const container = document.createElement('div');
    container.className = 'bubble-container';

    const btnContainer = document.createElement('div');
    btnContainer.className = 'buttons-container';

    // Create buttons efficiently
    const fragment = document.createDocumentFragment();
    Object.keys(mensajes).forEach(label => {
      const btn = document.createElement('button');
      btn.className = `action-button ${
        label.startsWith('N') ? 'no-contesta' : 
        label === '✅ Confirmar' ? 'confirmar' : 
        label === '❌ Cancelar (Latam)' ? 'cancelar' : ''
      }`.trim();
      btn.textContent = label;
      btn.onclick = async () => {
        await navigator.clipboard.writeText(mensajes[label]());
        toggle(false);
      };
      fragment.appendChild(btn);
    });
    btnContainer.appendChild(fragment);

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'main-bubble';
    toggleBtn.textContent = '💬';

    let isOpen = false;
    const toggle = (force) => {
      isOpen = force ?? !isOpen;
      toggleBtn.classList.toggle('active', isOpen);
      btnContainer.classList.toggle('show', isOpen);
    };

    toggleBtn.onclick = () => toggle();
    document.onclick = (e) => {
      if (!container.contains(e.target) && isOpen) toggle(false);
    };

    container.append(btnContainer, toggleBtn);
    document.body.appendChild(container);
  };

  // Initialize
  document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', createUI)
    : createUI();
})();