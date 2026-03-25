resource "kubernetes_namespace" "managed" {
  for_each = toset(var.namespaces)

  metadata {
    name = each.value

    labels = {
      "managed-by" = "terraform"
    }
  }
}