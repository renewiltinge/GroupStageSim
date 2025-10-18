# File: docs/Deployment-Kubernetes.md

<PROJECT_NAME>=GroupStageSim · <DB_ENGINE>=SQL Server · <BROKER>=RabbitMQ · <NAMESPACE>=groupsim · <API_PORT>=5180 · <DB_PORT>=1433 · <RABBITMQ_PORT>=5672 · <BASE_RATE>=1.3 · <HOME_ADV>=1.05 · <AWAY_MOD>=0.95 · <DEFAULT_SEED>=42

## Namespace & Manifests
- All resources live in namespace `<NAMESPACE>`.
- Manifests are stored under `/deploy/k8s`:
  - `namespace.yaml`
  - `sqlserver-deployment.yaml`, `sqlserver-service.yaml`
  - `rabbitmq-deployment.yaml`, `rabbitmq-service.yaml`
  - `tournamentapi-deployment.yaml`, `tournamentapi-service.yaml`
  - `simulatorworker-deployment.yaml`
  - `configmap.yaml`, `secret.yaml`

## Apply Sequence
```powershell
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -n <NAMESPACE> -f deploy/k8s/configmap.yaml
kubectl apply -n <NAMESPACE> -f deploy/k8s/secret.yaml
kubectl apply -n <NAMESPACE> -f deploy/k8s/sqlserver-deployment.yaml
kubectl apply -n <NAMESPACE> -f deploy/k8s/sqlserver-service.yaml
kubectl apply -n <NAMESPACE> -f deploy/k8s/rabbitmq-deployment.yaml
kubectl apply -n <NAMESPACE> -f deploy/k8s/rabbitmq-service.yaml
kubectl apply -n <NAMESPACE> -f deploy/k8s/tournamentapi-deployment.yaml
kubectl apply -n <NAMESPACE> -f deploy/k8s/tournamentapi-service.yaml
kubectl apply -n <NAMESPACE> -f deploy/k8s/simulatorworker-deployment.yaml
```

## Probes & Resources
- API deployment uses readiness `/health/ready` and liveness `/health/live` probes.
- Worker uses liveness command probe (`dotnet --info` fallback) and readiness based on RabbitMQ connection check.
- Requests: `250m CPU / 256Mi` for API, `200m / 256Mi` for worker.
- Limits doubled for burst tolerance.

## Port Forwarding
```powershell
kubectl port-forward svc/tournamentapi -n <NAMESPACE> <API_PORT>:5180
kubectl port-forward svc/rabbitmq -n <NAMESPACE> 15672:15672
```

## Stateful Dependencies
- `<DB_ENGINE>` and `<BROKER>` run as single replicas with persistent volume claims (hostPath for minikube/kind).
- For production, prefer managed services (Azure SQL, Azure Service Bus / RabbitMQ cluster) to offload maintenance.

## Configuration & Secrets
- `configmap.yaml` holds non-sensitive settings (base rate, hostnames).
- `secret.yaml` stores SA password and RabbitMQ credentials (base64-encoded placeholders).
- Deployments reference ConfigMap via env vars and volume-mounted JSON when necessary.

## Cleanup
```powershell
kubectl delete namespace <NAMESPACE>
```

## Why This Matters
- Shows you can operate beyond local Docker Compose, aligning with cloud-native expectations.
- Highlights readiness/liveness design, a common interview question for productionizing services.
- Emphasises separation of config and secrets, reinforcing DevSecOps awareness.
