# EduGov DevOps Project Master Handbook (Phases 7 - 14)

Welcome to the EduGov DevOps implementation handbook. This document provides step-by-step, copy-pasteable instructions for completing all remaining phases of the project using a **low-cost single-node K3s AWS EC2 architecture**.

---

## Workspace Directory Structure

All necessary configuration and manifest files are located in your workspace:

```text
EduGov/
├── kubernetes/
│   ├── mongodb-pv.yaml         # Persistent Volume for DB
│   ├── mongodb-pvc.yaml        # Persistent Volume Claim for DB
│   ├── mongodb-deployment.yaml # MongoDB deployment configuration
│   ├── mongodb-service.yaml    # Database internal cluster service
│   ├── backend-deployment.yaml # Node.js backend deployment configuration
│   ├── backend-service.yaml    # Backend LoadBalancer service configuration
│   ├── frontend-deployment.yaml# React frontend deployment configuration
│   ├── frontend-service.yaml   # Frontend LoadBalancer service configuration
│   └── hpa-backend.yaml        # Horizontal Pod Autoscaler configuration
├── jenkins/
│   └── Jenkinsfile             # Multi-stage CI/CD pipeline automation
├── monitoring/
│   └── prometheus-values.yaml  # Helm configuration for Prometheus stack
├── logging/
│   ├── elasticsearch.yaml      # Low-memory Elasticsearch deployment
│   └── kibana.yaml             # Kibana UI deployment and NodePort service
└── security/
    ├── vault-policy.hcl        # Vault policy for reading secrets
    └── secret-pod-demo.yaml    # Vault agent injector deployment manifest
```

---

## Phase 7: Kubernetes Setup

We use **K3s** (a lightweight, CNCF-certified Kubernetes distribution) instead of AWS EKS to keep AWS costs minimal. It is optimized to run on a single EC2 instance while maintaining full Kubernetes API compatibility.

### 1. Exact Commands
Execute the following commands on your EC2 instance (`Ubuntu 22.04 LTS`):
```bash
# 1. Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install kubectl client
sudo apt-get install -y apt-transport-https ca-certificates curl
sudo curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-archive-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubectl

# 3. Install K3s (Lightweight Kubernetes Server)
curl -sfL https://get.k3s.io | sh -

# 4. Set up permissions to connect kubectl to the cluster without using sudo
mkdir -p $HOME/.kube
sudo cp /etc/rancher/k3s/k3s.yaml $HOME/.kube/config
sudo chown $USER:$USER $HOME/.kube/config
export KUBECONFIG=$HOME/.kube/config
echo "export KUBECONFIG=$HOME/.kube/config" >> ~/.bashrc
```

### 2. Configuration Files
K3s configures itself automatically. The generated kubeconfig is saved at `/etc/rancher/k3s/k3s.yaml`.

### 3. AWS Console Steps
1. Navigate to **AWS Console > EC2 > Security Groups**.
2. Edit **Inbound Rules** for `edugov-sg`.
3. Ensure the following rules exist:
   - **Port 22 (SSH)**: Source `0.0.0.0/0` (or your IP)
   - **Port 3000 (React Frontend)**: Source `0.0.0.0/0`
   - **Port 5001 (Node.js API)**: Source `0.0.0.0/0`
   - **Port 8080 (Jenkins UI)**: Source `0.0.0.0/0`
   - **NodePort Range (30000-32767)**: Source `0.0.0.0/0` (Required for Grafana, Kibana, Vault access)

### 4. Verification Commands & Expected Outputs
```bash
# Verify kubectl installation
kubectl version --client
```
*Expected Output:*
```text
Client Version: v1.28.x
Kustomize Version: v5.0.x
```
```bash
# Verify K3s cluster node status
kubectl get nodes
```
*Expected Output:*
```text
NAME             STATUS   ROLES                  AGE    VERSION
edugov-server    Ready    control-plane,master   2m     v1.28.x+k3s1
```

### 5. Troubleshooting Commands
If K3s fails to start, check the system service log:
```bash
sudo systemctl status k3s.service
sudo journalctl -u k3s.service -f --no-pager
```

### 6. Screenshots to Capture
- Output of `kubectl get nodes` showing the node status as `Ready`.

### 7. Viva Q&A
- **Q**: Why choose K3s over AWS EKS for this project?
  - **A**: AWS EKS has a flat rate control plane fee of $73/month and requires heavy-duty worker nodes (t3.medium or larger), making it expensive. K3s runs both control plane and worker nodes on a single EC2 instance, costing $0 additionally and consuming less than 512MB RAM.
- **Q**: What database engine does K3s use internally instead of etcd?
  - **A**: K3s uses **SQLite** by default for single-node setups, which significantly reduces the memory overhead compared to etcd, while still offering standard etcd compliance.

---

## Phase 8: Kubernetes Deployment

We will deploy our application stack: MongoDB (stateful), Node.js backend (stateless API), and React frontend (stateless client).

### 1. Exact Commands
```bash
# 1. Create the persistent storage directory on the host (for MongoDB PV)
sudo mkdir -p /mnt/data/mongodb
sudo chmod 777 /mnt/data/mongodb

# 2. Deploy all manifests (MongoDB, Backend, Frontend, and HPA)
kubectl apply -f kubernetes/mongodb-pv.yaml
kubectl apply -f kubernetes/mongodb-pvc.yaml
kubectl apply -f kubernetes/mongodb-deployment.yaml
kubectl apply -f kubernetes/mongodb-service.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml
kubectl apply -f kubernetes/hpa-backend.yaml
```

### 2. Configuration & YAML Files
All deployment files are located under `kubernetes/`. The frontend deployment uses the environment variable `VITE_API_URL` pointing to `http://<EC2_PUBLIC_IP>:5001/api`.

### 3. Verification Commands & Expected Outputs
```bash
# Verify volume and claim binding
kubectl get pv,pvc
```
*Expected Output:*
```text
NAME                          CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                 STORAGECLASS
persistentvolume/mongodb-pv   5Gi        RWO            Retain           Bound    default/mongodb-pvc   manual

NAME                                STATUS   VOLUME       CAPACITY   ACCESS MODES   STORAGECLASS
persistentvolumeclaim/mongodb-pvc   Bound    mongodb-pv   5Gi        RWO            manual
```
```bash
# Verify that all pods are Running
kubectl get pods
```
*Expected Output:*
```text
NAME                               READY   STATUS    RESTARTS   AGE
mongodb-7c858546b-xyz12            1/1     Running   0          45s
edugov-backend-56f4d7b7d-abcde     1/1     Running   0          30s
edugov-frontend-79bc694d6-12345    1/1     Running   0          30s
```
```bash
# Verify services mapping
kubectl get svc
```
*Expected Output:*
```text
NAME              TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
kubernetes        ClusterIP      10.43.0.1       <none>          443/TCP          1h
mongodb           ClusterIP      10.43.20.10     <none>          27017/TCP        1m
edugov-backend    LoadBalancer   10.43.50.15     10.0.1.X        5001:30005/TCP   1m
edugov-frontend   LoadBalancer   10.43.120.30    10.0.1.X        3000:30003/TCP   1m
```

### 4. Troubleshooting Commands
If a pod is stuck in `ImagePullBackOff` or `Pending`:
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### 5. Screenshots to Capture
- Output of `kubectl get pods,svc` showing all components running and exposed.
- Browser page showing the React application rendering successfully on `http://<EC2_PUBLIC_IP>:3000`.

### 6. Viva Q&A
- **Q**: What is the difference between ClusterIP, NodePort, and LoadBalancer service types?
  - **A**: **ClusterIP** exposes the service internally within the cluster. **NodePort** exposes the service on a static port on each node's IP. **LoadBalancer** exposes the service externally using a cloud provider's load balancer (in K3s, it binds directly to the host port using Klipper LoadBalancer).

---

## Phase 9: Jenkins Installation & Configuration

Jenkins will act as our automation controller to build, test, and deploy code updates.

### 1. Exact Commands
Run these commands on the EC2 instance to install Jenkins:
```bash
# 1. Install Java 17 LTS (prerequisite for Jenkins)
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk openjdk-17-jre

# 2. Add Jenkins Debian Repository and Repository GPG Key
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# 3. Install Jenkins
sudo apt-get update
sudo apt-get install -y jenkins

# 4. Enable and start Jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins

# 5. Add jenkins user to docker group (crucial for pipeline docker commands)
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 2. Configuration Steps & AWS Console
1. Retrieve the initial Administrator Password:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
2. Open your browser and navigate to `http://<EC2_PUBLIC_IP>:8080`.
3. Paste the password, select **Install Suggested Plugins**, and create an Admin User.
4. Go to **Manage Jenkins > Plugins > Available Plugins**. Search and install:
   - **Docker**
   - **Docker Pipeline**
   - **Pipeline: Stage View**
5. Restart Jenkins: `http://<EC2_PUBLIC_IP>:8080/safeRestart`.

### 3. Verification Commands & Expected Outputs
```bash
sudo systemctl status jenkins
```
*Expected Output:*
```text
● jenkins.service - Jenkins Continuous Integration Server
     Loaded: loaded (/lib/systemd/system/jenkins.service; enabled; vendor preset: enabled)
     Active: active (running) since ...
```

### 4. Troubleshooting Commands
If Jenkins fails to start or run docker commands:
```bash
# View service logs
sudo journalctl -u jenkins -f
# Verify group memberships
groups jenkins
# If docker command fails, manually refresh group settings
sudo systemctl restart docker && sudo systemctl restart jenkins
```

### 5. Screenshots to Capture
- Jenkins Setup Wizard unlocked page.
- Installed plugins list showing `Docker` and `Docker Pipeline`.

### 6. Viva Q&A
- **Q**: Why do we add the `jenkins` user to the `docker` group?
  - **A**: By default, the Docker daemon binds to a Unix socket owned by `root` and accessible by members of the `docker` group. Adding the `jenkins` user allows it to run Docker commands (`docker build`, `docker push`) without using `sudo`.

---

## Phase 10: CI/CD Pipeline Automation

We will link GitHub with Jenkins using Webhooks so that any new code commit automatically triggers image builds, Docker Hub pushes, and rolling updates to Kubernetes.

### 1. Setup GitHub Credentials in Jenkins
1. Go to **Jenkins Dashboard > Manage Jenkins > Credentials > System > Global credentials**.
2. Click **Add Credentials**:
   - **Kind**: Username with password
   - **Username**: Your Docker Hub username
   - **Password**: Your Docker Hub Personal Access Token (PAT)
   - **ID**: `docker-hub-credentials` (Must match the `DOCKER_CREDS_ID` in the `Jenkinsfile`).

### 2. Create Jenkins Pipeline
1. Click **New Item** on Jenkins Dashboard.
2. Name it `EduGov-Pipeline`, select **Pipeline**, and click **OK**.
3. Under **Build Triggers**, check **GitHub hook trigger for GITScm polling**.
4. In **Pipeline** section:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/<your-username>/<your-repo-name>.git`
   - **Branch Specifier**: `*/main`
   - **Script Path**: `jenkins/Jenkinsfile`
5. Click **Save**.

### 3. Configure GitHub Webhook
1. Go to your GitHub Repository.
2. Click **Settings > Webhooks > Add Webhook**.
3. **Payload URL**: `http://<EC2_PUBLIC_IP>:8080/github-webhook/` (Make sure to include the trailing slash).
4. **Content type**: `application/json`.
5. **Which events**: Just the `push` event.
6. Click **Add webhook**.

### 4. Verification Commands & Expected Outputs
Make a small change to `frontend/src/App.jsx` (e.g., change the title), and push it to GitHub:
```bash
git add .
git commit -m "Test webhook trigger"
git push origin main
```
*Expected Output:*
- Jenkins will immediately trigger a new build.
- The pipeline will execute all stages: Checkout -> Verify -> Build -> Push -> Deploy.
- Checking `kubectl get pods` will show new pods initializing and terminating old pods.

### 5. Screenshots to Capture
- GitHub Webhook configuration page showing a green checkmark next to the URL.
- Jenkins Pipeline stage view showing a successful build with all stages green.

### 6. Viva Q&A
- **Q**: What is the purpose of a GitHub Webhook?
  - **A**: A webhook is an HTTP POST request triggered by an event (like a `git push`) in GitHub, sent to a target URL (Jenkins). This eliminates the need for Jenkins to constantly poll GitHub, enabling instant, event-driven CI/CD execution.

---

## Phase 11: Monitoring Setup (Prometheus & Grafana)

We will monitor our cluster health, node metrics, and application resources using Prometheus (for collecting metrics) and Grafana (for visual dashboards).

### 1. Exact Commands
Run these commands on the EC2 instance:
```bash
# 1. Install Helm (Kubernetes Package Manager)
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
sudo apt-get install apt-transport-https --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install -y helm

# 2. Add Prometheus Community Helm Repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 3. Create a dedicated monitoring namespace
kubectl create namespace monitoring

# 4. Deploy Prometheus and Grafana using our custom resource-constrained values
helm install kube-prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f monitoring/prometheus-values.yaml
```

### 2. Verification Commands & Expected Outputs
```bash
# Verify monitoring pods
kubectl get pods -n monitoring
```
*Expected Output:*
```text
NAME                                                     READY   STATUS    RESTARTS   AGE
kube-prometheus-operator-7c858546b-xyz12                1/1     Running   0          2m
prometheus-kube-prometheus-prometheus-0                 2/2     Running   0          2m
kube-prometheus-kube-state-metrics-79bc694d6-12345       1/1     Running   0          2m
kube-prometheus-prometheus-node-exporter-abcde          1/1     Running   0          2m
kube-prometheus-grafana-79bc694d6-54321                  1/1     Running   0          2m
```

### 3. Accessing Grafana Dashboards
1. Since we configured Grafana as a NodePort service on port `32000` (in `prometheus-values.yaml`), you can access it directly at: `http://<EC2_PUBLIC_IP>:32000`.
2. Login with credentials: Username `admin` / Password `admin` (configured in values.yaml).
3. Import the default **Kubernetes Cluster** dashboard:
   - Click **+ > Import**.
   - Enter dashboard ID `12740` or `315` and click **Load**.
   - Select `Prometheus` as the data source and click **Import**.

### 4. Screenshots to Capture
- Grafana login page and the imported Kubernetes resource metrics dashboard.

### 5. Viva Q&A
- **Q**: What is the role of Node Exporter?
  - **A**: Node Exporter runs as a DaemonSet on each node and scrapes hardware and OS metrics (CPU usage, memory consumption, disk I/O, network stats) and exposes them in a format Prometheus can collect.

---

## Phase 12: Logging Setup (ELK Stack)

We will gather application logs, format them, and index them so we can query and view logs in Kibana.

### 1. Exact Commands
```bash
# 1. Deploy low-memory Elasticsearch and Kibana manifests
kubectl apply -f logging/elasticsearch.yaml
kubectl apply -f logging/kibana.yaml
```

### 2. Configuring Log Collection (fluent-bit or direct logs)
For a low-cost system, we inspect logs directly via K3s journald and container engines or use a simple Daemonset. Alternatively, you can view container logs in Kibana once elasticsearch is populated, or execute manual queries.
To access the Kibana portal, navigate to `http://<EC2_PUBLIC_IP>:31000` (the NodePort configured in `kibana.yaml`).

### 3. Verification Commands & Expected Outputs
```bash
# Verify logging services
kubectl get pods,svc -l app=elasticsearch
kubectl get pods,svc -l app=kibana
```
*Expected Output:*
```text
NAME                                 READY   STATUS    RESTARTS   AGE
pod/elasticsearch-84f9dfc8c5-abcde   1/1     Running   0          2m
pod/kibana-79bc694d6-12345           1/1     Running   0          1m

NAME                    TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)          AGE
service/elasticsearch   ClusterIP   10.43.50.80   <none>        9200/TCP         2m
service/kibana          NodePort    10.43.80.90   <none>        5601:31000/TCP   1m
```
Check health of Elasticsearch cluster from host:
```bash
curl http://localhost:9200/_cluster/health?pretty
```
*Expected Output:*
```json
{
  "cluster_name" : "elasticsearch",
  "status" : "yellow",
  "number_of_nodes" : 1,
  "active_primary_shards" : 1
}
```

### 4. Troubleshooting Commands
Elasticsearch needs substantial memory. If the pod is terminated or gets stuck:
```bash
# Check if pod is OOMKilled (Out of Memory Killed)
kubectl describe pod elasticsearch | grep -i "OOM"
# View pod logs
kubectl logs deployment/elasticsearch
```
*Solution:* Ensure the EC2 instance is at least a `t3.medium` or `t3.large`.

### 5. Screenshots to Capture
- The Elasticsearch JSON health status output in the terminal.
- Kibana Dashboard welcome screen open in your browser at port `31000`.

### 6. Viva Q&A
- **Q**: Why did we restrict JVM memory flags `-Xms512m -Xmx512m` in the Elasticsearch manifest?
  - **A**: Elasticsearch defaults to allocating 50% of the host's total RAM to its JVM heap. On a single EC2 node running multiple services, this would immediately consume all RAM and crash the server. Setting it to 512MB limits its footprint to a manageable size.

---

## Phase 13: Security (HashiCorp Vault)

We will use HashiCorp Vault to securely store and inject secrets (like our Mongo URI and JWT secret key) into our backend application dynamically.

### 1. Exact Commands
Install Vault on the EC2 instance:
```bash
# 1. Install HashiCorp GPG key and Repository
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt-get update && sudo apt-get install -y vault

# 2. Run Vault in Dev Mode (low-cost, easy to setup for testing)
# This starts Vault locally in the background on port 8200
nohup vault server -dev -dev-listen-address="0.0.0.0:8200" > /tmp/vault.log 2>&1 &
```
Configure Vault secrets and write policy:
```bash
# 3. Export Vault address
export VAULT_ADDR='http://127.0.0.1:8200'
echo "export VAULT_ADDR='http://127.0.0.1:8200'" >> ~/.bashrc

# Retrieve root token from logs
export VAULT_TOKEN=$(grep "Root Token" /tmp/vault.log | awk '{print $NF}')
echo "Your Vault Root Token is: $VAULT_TOKEN"

# 4. Enable K-V Secret engine and store credentials
vault kv put secret/edugov MONGO_URI="mongodb://mongodb:27017/edugov_db" JWT_SECRET="edugov_super_secret_jwt_key_2026"

# 5. Enable Kubernetes authentication backend inside Vault
vault auth enable kubernetes

# 6. Apply policy we created in workspace
vault policy write edugov-read security/vault-policy.hcl

# 7. Configure Kubernetes auth connection settings in Vault
# (This allows Kubernetes ServiceAccounts to authenticate against Vault)
vault write auth/kubernetes/config \
    kubernetes_host="https://127.0.0.1:6443" \
    disable_local_ca_jwt="true"

# 8. Create a Vault role associated with our service account
vault write auth/kubernetes/role/edugov-read-role \
    bound_service_account_names=edugov-vault-sa \
    bound_service_account_namespaces=default \
    policies=edugov-read \
    ttl=24h
```
Configure Kubernetes ServiceAccount & Deploy demo:
```bash
# 9. Create Service Account in K3s
kubectl create serviceaccount edugov-vault-sa

# 10. Deploy the Vault Sidecar Demo
kubectl apply -f security/secret-pod-demo.yaml
```

### 2. Verification Commands & Expected Outputs
Verify that the Vault agent sidecar injected the secrets file into the running pod:
```bash
# List pods to find our vault-demo pod
kubectl get pods | grep vault-demo

# Exec into the container and inspect the injected secrets file
kubectl exec deployment/edugov-backend-vault -c edugov-backend -- cat /vault/secrets/db-creds
```
*Expected Output:*
```text
MONGO_URI="mongodb://mongodb:27017/edugov_db"
JWT_SECRET="edugov_super_secret_jwt_key_2026"
```

### 3. Screenshots to Capture
- Output of the terminal showing the contents of `/vault/secrets/db-creds` being printed.

### 4. Viva Q&A
- **Q**: How does the Vault Agent Sidecar Injector work?
  - **A**: The Vault Agent Injector is a Kubernetes mutating admission webhook. When it detects specific annotations on a pod creation request, it alters the pod spec to inject a Vault Agent init container (which fetches secrets) and a sidecar container (which keeps secrets synchronized) mounting a shared memory volume.

---

## Phase 14: Auto Scaling & Load Testing

We will deploy a Horizontal Pod Autoscaler (HPA) to monitor the CPU usage of our backend deployment, generate synthetic load using a traffic tool, and observe the pods auto-scaling.

### 1. Exact Commands
Deploy the K3s Metric Server (normally K3s comes with metrics-server preconfigured. If not, install it using the command below):
```bash
# (Optional) If metrics server is not enabled, install it:
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```
Apply HPA configuration:
```bash
# Apply HPA manifest
kubectl apply -f kubernetes/hpa-backend.yaml
```
Generate Load for Testing:
```bash
# Run a loop using curl to hit the backend endpoint on port 5001
# Open a new shell session on your instance or desktop:
sudo apt-get install -y apache2-utils

# Generate high load (50 concurrent connections, 10,000 total requests)
ab -n 10000 -c 50 http://<EC2_PUBLIC_IP>:5001/
```
Monitor Scaling Progress (Run in another terminal):
```bash
# Watch the HPA status in real-time
kubectl get hpa -w
```

### 2. Expected Outputs
In the HPA shell, you will observe the TARGET CPU utilization rise and the replica count scale up:
```text
NAME                 REFERENCE                   TARGETS    MINPODS   MAXPODS   REPLICAS   AGE
edugov-backend-hpa   Deployment/edugov-backend   0%/50      1         5         1          1m
edugov-backend-hpa   Deployment/edugov-backend   95%/50     1         5         1          2m
edugov-backend-hpa   Deployment/edugov-backend   95%/50     1         5         3          3m
edugov-backend-hpa   Deployment/edugov-backend   42%/50     1         5         5          4m
```
If you check `kubectl get pods`, you will see new replicas running:
```bash
kubectl get pods | grep backend
```
*Expected Output:*
```text
edugov-backend-56f4d7b7d-abcde     1/1     Running   0          5m
edugov-backend-56f4d7b7d-fg123     1/1     Running   0          90s
edugov-backend-56f4d7b7d-hj456     1/1     Running   0          90s
edugov-backend-56f4d7b7d-kl789     1/1     Running   0          30s
edugov-backend-56f4d7b7d-mn012     1/1     Running   0          30s
```

### 3. Screenshots to Capture
- HPA watch terminal showing replicas scaling up from 1 to 5 as CPU load reaches target thresholds.

### 4. Viva Q&A
- **Q**: What are the prerequisites for the Horizontal Pod Autoscaler (HPA) to work?
  - **A**: The HPA has two main prerequisites:
    1. A **Metrics Server** must be running in the cluster to capture CPU/memory utilization.
    2. The target Deployment must have resource **requests** defined (`spec.containers[].resources.requests`). HPA uses the requests values to calculate the usage percentage.
