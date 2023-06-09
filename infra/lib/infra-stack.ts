import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // new virtual private cloud for our instance
    const vpc = new ec2.Vpc(this, "GuitarPartsPickerVpc", {
      natGateways: 0,
      subnetConfiguration: [
        {
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // new security group for our instance
    const securityGroup = new ec2.SecurityGroup(
      this,
      "GuitarPartsPickerRailsAppSecurityGroup",
      {
        vpc,
        allowAllOutbound: true, // Allow outbound traffic to the internet
      }
    );

    // add a rule allowing http traffic
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allow HTTP access from anywhere"
    );

    // WARNING DO NOT DO THIS IN PRODUCTION ON A REAL APP
    // THIS IS A SECURITY RISK AND IS FOR SANDBOX USE ONLY
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allow SSH access from anywhere"
    );

    // create our instance for our rails app
    const instance = new ec2.Instance(this, "GuitarPartsPickerRailsApp", {
      vpc,
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      securityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      associatePublicIpAddress: true,
    });
  }
}
