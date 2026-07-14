import io
import os
import random
from typing import List, Dict, Any, Optional


class YoloDetectorLayer:
    """
    Modular AI Integration Layer for ReWorth AI
    Loads the custom YOLO model weights (best.pt)
    and performs object detection.
    """

    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(YoloDetectorLayer, cls).__new__(cls)
            cls._instance._init_detector()
        return cls._instance

    def _init_detector(self):
        self.is_mock = True
        self.model = None

        self.supported_classes = [
            "Plastic Bottle",
            "Plastic Bag",
            "Plastic Other",
            "Cardboard",
            "Glass",
            "Biodegradable Waste",
            "Paper",
            "Metal"
        ]

        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.weights_path = os.path.join(current_dir, "best.pt")

        try:
            from ultralytics import YOLO

            if os.path.exists(self.weights_path):
                self.model = YOLO(self.weights_path)
                self.is_mock = False
                print(f"[YOLO] Model loaded successfully")
                print(f"[YOLO] Weights: {self.weights_path}")
            else:
                print("[YOLO] best.pt not found")
                self.is_mock = True

        except Exception as e:
            print(f"[YOLO] Failed to load model")
            print(e)
            self.is_mock = True

    def detect_objects(self, image_data: bytes) -> List[Dict[str, Any]]:

        print("\n" + "=" * 70)
        print("[YOLO DEBUG] detect_objects() called")
        print(f"Image size : {len(image_data)} bytes")
        print(f"First bytes: {image_data[:30]}")
        print("=" * 70)

        if not self.is_mock and self.model:

            try:

                from PIL import Image

                image = Image.open(io.BytesIO(image_data))

                print(f"[YOLO] Image format : {image.format}")
                print(f"[YOLO] Image size   : {image.size}")

                results = self.model(image)

                detections = []

                for result in results:

                    for box in result.boxes:

                        cls_idx = int(box.cls[0])

                        class_name = result.names[cls_idx]

                        confidence = float(box.conf[0])

                        xywhn = box.xywhn[0].tolist()
                        x_center, y_center, width, height = xywhn

                        print(
                            f"[YOLO] {class_name} | {confidence:.2f} | Bbox: {x_center:.2f}, {y_center:.2f}, {width:.2f}, {height:.2f}"
                        )

                        detections.append(
                            {
                                "class": class_name,
                                "confidence": round(confidence, 2),
                                "x": x_center,
                                "y": y_center,
                                "width": width,
                                "height": height
                            }
                        )

                print(f"[YOLO] Total detections = {len(detections)}")

                return detections

            except Exception as e:

                print("\n")
                print("=" * 70)
                print("[YOLO ERROR]")
                print(type(e).__name__)
                print(e)
                print("=" * 70)
                print("\n")
                return []

        print("[YOLO] Mock mode is disabled. No model loaded, returning empty detections.")
        return []



detector_layer = YoloDetectorLayer()