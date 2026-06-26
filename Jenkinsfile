def dockerImage

pipeline {
    agent any

    environment {
        registry = "pankajkawale21/nodejs-app"
        registryCredential = "docker-hub"

        AWS_REGION = "ap-south-1"
        EKS_CLUSTER = "your-eks-cluster-name"

        DOCKER_BUILDKIT = "1"
    }

    stages {

        stage('Cloning our Git') {
            steps {
                git url: 'https://github.com/kawalepankaj/nodejs-app.git',
                    branch: 'main',
                    credentialsId: 'git_cred'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build(
                        "${registry}:${BUILD_NUMBER}",
                        "--pull ."
                    )
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', registryCredential) {
                        dockerImage.push("${BUILD_NUMBER}")
                        dockerImage.push("latest")
                    }
                }
            }
        }

        stage('Configure AWS & EKS') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-prod-creds'
                ]]) {

                    sh """
                    aws sts get-caller-identity
                    aws eks update-kubeconfig --region ${AWS_REGION} --name ${EKS_CLUSTER}

                    kubectl cluster-info
                    kubectl get nodes
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                sed -i 's|IMAGE_TAG|${BUILD_NUMBER}|g' deployment.yaml

                kubectl apply -f namespace.yaml
                kubectl apply -f deployment.yaml
                kubectl apply -f service.yaml

                kubectl rollout status deployment/nodejs-deployment \
                -n nodejs-app --timeout=300s

                kubectl get pods -n nodejs-app
                kubectl get svc -n nodejs-app
                """
            }
        }
    }

    post {

        failure {
            sh '''
            kubectl rollout undo deployment/nodejs-deployment \
            -n nodejs-app || true
            '''
        }

        always {
            sh """
            docker rmi ${registry}:${BUILD_NUMBER} || true
            docker image prune -f || true
            """
            cleanWs()
        }
    }
}
