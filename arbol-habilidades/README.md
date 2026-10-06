# 🌳 Árbol de Habilidades

Herramienta para visualizar **progresiones de aprendizaje como un árbol de habilidades**
(*skill tree*) al estilo de los videojuegos, con el look & feel de las Guías de
Pensamiento Computacional de Colombia Programa (British Council · MinTIC).

Viene cargada con la progresión completa del póster *"Pensamiento Computacional:
Progresión de aprendizajes desde transición hasta 11°"*: 9 ramas, 12 grados,
60 guías, 7 evaluaciones integradoras y 48 habilidades.

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
| **Requisitos y desbloqueos** | Clic en una guía: en azul lo que requiere, en morado lo que desbloquea (fuerte lo directo, suave lo indirecto). |
| **Foco por rama** | Clic en una rama (en el árbol o en el panel) para encuadrarla y atenuar el resto. |
| **Trayectorias** | 4 rutas de ejemplo (*De bloques a texto*, *Creadores con micro:bit*, *Detectives de datos*, *IA responsable*) y creación de rutas propias haciendo clic en las guías. |
| **Filtros y búsqueda** | Por herramienta (Scratch, micro:bit, Python…), rango N0/N1/N2, rango de grados o texto. |
| **Modo estudiante** | Marca guías completadas; se iluminan las que quedan disponibles y se bloquean las que aún no. |
| **Diagnóstico** | Mapa de equilibrio rama × grado y alertas de diseño: ramas sin guías propias, guías desconectadas, saltos (N0 → N2) y retrocesos de rango. |
| **Archivo** | Guardar y abrir el proyecto (`.json`), descargar imagen (`.svg` / `.png` en alta resolución). |

Todo se guarda **solo en el navegador** de quien lo usa. Para compartir el proyecto con otra persona, expórtalo en JSON.

## 🔗 Cómo se calculan las conexiones

Cada habilidad tiene una `clave`. Si la misma clave aparece en varias guías, se forma una
**cadena de mejora**: cada aparición se conecta con la más reciente de mayor rango en el
grado anterior (o con una guía previa del mismo grado si el rango sube). Por ejemplo:

```
Condicionales:  5.2 (N0) → 5.3 (N1) → 6.1 / 6.4 (N1) → 7.1 (N2) → 8.1 / 8.3 (N1) → 9.1 (N1)
```

Además, cada *Evaluación y proyectos* recibe todas las guías de su grado, y el diseñador
puede añadir prerrequisitos a mano en `prerrequisitos`.

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
    "prerrequisitos": []                  // ids de nodos, opcional
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
| `js/datos-pc.js` | Datos semilla transcritos del póster |
| `js/modelo.js` | Conexiones, recorridos, modo estudiante y diagnóstico (sin DOM) |
| `js/vista.js` | Dibujo con D3: disposiciones radial y póster, zoom, resaltados, exportación |
| `js/app.js` | Paneles, filtros, trayectorias, archivos y guardado local |
| `vendor/d3.min.js` | D3 v7.9.0 incluido para funcionar sin conexión (licencia ISC en `vendor/D3-LICENSE.txt`) |

## ⚠️ Pendiente de validar con el equipo pedagógico

- Los **ejes secundarios** de cada guía son una lectura aproximada de las líneas del póster.
- Las **claves** que agrupan habilidades parecidas (p. ej. *Seguir instrucciones* y *Seguir
  instrucciones en tarjetas*) son una propuesta y definen las conexiones.
- La tipografía del póster es *Basic Sans*; en la web se usa **Nunito Sans** como equivalente libre.
- Los colores por rama amplían la paleta BC (ciruela, morado, azul) para distinguir 9 ramas.

## 🛣️ Próximas fases

2. **Editor**: crear y editar ramas, niveles, guías y prerrequisitos en pantalla; importar una hoja de cálculo.
3. **Salida**: póster PDF para el libro y visor de solo lectura para docentes.
4. **Curso de FP**: plantilla y vocabulario propios, prueba con un curso real.
