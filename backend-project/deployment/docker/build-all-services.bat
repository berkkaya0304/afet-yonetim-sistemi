@echo off
echo Building all microservices Docker images...

echo.
echo Building discovery-service...
docker build -t discovery-service:latest ./discovery-service
if %errorlevel% neq 0 (
    echo Failed to build discovery-service
    exit /b 1
)

echo.
echo Building api-gateway-service...
docker build -t api-gateway-service:latest ./api-gateway-service
if %errorlevel% neq 0 (
    echo Failed to build api-gateway-service
    exit /b 1
)

echo.
echo Building user-service...
docker build -t user-service:latest ./user-service
if %errorlevel% neq 0 (
    echo Failed to build user-service
    exit /b 1
)

echo.
echo Building assignment-service...
docker build -t assignment-service:latest ./assignment-service
if %errorlevel% neq 0 (
    echo Failed to build assignment-service
    exit /b 1
)

echo.
echo Building information-service...
docker build -t information-service:latest ./information-service
if %errorlevel% neq 0 (
    echo Failed to build information-service
    exit /b 1
)

echo.
echo Building notification-service...
docker build -t notification-service:latest ./notification-service
if %errorlevel% neq 0 (
    echo Failed to build notification-service
    exit /b 1
)

echo.
echo Building request-service...
docker build -t request-service:latest ./request-service
if %errorlevel% neq 0 (
    echo Failed to build request-service
    exit /b 1
)

echo.
echo Building websocket-service...
docker build -t websocket-service:latest ./websocket-service
if %errorlevel% neq 0 (
    echo Failed to build websocket-service
    exit /b 1
)

echo.
echo All services built successfully!
echo.
echo Available images:
docker images | findstr "discovery-service\|api-gateway-service\|user-service\|assignment-service\|information-service\|notification-service\|request-service\|websocket-service"
