"""Mirror of ml/generate_dataset.py for backward compatibility with ml/scripts/."""
import os
import sys
from pathlib import Path

ML_ROOT = Path(__file__).resolve().parent.parent
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

from generate_dataset import *  # noqa: F401,F403

if __name__ == "__main__":
    target_csv = os.path.join(str(ML_ROOT), "data", "inua_mentorship_dataset.csv")
    create_dataset(n=2000, random_state=42, output_path=target_csv)
