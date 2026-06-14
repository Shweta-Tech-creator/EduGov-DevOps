variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-south-1"
}

variable "key_name" {
  description = "Name of the EC2 SSH Key Pair to use for the instance"
  type        = string
  default     = "edugov-key.pem"
}

variable "instance_type" {
  description = "EC2 instance type. Use t3.small (2GB RAM) for running the optimized DevOps stack."
  type        = string
  default     = "t3.small"
}
