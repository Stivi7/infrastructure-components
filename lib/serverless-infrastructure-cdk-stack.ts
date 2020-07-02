import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

import { ArtifactsBucket } from './artifacts-bucket';
import { MyVpc } from './vpc';
import { BastionHostServices } from './bastion-host';
import { ClientAppInfrastructure } from './clientapp-bucket';
import { RdsInfrastructure } from './rds';
import { Envs } from '../types/envs';
import { cfnTagToCloudFormation } from '@aws-cdk/core';
import { UserPoolService } from './cogntio-user-pool';
import { ParameterStore } from './parameter-store';

interface StackProps {
  projectName: string,
  clientName: string,
  region: string,
  env: Envs,
}

export class ServerlessInfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id);
    const artifactBucket = new ArtifactsBucket(this, `ArtifactsBucket-${props.env}`, {
      artifactBucketName: `${props.projectName}-artifacts-bucket-${props.clientName}-${props.env}`,
      tags: [
        {
          key: 'cost-center',
          value: props.clientName,
        },
        {
          key: 'project',
          value: props.projectName,
        }
      ]
    });

    const userPool = new UserPoolService(this, 'UserPoolServices', {
      ...props,
      productName: 'Serverless users',
    });

    const ps = new ParameterStore(this, 'ParameterStoreVars', {
      parameterName: 'stack-variables',
      value: props,
    });

    new cdk.CfnOutput(this, 'StackVariables', {
      value: ps.parameter.stringValue,
      exportName: 'StackVariables',
    });

    new cdk.CfnOutput(this, 'ServiceArtifactBucketName', {
      exportName: 'ServiceArtifactBucketName',
      value: artifactBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      exportName: 'UserPoolId',
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, 'UserPoolName', {
      exportName: 'UserPoolName',
      value: userPool.userPoolName,
    });

    new cdk.CfnOutput(this, 'Region', {
      exportName: 'Region',
      value: props.region,
    });

    // const myVpc = new MyVpc(this, `MyVpc-${props.env}`, {
    //   vpcCidr: '10.0.0.0/16',
    //   maxAzs: 2,
    //   tags: [
    //     {
    //       key: 'cost-center',
    //       value: props.clientName,
    //     },
    //     {
    //       key: 'project',
    //       value: props.projectName,
    //     }
    //   ]
    // });

    // new BastionHostServices(this, 'BastionServices', {
    //   ...props,
    //   vpc: myVpc.vpc,
    //   instanceName: 'test',
    //   subnets: [myVpc.vpc.publicSubnets[0]],
    //   keyName: 'serverless-bastion-host',
    // });


    // const caInfrastructure = new ClientAppInfrastructure(this, 'ClientAppInfrastructure', {
    //   clientAppBucketName: `${props.projectName}-client-app-bucket-${props.clientName}-${props.env}`,
    // });

    // const rdsIngressSg = new ec2.SecurityGroup(this, 'RdsIngressSg', {
    //   vpc: myVpc.vpc,
    //   securityGroupName: `${props.projectName}-rds-ingress`,
    // });

    // rdsIngressSg.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.tcp(5432),
    // );

    // rdsIngressSg.addIngressRule(
    //   ec2.Peer.ipv4('10.0.0.0/16'),
    //   ec2.Port.tcp(5432),
    // );

    // const database = new RdsInfrastructure(this, 'Rds', {
    //   ...props,
    //   dbMasterUserName: 'mydbMasterUser',
    //   vpc: myVpc.vpc,
    //   databaseName: 'mydb',
    //   ingressSgs: [rdsIngressSg],
    //   publicAccessible: true,
    // });

    // new cdk.CfnOutput(this, 'VpcId', {
    //   exportName: 'VpcId',
    //   value: myVpc.vpc.vpcId,
    // });

    // new cdk.CfnOutput(this, 'RdsSubnetIds', {
    //   exportName: 'RdsSubnetIds',
    //   value: myVpc.vpc.publicSubnets.map(sub => sub.subnetId).join(','),
    // });

    // new cdk.CfnOutput(this, 'RdsEndpoint', {
    //   exportName: 'RdsEndpoint',
    //   value: database.instance.dbInstanceEndpointAddress,
    // });

    // new cdk.CfnOutput(this, 'RdsEndpointPort', {
    //   exportName: 'RdsEndpointPort',
    //   value: database.instance.dbInstanceEndpointPort,
    // });

    // new cdk.CfnOutput(this, 'RdsIngressSgId', {
    //   exportName: 'RdsIngressNameId',
    //   value: rdsIngressSg.securityGroupId,
    // })
  }
}