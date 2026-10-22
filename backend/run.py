import sys
import os
import uvicorn
from pathlib import Path

# Ensure backend root is on Python path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

if __name__ == "__main__":
    print("[INUA API] Launching FastAPI backend server on http://127.0.0.1:8000 ...")
    print("[INUA API] Interactive Swagger Documentation: http://127.0.0.1:8000/docs")
    # Note: reload=False by default to avoid premature StatReload shutdown on Windows with Python 3.14
    use_reload = "--reload" in sys.argv
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=use_reload,
        log_level="info",
    )
