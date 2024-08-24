@echo off

python -m venv .venv

.venv\Scripts\activate

pip install --no-cache-dir -r requirements.txt

uvicorn app.main:app --reload

echo Implantação concluída!
pause