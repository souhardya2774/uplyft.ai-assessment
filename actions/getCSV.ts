"use server";

import { ddbDocClient } from "@/utils/dbconfig";
import {
  ScanCommand,
  ScanCommandOutput,
} from "@aws-sdk/lib-dynamodb";

export const getCSVs = async () => {
  try {
    const data: ScanCommandOutput = await ddbDocClient.send(
      new ScanCommand({
        TableName: "csv-processing-table",
      })
    );
    return (data.Items as any[] ) || [];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Database Error: Failed to get data.");
  }
};