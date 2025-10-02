import React from 'react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import { hu } from 'date-fns/locale';
import type { StepProps } from '../../types/booking';
import { Button } from '../UI/Button';
import { blockedDates } from '../../config/blocked-dates';
import 'react-day-picker/dist/style.css';

export const DatePicker: React.FC<StepProps> = ({ data, onNext, onBack }) => {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: data.checkIn || undefined,
    to: data.checkOut || undefined,
  });

  const handleNext = () => {
    if (range?.from && range?.to) {
      onNext({ checkIn: range.from, checkOut: range.to });
    }
  };

  const disabledDays = [
    { before: new Date() },
    ...blockedDates,
  ];

  return (
    <div className="py-8">
      <h2 className="text-3xl font-display text-primary mb-4 text-center">
        Mikor szeretnél érkezni?
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        Válaszd ki az érkezés és távozás dátumát
      </p>

      <div className="flex justify-center mb-8">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          disabled={disabledDays}
          locale={hu}
          numberOfMonths={2}
          className="border rounded-lg p-4"
        />
      </div>

      <div className="flex justify-between gap-4">
        <Button onClick={onBack} variant="outline">
          Vissza
        </Button>
        <Button
          onClick={handleNext}
          variant="primary"
          disabled={!range?.from || !range?.to}
        >
          Tovább
        </Button>
      </div>
    </div>
  );
};
