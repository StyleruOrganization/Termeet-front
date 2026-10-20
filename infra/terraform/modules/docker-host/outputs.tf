output "public_ip" {
  value = yandex_vpc_address.this.external_ipv4_address[0].address
}

output "instance_id" {
  value = yandex_compute_instance.this.id
}

output "boot_disk_id" {
  value = yandex_compute_disk.boot.id
}
