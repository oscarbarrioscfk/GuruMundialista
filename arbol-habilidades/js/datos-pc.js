/*
 * Datos semilla: progresión de aprendizajes de las Guías de Pensamiento Computacional
 * (Colombia Programa · British Council · MinTIC), transcrita del póster
 * "Pensamiento Computacional: Progresión de aprendizajes desde transición hasta 11°".
 *
 * Cada habilidad lleva:
 *   nombre  → texto tal como aparece en el póster
 *   rango   → 0 (N0), 1 (N1), 2 (N2) o null si el póster no indica nivel
 *   clave   → identificador de la habilidad para encadenarla entre guías
 *             (dos habilidades con la misma clave forman una "cadena de mejora")
 *
 * Los ejes (principal y secundarios), las herramientas y los prerrequisitos
 * vienen del grafo del equipo pedagógico (GRAFO_EQUIPO, al final del archivo).
 */
(function () {
  const h = (nombre, rango, clave) => ({ nombre, rango: rango ?? null, clave: clave || null });
  const guia = (codigo, titulo, nivel, rama, habilidades, secundarias) => ({
    id: codigo, codigo, titulo, nivel, rama, tipo: 'guia',
    ramasSecundarias: secundarias || [], habilidades, herramientas: [], prerrequisitos: [], deseables: []
  });
  const proyecto = (codigo, nivel, rama) => ({
    id: codigo, codigo, titulo: 'Evaluación y proyectos', nivel, rama, tipo: 'proyecto',
    ramasSecundarias: [], habilidades: [], herramientas: [], prerrequisitos: [], deseables: []
  });

  window.PROYECTO_PC = {
    version: 1,
    tipo: 'libro',
    titulo: 'Pensamiento Computacional',
    subtitulo: 'Progresión de aprendizajes desde transición hasta 11°',
    autoria: 'Colombia Programa · British Council · MinTIC',
    vocabulario: { nivel: 'Grado', nodo: 'Guía', raiz: 'Pensamiento computacional' },

    niveles: [
      { id: 'T', nombre: 'Transición', corto: 'T' },
      { id: '1', nombre: 'Grado 1°', corto: '1°' },
      { id: '2', nombre: 'Grado 2°', corto: '2°' },
      { id: '3', nombre: 'Grado 3°', corto: '3°' },
      { id: '4', nombre: 'Grado 4°', corto: '4°' },
      { id: '5', nombre: 'Grado 5°', corto: '5°' },
      { id: '6', nombre: 'Grado 6°', corto: '6°' },
      { id: '7', nombre: 'Grado 7°', corto: '7°' },
      { id: '8', nombre: 'Grado 8°', corto: '8°' },
      { id: '9', nombre: 'Grado 9°', corto: '9°' },
      { id: '10', nombre: 'Grado 10°', corto: '10°' },
      { id: '11', nombre: 'Grado 11°', corto: '11°' }
    ],

    /*
     * Categorías: agrupan las ramas y terminan en un perfil, la persona hacia la
     * que crece el árbol. Cada categoría usa una familia de la paleta de las
     * guías: azul periwinkle, lavanda y rosa (en tonos sobrios).
     */
    paleta: 2,
    categorias: [
      { id: 'CON', nombre: 'Conceptos y habilidades en computación', perfil: 'Programador(a)', icono: 'programador', color: '#4F79B8', tinte: '#E4ECF7' },
      { id: 'PRA', nombre: 'Prácticas de resolución de problemas usando la computación', perfil: 'Innovador(a) con la tecnología', icono: 'innovador', color: '#7A4A9E', tinte: '#EFE7F5' },
      { id: 'CIU', nombre: 'Ciudadanía digital', perfil: 'Ciudadano(a) digital', icono: 'ciudadano', color: '#C2506F', tinte: '#FBE8ED' }
    ],

    ramas: [
      { id: 'ALG', categoria: 'CON', nombre: 'Algoritmos, patrones, abstracción y descomposición', corto: 'Algoritmos', color: '#2F5B94', icono: 'algoritmos' },
      { id: 'LOG', categoria: 'CON', nombre: 'Lógica, programación y depuración', corto: 'Programación', color: '#4F79B8', icono: 'programacion' },
      { id: 'DAT', categoria: 'CON', nombre: 'Prácticas de datos', corto: 'Datos', color: '#4D8BBF', icono: 'datos' },
      { id: 'MOD', categoria: 'PRA', nombre: 'Modelación y simulación', corto: 'Modelación', color: '#7A4A9E', icono: 'modelacion' },
      { id: 'FIS', categoria: 'PRA', nombre: 'Computación física', corto: 'Computación física', color: '#8E5FB5', icono: 'fisica' },
      { id: 'IA', categoria: 'PRA', nombre: 'Inteligencia artificial', corto: 'IA', color: '#5C3B7E', icono: 'ia' },
      { id: 'SEG', categoria: 'CIU', nombre: 'Seguridad en el mundo digital', corto: 'Seguridad', color: '#B8456A', icono: 'seguridad' },
      { id: 'EQU', categoria: 'CIU', nombre: 'Equidad en el acceso y la participación en el mundo digital', corto: 'Equidad', color: '#CC5F7D', icono: 'equidad' },
      { id: 'ETI', categoria: 'CIU', nombre: 'Ética y confiabilidad de los datos y la información', corto: 'Ética', color: '#9C3D5E', icono: 'etica' }
    ],

    nodos: [
      // ── Transición ────────────────────────────────────────────────
      guia('T.1', 'Nuestro cuerpo', 'T', 'ALG', [
        h('Seguir instrucciones', null, 'instrucciones'),
        h('Organizar por tamaños', null, 'clasificar'),
        h('Identificar figuras por sus características', null, 'clasificar')
      ]),
      guia('T.2', 'Los animales que me gustan', 'T', 'ALG', [
        h('Identificar patrones', null, 'patrones'),
        h('Comparar cantidades', null, 'conteo'),
        h('Utilizar tablas de una entrada', null, 'tablas')
      ]),
      guia('T.3', 'Un mundo de dinosaurios', 'T', 'ALG', [
        h('Seguir instrucciones', null, 'instrucciones'),
        h('Encontrar similitudes y diferencias', null, 'clasificar'),
        h('Encontrar soluciones a problemas', null, 'algoritmos')
      ]),
      guia('T.4', 'Artistas de formas y colores', 'T', 'ALG', [
        h('Comparar patrones', null, 'patrones'),
        h('Crear secuencias usando características', null, 'secuencias'),
        h('Seguir instrucciones', null, 'instrucciones')
      ]),
      guia('T.5', 'Come galletas', 'T', 'ALG', [
        h('Seguir instrucciones de movimientos con flechas', null, 'instrucciones'),
        h('Desplazarse en un plano', null, 'flechas')
      ]),

      // ── Grado 1° ──────────────────────────────────────────────────
      guia('1.1', 'Vamos a la escuela', '1', 'ALG', [
        h('Identificar pasos en las rutinas diarias', null, 'algoritmos'),
        h('Seguir instrucciones en tarjetas', null, 'instrucciones'),
        h('Usar tarjetas con instrucciones para describir un trayecto', null, 'flechas')
      ]),
      guia('1.2', 'Patrones y pulseras', '1', 'ALG', [
        h('Identificar patrones en secuencias de pasos', null, 'patrones'),
        h('Encontrar la regla en un patrón de datos', null, 'patrones'),
        h('Continuar secuencias con base en dos características', null, 'secuencias')
      ]),
      guia('1.3', 'Una abeja en búsqueda de una flor', '1', 'ALG', [
        h('Realizar desplazamientos siguiendo instrucciones', null, 'instrucciones'),
        h('Usar un lenguaje de flechas que representan instrucciones', null, 'flechas'),
        h('Programar un pequeño robot tipo Bee-bot', null, 'programar-bloques')
      ]),
      guia('1.4', 'Clasifiquemos y contemos', '1', 'DAT', [
        h('Clasificar objetos según características', null, 'clasificar'),
        h('Clasificar en tablas de una y dos entradas', null, 'tablas')
      ]),
      guia('1.5', 'Tecnología digital a mi alrededor', '1', 'SEG', [
        h('Identificar tecnologías digitales con pantallas', null, 'uso-tecnologia'),
        h('Explicar acciones de uso adecuado de estas tecnologías', null, 'uso-tecnologia')
      ]),

      // ── Grado 2° ──────────────────────────────────────────────────
      guia('2.1', 'Vamos a bailar', '2', 'ALG', [
        h('Descomponer una actividad en pasos', null, 'descomposicion'),
        h('Identificar pasos que se repiten', null, 'patrones'),
        h('Encontrar errores en una secuencia de pasos', null, 'depuracion')
      ]),
      guia('2.2', 'Las misiones: nuevos lenguajes', '2', 'ALG', [
        h('Programar en bloques', 0, 'programar-bloques'),
        h('Usar un editor para programar', 0, 'editor'),
        h('ScratchJr', 0, 'scratchjr')
      ]),
      guia('2.3', 'Una fiesta de cumpleaños', '2', 'DAT', [
        h('Construir tablas', null, 'tablas'),
        h('Construir pictogramas', null, 'graficas'),
        h('Construir gráficas', null, 'graficas'),
        h('Usar marcas de conteo', null, 'conteo'),
        h('Interpretar gráficas de barras', null, 'visualizacion')
      ]),
      guia('2.4', 'Animando historias', '2', 'LOG', [
        h('Programar en bloques', 1, 'programar-bloques'),
        h('Corregir un programa', 0, 'depuracion'),
        h('ScratchJr', 1, 'scratchjr')
      ]),
      guia('2.5', 'Las pantallas y yo', '2', 'SEG', [
        h('Reconocer algunos impactos de las pantallas', null, 'uso-tecnologia')
      ]),

      // ── Grado 3° ──────────────────────────────────────────────────
      guia('3.1', 'Un lenguaje para hablar con los computadores', '3', 'ALG', [
        h('Programar en bloques', 1, 'programar-bloques'),
        h('Scratch', 0, 'scratch')
      ]),
      guia('3.2', 'El lado creativo', '3', 'ALG', [
        h('Programar en bloques', 1, 'programar-bloques'),
        h('Usar un editor para programar', 1, 'editor'),
        h('Scratch', 1, 'scratch')
      ]),
      guia('3.3', 'Por las ramas', '3', 'DAT', [
        h('Hacer clasificaciones binarias', null, 'clasificar'),
        h('Organizar según criterios', null, 'clasificar')
      ]),
      guia('3.4', 'Te cuento', '3', 'ALG', [
        h('Programar en bloques', 1, 'programar-bloques'),
        h('Usar un editor para programar', 1, 'editor'),
        h('Scratch: escenarios y animaciones', 1, 'scratch')
      ]),
      guia('3.5', 'Estamos seguros', '3', 'SEG', [
        h('Desarrollar actividades sobre privacidad y seguridad', null, 'ciberseguridad')
      ]),

      // ── Grado 4° ──────────────────────────────────────────────────
      guia('4.1', 'Figuras y mosaicos', '4', 'ALG', [
        h('Scratch', 1, 'scratch'),
        h('Programar secuencias y patrones', null, 'patrones')
      ]),
      guia('4.2', '¡Qué ruido!', '4', 'DAT', [
        h('Entradas y salidas', 0, 'entradas-salidas'),
        h('Uso de sensores del celular', 0, 'sensores'),
        h('Registro de datos', 0, 'registro-datos')
      ]),
      guia('4.3', 'Muchos problemas, una solución', '4', 'ALG', [
        h('Algoritmos', 0, 'algoritmos'),
        h('Scratch: variables y operaciones', 1, 'scratch')
      ]),
      guia('4.4', 'A que te cojo ratón', '4', 'ALG', [
        h('Programar bucles', 0, 'bucles'),
        h('Scratch: bucles y condicionales', 2, 'scratch')
      ]),
      guia('4.5', 'Imágenes reales o realistas', '4', 'SEG', [
        h('Reconocer características de la seguridad de la información personal', null, 'ciberseguridad'),
        h('Reconocer imágenes falsas', null, 'desinformacion')
      ]),

      // ── Grado 5° ──────────────────────────────────────────────────
      guia('5.1', 'Luces-códigos', '5', 'ALG', [
        h('MakeCode · micro:bit', 0, 'microbit')
      ]),
      guia('5.2', 'Salvando tortugas', '5', 'DAT', [
        h('MakeCode · micro:bit', 1, 'microbit'),
        h('Condicionales', 0, 'condicionales'),
        h('Conexión micro:bit', 0, 'pines')
      ]),
      guia('5.3', 'Laberinto', '5', 'ALG', [
        h('MakeCode · micro:bit', 1, 'microbit'),
        h('Condicionales', 1, 'condicionales')
      ]),
      guia('5.4', '"Pescadores de datos"', '5', 'SEG', [
        h('Reflexión sobre ciberseguridad y estrategias de prevención del phishing', null, 'ciberseguridad')
      ]),
      guia('5.5', 'Máquinas que aprenden', '5', 'IA', [
        h('Reconocer características de las máquinas que aprenden', null, 'ia-conceptos')
      ]),
      proyecto('5.6', '5', 'LOG'),

      // ── Grado 6° ──────────────────────────────────────────────────
      guia('6.1', 'Certeza en la incertidumbre', '6', 'ALG', [
        h('MakeCode · micro:bit', 1, 'microbit'),
        h('Condicionales', 1, 'condicionales'),
        h('Variables aleatorias', 0, 'aleatoriedad'),
        h('Bucles', 0, 'bucles')
      ]),
      guia('6.2', '¿Cómo se propagan los virus?', '6', 'LOG', [
        h('Scratch', 1, 'scratch'),
        h('Funciones', 0, 'funciones')
      ]),
      guia('6.3', 'Invernaderos', '6', 'DAT', [
        h('Variables en micro:bit', 0, 'variables'),
        h('Sensores de micro:bit', 0, 'sensores'),
        h('Operaciones entre variables', 0, 'variables'),
        h('Uso de pines', 0, 'pines')
      ]),
      guia('6.4', 'Congélate', '6', 'LOG', [
        h('Condicionales', 1, 'condicionales'),
        h('Lógica booleana', 1, 'logica-booleana')
      ]),
      guia('6.5', 'Entrenando algoritmos', '6', 'IA', [
        h('Identificar características y sesgos en la inteligencia artificial', null, 'ia-sesgos'),
        h('Programar mecanismos básicos de aprendizaje', null, 'ia-conceptos')
      ]),
      proyecto('6.6', '6', 'DAT'),

      // ── Grado 7° ──────────────────────────────────────────────────
      guia('7.1', 'El juego del control', '7', 'LOG', [
        h('Scratch', 1, 'scratch'),
        h('Condicionales', 2, 'condicionales')
      ]),
      guia('7.2', 'Arreglos que ayudan', '7', 'LOG', [
        h('micro:bit: entradas y salidas', 1, 'entradas-salidas'),
        h('Uso de sensores', 1, 'sensores'),
        h('Arreglos', 0, 'arreglos'),
        h('Variables y operaciones', 2, 'variables'),
        h('Depuración', 0, 'depuracion')
      ]),
      guia('7.3', 'Simulaciones azarosas', '7', 'DAT', [
        h('MakeCode', 1, 'microbit'),
        h('Bucles', 1, 'bucles'),
        h('Variables aleatorias', 1, 'aleatoriedad'),
        h('Funciones', 1, 'funciones'),
        h('Radio', 0, 'radio')
      ]),
      guia('7.4', 'Tiempo atmosférico', '7', 'DAT', [
        h('Excel', 0, 'hojas-calculo')
      ]),
      guia('7.5', 'El algoritmo de YouTube', '7', 'IA', [
        h('Concepto de IA', 0, 'ia-conceptos'),
        h('Comprender un poco más la IA', null, 'ia-conceptos'),
        h('Dar un uso responsable de la IA', null, 'ia-etica'),
        h('Desarrollar prácticas de seguridad en internet', null, 'ciberseguridad')
      ]),
      proyecto('7.6', '7', 'EQU'),

      // ── Grado 8° ──────────────────────────────────────────────────
      guia('8.1', 'Helicóptero marciano', '8', 'LOG', [
        h('MakeCode', 1, 'microbit'),
        h('Funciones', 1, 'funciones'),
        h('Arreglos', 1, 'arreglos'),
        h('Condicionales', 1, 'condicionales'),
        h('Estadística básica', 0, 'estadistica')
      ]),
      guia('8.2', 'Llegar más rápido', '8', 'LOG', [
        h('Noción de binario', 0, 'binario'),
        h('Arreglos y grafos', 1, 'arreglos'),
        h('Variables', 1, 'variables'),
        h('Funciones', 1, 'funciones'),
        h('Estadística básica', 0, 'estadistica')
      ]),
      guia('8.3', 'Interactuando con el medio', '8', 'LOG', [
        h('MakeCode', 1, 'microbit'),
        h('micro:bit: entradas/salidas, pines, análogo y digital', 2, 'entradas-salidas'),
        h('Arreglos', 1, 'arreglos'),
        h('Condicionales', 1, 'condicionales')
      ]),
      guia('8.4', 'Experimentando y simulando en ciencias', '8', 'MOD', [
        h('PhET', 1, 'phet'),
        h('Physics Tracker', 0, 'physics-tracker'),
        h('Simulación', 1, 'simulacion')
      ]),
      guia('8.5', 'Asistente virtual', '8', 'IA', [
        h('Arreglos y listas', 1, 'arreglos'),
        h('Operadores booleanos', 1, 'logica-booleana'),
        h('Algoritmos de IA vs. programación', null, 'ia-conceptos'),
        h('Utilidad de la IA', null, 'ia-conceptos'),
        h('Importancia de la diversidad en IA', null, 'ia-etica')
      ]),
      proyecto('8.6', '8', 'ETI'),

      // ── Grado 9° ──────────────────────────────────────────────────
      guia('9.1', 'Programación en la naturaleza', '9', 'FIS', [
        h('MakeCode', 2, 'microbit'),
        h('Radio', 1, 'radio'),
        h('Condicionales y lógica', 1, 'condicionales'),
        h('Computación física', 1, 'computacion-fisica'),
        h('Funciones', 1, 'funciones')
      ]),
      guia('9.2', 'Datos en todas partes', '9', 'DAT', [
        h('Datos', 1, 'registro-datos'),
        h('Visualización', 2, 'visualizacion'),
        h('Sesgos en los datos', 2, 'sesgos-datos')
      ]),
      guia('9.3', 'Modelando y simulando la naturaleza', '9', 'MOD', [
        h('Simuladores en línea', 1, 'simulacion'),
        h('Información en línea', 1, 'informacion-en-linea')
      ]),
      guia('9.4', 'Encuentro con Python', '9', 'LOG', [
        h('Lenguaje Python', 0, 'python'),
        h('Condicionales y bucles en Python', 0, 'bucles'),
        h('Variables en Python', 0, 'variables')
      ]),
      guia('9.5', 'Juegos en Python', '9', 'LOG', [
        h('Python', 1, 'python'),
        h('Algorítmica y programación', 2, 'algoritmos'),
        h('Variables', 2, 'variables')
      ]),
      proyecto('9.6', '9', 'EQU'),

      // ── Grado 10° ─────────────────────────────────────────────────
      guia('10.1', 'Certezas en la incertidumbre', '10', 'DAT', [
        h('Hojas de cálculo (Excel)', 2, 'hojas-calculo'),
        h('Simulación a partir de expresiones matemáticas', null, 'simulacion')
      ]),
      guia('10.2', 'Listas en Python', '10', 'LOG', [
        h('Python', 1, 'python'),
        h('Arreglos', 1, 'arreglos'),
        h('Variables', 1, 'variables')
      ]),
      guia('10.3', 'Desde mi perspectiva', '10', 'ETI', [
        h('Brechas de género', null, 'genero'),
        h('Estereotipos sobre profesiones', null, 'genero'),
        h('Visualización de datos', null, 'visualizacion')
      ]),
      guia('10.4', 'Recolecta de datos', '10', 'DAT', [
        h('Phyphox', 0, 'registro-datos')
      ]),
      guia('10.5', 'Funciones en Python', '10', 'LOG', [
        h('Python', 1, 'python'),
        h('Funciones en Python', 0, 'funciones')
      ]),
      proyecto('10.6', '10', 'EQU'),

      // ── Grado 11° ─────────────────────────────────────────────────
      guia('11.1', 'IA en el día a día', '11', 'IA', [
        h('IA generativa', null, 'ia-conceptos'),
        h('Implicaciones de la IA', null, 'ia-etica'),
        h('Limitaciones de la IA', null, 'ia-conceptos'),
        h('Rol de hombres y mujeres en STEM', null, 'genero')
      ]),
      guia('11.2', 'Los datos del mundo', '11', 'DAT', [
        h('Hojas de cálculo', 2, 'hojas-calculo'),
        h('Identificar limitaciones y sesgos de los datos', null, 'sesgos-datos')
      ]),
      guia('11.3', 'Parqueaderos', '11', 'LOG', [
        h('Python', 1, 'python'),
        h('Tinkercad', 0, 'tinkercad')
      ]),
      guia('11.4', 'Pasar rápido', '11', 'DAT', [
        h('Pines en MakeCode', 2, 'pines'),
        h('Sensores y actuadores', 2, 'sensores'),
        h('Tinkercad', 0, 'tinkercad'),
        h('Realimentación', 0, 'realimentacion')
      ]),
      guia('11.5', 'Científicas(os) en las aulas', '11', 'MOD', [
        h('PhET', 0, 'phet')
      ]),
      proyecto('11.6', '11', 'EQU')
    ],

    trayectorias: [
      {
        id: 'bloques-a-texto', nombre: 'De bloques a texto',
        descripcion: 'Del robot de flechas a Python: la ruta de los lenguajes de programación.',
        nodos: ['1.3', '2.2', '2.4', '3.1', '3.2', '4.4', '6.2', '7.1', '9.4', '9.5', '10.2', '10.5', '11.3']
      },
      {
        id: 'microbit', nombre: 'Creadores con micro:bit',
        descripcion: 'Computación física: de las primeras luces a sensores y actuadores.',
        nodos: ['4.2', '5.1', '5.2', '5.3', '6.1', '6.3', '7.2', '8.3', '9.1', '11.4']
      },
      {
        id: 'datos', nombre: 'Detectives de datos',
        descripcion: 'De clasificar y contar a visualizar y detectar sesgos.',
        nodos: ['T.2', '1.4', '2.3', '3.3', '7.4', '9.2', '10.1', '10.3', '11.2']
      },
      {
        id: 'ia-responsable', nombre: 'IA responsable',
        descripcion: 'Entender, entrenar y usar la inteligencia artificial con criterio.',
        nodos: ['5.5', '6.5', '7.5', '8.5', '11.1']
      }
    ]
  };
  /*
   * Grafo de dependencias del equipo pedagógico (Anexo 1. Grafo guías):
   *   i → guías indispensables · d → guías deseables
   *   r → subcategorías: la primera es el eje principal, las demás secundarios
   *   h → herramienta computacional
   * Es la fuente de verdad para ejes y prerrequisitos; se puede reemplazar
   * importando la hoja de cálculo desde la aplicación.
   */
  const GRAFO_EQUIPO = {
    'T.1': { i: [], d: [], r: ['ALG'], h: [] },
    'T.2': { i: ['T.1'], d: [], r: ['ALG', 'DAT'], h: [] },
    'T.3': { i: ['T.2'], d: [], r: ['ALG', 'LOG'], h: [] },
    'T.4': { i: ['T.3'], d: [], r: ['ALG'], h: [] },
    'T.5': { i: ['T.4'], d: [], r: ['ALG', 'LOG'], h: [] },
    '1.1': { i: [], d: [], r: ['ALG'], h: [] },
    '1.2': { i: ['1.1'], d: [], r: ['ALG'], h: [] },
    '1.3': { i: ['1.2'], d: [], r: ['ALG', 'LOG'], h: [] },
    '1.4': { i: [], d: [], r: ['DAT'], h: [] },
    '1.5': { i: [], d: [], r: ['SEG'], h: [] },
    '2.1': { i: [], d: [], r: ['ALG'], h: [] },
    '2.2': { i: ['2.1'], d: [], r: ['ALG', 'LOG'], h: ['ScratchJr'] },
    '2.3': { i: [], d: ['1.4'], r: ['DAT'], h: [] },
    '2.4': { i: ['2.2'], d: [], r: ['LOG'], h: ['ScratchJr'] },
    '2.5': { i: ['1.5'], d: [], r: ['SEG'], h: [] },
    '3.1': { i: [], d: ['2.2'], r: ['ALG', 'LOG'], h: ['Scratch'] },
    '3.2': { i: ['3.1'], d: [], r: ['ALG', 'LOG'], h: ['Scratch'] },
    '3.3': { i: [], d: ['2.3'], r: ['DAT'], h: [] },
    '3.4': { i: ['3.2'], d: [], r: ['ALG', 'LOG'], h: ['Scratch'] },
    '3.5': { i: [], d: ['2.5'], r: ['SEG', 'ETI'], h: [] },
    '4.1': { i: [], d: ['3.1'], r: ['ALG', 'LOG'], h: ['Scratch'] },
    '4.2': { i: [], d: [], r: ['DAT', 'FIS'], h: [] },
    '4.3': { i: ['4.1'], d: [], r: ['ALG', 'LOG'], h: ['Scratch'] },
    '4.4': { i: ['4.3'], d: [], r: ['ALG', 'LOG'], h: ['Scratch'] },
    '4.5': { i: [], d: ['3.5'], r: ['SEG', 'ETI'], h: [] },
    '5.1': { i: [], d: ['4.3'], r: ['ALG', 'LOG', 'FIS'], h: ['MakeCode', 'micro:bit'] },
    '5.2': { i: ['5.1'], d: [], r: ['DAT', 'LOG', 'FIS'], h: ['MakeCode', 'micro:bit'] },
    '5.3': { i: ['5.2'], d: [], r: ['ALG', 'LOG', 'FIS'], h: ['MakeCode', 'micro:bit'] },
    '5.4': { i: ['4.5'], d: [], r: ['SEG'], h: [] },
    '5.5': { i: [], d: [], r: ['IA', 'EQU'], h: [] },
    '5.6': { i: ['5.5', '5.4', '5.3', '5.2', '5.1'], d: [], r: ['LOG', 'FIS'], h: ['MakeCode', 'micro:bit'] },
    '6.1': { i: ['5.1'], d: ['5.3'], r: ['ALG', 'LOG', 'FIS'], h: ['MakeCode', 'micro:bit'] },
    '6.2': { i: [], d: [], r: ['LOG', 'MOD'], h: ['Scratch'] },
    '6.3': { i: ['6.1'], d: [], r: ['DAT', 'ALG'], h: ['MakeCode', 'micro:bit'] },
    '6.4': { i: ['6.2'], d: [], r: ['LOG', 'MOD'], h: [] },
    '6.5': { i: ['5.5'], d: [], r: ['IA', 'EQU'], h: [] },
    '6.6': { i: ['6.5', '6.4', '6.3', '6.2', '6.1'], d: [], r: ['DAT', 'MOD'], h: ['MakeCode', 'micro:bit'] },
    '7.1': { i: ['6.2', '6.4'], d: [], r: ['LOG'], h: ['Scratch'] },
    '7.2': { i: ['6.3'], d: [], r: ['LOG', 'DAT', 'FIS'], h: ['MakeCode', 'micro:bit'] },
    '7.3': { i: ['7.2'], d: [], r: ['DAT', 'MOD'], h: ['MakeCode', 'micro:bit'] },
    '7.4': { i: [], d: ['4.2'], r: ['DAT'], h: ['Excel'] },
    '7.5': { i: ['6.5'], d: [], r: ['IA', 'ETI', 'SEG'], h: ['Teachable Machine'] },
    '7.6': { i: ['7.5', '7.4', '7.3', '7.2', '7.1'], d: [], r: ['EQU', 'FIS', 'LOG'], h: ['MakeCode', 'micro:bit'] },
    '8.1': { i: ['7.3'], d: ['6.1'], r: ['LOG'], h: ['MakeCode', 'micro:bit'] },
    '8.2': { i: ['8.1'], d: [], r: ['LOG'], h: ['MakeCode', 'micro:bit'] },
    '8.3': { i: ['8.2'], d: [], r: ['LOG', 'DAT'], h: ['MakeCode', 'micro:bit'] },
    '8.4': { i: [], d: [], r: ['MOD'], h: ['Phet'] },
    '8.5': { i: ['7.5'], d: [], r: ['IA', 'EQU', 'LOG'], h: [] },
    '8.6': { i: ['8.5', '8.4', '8.3', '8.2', '8.1'], d: [], r: ['ETI', 'EQU', 'FIS'], h: [] },
    '9.1': { i: ['7.3'], d: ['6.3'], r: ['FIS', 'MOD'], h: ['MakeCode', 'micro:bit'] },
    '9.2': { i: [], d: ['7.4'], r: ['DAT', 'EQU'], h: [] },
    '9.3': { i: ['8.4'], d: [], r: ['MOD'], h: ['Phet'] },
    '9.4': { i: [], d: ['7.1'], r: ['LOG'], h: ['Python'] },
    '9.5': { i: ['9.4'], d: [], r: ['LOG'], h: ['Python'] },
    '9.6': { i: ['9.5', '9.4', '9.3', '9.2', '9.1'], d: [], r: ['EQU', 'LOG'], h: [] },
    '10.1': { i: ['7.4'], d: ['8.4'], r: ['DAT', 'MOD'], h: ['Excel'] },
    '10.2': { i: ['9.4'], d: [], r: ['LOG'], h: ['Python'] },
    '10.3': { i: ['10.1'], d: ['9.6'], r: ['ETI', 'DAT'], h: [] },
    '10.4': { i: ['10.1'], d: [], r: ['DAT', 'LOG'], h: ['Phyphox'] },
    '10.5': { i: ['9.4'], d: [], r: ['LOG'], h: ['Python'] },
    '10.6': { i: ['10.5', '10.4', '10.3', '10.2', '10.1'], d: [], r: ['EQU', 'FIS', 'LOG'], h: ['MakeCode', 'micro:bit'] },
    '11.1': { i: ['7.5'], d: ['6.5', '10.3'], r: ['IA', 'SEG', 'EQU'], h: [] },
    '11.2': { i: ['10.1', '9.4'], d: [], r: ['DAT', 'EQU'], h: ['Excel'] },
    '11.3': { i: ['8.3'], d: ['8.4'], r: ['LOG', 'FIS'], h: ['Python'] },
    '11.4': { i: ['8.3'], d: ['6.3'], r: ['DAT', 'LOG', 'FIS'], h: ['MakeCode', 'micro:bit'] },
    '11.5': { i: [], d: ['8.4'], r: ['MOD', 'DAT'], h: ['Phet'] },
    '11.6': { i: ['11.5', '11.4', '11.3', '11.2', '11.1'], d: [], r: ['EQU'], h: ['MakeCode', 'micro:bit'] }
  };
  window.PROYECTO_PC.nodos.forEach(n => {
    const g = GRAFO_EQUIPO[n.id];
    if (!g) return;
    n.rama = g.r[0];
    n.ramasSecundarias = g.r.slice(1);
    n.prerrequisitos = g.i;
    n.deseables = g.d;
    n.herramientas = g.h;
  });

  /*
   * Progresión por nivel de aprendizaje (independiente del grado).
   * En el pilotaje, los/las docentes eligieron las guías según lo que ya sabían sus
   * estudiantes y no según su grado (la más usada fue la 5.1, la entrada a la
   * micro:bit). Esta segunda forma de leer el árbol ubica cada guía en uno de
   * cinco niveles de profundidad, agrupados en tres momentos: lo básico, la
   * práctica y la apropiación. Se asignó con el grafo del equipo (prerrequisitos
   * indispensables), el nivel de dominio de las habilidades (N0/N1/N2) y lo que
   * hacen los estudiantes en cada guía. El grado queda como referencia.
   */
  window.PROYECTO_PC.aprendizaje = {
    nombre: 'Nivel de aprendizaje',
    descripcion: 'Dónde están tus estudiantes en cada rama, más allá del grado.',
    niveles: [
      { id: 'n1', nombre: '1 · Exploración', corto: '1', bloque: 'Lo básico',
        descripcion: 'Reconocen ideas del pensamiento computacional en su entorno: siguen instrucciones, encuentran patrones, clasifican e identifican tecnologías. No necesitan conocimientos previos.' },
      { id: 'n2', nombre: '2 · Fundamentos', corto: '2', bloque: 'Lo básico',
        descripcion: 'Tienen su primer encuentro guiado con un concepto clave o una herramienta (ScratchJr, Scratch, micro:bit, hojas de cálculo, simuladores): descomponen, crean secuencias y programan lo básico. Aquí están las puertas de entrada a cada herramienta.' },
      { id: 'n3', nombre: '3 · Práctica', corto: '3', bloque: 'Práctica',
        descripcion: 'Usan con autonomía lo que ya conocen y lo combinan: condicionales, bucles, variables, sensores, datos y simulación (habilidades en N1).' },
      { id: 'n4', nombre: '4 · Profundización', corto: '4', bloque: 'Práctica',
        descripcion: 'Dominan conceptos y pasan a herramientas más potentes: arreglos, funciones, pines y sensores, Python y análisis de datos (habilidades en N2), en problemas más abiertos.' },
      { id: 'n5', nombre: '5 · Apropiación', corto: '5', bloque: 'Apropiación',
        descripcion: 'Integran y transfieren lo aprendido: crean soluciones completas, analizan críticamente los datos y la IA, y llevan el pensamiento computacional a otros contextos. Incluye los proyectos integradores.' }
    ]
  };
  const NIVEL_APRENDIZAJE = {
    // Algoritmos, patrones, abstracción y descomposición
    'T.1': ['n1', 'Sigue instrucciones y clasifica por características, sin conocimientos previos.'],
    'T.2': ['n1', 'Reconoce patrones y compara cantidades en situaciones cotidianas.'],
    'T.3': ['n1', 'Sigue instrucciones y compara similitudes y diferencias para resolver un reto sencillo.'],
    '1.1': ['n1', 'Identifica pasos en las rutinas diarias y sigue instrucciones en tarjetas: entrada a los algoritmos.'],
    'T.4': ['n2', 'Pasa de reconocer patrones a crear secuencias propias.'],
    'T.5': ['n2', 'Usa un lenguaje de flechas para dar instrucciones de movimiento: antesala de la programación.'],
    '1.2': ['n2', 'Encuentra la regla de un patrón y continúa secuencias con dos características.'],
    '1.3': ['n2', 'Usa un lenguaje de flechas y programa un robot tipo Bee-bot.'],
    '2.1': ['n2', 'Descompone una actividad en pasos y encuentra errores: fundamentos de la descomposición y la depuración.'],
    '2.2': ['n2', 'Primer encuentro con la programación en bloques (ScratchJr, N0).'],
    '3.1': ['n2', 'Entrada a Scratch: no requiere guías previas; venir de ScratchJr ayuda, pero no es indispensable.'],
    '5.1': ['n2', 'Entrada a la micro:bit y MakeCode (N0): no requiere guías previas. En el pilotaje fue la guía más usada para empezar.'],
    '3.2': ['n3', 'Usa Scratch y su editor con autonomía para crear (N1).'],
    '3.4': ['n3', 'Programa escenarios y animaciones en Scratch para contar historias (N1).'],
    '4.1': ['n3', 'Programa secuencias y patrones en Scratch (N1).'],
    '4.3': ['n3', 'Usa variables y operaciones en Scratch para resolver varios problemas con un mismo algoritmo (N1).'],
    '5.3': ['n3', 'Combina la micro:bit con condicionales (N1).'],
    '6.1': ['n3', 'Usa condicionales, aleatoriedad y bucles en la micro:bit (N1).'],
    '4.4': ['n4', 'Domina bucles y condicionales en Scratch (N2).'],
    // Lógica, programación y depuración
    '2.4': ['n3', 'Programa historias en ScratchJr con autonomía y corrige sus programas (N1).'],
    '6.2': ['n3', 'Aplica Scratch a una simulación e introduce las funciones (N1).'],
    '6.4': ['n3', 'Usa condicionales y lógica booleana (N1).'],
    '9.4': ['n3', 'Entrada a Python: lleva a texto los condicionales, bucles y variables que ya conocen en bloques. Venir de Scratch (7.1) ayuda.'],
    '7.1': ['n4', 'Domina los condicionales en Scratch (N2) y combina lo de 6.2 y 6.4.'],
    '7.2': ['n4', 'Pasa a los arreglos y domina las variables (N2) con entradas, salidas y sensores.'],
    '8.1': ['n4', 'Combina funciones, arreglos y condicionales en MakeCode: conceptos avanzados.'],
    '8.2': ['n4', 'Trabaja arreglos, grafos y funciones, e introduce el sistema binario.'],
    '8.3': ['n4', 'Domina entradas y salidas, y pines analógicos y digitales (N2).'],
    '9.5': ['n4', 'Domina la algorítmica y las variables en Python (N2).'],
    '10.2': ['n4', 'Usa listas (arreglos) en Python (N1).'],
    '10.5': ['n4', 'Define funciones en Python.'],
    '11.3': ['n5', 'Integra Python y Tinkercad para diseñar una solución completa.'],
    // Prácticas de datos
    '1.4': ['n1', 'Clasifica objetos y los organiza en tablas sencillas.'],
    '2.3': ['n2', 'Construye tablas, pictogramas y gráficas, e interpreta gráficas de barras.'],
    '3.3': ['n2', 'Clasifica con criterios y de forma binaria: fundamentos de la organización de datos.'],
    '4.2': ['n2', 'Registra datos por primera vez con los sensores del celular (N0).'],
    '7.4': ['n2', 'Entrada a las hojas de cálculo (N0).'],
    '5.2': ['n3', 'Conecta la micro:bit y la usa con condicionales (N1).'],
    '6.3': ['n3', 'Usa variables, sensores y pines de la micro:bit.'],
    '7.3': ['n4', 'Simula con bucles, aleatoriedad, funciones y radio en MakeCode.'],
    '9.2': ['n4', 'Domina la visualización y analiza sesgos en los datos (N2).'],
    '10.1': ['n4', 'Domina las hojas de cálculo (N2) para simular a partir de expresiones matemáticas.'],
    '10.4': ['n4', 'Recolecta datos con sensores (Phyphox) para analizarlos.'],
    '11.2': ['n5', 'Analiza datos reales de forma crítica: limitaciones y sesgos (N2).'],
    '11.4': ['n5', 'Integra pines, sensores, actuadores y realimentación (N2) en un sistema que responde al entorno.'],
    // Modelación y simulación
    '8.4': ['n2', 'Entrada a los simuladores de ciencias (PhET).'],
    '11.5': ['n2', 'Usa simuladores PhET (N0) para indagar en ciencias.'],
    '9.3': ['n3', 'Modela y simula la naturaleza con simuladores y fuentes en línea (N1).'],
    // Computación física
    '9.1': ['n4', 'Domina MakeCode (N2) y combina radio, condicionales y funciones en computación física.'],
    // Inteligencia artificial
    '5.5': ['n1', 'Reconoce características de las máquinas que aprenden: entrada a la IA.'],
    '6.5': ['n2', 'Programa mecanismos básicos de aprendizaje e identifica sesgos.'],
    '7.5': ['n3', 'Entrena modelos con Teachable Machine y reflexiona sobre su uso responsable.'],
    '8.5': ['n4', 'Compara los algoritmos de IA con la programación, usando arreglos y operadores booleanos.'],
    '11.1': ['n5', 'Analiza críticamente la IA generativa: implicaciones, limitaciones y roles de género.'],
    // Seguridad en el mundo digital
    '1.5': ['n1', 'Reconoce las tecnologías digitales a su alrededor y su uso adecuado.'],
    '2.5': ['n2', 'Reflexiona sobre el impacto de las pantallas en su vida.'],
    '3.5': ['n3', 'Pone en práctica acciones de privacidad y seguridad.'],
    '4.5': ['n3', 'Protege su información personal y reconoce imágenes falsas.'],
    '5.4': ['n4', 'Diseña estrategias para prevenir el phishing.'],
    // Ética y confiabilidad de los datos
    '10.3': ['n5', 'Usa la visualización de datos para analizar brechas de género y estereotipos.']
  };
  const nivelesA = window.PROYECTO_PC.aprendizaje.niveles.map(x => x.id);
  const porIdPC = new Map(window.PROYECTO_PC.nodos.map(n => [n.id, n]));
  window.PROYECTO_PC.nodos.filter(n => n.tipo !== 'proyecto').forEach(n => {
    const a = NIVEL_APRENDIZAJE[n.id];
    if (a) { n.aprendizaje = a[0]; n.motivoAprendizaje = a[1]; }
  });
  // Los proyectos integradores quedan un nivel por encima de lo que integran.
  window.PROYECTO_PC.nodos.filter(n => n.tipo === 'proyecto').forEach(n => {
    const maximo = Math.max(...n.prerrequisitos.map(id => nivelesA.indexOf(porIdPC.get(id)?.aprendizaje)));
    n.aprendizaje = nivelesA[Math.min(nivelesA.length - 1, maximo + 1)];
    n.motivoAprendizaje = `Integra lo trabajado en ${n.prerrequisitos.slice().sort((a, b) => a.localeCompare(b, 'es', { numeric: true })).join(', ')}.`;
  });
})();
