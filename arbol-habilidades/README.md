# 🌳 Árbol de Habilidades

Herramienta para visualizar **progresiones de aprendizaje como un árbol de habilidades**
(*skill tree*) al estilo de los videojuegos, con el look & feel de las Guías de
Pensamiento Computacional de Colombia Programa (British Council · MinTIC).

Viene cargada con la progresión de las guías de Pensamiento Computacional (9 ramas,
12 grados, 60 guías, 7 evaluaciones integradoras y 48 habilidades), combinando dos fuentes:

- **Póster** *"Progresión de aprendizajes desde transición hasta 11°"* → títulos y habilidades N0/N1/N2.
- **Anexo 1. Grafo guías** del equipo pedagógico → eje principal y secundarios, herramienta
  y prerrequisitos **indispensables** y **deseables** de cada guía (77 + 20 dependencias).

🌐 **En línea:** <https://oscarbarrioscfk.github.io/GuruMundialista/arbol-habilidades/>

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
| **Vista póster** | La misma información en la cuadrícula ejes × grados del póster BC. El cambio entre vistas es animado. |
| **Zoom semántico** | Lejos: ramas · Medio: guías · Cerca: habilidades con su rango (●○○ N0, ●●○ N1, ●●● N2). Las etiquetas aparecen solo donde caben. |
| **Requisitos y desbloqueos** | Clic en una guía: en azul lo que requiere, en morado lo que desbloquea (fuerte lo directo, suave lo indirecto). Línea continua = indispensable, a trazos = deseable. |
| **Fuente de conexiones** | *Grafo del equipo* (por defecto), *Habilidades* (cadenas derivadas de las habilidades que se repiten) o *Ambas* para compararlas. |
| **Foco por rama** | Clic en una rama (en el árbol o en el panel) para encuadrarla y atenuar el resto. |
| **Trayectorias** | 4 rutas de ejemplo (*De bloques a texto*, *Creadores con micro:bit*, *Detectives de datos*, *IA responsable*) y creación de rutas propias haciendo clic en las guías. |
| **Filtros y búsqueda** | Por herramienta (Scratch, micro:bit, Python…), rango N0/N1/N2, rango de grados o texto. |
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
  "vocabulario": { "nivel": "Grado", "nodo": "Guía", "raiz": "Pensamiento computacional" },
  "categorias": [{ "id": "CON", "nombre": "Conceptos y habilidades en computación", "perfil": "Programador(a)",
                   "icono": "programador", "color": "#3F6FAE", "tinte": "#DCE5F4" }],
  "niveles": [{ "id": "T", "nombre": "Transición", "corto": "T" }],
  "ramas":   [{ "id": "ALG", "categoria": "CON", "nombre": "Algoritmos…", "corto": "Algoritmos", "color": "#662B80", "icono": "algoritmos" }],
  "nodos": [{
    "id": "6.3", "codigo": "6.3", "titulo": "Invernaderos",
    "nivel": "6", "rama": "DAT", "ramasSecundarias": ["FIS"],
    "tipo": "guia",                       // "guia" o "proyecto"
    "habilidades": [{ "nombre": "Variables en micro:bit", "rango": 0, "clave": "variables" }],
    "herramientas": ["MakeCode", "micro:bit"],
    "prerrequisitos": ["6.1"],            // indispensables (ids de nodos)
    "deseables": []                       // deseables (ids de nodos)
  }],
  "trayectorias": [{ "id": "datos", "nombre": "Detectives de datos", "nodos": ["T.2", "1.4"] }]
}
```

Íconos de rama: `algoritmos`, `programacion`, `datos`, `fisica`, `modelacion`, `ia`,
`seguridad`, `equidad`, `etica`, `generico`. Avatares de perfil: `programador`, `innovador`,
`ciudadano`, `generico`.

## 🧱 Estructura

| Archivo | Qué contiene |
|---|---|
| `index.html` | Página e íconos de las ramas |
| `css/estilos.css` | Look & feel BC (paleta, bandas, píldoras, bordes punteados) |
| `js/datos-pc.js` | Datos semilla: póster + grafo del equipo (`GRAFO_EQUIPO`) |
| `js/modelo.js` | Conexiones, recorridos, modo estudiante y diagnóstico (sin DOM) |
| `js/hoja.js` | Lectura de `.xlsx`/`.xltx`/`.csv` y escritura de `.xlsx`, sin librerías |
| `js/grafo.js` | Traducción entre las hojas (grafo y habilidades) y el proyecto |
| `js/editor.js` | Operaciones de edición: crear, conectar, renombrar y eliminar (sin DOM) |
| `js/disenio.js` | Interfaz del modo diseño: ficha editable y pestaña Estructura |
| `js/vista.js` | Dibujo con D3: disposiciones radial y póster, zoom, resaltados, exportación |
| `js/app.js` | Paneles, filtros, trayectorias, archivos, proyectos, historial y guardado local |
| `lib/d3.min.js` | D3 v7.9.0 incluido para funcionar sin conexión (licencia ISC en `lib/D3-LICENSE.txt`) |

## ⚠️ Pendiente de validar con el equipo pedagógico

- Las **claves** que agrupan habilidades parecidas (p. ej. *Seguir instrucciones* y *Seguir
  instrucciones en tarjetas*) son una propuesta y definen las conexiones.
- La tipografía del póster es *Basic Sans*; en la web se usa **Nunito Sans** como equivalente libre.
- Los íconos de las ramas son los vectores originales del póster. Los colores de cada categoría usan familias de la paleta de las guías: azul periwinkle (*Conceptos*), lavanda (*Prácticas*) y rosa (*Ciudadanía digital*), en tonos sobrios; cada rama es un tono de la familia de su categoría.
- Los nombres de los perfiles son una propuesta para conversar con el equipo.

## 🛣️ Fases

1. ✅ **Visor**: árbol radial y póster, zoom semántico, trayectorias, modo estudiante, diagnóstico.
2. ✅ **Editor**: proyectos propios, modo diseño, hojas de grafo y habilidades, deshacer.
3. **Salida**: póster PDF para el libro y visor de solo lectura para compartir con docentes.
4. **Colaboración**: proyectos compartidos entre varios autores (p. ej. con Supabase).
5. **Curso de FP real**: probar el flujo con un programa de formación profesional.
