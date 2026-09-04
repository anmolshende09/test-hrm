import React from "react";
import { Check } from "lucide-react";

const STEPS = ["Personal", "Employment", "Contact", "Banking", "Documents"];

export default function ProgressIndicator({ currentStep }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-caption-strong shrink-0 ${
                  isCompleted
                    ? "bg-success text-white"
                    : isCurrent
                    ? "bg-primary text-white"
                    : "bg-canvas-parchment text-ink-muted48"
                }`}
              >
                {isCompleted ? <Check size={15} /> : stepNum}
              </div>
              <span className={`text-fine-print ${isCurrent ? "text-ink-muted80 font-medium" : "text-ink-muted48"}`}>{label}</span>
            </div>
            {stepNum < STEPS.length && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 ${isCompleted ? "bg-success" : "bg-canvas-parchment"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
