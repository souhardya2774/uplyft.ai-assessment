"use client";

import { getCSVs } from "@/actions/getCSV";
import { getSignedURL } from "@/actions/s3";
import React, { useEffect, useState } from "react";
import {  Table,  TableHeader,  TableBody,  TableColumn,  TableRow,  TableCell} from "@nextui-org/table";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [csvs, setCSVs] = useState<any[] | null>(null);

  const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  };

  const handleFileUpload = async (file: File) => {
    console.log({ file });
    const signedURLResult = await getSignedURL(
      file.name,
      file.type,
      file.size,
      await computeSHA256(file),
    );

    if (signedURLResult.failure !== undefined) {
      throw new Error(signedURLResult.failure);
    }

    console.log({ signedURLResult });

    const { url } = signedURLResult.success;
    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
    console.log({ success: url });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (file && file.type === "text/csv") {
      setIsUploading(true);
      await handleFileUpload(file);
      setIsUploading(false);
    }
  };

  useEffect(() => {
    getCSVs().then((data)=>setCSVs(data as never[])).catch(console.error);
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8">
        <h1 className="text-4xl font-bold">Upload CSV</h1>
        <div className="flex gap-2">
          <input
            className="bg-transparent flex-1 border-none outline-none"
            disabled={isUploading}
            name="media"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
          {
            isUploading ? (
              <div className="flex flex-col gap-2">
                <p>Uploading...</p>
              </div>
            ) : (
              <button type="submit" onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-md">Upload</button>
            )
          }
        </div>
        <div className="relative w-[1000px]">
          {!csvs && <p className="text-center">Loading...</p>}
          {csvs && (
            <Table className="absolute w-full" aria-label="Example collection table">
              <TableHeader>
                <TableColumn>Filename</TableColumn>
                <TableColumn>Column count</TableColumn>
                <TableColumn>Column names</TableColumn>
                <TableColumn>Row count</TableColumn>
                <TableColumn>File size ( Bytes )</TableColumn>
                <TableColumn>Uploaded at</TableColumn>
              </TableHeader>
              <TableBody>
                {csvs.map((csv: any) => (
                  <TableRow key={csv._id}>
                    <TableCell>{csv?.filename}</TableCell>
                    <TableCell>{csv?.column_count}</TableCell>
                    <TableCell>{csv?.column_names.join(", ")}</TableCell>
                    <TableCell>{csv?.row_count}</TableCell>
                    <TableCell>{csv?.file_size_bytes}</TableCell>
                    <TableCell>{csv?.upload_timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
