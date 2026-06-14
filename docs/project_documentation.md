# Case Study 86: Project EduGov – National Digital Education Infrastructure
## Master DevOps Implementation & Deployment Documentation

---

## 1. Executive Summary
EduGov is a nationwide digital education platform connecting schools, universities, accreditation bodies, government agencies, educators, and students. To replace the legacy, isolated, and manual server infrastructure, this project implements an end-to-end automated, containerized, autoscaled, and secured cloud infrastructure using **K3s (Kubernetes)**, **Terraform**, **Docker**, **Jenkins**, **HashiCorp Vault**, and the **ELK/Prometheus** stacks.

---

## 2. Infrastructure Setup (Terraform & AWS EC2)
The underlying infrastructure is deployed on AWS using Terraform to define a VPC, Security Group policies, and a single-node EC2 instance optimized to host our K3s cluster.

### Key Setup Steps
1. **Terraform Initialization & Apply**:
   ```bash
   cd terraform
   terraform init
   terraform apply -auto-approve
   ```
2. **Security Group Configuration**:
   *   Port `22` (SSH)
   *   Port `3000` (React Frontend)
   *   Port `5001` (Node.js API)
   *   Port `8080` (Jenkins)
   *   NodePort Range `30000-32767` (Grafana, Kibana, Vault access)

---
📂 **[INSERT SCREENSHOT: AWS EC2 Instance Running & Security Group Inbound Rules]**
---

## 3. Containerization (Docker)
Both the Node.js API backend and React frontend are containerized to ensure identical environments across development, testing, and production.

### Key Setup Steps
1. **Build Local Images**:
   ```bash
   docker build -t shweta1616/edugov-backend:latest ./backend
   docker build -t shweta1616/edugov-frontend:latest ./frontend
   ```
2. **Verify Containers Running Locally**:
   ```bash
   docker ps -a
   ```

---
📂 **[INSERT SCREENSHOT: Terminal output of 'docker ps' showing running frontend/backend containers]**
---

## 4. Kubernetes Cluster Setup (K3s)
Instead of AWS EKS, K3s (a lightweight Kubernetes distribution) is installed on the EC2 instance to keep cloud computing costs minimal.

### Key Setup Steps
1. **K3s Installation**:
   ```bash
   curl -sfL https://get.k3s.io | sh -
   ```
2. **Configure kubectl Access**:
   ```bash
   mkdir -p $HOME/.kube
   sudo cp /etc/rancher/k3s/k3s.yaml $HOME/.kube/config
   sudo chown $USER:$USER $HOME/.kube/config
   export KUBECONFIG=$HOME/.kube/config
   ```
3. **Verify Node Status**:
   ```bash
   sudo kubectl get nodes
   ```

---
📂 **[INSERT SCREENSHOT: Terminal output of 'kubectl get nodes' showing node status as READY]**
---

## 5. Kubernetes Application Deployment
Deploy MongoDB (database layer), Node.js backend (REST API layer), and React frontend.

### Key Setup Steps
1. **Create Persistent Storage & Deploy Manifests**:
   ```bash
   sudo mkdir -p /mnt/data/mongodb
   sudo chmod 777 /mnt/data/mongodb
   
   sudo kubectl apply -f kubernetes/mongodb-pv.yaml
   sudo kubectl apply -f kubernetes/mongodb-pvc.yaml
   sudo kubectl apply -f kubernetes/mongodb-deployment.yaml
   sudo kubectl apply -f kubernetes/mongodb-service.yaml
   sudo kubectl apply -f kubernetes/backend-deployment.yaml
   sudo kubectl apply -f kubernetes/backend-service.yaml
   sudo kubectl apply -f kubernetes/frontend-deployment.yaml
   sudo kubectl apply -f kubernetes/frontend-service.yaml
   sudo kubectl apply -f kubernetes/hpa-backend.yaml
   ```
2. **Verify Deployments & Services**:
   ```bash
   sudo kubectl get deployments,pods,services
   ```

---
📂 **[INSERT SCREENSHOT: Terminal output of 'kubectl get pods,svc' showing running EduGov components]**
---
📂 **[INSERT SCREENSHOT: Web browser accessing the React Frontend on http://<EC2_IP>:3000]**
---

## 6. CI/CD Pipeline Automation (Jenkins & Webhooks)
Jenkins automates the building, testing, and deployment phases. GitHub is configured via Webhooks to trigger builds on commit pushes.

### Key Setup Steps
1. **GitHub Webhook Config**:
   *   **Payload URL**: `http://<EC2_IP>:8080/github-webhook/`
   *   **Content Type**: `application/json`
2. **Jenkins Pipeline Creation**:
   *   Create Pipeline job tracking the GitHub repository SCM.
   *   Set Pipeline script path to `jenkins/Jenkinsfile`.

---
📂 **[INSERT SCREENSHOT: GitHub Settings page showing active Webhook with green checkmark]**
---
📂 **[INSERT SCREENSHOT: Jenkins Pipeline Stage View showing successful multi-stage build progress]**
---

## 7. Monitoring Setup (Prometheus & Grafana)
Prometheus is configured to pull hardware and cluster metrics, while Grafana visualizes the resource utilization.

### Key Setup Steps
1. **Deploy Helm Chart**:
   ```bash
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm repo update
   kubectl create namespace monitoring
   helm install kube-prometheus prometheus-community/kube-prometheus-stack -n monitoring -f monitoring/prometheus-values.yaml
   ```
2. **Access Grafana**:
   *   Open: `http://<EC2_IP>:32000`
   *   Import Dashboard ID: `12740` (Kubernetes Cluster Metrics)

---
📂 **[INSERT SCREENSHOT: Grafana dashboard UI showing running cluster metrics]**
---

## 8. Logging Setup (ELK Stack)
Elasticsearch collects container log data, which is parsed and queried using Kibana.

### Key Setup Steps
1. **Deploy Manifests**:
   ```bash
   sudo kubectl apply -f logging/elasticsearch.yaml
   sudo kubectl apply -f logging/kibana.yaml
   ```
2. **Access Kibana**:
   *   Open: `http://<EC2_IP>:31000`

---
📂 **[INSERT SCREENSHOT: Kibana dashboard welcome page accessed in browser]**
---

## 9. Security & Secret Injection (HashiCorp Vault)
Credentials are not hardcoded in source files or environment variables; instead, they are dynamically injected in-memory using the Vault Agent sidecar injector.

### Key Setup Steps
1. **Configure Vault Kubernetes Auth backend**:
   ```bash
   # Extract K3s cluster CA cert
   sudo cat /var/lib/rancher/k3s/server/tls/server-ca.crt
   
   # Enable K8s Auth backend inside Vault and map policies
   vault auth enable kubernetes
   vault write auth/kubernetes/config kubernetes_host="https://127.0.0.1:6443" disable_local_ca_jwt="true"
   ```
2. **Deploy Vault Sidecar Manifest**:
   ```bash
   sudo kubectl apply -f security/secret-pod-demo.yaml
   ```
3. **Verify Secret Injection**:
   ```bash
   sudo kubectl exec deployment/edugov-backend-vault -c edugov-backend -- cat /vault/secrets/db-creds
   ```

---
📂 **[INSERT SCREENSHOT: Terminal displaying injected db-creds environment variables]**
---
📂 **[INSERT SCREENSHOT: Terminal logs showing Node.js successfully connecting to MongoDB using injected secrets]**
---

## 10. Autoscaling & Load Testing (HPA)
The Horizontal Pod Autoscaler dynamically adjusts replica counts to absorb massive user traffic spikes during admission and exam periods.

### Key Setup Steps
1. **Execute Benchmarking Load Test**:
   ```bash
   sudo apt-get update && sudo apt-get install -y apache2-utils
   ab -n 50000 -c 80 http://localhost:5001/
   ```
2. **Monitor Autoscaler Action**:
   ```bash
   sudo kubectl get hpa -w
   ```
3. **Check Replicas Count**:
   ```bash
   sudo kubectl get pods -l app=edugov-backend
   ```

---
📂 **[INSERT SCREENSHOT: HPA monitoring terminal showing replica scaling increasing to 5]**
---
📂 **[INSERT SCREENSHOT: Terminal output of 'kubectl get pods' showing 5 backend replicas running under load]**
---
