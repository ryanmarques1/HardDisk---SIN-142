@echo off

python -m venv .venv

call .venv\Scripts\activate

pip install --no-cache-dir -r requirements.txt

start uvicorn app.main:app --reload

echo Implantação concluída!

exit