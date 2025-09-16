@echo off
echo Deploying all microservices to Kubernetes...

echo.
echo Creating namespace...
kubectl apply -f namespace/microservices-namespace.yaml
if %errorlevel% neq 0 (
    echo Failed to create namespace
    exit /b 1
)

echo.
echo Deploying discovery-service (Eureka Server) - First...
kubectl apply -f deployment/discovery-service-deployment.yaml
kubectl apply -f service/discovery-service.yaml
if %errorlevel% neq 0 (
    echo Failed to deploy discovery-service
    exit /b 1
)

echo.
echo Waiting for discovery-service to be ready...
kubectl wait --for=condition=available --timeout=300s deployment/discovery-service -n microservices-namespace

echo.
echo Deploying api-gateway-service...
kubectl apply -f deployment/api-gateway-service-deployment.yaml
kubectl apply -f service/api-gateway-service.yaml
if %errorlevel% neq 0 (
    echo Failed to deploy api-gateway-service
    exit /b 1
)

echo.
echo Deploying user-service...
kubectl apply -f deployment/user-service-deployment.yaml
kubectl apply -f service/user-service.yaml
if %errorlevel% neq 0 (
    echo Failed to deploy user-service
    exit /b 1
)

echo.
echo Deploying assignment-service...
kubectl apply -f deployment/assignment-service-deployment.yaml
kubectl apply -f service/assignment-service.yaml
if %errorlevel% neq 0 (
    echo Failed to deploy assignment-service
    exit /b 1
)

echo.
echo Deploying information-service...
kubectl apply -f deployment/information-service-deployment.yaml
kubectl apply -f service/information-service.yaml
if %errorlevel% neq 0 (
    echo Failed to deploy information-service
    exit /b 1
)

echo.
echo Deploying notification-service...
kubectl apply -f deployment/notification-service-deployment.yaml
kubectl apply -f service/notification-service.yaml
if %errorlevel% neq 0 (
    echo Failed to deploy notification-service
    exit /b 1
)

echo.
echo Deploying request-service...
kubectl apply -f deployment/request-service-deployment.yaml
kubectl apply -f service/request-service.yaml
if %errorlevel% neq 0 (
    echo Failed to deploy request-service
    exit /b 1
)

echo.
echo Deploying websocket-service...
kubectl apply -f deployment/websocket-service-deployment.yaml
kubectl apply -f service/websocket-service.yaml
if %errorlevel% neq 0 (
    echo Failed to deploy websocket-service
    exit /b 1
)

echo.
echo All services deployed successfully!
echo.
echo Service Status:
kubectl get pods -n microservices-namespace
echo.
echo Service URLs (use port-forward to access):
echo - Discovery Service (Eureka): kubectl port-forward service/discovery-service 8761:8761 -n microservices-namespace
echo - API Gateway: kubectl port-forward service/api-gateway-service 8080:8080 -n microservices-namespace
echo - User Service: kubectl port-forward service/user-service 8081:8081 -n microservices-namespace
echo - Request Service: kubectl port-forward service/request-service 8082:8082 -n microservices-namespace
echo - Assignment Service: kubectl port-forward service/assignment-service 8083:8083 -n microservices-namespace
echo - Information Service: kubectl port-forward service/information-service 8084:8084 -n microservices-namespace
echo - Notification Service: kubectl port-forward service/notification-service 8085:8085 -n microservices-namespace
echo - WebSocket Service: kubectl port-forward service/websocket-service 8086:8086 -n microservices-namespace
