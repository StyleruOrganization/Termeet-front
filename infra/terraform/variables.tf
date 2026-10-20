variable "cloud_id" {
  description = "Yandex Cloud ID. Credentials are supplied through YC_TOKEN or YC_SERVICE_ACCOUNT_KEY_FILE."
  type        = string
  default     = null
}

variable "folder_id" {
  description = "Folder for the new VM and network."
  type        = string
}

variable "registry_id" {
  description = "Existing Container Registry ID from the CONTAINER_REGISTRY GitHub secret."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9]+$", var.registry_id))
    error_message = "Supply the registry ID without cr.yandex/ or an image name."
  }
}

variable "zone" {
  description = "Availability zone for the VM, subnet and static address."
  type        = string
  default     = "ru-central1-d"
}

variable "ssh_user" {
  description = "SSH account used by GitHub Actions."
  type        = string
  default     = "deploy"

  validation {
    condition     = can(regex("^[a-z_][a-z0-9_-]{0,31}$", var.ssh_user)) && !contains(["root", "ubuntu"], var.ssh_user)
    error_message = "Use a dedicated Linux account such as deploy."
  }
}

variable "ssh_public_key_path" {
  description = "Public key matching SSH_PRIVATE_KEY in GitHub Actions. Never supply a private key."
  type        = string
  default     = "~/.ssh/id_ed25519_termeet.pub"
}

variable "ssh_cidrs" {
  description = "Allowed SSH source networks. Hosted GitHub runners need public SSH access or a runner with fixed egress."
  type        = list(string)
  default     = ["0.0.0.0/0"]

  validation {
    condition     = length(var.ssh_cidrs) > 0 && alltrue([for cidr in var.ssh_cidrs : can(cidrnetmask(cidr))])
    error_message = "Provide at least one IPv4 CIDR for SSH access."
  }
}

variable "acme_email" {
  description = "Contact email for certificate issuance and renewal."
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", var.acme_email))
    error_message = "Provide an email address for the ACME account."
  }
}

variable "cores" {
  description = "VM CPU cores."
  type        = number
  default     = 2
}

variable "memory_gb" {
  description = "VM RAM in GB; includes frontend, backend and supporting containers."
  type        = number
  default     = 4
}

variable "disk_size_gb" {
  description = "Persistent boot disk capacity in GB."
  type        = number
  default     = 40
}
