pipeline {
    agent any 

    environment {
        registry = "pankajkawale21/nodejs-app"
        registryCredential = 'docker-hub'
        dockerImage = ''
    }

    stages {
        stage('Cloning our Git') {
            steps {
                // NOTE: If this is a Multibranch Pipeline, replace the line below with:
                // checkout scm
                git url: 'https://github.com/kawalepankaj/nodejs-app.git', branch: 'main', credentialsId: 'git_cred'
            }
        }

        stage('Building our image') {
            steps {
                script {
                    dockerImage = docker.build "${registry}:${BUILD_NUMBER}"
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

        stage('Deploy to Kubernetes') {
           steps {
                // 1. Replace 'IMAGE_TAG' in deployment.yaml with the actual Jenkins Build Number
                sh "sed -i 's|IMAGE_TAG|${BUILD_NUMBER}|g' deployment.yaml"
                
                // 2. Create the namespace (if it doesn't exist)
                sh 'kubectl apply -f namespace.yaml'
                
                // 3. Deploy the app and service into the 'nodejs-app' namespace
                sh 'kubectl apply -f deployment.yaml -f service.yaml -n nodejs-app'
            }
        }
    }

    // ==========================================
    // POST ACTIONS & EMAIL NOTIFICATIONS
    // ==========================================
    post {
        success {
            emailext (
                subject: "✅ SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """
                    <h2 style="color:green;">Build Succeeded!</h2>
                    <p><b>Job:</b> ${env.JOB_NAME}</p>
                    <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
                    <p><b>Build URL:</b> <a href="${env.BUILD_URL}">Click here to view console output</a></p>
                    <p><b>Docker Image:</b> ${registry}:${BUILD_NUMBER}</p>
                """,
                mimeType: 'text/html',
                to: "pankajkawale2107@gmail.com"
            )
        }
        failure {
            emailext (
                subject: "❌ FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """
                    <h2 style="color:red;">Build Failed!</h2>
                    <p><b>Job:</b> ${env.JOB_NAME}</p>
                    <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
                    <p><b>Build URL:</b> <a href="${env.BUILD_URL}">Click here to view console output</a></p>
                """,
                mimeType: 'text/html',
                to: "pankajkawale2107@gmail.com"
            )
        }
        always {
            // Ensures workspace is cleaned up even if the build fails
            cleanWs()
        }
    }
}
