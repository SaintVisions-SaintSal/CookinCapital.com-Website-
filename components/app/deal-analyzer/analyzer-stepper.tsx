"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  id: string
  label: string
  description: string
}

interface AnalyzerStepperProps {
  steps: Step[]
  currentStep: number
  onStepClick: (index: number) => void
}

export function AnalyzerStepper({ steps, currentStep, onStepClick }: AnalyzerStepperProps) {
  return (
    <nav className="w-full lg:w-56 shrink-0">
      <ol className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 lg:space-y-1">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep

          return (
            <li key={step.id} className="shrink-0">
              <button
                onClick={() => onStepClick(index)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors w-full min-w-[140px] lg:min-w-0",
                  isCurrent && "bg-primary/10",
                  !isCurrent && "hover:bg-secondary",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground",
                    !isCompleted && !isCurrent && "bg-secondary text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="hidden lg:block">
                  <p className={cn("text-sm font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
