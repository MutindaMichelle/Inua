"""Mirror of ml/predict.py for backward compatibility with ml/scripts/."""
import importlib.util
from pathlib import Path

_ROOT_PREDICT = Path(__file__).resolve().parent.parent / "predict.py"
_spec = importlib.util.spec_from_file_location("_inua_root_predict", str(_ROOT_PREDICT))
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)

MentorshipEffectivenessPredictor = _mod.MentorshipEffectivenessPredictor
get_default_predictor = _mod.get_default_predictor
predict_session_effectiveness = _mod.predict_session_effectiveness
POST_SESSION_COLS = _mod.POST_SESSION_COLS
