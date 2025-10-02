import React from 'react';
import { useBookingWizard } from '../../hooks/useBookingWizard';
import { ProgressBar } from '../UI/ProgressBar';
import { GuestSelector } from '../Steps/GuestSelector';
import { DatePicker } from '../Steps/DatePicker';
import { ContactForm } from '../Steps/ContactForm';
import { Confirmation } from '../Steps/Confirmation';

export const BookingWizard: React.FC = () => {
  const { currentStep, bookingData, updateBookingData, nextStep, prevStep } =
    useBookingWizard();

  const handleNext = (data: any) => {
    updateBookingData(data);
    nextStep();
  };

  return (
    <div className="booking-wizard max-w-4xl mx-auto px-4 py-8">
      <ProgressBar currentStep={currentStep} />

      <div className="bg-white rounded-xl shadow-lg p-8">
        {currentStep === 1 && (
          <GuestSelector
            data={bookingData}
            onNext={handleNext}
            onBack={prevStep}
          />
        )}

        {currentStep === 2 && (
          <DatePicker
            data={bookingData}
            onNext={handleNext}
            onBack={prevStep}
          />
        )}

        {currentStep === 3 && (
          <ContactForm
            data={bookingData}
            onNext={handleNext}
            onBack={prevStep}
          />
        )}

        {currentStep === 4 && (
          <Confirmation
            data={bookingData}
            onNext={handleNext}
            onBack={prevStep}
          />
        )}
      </div>
    </div>
  );
};
