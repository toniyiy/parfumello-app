import os

import joblib
import numpy as np
import onnxruntime as ort
from django.conf import settings

ML_DIR = os.path.join(settings.BASE_DIR, "ml")

_session = ort.InferenceSession(os.path.join(ML_DIR, "perfume_model.onnx"))
_input_name = _session.get_inputs()[0].name
_features = joblib.load(os.path.join(ML_DIR, "features.pkl"))


def get_compatibility(kaggle_index_a, kaggle_index_b):
    """Returnează scorul de compatibilitate (0-100) între 2 parfumuri."""
    if kaggle_index_a is None or kaggle_index_b is None:
        return None

    feat_a = _features[kaggle_index_a]
    feat_b = _features[kaggle_index_b]
    pair = np.concatenate([feat_a, feat_b]).reshape(1, -1).astype(np.float32)

    score = _session.run(None, {_input_name: pair})[0][0][0]
    return round(float(score) * 100, 1)
