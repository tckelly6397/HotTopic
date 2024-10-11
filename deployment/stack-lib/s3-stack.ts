import * as cdk from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface S3StackProps extends cdk.StackProps {
    readonly domainName: string,
    readonly appName: string,
    readonly environment: string,
}

export class S3Stack extends cdk.Stack {
    public readonly bucket: Bucket

    constructor(scope: Construct, id: string, props: S3StackProps) {
        super(scope, id, props);

        // Create an S3 bucket
        this.bucket = new Bucket(this, `${props.appName}BucketStack`, {
            bucketName: `${props.domainName}`,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });
    }
}
