# 🌳 Árbol de Habilidades

Herramienta para visualizar **progresiones de aprendizaje como un árbol de habilidades**
(*skill tree*) al estilo de los videojuegos, con el look & feel de las Guías de
Pensamiento Computacional de Colombia Programa (British Council · MinTIC).

Viene cargada con la progresión de las guías de Pensamiento Computacional (9 ramas,
12 grados, 60 guías, 7 evaluaciones integradoras y 48 habilidades), combinando dos fuentes:

- **Póster** *"Progresión de aprendizajes desde transición hasta 11°"* → títulos y habilidades N0/N1/N2.
- **Anexo 1. Grafo guías** del equipo pedagógico → eje principal y secundarios, herramienta
  y prerrequisitos **indispensables** y **deseables** de cada guía (77 + 20 dependencias).

> Flujo de uso y modelo de datos: [`docs/FLUJO_DE_USO.md`](docs/FLUJO_DE_USO.md)

---

## ▶️ Cómo abrirla

No necesita instalación ni conexión a internet: abre `index.html` en el navegador
(doble clic). También se puede publicar en cualquier hosting estático (GitHub Pages, Netlify…).

## ✨ Qué hace (Fase 1 · visor)

| Función | Cómo se usa |
|---|---|
| **Árbol radial** | Raíz al centro, una rama por eje, un anillo por grado. El ancho de cada rama se ajusta a su densidad. |
| **Vista póster** | La misma información en la cuadrícula ejes × grados del póster BC. El cambio entre vistas es animado. |
| **Zoom semántico** | Lejos: ramas · Medio: guías · Cerca: habilidades con su rango (●○○ N0, ●●○ N1, ●●● N2). Las etiquetas aparecen solo donde caben. |
| **Requisitos y desbloqueos** | Clic en una guía: en azul lo que requiere, en morado lo que desbloquea (fuerte lo directo, suave lo indirecto). Línea continua = indispensable, a trazos = deseable. |
| **Fuente de conexiones** | *Grafo del equipo* (por defecto), *Habilidades* (cadenas derivadas de las habilidades que se repiten) o *Ambas* para compararlas. |
| **Foco por rama** | Clic en una rama (en el árbol o en el panel) para encuadrarla y atenuar el resto. |
| **Trayectorias** | 4 rutas de ejemplo (*De bloques a texto*, *Creadores con micro:bit*, *Detectives de datos*, *IA responsable*) y creación de rutas propias haciendo clic en las guías. |
| **Filtros y búsqueda** | Por herramienta (Scratch, micro:bit, Python…), rango N0/N1/N2, rango de grados o texto. |
| **Modo estudiante** | Marca guías completadas; se iluminan las disponibles. Solo bloquean los prerrequisitos indispensables; los deseables aparecen como recomendación. |
| **Diagnóstico** | Mapa de equilibrio rama × grado (con *todas las asociaciones* reproduce el mapa de calor «Currículo en Pensamiento Computacional» del equipo) y alertas de diseño: ramas sin guías propias, dependencias incoherentes, guías desconectadas, saltos (N0 → N2) y retrocesos de rango. |
| **Grafo en hoja de cálculo** | Importar la hoja del equipo (`.xlsx`, `.xltx`, `.csv`) para actualizar ejes, herramientas y prerrequisitos, y exportarla de vuelta con el mismo formato. |
| **Archivo** | Guardar y abrir el proyecto (`.json`), descargar imagen (`.svg` / `.png` en alta resolución). |

Todo se guarda **solo en el navegador** de quien lo usa. Para compartir el proyecto con otra persona, expórtalo en JSON.

## 📊 Actualizar el grafo desde la hoja del equipo

*Archivo → Importar grafo de guías* acepta la plantilla del anexo con estas columnas
(se reconocen aunque cambie el orden o falten algunas):

| Guía | Guía indispensable | Guía deseable | Subcategoría | Subcategoría 2 | Subcategoría 3 | Herramienta computacional |
|---|---|---|---|---|---|---|
| 7.1 | 6.2, 6.4 | | Lógica, Programación y Depuración | | | Scratch |

- **Subcategoría** es el eje principal; *Subcategoría 2 y 3*, los secundarios.
- Los códigos `T1` y `T.1` son equivalentes.
- Las guías nuevas se crean (sin título ni habilidades, para completarlas después) y una
  subcategoría desconocida crea una rama nueva. Al terminar se muestra un resumen con los cambios.
- *Exportar grafo de guías* genera la misma hoja a partir del proyecto, lista para el equipo.

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
  "niveles": [{ "id": "T", "nombre": "Transición", "corto": "T" }],
  "ramas":   [{ "id": "ALG", "nombre": "Algoritmos…", "corto": "Algoritmos", "color": "#662B80", "icono": "algoritmos" }],
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

Íconos disponibles: `algoritmos`, `programacion`, `datos`, `fisica`, `modelacion`, `ia`,
`seguridad`, `equidad`, `etica`, `generico`.

## 🧱 Estructura

| Archivo | Qué contiene |
|---|---|
| `index.html` | Página e íconos de las ramas |
| `css/estilos.css` | Look & feel BC (paleta, bandas, píldoras, bordes punteados) |
| `js/datos-pc.js` | Datos semilla: póster + grafo del equipo (`GRAFO_EQUIPO`) |
| `js/modelo.js` | Conexiones, recorridos, modo estudiante y diagnóstico (sin DOM) |
| `js/hoja.js` | Lectura de `.xlsx`/`.xltx`/`.csv` y escritura de `.xlsx`, sin librerías |
| `js/grafo.js` | Traducción entre la hoja del grafo del equipo y el proyecto |
| `js/vista.js` | Dibujo con D3: disposiciones radial y póster, zoom, resaltados, exportación |
| `js/app.js` | Paneles, filtros, trayectorias, archivos y guardado local |
| `vendor/d3.min.js` | D3 v7.9.0 incluido para funcionar sin conexión (licencia ISC en `vendor/D3-LICENSE.txt`) |

## ⚠️ Pendiente de validar con el equipo pedagógico

- Las **claves** que agrupan habilidades parecidas (p. ej. *Seguir instrucciones* y *Seguir
  instrucciones en tarjetas*) son una propuesta y definen las conexiones.
- La tipografía del póster es *Basic Sans*; en la web se usa **Nunito Sans** como equivalente libre.
- Los colores por rama amplían la paleta BC (ciruela, morado, azul) para distinguir 9 ramas.

## 🛣️ Próximas fases

2. **Editor**: crear y editar ramas, niveles, guías y prerrequisitos en pantalla (la importación del grafo desde hoja de cálculo ya está lista).
3. **Salida**: póster PDF para el libro y visor de solo lectura para docentes.
4. **Curso de FP**: plantilla y vocabulario propios, prueba con un curso real.
