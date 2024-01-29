# local

# docker build and test

docker build --platform linux/amd64 --tag timheckel/slatebox-prod-collab:latest .
docker push timheckel/slatebox-prod-collab:latest

# kubernetes deploy - note must put actual secret values into yml file before calling (otherwise defer to github action)

kubectl apply -f ./k3.yml
