$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'

Write-Host 'Preparing backend...'
Set-Location $backend
if (-not (Test-Path './venv')) {
    python -m venv .\venv
}
. .\venv\Scripts\Activate.ps1
pip install -r .\requirements.txt

Write-Host 'Starting backend at http://localhost:8000'
Start-Process pwsh -ArgumentList "-NoExit", "-Command Set-Location '$backend'; . .\venv\Scripts\Activate.ps1; uvicorn main:app --reload"

Write-Host 'Starting frontend at http://localhost:3000'
Start-Process pwsh -ArgumentList "-NoExit", "-Command Set-Location '$frontend'; $env:NEXT_PUBLIC_BACKEND_URL='http://localhost:8000'; npm install; npm run dev"

Write-Host 'Done. Two terminals should now be open with backend and frontend servers.'
