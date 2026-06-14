output "ec2_public_ip" {
  description = "Public IP address of the EduGov EC2 server"
  value       = aws_instance.edugov_server.public_ip
}

output "frontend_url" {
  description = "React frontend URL"
  value       = "http://${aws_instance.edugov_server.public_ip}:3000"
}

output "backend_url" {
  description = "Node.js API URL"
  value       = "http://${aws_instance.edugov_server.public_ip}:5001"
}

output "jenkins_url" {
  description = "Jenkins CI/CD dashboard URL"
  value       = "http://${aws_instance.edugov_server.public_ip}:8080"
}

output "grafana_url" {
  description = "Grafana monitoring dashboard URL"
  value       = "http://${aws_instance.edugov_server.public_ip}:32000"
}

output "kibana_url" {
  description = "Kibana log analysis dashboard URL"
  value       = "http://${aws_instance.edugov_server.public_ip}:31000"
}

output "vault_url" {
  description = "HashiCorp Vault secrets UI URL"
  value       = "http://${aws_instance.edugov_server.public_ip}:8200"
}
