@echo off
echo Viewing logs for microservices...

echo.
echo Available services:
echo 1. discovery-service
echo 2. api-gateway-service
echo 3. user-service
echo 4. assignment-service
echo 5. information-service
echo 6. notification-service
echo 7. request-service
echo 8. websocket-service
echo 9. All services (follow mode)
echo 0. Exit

echo.
set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" (
    echo Viewing logs for discovery-service...
    kubectl logs -f deployment/discovery-service -n microservices-namespace
) else if "%choice%"=="2" (
    echo Viewing logs for api-gateway-service...
    kubectl logs -f deployment/api-gateway-service -n microservices-namespace
) else if "%choice%"=="3" (
    echo Viewing logs for user-service...
    kubectl logs -f deployment/user-service -n microservices-namespace
) else if "%choice%"=="4" (
    echo Viewing logs for assignment-service...
    kubectl logs -f deployment/assignment-service -n microservices-namespace
) else if "%choice%"=="5" (
    echo Viewing logs for information-service...
    kubectl logs -f deployment/information-service -n microservices-namespace
) else if "%choice%"=="6" (
    echo Viewing logs for notification-service...
    kubectl logs -f deployment/notification-service -n microservices-namespace
) else if "%choice%"=="7" (
    echo Viewing logs for request-service...
    kubectl logs -f deployment/request-service -n microservices-namespace
) else if "%choice%"=="8" (
    echo Viewing logs for websocket-service...
    kubectl logs -f deployment/websocket-service -n microservices-namespace
) else if "%choice%"=="9" (
    echo Viewing logs for all services (last 50 lines each)...
    echo.
    echo ============================================
    echo DISCOVERY SERVICE LOGS
    echo ============================================
    kubectl logs deployment/discovery-service -n microservices-namespace --tail=50
    echo.
    echo ============================================
    echo API GATEWAY SERVICE LOGS
    echo ============================================
    kubectl logs deployment/api-gateway-service -n microservices-namespace --tail=50
    echo.
    echo ============================================
    echo USER SERVICE LOGS
    echo ============================================
    kubectl logs deployment/user-service -n microservices-namespace --tail=50
    echo.
    echo ============================================
    echo ASSIGNMENT SERVICE LOGS
    echo ============================================
    kubectl logs deployment/assignment-service -n microservices-namespace --tail=50
    echo.
    echo ============================================
    echo INFORMATION SERVICE LOGS
    echo ============================================
    kubectl logs deployment/information-service -n microservices-namespace --tail=50
    echo.
    echo ============================================
    echo NOTIFICATION SERVICE LOGS
    echo ============================================
    kubectl logs deployment/notification-service -n microservices-namespace --tail=50
    echo.
    echo ============================================
    echo REQUEST SERVICE LOGS
    echo ============================================
    kubectl logs deployment/request-service -n microservices-namespace --tail=50
    echo.
    echo ============================================
    echo WEBSOCKET SERVICE LOGS
    echo ============================================
    kubectl logs deployment/websocket-service -n microservices-namespace --tail=50
) else if "%choice%"=="0" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice. Please run the script again.
    exit /b 1
)
