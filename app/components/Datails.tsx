import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";

interface TipItem {
  type: "good" | "improve";
  tip: string;
  explanation: string;
}

function ScoreBadge({ score }: { score: number }) {
  const isStrong = score > 69;
  const isOkay = !isStrong && score > 39;

  const bg = isStrong
    ? "bg-green-100 border-green-200"
    : isOkay
      ? "bg-yellow-100 border-yellow-200"
      : "bg-red-100 border-red-200";
  const text = isStrong
    ? "text-green-700"
    : isOkay
      ? "text-yellow-700"
      : "text-red-700";
  const icon = isStrong ? "/icons/check.svg" : "/icons/warning.svg";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
        bg
      )}
    >
      <img src={icon} alt="status" className="w-3.5 h-3.5" />
      <span className={text}>{score}/100</span>
    </span>
  );
}

function CategoryHeader({
  title,
  categoryScore,
}: {
  title: string;
  categoryScore: number;
}) {
  return (
    <div className="flex items-center gap-2 w-full">
      <p className="text-lg font-semibold">{title}</p>
      <ScoreBadge score={categoryScore} />
    </div>
  );
}

function CategoryContent({ tips }: { tips: TipItem[] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tips.map((t, idx) => (
          <div key={`tip-${idx}`} className="flex items-start gap-2">
            <img
              src={
                t.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"
              }
              alt={t.type}
              className={cn(
                "w-4 h-4 mt-0.5",
                t.type === "good" ? "text-green-600" : "text-yellow-600"
              )}
            />
            <p
              className={cn(
                "text-sm",
                t.type === "good" ? "text-green-700" : "text-yellow-700"
              )}
            >
              {t.tip}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {tips.map((t, idx) => (
          <div
            key={`exp-${idx}`}
            className={cn(
              "rounded-lg p-3 text-sm",
              t.type === "good"
                ? "bg-green-50 border border-green-100 text-green-800"
                : "bg-yellow-50 border border-yellow-100 text-yellow-800"
            )}
          >
            {t.explanation}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Details({ feedback }: { feedback: Feedback }) {
  const { t } = useTranslation();
  return (
    <div className="w-full rounded-2xl shadow-md bg-white p-4">
      <Accordion>
        <AccordionItem id="tone">
          <AccordionHeader itemId="tone">
            <CategoryHeader
              title={t('resumeReview.categories.toneAndStyle')}
              categoryScore={feedback.toneAndStyle.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="tone">
            <CategoryContent
              tips={feedback.toneAndStyle.tips as unknown as TipItem[]}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem id="content">
          <AccordionHeader itemId="content">
            <CategoryHeader
              title={t('resumeReview.categories.content')}
              categoryScore={feedback.content.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="content">
            <CategoryContent
              tips={feedback.content.tips as unknown as TipItem[]}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem id="structure">
          <AccordionHeader itemId="structure">
            <CategoryHeader
              title={t('resumeReview.categories.structure')}
              categoryScore={feedback.structure.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="structure">
            <CategoryContent
              tips={feedback.structure.tips as unknown as TipItem[]}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem id="skills">
          <AccordionHeader itemId="skills">
            <CategoryHeader
              title={t('resumeReview.categories.skills')}
              categoryScore={feedback.skills.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="skills">
            <CategoryContent
              tips={feedback.skills.tips as unknown as TipItem[]}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
