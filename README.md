# 🎓 EduGov – National Digital Education Infrastructure

A cloud-native DevOps platform built to modernize digital education services through automation, scalability, security, and operational resilience.

## 📌 Project Overview

EduGov is designed to support nationwide education services, including:

* Online Learning
* Digital Examinations
* Academic Records Management
* Student Admissions
* Scholarship Processing
* Certification Management
* Research Collaboration

The platform leverages modern DevOps practices to ensure high availability, automated deployments, centralized monitoring, secure secret management, and scalable infrastructure capable of handling peak workloads during examinations and admission cycles.

---

## 🏗️ Architecture Components

| Component               | Technology             |
| ----------------------- | ---------------------- |
| Cloud Platform          | AWS EC2                |
| Infrastructure as Code  | Terraform              |
| Containerization        | Docker                 |
| Container Orchestration | Kubernetes (K3s)       |
| CI/CD Pipeline          | Jenkins                |
| Secret Management       | HashiCorp Vault        |
| Monitoring              | Prometheus             |
| Visualization           | Grafana                |
| Logging                 | Elasticsearch & Kibana |
| Frontend                | React                  |
| Backend                 | Node.js                |

---

## 📂 Repository Structure

```text
EduGov/
├── backend/          # Node.js Backend API
├── frontend/         # React Frontend Application
├── database/         # Database Configuration & Scripts
├── terraform/        # AWS Infrastructure Provisioning
├── kubernetes/       # Deployments, Services & HPA Manifests
├── jenkins/          # Jenkins CI/CD Pipeline
├── security/         # Vault Policies & Secret Injection
├── monitoring/       # Prometheus & Grafana Configuration
├── logging/          # Elasticsearch & Kibana Configuration
├── docs/             # Architecture & Documentation
├── deploy_vault.sh   # Vault Deployment Script
├── README.md
└── .gitignore
```

---

## 🚀 Key Features

* Infrastructure provisioning using Terraform
* Docker containerization for applications
* Kubernetes-based deployment and orchestration
* Automated CI/CD pipelines using Jenkins
* Secure secret management with HashiCorp Vault
* Centralized monitoring with Prometheus & Grafana
* Log aggregation and analysis using ELK Stack
* Horizontal Pod Autoscaling (HPA)
* Cloud-native and scalable architecture
* Operational resilience and fault tolerance

---

## 🌐 Service Endpoints

| Service  | Port  |
| -------- | ----- |
| Frontend | 3000  |
| Backend  | 5001  |
| Jenkins  | 8080  |
| Vault    | 8200  |
| Kibana   | 31000 |
| Grafana  | 32000 |

---

## 🔍 Validation & Testing

### Verify Vault Secret Injection

```bash
kubectl get pods | grep vault

kubectl exec deployment/edugov-backend-vault \
-c edugov-backend -- cat /vault/secrets/db-creds
```

### Verify Backend Logs

```bash
kubectl logs deployment/edugov-backend-vault \
-c edugov-backend --tail=15
```

### Verify Horizontal Pod Autoscaler

```bash
kubectl get hpa -w
```

### Generate Load for Scaling Test

```bash
ab -n 50000 -c 80 http://localhost:5001/
```

---

## 🎯 Project Outcomes

* Automated Infrastructure Deployment
* Continuous Integration & Continuous Delivery
* Secure Secret Management
* Real-Time Monitoring & Alerting
* Centralized Logging & Observability
* Dynamic Autoscaling
* Improved Reliability and Resilience
* Cloud-Native DevOps Implementation

---

## 📖 Case Study Goal

To design and deploy a secure, scalable, and resilient national digital education platform capable of supporting significantly increased workloads while maintaining continuous availability, observability, and operational excellence.
