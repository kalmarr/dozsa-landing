import React from 'react';
import type { WizardStep } from '../../types/booking';

interface ProgressBarProps {
  currentStep: WizardStep;
}

const steps = [
  { number: 1, label: 'Vendégszám' },
  { number: 2, label: 'Időpont' },
  { number: 3, label: 'Adatok' },
  { number: 4, label: 'Megerősítés' },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step.number
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number}
              </div>
              <span className="text-xs mt-2 font-sans">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all ${
                  currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
