"""Mirror of ml/preprocessing.py for backward compatibility with ml/scripts/."""
import sys
from pathlib import Path

ML_ROOT = Path(__file__).resolve().parent.parent
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

from preprocessing import *  # noqa: F401,F403

if __name__ == "__main__":
    run_preprocessing()
