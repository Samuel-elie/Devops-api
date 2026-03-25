output "managed_namespaces" {
  value = [for ns in kubernetes_namespace.managed : ns.metadata[0].name]
}