import * as cdk from '@aws-cdk/core';
import * as rds from '@aws-cdk/aws-rds';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Envs } from '../../types/envs';

export interface RdsInfrastructureProps {
  projectName: string,
  env: Envs,
  clientName: string,
  dbMasterUserName: string,
  vpc: ec2.Vpc,
  databaseName: string,
  ingressSgs?: ec2.SecurityGroup[],
  dbPort?: number,
  dbSubnets?: ec2.ISubnet[],
  publicAccessible?: boolean,
}

export class RdsInfrastructure extends cdk.Construct {
  public readonly instance: rds.DatabaseInstance;

  constructor(scope: cdk.Construct, id: string, props: RdsInfrastructureProps) {
    super(scope, id);

    const vpcPlacement: any = {};

    if (props.publicAccessible) {
      vpcPlacement.subnetType = ec2.SubnetType.PUBLIC;
    } else if (props.dbSubnets) {
      vpcPlacement.subnets = props.dbSubnets;
    }

    this.instance = new rds.DatabaseInstance(this, 'RdsDbInstance', {
      engine: rds.DatabaseInstanceEngine.POSTGRES,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      masterUsername: props.dbMasterUserName,
      vpc: props.vpc,
      databaseName: props.databaseName,
      instanceIdentifier: `${props.projectName}-db-instance-${props.env}`,
      allocatedStorage: props.env === Envs.PROD ? 20 : 5,
      port: props.dbPort || 5432,
      backupRetention: cdk.Duration.days(1),
      vpcPlacement,
      deletionProtection: props.env === Envs.PROD ? true : false,
      securityGroups: props.ingressSgs,
    });
  }
}