"server only";

import {
  DynamoDBClient,
  DynamoDBClientConfig,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  TranslateConfig,
} from "@aws-sdk/lib-dynamodb";

if (
  !process.env.AWS_DYNAMODB_ACCESS_KEY ||
  !process.env.AWS_DYNAMODB_SECRET_ACCESS_KEY
) {
  throw new Error(
    "Cannot Read env variable AWS_ACCESS_KEY_ID or AWS_SECRET_KEY"
  );
}

const ddbClientConfig: DynamoDBClientConfig = {
  region: process.env.AWS_DYNAMODB_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_DYNAMODB_ACCESS_KEY,
    secretAccessKey: process.env.AWS_DYNAMODB_SECRET_ACCESS_KEY,
  },
};

const ddbClient = new DynamoDBClient(ddbClientConfig);

const marshallOptions: TranslateConfig["marshallOptions"] =
  {
    convertEmptyValues: false,
    removeUndefinedValues: true,
    convertClassInstanceToMap: false,
  };

const unmarshallOptions: TranslateConfig["unmarshallOptions"] =
  {
    wrapNumbers: false,
  };

const translateConfig: TranslateConfig = {
  marshallOptions,
  unmarshallOptions,
};

const ddbDocClient = DynamoDBDocumentClient.from(
  ddbClient,
  translateConfig
);

export { ddbDocClient };