# 🎓 EduGov – National Digital Education Infrastructure

## Overview

EduGov is a cloud-native DevOps platform designed to support digital education services including online learning, examinations, admissions, academic records, scholarships, and certification management.

The project demonstrates Infrastructure as Code, CI/CD automation, Kubernetes orchestration, monitoring, logging, and secure secret management on AWS.

---

## Tech Stack

| Category          | Technology            |
| ----------------- | --------------------- |
| Cloud             | AWS EC2               |
| IaC               | Terraform             |
| Containerization  | Docker                |
| Orchestration     | Kubernetes (K3s)      |
| CI/CD             | Jenkins               |
| Secret Management | HashiCorp Vault       |
| Monitoring        | Prometheus            |
| Visualization     | Grafana               |
| Logging           | Elasticsearch, Kibana |
| Frontend          | React                 |
| Backend           | Node.js               |

---

## Repository Structure

| Directory     | Description                       |
| ------------- | --------------------------------- |
| `backend/`    | Node.js Backend API               |
| `frontend/`   | React Frontend Application        |
| `database/`   | Database Configurations           |
| `terraform/`  | Infrastructure Provisioning       |
| `kubernetes/` | Deployments, Services & HPA       |
| `jenkins/`    | CI/CD Pipeline Configuration      |
| `security/`   | Vault Policies & Secret Injection |
| `monitoring/` | Prometheus & Grafana Setup        |
| `logging/`    | Elasticsearch & Kibana Setup      |
| `docs/`       | Architecture Documentation        |

---

## Key Features

* Infrastructure provisioning using Terraform
* Docker containerization
* Kubernetes deployment and orchestration
* Jenkins CI/CD automation
* HashiCorp Vault secret management
* Prometheus monitoring
* Grafana dashboards
* ELK Stack centralized logging
* Horizontal Pod Autoscaling (HPA)
* Scalable and resilient architecture

---

## Service Endpoints

| Service  | Port  |
| -------- | ----- |
| Frontend | 3000  |
| Backend  | 5001  |
| Jenkins  | 8080  |
| Vault    | 8200  |
| Kibana   | 31000 |
| Grafana  | 32000 |

---

## Verification

### Vault Secret Injection

```bash
kubectl get pods | grep vault

kubectl exec deployment/edugov-backend-vault \
-c edugov-backend -- cat /vault/secrets/db-creds
```

### Check Application Logs

```bash
kubectl logs deployment/edugov-backend-vault \
-c edugov-backend --tail=15
```

### Verify HPA

```bash
kubectl get hpa -w
```

### Generate Load

```bash
ab -n 50000 -c 80 http://localhost:5001/
```

---

## Outcome

A secure, scalable, and resilient national education platform capable of handling high traffic loads through automated deployments, observability, secret management, and cloud-native DevOps practices.
