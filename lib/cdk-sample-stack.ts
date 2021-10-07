import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Bucket } from "@aws-cdk/aws-s3";
import * as Iam from "@aws-cdk/aws-iam";
import * as cdk from "@aws-cdk/core";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";

export class CdkSampleStackMf extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "data-dump-mf", {
      bucketName: "data-dump-mf",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const readFromBucketLambda = new NodejsFunction(
      this,
      "read-from-data-dump-mf",
      {
        handler: 'handler',
        entry: "./src/getFromBucket.ts",
        bundling: {
          externalModules: ["aws-sdk"],
        },
      }
    );

    bucket.addToResourcePolicy(
      new Iam.PolicyStatement({
        effect: Iam.Effect.ALLOW,
        principals: [readFromBucketLambda.grantPrincipal],
        actions: ["s3:GetObject"],
        resources: [`${bucket.bucketArn}/*`],
      })
    );

    const api = new HttpApi(this, "data-dump-api-mf", {
      defaultIntegration: new LambdaProxyIntegration({
        handler: readFromBucketLambda,
      }),
    });
  }
}
