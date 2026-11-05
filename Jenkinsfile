pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  stages {
    stage("Install dependencies") {
      steps {
        script {
          if (isUnix()) {
            sh "npm ci"
            dir("client") {
              sh "npm ci"
            }
          } else {
            bat "npm ci"
            dir("client") {
              bat "npm ci"
            }
          }
        }
      }
    }

    stage("Backend checks") {
      steps {
        script {
          if (isUnix()) {
            sh "node --test utils/geminiClient.test.js"
            sh "node --check utils/geminiClient.js"
            sh "node --check utils/foodAI.js"
            sh "node --check routes/aiRoutes.js"
          } else {
            bat "node --test utils\\geminiClient.test.js"
            bat "node --check utils\\geminiClient.js"
            bat "node --check utils\\foodAI.js"
            bat "node --check routes\\aiRoutes.js"
          }
        }
      }
    }

    stage("Build frontend") {
      steps {
        dir("client") {
          script {
            if (isUnix()) {
              sh "npm run build"
            } else {
              bat "npm run build"
            }
          }
        }
      }
    }

    stage("Deploy to Render") {
      when {
        branch "main"
      }
      steps {
        withCredentials([string(credentialsId: "render-deploy-hook", variable: "RENDER_DEPLOY_HOOK")]) {
          script {
            if (isUnix()) {
              sh 'curl --fail --silent --show-error --request POST "$RENDER_DEPLOY_HOOK"'
            } else {
              bat 'curl.exe --fail --silent --show-error --request POST "%RENDER_DEPLOY_HOOK%"'
            }
          }
        }
      }
    }
  }
}
