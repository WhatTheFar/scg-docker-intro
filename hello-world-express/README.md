# hello-world-express

## Integration

```sh
npm run test
```

## Delivery

```sh
AWS_ACCOUNT_ID=975086324241
REGION=ap-southeast-1

IMAGE_TAG=$(git rev-list -n 1 master)
IMAGE_REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
IMAGE_NAME=$IMAGE_REGISTRY/hello-world-express:$IMAGE_TAG

# https://docs.aws.amazon.com/AmazonECR/latest/userguide/Registries.html
aws ecr get-login-password --region $REGION \
    | docker login --username AWS --password-stdin $IMAGE_REGISTRY

docker build -t hello-world-express .
docker tag hello-world-express $IMAGE_NAME
docker push $IMAGE_NAME
```

## Deployment

### Manual

```sh
# find a service
aws ecs list-clusters
aws ecs list-services --cluster <cluster>

# describe a task definition
aws ecs list-task-definitions | jq '.taskDefinitionArns[]' | fzf
aws ecs describe-task-definition --task-definition <task-definition-arn> > task-definition.json

# edit a task definition to use new containers
nvim task-definition.json

# register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# update a service to use new task definition
aws ecs list-task-definitions | jq '.taskDefinitionArns[]' | fzf
aws ecs update-service --cluster <cluster> --service <service> \
    --task-definition <task-definition-arn>
```

### Semi-automatic

```sh
# find a service
export CLUSTER=`aws ecs list-clusters | jq -r '.clusterArns[]' | fzf`
export SERVICE=`aws ecs list-services --cluster $CLUSTER \
    | jq -r '.serviceArns[]' | fzf`

# describe a task definition
export TASK_DEFINITION=`aws ecs list-task-definitions | jq -r '.taskDefinitionArns[]' | fzf`
aws ecs describe-task-definition --task-definition $TASK_DEFINITION \
    | jq -r '.taskDefinition' \
    > task-definition.json

# edit a task definition to use new containers
CONTAINER_NAME=gitops-ecs-dev-app1
cat task-definition.json \
    | jq "(.containerDefinitions[] | select(.name == \"$CONTAINER_NAME\") | .image) |= \"$IMAGE_NAME\"" \
    | jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities)' \
    > task-definition-new.json

# register task definition
export TASK_DEFINITION_NEW=`
    aws ecs register-task-definition --cli-input-json file://task-definition-new.json \
        | jq -r '.taskDefinition.taskDefinitionArn'
`

# update a service to use new task definition
aws ecs update-service --cluster $CLUSTER --service $SERVICE \
    --task-definition $TASK_DEFINITION_NEW
```
