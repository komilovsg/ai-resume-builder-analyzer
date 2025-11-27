import { useRef, useState } from "react";
import { useResumeStore } from "~/lib/resume-store";
import ResumeModern from "./styles/ResumeModern";
import ResumeClassic from "./styles/ResumeClassic";
import ResumeMinimal from "./styles/ResumeMinimal";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

interface ResumePreviewProps {
  resumeData: ResumeData;
}

export default function ResumePreview({ resumeData }: ResumePreviewProps) {
  const { setStyle } = useResumeStore();
  const [selectedStyle, setSelectedStyle] = useState<ResumeStyle>(
    resumeData.style || "modern"
  );
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleStyleChange = (style: ResumeStyle) => {
    setSelectedStyle(style);
    setStyle(style);
  };

  const handleExportPDF = async () => {
    if (!resumeRef.current || typeof window === "undefined") return;

    setIsExporting(true);
    
    // Сохраняем оригинальные стили для восстановления
    const originalStyles: Array<{ el: HTMLElement; prop: string; value: string }> = [];
    
    // Функция для обхода всех элементов и замены oklch цветов
    const replaceOklchColors = (node: HTMLElement) => {
      const computed = window.getComputedStyle(node);
      
      // Проверяем и заменяем color
      if (computed.color && (computed.color.includes("oklch") || computed.color.includes("oklab") || computed.color.includes("lab"))) {
        originalStyles.push({ el: node, prop: "color", value: node.style.color });
        // Используем canvas для конвертации цвета в RGB
        try {
          const ctx = document.createElement("canvas").getContext("2d");
          if (ctx) {
            ctx.fillStyle = computed.color;
            node.style.color = ctx.fillStyle as string;
          } else {
            node.style.color = "#000000"; // Fallback на черный
          }
        } catch {
          node.style.color = "#000000";
        }
      }
      
      // Проверяем и заменяем backgroundColor
      if (computed.backgroundColor && (computed.backgroundColor.includes("oklch") || computed.backgroundColor.includes("oklab") || computed.backgroundColor.includes("lab"))) {
        originalStyles.push({ el: node, prop: "backgroundColor", value: node.style.backgroundColor });
        try {
          const ctx = document.createElement("canvas").getContext("2d");
          if (ctx) {
            ctx.fillStyle = computed.backgroundColor;
            node.style.backgroundColor = ctx.fillStyle as string;
          } else {
            node.style.backgroundColor = "#ffffff"; // Fallback на белый
          }
        } catch {
          node.style.backgroundColor = "#ffffff";
        }
      }
      
      // Проверяем и заменяем borderColor
      if (computed.borderColor && (computed.borderColor.includes("oklch") || computed.borderColor.includes("oklab") || computed.borderColor.includes("lab"))) {
        originalStyles.push({ el: node, prop: "borderColor", value: node.style.borderColor });
        try {
          const ctx = document.createElement("canvas").getContext("2d");
          if (ctx) {
            ctx.fillStyle = computed.borderColor;
            node.style.borderColor = ctx.fillStyle as string;
          } else {
            node.style.borderColor = "#cccccc"; // Fallback на серый
          }
        } catch {
          node.style.borderColor = "#cccccc";
        }
      }
      
      // Рекурсивно обрабатываем дочерние элементы
      for (const child of Array.from(node.children)) {
        if (child instanceof HTMLElement) {
          replaceOklchColors(child);
        }
      }
    };
    
    try {
      // Используем jspdf и html2canvas напрямую для более надежной работы
      const html2canvasModule = await import("html2canvas");
      const jsPDFModule = await import("jspdf");

      const html2canvas = html2canvasModule.default || html2canvasModule;
      const { jsPDF } = jsPDFModule;

      const element = resumeRef.current;
      
      if (!element) {
        throw new Error("Элемент резюме не найден");
      }

      // Заменяем oklch цвета перед рендерингом
      replaceOklchColors(element);

      // Конвертируем HTML в canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      // Восстанавливаем оригинальные стили
      originalStyles.forEach(({ el, prop, value }) => {
        (el.style as any)[prop] = value;
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Создаем PDF
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Добавляем первую страницу
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Добавляем дополнительные страницы, если нужно
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Сохраняем PDF
      pdf.save(`resume-${resumeData.title || "resume"}.pdf`);
      
      Toastify({
        text: "PDF успешно экспортирован!",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
      }).showToast();
    } catch (error) {
      console.error("Error exporting PDF:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Восстанавливаем оригинальные стили даже при ошибке
      originalStyles.forEach(({ el, prop, value }) => {
        (el.style as any)[prop] = value;
      });
      
      Toastify({
        text: `Ошибка при экспорте PDF: ${errorMessage}`,
        duration: 5000,
        gravity: "top",
        position: "right",
        style: {
          background: "linear-gradient(to right, #ff5f6d, #ffc371)",
        },
      }).showToast();
    } finally {
      setIsExporting(false);
    }
  };

  const renderResume = () => {
    switch (selectedStyle) {
      case "modern":
        return <ResumeModern resumeData={resumeData} />;
      case "classic":
        return <ResumeClassic resumeData={resumeData} />;
      case "minimal":
        return <ResumeMinimal resumeData={resumeData} />;
      default:
        return <ResumeModern resumeData={resumeData} />;
    }
  };

  return (
    <div className="w-full max-w-6xl px-4">
      {/* Style Selector */}
      <div className="mb-8 flex justify-center gap-4">
        <button
          onClick={() => handleStyleChange("modern")}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${
            selectedStyle === "modern"
              ? "primary-gradient text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Современный
        </button>
        <button
          onClick={() => handleStyleChange("classic")}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${
            selectedStyle === "classic"
              ? "primary-gradient text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Классический
        </button>
        <button
          onClick={() => handleStyleChange("minimal")}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${
            selectedStyle === "minimal"
              ? "primary-gradient text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Минималистичный
        </button>
      </div>

      {/* Resume Preview */}
      <div ref={resumeRef} className="bg-white shadow-lg rounded-lg p-8 mb-8">
        {renderResume()}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="primary-button max-w-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <p>{isExporting ? "Экспорт..." : "Экспортировать в PDF"}</p>
        </button>
      </div>
    </div>
  );
}


