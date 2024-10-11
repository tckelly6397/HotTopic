import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, GitHubSourceAction, S3DeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { BuildSpec, PipelineProject, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';

interface BucketDeploymentConfig {
    readonly bucketName: string;
    readonly distributionId: string;
    readonly filePathInGit: string;
}

interface PipelineStackProps extends cdk.StackProps {
    readonly domainName: string;
    readonly repoOwner: string;
    readonly githubRepo: string;
    readonly appName: string;
    readonly environment: string;
    readonly bucketDeployments: BucketDeploymentConfig[];
}

export class PipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: PipelineStackProps) {
        super(scope, id, props);

        // GitHub source action
        const githubOAuthToken = cdk.SecretValue.secretsManager(`${props.appName}AuthToken`, {
            jsonField: 'github-oauth-token'
        });

        const sourceOutput = new Artifact();
        const buildOutput = new Artifact();

        const githubSourceAction = new GitHubSourceAction({
            actionName: 'Github',
            oauthToken: githubOAuthToken,
            owner: props.repoOwner,
            repo: props.githubRepo,
            branch: 'main',
            output: sourceOutput,
        });

        // Create a pipeline
        const pipeline = new Pipeline(this, `${props.appName}Pipeline`, {
            pipelineName: 'MyApplicationPipeline',
            stages: [
                {
                    stageName: 'Source',
                    actions: [githubSourceAction],
                }
            ],
        });

        // Loop through each bucket configuration and create deploy and invalidation actions
        props.bucketDeployments.forEach((bucketDeployment, index) => {
            // CodeBuild project for each deployment
            const buildProject = new PipelineProject(this, `${props.appName}BuildProject-${index}`, {
                environment: {
                    buildImage: LinuxBuildImage.STANDARD_5_0
                },
                buildSpec: BuildSpec.fromObject({
                    version: '0.2',
                    phases: {
                        install: {
                            commands: [
                                'npm install'
                            ]
                        },
                        build: {
                            commands: [
                                'echo "Building the project..."'
                            ]
                        }
                    },
                    artifacts: {
                        'files': ['**/*'],
                        'base-directory': bucketDeployment.filePathInGit,
                    }
                })
            });

            const buildAction = new CodeBuildAction({
                actionName: `Build-${index}`,
                project: buildProject,
                input: sourceOutput,
                outputs: [buildOutput],
            });

            // Add the build action to the pipeline
            pipeline.addStage({
                stageName: `Build-${index}`,
                actions: [buildAction],
            });

            // Get the S3 bucket
            const targetBucket = s3.Bucket.fromBucketName(this, `TargetBucket-${index}`, bucketDeployment.bucketName);

            // Grant permission to upload to the bucket
            targetBucket.grantPut(buildProject.grantPrincipal);

            // S3 Deploy action
            const s3DeployAction = new S3DeployAction({
                actionName: `S3Deploy-${index}`,
                bucket: targetBucket,
                input: buildOutput,
                objectKey: 'src',
            });

            // Add the deploy action to the pipeline
            pipeline.addStage({
                stageName: `Deploy-${index}`,
                actions: [s3DeployAction],
            });

            // CodeBuild project for CloudFront invalidation
            const invalidateProject = new PipelineProject(this, `InvalidateProject-${index}`, {
                environment: {
                    buildImage: LinuxBuildImage.STANDARD_5_0
                },
                buildSpec: BuildSpec.fromObject({
                    version: '0.2',
                    phases: {
                        build: {
                            commands: [
                                `echo "Invalidating CloudFront cache for ${bucketDeployment.distributionId}..."`,
                                `aws cloudfront create-invalidation --distribution-id ${bucketDeployment.distributionId} --paths "/*"`
                            ]
                        }
                    }
                })
            });

            // Grant permission to invalidate CloudFront
            invalidateProject.addToRolePolicy(new iam.PolicyStatement({
                actions: ['cloudfront:CreateInvalidation'],
                resources: [`arn:aws:cloudfront::${cdk.Aws.ACCOUNT_ID}:distribution/${bucketDeployment.distributionId}`],
            }));

            // CloudFront Invalidation action
            const invalidateAction = new CodeBuildAction({
                actionName: `InvalidateCloudFront-${index}`,
                project: invalidateProject,
                input: buildOutput,
            });

            // Add the invalidation action to the pipeline
            pipeline.addStage({
                stageName: `Invalidate-${index}`,
                actions: [invalidateAction],
            });
        });
    }
}

