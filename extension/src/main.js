// Handles DOM manipulation and user interactions

(async () => {
  if (!location.pathname.startsWith('/es/schedules/set/update/')) return;

  const res = await fetch(chrome.runtime.getURL('src/widget.html'));
  const html = await res.text();
  document.body.insertAdjacentHTML('beforeend', html);

  const content = document.querySelector('.toolbox-content');
  const modes = document.querySelectorAll('.toolbox-mode');

  const showMode = (mode) => {
    modes.forEach(m => {
      m.style.display = m.dataset.mode === mode ? 'flex' : 'none';
    });
  };

  // Always show menu by default
  showMode('menu');

  // Toggle visibility
  document.querySelector('.toolbox-bubble')?.addEventListener('click', () => {
    content.classList.toggle('hidden');
    // if (!content.classList.contains('hidden')) showMode('menu');
  });

  // Tool button handler (menu -> tool)
  document.querySelector('.toolbox-tool-list')?.addEventListener('click', (e) => {
    const tool = e.target.closest('.toolbox-tool')?.dataset.tool;
    if (tool) showMode(tool);
  });

  // Back button handler (tool -> menu)
  document.querySelector('.toolbox-content')?.addEventListener('click', (e) => {
    if (e.target.closest('.toolbox-back-button')) showMode('menu');
  });

  document.querySelector('.toolbox-content')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.toolbox-button');
    const template = btn?.dataset.template;
    if (template && mensajes?.[template]) {
      const message = mensajes[template]();
      const telefono = getDataValue('Teléfono');

      await navigator.clipboard.writeText(message);
      // if (telefono) {
      //   const url = `https://web.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(message)}`;
      //   await chrome.runtime.sendMessage({ action: 'whatsapp_tab', url });
      // };

      content.classList.add('hidden'); // Hide toolbox after copying
    }
  });

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
        ['Raúl', '+34 604 56 03 01', 'raul.barrios'],
        ['Hugo', '+34 604 56 04 42', 'hugo.meseguer'] // Languages, con correo de finance
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
        ['Hugo', '+34 604 56 04 42', 'hugo.meseguer'],
        ['Lucia', '+34 604 56 04 43', 'lucia.serrano'],
        ['Mario', '+34 604 56 06 32', 'mario.garcia'],
        ['Adrián', '+34 604 56 04 49', 'adrian.ondarra'],
        ['Oliver', '+34 604 56 06 30', 'oliver.sanchez']
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
    const nombre = getDataValue('Nombre');
    const lead = nombre.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    const correoCloser = getDataValue('Closer').toLowerCase();
    const fechaTexto = getDataValue('Fecha de llamada');
    const evento = getDataValue('Evento');

    const closer = CLOSERS[correoCloser];
    const telefono = getDataValue('Teléfono');
    const fecha = formatDate(fechaTexto);
    const dominio = Object.entries(DOMINIOS).find(([key]) => 
      new RegExp(key, 'i').test(evento)
    )?.[1] ?? 'conquerx.com';
    const dominioKey = Object.keys(DOMINIOS).find(key => DOMINIOS[key] === dominio) ?? 'blocks';

    return { nombre, lead, closer, telefono, fecha, fechaTexto, dominio, dominioKey };
  });

  // Message templates
  const mensajes = {
    'ncl1': () => {
      const { lead, dominio } = getData();
      return `¡Hola ${lead}! 👋\n\nSoy ${SETTER.name} del equipo de ${dominio}.\n\nTe acabo de llamar para confirmar la cita que has agendado con nosotros, pero parece que no fue un buen momento para ti ☺️\n\nEs esencial que tengamos una breve llamada para confirmar tu cita antes de la sesión. Si no puedo confirmarla por teléfono, tendré que cancelarla.\n\nTe volveré a llamar desde este número: ${SETTER.phoneNumber}\n\nPor favor, guarda mi número en tus contactos para identificarme fácilmente. 👌`;
    },
    'ncl1_latam': () => {
      const { lead, dominio } = getData();
      return `¡Hola ${lead}! 👋\n\nSoy ${SETTER.name} del equipo de ${dominio}.\n\nTe acabo de llamar para confirmar la cita que has agendado con nosotros, pero me aparece un número de Latinoamérica 😊\n\nEs esencial que podamos saber si te encuentras viviendo en Europa o en algún país de Latinoamérica para que podamos asignarte al departamento correspondiente.\n\nQuedo atento a tu respuesta. ¡Muchas gracias!`;
    },
    'ncl2': () => {
      const { lead, fecha } = getData();
      return `Hola ${lead},\n\nTe he llamado varias veces y no logro contactar contigo. Te llamaba simplemente para comentarte cómo va a ser la llamada del *${fecha}*. Avísame cuando estés disponible y te vuelvo a llamar.`;
    },
    'ncl3': () => `${getData().lead}, he vuelto a intentar contactarte en varias ocasiones para confirmar tu llamada, pero veo que no hemos podido coincidir, ¿Podrías decirme cuándo podríamos cuadrar para confirmar la llamada?`,
    'ncl4': () => `${getData().lead}, si finalmente ya no quieres tener la llamada, con un "eres muy simpático ${SETTER.name}, pero ya no me interesa" también me haces feliz 😊`,
    'ncl5': () => `${getData().lead}, entiendo que puedas estar ocupado. Es importante confirmar tu sesión ya que hay otras personas interesadas. ¿Me confirmas que podrás asistir?`,
    'ncp1': () => {
      const { lead, dominio } = getData();
      return `¡Hola ${lead}! 👋\n\nSoy ${SETTER.name} del equipo de ${dominio}.\n\nTe acabo de llamar para agendar la cita que quedó pendiente con nosotros, pero parece que no fue un buen momento para ti ☺️\n\nEs esencial que tengamos una breve llamada para poder agendar tu sesión.\n\nTe volveré a llamar desde este número: ${SETTER.phoneNumber}\n\nPor favor, guarda mi número en tus contactos para identificarme fácilmente.👌`;
    },
    'ncp2': () => `Hola ${getData().lead} 😊\n\nTe he llamado de nuevo porque iniciaste el proceso para agendar una llamada con nosotros, pero faltó el último paso para elegir la hora.\n\nTe llamaba simplemente para ayudarte a cuadrar tu cita. Avísame cuando estés disponible y te vuelvo a llamar.👌`,
    'confirm_lead': () => {
      const { lead, dominio, closer, fecha } = getData();
      return `¡Hola ${lead}!\n\nSoy ${SETTER.name} del equipo de ${dominio}. Justo estamos hablando ahora mismo por teléfono 😊\n\nMuy pronto te va a contactar ${closer?.name || 'nuestro equipo'} para enviarte el enlace de Google Meet desde el siguiente número: ${closer?.phone || 'que te proporcionaremos'}\n\n✅ Tu cita está confirmada para el *${fecha}*.`;
    },
    'confirm_closer': () => {
      const { fechaTexto, nombre } = getData();
      return `Confirmada\n\nFecha de llamada\n${fechaTexto}\nNombre\n${nombre}`;
    },
    'cancel_latam': () => {
      const { lead, dominio, dominioKey } = getData();
      return `¡Hola ${lead}!\n\nSoy ${SETTER.name} del equipo de ${dominio} 😊\n\nTe dejo el enlace para poder agendar tu cita con el equipo de Latam. Te será más sencillo cuadrar horarios 💪\n\n${LATAM_LINKS[dominioKey]}`;
    }
  };
})();