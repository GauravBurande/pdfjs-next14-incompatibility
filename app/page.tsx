"use client";

import { useState } from "react";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";
import Image from "next/image";
await import("pdfjs-dist/build/pdf.worker.mjs" as any);

export default function Home() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [base64Images, setBase64Images] = useState<string[]>([]);

  const handlePDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const pdfFiles = Array.from(e.target.files);
      const convertPDFToImages = async (pdfFile: File): Promise<string[]> => {
        // GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs"
        try {
          const fileData = await pdfFile.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
          const numPages = pdf.numPages;
          const images: string[] = [];

          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.0 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d") as CanvasRenderingContext2D;
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };

            await page.render(renderContext).promise;
            const imageData = canvas.toDataURL("image/png"); // Convert canvas to base64 image
            images.push(imageData);
          }

          return images;
        } catch (error: any) {
          throw new Error("Error converting PDF to images: " + error.message);
        }
      };

      try {
        const base64ImageArrays = await Promise.all(
          pdfFiles.map(async (pdfFile) => {
            return await convertPDFToImages(pdfFile);
          })
        );

        const flatBase64Images = base64ImageArrays.flat();
        setBase64Images((prevBase64Images) => [
          ...prevBase64Images,
          ...flatBase64Images,
        ]);

        // Store only the first page image URL in imageUrls
        if (base64ImageArrays.length > 0 && base64ImageArrays[0].length > 0) {
          const firstPageImageURLs = base64ImageArrays.map(
            (images) => images[0]
          );
          const newURLs = firstPageImageURLs.map((url) => {
            const blob = new Blob([url], { type: "image/jpeg" });
            return URL.createObjectURL(blob);
          });
          setImageUrls((prevURLs) => [...prevURLs, ...newURLs]);
          console.log(base64Images);
        }
      } catch (error) {
        console.error("Error converting PDF to images:", error);
      }
    }
  };

  const ImagePreview = () => (
    <div className="flex space-x-2">
      {imageUrls.map((imageUrl, index) => (
        <div className="mb-4 relative" key={index}>
          <Image
            src={imageUrl}
            alt="File preview"
            width={50}
            height={50}
            className="rounded"
          />
        </div>
      ))}
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <input onChange={handlePDF} type="file" accept="application/pdf" />
      <ImagePreview />
    </main>
  );
}
