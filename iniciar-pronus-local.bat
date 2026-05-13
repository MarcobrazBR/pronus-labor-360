@echo off
setlocal

cd /d "%~dp0"
set "ROOT=%CD%"

if /I "%~1"=="iniciar" goto iniciar
if /I "%~1"=="parar" goto parar
if /I "%~1"=="status" goto status
if /I "%~1"=="ajuda" goto ajuda

:menu
echo.
echo PRONUS LABOR 360 - ambiente local
echo -----------------------------------
echo 1 - Iniciar sistema local
echo 2 - Ver status das portas
echo 3 - Parar sistema local
echo 4 - Ajuda
echo.
set /p "OPCAO=Escolha uma opcao: "
if "%OPCAO%"=="1" goto iniciar
if "%OPCAO%"=="2" goto status
if "%OPCAO%"=="3" goto parar
if "%OPCAO%"=="4" goto ajuda
goto menu

:iniciar
where pnpm >nul 2>nul
if errorlevel 1 (
  echo.
  echo pnpm nao foi encontrado no PATH.
  echo Instale as dependencias do projeto antes de iniciar a apresentacao local.
  echo Dica: abra o terminal na pasta do projeto e rode: corepack enable
  pause
  exit /b 1
)

echo.
echo Iniciando API e portais em janelas separadas...
echo Mantenha estas janelas abertas enquanto estiver apresentando.

start "PRONUS API :3333" cmd /k "cd /d ""%ROOT%"" && set NEXT_TELEMETRY_DISABLED=1 && set API_PORT=3333 && pnpm --filter @pronus/api dev"
start "PRONUS Operacoes :3000" cmd /k "cd /d ""%ROOT%"" && set NEXT_TELEMETRY_DISABLED=1 && set NEXT_PUBLIC_API_URL=http://localhost:3333 && pnpm --filter @pronus/web-pronus dev"
start "PRONUS RH :3001" cmd /k "cd /d ""%ROOT%"" && set NEXT_TELEMETRY_DISABLED=1 && set NEXT_PUBLIC_API_URL=http://localhost:3333 && pnpm --filter @pronus/web-client dev"
start "PRONUS Cliente :3002" cmd /k "cd /d ""%ROOT%"" && set NEXT_TELEMETRY_DISABLED=1 && set NEXT_PUBLIC_API_URL=http://localhost:3333 && pnpm --filter @pronus/web-employee dev"
start "PRONUS Profissional :3003" cmd /k "cd /d ""%ROOT%"" && set NEXT_TELEMETRY_DISABLED=1 && set NEXT_PUBLIC_API_URL=http://localhost:3333 && pnpm --filter @pronus/web-clinician dev"

echo.
echo Aguarde 30 a 60 segundos e acesse:
echo Operacoes:    http://localhost:3000/login
echo RH:           http://localhost:3001/login
echo Cliente:      http://localhost:3002/login
echo Profissional: http://localhost:3003/login
echo API:          http://localhost:3333/health
echo.
pause
exit /b 0

:status
echo.
echo Verificando portas do PRONUS LABOR 360...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,3002,3003,3333 -State Listen -ErrorAction SilentlyContinue | Sort-Object LocalPort | Select-Object LocalAddress,LocalPort,OwningProcess | Format-Table -AutoSize"
echo.
pause
exit /b 0

:parar
echo.
echo Esta acao encerra processos que estiverem escutando nas portas 3000, 3001, 3002, 3003 e 3333.
set /p "CONFIRMA=Confirmar parada do ambiente local? (S/N): "
if /I not "%CONFIRMA%"=="S" exit /b 0

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports=3000,3001,3002,3003,3333; $connections=Get-NetTCPConnection -LocalPort $ports -State Listen -ErrorAction SilentlyContinue; $connections | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
echo Ambiente local encerrado.
pause
exit /b 0

:ajuda
echo.
echo Uso rapido:
echo   iniciar-pronus-local.bat iniciar  - abre API e os quatro portais
echo   iniciar-pronus-local.bat status   - mostra processos nas portas usadas
echo   iniciar-pronus-local.bat parar    - encerra processos nas portas usadas
echo.
echo Para uma demonstracao sem internet, inicie antes de entrar no local da reuniao.
echo O primeiro carregamento pode precisar das dependencias ja instaladas no computador.
pause
exit /b 0
