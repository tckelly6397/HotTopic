import * as cdk from 'aws-cdk-lib';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';

interface Route53StackProps extends cdk.StackProps {
    readonly distribution: Distribution,
    readonly domainName: string,
    readonly appName: string,
    readonly environment: string,
    readonly hostedZone: string
}

export class Route53Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: Route53StackProps) {
        super(scope, id, props);

        // Get the hostedZone
        const hostedZone = cdk.aws_route53.HostedZone.fromLookup(this, `${props.appName}Zone`, {
            domainName: props.hostedZone,
        }); 

        // Add the A Record to point to cloudfront
        new cdk.aws_route53.ARecord(this, `${props.appName}AliasRecord`, {
            zone: hostedZone,
            target: cdk.aws_route53.RecordTarget.fromAlias(new cdk.aws_route53_targets.CloudFrontTarget(props.distribution)),
            recordName: props.domainName,
        });
    }
}
