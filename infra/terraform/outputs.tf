output "server_ip" {
  description = "Set SERVER_HOST in both frontend and backend GitHub repositories to this address."
  value       = module.server.public_ip
}

output "server_user" {
  description = "SERVER_USER GitHub Actions secret."
  value       = var.ssh_user
}

output "server_id" {
  value = module.server.instance_id
}

output "boot_disk_id" {
  value = module.server.boot_disk_id
}

output "registry" {
  description = "Existing registry, retained outside this stack's ownership."
  value = {
    id     = data.yandex_container_registry.existing.id
    name   = data.yandex_container_registry.existing.name
    prefix = "cr.yandex/${data.yandex_container_registry.existing.id}"
  }
}

output "ssh_command" {
  value = "ssh ${var.ssh_user}@${module.server.public_ip}"
}
