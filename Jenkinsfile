```groovy
def dockerImage

pipeline {
    agent any

    environment {
        REGISTRY = "pankajkawale21/nodejs-app"
        REGISTRY_CREDENTIAL = "Docker_Cred"

        AWS_REGION = "ap-south-1"
        EKS_CLUSTER = "nodejs-app"

        DEPLOYED = "false"
    }

    options {
        timestamps()
        ansiColor('xterm')
    }

    stages {

        stage('Checkout Source Code') {
            steps {
                git branch: 'main',
                    credentialsId: 'git_cred',
                    url: 'https://github.com/kawalepankaj/nodejs-app.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${REGISTRY}:${BUILD_NUMBER}")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', REGISTRY_CREDENTIAL) {
                        dockerImage.push("${BUILD_NUMBER}")
                        dockerImage.push("latest")
                    }
                }
            }
        }

        stage('Configure AWS CLI') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-prod-creds'
                ]]) {

                    sh '''
                        echo "===== AWS CLI Version ====="
                        aws --version

                        echo "===== AWS Identity ====="
                        aws sts get-caller-identity

                        echo "===== Updating kubeconfig ====="
                        aws eks update-kubeconfig \
                            --region ${AWS_REGION} \
                            --name ${EKS_CLUSTER}

                        echo "===== Cluster Info ====="
                        kubectl cluster-info

                        echo "===== Worker Nodes ====="
                        kubectl get nodes
                    '''
                }
            }
        }

        stage('Deploy to EKS') {
            steps {

                sh """
                    sed -i 's|IMAGE_TAG|${BUILD_NUMBER}|g' deployment.yaml

                    echo "===== Deploy Namespace ====="
                    kubectl apply -f namespace.yaml

                    echo "===== Deploy Application ====="
                    kubectl apply -f deployment.yaml

                    echo "===== Deploy Service ====="
                    kubectl apply -f service.yaml

                    echo "===== Deploy Monitoring ====="
                    kubectl apply -f monitoring/servicemonitor.yaml
                    kubectl apply -f monitoring/alert-rules.yaml

                    echo "===== Waiting for Rollout ====="
                    kubectl rollout status deployment/nodejs-deployment \
                        -n nodejs-app --timeout=300s

                    echo "===== Pods ====="
                    kubectl get pods -n nodejs-app

                    echo "===== Services ====="
                    kubectl get svc -n nodejs-app
                """

                script {
                    env.DEPLOYED = "true"
                }
            }
        }

        stage('Verify Metrics Endpoint') {
            steps {

                sh '''
                    echo "===== Waiting for Pods ====="
                    sleep 20

                    POD=$(kubectl get pods \
                        -n nodejs-app \
                        -l app=nodejs-app \
                        -o jsonpath="{.items[0].metadata.name}")

                    echo "Pod: $POD"

                    echo "===== Verify Health ====="
                    kubectl exec -n nodejs-app $POD -- \
                        wget -qO- http://localhost:3000/health

                    echo ""

                    echo "===== Verify Metrics ====="
                    kubectl exec -n nodejs-app $POD -- \
                        wget -qO- http://localhost:3000/metrics | head -20
                '''
            }
        }
    }

    post {

        success {

            echo "Application deployed successfully."
            echo "Prometheus metrics endpoint verified."

        }

        failure {

            script {

                if (env.DEPLOYED == "true") {

                    sh '''
                        echo "Deployment failed. Rolling back..."

                        kubectl rollout undo deployment/nodejs-deployment \
                            -n nodejs-app || true
                    '''
                }
            }
        }

        always {

            sh """
                docker rmi ${REGISTRY}:${BUILD_NUMBER} || true
                docker rmi ${REGISTRY}:latest || true
                docker image prune -f || true
            """

            cleanWs()
        }
    }
}
```
