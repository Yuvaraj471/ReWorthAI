import sys
import os

# Ensure backend directory is in search path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from yolo import detector_layer

class YoloDetectorWrapper:
    """
    Loose coupling wrapper forwarding calls to backend/yolo layer.
    Allows changing the underlying model implementation without changing the rest of the application.
    """
    def detect(self, image_data: bytes):
        return detector_layer.detect_objects(image_data)

detector = YoloDetectorWrapper()
