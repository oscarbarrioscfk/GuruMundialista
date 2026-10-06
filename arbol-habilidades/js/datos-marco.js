/*
 * Datos semilla: Marco de Calidad para la enseñanza del pensamiento computacional
 * en las instituciones educativas colombianas (MinTIC · British Council ·
 * Universidad del Norte, julio 2025), leído junto con los criterios de
 * clasificación del Monitoreo y Evaluación de Colombia Programa 2024-2026.
 *
 * Árbol de habilidades institucionales:
 *   niveles  → los 8 niveles del marco (1A … 5), agrupados en sus 4 bloques
 *   ramas    → las 8 dimensiones; cada una es su propia categoría y termina
 *              en el perfil que describe su nivel 5
 *   etapas   → una por dimensión y nivel; el código es «nivel.dimensión»
 *              (3B.2 = nivel 3B de Plan de área)
 *     descripcion → texto del marco para ese nivel
 *     habilidades → criterios observables (los que mide M&E); la misma clave
 *                   en varios niveles forma la cadena de mejora del criterio
 *     avance      → qué tiene que cambiar para pasar al nivel siguiente
 *   prerrequisitos → el nivel anterior de la misma dimensión
 *   deseables      → apoyos entre dimensiones (p. ej. la formación docente
 *                    sostiene la reducción del impacto de la rotación)
 */
(function () {
  const h = (nombre, clave) => ({ nombre, rango: null, clave });
  const etapa = (codigo, rama, titulo, descripcion, habilidades, avance, previa, deseables) => ({
    id: codigo, codigo, titulo, nivel: codigo.split('.')[0], rama, tipo: 'guia',
    descripcion, avance: avance || '', ramasSecundarias: [], habilidades, herramientas: [],
    prerrequisitos: previa ? [previa] : [], deseables: deseables || []
  });

  window.PROYECTO_MARCO = {
    version: 1,
    tipo: 'libro',
    titulo: 'Marco de Calidad · Pensamiento Computacional',
    subtitulo: 'Árbol de habilidades institucionales: de emergente a consolidado en las 8 dimensiones del marco',
    autoria: 'Colombia Programa · MinTIC · British Council · Universidad del Norte',
    vocabulario: { nivel: 'Nivel', nodo: 'Etapa', raiz: 'Institución educativa', rama: 'una dimensión del marco', habilidad: 'Criterio', modo: 'Autoevaluación' },
    niveles: [
      { id: '1A', nombre: '1A · Emergente', corto: '1A', bloque: 'Emergente' },
      { id: '1B', nombre: '1B · Emergente', corto: '1B', bloque: 'Emergente' },
      { id: '2A', nombre: '2A · En progreso inicial', corto: '2A', bloque: 'En progreso inicial' },
      { id: '2B', nombre: '2B · En progreso inicial', corto: '2B', bloque: 'En progreso inicial' },
      { id: '3A', nombre: '3A · En consolidación', corto: '3A', bloque: 'En consolidación' },
      { id: '3B', nombre: '3B · En consolidación', corto: '3B', bloque: 'En consolidación' },
      { id: '4', nombre: '4 · Consolidado', corto: '4', bloque: 'Consolidado' },
      { id: '5', nombre: '5 · Consolidado', corto: '5', bloque: 'Consolidado' }
    ],
    categorias: [
      { id: 'D1', nombre: "1. Liderazgo y visión", perfil: "Directivos docentes activos en el fomento del pensamiento computacional", icono: 'directivo', color: '#2F5B94', tinte: '#E1E9F4' },
      { id: 'D2', nombre: "2. Plan de área", perfil: "Docentes de todas las áreas que tejen el PC de transición a 11°", icono: 'plan', color: '#4D8BBF', tinte: '#E3EFF8' },
      { id: 'D3', nombre: "3. Enseñanza, aprendizaje y evaluación", perfil: "Docentes que enseñan, evalúan y comparten el PC con maestría", icono: 'docente', color: '#5E6FB8', tinte: '#E7E9F6' },
      { id: 'D4', nombre: "4. Desarrollo profesional del personal docente", perfil: "Pares expertos(as) que forman y acompañan a docentes de la región", icono: 'mentor', color: '#7A4A9E', tinte: '#EFE7F5' },
      { id: 'D5', nombre: "5. Equidad, diversidad e inclusión", perfil: "Estudiantes de todas las poblaciones que se sienten capaces en PC", icono: 'diversidad', color: '#5C3B7E', tinte: '#EAE4F0' },
      { id: 'D6', nombre: "6. Proyección en educación terciaria", perfil: "Jóvenes que eligen con información su futuro en STEM", icono: 'joven', color: '#8E5FB5', tinte: '#F1EAF7' },
      { id: 'D7', nombre: "7. Impacto en los resultados", perfil: "Estudiantes que aman el PC y lo aplican en todas las áreas", icono: 'estudiante', color: '#9C3D5E', tinte: '#F5E4EA' },
      { id: 'D8', nombre: "8. Equidad de género", perfil: "Niñas y adolescentes empoderadas en STEM", icono: 'nina', color: '#C2506F', tinte: '#FBE8ED' }
    ],
    ramas: [
      { id: 'LID', categoria: 'D1', nombre: "Liderazgo y visión", corto: "Liderazgo", color: '#2F5B94', icono: 'liderazgo' },
      { id: 'PLA', categoria: 'D2', nombre: "Plan de área", corto: "Plan de área", color: '#4D8BBF', icono: 'plan' },
      { id: 'ENS', categoria: 'D3', nombre: "Enseñanza, aprendizaje y evaluación", corto: "Enseñanza", color: '#5E6FB8', icono: 'ensenanza' },
      { id: 'DPD', categoria: 'D4', nombre: "Desarrollo profesional del personal docente", corto: "Desarrollo profesional", color: '#7A4A9E', icono: 'desarrollo' },
      { id: 'EDI', categoria: 'D5', nombre: "Equidad, diversidad e inclusión", corto: "Inclusión", color: '#5C3B7E', icono: 'inclusion' },
      { id: 'TER', categoria: 'D6', nombre: "Proyección en educación terciaria", corto: "Educación terciaria", color: '#8E5FB5', icono: 'terciaria' },
      { id: 'IMP', categoria: 'D7', nombre: "Impacto en los resultados", corto: "Impacto", color: '#9C3D5E', icono: 'impacto' },
      { id: 'GEN', categoria: 'D8', nombre: "Equidad de género", corto: "Equidad de género", color: '#C2506F', icono: 'genero' }
    ],
    nodos: [
      // ── 1. Liderazgo y visión ─────────────────────────────
      etapa('1A.1', 'LID', "El área existe, sin postura sobre el PC",
        "Existe el área de tecnología e informática. No existe postura institucional sobre qué se debe aprender en esta área. Las directivas delegan en la persona responsable la definición de lo que se enseña. No hay conciencia por parte de las directivas sobre el hecho de que el área no hace mención al pensamiento computacional, y la relación de este con los demás contenidos.",
        [
        h("Definición de la enseñanza: se delega en el/la docente del área", "lid-definicion-ensenanza"),
        h("Inclusión explícita del PC: no aparece", "lid-inclusion-explicita"),
        h("Importancia del PC: las directivas no la reconocen", "lid-importancia-pc")
        ],
        "Las directivas reconocen la importancia del PC y la necesidad de pasar de un plan basado en ofimática y ciudadanía digital a uno que también lo incorpore.", null, []),
      etapa('1B.1', 'LID', "Se reconoce el PC, pero no llega al plan",
        "La visión institucional sobre la enseñanza del área de tecnología e informática no menciona claramente el impacto y lugar del desarrollo del pensamiento computacional dentro del plan de área. Las directivas institucionales necesitan abordar y comprender la necesidad de hacer la transición de un plan de área basado en ofimática y ciudadanía digital a uno que también incorpore pensamiento computacional. A pesar de que las directivas reconocen la importancia del pensamiento computacional, esta conciencia no se refleja en el plan de área de tecnología e informática. Tampoco existen responsabilidades definidas dentro de las directivas para monitorear la implementación de este plan ni para evaluar sus resultados.",
        [
        h("Importancia del PC: reconocida por las directivas", "lid-importancia-pc"),
        h("Inclusión explícita del PC: aún no está en el plan de área", "lid-inclusion-explicita"),
        h("Seguimiento a la visión institucional: sin responsables definidos", "lid-seguimiento-vision")
        ],
        "Distinguir ofimática, ciudadanía digital y PC, y apoyar al menos a un(a) docente para que se forme en PC.", "1A.1", []),
      etapa('2A.1', 'LID', "Directivas que distinguen PC y ofimática",
        "Las directivas tienen una visión de la diferencia entre actividades básicas de ofimática, ciudadanía digital y el pensamiento computacional. No existe un plan estratégico que integre recursos y decisiones institucionales que faciliten el desarrollo del área y de los aprendizajes que deben lograr los/las estudiantes. Institucionalmente se ha apoyado a un(a) docente para que acceda a oportunidades de desarrollo profesional en pensamiento computacional, mediante estrategias como, por ejemplo: Ruta STEM, Misión TIC, Programación para Niños y Niñas, Jugando y Kreando, Coding Hubs, Colombia Programa, Arukay, Crack the Code, entre otras.",
        [
        h("PC y alfabetización digital: las directivas los diferencian", "lid-pc-alfabetizacion"),
        h("Oportunidades de formación: al menos un(a) docente apoyado(a)", "lid-oportunidades-formacion"),
        h("Acciones a largo plazo: todavía sin plan estratégico", "lid-largo-plazo")
        ],
        "Formular un plan estratégico para el PC, asignar responsables del plan de área y que el Consejo Académico sepa que se enseña PC.", "1B.1", []),
      etapa('2B.1', 'LID', "Plan estratégico aún desconectado del plan de área",
        "Las directivas tienen un plan estratégico para el desarrollo del pensamiento computacional, pero no está aún vinculado con el plan de área de tecnología e informática. Uno o más miembros de la planta docente tienen la responsabilidad de ejecutar este plan de área; pero no se realiza un trabajo coordinado. Algunos/as docentes han accedido a oportunidades de desarrollo profesional en pensamiento computacional, pero no hay una estrategia para asegurar que todos los/las docentes que orientan el área de tecnología e informática reciban esta formación. El Consejo Académico del colegio o institución educativa está al tanto de que se enseña pensamiento computacional.",
        [
        h("Acciones a largo plazo: plan estratégico formulado", "lid-largo-plazo"),
        h("Trabajo colaborativo: hay responsables, pero sin coordinación", "lid-trabajo-colaborativo"),
        h("Rol del Consejo Académico: sabe que se enseña PC", "lid-consejo-academico"),
        h("Oportunidades de formación: algunos/as docentes, sin estrategia para todos", "lid-oportunidades-formacion")
        ],
        "Reflejar el plan estratégico en el plan de área y facilitar a todo el equipo del área formación de alta calidad en PC.", "2A.1", []),
      etapa('3A.1', 'LID', "El plan estratégico llega al plan de área",
        "Las directivas de la institución educativa ya cuentan con un plan estratégico para la enseñanza de pensamiento computacional y este ya se refleja en el plan de área de tecnología e informática. Sin embargo, aún no se ha designado a algún miembro de las directivas para que haga seguimiento a la implementación de este plan. Las directivas y el Consejo Académico están al tanto de que se enseña pensamiento computacional; pero no brindan las garantías para que se dedique suficiente tiempo al desarrollo de éste, o se cuente con los recursos y la orientación adecuadas. Las directivas comunican oportunidades de formación profesional docente de alta calidad en pensamiento computacional y facilitan el acceso de todos/as los/as docentes del área a estas, pero no lo hacen de forma periódica.",
        [
        h("Inclusión explícita del PC: reflejada en el plan de área", "lid-inclusion-explicita"),
        h("Oportunidades de formación: se comunican a todo el equipo, sin periodicidad", "lid-oportunidades-formacion"),
        h("Apoyo institucional: aún faltan tiempo, recursos y orientación", "lid-apoyo-institucional"),
        h("Seguimiento a la visión institucional: sin directivo(a) designado(a)", "lid-seguimiento-vision")
        ],
        "Designar a un(a) directivo(a) responsable, garantizar tiempo y recursos para el PC y asegurar formación periódica.", "2B.1", []),
      etapa('3B.1', 'LID', "Un(a) directivo(a) garantiza tiempo, recursos y formación",
        "Hay un/a representante de las directivas de la institución que se asegura de que el plan estratégico para la enseñanza del pensamiento computacional se refleje en el plan de área de tecnología e informática. Un miembro de las directivas tiene la responsabilidad de asegurarse de que la visión institucional de pensamiento computacional que se describe en este plan estratégico se ejecute. Las directivas se aseguran de que en el plan de esta área se dedique tiempo suficiente al desarrollo del pensamiento computacional, que se cuente con los recursos y la orientación adecuados, e informa de esto al Consejo Académico. De igual manera, se aseguran de que los/las docentes del área tengan acceso periódico a formación profesional docente de alta calidad en estos temas. Las directivas se aseguran de monitorear la calidad y efectividad de la enseñanza del pensamiento computacional en la institución educativa, o designan a una persona que cumpla esta función.",
        [
        h("Seguimiento a la visión institucional: directivo(a) responsable", "lid-seguimiento-vision"),
        h("Apoyo institucional: tiempo, recursos y orientación garantizados", "lid-apoyo-institucional"),
        h("Oportunidades de formación: acceso periódico y de alta calidad", "lid-oportunidades-formacion"),
        h("Grados incluyen PC: con tiempo suficiente en el plan", "lid-grados-pc"),
        h("Baja frustración docente", "lid-frustracion")
        ],
        "Compartir la visión con toda la planta docente y los aliados, evaluar la efectividad del plan, dar inducción al nuevo personal y reducir el impacto de la rotación.", "3A.1", []),
      etapa('4.1', 'LID', "Visión compartida con docentes, familias y aliados",
        "La visión de la institución educativa para el plan de área de tecnología e informática y el enfoque de este en cuanto al desarrollo del pensamiento computacional, se comparten con toda la planta docente y los aliados. Las directivas se aseguran de que se implementen sistemas eficientes para evaluar la efectividad del plan de área y comunican esto al Consejo Académico. Las directivas se aseguran de que el personal docente comprenda la importancia y el valor del pensamiento computacional en la institución, y lo reflejan mediante sus decisiones con relación a los recursos, el horario y la formación docente. Igualmente, se aseguran de que el nuevo personal docente reciba prontamente inducción sobre la importancia del pensamiento computacional en la institución. La institución educativa cuenta con docentes calificados en el área o que han recibido formación certificada pertinente. Las directivas facilitan las condiciones para minimizar el impacto de la rotación de docentes del área de tecnología e informática. Las directivas son proactivas en comunicar el valor del pensamiento computacional a los padres, madres, y personas cuidadoras y; buscan destacar el beneficio mutuo de las alianzas estratégicas, las comunidades de práctica, las redes de colegios en pro de este, las empresas locales y las universidades o instituciones de educación terciaria.",
        [
        h("Comunicación con familias: proactiva sobre el valor del PC", "lid-familias"),
        h("Inducción docente: el nuevo personal la recibe pronto", "lid-induccion"),
        h("Reducción del impacto de la rotación docente", "lid-rotacion"),
        h("Promueven alianzas estratégicas", "lid-alianzas"),
        h("Resaltan los beneficios de las alianzas", "lid-beneficios-alianzas")
        ],
        "Demostrar el impacto del PC en lo estratégico y lo operativo, e inspirar alianzas para mejorar su enseñanza en otras instituciones.", "3B.1", ["3B.4"]),
      etapa('5.1', 'LID', "Liderazgo que inspira a otras instituciones",
        "Las directivas demuestran efectivamente el impacto de la enseñanza del pensamiento computacional a nivel estratégico y operativo en la institución. Inspiran a la planta docente y buscan generar alianzas institucionales para mejorar la enseñanza del pensamiento computacional en otras instituciones educativas. Las directivas han establecido sistemas de monitoreo de la efectividad de la enseñanza del pensamiento computacional en toda la comunidad, han designado personas responsables de este seguimiento y mantienen informado de esto al Consejo Académico. Los/las docentes del área se convierten en líderes de la innovación en instituciones educativas cercanas. El compromiso de la institución con el pensamiento computacional mejora la calidad de la enseñanza y el aprendizaje de este, a nivel regional y nacional.",
        [
        h("Evidencian impacto institucional: estratégico y operativo", "lid-impacto-institucional"),
        h("Promueven alianzas estratégicas con otras instituciones educativas", "lid-alianzas"),
        h("Seguimiento a la visión institucional: monitoreo en toda la comunidad", "lid-seguimiento-vision"),
        h("Trabajo colaborativo: docentes líderes de innovación en IE cercanas", "lid-trabajo-colaborativo")
        ],
        null, "4.1", []),
      // ── 2. Plan de área ─────────────────────────────
      etapa('1A.2', 'PLA', "Plan de área sin PC y con pocos materiales",
        "El plan de área de tecnología e informática no menciona el pensamiento computacional. El material de enseñanza (textos, guías, fichas, software, hardware) es escaso.",
        [
        h("Inclusión explícita: el plan no menciona el PC", "pla-inclusion-explicita"),
        h("Recursos suficientes: el material de enseñanza es escaso", "pla-recursos")
        ],
        "Incluir el PC en el plan de área y contar con materiales básicos para enseñarlo.", null, []),
      etapa('1B.2', 'PLA', "Lecciones sueltas, sin progresión ni tiempo",
        "El plan de área de tecnología e informática no es coherente, o consiste en una serie de lecciones desarticuladas que no contribuyen a desarrollar los conocimientos y habilidades de las/los estudiantes, ni ofrecen muchas oportunidades de trabajo práctico. Este plan de área no considera las edades y conocimiento previo de las/los estudiantes. El avance de los/las estudiantes no se monitorea sistemáticamente. Hay muy poca conexión entre los procesos de enseñanza aprendizaje del pensamiento computacional y su relación con otras áreas. No hay una transición clara entre el plan de área en primaria, secundaria y media. Este plan de área contempla muy poco tiempo al desarrollo del pensamiento computacional.",
        [
        h("Percepción de progresión: sin evidencia, contenidos repetidos", "pla-progresion"),
        h("Elementos de evaluación: el avance no se monitorea", "pla-evaluacion"),
        h("Conexión con otras áreas: muy escasa", "pla-otras-areas"),
        h("Presencia en niveles: sin transición entre primaria, secundaria y media", "pla-presencia-niveles")
        ],
        "Incorporar el PC junto a la ofimática y la alfabetización digital, con material estructurado como las guías de Colombia Programa.", "1A.2", []),
      etapa('2A.2', 'PLA', "PC incorporado con material estructurado",
        "El plan de área de tecnología e informática incorpora tanto ofimática y alfabetización digital, como pensamiento computacional. El plan de área involucra material educativo un poco más estructurado, por ejemplo, el uso de algunas de las guías de pensamiento computacional diseñadas por Colombia Programa; pero no permite un desarrollo completo a lo largo de la escolaridad. Este plan de área no da indicaciones claras sobre la forma en que se debería monitorear sistemáticamente el progreso de los/las estudiantes. Hay intentos esporádicos, no sistemáticos, por conectar la enseñanza y el aprendizaje del área de tecnología e informática con otras áreas.",
        [
        h("Inclusión explícita: PC junto a ofimática y alfabetización digital", "pla-inclusion-explicita"),
        h("Actividades incluidas: algunas guías de PC", "pla-actividades"),
        h("Elementos de evaluación: sin indicaciones para monitorear", "pla-evaluacion"),
        h("Conexión con otras áreas: intentos esporádicos", "pla-otras-areas")
        ],
        "Llevar el PC a todos los niveles y organizar el plan para que lo nuevo se construya sobre lo aprendido.", "1B.2", []),
      etapa('2B.2', 'PLA', "PC en todos los niveles, progresión parcial",
        "El plan de área de tecnología e informática incluye el desarrollo del pensamiento computacional en todos los niveles. Este plan de área está parcialmente organizado de modo que en algunos casos permite construir nuevos conocimientos a partir de los previos. No obstante, no se evidencia una progresión coherente de un grado a otro, ni de un nivel a otro. El plan de área permite evidenciar intentos de conectar la enseñanza y el aprendizaje en pensamiento computacional con otras áreas.",
        [
        h("Grados incluyen PC: todos los niveles", "pla-grados-pc"),
        h("Percepción de progresión: mínima o parcial", "pla-progresion"),
        h("Conexión con otras áreas: intentos visibles", "pla-otras-areas")
        ],
        "Asegurar una secuencia coherente de un grado a otro y conectar el PC con otras áreas.", "2A.2", []),
      etapa('3A.2', 'PLA', "Secuencia coherente grado a grado",
        "El plan de área de tecnología e informática brinda el conocimiento y capital cultural requerido por los/las estudiantes, pero no hace referencias al PIAR, ni incluye adecuaciones que faciliten la adquisición de estos a estudiantes en situaciones de desventaja, con discapacidad, con capacidades o talentos excepcionales y/o con trastornos específicos del aprendizaje. Este plan de área sigue una secuencia coherente de un grado a otro, pero no es clara al pasar de un nivel a otro. Es decir, no hay coherencia de transición a primaria, de primaria a secundaria o de secundaria a media. El plan de área permite conectar la enseñanza y el aprendizaje en pensamiento computacional con otras áreas.",
        [
        h("Progresión en niveles: coherente entre grados, no entre niveles", "pla-progresion"),
        h("Conexión con otras áreas: establecida", "pla-otras-areas"),
        h("Ajustes PIAR: el plan aún no los incluye", "pla-piar")
        ],
        "Incluir ajustes razonables (PIAR) para estudiantes en desventaja o con necesidades específicas, y lograr coherencia en el paso entre niveles.", "2B.2", ["3A.1"]),
      etapa('3B.2', 'PLA', "Plan pertinente, incluyente y corresponsable",
        "El plan de área de tecnología e informática está basado en mejores prácticas y es pertinente. Además, está diseñado para darles a todos los/las estudiantes, particularmente a los que se encuentran en situaciones de desventaja, con discapacidad, con capacidades o talentos excepcionales y/o con trastornos específicos del aprendizaje, el conocimiento y capital cultural que necesitan para tener éxito. Este plan de área sigue una secuencia coherente de un grado a otro y de un nivel educativo a otro. Es decir, hay coherencia de transición a primaria, de primaria a secundaria, y de secundaria a media. También, permite que los/las estudiantes desarrollen sus conocimientos, habilidades y comprensión del pensamiento computacional. El trabajo práctico se especifica dentro del plan de área y considera los conocimientos previos de los/las estudiantes. Hay oportunidades para que el personal docente mejore el plan de área. Se reduce el impacto de la rotación de docentes, pues todos los/las docentes del área son corresponsables en la creación y ajustes de este plan.",
        [
        h("Ajustes PIAR y por necesidades: incluidos", "pla-piar"),
        h("Presencia en niveles: transiciones coherentes de transición a media", "pla-presencia-niveles"),
        h("Elementos de diseño: trabajo práctico y saberes previos", "pla-diseno"),
        h("Responsables del plan: todo el equipo es corresponsable", "pla-responsables"),
        h("Mejora del plan: el equipo docente puede ajustarlo", "pla-mejora")
        ],
        "Dar tiempo suficiente al PC en todos los grados, equipar el trabajo práctico y monitorear el avance de los estudiantes para enriquecer el plan.", "3A.2", ["3A.5"]),
      etapa('4.2', 'PLA', "Plan amplio, equipado y monitoreado",
        "El plan de área de tecnología e informática para todos los grados de escolaridad es amplio, balanceado y centrado en las necesidades del futuro. Además, sigue una progresión cuidadosa en el desarrollo de conceptos claves de pensamiento computacional, y se le brinda suficiente tiempo a su desarrollo en el horario escolar a lo largo de todos los grados. Hay oportunidades bien estructuradas para el trabajo práctico con suficientes recursos tecnológicos (software y hardware confiable y compatible, incluyendo kits de computación física). Se hace un monitoreo periódico del avance de los/las estudiantes en todos los grupos. La información recolectada con los procesos de monitoreo se usa para enriquecer el plan de área y como resultado todos/as los/las estudiantes reciben enseñanza significativa en pensamiento computacional.",
        [
        h("Equipos y software: confiables, con kits de computación física", "pla-equipos"),
        h("Recursos suficientes: trabajo práctico bien estructurado", "pla-recursos"),
        h("Elementos de evaluación: monitoreo periódico en todos los grupos", "pla-evaluacion"),
        h("Mejora del plan: se enriquece con los datos del monitoreo", "pla-mejora"),
        h("Percepción de progresión: consistente", "pla-progresion")
        ],
        "Actualizar el plan con frecuencia, llevar el PC a otras asignaturas y abrir oportunidades fuera del aula.", "3B.2", ["3B.3"]),
      etapa('5.2', 'PLA', "Excelente plan de área para todos y todas",
        "Todos/as los/las estudiantes tienen acceso a un excelente plan de área de tecnología e informática, que es centrado en las necesidades del futuro, amplio y balanceado para todos los niveles de escolaridad. La información recolectada con los procesos de seguimiento (evaluación formativa) se usa para enriquecer el plan de área y se actualiza frecuentemente. Los/las docentes de otras asignaturas incorporan los aprendizajes de pensamiento computacional de sus estudiantes para mejorar la calidad de los procesos de enseñanza aprendizaje en sus asignaturas. La institución aprovecha la experticia de su personal para enriquecer y profundizar su visión sobre la enseñanza del pensamiento computacional y las oportunidades que tienen para que los/las estudiantes amplíen su comprensión y desarrollen estas habilidades fuera del aula. La institución educativa cuenta con personal capacitado y una propuesta de progresión clara a lo largo de los diferentes niveles (de transición a primaria, de primaria a secundaria y de secundaria a media), para asegurar que los niños y las niñas continúen su trayectoria académica en el tema.",
        [
        h("Frecuencia de actualización: frecuente, con evaluación formativa", "pla-actualizacion"),
        h("Conexión con otras áreas: otras asignaturas usan el PC", "pla-otras-areas"),
        h("Profesores STEM: personal capacitado y experticia aprovechada", "pla-stem"),
        h("Percepción de progresión: integral, de transición a 11°", "pla-progresion"),
        h("Oportunidades para aprender PC fuera del aula", "pla-fuera-aula")
        ],
        null, "4.2", []),
      // ── 3. Enseñanza, aprendizaje y evaluación ─────────────────────────────
      etapa('1A.3', 'ENS', "Docentes que aún no conocen el PC",
        "La mayoría de los/las docentes del área de tecnología e informática y otras áreas STEM no saben qué es pensamiento computacional, ni su importancia. Los/las docentes que han recibido formación previa en temas de pensamiento computacional no están implementando actividades para desarrollarlo en sus estudiantes.",
        [
        h("Conocimiento en PC: la mayoría no sabe qué es", "ens-conocimiento-pc"),
        h("Implementación: quienes se formaron no lo llevan al aula", "ens-implementacion")
        ],
        "Reconocer la importancia del PC y empezar a comprenderlo.", null, []),
      etapa('1B.3', 'ENS', "Se reconoce el PC sin sentirse preparados(as)",
        "Los/las docentes que tienen a su cargo la enseñanza de pensamiento computacional tienen poca comprensión de este y no cuentan con el conocimiento especializado para desarrollarlo. Algunos de los/las docentes reconocen la importancia del pensamiento computacional, pero aún no se sienten preparados/as para hacer actividades para promoverlo en sus clases. Los/las docentes no asumen una clara responsabilidad frente al aprendizaje de pensamiento computacional, el progreso y los resultados de sus estudiantes. Las/los docentes no promueven, ni apoyan el aprendizaje autónomo de pensamiento computacional de forma regular. Las tareas que se proponen no son lo suficientemente desafiantes para los/las estudiantes, lo que limita la oportunidad de que ellos/as progresen. Los/las docentes rara vez hacen uso de sus conocimientos técnicos y pedagógicos para abordar los errores y la falta de comprensión de sus estudiantes en las clases sobre pensamiento computacional. Las/los docentes no muestran suficiente conciencia sobre la forma en que sus estudiantes aprenden, ni lo tienen en cuenta en la planeación de las clases.",
        [
        h("Autoeficacia en PC: baja", "ens-autoeficacia-pc"),
        h("Nivel de reto: tareas poco desafiantes", "ens-reto"),
        h("Aprendizaje autónomo: no se promueve", "ens-autonomo"),
        h("Errores de los estudiantes: rara vez se abordan", "ens-errores")
        ],
        "Implementar con fidelidad materiales de enseñanza del PC, por ejemplo las guías.", "1A.3", []),
      etapa('2A.3', 'ENS', "Implementan los materiales con fidelidad",
        "Las personas responsables de enseñar pensamiento computacional tienen un conocimiento y una comprensión limitada de este. Sin embargo, están en capacidad de implementar adecuadamente materiales para su enseñanza. Por ejemplo, los/las docentes que han recibido formación previa en pensamiento computacional pueden hacer una implementación que siga la estructura y lógica de los materiales para su enseñanza. El aprendizaje autónomo de los/las estudiantes, no se apoya o fomenta regularmente. La mayoría (mitad+1) de docentes reconoce la importancia del pensamiento computacional, pero ninguno/a se siente preparado/a para planear y realizar actividades diferentes a las del material disponible para promoverlo en sus clases.",
        [
        h("Preparación y gestión de materiales: siguen su estructura y lógica", "ens-materiales"),
        h("Implementación: la mayoría reconoce el PC, nadie diseña más allá del material", "ens-implementacion"),
        h("Aprendizaje autónomo: aún no es regular", "ens-autonomo")
        ],
        "Apoyarse en colegas y redes, y ajustar la planeación con los resultados y la reflexión de los estudiantes.", "1B.3", []),
      etapa('2B.3', 'ENS', "Planean desde el progreso y la metacognición",
        "Los/las docentes cuya formación de base no es en tecnología e informática usan las oportunidades de desarrollo profesional continuado y el apoyo de sus colegas y redes de maestros para resolver dudas en cuanto a conocimiento específico de pensamiento computacional, de tal manera que puedan enseñar todos los aspectos de este, incluyendo programación. Los/las docentes que orientan pensamiento computacional muestran conciencia de cómo sus estudiantes progresan y lo tienen en cuenta en su planeación y procesos de enseñanza. Todos los/las docentes ajustan su planeación considerando los resultados de aprendizaje de sus estudiantes y las reflexiones de estos sobre su propio aprendizaje (autoevaluación y metacognición). El aprendizaje autónomo se apoya o fomenta regularmente y se proponen tareas con un nivel de reto apropiado que les permite a las/los estudiantes demostrar progreso. La mayoría (mitad+1) de docentes reconoce la importancia del pensamiento computacional e implementan actividades para su desarrollo a partir de los materiales disponibles, pero sólo algunos/as se sienten capaces de planear y realizar actividades adicionales.",
        [
        h("Metacognición y reflexión de los estudiantes", "ens-metacognicion"),
        h("Nivel de reto: apropiado para demostrar progreso", "ens-reto"),
        h("Aprendizaje autónomo: se fomenta con regularidad", "ens-autonomo"),
        h("Autoeficacia pedagógica: algunos/as planean actividades propias", "ens-autoeficacia-ped")
        ],
        "Usar prácticas propias del PC (desconectadas, Usa-Modifica-Crea, coevaluación) y que la mayoría diseñe actividades propias.", "2A.3", []),
      etapa('3A.3', 'ENS', "Prácticas propias del PC en el aula",
        "Los/las docentes conocen y usan algunas prácticas de enseñanza, aprendizaje y evaluación del pensamiento computacional, adecuadas para sus áreas, tales como: actividades desconectadas, la secuencia didáctica Usa-Modifica-Crea, prácticas de la taxonomía de Weintrop, y evaluación por pares (coevaluación), entre otras. Todos los/las docentes que desarrollan pensamiento computacional ajustan su planeación considerando los resultados de aprendizaje de sus estudiantes y las reflexiones de estos sobre su propio aprendizaje, pero no identifican diferencias y brechas entre grupos y subgrupos. Los/las docentes no sienten que tengan las herramientas para abordar barreras potenciales para el aprendizaje de sus estudiantes. Todos los/las docentes que enseñan pensamiento computacional reconocen la importancia de este e implementan actividades para su desarrollo a partir de los materiales disponibles, y la mayoría (mitad + 1) se sienten capaces de planear y realizar actividades adicionales.",
        [
        h("Prácticas de PC: desconectadas, Usa-Modifica-Crea, Weintrop, coevaluación", "ens-practicas"),
        h("Autoeficacia pedagógica: la mayoría diseña actividades adicionales", "ens-autoeficacia-ped"),
        h("Brechas entre grupos: aún no se identifican", "ens-brechas")
        ],
        "Reconocer necesidades individuales y grupales, ampliar el repertorio (PRIMM, Parsons, programación en pares) y dar realimentación.", "2B.3", ["2B.4"]),
      etapa('3B.3', 'ENS', "Enseñanza diferenciada y con realimentación",
        "Los/las docentes que orientan pensamiento computacional reconocen las diferentes necesidades y fortalezas de sus estudiantes a nivel individual y grupal y empiezan a adaptar su enseñanza para apoyar su progreso. Los/las docentes utilizan una variedad de prácticas de enseñanza, aprendizaje y evaluación del pensamiento computacional, adecuadas para sus áreas, tales como: actividades desconectadas, lectura de código, programación en pares, Usa-Modifica-Crea, PRIMM, problemas de Parsons, ondas semánticas, prácticas de la taxonomía de Weintrop y evaluación por pares (coevaluación), entre otras. Los/las docentes proveen realimentación apropiada, alineada con las políticas de la institución educativa, para apoyar el progreso de sus estudiantes. Los/las docentes se muestran confiados/as para abordar cualquier barrera potencial para el aprendizaje mediante la aplicación de intervenciones bien dirigidas y el despliegue apropiado del personal de apoyo disponible, evaluando el impacto de tales intervenciones.",
        [
        h("Prácticas de PC: lectura de código, programación en pares, PRIMM, Parsons", "ens-practicas"),
        h("Apoyo a estudiantes: adaptan la enseñanza a sus necesidades", "ens-apoyo"),
        h("Realimentación alineada con la institución", "ens-realimentacion"),
        h("Barreras de aprendizaje: intervenciones bien dirigidas", "ens-barreras")
        ],
        "Verificar sistemáticamente la comprensión, identificar concepciones erróneas y evaluar de forma formativa.", "3A.3", ["3A.4"]),
      etapa('4.3', 'ENS', "Evaluación formativa y métodos efectivos",
        "El pensamiento computacional es orientado por docentes con conocimientos claros y apropiados para el grado de enseñanza. Los/las docentes utilizan métodos efectivos para desarrollar el conocimiento de los estudiantes, verifican sistemáticamente su comprensión e identifican concepciones erróneas con precisión. Todo el cuerpo docente que orienta pensamiento computacional utiliza una variedad de estrategias pedagógicas efectivas para responder y adaptarse a las fortalezas y necesidades de sus estudiantes. Se evalúa el progreso con regularidad y precisión y se discuten las evaluaciones para que los y las estudiantes sepan qué tan bien lo han hecho y qué deben hacer para mejorar (evaluación formativa). Todos los y las docentes emplean una variedad de intervenciones efectivas para garantizar que todos/as sus estudiantes, incluidos/as aquellos identificados/as como de bajo rendimiento, progresen.",
        [
        h("Conocimientos previos y conceptos clave: comprensión verificada", "ens-comprension"),
        h("Errores de los estudiantes: concepciones erróneas identificadas con precisión", "ens-errores"),
        h("Evaluación formativa: los estudiantes saben cómo mejorar", "ens-formativa"),
        h("Apoyo a estudiantes: intervenciones también para bajo rendimiento", "ens-apoyo")
        ],
        "Dominar también los temas complejos, conocer el efecto de cada enfoque y compartir las prácticas dentro y fuera de la institución.", "3B.3", []),
      etapa('5.3', 'ENS', "Docentes de referencia que comparten su práctica",
        "Todos los/las docentes que orientan pensamiento computacional tienen un conocimiento sólido y acertado sobre este, que incluye tanto los conocimientos básicos como temas de mayor complejidad asociados. Pueden desarrollar el conocimiento de este entre sus estudiantes, de manera efectiva, a través de presentaciones atractivas y otros medios. Todos los/las docentes verifican sistemáticamente la comprensión de sus estudiantes, identifican conceptos erróneos con precisión y les proporcionan realimentación específica y accionable, incluso de forma remota cuando corresponde. Las/los docentes tienen una comprensión informada y detallada de la efectividad de los diferentes enfoques de enseñanza y el impacto de estos en el aprendizaje y la motivación de sus estudiantes hacia el pensamiento computacional. Las/los docentes emplean estrategias efectivas para apoyar el aprendizaje y el progreso de todos/as sus estudiantes. Las/los docentes hacen seguimiento regular al progreso de sus estudiantes y trabajan con ellos/as para ayudarles a lograr lo esperado y obtener mejores calificaciones. Las buenas prácticas en cuanto a planeación y evaluación se comparten con otros/as docentes dentro de su institución. A estos/as docentes se les pide periódicamente que compartan sus estrategias pedagógicas a docentes de otras instituciones educativas.",
        [
        h("Conocimiento en PC: sólido, incluye temas de mayor complejidad", "ens-conocimiento-pc"),
        h("Realimentación específica y accionable, también remota", "ens-realimentacion"),
        h("Efectividad de los enfoques: comprensión informada", "ens-efectividad"),
        h("Comparten sus prácticas con docentes de otras IE", "ens-compartir")
        ],
        null, "4.3", ["4.4"]),
      // ── 4. Desarrollo profesional del personal docente ─────────────────────────────
      etapa('1A.4', 'DPD', "Sin formación en PC",
        "Los/las docentes que desarrollan pensamiento computacional no tienen formación profesional previa o continua sobre este.",
        [
        h("Formación previa o continua en PC: ninguna", "dpd-formacion")
        ],
        "Abrir oportunidades de formación en PC para quienes lo enseñan.", null, []),
      etapa('1B.4', 'DPD', "Formación ocasional y sin plan",
        "Las oportunidades de desarrollo profesional para las/los docentes en ejercicio que desarrollan pensamiento computacional, no son planeadas, ni se asignan según los objetivos estratégicos de la institución o las necesidades de mejora del plan de área. No se consideran los conocimientos previos y habilidades de las/los docentes a los que se les asigna desarrollar pensamiento computacional. No se planean ni se apoyan las oportunidades de implementar formación profesional para docentes en ejercicio. No hay registro formal de las necesidades y participación de las/los docentes encargados de desarrollar pensamiento computacional en actividades de formación profesional continua, lo que dificulta medir su impacto. No se hace seguimiento a las necesidades de formación de las/los docentes. La carga laboral no se equilibra para facilitar oportunidades de acceso a desarrollo profesional continuado.",
        [
        h("Planeación de la formación: no responde a objetivos ni al plan de área", "dpd-planeacion"),
        h("Registro de necesidades y participación: no existe", "dpd-registro"),
        h("Carga laboral: no se equilibra para formarse", "dpd-carga")
        ],
        "Planear la formación del personal que ya se formó en PC.", "1A.4", []),
      etapa('2A.4', 'DPD', "Formación planeada, sin seguimiento",
        "Las actividades de formación profesional docente para el personal previamente formado en pensamiento computacional se planean, pero no hay clara evidencia de que estén articuladas con las necesidades de mejora del plan de área. Tampoco se lleva registro formal, ni se hace seguimiento a su impacto. A nivel institucional, no se promueven, ni se apoyan las iniciativas de formación profesional docente relacionadas con actividades como mentoría, observación de aula, investigación acción y auto estudio.",
        [
        h("Planeación: existe, sin articularse con el plan de área", "dpd-planeacion"),
        h("Registro e impacto: sin seguimiento", "dpd-registro"),
        h("Mentoría, observación de aula e investigación-acción: no se promueven", "dpd-mentoria")
        ],
        "Articular la formación con el plan de área, con metas, registro y apoyo a la mentoría y la observación de clases.", "1B.4", ["2A.1"]),
      etapa('2B.4', 'DPD', "Formación articulada, con metas y registro",
        "Las oportunidades de formación profesional de las/los docentes con formación inicial en pensamiento computacional se planean y articulan con las necesidades del plan de área, por grados, y cuentan con metas claras en cuanto a su impacto. Además, se lleva registro de las actividades realizadas y hay un sistema de seguimiento a la formación profesional que se ofrece y/o facilita desde la institución. Hay apoyo institucional para la realización de actividades como mentoría, observación de clases, investigación acción y auto estudio. El desarrollo profesional docente se monitorea y se discute para asegurar altos niveles de calidad. Las directivas comprenden las necesidades de formación del personal docente y de sus estudiantes, y las articulan mediante un plan que se implementa y al que se le hace seguimiento. Sin embargo, la formación profesional docente del personal que no cuenta con formación de base en pensamiento computacional, no se planea, ni prioriza, lo que limita el avance de sus estudiantes.",
        [
        h("Planeación: por grados y con metas de impacto", "dpd-planeacion"),
        h("Registro y sistema de seguimiento de la formación", "dpd-registro"),
        h("Mentoría y observación de clases: con apoyo institucional", "dpd-mentoria"),
        h("Docentes sin formación de base: aún no se priorizan", "dpd-sin-base")
        ],
        "Incluir a todos los/las docentes que orientan PC, también a quienes no tienen formación de base.", "2A.4", []),
      etapa('3A.4', 'DPD', "Formación para todo el equipo, sin visión de futuro",
        "Las oportunidades de formación profesional de todos los/las docentes que orientan pensamiento computacional se planean y articulan con las necesidades del plan de área, pero no tienen visión de futuro. No todo el personal docente encargado de orientar pensamiento computacional tiene formación previa en TIC o pensamiento computacional, ni se les ha provisto formación profesional docente para cerrar brechas de conocimiento. La calidad de la enseñanza del pensamiento computacional en la institución educativa se ve afectada debido a la rotación de docentes.",
        [
        h("Planeación: para todo el equipo, sin visión de futuro", "dpd-planeacion"),
        h("Docentes sin formación de base: con brechas por cerrar", "dpd-sin-base"),
        h("Rotación docente: afecta la calidad de la enseñanza", "dpd-rotacion")
        ],
        "Dar visión de largo plazo a la formación y cerrar las brechas de conocimiento para que la calidad resista la rotación.", "2B.4", []),
      etapa('3B.4', 'DPD', "Plan de formación con visión de largo plazo",
        "La formación profesional docente se planea, tiene visión de futuro y está articulada con la mejora continua del plan de área. Las directivas tienen un plan a largo plazo que incluye acciones para su continuidad. Todo el personal docente encargado de desarrollar el pensamiento computacional de las/los estudiantes tiene formación previa en TIC o pensamiento computacional, o se les ha provisto formación profesional docente que les permite cerrar brechas de conocimiento en estos temas. La calidad de la enseñanza en pensamiento computacional en la institución educativa se mantiene, a pesar de la rotación de docentes. El personal docente que orienta pensamiento computacional (previamente formado o no en este tema) cuenta con una oferta de oportunidades de formación profesional que responde a sus necesidades y a las del plan de área. Se lleva un registro de la formación profesional docente ofrecida y su relación con el plan de área, y se revisa regularmente para que las directivas puedan hacerle seguimiento al impacto.",
        [
        h("Planeación: con visión de futuro y acciones de continuidad", "dpd-planeacion"),
        h("Docentes sin formación de base: brechas cerradas", "dpd-sin-base"),
        h("Rotación docente: la calidad se mantiene", "dpd-rotacion"),
        h("Registro revisado por las directivas para seguir el impacto", "dpd-registro")
        ],
        "Hacer del desarrollo profesional parte de la planeación estratégica y monitorear su impacto en el aula.", "3A.4", []),
      etapa('4.4', 'DPD', "Desarrollo profesional estratégico",
        "El desarrollo profesional de los y las docentes en ejercicio forma parte de la planeación estratégica de la institución. Se hace un análisis de necesidades basadas en el plan de área al cierre de cada período académico. Las directivas se involucran en la planeación de la formación profesional docente y hacen seguimiento al proceso, e informan de este al Consejo Académico. El desarrollo profesional de docentes en ejercicio incluye a todos los/las encargados de enseñar pensamiento computacional, lo que asegura el máximo impacto en cuanto a la formación en habilidades técnicas directamente relacionadas con éste. Todo el personal docente cuenta con la posibilidad de acceder a una oferta amplia de capacitaciones ofrecidas a nivel interno y externo. Se monitorea regularmente el impacto del desarrollo profesional docente en el aula.",
        [
        h("Análisis de necesidades al cierre de cada periodo", "dpd-necesidades"),
        h("Directivas involucradas que informan al Consejo Académico", "dpd-directivas"),
        h("Oferta amplia de formación interna y externa", "dpd-oferta"),
        h("Impacto en el aula: se monitorea con regularidad", "dpd-impacto-aula")
        ],
        "Proyectar la formación hacia otras sedes e instituciones e incluir liderazgo y trabajo colaborativo.", "3B.4", []),
      etapa('5.4', 'DPD', "Docentes que forman a docentes de la región",
        "M E N Equidad, diversidad e S inclusión Esta dimensión se refiere al grado al que la institución educativa es inclusiva y atiende a las y los estudiantes de poblaciones I subrepresentadas, con discapacidad, con capacidades o talentos excepcionales, y/o con trastornos específicos del aprendizaje. Ó N 20",
        [
        h("Mentoría a docentes de otras sedes e instituciones", "dpd-mentoria"),
        h("Redes interinstitucionales y encuentros colaborativos", "dpd-redes"),
        h("Búsqueda proactiva de formación según necesidades", "dpd-proactiva"),
        h("Liderazgo y trabajo colaborativo en la formación", "dpd-liderazgo")
        ],
        null, "4.4", ["5.1"]),
      // ── 5. Equidad, diversidad e inclusión ─────────────────────────────
      etapa('1A.5', 'EDI', "Estudiantes y barreras sin identificar",
        "La institución educativa no ha identificado a las/los estudiantes con discapacidad, con capacidades o talentos excepcionales, con trastornos específicos del aprendizaje, o pertenecientes a grupos subrepresentados en áreas STEM (afrocolombianos, indígenas, raizales, rom o gitanos, víctimas, migrantes, etc.). A las/los estudiantes, en general, nunca se les presentan modelos que les inspiren a elegir carreras asociadas con las áreas STEM, especialmente las relacionadas con tecnología.",
        [
        h("Identificación de estudiantes con discapacidad, talentos o de grupos subrepresentados: no se ha hecho", "edi-identificacion"),
        h("Modelos a seguir en STEM: nunca se presentan", "edi-modelos")
        ],
        "Identificar a la población estudiantil diversa y subrepresentada en STEM.", null, []),
      etapa('1B.5', 'EDI', "Población identificada, barreras no",
        "Se han identificado a las y los estudiantes con discapacidad, con capacidades o talentos excepcionales, con trastornos específicos del aprendizaje y de grupos subrepresentados en áreas STEM (afrocolombianos, indígenas, raizales, rom o gitanos, víctimas, migrantes, etc.), pero no se han identificado las barreras de esta población para acceder totalmente al plan de área que desarrollan pensamiento computacional, ni se reflejan acciones al respecto. No se cuenta con una persona que lidere los procesos institucionales de inclusión y apoye a las y los docentes para atender de forma personalizada a esta población estudiantil. El perfil de las/los jóvenes que participan en las actividades relacionadas con pensamiento computacional no representa a la totalidad de la población escolar, pues hay algunos grupos de estudiantes ausentes o subrepresentados dentro del contexto. A las/los estudiantes casi nunca se les presentan modelos a seguir que representen la diversidad poblacional del país, y les inspiren a elegir carreras asociadas con las áreas STEM, especialmente las relacionadas con tecnología.",
        [
        h("Identificación de la población: hecha", "edi-identificacion"),
        h("Barreras para acceder al plan de área: sin identificar", "edi-barreras"),
        h("Liderazgo de la inclusión: sin persona responsable", "edi-lider-inclusion"),
        h("Participación de grupos subrepresentados: ausente", "edi-participacion"),
        h("Modelos a seguir en STEM: casi nunca", "edi-modelos")
        ],
        "Hacer ajustes y apoyos a los materiales para que el PC sea más accesible.", "1A.5", []),
      etapa('2A.5', 'EDI', "Primeros ajustes a los materiales",
        "Los planes de estudio de las áreas donde se enseña pensamiento computacional y/o los recursos de apoyo que se utilizan en estas, no siguen los principios del Diseño Universal para el Aprendizaje ni contienen ajustes razonables (PIAR) para la atención de estudiantes con discapacidad, con capacidades o talentos excepcionales, con trastornos específicos del aprendizaje y de grupos subrepresentados en áreas STEM (afrocolombianos, indígenas, raizales, rom o gitanos, víctimas, migrantes, etc.), pero sí se ejecutan algunas acciones de apoyo y adecuaciones a los materiales educativos para hacer más accesible los conocimientos de pensamiento computacional a esta población estudiantil. Los grupos subrepresentados en áreas STEM, participan de forma muy limitada en actividades relacionadas con pensamiento computacional, y los/las docentes de estas áreas no buscan activamente motivar la participación de estas poblaciones en actividades de este tipo. A las/los estudiantes a veces se les presentan modelos a seguir que representen la diversidad poblacional del país, y que les inspiren a elegir carreras asociadas con las áreas STEM, especialmente las relacionadas con tecnología.",
        [
        h("DUA y ajustes razonables (PIAR): aún no están en los planes", "edi-dua"),
        h("Adecuaciones a los materiales: algunas", "edi-adecuaciones"),
        h("Participación de grupos subrepresentados: muy limitada", "edi-participacion"),
        h("Modelos a seguir en STEM: a veces", "edi-modelos")
        ],
        "Incorporar el DUA y/o ajustes razonables (PIAR) en los planes y lograr que los grupos subrepresentados participen.", "1B.5", []),
      etapa('2B.5', 'EDI', "DUA y PIAR en algunos grados",
        "Los planes de estudio de las áreas donde se enseña pensamiento computacional y/o los recursos de apoyo que se utilizan en estas, siguen los principios del Diseño Universal para el Aprendizaje y/o contienen ajustes razonables (PIAR) para la inclusión de estudiantes con discapacidad, con capacidades o talentos excepcionales, con trastornos específicos del aprendizaje y de grupos subrepresentados en áreas STEM (afrocolombianos, indígenas, raizales, rom o gitanos, víctimas, migrantes, etc.), aunque estos aún no son consistentes para todos los grados de escolaridad. No se ha establecido un plan claro para la atención inclusiva de las/los estudiantes que presentan mayores necesidades u obstáculos para el aprendizaje, o en el plan existente no se aborda plenamente el tema. A las/los estudiantes se les presentan ocasionalmente modelos a seguir que representan la diversidad poblacional del país, y que les inspiran a elegir carreras asociadas con las áreas STEM, especialmente las relacionadas con tecnología. Los grupos de estudiantes subrepresentados (por ejemplo, población afrocolombiana, indígena, raizal, rom o gitana, víctimas, migrantes, etc.) sí participan en actividades de pensamiento computacional, y los/las docentes que lo orientan planean y reflexionan al respecto. Las directivas reconocen la importancia de crear aulas inclusivas y promueven la implementación de prácticas plenamente inclusivas para la enseñanza del pensamiento computacional.",
        [
        h("DUA y PIAR: presentes, no en todos los grados", "edi-dua"),
        h("Plan de atención inclusiva: incompleto", "edi-plan-inclusivo"),
        h("Participación de grupos subrepresentados: participan y se reflexiona", "edi-participacion"),
        h("Directivas que promueven aulas inclusivas", "edi-directivas")
        ],
        "Hacer consistentes el DUA y los PIAR en todos los grados y presentar modelos diversos con periodicidad.", "2A.5", []),
      etapa('3A.5', 'EDI', "Inclusión consistente en todos los grados",
        "Los planes de estudio de las áreas donde se enseña pensamiento computacional y/o los recursos de apoyo que se utilizan en estas, siguen los principios del Diseño Universal para el Aprendizaje y/o contienen ajustes razonables (PIAR) para la inclusión de estudiantes con discapacidad, con capacidades o talentos excepcionales, con trastornos específicos del aprendizaje y de grupos subrepresentados en áreas STEM (afrocolombianos, indígenas, raizales, rom o gitanos, víctimas, migrantes, etc.), y estas son consistentes para todos los grados de escolaridad. A las/los estudiantes se les presentan periódicamente modelos a seguir que representan la diversidad poblacional del país, y que les inspiran a elegir carreras asociadas con las áreas STEM, especialmente las relacionadas con tecnología. Se cuenta con algunos recursos de apoyo para facilitar la inclusión en el aula.",
        [
        h("DUA y PIAR: consistentes en todos los grados", "edi-dua"),
        h("Modelos a seguir en STEM: periódicamente", "edi-modelos"),
        h("Recursos de apoyo a la inclusión en el aula: algunos", "edi-recursos")
        ],
        "Revisar continuamente con personal experto en inclusión, formar en pedagogía culturalmente responsiva y monitorear la participación.", "2B.5", []),
      etapa('3B.5', 'EDI', "Inclusión revisada con expertos y monitoreada",
        "Los planes de estudio de las áreas donde se enseña pensamiento computacional y/o los recursos de apoyo que se utilizan en estas, siguen los principios del Diseño Universal para el Aprendizaje y/o contienen ajustes razonables (PIAR). Además, se revisan continuamente, en asociación con personal experto en educación inclusiva, si se cuenta con este en la institución, para garantizar que se establezcan estándares consistentemente altos de apoyo a esta población estudiantil. A los/las estudiantes se les presenta de manera periódica una amplia variedad de modelos a seguir que representan la diversidad poblacional del país y les inspiran a elegir carreras asociadas con las áreas STEM, especialmente las relacionadas con tecnología. Por ejemplo, se presentan modelos de hombres y mujeres afrocolombianos/as, indígenas, raizales, rom o gitanas/os, víctimas, con discapacidad, migrantes, etc. Se cuenta con recursos de apoyo de alta calidad y personal docente capacitado en pedagogía inclusiva y culturalmente responsiva. Se monitorea y busca activamente incrementar la participación de los grupos de estudiantes subrepresentados en actividades relacionadas con el pensamiento computacional. Hay recursos disponibles para apoyar la continuidad, revisión e implementación de las estrategias de intervención exitosas.",
        [
        h("Revisión continua con personal experto en educación inclusiva", "edi-revision"),
        h("Pedagogía inclusiva y culturalmente responsiva: personal capacitado", "edi-pedagogia"),
        h("Participación de grupos subrepresentados: monitoreada y en aumento", "edi-participacion"),
        h("Modelos a seguir en STEM: amplia variedad", "edi-modelos")
        ],
        "Empoderar a todos y todas con pedagogía culturalmente responsiva y presentar el PC como accesible para cualquier estudiante.", "3A.5", []),
      etapa('4.5', 'EDI', "PC accesible: todos y todas pueden",
        "Los planes de estudio de las áreas donde se enseña pensamiento computacional y los recursos de apoyo que se utilizan en estas, siguen los principios del Diseño Universal para el Aprendizaje y/o contienen ajustes razonables (PIAR) para incluir a estudiantes con discapacidad, con capacidades o talentos excepcionales, con trastornos específicos del aprendizaje y de grupos subrepresentados en áreas STEM (afrocolombianos, indígenas, raizales, rom o gitanos, víctimas, migrantes, etc.). Mediante una pedagogía culturalmente responsiva, se empodera a todas/os las/los jóvenes a desarrollar sus conocimientos, habilidades y actitudes. Las/los docentes presentan el pensamiento computacional como accesible y todas/os pueden desarrollar las competencias y habilidades asociadas a este. Se enriquece el plan de área exponiendo a las/los estudiantes a un grupo diverso de personas que trabajan en carreras relacionadas con las áreas STEM, en la medida que esto sea posible. Por ejemplo, presentan modelos de hombres y mujeres afrocolombianas, indígenas, raizales, rom o gitanas, migrantes, víctimas, con discapacidad, etc., que respondan a la diversidad del contexto.",
        [
        h("Pedagogía culturalmente responsiva que empodera", "edi-pedagogia"),
        h("El PC se presenta como accesible para todos y todas", "edi-accesible"),
        h("Modelos a seguir: personas diversas del contexto en carreras STEM", "edi-modelos")
        ],
        "Incorporar estrategias basadas en la investigación y colaborar con especialistas en enseñanza inclusiva.", "3B.5", []),
      etapa('5.5', 'EDI', "Inclusión basada en investigación y compartida",
        "Los planes de estudio de las áreas donde se enseña pensamiento computacional y los recursos de apoyo que se utilizan en estas, siguen los principios del Diseño Universal para el Aprendizaje y/o contienen ajustes razonables (PIAR) y se revisan continuamente para incorporar estrategias basadas en la investigación para la igualdad, la diversidad, la inclusión y la atención a estudiantes con discapacidad, con capacidades o talentos excepcionales, con trastornos específicos del aprendizaje y/o de poblaciones subrepresentadas en áreas STEM (afrocolombianos, indígenas, raizales, rom o gitanos, víctimas, migrantes, etc.). Los/Las docentes que enseñan pensamiento computacional colaboran con otros docentes, profesionales o investigadores/as con experticia en enseñanza inclusiva para impulsar avances en esta área, y comparten sus aprendizajes y experiencias con otros/as docentes a nivel regional o nacional.",
        [
        h("Estrategias basadas en la investigación", "edi-investigacion"),
        h("Colaboración con profesionales e investigadores(as) en inclusión", "edi-colaboracion"),
        h("Comparten aprendizajes a nivel regional o nacional", "edi-compartir")
        ],
        null, "4.5", []),
      // ── 6. Proyección en educación terciaria ─────────────────────────────
      etapa('1A.6', 'TER', "El PC no se asocia con el futuro",
        "No existe conciencia institucional sobre la importancia de los aprendizajes en pensamiento computacional en las trayectorias educativas y ocupacionales futuras de los/las estudiantes. Las directivas no relacionan el pensamiento computacional con las áreas STEM.",
        [
        h("Conciencia institucional del PC en las trayectorias futuras: no existe", "ter-conciencia"),
        h("Relación entre PC y áreas STEM: no se establece", "ter-pc-stem")
        ],
        "Reconocer cómo el PC influye en el futuro educativo y laboral de los estudiantes.", null, []),
      etapa('1B.6', 'TER', "Sin acciones sobre el futuro STEM",
        "La institución educativa aún no cuenta con acciones que promuevan oportunidades para que los/las jóvenes tomen conciencia sobre cómo el pensamiento computacional influye en su futuro. Ej. Referencias a trayectorias educativas y ocupacionales que integren pensamiento computacional en el plan de área y/o los materiales asociados a estas, y espacios de orientación socio ocupacional, entre otras. Las/los docentes no buscan activamente crear conciencia sobre formación terciaria relacionada con pensamiento computacional, y no informan activamente a las/los estudiantes sobre dichas oportunidades. El estímulo a las/los estudiantes hacia las carreras asociadas con las áreas STEM, especialmente las relacionadas con tecnología, no se prioriza lo suficiente dentro de la proyección y oferta socio ocupacional de la institución.",
        [
        h("Referencias a trayectorias en el plan de área: ausentes", "ter-trayectorias"),
        h("Orientación socio ocupacional: no prioriza STEM", "ter-orientacion"),
        h("Docentes que informan oportunidades de educación terciaria: no", "ter-informan")
        ],
        "Mostrar conciencia institucional y realizar acciones de sensibilización con los estudiantes.", "1A.6", []),
      etapa('2A.6', 'TER', "Conciencia institucional y primeras acciones",
        "La institución educativa muestra conciencia de la importancia del pensamiento computacional en las posibilidades de proyección en educación terciaria y las oportunidades laborales futuras de los/las estudiantes. Se realizan algunas acciones para sensibilizar a los/las estudiantes al respecto. Sin embargo, los/las docentes que desarrollan pensamiento computacional no buscan activamente crear conciencia sobre las trayectorias educativas y ocupacionales en STEM, especialmente las relacionadas con tecnología, y no informan activamente a las/los estudiantes de tales oportunidades.",
        [
        h("Conciencia institucional del PC en las trayectorias futuras: presente", "ter-conciencia"),
        h("Acciones de sensibilización: algunas", "ter-sensibilizacion"),
        h("Docentes que informan oportunidades: aún no activamente", "ter-informan")
        ],
        "Incluir referencias a trayectorias en los planes STEM y abrir espacios como ferias, clubes y competencias.", "1B.6", []),
      etapa('2B.6', 'TER', "Ferias, clubes y competencias abiertas",
        "La institución educativa cuenta con algunas acciones para promover oportunidades para que los/las jóvenes tomen conciencia sobre cómo el pensamiento computacional influye en su futuro. Ej. Referencias a trayectorias educativas y ocupacionales que integren pensamiento computacional en los planes de área STEM y/o los materiales asociados a estas, y espacios de orientación socio ocupacional específica al respecto. La enseñanza y el aprendizaje aún no cuentan con recursos relevantes y de alta calidad que motiven al estudio de carreras en las áreas STEM, especialmente las relacionadas con tecnología. La orientación socio ocupacional que se promueve desde la institución puede incluir referencia a carreras en áreas STEM, pero se da poca o ninguna referencia a las carreras relacionadas con tecnología. Hay algunas opciones para acercar a las/los estudiantes a las dinámicas propias de las carreras STEM, por ejemplo, se hacen ferias de proyectos, clubes, competencias de programación, entre otros espacios, a las que pueden acceder estudiantes de todos los grados.",
        [
        h("Referencias a trayectorias en los planes de área STEM", "ter-trayectorias"),
        h("Espacios: ferias de proyectos, clubes y competencias de programación", "ter-espacios"),
        h("Orientación socio ocupacional: STEM, poca referencia a tecnología", "ter-orientacion"),
        h("Recursos de alta calidad sobre carreras: aún no", "ter-recursos")
        ],
        "Promover trayectorias técnicas y profesionales concretas y ofrecer asesoría socio ocupacional en la media.", "2A.6", []),
      etapa('3A.6', 'TER', "Asesoría socio ocupacional en la media",
        "La institución educativa cuenta con acciones para promover trayectorias educativas y laborales asociadas a pensamiento computacional. Por ejemplo, referencias a una gama limitada de carreras técnicas y profesionales relacionadas a este en los planes de área STEM y/o los materiales asociados a estas, y espacios de orientación socio ocupacional específica al respecto. En los grados de educación media los/las docentes del área u otro personal designado por la institución proporcionan de manera general asesoría socio ocupacional sobre carreras STEM, especialmente las relacionadas con tecnología.",
        [
        h("Trayectorias: gama limitada de carreras técnicas y profesionales", "ter-trayectorias"),
        h("Orientación socio ocupacional general en la media", "ter-orientacion")
        ],
        "Ampliar la gama de carreras con recursos de calidad y orientar con regularidad.", "2B.6", []),
      etapa('3B.6', 'TER', "Amplia gama de carreras STEM y de tecnología",
        "La institución educativa cuenta con acciones para promover trayectorias educativas y laborales asociadas a pensamiento computacional. Por ejemplo, el plan de área que incluyen pensamiento computacional y/o los materiales de estas, hacen referencia con regularidad, a una amplia gama de carreras de las áreas STEM (desde técnicas hasta profesionales), especialmente las relacionadas con tecnología, apoyadas por recursos adecuados de alta calidad. En los grados de educación media los/las docentes STEM u otro personal designado por la institución, proporcionan orientación socio ocupacional sobre carreras de áreas STEM, especialmente las relacionadas con tecnología, pero aún no se han hecho alianzas estratégicas con empresas y entidades de educación terciaria para facilitar el acceso de los/las estudiantes a experiencias de aprendizaje alrededor de tales carreras.",
        [
        h("Trayectorias: amplia gama, desde técnicas hasta profesionales", "ter-trayectorias"),
        h("Recursos de alta calidad sobre carreras", "ter-recursos"),
        h("Orientación socio ocupacional en la media: STEM y tecnología", "ter-orientacion"),
        h("Alianzas con empresas y educación terciaria: aún no", "ter-alianzas")
        ],
        "Dar orientación personalizada que conecte las habilidades de PC con carreras STEM y no STEM.", "3A.6", []),
      etapa('4.6', 'TER', "Orientación personalizada e inspiradora",
        "Los/las docentes de las áreas STEM u otro personal designado por la institución proporcionan orientación específica y personalizada a las/los estudiantes sobre la forma en que el pensamiento computacional y sus habilidades les permiten acceder y ejercer efectivamente una amplia gama de carreras profesionales y oportunidades laborales en campos STEM y no STEM. Esto con el fin de que las/los estudiantes puedan tomar decisiones informadas al seleccionar su carrera. Los contenidos de pensamiento computacional que se enseñan y/o los materiales usados con este propósito, hacen conexiones relevantes entre este y las trayectorias ocupacionales futuras. La orientación socio ocupacional que se ofrece en la institución educativa inspira a los/las estudiantes a estudiar carreras asociadas a las áreas STEM, especialmente las relacionadas con tecnología.",
        [
        h("Orientación específica y personalizada", "ter-personalizada"),
        h("Los contenidos de PC conectan con trayectorias futuras", "ter-conexion"),
        h("Decisiones de carrera informadas", "ter-decisiones")
        ],
        "Que todo docente de PC pueda orientar y vincular a los estudiantes con socios académicos y de la industria.", "3B.6", ["4.1"]),
      etapa('5.6', 'TER', "Estudiantes que viven experiencias STEM reales",
        "Todos los/las docentes que enseñan pensamiento computacional están en capacidad de brindar orientación socio ocupacional específica y personalizada a sus estudiantes. Los/las docentes concientizan sobre la importancia del pensamiento computacional en las trayectorias ocupacionales futuras, a través de participación en reuniones y eventos con la comunidad educativa. La orientación socio ocupacional ofrecida desde la institución educativa proporciona amplias oportunidades para que los/las estudiantes se vinculen con socios académicos y de la industria, y experimenten auténticamente una variedad de opciones de trayectorias educativas en áreas STEM, especialmente las relacionadas con tecnología.",
        [
        h("Todos los/las docentes de PC orientan de forma personalizada", "ter-personalizada"),
        h("Reuniones y eventos con la comunidad educativa", "ter-comunidad"),
        h("Alianzas con socios académicos y de la industria: experiencias auténticas", "ter-alianzas")
        ],
        null, "4.6", ["5.1"]),
      // ── 7. Impacto en los resultados ─────────────────────────────
      etapa('1A.7', 'IMP', "Estudiantes que aún no conocen el PC",
        "Según las pruebas diagnósticas de pensamiento computacional realizadas en la institución educativa, la mayoría de las/los estudiantes no conocen qué es pensamiento computacional ni lo que implican sus subhabilidades. Los resultados de todos(as) los/las estudiantes de la institución, en todas las subhabilidades de pensamiento computacional evaluadas, están en el nivel básico. La mayoría de los/las estudiantes no muestra interés por las áreas en las que se enseña pensamiento computacional.",
        [
        h("Desempeño en pruebas diagnósticas: todos en nivel básico", "imp-desempeno"),
        h("Interés por las áreas con PC: la mayoría no lo muestra", "imp-interes")
        ],
        "Que los estudiantes conozcan el PC y empiecen a interesarse por las áreas donde se enseña.", null, []),
      etapa('1B.7', 'IMP', "Mayoría en nivel básico, baja autoeficacia",
        "Los resultados de la mayoría las/los estudiantes (mitad + 1) en las pruebas diagnósticas de pensamiento computacional están en el nivel básico en todas las subhabilidades, sin que haya evidencia de progresión continua en los aprendizajes de un nivel educativo a otro (de primaria a secundaria y de secundaria a media). Las/los estudiantes con discapacidad, con trastornos específicos del aprendizaje y/o con capacidades o talentos excepcionales no desarrollan adecuadamente sus subhabilidades de pensamiento computacional. El interés en las áreas en las que se enseña pensamiento computacional es perceptible sólo entre algunos/as de los/las estudiantes. El sentido de autoeficacia de la mayoría de los/las estudiantes (mitad + 1) es bajo.",
        [
        h("Desempeño: la mayoría en nivel básico en todas las subhabilidades", "imp-desempeno"),
        h("Progresión entre primaria, secundaria y media: sin evidencia", "imp-progresion"),
        h("Estudiantes con discapacidad o talentos: no desarrollan sus subhabilidades", "imp-inclusion"),
        h("Autoeficacia de los estudiantes: baja", "imp-autoeficacia"),
        h("Interés por las áreas con PC: solo algunos/as", "imp-interes")
        ],
        "Superar el nivel básico en algunas subhabilidades y lograr que la mitad de los estudiantes se interese.", "1A.7", []),
      etapa('2A.7', 'IMP', "La mitad se interesa por el PC",
        "Los resultados de la mayoría de las/los estudiantes (mitad + 1) en las pruebas diagnósticas de pensamiento computacional están en el nivel básico en la mayoría de las subhabilidades evaluadas. La mitad de los/las estudiantes siente interés por las áreas en las que se enseña pensamiento computacional, pero el nivel de autoeficacia de la mayoría sigue siendo bajo.",
        [
        h("Desempeño: básico en la mayoría de las subhabilidades", "imp-desempeno"),
        h("Interés por las áreas con PC: la mitad", "imp-interes"),
        h("Autoeficacia de los estudiantes: baja en la mayoría", "imp-autoeficacia")
        ],
        "Que la mayoría se interese, con autoeficacia intermedia, y empezar a mirar los datos por subgrupos.", "1B.7", []),
      etapa('2B.7', 'IMP', "Mayoría interesada, brechas visibles",
        "Los resultados de la mayoría las/los estudiantes (mitad + 1) en las pruebas diagnósticas de pensamiento computacional están en el nivel básico en sólo algunas de las subhabilidades evaluadas. La mayoría de los/las estudiantes (mitad + 1) siente interés por las áreas en las que se enseña pensamiento computacional y su nivel de autoeficacia es intermedio. Sin embargo, existen diferencias en los niveles de interés y el logro de niños y niñas, o entre otros subgrupos de estudiantes. El impacto de los aprendizajes de los/las estudiantes en pensamiento computacional se define de manera limitada, por ejemplo, solo a través de los resultados de las evaluaciones, y se hace poco uso de los datos para examinar las brechas existentes en niveles de interés y conocimiento entre los grupos poblacionales de la institución.",
        [
        h("Desempeño: básico solo en algunas subhabilidades", "imp-desempeno"),
        h("Autoeficacia de los estudiantes: intermedia", "imp-autoeficacia"),
        h("Brechas entre niños y niñas y entre subgrupos: presentes", "imp-brechas"),
        h("Analiza brechas con datos: poco", "imp-datos")
        ],
        "Alcanzar el nivel intermedio en todas las subhabilidades y reconocer las brechas entre grupos.", "2A.7", []),
      etapa('3A.7', 'IMP', "Nivel esperado en todas las subhabilidades",
        "Las/los estudiantes son capaces de tomar decisiones informadas para elegir carreras en áreas STEM, especialmente las relacionadas con tecnología. La mayoría de ellos/as alcanzan al menos los niveles esperados en su desarrollo del pensamiento computacional, es decir, se encuentran en el nivel intermedio en todas las subhabilidades evaluadas, pero sólo algunos/as obtienen resultados en nivel avanzado. La mayoría de las/los estudiantes de secundaria y media (mitad + 1) reconoce el valor del pensamiento computacional para su futuro y siente interés por las asignaturas asociadas a este en su plan de área. La autoeficacia de los/las estudiantes está en un nivel intermedio. La institución reconoce las brechas existentes en niveles de interés y conocimiento entre los grupos poblacionales, pero todavía no usan los datos para tomar decisiones estratégicas al respecto.",
        [
        h("Desempeño: intermedio en todas, algunos/as en avanzado", "imp-desempeno"),
        h("Valor del PC para su futuro: reconocido en secundaria y media", "imp-valor-futuro"),
        h("Identifican brechas, sin decisiones estratégicas", "imp-brechas")
        ],
        "Usar los datos de las pruebas para decidir cómo cerrar brechas y lograr que un número significativo supere lo esperado.", "2B.7", ["3A.6"]),
      etapa('3B.7', 'IMP', "Datos que guían el cierre de brechas",
        "Las/los estudiantes son capaces de tomar decisiones informadas para elegir carreras en áreas STEM, especialmente las relacionadas con tecnología. La mayoría de ellos/as alcanzan, al menos, los niveles esperados en su desarrollo del pensamiento computacional, con un número significativo que supera las expectativas en cuanto a resultados. Es evidente, que la mayoría de las/los estudiantes de secundaria y media reconoce el valor del pensamiento computacional para su futuro y sienten más interés por las asignaturas en las que este se desarrolla. La autoeficacia de la mayoría de los/las estudiantes está en nivel intermedio, aunque hay algunos estudiantes con un nivel de autoeficacia alto. La institución utiliza los datos de las pruebas diagnósticas de pensamiento computacional realizadas en la institución educativa para tomar decisiones encaminadas a minimizar las brechas existentes.",
        [
        h("Analiza brechas con datos y toma decisiones", "imp-datos"),
        h("Desempeño: un número significativo supera lo esperado", "imp-desempeno"),
        h("Autoeficacia: intermedia, algunos/as en nivel alto", "imp-autoeficacia")
        ],
        "Minimizar las diferencias entre grupos y demostrar progreso de un nivel educativo a otro.", "3A.7", ["3A.8"]),
      etapa('4.7', 'IMP', "Progreso de todos los grupos",
        "Casi todos/as las/los estudiantes están trabajando hacia el alcance de los logros propuestos y hay diferencias mínimas entre el rendimiento de diferentes grupos. La mayoría de las/los estudiantes demuestran progreso nivel a nivel (de primaria a secundaria y de secundaria a media). A través del diagnóstico, se evidencia claramente que los/las estudiantes valoran lo que aprenden en las asignaturas en las que se implementa pensamiento computacional. Hay estudiantes que participan en actividades relacionadas con pensamiento computacional, y estos representan la diversidad de la población en la institución educativa.",
        [
        h("Diferencias mínimas de rendimiento entre grupos", "imp-brechas"),
        h("Progreso de primaria a secundaria y de secundaria a media", "imp-progresion"),
        h("Valoran lo que aprenden en las asignaturas con PC", "imp-interes"),
        h("Participación en actividades de PC que representa la diversidad", "imp-participacion")
        ],
        "Que la mayoría supere lo esperado, con autoeficacia alta y uso del PC en otras áreas.", "3B.7", ["4.3", "4.5"]),
      etapa('5.7', 'IMP', "Estudiantes que aman y lideran el PC",
        "Las/los estudiantes demuestran amor por las asignaturas en las que se desarrolla pensamiento computacional y sus docentes recurren a esto para fomentar el compromiso. La autoeficacia de la mayoría de los/las estudiantes está en un nivel alto. Las/los estudiantes utilizan su conocimiento y comprensión del pensamiento computacional en otras áreas. Los resultados de la mayoría de los/las estudiantes en las pruebas diagnósticas, superan los niveles esperados. Las/los estudiantes demuestran interés particular por las áreas STEM, especialmente las relacionadas con tecnología, asumiendo roles de liderazgo, participando en o creando espacios relacionados con el pensamiento computacional, que les permitan profundizar más en los temas.",
        [
        h("Desempeño: la mayoría supera los niveles esperados", "imp-desempeno"),
        h("Autoeficacia de los estudiantes: alta", "imp-autoeficacia"),
        h("Usan el PC en otras áreas", "imp-transferencia"),
        h("Liderazgo estudiantil: crean espacios para profundizar en PC", "imp-liderazgo")
        ],
        null, "4.7", ["5.2"]),
      // ── 8. Equidad de género ─────────────────────────────
      etapa('1A.8', 'GEN', "Brechas de género invisibles",
        "A nivel institucional no hay iniciativas, ni documentos que mencionen estrategias pedagógicas en pro de la equidad de género en las áreas STEM. No se han identificado las brechas en la autoeficacia y el desempeño académico de niños y niñas en los resultados de las pruebas diagnósticas de pensamiento computacional y/o en los demás procesos evaluativos que realiza la institución.",
        [
        h("Estrategias pedagógicas de equidad de género en STEM: no existen", "gen-estrategias"),
        h("Brechas de autoeficacia y desempeño entre niños y niñas: sin identificar", "gen-brechas")
        ],
        "Identificar las brechas de autoeficacia y desempeño entre niños y niñas.", null, []),
      etapa('1B.8', 'GEN', "Brechas identificadas, sin reflexión",
        "Se han identificado las brechas en la autoeficacia y el desempeño académico de niños y niñas en los resultados de las pruebas diagnósticas de pensamiento computacional y/o en los demás procesos evaluativos que realiza la institución en las áreas STEM, sin embargo, no hay espacios de reflexión sobre su origen, ni hay acciones concretas para cerrarlas.",
        [
        h("Brechas de autoeficacia y desempeño: identificadas", "gen-brechas"),
        h("Espacios de reflexión sobre su origen: no hay", "gen-reflexion"),
        h("Acciones para cerrarlas: ninguna", "gen-acciones")
        ],
        "Abrir espacios institucionales de reflexión sobre el origen y el impacto de las brechas.", "1A.8", []),
      etapa('2A.8', 'GEN', "Se reflexiona sobre el origen de las brechas",
        "Se han identificado las brechas en la autoeficacia y el desempeño académico de niños y niñas en los resultados de las pruebas diagnósticas de pensamiento computacional y/o en los demás procesos evaluativos que realiza la institución en las áreas STEM, y a nivel institucional se generan espacios de reflexión sobre su origen y el impacto que estas tienen en la comunidad educativa. Sin embargo, no se promueven acciones pedagógicas concretas en pro de la equidad, ni se cuenta con planes estructurados para cerrar las brechas existentes.",
        [
        h("Espacios institucionales de reflexión", "gen-reflexion"),
        h("Acciones pedagógicas en pro de la equidad: aún no se promueven", "gen-acciones")
        ],
        "Implementar las primeras acciones en el aula para cerrar las brechas.", "1B.8", []),
      etapa('2B.8', 'GEN', "Primeras acciones, no sistemáticas",
        "Algunos/as docentes reconocen las brechas existentes en la autoeficacia y el desempeño académico de niños y niñas en los resultados de las pruebas diagnósticas de pensamiento computacional y/o en los demás procesos evaluativos que realiza la institución en las áreas STEM, y se implementan algunas acciones para cerrar las brechas existentes, pero estas no son sistemáticas.",
        [
        h("Algunos/as docentes reconocen las brechas", "gen-seguimiento"),
        h("Acciones para cerrar las brechas: algunas, no sistemáticas", "gen-acciones"),
        h("Prácticas observadas en el aula: corrección del sexismo, reflexión sobre equidad", "gen-practicas")
        ],
        "Que la mayoría de docentes haga seguimiento a las brechas y actúe en sus aulas.", "2A.8", []),
      etapa('3A.8', 'GEN', "La mayoría de docentes actúa en el aula",
        "La mayoría de los docentes (mitad +1) hace seguimiento a las brechas en la autoeficacia y el desempeño académico de niños y niñas en los resultados de las pruebas diagnósticas de pensamiento computacional y/o en los demás procesos evaluativos que realiza la institución en las áreas STEM, e implementan acciones para reducirlas en sus aulas de clase. Se realizan iniciativas cívicas y campañas comunicativas con docentes y eventualmente con estudiantes, con el fin de visibilizar las brechas de género en áreas STEM, pero no se promueven transformaciones.",
        [
        h("Seguimiento a las brechas: la mayoría de docentes", "gen-seguimiento"),
        h("Acciones para reducir las brechas en el aula", "gen-acciones"),
        h("Campañas para visibilizar las brechas de género en STEM", "gen-campanas")
        ],
        "Que todo el equipo STEM actúe y que la institución promueva transformaciones.", "2B.8", []),
      etapa('3B.8', 'GEN', "Toda la institución visibiliza y transforma",
        "La institución hace seguimiento a las brechas en la autoeficacia y el desempeño académico de niños y niñas en los resultados de las pruebas diagnósticas de pensamiento computacional y/o en los demás procesos evaluativos que realiza la institución en las áreas STEM. Todos/as los/las docentes de áreas STEM reconocen las brechas existentes e implementan acciones para reducirlas en sus aulas de clase. Se hacen visibles las brechas de género en áreas STEM a la comunidad educativa institucional en general, y se promueven algunas transformaciones. Por ejemplo, se visibilizan las contribuciones de las mujeres a las áreas STEM.",
        [
        h("Seguimiento institucional a las brechas", "gen-seguimiento"),
        h("Todos/as los/las docentes STEM implementan acciones", "gen-acciones"),
        h("Se visibilizan las contribuciones de las mujeres a STEM", "gen-mujeres-stem"),
        h("Transformaciones promovidas en la comunidad educativa", "gen-transformaciones")
        ],
        "Incorporar estrategias de cierre de brechas en planes y recursos, con formación docente y acciones afirmativas.", "3A.8", []),
      etapa('4.8', 'GEN', "Estrategias de género en planes y recursos",
        "Los planes de estudio de las áreas STEM y/o los recursos pedagógicos que se utilizan para el fomento del pensamiento computacional en estas áreas incorporan estrategias para el cierre de las brechas de género. Por ejemplo, se visibilizan las contribuciones de las mujeres a las áreas STEM, se implementan narrativas para enmarcar los retos de codificación, se promueve el liderazgo femenino y trabajo en equipo con roles rotativos, entre otras. La institución facilita espacios de capacitación para los y las docentes en temas de equidad de género y apoya la aplicación de acciones afirmativas en las aulas de clases. Sin embargo, falta institucionalizar dichas estrategias en todas las disciplinas y hacer una revisión constante de su aplicación, particularmente en las áreas STEM.",
        [
        h("Liderazgo femenino y trabajo en equipo con roles rotativos", "gen-liderazgo-femenino"),
        h("Narrativas para enmarcar los retos de programación", "gen-narrativas"),
        h("Formación docente en equidad de género", "gen-formacion"),
        h("Acciones afirmativas en el aula", "gen-afirmativas"),
        h("Se visibilizan las contribuciones de las mujeres a STEM", "gen-mujeres-stem")
        ],
        "Institucionalizar y revisar las estrategias en todas las disciplinas, aliarse con entidades externas y compartir las prácticas.", "3B.8", ["4.4"]),
      etapa('5.8', 'GEN', "Igualdad de oportunidades institucionalizada",
        "Los planes de estudio de las áreas STEM y/o los recursos pedagógicos que se utilizan para el fomento del pensamiento computacional en estas áreas incorporan estrategias pedagógicas, que se encuentran en constante revisión, para cerrar las brechas de género. La mayoría (mitad+1) de la planta docente reconoce las brechas existentes e implementa acciones para reducirlas en sus aulas de clase. Igualmente, la institución implementa estrategias y políticas para una educación con igualdad de oportunidades para niños y niñas. Se tienen alianzas con entidades externas que promueven la equidad de género en las áreas STEM. Se promueven y comparten las prácticas pedagógicas en pro de la equidad de género con otros/as docentes e instituciones educativas.",
        [
        h("Estrategias pedagógicas en revisión constante", "gen-estrategias"),
        h("Políticas de igualdad de oportunidades para niños y niñas", "gen-politicas"),
        h("Alianzas con entidades que promueven la equidad de género en STEM", "gen-alianzas"),
        h("Comparten sus prácticas con otras instituciones", "gen-compartir")
        ],
        null, "4.8", ["4.1"])
    ],
    trayectorias: [
      { id: 'vision-aula', nombre: "De la visión al aula", descripcion: "Cómo el liderazgo directivo se traduce en el plan de área, en las prácticas de aula y en los resultados.", nodos: ["2A.1", "2B.1", "3A.1", "3A.2", "3A.3", "3B.2", "3B.3", "4.3", "4.7"] },
      { id: 'brechas', nombre: "Cierre de brechas", descripcion: "Identificar, reflexionar y actuar sobre las brechas de género e inclusión hasta que no haya diferencias entre grupos.", nodos: ["1B.8", "2A.8", "2B.7", "3A.8", "3B.5", "3B.7", "4.5", "4.8", "4.7"] },
      { id: 'rotacion', nombre: "Sostenibilidad ante la rotación", descripcion: "Que la calidad de la enseñanza del PC no dependa de una sola persona.", nodos: ["2B.4", "3A.4", "3B.2", "3B.4", "4.1"] },
      { id: 'terciaria', nombre: "Hacia la educación terciaria", descripcion: "Del reconocimiento del PC en el futuro de los estudiantes a experiencias reales con aliados.", nodos: ["2B.6", "3A.6", "3A.7", "3B.6", "4.1", "4.6", "5.6"] },
      { id: 'region', nombre: "Proyección regional", descripcion: "El nivel 5 de varias dimensiones: la institución comparte su experiencia con otras.", nodos: ["4.1", "5.1", "5.3", "5.4", "5.5", "5.8"] }
    ]
  };
})();
