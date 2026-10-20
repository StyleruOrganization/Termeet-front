variable "name" {
  type = string
}

variable "folder_id" {
  type = string
}

variable "zone" {
  type = string
}

variable "cores" {
  type = number
}

variable "memory_gb" {
  type = number
}

variable "disk_size_gb" {
  type = number
}

variable "ssh_user" {
  type = string
}

variable "ssh_public_key" {
  type = string

  validation {
    condition     = can(regex("^(ssh-ed25519|ssh-rsa|ecdsa-sha2-nistp[0-9]+) [A-Za-z0-9+/=]+( [^\\r\\n]*)?$", var.ssh_public_key))
    error_message = "Supply a single OpenSSH public key."
  }
}

variable "ssh_cidrs" {
  type = list(string)
}

variable "acme_email" {
  type = string
}

variable "proxy_compose" {
  type = string
}

variable "proxy_config" {
  type = string
}
