# 🏆 Polla Mundial 2026 — Colombia Programa

Aplicación web para hacer predicciones del Mundial de Fútbol 2026, pensada para el proyecto **Colombia Programa**. Ofrece **dos niveles de dificultad** para que tanto el fanático ocasional de la Selección Colombia como quien sigue todo el torneo puedan participar.

---

## ✨ ¿Qué hace?

La app permite a cada participante registrar una predicción y luego seguir su posición en tres tablas de clasificación. Hay dos formas de jugar:

- **🇨🇴 Fan de la Sele** (nivel básico): unas pocas preguntas centradas en la Selección Colombia. Ideal para quien no sigue todo el torneo.
- **🔥 Fiebre del Mundial** (nivel intermedio): la predicción completa, con fase de grupos, mejores terceros y toda la fase de eliminación.

Quien juega **ambos niveles con el mismo nickname** entra además a un **ranking absoluto** que suma los puntos de los dos.

### Las preguntas de "Fan de la Sele"
1. Resultado de Colombia en cada partido de su grupo (gana / empata / pierde).
2. Posición final de Colombia en su grupo (1° / 2° / 3° / 4°).
3. Hasta dónde llega Colombia en el torneo.
4. Quién marcará el último gol de Colombia (lista cerrada de los 26 convocados).
5. Quién será el campeón del Mundial.

### El flujo de "Fiebre del Mundial"
1. Primer y segundo lugar de cada uno de los 12 grupos.
2. Los 8 mejores terceros.
3. Toda la fase de eliminación (Ronda de 32 hasta la final) más el partido por el tercer puesto.

---

## 🗂️ Estructura de archivos

| Archivo | Qué es | ¿Se publica? |
|---|---|---|
| `index.html` | El sitio público donde la gente hace sus predicciones. | ✅ Sí |
| `admin.html` | Panel de administración para cargar resultados reales y calcular puntos. | ⚠️ **NO** — solo en tu computador |
| `esquema_supabase.sql` | Crea la tabla de predicciones y la seguridad. | (se ejecuta en Supabase) |
| `migracion_campeon.sql` | Añade la columna del campeón. | (se ejecuta en Supabase) |
| `migracion_colombia_grupo.sql` | Añade la columna de posición de Colombia. | (se ejecuta en Supabase) |
| `resultados_tabla.sql` | Crea la tabla de resultados reales. | (se ejecuta en Supabase) |

---

## 🛠️ Tecnología

- **Frontend:** HTML, CSS y JavaScript en un solo archivo (sin frameworks ni build).
- **Backend:** [Supabase](https://supabase.com) (base de datos PostgreSQL) como almacenamiento.
- **Banderas:** imágenes de [flagcdn.com](https://flagcdn.com).
- **Despliegue:** cualquier hosting estático (Netlify, GitHub Pages, etc.).

---

## 🚀 Puesta en marcha

### 1. Configurar la base de datos en Supabase

En tu proyecto de Supabase, ve a **SQL Editor** y ejecuta los siguientes scripts **en este orden** (cada uno en un editor vacío, pegar y *Run*):

1. `esquema_supabase.sql`
2. `migracion_campeon.sql`
3. `migracion_colombia_grupo.sql`
4. `resultados_tabla.sql`

### 2. Configurar la clave en `index.html`

El archivo `index.html` usa la **anon key** de Supabase. Esta clave es **pública por diseño** y es segura en el navegador **siempre que la seguridad a nivel de fila (RLS) esté activada** (los scripts SQL de arriba ya la activan). Busca en el código:

```js
const supabaseUrl = 'https://TU-PROYECTO.supabase.co';
const supabaseKey = 'TU_ANON_KEY';
```

y reemplaza con los valores de tu proyecto (Supabase → *Settings* → *API Keys*).

### 3. Publicar el sitio

Sube `index.html` a tu hosting (Netlify, GitHub Pages, etc.). ¡Listo, ya pueden empezar a jugar!

---

## 🔧 Administración (cargar resultados y calcular puntos)

Durante el Mundial, usa **`admin.html`** para registrar los resultados reales y recalcular los puntos de todos.

> ⚠️ **Importante:** `admin.html` necesita la **`service_role` key**, que da control total de la base de datos. **Nunca** publiques este archivo en un sitio accesible al público ni dejes esa clave en ningún archivo subido. Ábrelo solo en tu computador.

El panel pide la `service_role` key cada vez que lo abres y **no la guarda** en ningún lado: vive solo en memoria mientras la página está abierta.

Flujo de uso:
1. Abre `admin.html` en tu navegador (directamente desde tu equipo).
2. Pega la `service_role` key (Supabase → *Settings* → *API Keys*) y conéctate.
3. Carga los resultados reales: primero y segundo de cada grupo, los 8 mejores terceros, hasta dónde llegó cada clasificado, y los datos de Colombia.
4. Pulsa **Guardar resultados reales** y luego **Recalcular y guardar puntos de todos**.
5. Los rankings del sitio público se actualizan automáticamente.

---

## 🧮 Sistema de puntaje

### Fan de la Sele (máximo 130 puntos)

| Acierto | Puntos |
|---|---|
| Resultado de cada partido de Colombia (×3) | 10 c/u |
| Posición de Colombia en su grupo | 15 |
| Hasta dónde llega Colombia | 25 |
| Último goleador de Colombia | 20 |
| Campeón del Mundial | 40 |

### Fiebre del Mundial (máximo ≈ 395 puntos)

| Acierto | Puntos |
|---|---|
| Primer lugar de grupo correcto (×12) | 5 c/u |
| Segundo lugar de grupo correcto (×12) | 3 c/u |
| Mejor tercero correcto (×8) | 4 c/u |
| Equipo que llega a Octavos (×16) | 4 c/u |
| Equipo que llega a Cuartos (×8) | 7 c/u |
| Equipo que llega a Semis (×4) | 12 c/u |
| Finalista correcto (×2) | 18 c/u |
| Tercer puesto correcto | 18 |
| Campeón del Mundial | 45 |

El **ranking absoluto** es la suma directa de los puntos de ambos niveles.

---

## 🔒 Notas de seguridad

- La tabla de predicciones tiene **Row Level Security (RLS)** activado. El público solo puede **leer** las columnas necesarias para los rankings (nunca el contenido completo de las predicciones ajenas) e **insertar** su propia predicción. No puede editar ni borrar nada, ni modificar puntajes.
- La columna `puntos` solo la puede escribir el panel de administración (con la `service_role` key).
- Para evitar ventajas injustas en el ranking absoluto, si alguien juega ambos niveles, su **campeón** y la **posición de Colombia en su grupo** deben coincidir entre los dos niveles (se valida antes de guardar).
- Como no hay inicio de sesión con contraseña, el sistema está pensado para un grupo de confianza (los participantes de Colombia Programa).

---

## ⚽ Sobre el cuadro de eliminación

La fase de eliminación respeta la estructura oficial de la Ronda de 32 del Mundial 2026 (los segundos de grupo se enfrentan entre sí, los ganadores enfrentan a terceros, y nadie del mismo grupo se cruza antes de cuartos). La asignación de los 8 mejores terceros usa un algoritmo que cubre las 495 combinaciones posibles respetando las restricciones de la FIFA.

---

## 🙌 Créditos

Proyecto desarrollado para **Colombia Programa**.
