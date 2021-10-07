import { S3 } from "aws-sdk";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (req) => {
  const body = JSON.parse(req.body ?? "{}");

  const s3Contents = await new S3()
    .getObject({
      Bucket: "data-dump-mf",
      Key: body.id,
    })
    .promise()
    .catch((e) => {
      console.error(e);

      return {
        Body: undefined,
      };
    });

  if (!s3Contents.Body) {
    return {
      statusCode: 404,
      body: "File not found",
    };
  }

  return {
    statusCode: 200,
    body: s3Contents.Body.toString("utf-8") ?? "",
  };
};
