#!/bin/bash
# ============================================================
# Phase 13: HashiCorp Vault Setup — EduGov DevOps Project
# Run this script on your EC2 instance:
#   chmod +x deploy_vault.sh && ./deploy_vault.sh
# ============================================================

set -e  # Exit immediately on any error

# --- Colors for output ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[✔] $1${NC}"; }
info() { echo -e "${BLUE}[➜] $1${NC}"; }
warn() { echo -e "${YELLOW}[⚠] $1${NC}"; }
err()  { echo -e "${RED}[✖] $1${NC}"; exit 1; }

# --- STEP 0: Setup ---
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
REPO_DIR="/home/ubuntu/EduGov-DevOps"

info "Pulling latest code from GitHub..."
cd "$REPO_DIR"
git pull origin main || warn "Git pull failed — continuing with existing files"

# ============================================================
# STEP 1: Install Vault
# ============================================================
info "STEP 1: Installing HashiCorp Vault..."

if vault version &>/dev/null; then
    log "Vault already installed: $(vault version)"
else
    wget -O- https://apt.releases.hashicorp.com/gpg | \
        sudo gpg --yes --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
        sudo tee /etc/apt/sources.list.d/hashicorp.list

    sudo apt-get update -q
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y vault
    log "Vault installed: $(vault version)"
fi

# ============================================================
# STEP 2: Start Vault Dev Server
# ============================================================
info "STEP 2: Starting Vault in dev mode..."

# Kill any existing vault process
pkill vault 2>/dev/null || true
sleep 2
rm -f /tmp/vault.log

nohup vault server -dev -dev-listen-address="0.0.0.0:8200" > /tmp/vault.log 2>&1 &
VAULT_PID=$!
log "Vault server started (PID: $VAULT_PID)"

info "Waiting for Vault to initialize (10 seconds)..."
sleep 10

# Verify vault started
if ! grep -q "Root Token" /tmp/vault.log; then
    cat /tmp/vault.log
    err "Vault failed to start. Check /tmp/vault.log"
fi

log "Vault started successfully!"
grep -E "Root Token|Unseal Key" /tmp/vault.log

# ============================================================
# STEP 3: Configure Vault Environment
# ============================================================
info "STEP 3: Configuring Vault environment..."

export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN=$(grep "Root Token" /tmp/vault.log | awk '{print $NF}')

# Persist to bashrc
grep -q "VAULT_ADDR" ~/.bashrc || echo "export VAULT_ADDR='http://127.0.0.1:8200'" >> ~/.bashrc
grep -q "VAULT_TOKEN" ~/.bashrc && \
    sed -i "s|export VAULT_TOKEN=.*|export VAULT_TOKEN=$VAULT_TOKEN|" ~/.bashrc || \
    echo "export VAULT_TOKEN=$VAULT_TOKEN" >> ~/.bashrc

log "VAULT_TOKEN = $VAULT_TOKEN"

# Verify Vault is unsealed
vault status | grep -E "Sealed|Dev Mode"
log "Vault is running and unsealed!"

# ============================================================
# STEP 4: Store EduGov Secrets
# ============================================================
info "STEP 4: Storing EduGov secrets in Vault..."

vault kv put secret/edugov \
    MONGO_URI="mongodb://mongodb:27017/edugov_db" \
    JWT_SECRET="edugov_super_secret_jwt_key_2026"

echo ""
info "Verifying stored secrets:"
vault kv get secret/edugov
log "Secrets stored successfully!"

# ============================================================
# STEP 5: Enable Kubernetes Auth & Apply Policy
# ============================================================
info "STEP 5: Configuring Kubernetes authentication in Vault..."

vault auth enable kubernetes 2>/dev/null || warn "Kubernetes auth already enabled"

vault policy write edugov-read "$REPO_DIR/security/vault-policy.hcl"
log "Policy 'edugov-read' applied"

vault write auth/kubernetes/config \
    kubernetes_host="https://127.0.0.1:6443" \
    disable_local_ca_jwt="true"
log "Kubernetes auth backend configured"

vault write auth/kubernetes/role/edugov-read-role \
    bound_service_account_names=edugov-vault-sa \
    bound_service_account_namespaces=default \
    policies=edugov-read \
    ttl=24h
log "Vault role 'edugov-read-role' created"

# ============================================================
# STEP 6: Deploy Kubernetes ServiceAccount & Demo Pod
# ============================================================
info "STEP 6: Creating Kubernetes ServiceAccount and deploying demo pod..."

kubectl create serviceaccount edugov-vault-sa 2>/dev/null || warn "ServiceAccount already exists"
log "ServiceAccount 'edugov-vault-sa' ready"

kubectl apply -f "$REPO_DIR/security/secret-pod-demo.yaml"
log "Secret demo pod deployed"

# ============================================================
# STEP 7: Wait & Verify Secret Injection
# ============================================================
info "STEP 7: Waiting for demo pod to become ready (up to 2 minutes)..."

# Wait for pod to be running
for i in $(seq 1 24); do
    STATUS=$(kubectl get pods -l app=edugov-backend --no-headers 2>/dev/null | grep "edugov-backend-vault" | awk '{print $3}' | head -1)
    echo "  Attempt $i/24 — Pod status: ${STATUS:-Pending}"
    if [ "$STATUS" = "Running" ]; then
        log "Pod is Running!"
        break
    fi
    sleep 5
done

echo ""
info "Current pod status:"
kubectl get pods | grep -E "NAME|edugov-backend-vault|vault"

echo ""
info "Verifying secret injection into pod..."
kubectl exec deployment/edugov-backend-vault -c edugov-backend -- cat /vault/secrets/db-creds 2>/dev/null && \
    log "✅ SECRET INJECTION VERIFIED!" || \
    warn "Pod may still be initializing. Run manually: kubectl exec deployment/edugov-backend-vault -c edugov-backend -- cat /vault/secrets/db-creds"

# ============================================================
# SUMMARY
# ============================================================
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  ✅ Phase 13: HashiCorp Vault — COMPLETE                  ${NC}"
echo -e "${GREEN}============================================================${NC}"
echo -e "  Vault UI:     http://65.2.182.134:8200"
echo -e "  Vault Token:  $VAULT_TOKEN"
echo -e "  Secret path:  secret/edugov"
echo -e "  K8s Role:     edugov-read-role"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "${BLUE}📸 Screenshot commands:${NC}"
echo "  1. vault kv get secret/edugov"
echo "  2. kubectl exec deployment/edugov-backend-vault -c edugov-backend -- cat /vault/secrets/db-creds"
