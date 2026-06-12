# Examen final - Computacion visual

## Descripcion general

Este repositorio contiene dos ejercicios de computacion visual:

1. **Procesamiento visual con OpenCV**: carga una imagen o el primer fotograma de un video/GIF, genera una secuencia de transformaciones visuales y guarda resultados comparativos.
2. **Escena 3D interactiva con Three.js**: presenta una escena submarina con objetos jerarquicos, materiales, iluminacion, animaciones e interacciones de usuario.

El proyecto combina procesamiento clasico de imagenes, visualizacion por etapas, graficos 3D en tiempo real e interaccion mediante teclado, mouse y controles de interfaz.

## Dependencias

### Ejercicio 1 - Procesamiento visual

- Python 3.10 o superior.
- OpenCV.
- NumPy.

Las dependencias estan declaradas en:

```text
ejercicio_1_procesamiento_visual/requirements.txt
```

### Ejercicio 2 - Escena 3D interactiva

- Node.js.
- npm.
- Three.js.
- Vite.

Las dependencias estan declaradas en:

```text
ejercicio_2_escena_3d_interactiva/package.json
```

## Instalacion

### Ejercicio 1

Desde la raiz del repositorio:

```bash
cd ejercicio_1_procesamiento_visual
pip install -r requirements.txt
```

### Ejercicio 2

Desde la raiz del repositorio:

```bash
cd ejercicio_2_escena_3d_interactiva
npm install
```

## Ejecucion

### Ejecutar procesamiento visual

Con la imagen de demostracion generada automaticamente:

```bash
cd ejercicio_1_procesamiento_visual
python src/main.py
```

Con una imagen o video propio:

```bash
python src/main.py --input ruta/a/entrada.png
python src/main.py --input ruta/a/video.mp4
```

Ejemplos incluidos en la entrega:

```bash
python src/main.py --input Profile.png
python src/main.py --input python.gif
```

Opciones disponibles:

```bash
python src/main.py --color-space hsv --blur gaussian
python src/main.py --color-space lab --blur median
```

Los resultados se guardan en:

```text
ejercicio_1_procesamiento_visual/resultados/
```

### Ejecutar escena 3D

Modo desarrollo:

```bash
cd ejercicio_2_escena_3d_interactiva
npm run dev
```

Luego abrir la URL local indicada por Vite, normalmente:

```text
http://localhost:5173
```

Compilar version de produccion:

```bash
npm run build
```

Previsualizar la version compilada:

```bash
npm run preview
```

Alternativamente, se puede servir la carpeta con Python:

```bash
python -m http.server 5173
```

## Estructura del repositorio

```text
.
+-- README.md
+-- ejercicio_1_procesamiento_visual/
|   +-- README.md
|   +-- Profile.png
|   +-- python.gif
|   +-- requirements.txt
|   +-- src/
|   |   +-- main.py
|   +-- resultados/
|   |   +-- original.png
|   |   +-- grises.png
|   |   +-- hsv_o_lab.png
|   |   +-- suavizado.png
|   |   +-- bordes.png
|   |   +-- deteccion_o_segmentacion.png
|   +-- _deps/
|       +-- dependencias locales de Python
+-- ejercicio_2_escena_3d_interactiva/
    +-- README.md
    +-- index.html
    +-- package.json
    +-- result.gif
    +-- src/
        +-- main.js
        +-- styles.css
```

## Evidencias

### Ejercicio 1

Demostracion de ejecucion:

![Demostracion del procesamiento visual](./ejercicio_1_procesamiento_visual/python.gif)

Resultados generados:

- `ejercicio_1_procesamiento_visual/resultados/original.png`
- `ejercicio_1_procesamiento_visual/resultados/grises.png`
- `ejercicio_1_procesamiento_visual/resultados/hsv_o_lab.png`
- `ejercicio_1_procesamiento_visual/resultados/suavizado.png`
- `ejercicio_1_procesamiento_visual/resultados/bordes.png`
- `ejercicio_1_procesamiento_visual/resultados/deteccion_o_segmentacion.png`

### Ejercicio 2

Demostracion de la escena 3D interactiva:

![Funcionamiento de la escena 3D](./ejercicio_2_escena_3d_interactiva/demo.gif)

## Analisis tecnico

### Procesamiento visual

El primer ejercicio implementa un pipeline clasico de vision por computador con OpenCV:

- Carga de imagen o captura del primer fotograma en videos/GIF.
- Normalizacion de entradas a formato BGR.
- Conversion a escala de grises.
- Visualizacion por canales en HSV o LAB.
- Suavizado Gaussiano o mediana.
- Deteccion de bordes con Canny.
- Segmentacion con umbralizacion de Otsu, operaciones morfologicas y deteccion de contornos.

La decision de guardar cada etapa como imagen independiente permite comparar visualmente el efecto de cada transformacion. El uso de Otsu evita depender de un umbral fijo y las operaciones morfologicas estabilizan la mascara antes de calcular contornos.

### Escena 3D interactiva

El segundo ejercicio usa Three.js para construir una escena submarina en tiempo real. La implementacion trabaja con primitivas geometricas, grupos jerarquicos y materiales PBR:

- Submarino compuesto por cuerpo, cabina, ventanas, cola, helice, periscopio y brazo recolector.
- Estacion submarina modular con base, domo, patas, antena y baliza.
- Arrecifes, rocas, peces, medusas, burbujas y muestras bioluminiscentes.
- Camara interactiva mediante `OrbitControls`.
- Iluminacion hemisferica, direccional, faro del submarino y luces puntuales.
- Animacion continua de helice, peces, medusas, burbujas, muestras y sonar.
- Interaccion por teclado, mouse, boton y sliders.

La escena evita depender de modelos externos, por lo que el proyecto es portable y facil de ejecutar. La interaccion principal se centra en el movimiento del submarino, la inspeccion/recoleccion de muestras y la respuesta de los peces ante proximidad o pulso sonar.

## Uso de IA

Si aplica, se uso IA como apoyo para resolver dudas puntuales de implementacion y para organizar la documentacion. Los README internos registran prompts relacionados con:

- Deteccion de bordes con OpenCV.
- Ajuste de iluminacion para un ambiente acuatico.
- Control de velocidad de un objeto con un slider en Three.js.