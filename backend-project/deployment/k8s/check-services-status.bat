@echo off
echo Checking status of all microservices in Kubernetes...

echo.
echo ============================================
echo PODS STATUS
echo ============================================
kubectl get pods -n microservices-namespace -o wide

echo.
echo ============================================
echo SERVICES STATUS
echo ============================================
kubectl get services -n microservices-namespace

echo.
echo ============================================
echo DEPLOYMENTS STATUS
echo ============================================
kubectl get deployments -n microservices-namespace

echo.
echo ============================================
echo DETAILED POD STATUS
echo ============================================
kubectl describe pods -n microservices-namespace

echo.
echo ============================================
echo SERVICE ENDPOINTS
echo ============================================
kubectl get endpoints -n microservices-namespace

echo.
echo ============================================
echo NAMESPACE INFO
echo ============================================
kubectl get namespace microservices-namespace -o yaml
