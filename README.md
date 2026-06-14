# EduGov DevOps Configuration

This repository contains the deployment, automation, and monitoring configurations for the EduGov platform. The setup is designed to run on a single AWS EC2 instance running K3s.

## Repository Structure

* `backend/`: Node.js API application
* `frontend/`: React client application
* `kubernetes/`: Deployment, service, and HPA manifests
* `jenkins/`: Jenkinsfile for pipeline automation
* `security/`: Vault policy and sidecar injection manifests
* `logging/`: Elasticsearch and Kibana configurations
* `monitoring/`: Prometheus and Grafana Helm configurations

## Local Ports

Access the deployed services on the EC2 instance using the following ports:

| Service | Port | Type |
| :--- | :--- | :--- |
| React Frontend | 3000 | NodePort / LoadBalancer |
| Node.js Backend | 5001 | NodePort / LoadBalancer |
| Jenkins | 8080 | Host Port |
| HashiCorp Vault | 8200 | Host Port |
| Kibana | 31000 | NodePort |
| Grafana | 32000 | NodePort |

## Verification

### HashiCorp Vault Secret Injection

Check that the backend vault pod is running with the sidecar container:
```bash
sudo kubectl get pods | grep vault
```

Inspect the injected credentials inside the container:
```bash
sudo kubectl exec deployment/edugov-backend-vault -c edugov-backend -- cat /vault/secrets/db-creds
```

Verify the database connection in logs:
```bash
sudo kubectl logs deployment/edugov-backend-vault -c edugov-backend --tail=15
```

### Autoscaling & HPA

Install the load generator:
```bash
sudo apt-get update && sudo apt-get install -y apache2-utils
```

Run the load test:
```bash
ab -n 50000 -c 80 http://localhost:5001/
```

Monitor HPA scaling in real-time:
```bash
sudo kubectl get hpa -w
```
