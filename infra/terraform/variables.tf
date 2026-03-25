variable "namespaces" {
  description = "Namespaces managed by Terraform"
  type        = list(string)
  default = [
    "devops-helm",
    "observability",
    "falco",
    "kyverno"
  ]
}