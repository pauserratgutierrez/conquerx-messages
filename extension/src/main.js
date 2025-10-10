// Handles DOM manipulation and user interactions (optimized)

(() => {
  // Fast path check
  if (!location.pathname.startsWith('/es/schedules/set/update/')) return;
  // Prevent double injection (SPA navigations)
  if (document.querySelector('.toolbox-container')) return;

  // Static maps (built once)
  const DOMINIOS = { blocks: 'ConquerBlocks.com', finance: 'ConquerFinance.com', languages: 'ConquerLanguages.com' };
  const CLOSERS = {
    'alejandro.hortelano@conquerblocks.com': { name: 'Alejandro', phone: '+34 604 56 04 46' },
    'alexandro.vatca@conquerblocks.com': { name: 'Alex', phone: '+34 604 56 04 45' },
    'beatrice@conquerblocks.com': { name: 'Beatrice', phone: '+34 604 56 04 52' },
    'daniel.alfonso@conquerblocks.com': { name: 'Daniel', phone: '+34 604 56 04 53' },
    'isabel.plana@conquerblocks.com': { name: 'Isabel', phone: '+34 604 56 04 50' },
    'julieta.arenas@conquerblocks.com': { name: 'Julieta', phone: '+34 604 56 04 48' },
    'laura.castano@conquerblocks.com': { name: 'Laura', phone: '+34 604 56 04 37' },
    'maria.jose@conquerblocks.com': { name: 'María José', phone: '+34 604 56 04 39' },
    'nazaret.dinino@conquerblocks.com': { name: 'Nazaret', phone: '+34 604 56 06 31' },
    'santos.galindo@conquerblocks.com': { name: 'Santos', phone: '+34 604 56 04 36' },
    'daniel.cassineri@conquerblocks.com': { name: 'Luca', phone: '+34 602 33 52 26' },
    'natalia.montoya@conquerblocks.com': { name: 'Natalia', phone: '+34 634 33 49 34' },
    'javier.iglesias@conquerblocks.com': { name: 'Javier', phone: '+34 628 64 90 42' },

    'chema.celada@conquerfinance.com': { name: 'Chema', phone: '+34 604 56 04 40' },
    'corina.pineiro@conquerfinance.com': { name: 'Corina', phone: '+34 604 56 10 08' },
    'llibert.gutierrez@conquerfinance.com': { name: 'Llibert', phone: '+34 604 56 04 35' },
    'raul.barrios@conquerfinance.com': { name: 'Raúl', phone: '+34 604 56 03 01' },
    'hugo.meseguer@conquerfinance.com': { name: 'Hugo', phone: '+34 604 56 04 42' },

    'chema.celada@formacioneninversion.com': { name: 'Chema', phone: '+34 604 56 04 40' },
    'corina.pineiro@formacioneninversion.com': { name: 'Corina', phone: '+34 604 56 10 08' },
    'llibert.gutierrez@formacioneninversion.com': { name: 'Llibert', phone: '+34 604 56 04 35' },
    'raul.barrios@formacioneninversion.com': { name: 'Raúl', phone: '+34 604 56 03 01' },

    'daniel.rodriguez@conquerlanguages.com': { name: 'Daniel', phone: '+34 604 56 12 18' },
    'hugo.bernabeu@conquerlanguages.com': { name: 'Hugo', phone: '+34 604 56 04 51' },
    'hugo.meseguer@conquerlanguages.com': { name: 'Hugo', phone: '+34 604 56 04 42' },
    'lucia.serrano@conquerlanguages.com': { name: 'Lucía', phone: '+34 604 56 04 43' },
    'mario.garcia@conquerlanguages.com': { name: 'Mario', phone: '+34 604 56 06 32' },
    'adrian.ondarra@conquerlanguages.com': { name: 'Adrián', phone: '+34 604 56 04 49' },
    'oliver.sanchez@conquerlanguages.com': { name: 'Oliver', phone: '+34 604 56 06 30' },
    'manuel.hunger@conquerlanguages.com': { name: 'Manuel', phone: '+34 604 56 16 46' },
    'damian.lefosse@conquerlanguages.com': { name: 'Damián', phone: '+34 604 56 02 99' },
    'antia.murillo@conquerlanguages.com': { name: 'Antia', phone: '+34 644 94 76 49' },
    'john.quintero@conquerlanguages.com': { name: 'John', phone: '+34 642 66 07 16' }
  };

  const LATAM_LINKS = {
    blocks: 'https://www.conquerblocks.com/agenda/fullstack/latam',
    finance: 'https://calendly.com/d/3p4-8yy-cdm/sesion-de-consultoria-conquer-finance-latam',
    languages: 'https://calendly.com/d/cqpw-xd6-x4b/sesion-de-consultoria-conquer-languages-latam'
  };

  const SETTER = { name: 'Dani', phoneNumber: '+34 611 37 27 74' };

  let textCache, dataCache;
  const invalidateCaches = () => { textCache = undefined; dataCache = undefined; };

  // Invalidate on CRM dynamic mutations (lightweight debounce)
  let invalidateTimer;
  const observer = new MutationObserver(() => {
    clearTimeout(invalidateTimer);
    invalidateTimer = setTimeout(invalidateCaches, 150);
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });

  const fetchWidget = async () => {
    const res = await fetch(chrome.runtime.getURL('src/widget.html'));
    return res.text();
  };

  const formatDate = (text) => {
    const parts = text.match(/\d+/g);
    if (!parts || parts.length < 5) return text;
    const [d, m, y, h, min] = parts.map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, h, min));
    const fmtParts = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false
    }).formatToParts(date).reduce((acc, p) => (acc[p.type] = p.value, acc), {});
    const now = new Date();
    const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const tomorrowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    const targetUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    if (targetUTC === todayUTC) return `hoy a las ${fmtParts.hour}:${fmtParts.minute}h de Madrid`;
    if (targetUTC === tomorrowUTC) return `mañana a las ${fmtParts.hour}:${fmtParts.minute}h de Madrid`;
    return `el ${fmtParts.weekday} ${fmtParts.day} a las ${fmtParts.hour}:${fmtParts.minute}h de Madrid`;
  };

  const getTextMap = () => {
    if (textCache) return textCache;
    const map = new Map();
    document.querySelectorAll('span, div').forEach(el => {
      const t = el.textContent?.trim();
      if (t && !map.has(t)) {
        map.set(t, el.nextElementSibling?.textContent?.trim() ?? '');
      }
    });
    textCache = map;
    return map;
  };
  const getValue = (label) => getTextMap().get(label) ?? '';

  const computeData = () => {
    if (dataCache) return dataCache;
    const nombre = getValue('Nombre');
    const lead = nombre.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    const correoCloser = getValue('Closer').toLowerCase();
    const fechaTexto = getValue('Fecha de llamada');
    const evento = getValue('Evento');
    const closer = CLOSERS[correoCloser] || { name: '', phone: '' };
    const telefono = getValue('Teléfono');
    const fecha = formatDate(fechaTexto);
    const fechaLead = getValue('[BETA] Fecha de llamada para el lead');
    const zonaHoraria = getValue('Zona Horaria');
    const dominioEntry = Object.entries(DOMINIOS).find(([key]) => new RegExp(key, 'i').test(evento));
    const dominio = dominioEntry?.[1] || 'conquerx.com';
    const dominioKey = dominioEntry?.[0] || 'blocks';
    dataCache = { nombre, lead, closer, telefono, fecha, fechaLead, zonaHoraria, fechaTexto, dominio, dominioKey };
    return dataCache;
  };

  const mensajes = {
    closer_name: () => computeData().closer.name,
    closer_phone: () => computeData().closer.phone,
    call_date: () => computeData().fecha,
    ncl1: () => {
      const { lead, dominio } = computeData();
      return `¡Hola ${lead}! 👋\n\nSoy ${SETTER.name} del equipo de ${dominio}.\n\nTe acabo de llamar para confirmar la cita que has agendado con nosotros, pero parece que no fue un buen momento para ti ☺️\n\nEs esencial que tengamos una breve llamada para confirmar tu cita antes de la sesión. Si no puedo confirmarla por teléfono, tendré que cancelarla.\n\nTe volveré a llamar desde este número: ${SETTER.phoneNumber}\n\nPor favor, guarda mi número en tus contactos para identificarme fácilmente. 👌`;
    },
    ncl1_latam: () => {
      const { lead, dominio } = computeData();
      return `¡Hola ${lead}! 👋\n\nSoy ${SETTER.name} del equipo de ${dominio}.\n\nTe acabo de llamar para confirmar la cita que has agendado con nosotros, pero me aparece un número de Latinoamérica 😊\n\nEs esencial que podamos saber si te encuentras viviendo en Europa o en algún país de Latinoamérica para que podamos asignarte al departamento correspondiente.\n\nQuedo atento a tu respuesta. ¡Muchas gracias!`;
    },
    ncl2: () => {
      const { lead, fecha } = computeData();
      return `Hola ${lead},\n\nTe he llamado varias veces y no logro contactar contigo. Te llamaba simplemente para comentarte cómo va a ser la llamada del *${fecha}*. Avísame cuando estés disponible y te vuelvo a llamar.`;
    },
    ncl3: () => `${computeData().lead}, he vuelto a intentar contactarte en varias ocasiones para confirmar tu llamada, pero veo que no hemos podido coincidir, ¿Podrías decirme cuándo podríamos cuadrar para confirmar la llamada?`,
    ncl4: () => `${computeData().lead}, si finalmente ya no quieres tener la llamada, con un "eres muy simpático ${SETTER.name}, pero ya no me interesa" también me haces feliz 😊`,
    ncl5: () => `${computeData().lead}, entiendo que puedas estar ocupado. Es importante confirmar tu sesión ya que hay otras personas interesadas. ¿Me confirmas que podrás asistir?`,
    ncp1: () => {
      const { lead, dominio } = computeData();
      return `¡Hola ${lead}! 👋\n\nSoy ${SETTER.name} del equipo de ${dominio}.\n\nTe acabo de llamar para agendar la cita que quedó pendiente con nosotros, pero parece que no fue un buen momento para ti ☺️\n\nEs esencial que tengamos una breve llamada para poder agendar tu sesión.\n\nTe volveré a llamar desde este número: ${SETTER.phoneNumber}\n\nPor favor, guarda mi número en tus contactos para identificarme fácilmente.👌`;
    },
    ncp2: () => `Hola ${computeData().lead} 😊\n\nTe he llamado de nuevo porque iniciaste el proceso para agendar una llamada con nosotros, pero faltó el último paso para elegir la hora.\n\nTe llamaba simplemente para ayudarte a cuadrar tu cita. Avísame cuando estés disponible y te vuelvo a llamar.👌`,
    confirm_lead: () => {
      const { lead, dominio, closer, fecha } = computeData();
      return `¡Hola ${lead}!\n\nSoy ${SETTER.name} del equipo de ${dominio}. Justo estamos hablando ahora mismo por teléfono 😊\n\nMuy pronto te va a contactar ${closer?.name || 'nuestro equipo'} para enviarte el enlace de Google Meet desde el siguiente número: ${closer?.phone || 'que te proporcionaremos'}\n\n✅ Tu cita está confirmada para *${fecha}*.`;
    },
    confirm_closer: () => {
      const { fechaTexto, fechaLead, zonaHoraria, nombre } = computeData();
      return `Confirmada\n\nFecha de llamada\n${fechaTexto}\nFecha de llamada para el lead\n${fechaLead}\nZona Horaria\n${zonaHoraria}\nNombre\n${nombre}`;
    },
    cancel_latam: () => {
      const { lead, dominio, dominioKey } = computeData();
      return `¡Hola ${lead}!\n\nSoy ${SETTER.name} del equipo de ${dominio} 😊\n\nTe dejo el enlace para poder agendar tu cita con el equipo de Latam. Te será más sencillo cuadrar horarios 💪\n\n${LATAM_LINKS[dominioKey]}`;
    }
  };

  const init = async () => {
    const html = await fetchWidget();
    document.body.insertAdjacentHTML('beforeend', html);

    const content = document.querySelector('.toolbox-content');
    const bubble = document.querySelector('.toolbox-bubble');
    const modes = [...document.querySelectorAll('.toolbox-mode')];
    let activeMode = 'menu';

    const setMode = (mode) => {
      if (mode === activeMode) return;
      activeMode = mode;
      modes.forEach(m => m.classList.toggle('active', m.dataset.mode === mode));
    };
    // Initial
    modes.forEach(m => m.classList.toggle('active', m.dataset.mode === 'menu'));

    bubble?.addEventListener('click', () => {
      content.classList.toggle('hidden');
    }, { passive: true });

    // Single delegated handler
    content.addEventListener('click', async (e) => {
      const toolBtn = e.target.closest('.toolbox-tool');
      if (toolBtn) {
        const tool = toolBtn.dataset.tool;
        if (tool) setMode(tool);
        return;
      }
      if (e.target.closest('.toolbox-back-button')) {
        setMode('menu');
        return;
      }
      const templateBtn = e.target.closest('.toolbox-button');
      if (templateBtn) {
        const key = templateBtn.dataset.template;
        const fn = key && mensajes[key];
        if (fn) {
          try {
            const msg = fn();
            await navigator.clipboard.writeText(msg);
          } catch (_) {
            // Silent clipboard failure
          }
          content.classList.add('hidden');
        }
      }
    });
  };

  init();
})();