import React, { useState } from 'react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import type { StepProps } from '../../types/booking';
import { Button } from '../UI/Button';

export const Confirmation: React.FC<StepProps> = ({ data, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/booking.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(result.message || 'Hiba történt a foglalás során');
      }
    } catch (error) {
      setSubmitError('Hiba történt a foglalás során. Kérjük, próbáld újra később.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="py-8 text-center">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-display text-primary mb-4">
          Sikeres foglalás!
        </h2>
        <p className="text-gray-600 mb-4">
          Köszönjük a foglalást! Hamarosan email-ben küldünk egy megerősítést.
        </p>
        <p className="text-sm text-gray-500">
          Ha nem találod az emailt, kérjük, nézd meg a spam mappát is.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-display text-primary mb-4 text-center">
        Foglalás áttekintése
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        Ellenőrizd az adatokat a foglalás véglegesítése előtt
      </p>

      <div className="bg-secondary/30 rounded-lg p-6 mb-6 space-y-4">
        <div className="flex justify-between border-b border-primary/20 pb-3">
          <span className="font-semibold text-primary">Vendégek száma:</span>
          <span>{data.guests} fő</span>
        </div>

        <div className="flex justify-between border-b border-primary/20 pb-3">
          <span className="font-semibold text-primary">Érkezés:</span>
          <span>
            {data.checkIn && format(data.checkIn, 'yyyy. MMMM d.', { locale: hu })}
          </span>
        </div>

        <div className="flex justify-between border-b border-primary/20 pb-3">
          <span className="font-semibold text-primary">Távozás:</span>
          <span>
            {data.checkOut && format(data.checkOut, 'yyyy. MMMM d.', { locale: hu })}
          </span>
        </div>

        <div className="flex justify-between border-b border-primary/20 pb-3">
          <span className="font-semibold text-primary">Név:</span>
          <span>{data.name}</span>
        </div>

        <div className="flex justify-between border-b border-primary/20 pb-3">
          <span className="font-semibold text-primary">Email:</span>
          <span>{data.email}</span>
        </div>

        <div className="flex justify-between border-b border-primary/20 pb-3">
          <span className="font-semibold text-primary">Telefon:</span>
          <span>{data.phone}</span>
        </div>

        {data.message && (
          <div className="pt-3">
            <span className="font-semibold text-primary block mb-2">Üzenet:</span>
            <p className="text-gray-700 italic">{data.message}</p>
          </div>
        )}
      </div>

      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {submitError}
        </div>
      )}

      <div className="flex justify-between gap-4">
        <Button onClick={onBack} variant="outline" disabled={isSubmitting}>
          Vissza
        </Button>
        <Button
          onClick={handleConfirm}
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Küldés...' : 'Foglalás véglegesítése'}
        </Button>
      </div>
    </div>
  );
};
