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

                    kubectl apply -f namespace.yaml

                    kubectl apply -f deployment.yaml

                    kubectl apply -f service.yaml

                    kubectl rollout status deployment/nodejs-deployment \
                        -n nodejs-app --timeout=300s

                    kubectl get pods -n nodejs-app

                    kubectl get svc -n nodejs-app
                """

                script {
                    env.DEPLOYED = "true"
                }
            }
        }
    }

    post {

        success {
            sh '''
             echo success
             '''

    //        emailext(
    //            subject: "SUCCESS : ${JOB_NAME} #${BUILD_NUMBER}",
    //            mimeType: "text/html",
    //            body: """
    //            <h2 style='color:green'>Deployment Successful</h2>
    //
    //            <b>Job:</b> ${JOB_NAME}<br>
    //
    //            <b>Build:</b> ${BUILD_NUMBER}<br>
    //
    //            <b>Docker Image:</b> ${REGISTRY}:${BUILD_NUMBER}<br>
    //
    //            <b>Console:</b>
    //
    //            <a href="${BUILD_URL}">
    //            ${BUILD_URL}
    //            </a>
    //            """,
    //            to: "pankajkawale2107@gmail.com"
    //        )
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

//            emailext(
//                subject: "FAILED : ${JOB_NAME} #${BUILD_NUMBER}",
//                mimeType: "text/html",
//                body: """
//                <h2 style='color:red'>Deployment Failed</h2>
//
//                <b>Job:</b> ${JOB_NAME}<br>
//
//                <b>Build:</b> ${BUILD_NUMBER}<br>
//
//                <a href="${BUILD_URL}">
//                View Console Output
//                </a>
//                """,
//                to: "pankajkawale2107@gmail.com"
//            )
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
