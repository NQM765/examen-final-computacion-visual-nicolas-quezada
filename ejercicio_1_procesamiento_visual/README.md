# Ejercicio 1 - Procesamiento visual e IA

## Proposito

Este ejercicio implementa una secuencia clara de procesamiento visual para comparar transformaciones intermedias de una imagen o de un primer fotograma de video. El objetivo es observar como cambian los datos visuales al pasar por conversiones de color, suavizado, deteccion de bordes y una etapa de segmentacion/deteccion clasica.

## Herramientas utilizadas

- Python 3.10.
- OpenCV (`opencv-python`) para carga de imagen/video y operaciones de vision por computador.
- NumPy para crear una imagen de demostracion y manipular matrices.

## Como se ejecuta

Demostracion de uso:

![Demostracion de uso del script](python.gif)

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Ejecutar con la imagen de demostracion generada por el programa:

```bash
python src/main.py
```

Ejecutar con una imagen o video propio:

```bash
python src/main.py --input ruta/a/entrada.png
python src/main.py --input ruta/a/video.mp4
```

En esta entrega se incluyeron dos entradas visuales de prueba en la carpeta raiz:

```bash
python src/main.py --input Profile.png
python src/main.py --input python.gif
```

La prueba documentada en `resultados/` fue generada con la imagen real `Profile.png`.

Opciones disponibles:

```bash
python src/main.py --color-space hsv --blur gaussian
python src/main.py --color-space lab --blur median
```

## Secuencia de operaciones

1. Se carga una entrada visual con OpenCV. Si no se entrega `--input`, se genera `resultados/entrada_demo.png` y luego se carga con `cv2.imread`.
2. Se guarda la imagen original en `resultados/original.png`.
3. Se convierte a escala de grises con `cv2.cvtColor(..., cv2.COLOR_BGR2GRAY)` y se guarda en `resultados/grises.png`.
4. Se genera una segunda representacion de color en HSV por defecto. El archivo `resultados/hsv_o_lab.png` muestra los canales H, S y V lado a lado para facilitar la comparacion visual. Tambien se puede usar LAB con `--color-space lab`.
5. Se aplica suavizado Gaussiano con kernel `5x5` por defecto y se guarda `resultados/suavizado.png`. La alternativa disponible es mediana con kernel `5`.
6. Se aplica Canny sobre la imagen suavizada con umbrales `80` y `160`. El resultado se guarda en `resultados/bordes.png`.
7. Se realiza segmentacion clasica con umbralizacion de Otsu, limpieza morfologica y deteccion de contornos. El resultado final se guarda en `resultados/deteccion_o_segmentacion.png`.

## Parametros y decisiones tecnicas

- HSV fue elegido como representacion secundaria porque separa tono, saturacion y valor, lo que ayuda a inspeccionar informacion de color distinta a RGB/BGR.
- El suavizado Gaussiano `5x5` reduce ruido antes de Canny y de la segmentacion sin borrar demasiado los bordes principales.
- Canny usa umbrales `80` y `160` porque ofrecen una relacion simple 1:2 y funcionan de forma estable para la imagen de demostracion.
- La segmentacion usa Otsu porque calcula automaticamente un umbral segun el histograma de grises, sin depender de un valor fijo.
- Las operaciones morfologicas usan un kernel `5x5` para eliminar ruido pequeno y cerrar regiones segmentadas.
- Se filtran contornos con area minima de `0.2%` de la imagen, con minimo absoluto de `500` pixeles, para evitar detecciones pequenas poco relevantes.
- En videos y GIF se procesa un fotograma para mantener salidas comparables con los PNG solicitados.
- Las entradas con canal alfa, como algunos GIF o PNG, se convierten a BGR antes del procesamiento para que todas las etapas usen el mismo formato.

## Resultados obtenidos

El programa genera los entregables minimos:

- `resultados/original.png`
- `resultados/grises.png`
- `resultados/hsv_o_lab.png`
- `resultados/suavizado.png`
- `resultados/bordes.png`
- `resultados/deteccion_o_segmentacion.png`

Adicionalmente, cuando se ejecuta sin entrada externa, se crea `resultados/entrada_demo.png` como fuente de prueba.

Para la prueba con imagen real se uso `Profile.png`, una imagen de `1254x1254` pixeles. Los resultados actuales en la carpeta `resultados/` corresponden a esa entrada:

- `original.png`: copia normalizada de la imagen real cargada.
- `grises.png`: conversion a escala de grises.
- `hsv_o_lab.png`: visualizacion de los canales HSV; por eso mide `3762x1254`, tres veces el ancho de la imagen original.
- `suavizado.png`: version filtrada con Gaussiano `5x5`.
- `bordes.png`: bordes detectados con Canny.
- `deteccion_o_segmentacion.png`: segmentacion clasica con mascara, contornos y cajas sobre la imagen real.

Tambien se agrego `python.gif` como entrada alternativa para comprobar que la solucion acepta otros formatos visuales. Al procesarlo, OpenCV toma una imagen/fotograma del GIF y el pipeline genera los mismos archivos comparativos.

## Dificultades y solucion

Una dificultad comun es que los espacios HSV y LAB no son directamente intuitivos al guardarlos como una imagen RGB normal. Para resolverlo, el script guarda una visualizacion por canales, de modo que se pueda comparar cada componente de forma clara.

Otra dificultad es escoger un umbral de segmentacion que funcione con distintas imagenes. Se uso Otsu para calcularlo automaticamente y se agrego limpieza morfologica para estabilizar el resultado.

Al probar con archivos reales aparecio una confusion de extension: se intento cargar `Profile.jpg`, pero el archivo existente era `Profile.png`. Se resolvio ejecutando el script con la extension correcta. Ademas, el GIF puede cargarse con canal alfa; por eso el codigo convierte entradas BGRA a BGR antes de continuar.

## Prompts de IA usados

Se uso el siguiente prompt de IA para solicitar la implementacion:

```text
Como puedo implementar detección de bordes a una imagen abierta con Opencv
```

Tambien se uso IA para actualizar esta documentacion despues de agregar `Profile.png`, `python.gif` y darle un formato mas organizado.

## Verificacion manual del estudiante

Se verifico manualmente el funcionamiento correcto del script, se rectifico manualmente el codigo apra que la generacion y aplicacion de filtros en las diferentes imagenes fuera correcto y funcionara de la manera esperada.
