@echo off
echo Construindo as imagens...
docker-compose build

echo Fazendo push das imagens...
docker push ryanmarques/web

echo Aplicando os deployments e services no Kubernetes...

kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

echo Implantação concluída!
pause 