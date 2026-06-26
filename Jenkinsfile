pipeline {
    agent any

    environment {
        registry = "pankajkawale21/nodejs-app"
        registryCredential = "docker-hub"

        AWS_REGION = "ap-south-1"
        EKS_CLUSTER = "your-eks-cluster-name"

        dockerImage = ""
    }

    stages {

        stage('Cloning our Git') {
            steps {
                git url: 'https://github.com/kawalepankaj/nodejs-app.git',
                    branch: 'main',
                    credentialsId: 'git_cred'
            }
        }

        stage('Building our image') {
            steps {
                script {
                    dockerImage = docker.build("${registry}:${BUILD_NUMBER}")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', registryCredential) {
                        dockerImage.push()
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
                        aws --version

                        aws sts get-caller-identity

                        aws eks update-kubeconfig \
                          --region ${AWS_REGION} \
                          --name ${EKS_CLUSTER}

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
                        -n nodejs-app --timeout=180s

                    kubectl get pods -n nodejs-app
                    kubectl get svc -n nodejs-app
                """
            }
        }
    }

    post {

        success {
            emailext(
                subject: "SUCCESS : ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                mimeType: 'text/html',
                body: """
                <h2 style='color:green'>Deployment Successful</h2>

                <b>Job :</b> ${env.JOB_NAME}<br>
                <b>Build :</b> ${env.BUILD_NUMBER}<br>
                <b>Docker Image :</b> ${registry}:${BUILD_NUMBER}<br>
                <b>Build URL :</b>
                <a href="${env.BUILD_URL}">
                ${env.BUILD_URL}
                </a>
                """,
                to: "pankajkawale2107@gmail.com"
            )
        }

        failure {
            emailext(
                subject: "FAILED : ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                mimeType: 'text/html',
                body: """
                <h2 style='color:red'>Deployment Failed</h2>

                <b>Job :</b> ${env.JOB_NAME}<br>
                <b>Build :</b> ${env.BUILD_NUMBER}<br>

                <a href="${env.BUILD_URL}">
                Console Output
                </a>
                """,
                to: "pankajkawale2107@gmail.com"
            )
        }

        always {

            sh '''
            docker image prune -af || true
            '''

            cleanWs()
        }
    }
}
