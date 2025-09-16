
echo.
echo Starting all services with Docker Compose...
docker-compose up -d

if %errorlevel% neq 0 (
    echo Failed to start services with Docker Compose
    exit /b 1
)

echo.
echo All services started successfully!
echo.
echo Service URLs:
echo - Discovery Service (Eureka): http://localhost:8761
echo - API Gateway: http://localhost:8080
echo - User Service: http://localhost:8081
echo - Request Service: http://localhost:8082
echo - Assignment Service: http://localhost:8083
echo - Information Service: http://localhost:8084
echo - Notification Service: http://localhost:8085
echo - WebSocket Service: http://localhost:8086
echo - PostgreSQL: localhost:5432
echo - RabbitMQ Management: http://localhost:15672 (guest/guest)
echo.
echo Running containers:
docker ps
