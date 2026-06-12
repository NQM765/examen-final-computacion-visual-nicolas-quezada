from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np


RESULT_FILES = {
    "original": "original.png",
    "gray": "grises.png",
    "color": "hsv_o_lab.png",
    "blur": "suavizado.png",
    "edges": "bordes.png",
    "segmentation": "deteccion_o_segmentacion.png",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Procesa una imagen o el primer fotograma de un video corto con OpenCV."
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=None,
        help="Ruta de una imagen o video. Si se omite, se genera una imagen de demostracion.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("resultados"),
        help="Carpeta donde se guardan los resultados comparativos.",
    )
    parser.add_argument(
        "--color-space",
        choices=("hsv", "lab"),
        default="hsv",
        help="Segunda representacion de color que se guardara como visualizacion por canales.",
    )
    parser.add_argument(
        "--blur",
        choices=("gaussian", "median"),
        default="gaussian",
        help="Filtro de suavizado aplicado antes de detectar bordes y segmentar.",
    )
    return parser.parse_args()


def create_demo_image(path: Path) -> None:
    """Crea una escena simple con objetos, bordes y colores variados."""
    height, width = 620, 900
    image = np.zeros((height, width, 3), dtype=np.uint8)

    x_gradient = np.linspace(35, 210, width, dtype=np.uint8)
    y_gradient = np.linspace(25, 160, height, dtype=np.uint8)
    image[:, :, 0] = x_gradient
    image[:, :, 1] = y_gradient[:, None]
    image[:, :, 2] = 235 - (x_gradient // 3)

    cv2.rectangle(image, (80, 120), (310, 420), (40, 160, 245), -1)
    cv2.circle(image, (570, 260), 135, (70, 210, 80), -1)
    cv2.ellipse(image, (690, 435), (150, 70), -15, 0, 360, (230, 80, 80), -1)
    cv2.line(image, (80, 500), (820, 110), (35, 35, 35), 12)
    cv2.putText(
        image,
        "OpenCV",
        (350, 560),
        cv2.FONT_HERSHEY_SIMPLEX,
        2.0,
        (20, 20, 20),
        5,
        cv2.LINE_AA,
    )

    noise = np.random.default_rng(7).normal(0, 8, image.shape).astype(np.int16)
    noisy = np.clip(image.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    cv2.imwrite(str(path), noisy)


def load_visual_input(input_path: Path | None, output_dir: Path) -> tuple[np.ndarray, str]:
    if input_path is None:
        demo_path = output_dir / "entrada_demo.png"
        create_demo_image(demo_path)
        input_path = demo_path

    frame = cv2.imread(str(input_path), cv2.IMREAD_COLOR)
    if frame is not None:
        return ensure_bgr(frame), f"imagen: {input_path}"

    capture = cv2.VideoCapture(str(input_path))
    ok, frame = capture.read()
    capture.release()
    if ok and frame is not None:
        return ensure_bgr(frame), f"video, primer fotograma: {input_path}"

    raise FileNotFoundError(
        f"No se pudo cargar la entrada visual con OpenCV: {input_path}"
    )


def ensure_bgr(frame: np.ndarray) -> np.ndarray:
    if frame.ndim == 2:
        return cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)
    if frame.shape[2] == 4:
        return cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
    return frame


def visualize_color_space(image_bgr: np.ndarray, color_space: str) -> np.ndarray:
    if color_space == "hsv":
        converted = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(converted)
        h_vis = cv2.applyColorMap((h * 2).astype(np.uint8), cv2.COLORMAP_HSV)
        s_vis = cv2.cvtColor(s, cv2.COLOR_GRAY2BGR)
        v_vis = cv2.cvtColor(v, cv2.COLOR_GRAY2BGR)
        labels = ("H", "S", "V")
        panels = [h_vis, s_vis, v_vis]
    else:
        converted = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(converted)
        panels = [cv2.cvtColor(channel, cv2.COLOR_GRAY2BGR) for channel in (l, a, b)]
        labels = ("L", "A", "B")

    labelled_panels = []
    for label, panel in zip(labels, panels):
        panel = panel.copy()
        cv2.rectangle(panel, (10, 10), (70, 58), (0, 0, 0), -1)
        cv2.putText(
            panel,
            label,
            (26, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (255, 255, 255),
            2,
            cv2.LINE_AA,
        )
        labelled_panels.append(panel)

    return np.hstack(labelled_panels)


def smooth_image(image_bgr: np.ndarray, blur_method: str) -> np.ndarray:
    if blur_method == "median":
        return cv2.medianBlur(image_bgr, 5)
    return cv2.GaussianBlur(image_bgr, (5, 5), 0)


def detect_edges(smoothed_bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(smoothed_bgr, cv2.COLOR_BGR2GRAY)
    return cv2.Canny(gray, threshold1=80, threshold2=160)


def segment_and_detect(original_bgr: np.ndarray, smoothed_bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(smoothed_bgr, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    white_ratio = cv2.countNonZero(mask) / mask.size
    if white_ratio > 0.5:
        mask = cv2.bitwise_not(mask)

    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    min_area = max(500, int(original_bgr.shape[0] * original_bgr.shape[1] * 0.002))
    relevant_contours = [contour for contour in contours if cv2.contourArea(contour) >= min_area]

    overlay = original_bgr.copy()
    color_mask = np.zeros_like(original_bgr)
    color_mask[mask > 0] = (45, 210, 80)
    overlay = cv2.addWeighted(overlay, 0.72, color_mask, 0.28, 0)

    cv2.drawContours(overlay, relevant_contours, -1, (0, 255, 255), 3)
    for contour in relevant_contours:
        x, y, w, h = cv2.boundingRect(contour)
        cv2.rectangle(overlay, (x, y), (x + w, y + h), (20, 20, 255), 2)

    return overlay


def write_image(path: Path, image: np.ndarray) -> None:
    ok = cv2.imwrite(str(path), image)
    if not ok:
        raise OSError(f"No se pudo guardar la imagen: {path}")


def main() -> None:
    args = parse_args()
    args.output.mkdir(parents=True, exist_ok=True)

    original, source_description = load_visual_input(args.input, args.output)
    gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
    color_view = visualize_color_space(original, args.color_space)
    smoothed = smooth_image(original, args.blur)
    edges = detect_edges(smoothed)
    segmentation = segment_and_detect(original, smoothed)

    write_image(args.output / RESULT_FILES["original"], original)
    write_image(args.output / RESULT_FILES["gray"], gray)
    write_image(args.output / RESULT_FILES["color"], color_view)
    write_image(args.output / RESULT_FILES["blur"], smoothed)
    write_image(args.output / RESULT_FILES["edges"], edges)
    write_image(args.output / RESULT_FILES["segmentation"], segmentation)

    print("Procesamiento completado.")
    print(f"Entrada: {source_description}")
    print(f"Resultados guardados en: {args.output.resolve()}")
    print(f"Color: {args.color_space.upper()} | Suavizado: {args.blur}")


if __name__ == "__main__":
    main()
