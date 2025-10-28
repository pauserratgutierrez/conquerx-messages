// Handles DOM manipulation and user interactions

(() => {
  if (!location.pathname.startsWith('/es/schedules/set/update/') && !location.pathname.startsWith('/es/schedules/set/preschedule/detail/')) return;

  // Prevent double injection (SPA navigations)
  if (document.querySelector('.toolbox-container')) return;

  const SETTER = { name: 'Dani', phoneNumber: '+34 611 37 27 74' };
  const CLOSERS = {
    // Blocks
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
    'daniel.cassineri@conquerblocks.com': { name: 'Luca Daniel', phone: '+34 604 56 33 46' },
    'natalia.montoya@conquerblocks.com': { name: 'Natalia', phone: '+34 604 56 33 23' },
    'javier.iglesias@conquerblocks.com': { name: 'Javier', phone: '+34 628 64 90 42' },
    'carla.miraglio@conquerblocks.com': { name: 'Carla', phone: '+34 642 50 94 07' },
    'florencia.scarano@conquerblocks.com': { name: 'Florencia', phone: '+34 641 56 62 23' },
    'albert.navarro@conquerblocks.com': { name: 'Albert', phone: '+34 631 16 47 02' },

    // Finance
    'chema.celada@conquerfinance.com': { name: 'Chema', phone: '+34 604 56 04 40' },
    'corina.pineiro@conquerfinance.com': { name: 'Corina', phone: '+34 604 56 10 08' },
    'llibert.gutierrez@conquerfinance.com': { name: 'Llibert', phone: '+34 604 56 04 35' },
    'raul.barrios@conquerfinance.com': { name: 'Raúl', phone: '+34 604 56 03 01' },
    'hugo.meseguer@conquerfinance.com': { name: 'Hugo', phone: '+34 604 56 04 42' },

    'chema.celada@formacioneninversion.com': { name: 'Chema', phone: '+34 604 56 04 40' },
    'corina.pineiro@formacioneninversion.com': { name: 'Corina', phone: '+34 604 56 10 08' },
    'llibert.gutierrez@formacioneninversion.com': { name: 'Llibert', phone: '+34 604 56 04 35' },
    'raul.barrios@formacioneninversion.com': { name: 'Raúl', phone: '+34 604 56 03 01' },

    // Languages
    'daniel.rodriguez@conquerlanguages.com': { name: 'Daniel', phone: '+34 604 56 12 18' },
    'hugo.bernabeu@conquerlanguages.com': { name: 'Hugo', phone: '+34 604 56 04 51' },
    'hugo.meseguer@conquerlanguages.com': { name: 'Hugo', phone: '+34 604 56 04 42' },
    'lucia.serrano@conquerlanguages.com': { name: 'Lucía', phone: '+34 604 56 04 43' },
    'mario.garcia@conquerlanguages.com': { name: 'Mario', phone: '+34 604 56 06 32' },
    'adrian.ondarra@conquerlanguages.com': { name: 'Adrián', phone: '+34 604 56 04 49' },
    'oliver.sanchez@conquerlanguages.com': { name: 'Oliver', phone: '+34 604 56 06 30' },
    'manuel.hunger@conquerlanguages.com': { name: 'Manuel', phone: '+34 604 56 16 46' },
    'damian.lefosse@conquerlanguages.com': { name: 'Damián', phone: '+34 604 56 02 99' },
    'antia.murillo@conquerlanguages.com': { name: 'Antía', phone: '+34 644 94 76 49' },
    'john.quintero@conquerlanguages.com': { name: 'John', phone: '+34 642 66 07 16' },
    'eduardo.salgado@conquerlanguages.com': { name: 'Eduardo', phone: '+34 604 56 35 78' },
    'alexandro.david@conquerlanguages.com': { name: 'Alex', phone: '+34 604 56 04 45' },
    'carlos.naranjo@conquerlanguages.com': { name: 'Carlos', phone: '+34 691 24 65 95' }
  };

  const fetchWidget = async () => {
    const res = await fetch(chrome.runtime.getURL('src/widget.html'));
    if (!res.ok) throw new Error(`Failed to load widget: ${res.statusText}`);
    return res.text();
  };

  const formatDate = (text) => { // Human readable, e.g: 'hoy a las 15:30h de Madrid', 'mañana a las 09:00h de Madrid', 'el viernes 5 a las 14:00h de Madrid'
    const parts = text.match(/\d+/g);
    if (!parts || parts.length < 5) return text;
    const [d, m, y, h, min] = parts.map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, h, min));

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);
    const targetDate = new Date(Date.UTC(y, m - 1, d));

    const fmtParts = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false
    }).formatToParts(date).reduce((acc, p) => (acc[p.type] = p.value, acc), {});

    const timeString = `${fmtParts.hour}:${fmtParts.minute}h de Madrid`;

    if (targetDate.getTime() === today.getTime()) return `hoy a las ${timeString}`;
    if (targetDate.getTime() === tomorrow.getTime()) return `mañana a las ${timeString}`;
    return `el ${fmtParts.weekday} ${fmtParts.day} a las ${timeString}`;
  };

  const formatDateGoogleCalendar = (text) => { // YYYYMMDD
    const parts = text.match(/\d+/g);
    if (!parts || parts.length < 3) return text;
    const [d, m, y] = parts;
    return `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
  };

  const getTextMap = (scope = '.card-body') => {
    const map = new Map();
    const root = document.querySelector(scope) || document;
    root.querySelectorAll('span, div').forEach(el => {
      const t = el.textContent?.trim();
      if (t && !map.has(t)) map.set(t, el.nextElementSibling?.textContent?.trim() ?? '');
    });
    return map;
  };

  const domainFromText = (t) => {
    if (!t) return null;
    const s = t.toLowerCase();
    if (/(blocks|conquer blocks|conquerblocks|full)/.test(s)) return 'conquerblocks.com';
    if (/(finance|conquer finance|conquerfinance|proptrading)/.test(s)) return 'conquerfinance.com';
    if (/(languages|conquer languages|conquerlanguages|english)/.test(s)) return 'conquerlanguages.com';
    return null;
  };

  const extractPageData = () => {
    const map = getTextMap();
    const getValue = (label) => map.get(label) ?? '';

    const leadName = getValue('Nombre');
    const lead = {
      nameOriginal: leadName,
      nameForLead: leadName.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
      phone: getValue('Teléfono'),
      email: getValue('Correo electrónico')
    };

    const closerName = getValue('Closer');
    const closer = {
      email: closerName,
      name: CLOSERS[closerName.toLowerCase()]?.name || '',
      phone: CLOSERS[closerName.toLowerCase()]?.phone || ''
    };

    const dateOriginal = getValue('Fecha de llamada'); // DD/MM/YYYY HH:mm
    const event = {
      dateOriginal: dateOriginal,
      dateTimeZone: getValue('[BETA] Fecha de llamada para el lead'),
      dateOriginalFormatted: formatDate(dateOriginal),
      timeZone: getValue('Zona Horaria'),
      product: getValue('Producto'),
      event: getValue('Evento'),
      form: getValue('Formulario') // Prellamadas
    };

    const domain = domainFromText(event.event) || domainFromText(event.product) || domainFromText(event.form) || 'conquerx.com';

    return { lead, event, closer, domain };
  }

  const init = async () => {
    try {
      const html = await fetchWidget();
      document.body.insertAdjacentHTML('beforeend', html);
    } catch (e) {
      console.error(`CRM Setter Tools Error: ${error}`);
      return;
    }

    const content = document.querySelector('.toolbox-content');
    const bubble = document.querySelector('.toolbox-bubble');
    const modes = [...document.querySelectorAll('.toolbox-mode')];
    let activeMode = 'menu';

    const DATA = extractPageData();

    const actions = {
      closer_name: () => ({ action: 'copy', content: DATA.closer.name }),
      closer_phone: () => ({ action: 'copy', content: DATA.closer.phone }),
      event_date: () => ({ action: 'copy', content: DATA.event.dateOriginalFormatted }),

      no_contesta_llamada_1: () => {
        const text = `¡Hola ${DATA.lead.nameForLead}! 👋\n\nSoy ${SETTER.name} del equipo de ${DATA.domain}\n\nTe acabo de llamar para confirmar la cita que has agendado con nosotros, pero parece que no fue un buen momento para ti ☺️\n\nEs esencial que tengamos una breve llamada para *confirmar tu cita* antes de la sesión.\n\nTe volveré a llamar desde este número: ${SETTER.phoneNumber}\n\nPor favor, guarda mi número en tus contactos para identificarme fácilmente. 👌`;
        return { action: 'copy', content: text };
      },
      no_contesta_llamada_1_latam: () => {
        const text = `¡Hola ${DATA.lead.nameForLead}! 👋 Soy ${SETTER.name} del equipo de ${DATA.domain}\n\nTe acabo de llamar para confirmar la cita que has agendado con nosotros, pero me aparece un número de Latinoamérica 😊\n\nEs esencial que podamos saber si te encuentras viviendo en Europa o en algún país de Latinoamérica para que podamos asignarte al departamento correspondiente.\n\nQuedo atento a tu respuesta. ¡Muchas gracias!`;
        return { action: 'copy', content: text };
      },
      no_contesta_llamada_2: () => {
        const text = `Hola ${DATA.lead.nameForLead},\n\nTe he llamado varias veces y no logro contactar contigo. Te llamaba simplemente para comentarte cómo va a ser la llamada *${DATA.event.dateOriginalFormatted}*. Avísame cuando estés disponible y te vuelvo a llamar.`;
        return { action: 'copy', content: text };
      },
      no_contesta_llamada_3: () => {
        const text = `${DATA.lead.nameForLead}, he vuelto a intentar contactarte en varias ocasiones para confirmar tu llamada, pero veo que no hemos podido coincidir, ¿Podrías decirme cuándo podríamos cuadrar para confirmar la llamada?`;
        return { action: 'copy', content: text };
      },
      no_contesta_llamada_4: () => {
        const text = `${DATA.lead.nameForLead}, si finalmente ya no quieres tener la llamada, con un "eres muy simpático ${SETTER.name}, pero ya no me interesa" también me haces feliz 😊`;
        return { action: 'copy', content: text };
      },
      no_contesta_llamada_5: () => {
        const text = `${DATA.lead.nameForLead}, entiendo que puedas estar ocupado, es importante confirmar tu sesión ya que hay otras personas interesadas. ¿Me confirmas que podrás asistir?`;
        return { action: 'copy', content: text };
      },

      no_show_llamada_1: () => {
        const text = `¡Hola ${DATA.lead.nameForLead}! 👋 Soy ${SETTER.name} del equipo de ${DATA.domain}\n\nTe acabo de llamar porque vimos que no pudiste conectarte a la sesión que tenías con ${DATA.closer.name || 'nuestro equipo'}, ${DATA.event.dateOriginalFormatted} y quería saber si tuviste algún problema para conectarte.\n\nTe volveré a llamar para que tengamos una breve llamada y así reagendar tu cita. ¿Te viene bien que te llame hoy o prefieres mañana? 👌`;
        return { action: 'copy', content: text };
      },

      no_contesta_prellamada_1: () => {
        const text = `¡Hola ${DATA.lead.nameForLead}! 👋\n\nSoy ${SETTER.name} del equipo de ${DATA.domain}\n\nTe acabo de llamar para agendar la cita que quedó pendiente con nosotros, pero parece que no fue un buen momento para ti ☺️\n\nEs esencial que tengamos una breve llamada para poder agendar tu sesión.\n\nTe volveré a llamar desde este número: ${SETTER.phoneNumber}`;
        return { action: 'copy', content: text };
      },
      no_contesta_prellamada_2: () => {
        const text = `Hola ${DATA.lead.nameForLead} 😊\n\nTe he llamado de nuevo porque iniciaste el proceso para agendar una llamada con nosotros, pero faltó el último paso para elegir la hora.\n\nTe llamaba simplemente para ayudarte a cuadrar tu cita. Avísame cuando estés disponible y te vuelvo a llamar. 👌`;
        return { action: 'copy', content: text };
      },

      llamada_confirmar_lead: () => {
        const text = `¡Hola ${DATA.lead.nameForLead}!\n\nSoy ${SETTER.name} del equipo de ${DATA.domain}, justo estamos hablando ahora mismo por teléfono 😊\n\nMuy pronto te va a contactar ${DATA.closer.name || 'nuestro equipo'} para enviarte el link de Google Meet, con el siguiente número ${DATA.closer.phone || 'que te proporcionaremos'}\n\n✅ Tu cita está confirmada para *${DATA.event.dateOriginalFormatted}*`;
        return { action: 'copy', content: text };
      },
      llamada_confirmar_closer: () => {
        const text = `Confirmada\n\nFecha de llamada\n${DATA.event.dateOriginal}\nFecha de llamada para el lead\n${DATA.event.dateTimeZone}\nZona Horaria\n${DATA.event.timeZone}\nNombre\n${DATA.lead.nameOriginal}`;
        return { action: 'copy', content: text };
      },

      tool_google_calendar_event: () => {
        const calendarUser = 'confirmaciones@conquerx.com';
        const calendar = 'other';
        const calendarStartDate = formatDateGoogleCalendar(DATA.event.dateOriginal); // YYYYMMDD
        const url = `https://calendar.google.com/calendar/u/${calendarUser}/r/search?who=${DATA.closer.email},${DATA.lead.email}&cal=${calendar}&start=${calendarStartDate}&end=${calendarStartDate}`;
        return { action: 'open', content: url };
      },
      tool_lead_search_phone: () => {
        const url = `https://crm.conquerx.com/es/leads/set/search/?search=${encodeURIComponent(DATA.lead.phone)}`;
        return { action: 'open', content: url };
      },
      tool_lead_search_email: () => {
        const url = `https://crm.conquerx.com/es/leads/set/search/?search=${encodeURIComponent(DATA.lead.email)}`;
        return { action: 'open', content: url };
      },
      tool_reagendar_blocks: () => {
        const url = 'https://calendly.com/d/cssz-46k-f9m/reagendada-conquer-blocks-eu';
        return { action: 'open', content: url };
      },
      tool_reagendar_finance: () => {
        const url = 'https://calendly.com/d/cst9-npz-bnc/reagendada-conquer-finance-eu';
        return { action: 'open', content: url };
      },
      tool_reagendar_languages: () => {
        const url = 'https://calendly.com/d/cwrf-txs-3gs/reagendada-conquer-languages-eu';
        return { action: 'open', content: url };
      },
      tool_prellamada_blocks: () => {
        const url = 'https://calendly.com/d/cvzc-ky2-z8t/conquer-blocks-eu';
        return { action: 'open', content: url };
      },
      tool_prellamada_finance: () => {
        const url = 'https://calendly.com/d/csvf-6th-f3j/conquer-finance-eu';
        return { action: 'open', content: url };
      },
      tool_prellamada_languages: () => {
        const url = 'https://calendly.com/d/cvzp-w7r-yg8/conquer-languages-eu';
        return { action: 'open', content: url };
      },
    };

    const setMode = (mode) => {
      if (mode === activeMode) return;
      activeMode = mode;
      modes.forEach(m => m.classList.toggle('active', m.dataset.mode === mode));
    };
    modes.forEach(m => m.classList.toggle('active', m.dataset.mode === 'menu')); // Initial mode

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
        const fn = key && actions[key];
        if (fn) {
          try {
            const result = fn();
            if (result.action === 'open') {
              window.open(result.content, '_blank');
            } else if (result.action === 'copy') {
              await navigator.clipboard.writeText(result.content);
            }
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