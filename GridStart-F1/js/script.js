'use strict';

const TEMPORADA = 2026;
const API_LOCAL = '/api';
const elementos = {
  heroApiStatus: document.getElementById('heroApiStatus'),
  apiStatusDot: document.getElementById('apiStatusDot'),
  apiStatusText: document.getElementById('apiStatusText'),
  lastUpdated: document.getElementById('lastUpdated'),
  refreshData: document.getElementById('refreshData'),
  statDrivers: document.getElementById('statDrivers'),
  statTeams: document.getElementById('statTeams'),
  statRaces: document.getElementById('statRaces'),
  statLeader: document.getElementById('statLeader'),
  nextRound: document.getElementById('nextRound'),
  nextRaceContent: document.getElementById('nextRaceContent'),
  driverCards: document.getElementById('driverCards'),
  teamCards: document.getElementById('teamCards'),
  raceGrid: document.getElementById('raceGrid'),
  circuitGrid: document.getElementById('circuitGrid'),
  driverRound: document.getElementById('driverRound'),
  calendarCount: document.getElementById('calendarCount'),
  searchPilot: document.getElementById('searchPilot'),
  teamFilter: document.getElementById('teamFilter')
};

let pilotos = [];
let escuderias = [];
let carreras = [];
let filtroCarreras = 'all';
let filtroLecciones = 'all';
let fotosPilotos = {};
let indicePregunta = 0;
let respuestasQuiz = {};

const COLORES_EQUIPO = {
  mercedes: '#00a7a7', ferrari: '#e10600', red_bull: '#263b80', mclaren: '#ff8700',
  aston_martin: '#00665e', alpine: '#1674c8', williams: '#1768b1', haas: '#aeb3bb',
  rb: '#315b9a', racing_bulls: '#315b9a', audi: '#59616b', cadillac: '#9f8758'
};

const LECCIONES = [
  {
    id: 'que-es-f1', category: 'fundamentos', categoryLabel: 'Fundamentos', duration: '5 min', level: 'Principiante',
    title: '¿Qué es la Fórmula 1?', summary: 'La categoría reina del automovilismo: equipos, pilotos, tecnología y un campeonato que se decide punto a punto.',
    intro: 'La Fórmula 1 es el Campeonato Mundial de automovilismo organizado bajo la autoridad de la FIA. Es una competición internacional en la que equipos diseñan y operan monoplazas construidos para competir en circuitos permanentes y urbanos.',
    sections: [
      { title: 'Dos campeonatos al mismo tiempo', text: 'Durante la temporada se disputan dos títulos principales. El Campeonato de Pilotos reconoce al competidor que acumula más puntos; el Campeonato de Constructores suma los resultados de los pilotos de cada equipo. Un piloto puede destacar individualmente, pero cada resultado también ayuda a su escudería.' },
      { title: 'Qué hace especial a la F1', text: 'No se trata únicamente de conducir rápido. El resultado combina habilidad del piloto, diseño aerodinámico, estrategia, gestión de neumáticos y energía, análisis de datos y coordinación de cientos de personas.' }
    ],
    bullets: ['Cada equipo inscribe dos autos titulares en un Gran Premio.', 'Los monoplazas son prototipos de ruedas descubiertas y cabina abierta.', 'La FIA establece y supervisa los reglamentos deportivos y técnicos.'],
    callout: 'Idea clave: en F1, el piloto no compite aislado. El auto, la estrategia y el trabajo del equipo son parte del resultado.'
  },
  {
    id: 'monoplaza', category: 'tecnologia', categoryLabel: 'Tecnología', duration: '7 min', level: 'Principiante',
    title: 'Anatomía de un monoplaza', summary: 'Conoce el chasis, el alerón, el suelo, los frenos, la suspensión y los sistemas que mantienen al auto en pista.',
    intro: 'Un monoplaza es una máquina diseñada alrededor de un objetivo: completar vueltas con el menor tiempo posible y dentro de límites estrictos de seguridad y reglamento. Cada pieza cumple una función y afecta a las demás.',
    sections: [
      { title: 'Chasis y cockpit', text: 'La estructura central es el monocasco de fibra de carbono. Protege al piloto y sirve de base para montar componentes. El cockpit es el espacio donde el piloto se sienta y controla el auto.' },
      { title: 'Alerones y suelo', text: 'Los alerones y el suelo gestionan el flujo de aire para producir carga aerodinámica. Esa carga empuja el auto contra el asfalto y permite tomar curvas a mayor velocidad, aunque normalmente aumenta la resistencia al avance.' },
      { title: 'Frenos, suspensión y volante', text: 'Los frenos trabajan a temperaturas muy altas; la suspensión mantiene el contacto de las ruedas con la pista; y el volante integra controles, pantallas y ajustes que el piloto usa durante la vuelta.' }
    ],
    bullets: ['El monocasco debe superar pruebas de impacto y seguridad.', 'La refrigeración es fundamental para motor, frenos y batería.', 'Los equipos diseñan piezas para equilibrar agarre, velocidad y fiabilidad.'],
    callout: 'La forma exterior de un F1 no es decoración: casi cada superficie está pensada para controlar el aire.'
  },
  {
    id: 'fin-semana', category: 'fin de semana', categoryLabel: 'Fin de semana', duration: '6 min', level: 'Principiante',
    title: 'Cómo funciona un Gran Premio', summary: 'De las prácticas a la bandera a cuadros: así se organiza un fin de semana de carrera.',
    intro: 'Un Gran Premio normalmente ocupa tres días. El programa exacto depende de si el evento usa el formato tradicional o el formato Sprint, pero el objetivo es el mismo: preparar el auto, definir el orden de salida y disputar la carrera.',
    sections: [
      { title: 'Formato tradicional', text: 'Suele incluir tres sesiones de prácticas libres, una clasificación y la carrera. Las prácticas sirven para conocer el circuito, evaluar neumáticos, probar configuraciones y recoger datos. La clasificación determina el orden de salida.' },
      { title: 'Formato Sprint', text: 'En ciertos eventos se utiliza un programa alternativo. Incluye una práctica, clasificación Sprint, carrera Sprint, clasificación del Gran Premio y carrera principal. La Sprint es más corta y también reparte puntos.' },
      { title: 'Domingo: la carrera', text: 'Antes de la salida hay una vuelta de formación. Los autos se colocan en la parrilla y, cuando se apagan las luces rojas, comienza la carrera. Gana quien completa la distancia establecida en el menor tiempo, respetando las reglas.' }
    ],
    bullets: ['Prácticas: preparar el auto y entender el comportamiento de los neumáticos.', 'Clasificación: establecer el orden de salida.', 'Carrera: completar la distancia y gestionar ritmo, tráfico y estrategia.'],
    callout: 'No todos los fines de semana tienen Sprint. Revisa el horario del evento para saber qué formato se utiliza.'
  },
  {
    id: 'clasificacion', category: 'fin de semana', categoryLabel: 'Fin de semana', duration: '5 min', level: 'Principiante',
    title: 'Clasificación: Q1, Q2 y Q3', summary: 'La sesión que define la parrilla de salida y convierte una vuelta rápida en una ventaja estratégica.',
    intro: 'La clasificación ordena a los pilotos para la salida del Gran Premio. Los participantes buscan registrar el mejor tiempo posible en una vuelta, con neumáticos adecuados, pista despejada y una buena preparación.',
    sections: [
      { title: 'Las tres etapas', text: 'La sesión se divide en Q1, Q2 y Q3. En 2026, con 22 autos, seis pilotos quedan eliminados en Q1 y seis más en Q2. Los diez más rápidos disputan Q3, donde se decide la pole position.' },
      { title: 'Pole position', text: 'La pole position es el primer lugar de la parrilla. Puede ser una ventaja porque permite arrancar adelante y evitar parte del tráfico, pero no garantiza la victoria: la salida, el ritmo, las paradas y las circunstancias de carrera siguen siendo decisivos.' },
      { title: 'Por qué importan las vueltas de preparación', text: 'Los neumáticos deben estar en una ventana adecuada de temperatura y presión. También importa dejar espacio suficiente con otros autos para evitar aire sucio y tráfico.' }
    ],
    bullets: ['Q1: participan todos los autos; seis quedan eliminados.', 'Q2: compiten los 16 restantes; otros seis quedan eliminados.', 'Q3: los diez más rápidos luchan por los primeros lugares.'],
    callout: 'Una vuelta de clasificación no consiste solo en acelerar: el piloto debe preparar neumáticos, frenos, batería y espacio en pista.'
  },
  {
    id: 'puntos', category: 'fin de semana', categoryLabel: 'Fin de semana', duration: '4 min', level: 'Principiante',
    title: 'Puntos y campeonatos', summary: 'Cómo se construye una temporada y por qué cada posición puede cambiar la lucha por el título.',
    intro: 'Los puntos convierten cada Gran Premio en parte de una competencia más larga. Los resultados de cada carrera se suman durante el año para definir los campeonatos de Pilotos y Constructores.',
    sections: [
      { title: 'Puntos del Gran Premio', text: 'En una carrera que cumple las condiciones reglamentarias de distancia, los diez primeros reciben 25, 18, 15, 12, 10, 8, 6, 4, 2 y 1 punto, respectivamente. Si la carrera se acorta por una suspensión, pueden aplicarse escalas reducidas según la distancia completada.' },
      { title: 'Puntos de Sprint', text: 'En una Sprint que cumple los requisitos de distancia, los ocho primeros puntúan: 8 para el ganador, después 7, 6, 5, 4, 3, 2 y 1.' },
      { title: 'Dos tablas, dos objetivos', text: 'En el campeonato de Pilotos se suman los puntos de cada piloto. En Constructores se suman los resultados de los dos autos inscritos por cada equipo. La regularidad puede ser tan importante como ganar carreras.' }
    ],
    bullets: ['La victoria de un Gran Premio vale 25 puntos en condiciones normales.', 'La Sprint tiene una escala propia de hasta 8 puntos.', 'La vuelta rápida ya no concede un punto adicional desde 2025.'],
    callout: 'No confundas el campeonato de Pilotos con el de Constructores: un mismo resultado influye en las dos clasificaciones.'
  },
  {
    id: 'neumaticos', category: 'estrategia', categoryLabel: 'Estrategia', duration: '6 min', level: 'Intermedio',
    title: 'Neumáticos: el contacto con la pista', summary: 'Soft, medium, hard, intermedios y lluvia extrema: cada compuesto cambia el ritmo y la estrategia.',
    intro: 'Los neumáticos son el único contacto del auto con el asfalto. Su temperatura, presión, desgaste y nivel de agarre influyen directamente en el tiempo por vuelta. Elegir cuándo utilizarlos puede decidir una carrera.',
    sections: [
      { title: 'Compuestos para seco', text: 'Pirelli selecciona tres compuestos de seco para cada evento a partir de su gama. Se identifican como duro, medio y blando. En términos generales, el blando ofrece más agarre durante menos tiempo, mientras que el duro suele durar más, aunque puede tardar más en alcanzar su temperatura ideal.' },
      { title: 'Lluvia', text: 'El intermedio está pensado para pista húmeda o lluvia ligera. El neumático de lluvia extrema tiene canales más profundos para evacuar más agua cuando la pista está muy mojada.' },
      { title: 'Degradación y graining', text: 'La degradación es la pérdida de rendimiento con el uso. El graining ocurre cuando la superficie se desgasta de forma irregular y se forman pequeñas acumulaciones de goma, reduciendo el agarre. El blistering es un daño térmico que puede crear ampollas en la banda de rodadura.' }
    ],
    bullets: ['Soft: normalmente más agarre y menor duración.', 'Medium: equilibrio entre ritmo y vida útil.', 'Hard: normalmente mayor duración y menor agarre inicial.', 'Intermedio y lluvia extrema: diseñados para condiciones mojadas.'],
    callout: 'La vida útil de un neumático no es fija: cambia según el circuito, temperatura, estilo de conducción y carga del auto.'
  },
  {
    id: 'pit-stop', category: 'estrategia', categoryLabel: 'Estrategia', duration: '6 min', level: 'Intermedio',
    title: 'Pit stops y estrategia', summary: 'Qué ocurre en boxes y cómo los equipos deciden cuándo llamar a un piloto.',
    intro: 'Una parada en boxes permite cambiar neumáticos y realizar ajustes o reparaciones autorizadas. El auto entra al pit lane, se detiene frente a su garaje y el equipo trabaja coordinadamente antes de devolverlo a pista.',
    sections: [
      { title: 'La coordinación', text: 'Un grupo de mecánicos opera las pistolas de rueda, retira y coloca neumáticos, estabiliza el auto y confirma que la parada terminó. La precisión es crucial: una liberación insegura o una rueda mal colocada puede costar tiempo y provocar sanciones.' },
      { title: 'Undercut', text: 'El undercut consiste en detenerse antes que un rival para montar neumáticos más frescos y aprovechar vueltas rápidas mientras el rival sigue en pista. Funciona cuando el neumático nuevo ofrece una ventaja suficiente y el auto sale sin tráfico.' },
      { title: 'Overcut', text: 'El overcut es lo contrario: quedarse más tiempo en pista esperando que el rival pierda tiempo con neumáticos usados, tráfico o una salida de boxes lenta. Puede funcionar si el piloto mantiene ritmo o si el neumático se comporta bien.' }
    ],
    bullets: ['Una parada lenta puede hacer perder varias posiciones.', 'El tráfico al salir de boxes puede anular la ventaja de neumáticos nuevos.', 'El equipo calcula ventanas de parada con simulaciones y datos.'],
    callout: 'La parada más rápida no siempre es la mejor: el momento de entrar a boxes puede importar más que unas décimas de segundo.'
  },
  {
    id: 'estrategia-carrera', category: 'estrategia', categoryLabel: 'Estrategia', duration: '6 min', level: 'Intermedio',
    title: 'Cómo se gana una carrera', summary: 'Ritmo, aire limpio, degradación, tráfico, undercut y neutralizaciones: la estrategia detrás del resultado.',
    intro: 'La estrategia de carrera es el plan para completar la distancia con el mejor tiempo total. Los equipos combinan simulaciones previas con información en tiempo real para decidir ritmo, paradas y reacción ante incidentes.',
    sections: [
      { title: 'Ritmo y gestión', text: 'Un piloto puede administrar neumáticos, frenos, combustible y energía. Ir al máximo en cada vuelta no siempre es lo más rápido si provoca desgaste excesivo o deja al auto sin recursos para atacar después.' },
      { title: 'Aire limpio y tráfico', text: 'Rodar sin autos delante permite aprovechar mejor la aerodinámica. Seguir de cerca a otro monoplaza puede alterar el flujo de aire y aumentar temperaturas. El tráfico también puede hacer que un piloto pierda tiempo detrás de autos más lentos.' },
      { title: 'Safety Car y Virtual Safety Car', text: 'Una neutralización reduce el ritmo y puede cambiar el costo relativo de una parada. Los equipos comparan su posición en pista con el tiempo que ahorrarían al entrar a boxes, sin olvidar que otros rivales pueden tomar decisiones similares.' }
    ],
    bullets: ['Estrategia de una parada: prioriza ahorrar tiempo en boxes.', 'Dos paradas: puede dar más ritmo con neumáticos más frescos.', 'La estrategia depende del circuito, clima, tráfico y degradación.'],
    callout: 'No existe una estrategia perfecta antes de la salida. Los equipos deben adaptarse a lo que ocurre en pista.'
  },
  {
    id: 'aerodinamica', category: 'tecnologia', categoryLabel: 'Tecnología', duration: '7 min', level: 'Intermedio',
    title: 'Aerodinámica, carga y resistencia', summary: 'Por qué el aire puede hacer que un F1 tome curvas con enorme velocidad o pierda rendimiento detrás de otro auto.',
    intro: 'La aerodinámica estudia cómo se mueve el aire alrededor del monoplaza. En F1 se busca generar carga aerodinámica para mejorar el agarre, sin producir tanta resistencia que el auto pierda demasiada velocidad en rectas.',
    sections: [
      { title: 'Carga aerodinámica', text: 'La carga empuja el auto hacia el asfalto y aumenta la fuerza disponible entre neumático y pista. Esto ayuda en curvas rápidas, frenadas y cambios de dirección. La carga no sustituye al agarre mecánico: ambos trabajan juntos.' },
      { title: 'Resistencia al avance', text: 'La resistencia o drag es la fuerza que se opone al movimiento a través del aire. Un auto con mucha carga puede ser rápido en curvas, pero perder velocidad punta si la resistencia es demasiado alta.' },
      { title: 'Aire sucio', text: 'Detrás de un auto se forma una estela turbulenta. El monoplaza que sigue puede perder parte de su carga aerodinámica, especialmente en curvas, y sufrir más con los neumáticos. Por eso adelantar requiere acercarse, preparar la salida de curva y aprovechar una oportunidad.' }
    ],
    bullets: ['Carga aerodinámica: ayuda a generar agarre a alta velocidad.', 'Drag: resistencia aerodinámica que limita la velocidad en rectas.', 'Balance: reparto de carga entre los ejes delantero y trasero.'],
    callout: 'Más carga no siempre significa un auto más rápido: el equipo busca el equilibrio adecuado para cada circuito.'
  },
  {
    id: 'unidad-potencia', category: 'tecnologia', categoryLabel: 'Tecnología', duration: '7 min', level: 'Intermedio',
    title: 'La unidad de potencia híbrida', summary: 'Motor V6 turbo, batería y recuperación de energía: el corazón técnico de un F1 moderno.',
    intro: 'La unidad de potencia combina un motor de combustión interna con sistemas eléctricos de recuperación y despliegue de energía. En 2026 la arquitectura mantiene el V6 turbo de 1.6 litros, pero aumenta la importancia de la parte eléctrica.',
    sections: [
      { title: 'Motor y sistema eléctrico', text: 'El motor de combustión aporta potencia junto con el sistema eléctrico. El MGU-K recupera energía principalmente durante las frenadas y puede desplegar hasta 350 kW. En la reglamentación 2026 desaparece el MGU-H, que antes recuperaba energía de los gases de escape.' },
      { title: 'Batería y recuperación', text: 'La energía eléctrica debe administrarse durante la vuelta. El piloto y el equipo deciden dónde recuperarla y dónde utilizarla, de acuerdo con límites reglamentarios y la configuración del circuito.' },
      { title: 'Por qué importa', text: 'Una buena gestión de energía puede ayudar a acelerar, defender una posición o atacar. Una mala gestión puede dejar al piloto con menos potencia disponible en un punto clave.' }
    ],
    bullets: ['ICE: motor de combustión interna.', 'MGU-K: motor-generador eléctrico conectado al tren de transmisión.', 'ERS: sistema de recuperación de energía.', 'MGU-H: componente retirado de la unidad de potencia 2026.'],
    callout: 'La energía eléctrica no es un botón mágico: el piloto debe planificar su uso a lo largo de la vuelta.'
  },
  {
    id: 'energia-2026', category: 'tecnologia', categoryLabel: 'Tecnología', duration: '6 min', level: 'Intermedio',
    title: 'Active Aero, Boost y Overtake Mode', summary: 'Las herramientas que distinguen a los monoplazas de 2026 y cómo ayudan a gestionar el rendimiento.',
    intro: 'La normativa 2026 cambia la relación entre aerodinámica y energía. En lugar de depender del antiguo DRS, los autos utilizan aerodinámica activa y distintas funciones de gestión eléctrica.',
    sections: [
      { title: 'Active Aero', text: 'Los elementos móviles de los alerones delantero y trasero pueden adoptar configuraciones para recta y curva. Straight Mode reduce la resistencia en zonas habilitadas; Corner Mode utiliza una configuración orientada a producir carga aerodinámica.' },
      { title: 'Overtake Mode', text: 'Es una herramienta de ataque que puede habilitarse cuando el piloto está dentro de un segundo del auto que persigue en el punto de detección establecido. Le permite disponer de un perfil adicional de despliegue eléctrico para intentar adelantar.' },
      { title: 'Boost y Recharge', text: 'Boost permite al piloto solicitar energía eléctrica adicional según las condiciones y límites del reglamento. Recharge se refiere a la recuperación de energía para recargar la batería. Su uso forma parte de la estrategia de cada vuelta.' }
    ],
    bullets: ['Active Aero: cambia la configuración aerodinámica.', 'Overtake Mode: ayuda al piloto que persigue a otro auto bajo condiciones determinadas.', 'Boost: despliegue de energía eléctrica bajo demanda.', 'Recharge: recuperación de energía para la batería.'],
    callout: 'No son cuatro nombres para la misma función: Active Aero modifica la aerodinámica; los otros modos se relacionan con la gestión de energía.'
  },
  {
    id: 'banderas', category: 'seguridad', categoryLabel: 'Seguridad y reglas', duration: '5 min', level: 'Principiante',
    title: 'Banderas y señales de carrera', summary: 'Las señales que indican peligro, cambios de condición, obligación de ceder el paso y final de sesión.',
    intro: 'Las banderas permiten que Dirección de Carrera comunique instrucciones a los pilotos. También se utilizan paneles luminosos y mensajes en el volante, pero el significado de las señales debe conocerse para competir con seguridad.',
    sections: [
      { title: 'Las más comunes', text: 'Amarilla: peligro; reduce la velocidad y no adelantes en el sector afectado. Roja: sesión suspendida. Azul: advierte a un piloto que debe facilitar el paso a un auto más rápido que lo va a doblar. A cuadros: final de la sesión o carrera.' },
      { title: 'Otras señales', text: 'Verde: pista libre o reanudación. Blanca: presencia de un vehículo lento en el sector. Negra con círculo naranja: el auto tiene un problema mecánico potencialmente peligroso y debe entrar a boxes. Negra y blanca diagonal: advertencia por conducta antideportiva.' }
    ],
    bullets: ['Amarilla: peligro y prohibición de adelantar en el sector.', 'Roja: detención de la sesión.', 'Azul: facilitar el paso a un auto que va a doblar.', 'Verde: pista libre.', 'A cuadros: fin de la sesión.'],
    callout: 'Ignorar una bandera puede provocar una sanción y, sobre todo, poner en riesgo a otros pilotos y al personal de pista.'
  },
  {
    id: 'neutralizaciones', category: 'seguridad', categoryLabel: 'Seguridad y reglas', duration: '5 min', level: 'Intermedio',
    title: 'Safety Car y Virtual Safety Car', summary: 'Cómo se neutraliza una carrera cuando hay un accidente, restos en pista o una situación peligrosa.',
    intro: 'Cuando existe un riesgo en pista, Dirección de Carrera puede neutralizar la competición. El objetivo es reducir la velocidad y permitir que los comisarios trabajen con mayor seguridad.',
    sections: [
      { title: 'Safety Car', text: 'El auto de seguridad sale a pista y los competidores deben formar una fila detrás de él. La velocidad baja y normalmente no se permite adelantar, salvo excepciones reglamentarias. Cuando se retira, la carrera se reanuda según el procedimiento indicado.' },
      { title: 'Virtual Safety Car', text: 'Con VSC no sale un auto físico. Los pilotos deben respetar un tiempo mínimo de referencia en cada sector, reduciendo la velocidad de forma controlada. No pueden aprovechar la situación para ganar tiempo de manera indebida.' },
      { title: 'Bandera roja', text: 'Si la situación no permite continuar con seguridad, Dirección de Carrera puede detener la sesión con bandera roja. Los autos siguen el procedimiento de regreso a boxes o a la línea indicada.' }
    ],
    bullets: ['Safety Car: neutralización con un auto de seguridad en pista.', 'VSC: neutralización mediante tiempos mínimos y límites de velocidad.', 'Bandera roja: sesión suspendida.'],
    callout: 'Una neutralización puede cambiar la estrategia porque modifica las diferencias de tiempo entre los autos.'
  },
  {
    id: 'penalizaciones', category: 'seguridad', categoryLabel: 'Seguridad y reglas', duration: '6 min', level: 'Intermedio',
    title: 'Reglas, comisarios y penalizaciones', summary: 'Qué pasa cuando un piloto excede límites, provoca un incidente o incumple un procedimiento.',
    intro: 'Los comisarios deportivos analizan incidentes y aplican el reglamento. Dirección de Carrera y los oficiales de pista también supervisan el desarrollo de las sesiones y la seguridad.',
    sections: [
      { title: 'Investigación de incidentes', text: 'Los comisarios pueden revisar videos, telemetría, comunicaciones y declaraciones. Evalúan factores como la responsabilidad de los pilotos, el control del auto, las circunstancias y los precedentes aplicables.' },
      { title: 'Tipos de sanción', text: 'Entre las sanciones posibles están cinco o diez segundos, drive-through (pasar por el pit lane sin detenerse), stop-and-go, pérdida de posiciones en parrilla, penalizaciones de tiempo y descalificación. La sanción exacta depende de la infracción y del reglamento vigente.' },
      { title: 'Límites de pista', text: 'Los pilotos deben respetar los límites definidos por el circuito. Obtener ventaja duradera al salirse de pista puede ocasionar que se ordene devolver una posición o una penalización.' }
    ],
    bullets: ['Los comisarios revisan cada incidente con la evidencia disponible.', 'Una sanción puede aplicarse durante la carrera o después de ella.', 'La descalificación elimina al competidor de la clasificación del evento.'],
    callout: 'No todo contacto es automáticamente una sanción: los comisarios valoran el incidente de acuerdo con el reglamento y la evidencia.'
  },
  {
    id: 'glosario', category: 'fundamentos', categoryLabel: 'Fundamentos', duration: '5 min', level: 'Principiante',
    title: 'El glosario para ver una carrera', summary: 'Sector, stint, delta, parc fermé, vuelta de formación y otros términos que escucharás en la transmisión.',
    intro: 'La F1 utiliza vocabulario técnico para describir tiempos, procedimientos y rendimiento. Entender las expresiones más frecuentes ayuda a seguir una transmisión y comprender las conversaciones por radio.',
    sections: [
      { title: 'Tiempos y rendimiento', text: 'Sector: una de las partes en que se divide una vuelta para medir tiempos. Delta: diferencia de tiempo respecto a una referencia. Stint: periodo que un piloto pasa en pista con un mismo juego de neumáticos. Out-lap: vuelta de salida de boxes; in-lap: vuelta de entrada a boxes.' },
      { title: 'Procedimientos', text: 'Vuelta de formación: recorrido previo a la salida para preparar neumáticos y frenos. Parc fermé: periodo y condiciones en que los equipos tienen restricciones para modificar el auto. Pit lane: carril de boxes donde se realizan las paradas.' },
      { title: 'Posiciones y conducción', text: 'Pole: primer lugar de salida. DNF: no terminó la carrera. DNS: no tomó la salida. Backmarker: auto que rueda en posiciones retrasadas y puede ser doblado por los líderes. Dirty air: aire turbulento que deja el auto de adelante.' }
    ],
    bullets: ['PB: personal best, mejor tiempo personal.', 'Pace: ritmo de carrera o velocidad sostenida.', 'Gap: distancia de tiempo con otro competidor.', 'DNF: did not finish, no terminó.', 'Parc fermé: régimen de parque cerrado.'],
    callout: 'Cuando escuches “box, box”, el equipo está ordenando al piloto entrar a boxes.'
  }
];

const PREGUNTAS = [
  { q: '¿Qué determina principalmente la clasificación?', options: ['La cantidad de combustible', 'El orden de salida', 'El campeón del año'], correct: 1, explanation: 'La clasificación ordena a los pilotos para la salida del Gran Premio.' },
  { q: '¿Cuántos puntos recibe normalmente el ganador de un Gran Premio?', options: ['18 puntos', '20 puntos', '25 puntos'], correct: 2, explanation: 'En una carrera con puntuación completa, el ganador recibe 25 puntos.' },
  { q: '¿Qué neumático suele ofrecer más agarre inicial en seco?', options: ['Blando (Soft)', 'Duro (Hard)', 'Lluvia extrema'], correct: 0, explanation: 'El compuesto blando suele ofrecer mayor agarre, aunque normalmente dura menos.' },
  { q: '¿Para qué se utiliza el Safety Car?', options: ['Para dar puntos extra', 'Para neutralizar la carrera por seguridad', 'Para definir la pole position'], correct: 1, explanation: 'El Safety Car reduce el ritmo y agrupa a los autos mientras se atiende una situación peligrosa.' },
  { q: '¿Qué hace Overtake Mode en 2026?', options: ['Abre el alerón delantero en boxes', 'Permite usar un despliegue eléctrico extra bajo ciertas condiciones', 'Sustituye los neumáticos'], correct: 1, explanation: 'Overtake Mode ofrece capacidad eléctrica adicional al piloto que persigue a otro auto cuando cumple la condición reglamentaria.' }
];

function crearElemento(etiqueta, clase, texto) {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto !== undefined) nodo.textContent = String(texto);
  return nodo;
}

function mostrarEstado(tipo, mensaje) {
  elementos.apiStatusDot.className = `status-dot ${tipo}`;
  elementos.apiStatusText.textContent = mensaje;
  elementos.heroApiStatus.textContent = tipo === 'online'
    ? 'Datos conectados · temporada 2026'
    : tipo === 'error'
      ? 'No fue posible actualizar los datos'
      : 'Preparando datos de temporada...';
}

async function consultarAPI(ruta) {
  const respuesta = await fetch(`${API_LOCAL}/${ruta}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(16000)
  });
  if (!respuesta.ok) throw new Error(`La consulta ${ruta} respondió con estado ${respuesta.status}.`);
  return respuesta.json();
}

function obtenerPilotos(datos) {
  return datos?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
}
function obtenerEscuderias(datos) {
  return datos?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
}
function obtenerCarreras(datos) {
  return datos?.MRData?.RaceTable?.Races || [];
}
function claseEquipo(id) {
  return `team-${String(id || '').toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
}
function colorEquipo(id) {
  return COLORES_EQUIPO[String(id || '').toLowerCase()] || '#777b84';
}
function formatearFecha(fecha) {
  if (!fecha) return 'Fecha por confirmar';
  const valor = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(valor.getTime())) return 'Fecha por confirmar';
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(valor);
}
function obtenerFechaActual() {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}
function estadoCarrera(carrera) {
  const fecha = new Date(`${carrera.date}T12:00:00`);
  return fecha < obtenerFechaActual() ? 'completed' : 'upcoming';
}

function renderizarProximoGP() {
  if (!carreras.length) return;
  const siguiente = carreras.find(carrera => estadoCarrera(carrera) === 'upcoming');
  const carrera = siguiente || carreras[carreras.length - 1];
  const esUltima = !siguiente;
  elementos.nextRound.textContent = `RONDA ${String(carrera.round || '—').padStart(2, '0')}`;
  elementos.nextRaceContent.replaceChildren();
  const fecha = crearElemento('p', 'race-date-label', esUltima ? 'ÚLTIMA RONDA REGISTRADA' : formatearFecha(carrera.date));
  const titulo = crearElemento('h2', '', carrera.raceName || 'Gran Premio');
  const ubicacion = carrera.Circuit?.Location || {};
  const meta = crearElemento('p', 'race-meta', `${carrera.Circuit?.circuitName || 'Circuito por confirmar'} · ${ubicacion.locality || ''}${ubicacion.country ? `, ${ubicacion.country}` : ''}`);
  elementos.nextRaceContent.append(fecha, titulo, meta);
}

function crearTarjetaPiloto(registro) {
  const piloto = registro.Driver || {};
  const equipo = registro.Constructors?.[0] || {};
  const columna = document.createElement('div');
  const tarjeta = crearElemento('button', 'driver-card', undefined);
  tarjeta.type = 'button';
  tarjeta.dataset.driverIndex = String(pilotos.indexOf(registro));
  tarjeta.setAttribute('aria-label', `Abrir perfil de ${piloto.givenName || ''} ${piloto.familyName || ''}`.trim());

  const visual = crearElemento('div', `driver-visual ${claseEquipo(equipo.constructorId)}`);
  visual.style.background = `linear-gradient(135deg, ${colorEquipo(equipo.constructorId)}, #111318 82%)`;
  if (piloto.url) visual.dataset.wikipediaUrl = piloto.url;
  const posicion = crearElemento('div', 'driver-position');
  posicion.append(crearElemento('span', '', `POSICIÓN ${registro.position || '—'}`), crearElemento('strong', '', equipo.name || 'SIN ESCUDERÍA'));
  const numero = crearElemento('span', 'driver-number', piloto.permanentNumber || piloto.code || 'F1');
  const visualBottom = crearElemento('div', 'driver-visual-bottom');
  visualBottom.append(
    crearElemento('strong', 'driver-visual-name', `${piloto.givenName || ''} ${piloto.familyName || ''}`.trim() || 'Piloto'),
    crearElemento('span', 'driver-team-label', equipo.name || 'F1')
  );
  visual.append(posicion, numero, visualBottom);

  const contenido = crearElemento('div', 'driver-content');
  const main = crearElemento('div', 'driver-content-main');
  main.append(crearElemento('strong', '', piloto.nationality || 'Nacionalidad no disponible'), crearElemento('small', '', piloto.code || 'Temporada 2026'));
  const stats = crearElemento('div', 'driver-card-stats');
  const puntos = crearElemento('span', '', 'PUNTOS');
  puntos.appendChild(crearElemento('strong', '', registro.points ?? '0'));
  const victorias = crearElemento('span', '', 'VICTORIAS');
  victorias.appendChild(crearElemento('strong', '', registro.wins ?? '0'));
  stats.append(puntos, victorias);
  contenido.append(main, stats);
  tarjeta.append(visual, contenido);
  columna.append(tarjeta);
  return columna;
}

function renderizarPilotos(lista = pilotos) {
  elementos.driverCards.replaceChildren();
  if (!lista.length) {
    elementos.driverCards.appendChild(crearElemento('div', 'no-results', 'No encontramos pilotos con esos filtros. Prueba otra búsqueda o escudería.'));
    return;
  }
  const fragmento = document.createDocumentFragment();
  lista.forEach(registro => fragmento.appendChild(crearTarjetaPiloto(registro)));
  elementos.driverCards.appendChild(fragmento);
  aplicarFotosPilotos();
}

function filtrarPilotos() {
  const busqueda = elementos.searchPilot.value.trim().toLocaleLowerCase('es-MX');
  const equipoSeleccionado = elementos.teamFilter.value;
  const filtrados = pilotos.filter(registro => {
    const piloto = registro.Driver || {};
    const equipo = registro.Constructors?.[0] || {};
    const texto = `${piloto.givenName || ''} ${piloto.familyName || ''} ${piloto.nationality || ''} ${piloto.code || ''} ${equipo.name || ''}`.toLocaleLowerCase('es-MX');
    const coincideTexto = texto.includes(busqueda);
    const coincideEquipo = equipoSeleccionado === 'all' || equipo.constructorId === equipoSeleccionado;
    return coincideTexto && coincideEquipo;
  });
  renderizarPilotos(filtrados);
}

function poblarFiltroEquipos() {
  const opcionTodas = elementos.teamFilter.querySelector('option[value="all"]');
  elementos.teamFilter.replaceChildren(opcionTodas);
  escuderias.forEach(registro => {
    const equipo = registro.Constructor || {};
    const opcion = crearElemento('option', '', equipo.name || 'Escudería');
    opcion.value = equipo.constructorId || '';
    elementos.teamFilter.appendChild(opcion);
  });
}

function abrirPerfilPiloto(registro) {
  if (!registro) return;
  const piloto = registro.Driver || {};
  const equipo = registro.Constructors?.[0] || {};
  document.getElementById('driverModalTitle').textContent = `${piloto.givenName || ''} ${piloto.familyName || ''}`.trim() || 'Piloto';
  document.getElementById('profileMeta').textContent = `${piloto.nationality || 'Nacionalidad no disponible'}${equipo.name ? ` · ${equipo.name}` : ''}`;
  document.getElementById('profilePosition').textContent = `P${registro.position || '—'}`;
  document.getElementById('profilePoints').textContent = registro.points ?? '0';
  document.getElementById('profileWins').textContent = registro.wins ?? '0';
  document.getElementById('profileNumber').textContent = piloto.permanentNumber || piloto.code || 'F1';
  document.getElementById('profileRaceNumber').textContent = piloto.permanentNumber || '—';
  document.getElementById('profileTeamMark').textContent = equipo.name || 'GRIDSTART F1';
  document.getElementById('profileDob').textContent = piloto.dateOfBirth ? `Fecha de nacimiento: ${formatearFecha(piloto.dateOfBirth)}` : 'Estadísticas correspondientes a la temporada 2026.';
  const link = document.getElementById('profileWiki');
  if (piloto.url && /^https?:\/\/en\.wikipedia\.org\//i.test(piloto.url)) {
    link.href = piloto.url;
    link.classList.remove('d-none');
  } else {
    link.removeAttribute('href');
    link.classList.add('d-none');
  }
  const visual = document.getElementById('profileVisual');
  visual.style.background = `linear-gradient(145deg, ${colorEquipo(equipo.constructorId)}, #111318 80%)`;
  const oldPhoto = visual.querySelector('img');
  if (oldPhoto) oldPhoto.remove();
  const photoUrl = fotosPilotos[piloto.url];
  if (photoUrl) {
    const imagen = document.createElement('img');
    imagen.src = photoUrl;
    imagen.alt = `Fotografía de ${piloto.givenName || ''} ${piloto.familyName || ''}`.trim();
    imagen.onerror = () => imagen.remove();
    visual.prepend(imagen);
  }
  const dialog = document.getElementById('driverModal');
  if (!dialog.open) dialog.showModal();
}

async function aplicarFotosPilotos() {
  const visibles = [...document.querySelectorAll('.driver-visual[data-wikipedia-url]')];
  if (!visibles.length) return;
  const urls = [...new Set(visibles.map(nodo => nodo.dataset.wikipediaUrl).filter(Boolean))];
  const faltantes = urls.filter(url => !(url in fotosPilotos));
  if (faltantes.length) {
    try {
      const respuesta = await fetch(`${API_LOCAL}/driver-photos?urls=${encodeURIComponent(faltantes.join('|'))}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(12000) });
      if (respuesta.ok) {
        const datos = await respuesta.json();
        fotosPilotos = { ...fotosPilotos, ...(datos.photos || {}) };
        faltantes.forEach(url => { if (!(url in fotosPilotos)) fotosPilotos[url] = null; });
      }
    } catch (error) {
      console.info('Las fotografías externas no están disponibles; se muestran las fichas gráficas.', error);
      faltantes.forEach(url => { fotosPilotos[url] = null; });
    }
  }
  visibles.forEach(visual => {
    const url = visual.dataset.wikipediaUrl;
    const foto = fotosPilotos[url];
    if (!foto || visual.querySelector('img')) return;
    const imagen = document.createElement('img');
    imagen.className = 'driver-portrait';
    imagen.src = foto;
    imagen.alt = '';
    imagen.loading = 'lazy';
    imagen.decoding = 'async';
    imagen.onerror = () => imagen.remove();
    visual.prepend(imagen);
  });
}

function renderizarEscuderias() {
  elementos.teamCards.replaceChildren();
  if (!escuderias.length) return;
  const maxPuntos = Math.max(...escuderias.map(item => Number(item.points) || 0), 1);
  const fragmento = document.createDocumentFragment();
  escuderias.forEach(registro => {
    const equipo = registro.Constructor || {};
    const card = crearElemento('article', 'team-card');
    card.style.setProperty('--team-color', colorEquipo(equipo.constructorId));
    const top = crearElemento('div', 'team-card-top');
    top.append(crearElemento('h3', '', equipo.name || 'Escudería'), crearElemento('span', 'team-position', `P${registro.position || '—'}`));
    const pais = crearElemento('p', 'team-nationality', equipo.nationality || 'Nacionalidad no disponible');
    const row = crearElemento('div', 'team-points-row');
    const points = crearElemento('strong', 'team-points', registro.points ?? '0');
    points.appendChild(crearElemento('small', '', 'PTS'));
    row.append(points, crearElemento('span', 'team-wins', `${registro.wins ?? '0'} victorias`));
    const progress = crearElemento('div', 'team-progress');
    progress.setAttribute('aria-label', `Puntos relativos de ${equipo.name || 'escudería'}`);
    const fill = crearElemento('span');
    fill.style.width = `${Math.max(0, Math.min(100, ((Number(registro.points) || 0) / maxPuntos) * 100))}%`;
    progress.appendChild(fill);
    card.append(top, pais, row, progress);
    fragmento.appendChild(card);
  });
  elementos.teamCards.appendChild(fragmento);
}

function renderizarCalendario() {
  elementos.raceGrid.replaceChildren();
  const filtradas = carreras.filter(carrera => filtroCarreras === 'all' || estadoCarrera(carrera) === filtroCarreras);
  elementos.calendarCount.textContent = `${filtradas.length} de ${carreras.length} rondas · Temporada ${TEMPORADA}`;
  if (!filtradas.length) {
    elementos.raceGrid.appendChild(crearElemento('div', 'no-results', 'No hay carreras para este filtro.'));
    return;
  }
  const proxima = carreras.find(carrera => estadoCarrera(carrera) === 'upcoming');
  const fragmento = document.createDocumentFragment();
  filtradas.forEach(carrera => {
    const estado = estadoCarrera(carrera);
    const esSiguiente = proxima && String(proxima.round) === String(carrera.round);
    const ubicacion = carrera.Circuit?.Location || {};
    const card = crearElemento('article', `race-card ${esSiguiente ? 'is-next' : ''}`);
    const top = crearElemento('div', 'race-top');
    top.append(
      crearElemento('span', 'race-round', `RONDA ${String(carrera.round || '—').padStart(2, '0')}`),
      crearElemento('span', `race-status ${estado === 'completed' ? 'done' : esSiguiente ? 'next' : ''}`, estado === 'completed' ? 'Finalizada' : esSiguiente ? 'Siguiente' : 'Pendiente')
    );
    card.append(
      top,
      crearElemento('h3', '', carrera.raceName || 'Gran Premio'),
      crearElemento('p', 'race-location', `${ubicacion.locality || ''}${ubicacion.country ? `, ${ubicacion.country}` : ''}`),
      crearElemento('p', 'race-date', formatearFecha(carrera.date)),
      crearElemento('p', 'race-circuit', carrera.Circuit?.circuitName || 'Circuito por confirmar')
    );
    fragmento.appendChild(card);
  });
  elementos.raceGrid.appendChild(fragmento);
}

function renderizarCircuitos() {
  elementos.circuitGrid.replaceChildren();
  const fragmento = document.createDocumentFragment();
  carreras.forEach(carrera => {
    const circuito = carrera.Circuit || {};
    const ubicacion = circuito.Location || {};
    const card = crearElemento('article', 'circuit-card');
    const top = crearElemento('div', 'circuit-top');
    top.append(crearElemento('span', '', `RONDA ${String(carrera.round || '—').padStart(2, '0')}`), crearElemento('span', 'circuit-code', (ubicacion.country || 'F1').slice(0, 2).toUpperCase()));
    const nombre = crearElemento('h4', '', circuito.circuitName || 'Circuito');
    const lugar = crearElemento('p', '', `${ubicacion.locality || 'Ubicación pendiente'}, ${ubicacion.country || ''}`);
    const enlace = crearElemento('a', '', 'Explorar ubicación ↗');
    const query = encodeURIComponent(`${circuito.circuitName || 'Formula 1 circuit'} ${ubicacion.locality || ''} ${ubicacion.country || ''}`);
    enlace.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
    enlace.target = '_blank'; enlace.rel = 'noopener';
    card.append(top, nombre, lugar, enlace);
    fragmento.appendChild(card);
  });
  elementos.circuitGrid.appendChild(fragmento);
}

function mostrarError(id, mensaje) {
  const caja = document.getElementById(id);
  caja.textContent = mensaje;
  caja.classList.remove('d-none');
}

async function cargarDatos() {
  elementos.refreshData.disabled = true;
  elementos.refreshData.textContent = 'Actualizando…';
  mostrarEstado('loading', 'Consultando datos de pilotos, escuderías y carreras...');
  document.getElementById('driversLoading').classList.remove('d-none');
  document.getElementById('teamsLoading').classList.remove('d-none');
  const resultados = await Promise.allSettled([
    consultarAPI('standings/drivers'),
    consultarAPI('standings/constructors'),
    consultarAPI('calendar')
  ]);
  let exitos = 0;
  const [resultadoPilotos, resultadoEquipos, resultadoCarreras] = resultados;

  if (resultadoPilotos.status === 'fulfilled') {
    pilotos = obtenerPilotos(resultadoPilotos.value);
    renderizarPilotos();
    poblarFiltroEquipos();
    document.getElementById('driversLoading').classList.add('d-none');
    document.getElementById('driversError').classList.add('d-none');
    elementos.statDrivers.textContent = pilotos.length;
    const ronda = resultadoPilotos.value?.MRData?.StandingsTable?.round;
    elementos.driverRound.textContent = ronda ? `Después de la ronda ${ronda}` : 'Última clasificación disponible';
    elementos.statLeader.textContent = pilotos[0]?.Driver?.familyName || '—';
    exitos++;
  } else {
    document.getElementById('driversLoading').classList.add('d-none');
    mostrarError('driversError', 'No fue posible cargar la clasificación de pilotos. Comprueba la conexión y actualiza los datos.');
  }

  if (resultadoEquipos.status === 'fulfilled') {
    escuderias = obtenerEscuderias(resultadoEquipos.value);
    renderizarEscuderias();
    poblarFiltroEquipos();
    document.getElementById('teamsLoading').classList.add('d-none');
    document.getElementById('teamsError').classList.add('d-none');
    elementos.statTeams.textContent = escuderias.length;
    exitos++;
  } else {
    document.getElementById('teamsLoading').classList.add('d-none');
    mostrarError('teamsError', 'No fue posible cargar el campeonato de constructores. Intenta actualizar más tarde.');
  }

  if (resultadoCarreras.status === 'fulfilled') {
    carreras = obtenerCarreras(resultadoCarreras.value).sort((a, b) => Number(a.round) - Number(b.round));
    renderizarCalendario();
    renderizarCircuitos();
    renderizarProximoGP();
    elementos.statRaces.textContent = carreras.length;
    document.getElementById('racesError').classList.add('d-none');
    exitos++;
  } else {
    mostrarError('racesError', 'No fue posible cargar el calendario. Consulta el calendario oficial de Fórmula 1.');
  }

  if (exitos === 3) mostrarEstado('online', 'Conectado · clasificación, constructores y calendario actualizados.');
  else if (exitos > 0) mostrarEstado('error', `Se completaron ${exitos} de 3 consultas. Algunos datos no están disponibles.`);
  else mostrarEstado('error', 'No fue posible conectar con Jolpica. La guía de aprendizaje sigue disponible.');

  elementos.lastUpdated.textContent = `Fuente: Jolpica F1 API · ${new Date().toLocaleString('es-MX')}`;
  elementos.refreshData.disabled = false;
  elementos.refreshData.textContent = 'Actualizar ↻';
}

function renderizarLecciones(lista = LECCIONES) {
  document.getElementById('lessonTotal').textContent = LECCIONES.length;
  const grid = document.getElementById('lessonGrid');
  const empty = document.getElementById('lessonEmpty');
  grid.replaceChildren();
  if (!lista.length) {
    empty.classList.remove('d-none');
    return;
  }
  empty.classList.add('d-none');
  const fragmento = document.createDocumentFragment();
  lista.forEach((leccion, indice) => {
    const card = crearElemento('button', 'lesson-card');
    card.type = 'button';
    card.dataset.lessonId = leccion.id;
    card.setAttribute('aria-label', `Leer: ${leccion.title}`);
    const top = crearElemento('div', 'lesson-card-top');
    top.append(crearElemento('span', 'lesson-category', leccion.categoryLabel), crearElemento('span', 'lesson-duration', leccion.duration));
    const title = crearElemento('h4', '', leccion.title);
    const summary = crearElemento('p', '', leccion.summary);
    const bottom = crearElemento('div', 'lesson-card-bottom');
    bottom.append(crearElemento('span', '', `${leccion.level} · LECCIÓN ${String(LECCIONES.indexOf(leccion) + 1).padStart(2, '0')}`), crearElemento('b', '', '↗'));
    card.append(top, title, summary, bottom);
    fragmento.appendChild(card);
  });
  grid.appendChild(fragmento);
}

function filtrarLecciones() {
  const busqueda = document.getElementById('lessonSearch').value.trim().toLocaleLowerCase('es-MX');
  const lista = LECCIONES.filter(leccion => {
    const coincideCategoria = filtroLecciones === 'all' || leccion.category === filtroLecciones;
    const texto = `${leccion.title} ${leccion.summary} ${leccion.categoryLabel}`.toLocaleLowerCase('es-MX');
    return coincideCategoria && texto.includes(busqueda);
  });
  renderizarLecciones(lista);
}

function abrirLeccion(leccion) {
  if (!leccion) return;
  document.getElementById('lessonModalCategory').textContent = `GRIDSTART ACADEMY · ${leccion.categoryLabel.toUpperCase()}`;
  document.getElementById('lessonModalTitle').textContent = leccion.title;
  document.getElementById('lessonModalMeta').textContent = `${leccion.level} · ${leccion.duration} de lectura`;
  const body = document.getElementById('lessonModalBody');
  body.replaceChildren();
  body.appendChild(crearElemento('p', '', leccion.intro));
  leccion.sections.forEach(seccion => {
    body.appendChild(crearElemento('h3', '', seccion.title));
    body.appendChild(crearElemento('p', '', seccion.text));
  });
  if (leccion.bullets?.length) {
    body.appendChild(crearElemento('h3', '', 'Lo esencial para recordar'));
    const lista = document.createElement('ul');
    leccion.bullets.forEach(item => lista.appendChild(crearElemento('li', '', item)));
    body.appendChild(lista);
  }
  if (leccion.callout) body.appendChild(crearElemento('div', 'lesson-callout', leccion.callout));
  const dialog = document.getElementById('lessonModal');
  if (!dialog.open) dialog.showModal();
}

function renderizarQuiz() {
  const content = document.getElementById('quizContent');
  content.replaceChildren();
  PREGUNTAS.forEach((pregunta, indice) => {
    const bloque = crearElemento('section', 'quiz-question');
    const titulo = crearElemento('h4', '', `${indice + 1}. ${pregunta.q}`);
    const opciones = crearElemento('div', 'quiz-options');
    pregunta.options.forEach((opcion, opcionIndice) => {
      const boton = crearElemento('button', `quiz-option ${respuestasQuiz[indice] === opcionIndice ? 'selected' : ''}`, opcion);
      boton.type = 'button';
      boton.dataset.question = String(indice);
      boton.dataset.option = String(opcionIndice);
      boton.setAttribute('aria-pressed', respuestasQuiz[indice] === opcionIndice ? 'true' : 'false');
      opciones.appendChild(boton);
    });
    bloque.append(titulo, opciones);
    content.appendChild(bloque);
  });
  const acciones = crearElemento('div', 'quiz-actions');
  const feedback = crearElemento('span', 'quiz-feedback', `${Object.keys(respuestasQuiz).length} de ${PREGUNTAS.length} respuestas seleccionadas`);
  const submit = crearElemento('button', 'quiz-submit', 'Comprobar respuestas');
  submit.type = 'button';
  submit.id = 'submitQuiz';
  acciones.append(feedback, submit);
  content.appendChild(acciones);
}

function comprobarQuiz() {
  if (Object.keys(respuestasQuiz).length < PREGUNTAS.length) {
    document.getElementById('quizResult').textContent = 'Responde las cinco preguntas para comprobar tu resultado.';
    document.getElementById('quizResult').classList.remove('d-none');
    return;
  }
  let aciertos = 0;
  PREGUNTAS.forEach((pregunta, indice) => { if (respuestasQuiz[indice] === pregunta.correct) aciertos++; });
  const resultado = document.getElementById('quizResult');
  resultado.textContent = `Resultado: ${aciertos} de ${PREGUNTAS.length}. ${aciertos === 5 ? '¡Excelente! Dominas los conceptos básicos.' : aciertos >= 3 ? '¡Buen trabajo! Ya tienes una buena base. Repasa las explicaciones y vuelve a intentarlo.' : 'Buen comienzo. Vuelve a las lecciones y prueba otra vez.'}`;
  resultado.classList.remove('d-none');
  document.querySelectorAll('.quiz-option').forEach(boton => {
    const q = Number(boton.dataset.question);
    const option = Number(boton.dataset.option);
    if (PREGUNTAS[q].correct === option) boton.classList.add('correct');
    else if (respuestasQuiz[q] === option) boton.classList.add('incorrect');
    boton.disabled = true;
  });
  const explanations = PREGUNTAS.map((pregunta, i) => `${i + 1}. ${pregunta.explanation}`).join(' ');
  resultado.appendChild(crearElemento('p', 'mt-2 mb-0', explanations));
  const acciones = document.querySelector('.quiz-actions');
  const repetir = crearElemento('button', 'quiz-submit', 'Intentar de nuevo');
  repetir.type = 'button';
  repetir.addEventListener('click', () => {
    respuestasQuiz = {};
    resultado.classList.add('d-none');
    resultado.replaceChildren();
    renderizarQuiz();
  });
  acciones.appendChild(repetir);
}

elementos.searchPilot.addEventListener('input', filtrarPilotos);
elementos.teamFilter.addEventListener('change', filtrarPilotos);
elementos.driverCards.addEventListener('click', event => {
  const card = event.target.closest('[data-driver-index]');
  if (!card) return;
  abrirPerfilPiloto(pilotos[Number(card.dataset.driverIndex)]);
});
document.querySelectorAll('[data-race-filter]').forEach(boton => {
  boton.addEventListener('click', () => {
    filtroCarreras = boton.dataset.raceFilter;
    document.querySelectorAll('[data-race-filter]').forEach(item => item.classList.toggle('active', item === boton));
    renderizarCalendario();
  });
});
document.querySelectorAll('[data-lesson-filter]').forEach(boton => {
  boton.addEventListener('click', () => {
    filtroLecciones = boton.dataset.lessonFilter;
    document.querySelectorAll('[data-lesson-filter]').forEach(item => item.classList.toggle('active', item === boton));
    filtrarLecciones();
  });
});
document.getElementById('lessonSearch').addEventListener('input', filtrarLecciones);
document.getElementById('lessonGrid').addEventListener('click', event => {
  const card = event.target.closest('[data-lesson-id]');
  if (!card) return;
  abrirLeccion(LECCIONES.find(leccion => leccion.id === card.dataset.lessonId));
});
document.getElementById('quizContent').addEventListener('click', event => {
  const opcion = event.target.closest('[data-question][data-option]');
  if (opcion) {
    respuestasQuiz[Number(opcion.dataset.question)] = Number(opcion.dataset.option);
    document.getElementById('quizResult').classList.add('d-none');
    renderizarQuiz();
    return;
  }
  if (event.target.closest('#submitQuiz')) comprobarQuiz();
});
elementos.refreshData.addEventListener('click', cargarDatos);

const menuToggle = document.querySelector('.navbar-toggler');
const menuPrincipal = document.getElementById('menuPrincipal');
menuToggle.addEventListener('click', () => {
  const abierto = menuPrincipal.classList.toggle('show');
  menuToggle.setAttribute('aria-expanded', String(abierto));
});
document.querySelectorAll('#menuPrincipal a').forEach(enlace => enlace.addEventListener('click', () => {
  menuPrincipal.classList.remove('show');
  menuToggle.setAttribute('aria-expanded', 'false');
}));
document.querySelectorAll('[data-close-dialog]').forEach(boton => boton.addEventListener('click', () => {
  document.getElementById(boton.dataset.closeDialog)?.close();
}));
document.querySelectorAll('dialog.site-dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
}));

renderizarLecciones();
renderizarQuiz();
cargarDatos().catch(error => {
  console.error('Error al cargar GridStart F1:', error);
  mostrarEstado('error', 'No fue posible iniciar la carga de datos.');
  elementos.refreshData.disabled = false;
  elementos.refreshData.textContent = 'Actualizar ↻';
});
