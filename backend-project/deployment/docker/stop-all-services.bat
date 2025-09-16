@echo off
echo Stopping all microservices...

echo.
echo Stopping all services with Docker Compose...
docker-compose down

echo.
echo All services stopped and containers removed!
echo.
echo Remaining containers:
docker ps -a
