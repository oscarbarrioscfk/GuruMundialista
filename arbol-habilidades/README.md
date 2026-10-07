# 🌳 Árbol de Habilidades

Herramienta para visualizar **progresiones de aprendizaje como un árbol de habilidades**
(*skill tree*) al estilo de los videojuegos, con el look & feel de las Guías de
Pensamiento Computacional de Colombia Programa (British Council · MinTIC).

Viene cargada con la progresión de las guías de Pensamiento Computacional (9 ramas,
12 grados, 60 guías, 7 evaluaciones integradoras y 48 habilidades), combinando dos fuentes:

- **Póster** *"Progresión de aprendizajes desde transición hasta 11°"* → títulos y habilidades N0/N1/N2.
- **Anexo 1. Grafo guías** del equipo pedagógico → eje principal y secundarios, herramienta
  y prerrequisitos **indispensables** y **deseables** de cada guía (77 + 20 dependencias).

Trae también un segundo ejemplo, el **árbol de habilidades institucionales** del
*Marco de Calidad para la enseñanza del pensamiento computacional* (ver más abajo).

🌐 **En línea:** <https://oscarbarrioscfk.github.io/GuruMundialista/arbol-habilidades/>
· Marco de Calidad: <https://oscarbarrioscfk.github.io/GuruMundialista/arbol-habilidades/?ejemplo=marco>

> Flujo de uso y modelo de datos: [`docs/FLUJO_DE_USO.md`](docs/FLUJO_DE_USO.md)

---

## ▶️ Cómo abrirla

Entra al enlace de arriba, o abre `index.html` en el navegador (doble clic): no necesita
instalación ni conexión a internet. Se publica con GitHub Pages desde la rama `main`.

## ✨ Qué hace

### Explorar (visor)

| Función | Cómo se usa |
|---|---|
| **Árbol radial** | Raíz al centro, una rama por eje, un anillo por grado. El ancho de cada rama se ajusta a su densidad. |
| **Categorías y perfiles** | Las ramas se agrupan en categorías (*Conceptos y habilidades en computación*, *Prácticas de resolución de problemas usando la computación*, *Ciudadanía digital*) con su color y su arco. Cada categoría termina en un **perfil** (*Programador(a)*, *Innovador(a) con la tecnología*, *Ciudadano(a) digital*): el árbol crece desde la raíz hacia la persona. Clic en un perfil o en su grupo del panel enfoca toda la categoría. |
| **Vista por niveles** | Sección *Vista* del panel: cuatro niveles de lo simple a lo complejo (**1** Ramas · **2** Conexiones · **3** Categorías · **4** Perfiles) y capas que se activan o desactivan una por una (conexiones, proyectos, ejes secundarios, categorías, perfiles). Aunque las conexiones estén apagadas, al hacer clic en una guía se ven sus requisitos. Cada proyecto recuerda su vista. |
| **Vista póster** | La misma información en la cuadrícula ejes × grados del póster BC. El cambio entre vistas es animado. |
| **Zoom semántico** | Lejos: ramas · Medio: guías · Cerca: habilidades con su rango (●○○ N0, ●●○ N1, ●●● N2). Las etiquetas aparecen solo donde caben. |
| **Requisitos y desbloqueos** | Clic en una guía: en azul lo que requiere, en morado lo que desbloquea (fuerte lo directo, suave lo indirecto). Línea continua = indispensable, a trazos = deseable. |
| **Fuente de conexiones** | *Grafo del equipo* (por defecto), *Habilidades* (cadenas derivadas de las habilidades que se repiten) o *Ambas* para compararlas. |
| **Foco por rama** | Clic en una rama (en el árbol o en el panel) para encuadrarla y atenuar el resto. |
| **Trayectorias** | 4 rutas de ejemplo (*De bloques a texto*, *Creadores con micro:bit*, *Detectives de datos*, *IA responsable*) y creación de rutas propias haciendo clic en las guías. |
| **Anillos por nivel de aprendizaje** | Sección *Vista* → *Anillos*: por grados o **por nivel de aprendizaje** (ver abajo). |
| **Filtros y búsqueda** | Por herramienta (Scratch, micro:bit, Python…), rango N0/N1/N2 o texto. *Anillos visibles* deja solo los anillos elegidos (p. ej. de 5° a 7°) y redibuja el árbol con ellos; la ficha avisa qué requisitos quedaron fuera. |
| **Modo estudiante** | Marca guías completadas; se iluminan las disponibles. Solo bloquean los prerrequisitos indispensables; los deseables aparecen como recomendación. Cada perfil muestra su avance (*Aprendiz → Explorador(a) → Experto(a)*). |
| **Diagnóstico** | Mapa de equilibrio rama × grado (con *todas las asociaciones* reproduce el mapa de calor «Currículo en Pensamiento Computacional» del equipo) y alertas de diseño: ramas sin guías propias, dependencias incoherentes, guías desconectadas, saltos (N0 → N2) y retrocesos de rango. |
| **Archivo** | Guardar y abrir el proyecto (`.json`), descargar imagen (`.svg` / `.png` en alta resolución). |

### Diseñar (editor)

| Función | Cómo se usa |
|---|---|
| **Mis proyectos** | *Archivo → Mis proyectos* guarda varios diseños en el navegador. El ejemplo de Pensamiento Computacional siempre está disponible y se puede restablecer. |
| **Nuevo proyecto** | *Archivo → Nuevo proyecto*: título, tipo (**libro de texto** con grados y guías, o **curso de FP** con módulos y unidades), niveles y ramas. |
| **Guardar una copia** | Duplica el proyecto abierto para experimentar sin tocar el original. |
| **✎ Diseñar** | Activa el modo edición: **doble clic** en un hueco (anillo × rama) crea una guía ahí; **arrastrar** de una guía a otra las conecta (con **Mayús**, deseable); **clic** abre su ficha editable. |
| **Ficha editable** | Código, título, tipo, nivel, rama principal y secundarias, herramientas, habilidades con nivel N0/N1/N2 y clave, prerrequisitos indispensables y deseables. |
| **Estructura** | Pestaña para editar el proyecto (título, vocabulario), las **categorías y perfiles** (nombre, perfil, avatar, colores), las ramas (nombre, color, ícono, categoría, orden) y los niveles. |
| **Deshacer** | Botón ↶ o **Ctrl+Z** (hasta 80 pasos), también para deshacer una importación completa. |
| **Hojas de cálculo** | Importar y exportar un libro `.xlsx` con las hojas *Grafo guías*, *Habilidades* y *Categorías*, o descargar la plantilla vacía. |

Todo se guarda **solo en el navegador** de quien lo usa. Para compartir un diseño, expórtalo
en `.json` o en hoja de cálculo.

## 👁 Compartir en solo lectura (para docentes)

- **Archivo → 🔗 Compartir enlace de solo lectura** genera un enlace con el proyecto **dentro del propio
  enlace** (comprimido, unos 7 mil caracteres para el ejemplo completo) y con la vista elegida:
  nivel, capas y árbol radial o póster. No necesita servidor ni cuentas.
- Quien lo abre ve el árbol sin herramientas de edición. Puede explorar (zoom, niveles, filtros,
  rutas, detalle), usar el **modo estudiante** y descargar imágenes. Su progreso queda en su navegador
  y nunca toca los proyectos de quien diseñó.
- **✎ Abrir una copia editable** guarda una copia en *Mis proyectos* para modificarla.
- El ejemplo de Pensamiento Computacional en solo lectura:
  <https://oscarbarrioscfk.github.io/GuruMundialista/arbol-habilidades/?lectura>
- Para proyectos muy grandes, publica el `.json` (por ejemplo en este repositorio) y comparte
  `…/arbol-habilidades/?lectura&url=<dirección del .json>`.

Si se cambia el diseño, hay que compartir un enlace nuevo: el enlace guarda el proyecto tal como estaba
al generarlo.

## 🎚️ Anillos por nivel de aprendizaje

En el pilotaje, los/las docentes no eligieron las guías por el grado de su curso sino por lo
que ya sabían sus estudiantes: la guía más usada fue la **5.1**, porque trae todo lo necesario
para empezar con la micro:bit. Por eso el árbol se puede leer de una segunda forma, como los
niveles A1, A2, B1… de inglés: **¿en qué punto de la rama están mis estudiantes y hasta dónde
quiero llevarlos?**

| Momento | Nivel | Qué hacen los estudiantes |
|---|---|---|
| Lo básico | **1 · Exploración** | Reconocen ideas del PC en su entorno: siguen instrucciones, encuentran patrones, clasifican. Sin conocimientos previos. |
| Lo básico | **2 · Fundamentos** | Primer encuentro guiado con un concepto o una herramienta. Aquí están las puertas de entrada: 2.2 ScratchJr, 3.1 Scratch, 5.1 micro:bit, 7.4 hojas de cálculo, 8.4 PhET. |
| Práctica | **3 · Práctica** | Usan con autonomía lo que conocen y lo combinan (habilidades en N1). 9.4 (entrada a Python) está aquí: lleva a texto lo que ya saben en bloques. |
| Práctica | **4 · Profundización** | Dominan conceptos y pasan a herramientas más potentes: arreglos, funciones, pines, Python, análisis de datos (N2). |
| Apropiación | **5 · Apropiación** | Integran y transfieren: soluciones completas, análisis crítico de datos e IA. Incluye los proyectos integradores. |

**Cómo se asignó cada guía** (todas tienen su *porqué* en la ficha):

- **Grafo del equipo**: ningún prerrequisito indispensable queda en un nivel más alto que la guía que lo
  necesita. Solo dos *deseables* apuntan hacia atrás, a propósito: 4.3 → 5.1 y 7.1 → 9.4 (venir de
  Scratch ayuda para la micro:bit y para Python, pero no es indispensable).
- **Nivel de dominio de las habilidades**: N0 suele ser *Fundamentos*, N1 *Práctica* y N2 *Profundización*.
- **Lo que hacen los estudiantes**: reconocer → usar guiado → aplicar y combinar → dominar → crear y criticar.
- **Proyectos integradores**: un nivel por encima de lo que integran.

Reparto: 7 guías en Exploración, 16 en Fundamentos, 16 en Práctica, 17 en Profundización y 11 en
Apropiación (5 guías y 6 proyectos). El código de cada guía sigue indicando su grado de referencia.

- **Planear desde lo que saben** (pestaña *Rutas*): eliges la rama, lo que ya dominan y hasta dónde
  quieres llevarlos. Sale la lista ordenada de guías, incluidas las de otras ramas que son
  indispensables en el camino (p. ej. 6.3 y 7.3 para computación física), qué se da por sabido y
  por dónde empezar. Se puede ver en el árbol o guardar como ruta.
- En **modo diseño**, la ficha de cada guía permite cambiar su nivel de aprendizaje y su porqué, y la
  pestaña *Estructura* permite renombrar los niveles o crearlos en cualquier proyecto.
- Enlace directo: `?ejemplo=pc&anillos=aprendizaje` (en solo lectura, `?lectura&ejemplo=pc&anillos=aprendizaje`).

## 🏫 Árbol de habilidades institucionales (Marco de Calidad)

Segundo proyecto de ejemplo (**Archivo → Mis proyectos**, o el enlace `?ejemplo=marco`;
en solo lectura `?lectura&ejemplo=marco`). Muestra cómo una institución educativa avanza
en el *Marco de Calidad para la enseñanza del pensamiento computacional* (MinTIC · British
Council · Universidad del Norte, julio 2025), leído junto con los criterios del Monitoreo y
Evaluación de Colombia Programa 2024-2026.

| Elemento del árbol | En el marco |
|---|---|
| Anillos (niveles) | Los 8 niveles: **1A–1B** Emergente · **2A–2B** En progreso inicial · **3A–3B** En consolidación · **4–5** Consolidado |
| Ramas | Las 8 dimensiones; cada una es su propia categoría |
| Etapas (nodos) | Una por dimensión y nivel; el código es *nivel.dimensión* (`3B.2` = nivel 3B de Plan de área) |
| Descripción de la etapa | El texto del marco para ese nivel, tal cual |
| Criterios | Lo que se observa y mide en ese nivel (criterios de clasificación de M&E). Un mismo criterio en varios niveles forma su cadena de mejora (fuente **Habilidades**) |
| Para avanzar | Qué tiene que cambiar para pasar al nivel siguiente |
| Conexiones | Indispensable: el nivel anterior de la misma dimensión. Deseable: apoyos entre dimensiones (p. ej. *3B.4 Formación con visión de largo plazo* → *4.1 Reducción del impacto de la rotación*) |
| Perfiles | Cómo luce el nivel 5 de cada dimensión |
| Autoevaluación | El modo de progreso: la institución marca los niveles que ya alcanzó y ve qué sigue |
| Rutas | De la visión al aula · Cierre de brechas · Sostenibilidad ante la rotación · Hacia la educación terciaria · Proyección regional |

Perfiles finales:

1. **Liderazgo y visión** → Directivos docentes activos en el fomento del pensamiento computacional
2. **Plan de área** → Docentes de todas las áreas que tejen el PC de transición a 11°
3. **Enseñanza, aprendizaje y evaluación** → Docentes que enseñan, evalúan y comparten el PC con maestría
4. **Desarrollo profesional** → Pares expertos(as) que forman y acompañan a docentes de la región
5. **Equidad, diversidad e inclusión** → Estudiantes de todas las poblaciones que se sienten capaces en PC
6. **Proyección en educación terciaria** → Jóvenes que eligen con información su futuro en STEM
7. **Impacto en los resultados** → Estudiantes que aman el PC y lo aplican en todas las áreas
8. **Equidad de género** → Niñas y adolescentes empoderadas en STEM

Los criterios de *Liderazgo* y *Plan de área* son los de los mapas de calor de M&E; los de
*Enseñanza* y *Equidad de género* incluyen las prácticas observadas en aula; los de las demás
dimensiones se derivan del texto del marco y de los instrumentos (TPACK, autoeficacia,
mentoría, redes). Están en `js/datos-marco.js` para ajustarlos con el equipo de M&E.

## 🧭 Crear un diseño propio en 5 pasos

1. *Archivo → Nuevo proyecto*: elige libro o curso de FP y escribe niveles y ramas (uno por línea).
2. Con **✎ Diseñar** activo, haz doble clic en cada anillo/rama para crear las guías o unidades.
3. En la ficha de cada una, escribe su título, habilidades (N0/N1/N2) y herramientas.
4. Arrastra de una guía a otra para marcar prerrequisitos (Mayús = deseable). Revisa el **Diagnóstico**.
5. Exporta a hoja de cálculo para compartirlo con el equipo, o descarga el póster en PNG/SVG.

Si el diseño ya existe en Excel, descarga la **plantilla vacía**, llénala y usa *Importar hoja de cálculo*.

## 📊 Hojas de cálculo

*Archivo → Importar hoja de cálculo* acepta `.xlsx`, `.xltx` y `.csv`. Cada hoja se reconoce
por sus columnas (aunque cambie el orden o falten algunas), y un mismo libro puede traer las dos.

**Grafo guías** (una fila por guía, el formato del *Anexo 1*):

| Guía | Guía indispensable | Guía deseable | Subcategoría | Subcategoría 2 | Subcategoría 3 | Herramienta computacional |
|---|---|---|---|---|---|---|
| 7.1 | 6.2, 6.4 | | Lógica, Programación y Depuración | | | Scratch |

Al final pueden ir cuatro columnas opcionales: **Descripción** y **Para avanzar** (el texto largo
de cada nodo, que usa el Marco de Calidad), y **Nivel de aprendizaje** y **Por qué en este nivel**.
El nivel se puede escribir como número (`3`), nombre (`Práctica`) o completo (`3 · Práctica`):
así el equipo puede revisar la asignación en Excel y volver a importarla.

**Habilidades** (una fila por habilidad):

| Guía | Título | Habilidad | Nivel de dominio | Clave |
|---|---|---|---|---|
| 7.1 | El juego del control | Scratch | N1 | scratch |
| 7.1 | | Condicionales | N2 | condicionales |

**Categorías** (opcional, como la tabla de categorías del equipo):

| Categoría principal | Subcategorías | Perfil |
|---|---|---|
| Conceptos y habilidades en computación | Algoritmos, patrones, abstracción y descomposición | Programador(a) |
| | Lógica, programación y depuración | |

- *Subcategoría* es la rama principal; *Subcategoría 2 y 3*, las secundarias.
- En *Categorías*, una subcategoría por fila; la categoría y el perfil basta con escribirlos en su primera fila (sirve la tabla con celdas combinadas).
- *Nivel de dominio*: `N0`, `N1`, `N2` (o vacío). El título basta en la primera fila de cada guía.
- *Clave* (opcional): la misma clave en varias guías indica que es la misma habilidad que se profundiza.
- Los códigos `T1` y `T.1` son equivalentes; el número antes del punto es el nivel.
- Las guías, ramas y niveles nuevos se crean solos. Al terminar se muestra un resumen de cambios y avisos.
- *Exportar a hoja de cálculo* genera el libro completo (grafo, habilidades e instrucciones).

## 🔗 Conexiones derivadas de habilidades

Además del grafo del equipo, la herramienta puede derivar conexiones de las habilidades.
Cada habilidad tiene una `clave`. Si la misma clave aparece en varias guías, se forma una
**cadena de mejora**: cada aparición se conecta con la más reciente de mayor rango en el
grado anterior (o con una guía previa del mismo grado si el rango sube). Por ejemplo:

```
Condicionales:  5.2 (N0) → 5.3 (N1) → 6.1 / 6.4 (N1) → 7.1 (N2) → 8.1 / 8.3 (N1) → 9.1 (N1)
```

En esa vista, cada *Evaluación y proyectos* recibe todas las guías de su grado. Con
*Ambas* se ve qué dependencias del equipo están respaldadas por habilidades compartidas
(solo 25 de las 62 dependencias entre guías lo están: una buena conversación para el equipo).

## 🗂️ Formato del proyecto (JSON)

```jsonc
{
  "titulo": "Pensamiento Computacional",
  "tipo": "libro",                       // "libro" o "curso" (FP)
  "vocabulario": { "nivel": "Grado", "nodo": "Guía", "raiz": "Pensamiento computacional",
                   "habilidad": "Habilidad", "modo": "Modo estudiante" },   // los dos últimos, opcionales
  "categorias": [{ "id": "CON", "nombre": "Conceptos y habilidades en computación", "perfil": "Programador(a)",
                   "icono": "programador", "color": "#3F6FAE", "tinte": "#DCE5F4" }],
  "niveles": [{ "id": "T", "nombre": "Transición", "corto": "T" }],
  "aprendizaje": {                       // opcional: segunda forma de ordenar los anillos
    "nombre": "Nivel de aprendizaje",
    "niveles": [{ "id": "n1", "nombre": "1 · Exploración", "corto": "1", "bloque": "Lo básico", "descripcion": "…" }]
  },
  "ramas":   [{ "id": "ALG", "categoria": "CON", "nombre": "Algoritmos…", "corto": "Algoritmos", "color": "#662B80", "icono": "algoritmos" }],
  "nodos": [{
    "id": "6.3", "codigo": "6.3", "titulo": "Invernaderos",
    "nivel": "6", "rama": "DAT", "ramasSecundarias": ["FIS"],
    "tipo": "guia",                       // "guia" o "proyecto"
    "descripcion": "…", "avance": "…",    // opcionales: texto largo y «para avanzar»
    "aprendizaje": "n3",                  // opcional: nivel de aprendizaje (id de aprendizaje.niveles)
    "motivoAprendizaje": "…",             // opcional: por qué en ese nivel
    "habilidades": [{ "nombre": "Variables en micro:bit", "rango": 0, "clave": "variables" }],
    "herramientas": ["MakeCode", "micro:bit"],
    "prerrequisitos": ["6.1"],            // indispensables (ids de nodos)
    "deseables": []                       // deseables (ids de nodos)
  }],
  "trayectorias": [{ "id": "datos", "nombre": "Detectives de datos", "nodos": ["T.2", "1.4"] }]
}
```

Íconos de rama: `algoritmos`, `programacion`, `datos`, `fisica`, `modelacion`, `ia`,
`seguridad`, `equidad`, `etica`, `liderazgo`, `plan`, `ensenanza`, `desarrollo`, `inclusion`,
`terciaria`, `impacto`, `genero`, `generico`. Avatares de perfil: `programador`, `innovador`,
`ciudadano`, `directivo`, `plan`, `docente`, `mentor`, `diversidad`, `joven`, `estudiante`,
`nina`, `generico`.

## 🧱 Estructura

| Archivo | Qué contiene |
|---|---|
| `index.html` | Página e íconos de las ramas |
| `css/estilos.css` | Look & feel BC (paleta, bandas, píldoras, bordes punteados) |
| `js/datos-pc.js` | Datos semilla: póster + grafo del equipo (`GRAFO_EQUIPO`) |
| `js/datos-marco.js` | Datos semilla: Marco de Calidad (8 dimensiones × 8 niveles) con criterios de M&E |
| `js/modelo.js` | Conexiones, recorridos, modo estudiante y diagnóstico (sin DOM) |
| `js/hoja.js` | Lectura de `.xlsx`/`.xltx`/`.csv` y escritura de `.xlsx`, sin librerías |
| `js/grafo.js` | Traducción entre las hojas (grafo y habilidades) y el proyecto |
| `js/editor.js` | Operaciones de edición: crear, conectar, renombrar y eliminar (sin DOM) |
| `js/disenio.js` | Interfaz del modo diseño: ficha editable y pestaña Estructura |
| `js/compartir.js` | Enlaces de solo lectura: comprime el proyecto dentro del enlace |
| `js/vista.js` | Dibujo con D3: disposiciones radial y póster, zoom, resaltados, exportación |
| `js/app.js` | Paneles, filtros, trayectorias, archivos, proyectos, historial y guardado local |
| `lib/d3.min.js` | D3 v7.9.0 incluido para funcionar sin conexión (licencia ISC en `lib/D3-LICENSE.txt`) |

## ⚠️ Pendiente de validar con el equipo pedagógico

- Las **claves** que agrupan habilidades parecidas (p. ej. *Seguir instrucciones* y *Seguir
  instrucciones en tarjetas*) son una propuesta y definen las conexiones.
- La tipografía del póster es *Basic Sans*; en la web se usa **Nunito Sans** como equivalente libre.
- Los íconos de las ramas son los vectores originales del póster. Los colores de cada categoría usan familias de la paleta de las guías: azul periwinkle (*Conceptos*), lavanda (*Prácticas*) y rosa (*Ciudadanía digital*), en tonos sobrios; cada rama es un tono de la familia de su categoría.
- Los nombres de los perfiles son una propuesta para conversar con el equipo.
- El **nivel de aprendizaje** de cada guía es una propuesta a partir del grafo, los rangos N0/N1/N2
  y los títulos de las habilidades. Conviene revisarla con quienes conocen el contenido de cada guía
  (p. ej. 11.5 *Científicas(os) en las aulas*, con PhET en N0, quedó en Fundamentos).

## 🛣️ Fases

1. ✅ **Visor**: árbol radial y póster, zoom semántico, trayectorias, modo estudiante, diagnóstico.
2. ✅ **Editor**: proyectos propios, modo diseño, hojas de grafo y habilidades, deshacer.
3. **Salida**: ✅ visor de solo lectura para docentes · póster PDF para el libro.
4. **Colaboración**: proyectos compartidos entre varios autores (p. ej. con Supabase).
5. **Curso de FP real**: probar el flujo con un programa de formación profesional.
