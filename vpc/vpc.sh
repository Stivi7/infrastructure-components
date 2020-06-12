#!/bin/bash

VPC_NAME='serverless-reference-infrastructure'
ENVIRONMENT='dev'
AWS_REGION='eu-central-1'

aws cloudformation deploy \
  --template-file ./stacks/vpc-stack.yml \
  --region $AWS_REGION \
  --stack-name $VPC_NAME-vpc-$ENVIRONMENT \
  --parameter-overrides Environment=$ENVIRONMENT \
                        VpcName=$VPC_NAME