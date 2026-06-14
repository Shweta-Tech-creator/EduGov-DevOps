resource "aws_instance" "edugov_server" {
  ami           = "ami-0f5ee92e2d63afc18"  # Ubuntu 22.04 LTS ap-south-1
  instance_type = var.instance_type

  subnet_id = aws_subnet.public_subnet_1.id

  vpc_security_group_ids = [
    aws_security_group.edugov_sg.id
  ]

  associate_public_ip_address = true

  key_name = var.key_name

  # Bootstrap script - runs once on first boot
  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Update system
    apt-get update -y
    apt-get upgrade -y

    # Install essential tools
    apt-get install -y curl wget git unzip jq

    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker ubuntu
    systemctl enable docker
    systemctl start docker

    # Increase vm.max_map_count for Elasticsearch
    sysctl -w vm.max_map_count=262144
    echo "vm.max_map_count=262144" >> /etc/sysctl.conf

    echo "Bootstrap complete!" >> /var/log/bootstrap.log
  EOF

  root_block_device {
    volume_type = "gp3"
    volume_size = 30  # 30GB root volume for storing images, logs, and data
  }

  tags = {
    Name    = "EduGov-Server"
    Project = "EduGov-DevOps"
    Phase   = "Phase-7-to-14"
  }
}
