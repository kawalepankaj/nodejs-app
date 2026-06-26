# Node.js Application CI/CD Pipeline with Jenkins, Docker & Amazon EKS

A production-ready DevOps project that demonstrates automated CI/CD deployment of a Node.js application using **Jenkins**, **Docker**, **Amazon EKS**, and **Kubernetes**.

---

## Project Overview

This project automates the complete software delivery lifecycle:

- Build Node.js application
- Create Docker image
- Push image to Docker Hub
- Deploy application to Amazon EKS
- Expose application using Kubernetes LoadBalancer Service
- Perform rolling updates with rollback support

---

## Architecture

```
GitHub
   │
   ▼
Jenkins Pipeline
   │
   ├── Checkout Source
   ├── Build Docker Image
   ├── Push Image to Docker Hub
   ├── Configure AWS CLI
   ├── Connect to Amazon EKS
   └── Deploy Kubernetes Resources
                     │
                     ▼
              Amazon EKS Cluster
                     │
        Deployment → Service (LoadBalancer)
                     │
                     ▼
              Node.js Application
```

---

## Technologies Used

- Node.js
- Express.js
- Docker
- Jenkins
- Kubernetes
- Amazon EKS
- AWS CLI
- Docker Hub

---

## Project Structure

```
.
├── Dockerfile
├── Jenkinsfile
├── Node.js
├── package.json
├── deployment.yaml
├── service.yaml
├── namespace.yaml
└── README.md
```

---

## Application

The application exposes:

| Endpoint | Description |
|----------|-------------|
| `/` | Returns "Hello World" |
| `/health` | Health Check Endpoint |

---

## Docker

Build Image

```bash
docker build -t nodejs-app .
```

Run Container

```bash
docker run -d -p 3000:3000 nodejs-app
```

Test

```bash
curl http://localhost:3000
```

Health Check

```bash
curl http://localhost:3000/health
```

---

## Kubernetes Deployment

Create Namespace

```bash
kubectl apply -f namespace.yaml
```

Deploy Application

```bash
kubectl apply -f deployment.yaml
```

Create Service

```bash
kubectl apply -f service.yaml
```

Check Resources

```bash
kubectl get pods -n nodejs-app

kubectl get svc -n nodejs-app

kubectl get deployment -n nodejs-app
```

---

## Jenkins Pipeline Stages

The Jenkins pipeline performs the following stages:

1. Checkout Source Code
2. Build Docker Image
3. Push Image to Docker Hub
4. Configure AWS CLI
5. Connect to Amazon EKS
6. Deploy Kubernetes Manifests
7. Verify Deployment
8. Rollback on Failure

---

## Docker Image

The pipeline pushes Docker images in two tags:

```
<BUILD_NUMBER>

latest
```

Example

```
pankajkawale21/nodejs-app:15

pankajkawale21/nodejs-app:latest
```

---

## Kubernetes Resources

- Namespace
- Deployment (2 Replicas)
- LoadBalancer Service

Deployment uses Rolling Update strategy for zero downtime deployments.

---

## Prerequisites

- AWS Account
- Amazon EKS Cluster
- kubectl
- Docker
- Jenkins
- AWS CLI
- Docker Hub Account

---

## Jenkins Credentials Required

| Credential | Purpose |
|------------|----------|
| git_cred | GitHub Repository Access |
| Docker_Cred | Docker Hub Login |
| aws-prod-creds | AWS IAM Credentials |

---

## Verify Deployment

Pods

```bash
kubectl get pods -n nodejs-app
```

Services

```bash
kubectl get svc -n nodejs-app
```

Deployment

```bash
kubectl rollout status deployment/nodejs-deployment -n nodejs-app
```

---

## Features

- CI/CD Automation
- Docker Image Versioning
- Kubernetes Deployment
- Amazon EKS Integration
- Health Checks
- Rolling Updates
- Automatic Rollback
- LoadBalancer Service
- Production-ready Jenkins Pipeline

---

## Future Improvements

- Helm Charts
- ArgoCD GitOps Deployment
- Prometheus Monitoring
- Grafana Dashboards
- SonarQube Integration
- Trivy Image Scanning
- Terraform Infrastructure Provisioning
- Horizontal Pod Autoscaler (HPA)
- Ingress Controller with TLS

---

## Author

**Pankaj**

Senior DevOps Engineer

### Skills

- Kubernetes
- Docker
- Jenkins
- AWS
- Linux
- Terraform
- Ansible
- CI/CD
- DevSecOps

---

## License

This project is available under the MIT License.
