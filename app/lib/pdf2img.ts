export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
  }
  
  let pdfjsLib: any = null;
  let isLoading = false;
  let loadPromise: Promise<any> | null = null;
  
  async function loadPdfJs(): Promise<any> {
    // Проверка, что код выполняется в браузере
    if (typeof window === "undefined") {
      throw new Error("PDF.js can only be loaded in the browser environment");
    }

    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;
  
    isLoading = true;
    try {
    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
      loadPromise = import("pdfjs-dist/build/pdf.mjs").then(async (lib) => {
      // Set the worker source to use local file
        // Use the local worker file from public directory
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        
        console.log("PDF.js worker source set to:", lib.GlobalWorkerOptions.workerSrc);
        
        // Verify worker file is accessible (only in browser)
        if (typeof window !== "undefined") {
          try {
            const response = await fetch("/pdf.worker.min.mjs", { method: "HEAD" });
            if (!response.ok) {
              console.warn("Worker file may not be accessible:", response.status, response.statusText);
            } else {
              console.log("Worker file is accessible");
            }
          } catch (fetchError) {
            console.warn("Could not verify worker file accessibility:", fetchError);
          }
        }
        
      pdfjsLib = lib;
      isLoading = false;
      return lib;
      }).catch((error) => {
        console.error("Failed to load PDF.js library:", error);
        isLoading = false;
        loadPromise = null; // Reset promise so we can retry
        throw error;
    });
  
    return loadPromise;
    } catch (error) {
      isLoading = false;
      loadPromise = null; // Reset promise so we can retry
      console.error("Error loading PDF.js:", error);
      throw error;
    }
  }
  
  export async function convertPdfToImage(
    file: File
  ): Promise<PdfConversionResult> {
    // Проверка, что код выполняется в браузере (не на сервере)
    if (typeof window === "undefined" || typeof document === "undefined") {
      return {
        imageUrl: "",
        file: null,
        error: "PDF conversion can only be performed in the browser. This function cannot run on the server.",
      };
    }

    try {
      console.log("Starting PDF conversion for file:", file.name, "Size:", file.size, "Type:", file.type);
      
      // Validate file type
      if (file.type && !file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
        throw new Error(`Invalid file type: ${file.type}. Expected PDF file.`);
      }
      
      // Validate file size
      if (file.size === 0) {
        throw new Error("File is empty");
      }
      
      const lib = await loadPdfJs();
      console.log("PDF.js library loaded successfully");
  
      const arrayBuffer = await file.arrayBuffer();
      console.log("File converted to ArrayBuffer, size:", arrayBuffer.byteLength);
      
      const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
      console.log("PDF document loaded, pages:", pdf.numPages);
      
      const page = await pdf.getPage(1);
      console.log("First page loaded");
  
      const viewport = page.getViewport({ scale: 4 });
      console.log("Viewport created:", viewport.width, "x", viewport.height);
      
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Failed to get 2D context from canvas");
      }
  
      canvas.width = viewport.width;
      canvas.height = viewport.height;
  
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
  
      await page.render({ canvasContext: context, viewport }).promise;
      console.log("Page rendered to canvas");
  
      return new Promise((resolve) => {
        // Use toBlob first (preferred method)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log("Blob created successfully, size:", blob.size);
              // Create a File from the blob with the same name as the pdf
              const originalName = file.name.replace(/\.pdf$/i, "");
              const imageFile = new File([blob], `${originalName}.png`, {
                type: "image/png",
              });
  
              resolve({
                imageUrl: URL.createObjectURL(blob),
                file: imageFile,
              });
            } else {
              // Fallback to toDataURL if toBlob fails
              console.warn("toBlob failed, trying toDataURL fallback");
              try {
                const dataUrl = canvas.toDataURL("image/png");
                if (dataUrl) {
                  // Convert data URL to blob
                  fetch(dataUrl)
                    .then((res) => res.blob())
                    .then((blob) => {
                      const originalName = file.name.replace(/\.pdf$/i, "");
                      const imageFile = new File([blob], `${originalName}.png`, {
                        type: "image/png",
                      });

                      resolve({
                        imageUrl: dataUrl,
                        file: imageFile,
                      });
                    })
                    .catch((err) => {
                      console.error("Failed to convert data URL to blob:", err);
                      resolve({
                        imageUrl: "",
                        file: null,
                        error: "Failed to create image blob from canvas: " + (err instanceof Error ? err.message : String(err)),
                      });
                    });
                } else {
                  throw new Error("toDataURL returned empty result");
                }
              } catch (fallbackError) {
                console.error("Fallback toDataURL also failed:", fallbackError);
              resolve({
                imageUrl: "",
                file: null,
                  error: "Failed to create image blob from canvas: " + (fallbackError instanceof Error ? fallbackError.message : String(fallbackError)),
              });
              }
            }
          },
          "image/png",
          1.0
        ); // Set quality to maximum (1.0)
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error in convertPdfToImage:", errorMessage, err);
      return {
        imageUrl: "",
        file: null,
        error: `Failed to convert PDF: ${errorMessage}`,
      };
    }
  }