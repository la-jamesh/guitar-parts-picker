import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "Default", {
      vpcId: process.env.VPC_ID,
    });

    const securityGroup = new ec2.SecurityGroup(this, "MySecurityGroup", {
      vpc,
      allowAllOutbound: true, // Allow outbound traffic to the internet
    });

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allow HTTP access from anywhere"
    );

    const instance = new ec2.Instance(this, "MyInstance", {
      vpc,
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      securityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      associatePublicIpAddress: true,
      keyName: "jamesmbp",
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: ec2.BlockDeviceVolume.ebs(10, {
            encrypted: true,
            deleteOnTermination: true,
          }),
        },
      ],
    });

    instance.connections.allowFromAnyIpv4(
      ec2.Port.tcp(80),
      "Allow inbound HTTP traffic"
    );
  }
}
