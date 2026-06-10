# Remote Terraform state in GCS so CI applies are repeatable and track
# existing resources. The bucket is created once by scripts/setup-cicd.sh.
# Backend config cannot use variables, so the bucket name is literal.
terraform {
  backend "gcs" {
    bucket = "genaiguruyoutube-retailforge-tfstate"
    prefix = "cloud-run"
  }
}
