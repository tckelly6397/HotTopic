import * as cdk from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';

interface CloudFrontStackProps extends cdk.StackProps {
    readonly doRoute53: boolean,
    readonly acmArn: string,
    readonly domainName: string,
    readonly appName: string,
    readonly environment: string,
    readonly bucket: Bucket
}

export class CloudFrontStack extends cdk.Stack {
    public readonly distribution: Distribution

    constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
        super(scope, id, props);

        // Get the cert
        let domainNames: string[] = [];
        let certificate = undefined;

        if (props.doRoute53) {
            const cert = Certificate.fromCertificateArn(this, `${props.appName}httpsCert`, props.acmArn);
            domainNames = [props.domainName];
            certificate = cert;
        }

        // Set up cloudfront
        this.distribution = new Distribution(this, `${props.appName}CloudfrontStack`, {
            defaultBehavior: { 
                origin: new cdk.aws_cloudfront_origins.S3Origin(props.bucket, {
                    originPath: '/src',
                }),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            domainNames: domainNames.length > 0 ? domainNames : undefined,
            certificate: certificate,
            defaultRootObject: 'index.html',
        });

        new cdk.CfnOutput(this, `${props.appName}DistributionDomainName`, {
            value: this.distribution.distributionDomainName
        });
    }
}
