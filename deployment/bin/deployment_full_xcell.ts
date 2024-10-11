#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { config } from '../app-config';
import { S3Stack } from '../stack-lib/s3-stack';
import { CloudFrontStack } from '../stack-lib/cloudfront-stack';
import { Route53Stack } from '../stack-lib/route-53';
import { PipelineStack } from '../stack-lib/pipeline-stack';

const app = new cdk.App();
const env = {
  account: config.accountNumber,
  region: config.region
}

const bucket = new S3Stack(app, `${config.appName}S3WebBucket`, {
  domainName: config.domainName,
  appName: config.appName,
  environment: config.environment,
  env
});

const distribution = new CloudFrontStack(app, `${config.appName}DistributionStack`, {
  doRoute53: config.doRoute53,
  domainName: config.domainName,
  appName: config.appName,
  environment: config.environment,
  acmArn: config.acmArn,
  bucket: bucket.bucket,
  env
});

if (config.doRoute53 == true) {
    new Route53Stack(app, `${config.appName}FullWebStack`, {
      distribution: distribution.distribution,
      domainName: config.domainName,
      appName: config.appName,
      hostedZone: config.hostedZone,
      environment: config.environment,
      env
    });
}

/*
new PipelineStack(app, `${config.appName}PipelineStack`, {
    domainName: config.domainName,
    repoOwner: config.repoOwner,
    githubRepo: config.repoName,
    appName: config.appName,
    environment: config.environment,
    bucketDeployments: [
        {
            bucketName: 'rsna-2024.accessiumgroup.com',
            distributionId: 'E169RKNBZSE7IS',
            filePathInGit: 'src/',
        }
    ]
});
*/
