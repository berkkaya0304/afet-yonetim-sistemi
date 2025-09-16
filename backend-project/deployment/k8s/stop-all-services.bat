@echo off
echo Stopping all microservices from Kubernetes...

echo.
echo Deleting all deployments...
kubectl delete deployment discovery-service -n microservices-namespace --ignore-not-found=true
kubectl delete deployment api-gateway-service -n microservices-namespace --ignore-not-found=true
kubectl delete deployment user-service -n microservices-namespace --ignore-not-found=true
kubectl delete deployment assignment-service -n microservices-namespace --ignore-not-found=true
kubectl delete deployment information-service -n microservices-namespace --ignore-not-found=true
kubectl delete deployment notification-service -n microservices-namespace --ignore-not-found=true
kubectl delete deployment request-service -n microservices-namespace --ignore-not-found=true
kubectl delete deployment websocket-service -n microservices-namespace --ignore-not-found=true

echo.
echo Deleting all services...
kubectl delete service discovery-service -n microservices-namespace --ignore-not-found=true
kubectl delete service api-gateway-service -n microservices-namespace --ignore-not-found=true
kubectl delete service user-service -n microservices-namespace --ignore-not-found=true
kubectl delete service assignment-service -n microservices-namespace --ignore-not-found=true
kubectl delete service information-service -n microservices-namespace --ignore-not-found=true
kubectl delete service notification-service -n microservices-namespace --ignore-not-found=true
kubectl delete service request-service -n microservices-namespace --ignore-not-found=true
kubectl delete service websocket-service -n microservices-namespace --ignore-not-found=true

echo.
echo All services stopped and removed!
echo.
echo Remaining pods in microservices-namespace:
kubectl get pods -n microservices-namespace
echo.
echo Remaining services in microservices-namespace:
kubectl get services -n microservices-namespace
