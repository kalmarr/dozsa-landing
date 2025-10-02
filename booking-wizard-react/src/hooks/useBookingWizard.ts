import { useState } from 'react';
import type { BookingData, WizardStep } from '../types/booking';

export const useBookingWizard = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    guests: 2,
    checkIn: null,
    checkOut: null,
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  return {
    currentStep,
    bookingData,
    updateBookingData,
    nextStep,
    prevStep,
    goToStep,
  };
};
