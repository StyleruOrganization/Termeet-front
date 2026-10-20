terraform {
  required_providers {
    yandex = {
      source = "yandex-cloud/yandex"
    }
  }
}

data "yandex_compute_image" "ubuntu" {
  family = "ubuntu-2404-lts"
}

resource "yandex_vpc_network" "this" {
  name      = "${var.name}-network"
  folder_id = var.folder_id
}

resource "yandex_vpc_subnet" "this" {
  name           = "${var.name}-subnet"
  folder_id      = var.folder_id
  zone           = var.zone
  network_id     = yandex_vpc_network.this.id
  v4_cidr_blocks = ["10.20.0.0/24"]
}

resource "yandex_vpc_security_group" "this" {
  name       = "${var.name}-web"
  folder_id  = var.folder_id
  network_id = yandex_vpc_network.this.id

  ingress {
    description    = "SSH deployment and administration"
    protocol       = "TCP"
    port           = 22
    v4_cidr_blocks = var.ssh_cidrs
  }

  ingress {
    description    = "HTTP and ACME HTTP-01 challenges"
    protocol       = "TCP"
    port           = 80
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description    = "HTTPS"
    protocol       = "TCP"
    port           = 443
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description    = "OS packages, registry, DNS and ACME"
    protocol       = "ANY"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "yandex_vpc_address" "this" {
  name      = "${var.name}-ip"
  folder_id = var.folder_id

  external_ipv4_address {
    zone_id = var.zone
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "yandex_compute_disk" "boot" {
  name      = "${var.name}-boot"
  folder_id = var.folder_id
  zone      = var.zone
  type      = "network-ssd"
  size      = var.disk_size_gb
  image_id  = data.yandex_compute_image.ubuntu.id

  lifecycle {
    prevent_destroy = true
    # A newer Ubuntu image must not replace an already provisioned disk.
    ignore_changes = [image_id]
  }
}

resource "yandex_compute_instance" "this" {
  name                      = var.name
  folder_id                 = var.folder_id
  zone                      = var.zone
  platform_id               = "standard-v3"
  allow_stopping_for_update = true

  resources {
    cores         = var.cores
    memory        = var.memory_gb
    core_fraction = 100
  }

  boot_disk {
    disk_id     = yandex_compute_disk.boot.id
    auto_delete = false
  }

  network_interface {
    subnet_id          = yandex_vpc_subnet.this.id
    nat                = true
    nat_ip_address     = yandex_vpc_address.this.external_ipv4_address[0].address
    security_group_ids = [yandex_vpc_security_group.this.id]
  }

  metadata = {
    enable-oslogin     = "false"
    serial-port-enable = "0"
    user-data = "#cloud-config\n${yamlencode({
      disable_root = true
      ssh_pwauth   = false
      users = [{
        name                = var.ssh_user
        groups              = ["sudo"]
        shell               = "/bin/bash"
        lock_passwd         = true
        sudo                = ["ALL=(ALL) NOPASSWD:ALL"]
        ssh_authorized_keys = [var.ssh_public_key]
      }]
      write_files = [
        {
          path        = "/opt/termeet/proxy/compose.yml"
          permissions = "0644"
          content     = var.proxy_compose
        },
        {
          path        = "/opt/termeet/proxy/proxy.conf"
          permissions = "0644"
          content     = var.proxy_config
        },
        {
          path        = "/opt/termeet/proxy/.env"
          permissions = "0600"
          content     = "DEFAULT_EMAIL=${var.acme_email}\n"
        },
        {
          path        = "/usr/local/sbin/termeet-bootstrap"
          permissions = "0750"
          content     = file("${path.module}/bootstrap.sh")
        },
        {
          path        = "/etc/systemd/system/termeet-proxy.service"
          permissions = "0644"
          content     = file("${path.module}/termeet-proxy.service")
        },
        {
          path        = "/etc/docker/daemon.json"
          permissions = "0644"
          content = jsonencode({
            log-driver = "local"
            log-opts   = { max-size = "10m", max-file = "3" }
          })
        }
      ]
      runcmd = [["bash", "/usr/local/sbin/termeet-bootstrap", var.ssh_user]]
    })}"
  }

  lifecycle {
    prevent_destroy = true
  }
}
