# Read-only: this stack never creates, replaces or deletes the existing registry.
data "yandex_container_registry" "existing" {
  registry_id = var.registry_id
}

module "server" {
  source = "./modules/docker-host"

  name             = "termeet"
  folder_id        = var.folder_id
  zone             = var.zone
  cores            = var.cores
  memory_gb        = var.memory_gb
  disk_size_gb     = var.disk_size_gb
  ssh_user         = var.ssh_user
  ssh_public_key   = trimspace(file(pathexpand(var.ssh_public_key_path)))
  ssh_cidrs        = var.ssh_cidrs
  acme_email       = var.acme_email
  proxy_compose    = file("${path.module}/../nginx-proxy/compose.yml")
  proxy_config     = file("${path.module}/../nginx-proxy/proxy.conf")
}
