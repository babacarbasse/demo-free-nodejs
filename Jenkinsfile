pipeline {
    agent {
        kubernetes {
            yamlFile 'KubernetesPodRunner.yaml'
        }
    }
    environment {
        DOCKER_USERNAME = credentials('DOCKER_USERNAME')
        DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')

        GIT_COMMIT_SHORT = sh(
            script: "printf \$(git rev-parse --short ${GIT_COMMIT})",
            returnStdout: true
        )
        CD_MANIFEST_FILE_STAGING = "demofree/api/Chart.yaml"
        CD_MANIFEST_VALUES_FILE_STAGING = "demofree/api/values.yaml"

        GIT_DEVOPS_BAAMTU = credentials('GIT_DEVOPS_BAAMTU')
        GIT_DEVOPS_PWD = credentials('GIT_DEVOPS_BAAMTU_PASSWORD')
        GIT_DEVOPS_USER = credentials('GIT_DEVOPS_BAAMTU_USER')
        GIT_CHARTS_URL = credentials('GIT_CHARTS_URL')

        IMAGE_NAME = "200817/nodejs-demo-log"
    }

    stages {
        stage('Configuration and Set aws access keys') {
            steps {
                echo "========Configuring aws and set cluster access========"
                sh 'docker login --username $DOCKER_USERNAME --password $DOCKER_PASSWORD'
            }
            post{
                success{
                    echo "====++++Configuration and Set aws access keys successfully++++===="
                }
                failure{
                    echo "====++++Configuration and Set aws access keys failed++++===="
                }

            }
        }
        stage('Build demoFree image') {
            steps{
                echo "========building $IMAGE_NAME image========"
                sh 'docker build -t $IMAGE_NAME .'
            }
            post{
                success{
                    echo "====++++Build $IMAGE_NAME image successfully++++===="
                }
                failure{
                    echo "====++++Build $IMAGE_NAME image failed++++===="
                }

            }
        }
        stage('Push image demoFree [Staging]') {
            when {
                 branch 'dev'
            }
            steps {
                echo "======== Pushing $IMAGE_NAME image [Staging] ========"
                echo "tag image to $GIT_COMMIT_SHORT"
                sh '''
                    docker tag $IMAGE_NAME:latest $IMAGE_NAME:$GIT_COMMIT_SHORT
                    docker push $IMAGE_NAME:$GIT_COMMIT_SHORT
                    docker tag $IMAGE_NAME:latest $IMAGE_NAME:dev
                    docker push $IMAGE_NAME:dev
                '''
            }
            post{
                success{
                    echo "====++++Push image $IMAGE_NAME [Staging] successfully++++===="
                }
                failure{
                    echo "====++++Push image $IMAGE_NAME [Staging] failed++++===="
                }

            }
        }
        stage('Push demoFree image [Prod]') {
            when {
                 branch 'master'
            }
            steps{
                echo "======== Pushing $IMAGE_NAME image [Prod] ========"
                sh '''
                    docker tag $IMAGE_NAME:latest $IMAGE_NAME:$GIT_COMMIT_SHORT
                    docker tag $IMAGE_NAME:latest $IMAGE_NAME:latest
                    docker tag $IMAGE_NAME:latest $IMAGE_NAME:prod
                    docker push $IMAGE_NAME:$GIT_COMMIT_SHORT
                    docker push $IMAGE_NAME:latest
                    docker push $IMAGE_NAME:prod
                '''
            }
            post{
                success{
                    echo "====++++Push $IMAGE_NAME image [Prod] successfully++++===="
                }
                failure{
                    echo "====++++Push $IMAGE_NAME image [Prod] failed++++===="
                }

            }
        }

        stage('set git internal-charts-manifests access') {
            steps {
                sh 'rm -rf ./*'
                git credentialsId: 'GIT_DEVOPS_BAAMTU', url: 'http://gitlab.baamtu.com/datamation/devops/internal-charts-manifests.git', branch: 'master'

                sh '''
                    git config --global user.email "babacar.niang@baamtu.com"
                    git config --global user.name "Babacar Niang"
                    git remote remove origin
                    git remote add origin https://$GIT_DEVOPS_USER:$GIT_DEVOPS_PWD@$gitlab.baamtu.com/datamation/devops/internal-charts-manifests.git
                    git pull origin master
                '''
            }
            post{
                success{
                    echo "====++++set git internal-charts-manifests access successfully++++===="
                }
                failure{
                    echo "====++++set git internal-charts-manifests access failed++++===="
                }
            }
        }

        stage('deployment staging') {
            when {
                branch 'master'
            }
            steps {
                sh '''
                    docker run --rm -v ${PWD}:/workdir mikefarah/yq:3.2.1 yq write --inplace --verbose $CD_MANIFEST_FILE_STAGING appVersion $GIT_COMMIT_SHORT
                    cat $CD_MANIFEST_FILE_STAGING
                    docker run --rm -v ${PWD}:/workdir mikefarah/yq:3.2.1 yq write --inplace --verbose $CD_MANIFEST_VALUES_FILE_STAGING image.tag $GIT_COMMIT_SHORT
                    cat $CD_MANIFEST_VALUES_FILE_STAGING
                '''
                sh '''
                    git commit -am "update staging image tag"
                    git push origin master
                '''
            }

            post{
                success{
                    echo "====++++Staging deployed successfully++++===="
                }
                failure{
                    echo "====++++Staging deployment failed++++===="
                }
            }
        }
    }
}