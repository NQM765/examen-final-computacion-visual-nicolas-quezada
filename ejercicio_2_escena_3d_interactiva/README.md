# Ejercicio 2 - Escena 3D interactiva tematica

## Tema elegido

**Exploracion submarina o entorno marino.**

La escena representa una estacion de investigacion submarina con un submarino
controlable, peces reactivos, medusas animadas, arrecifes, rocas, burbujas y
muestras bioluminiscentes que pueden ser inspeccionadas.

## Proposito del ejercicio

El ejercicio aborda la construccion de una escena 3D interactiva que integra los
conceptos principales de computacion visual:

- Jerarquia de objetos 3D.
- Transformaciones de traslacion, rotacion y escala.
- Materiales PBR.
- Iluminacion coherente con un ambiente submarino.
- Animacion de elementos de la escena.
- Interaccion entre objetos.
- Interaccion del usuario mediante teclado, mouse, botones y sliders.

## Herramientas, librerias o motores utilizados

- **Three.js**: motor/libreria principal para crear y renderizar la escena 3D.
- **Vite**: servidor de desarrollo y empaquetador del proyecto.
- **JavaScript ES Modules**: implementacion de la logica, animaciones e interacciones.
- **CSS**: interfaz HUD, panel de controles y estilo visual.
- **OrbitControls de Three.js**: camara interactiva con mouse.

## Como ejecutar la solucion

### Opcion recomendada con Node.js

Instalar dependencias:

```bash
npm install
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

Luego abrir la URL local que entregue Vite, normalmente:

```text
http://localhost:5173
```

Generar version de produccion:

```bash
npm run build
```

Previsualizar la version de produccion:

```bash
npm run preview
```

### Opcion alternativa sin Vite

Si no se tiene Node.js instalado, tambien se puede servir la carpeta con Python.
Esta opcion usa el `importmap` de `index.html` y carga Three.js desde CDN:

```bash
python -m http.server 5173
```

Luego abrir:

```text
http://localhost:5173
```

## Controles de usuario

- **WASD o flechas**: mover el submarino en el plano horizontal.
- **Q / E**: subir o bajar el submarino.
- **Mouse**: orbitar, acercar o alejar la camara.
- **Click sobre criaturas u objetos**: inspeccionar elementos.
- **Boton "Activar pulso sonar"**: emite una onda que afecta a los peces.
- **Slider de velocidad**: cambia la velocidad de movimiento del submarino.
- **Slider de intensidad del faro**: cambia la intensidad de la luz frontal.
- **Barra espaciadora**: activa tambien el pulso sonar.

## Resultados obtenidos

La escena cumple los requerimientos obligatorios:

- Se creo una escena 3D completa basada en exploracion submarina.
- Se incluyo jerarquia de objetos:
  - Submarino compuesto por cuerpo, cabina, ventanas, cola, helice, periscopio y brazo recolector.
  - Estacion submarina compuesta por base, domo, patas, antena y baliza.
  - Arrecife compuesto por rocas y corales.
- Se aplicaron transformaciones:
  - Traslacion del submarino con teclado.
  - Rotacion de helice, medusas, peces, periscopio visual y camara.
  - Escala en cuerpo del submarino, peces, domo, corales y pulso sonar.
- Se configuro una camara interactiva con `OrbitControls`.
- Se usaron materiales PBR mediante `MeshStandardMaterial` y `MeshPhysicalMaterial`.
- Se incorporo iluminacion tematica:
  - Luz hemisferica azul.
  - Luz direccional tipo filtracion desde la superficie.
  - Faro frontal del submarino.
  - Luces bioluminiscentes en muestras y estacion.
- Se anadieron animaciones:
  - Helice del submarino.
  - Peces nadando.
  - Medusas flotando.
  - Burbujas ascendentes.
  - Muestras bioluminiscentes pulsantes.
  - Onda sonar expansiva.
- Se implemento interaccion entre elementos:
  - Los peces se alejan del submarino y del pulso sonar.
  - Las muestras se recolectan automaticamente por proximidad o por click.
  - El faro del submarino sigue su posicion.
- Se implemento interaccion del usuario por teclado, mouse, boton y sliders.

### Evidencia de funcionamiento

![Funcionamiento de la escena 3D interactiva](./demo.gif)

## Dificultades y solucion

- **Evitar depender de modelos externos**: se resolvio construyendo todos los objetos con primitivas de Three.js. Esto hace que el proyecto sea mas facil de ejecutar y revisar.
- **Dar sensacion de ambiente submarino**: se combino niebla exponencial, iluminacion azul, burbujas, materiales semitransparentes y elementos bioluminiscentes.
- **Mostrar interaccion real entre objetos**: se agrego comportamiento de huida para los peces cuando el submarino o el sonar se acercan.
- **Mantener una estructura clara**: se separaron las funciones de creacion y actualizacion de cada sistema dentro de `src/main.js`.

## Prompts de IA usados

```text
Como puedo ajustar la iluminacion de una escena para un ambiente acuatico
De que maneja puedo ajustar la velocidad de un objetoc on un slider en three js
```

## Partes verificadas manualmente por el estudiante

Se verifico manualmente la interaccion, desplazamiento y controles de la escena
