import React from 'react';
import type { StepProps } from '../../types/booking';
import { Button } from '../UI/Button';

export const GuestSelector: React.FC<StepProps> = ({ data, onNext }) => {
  const [guests, setGuests] = React.useState(data.guests);

  const handleIncrement = () => {
    if (guests < 8) {
      setGuests(guests + 1);
    }
  };

  const handleDecrement = () => {
    if (guests > 1) {
      setGuests(guests - 1);
    }
  };

  const handleNext = () => {
    onNext({ guests });
  };

  return (
    <div className="text-center py-8">
      <h2 className="text-3xl font-display text-primary mb-4">
        Hány főre foglalnál?
      </h2>
      <p className="text-gray-600 mb-8">
        Az apartman maximum 8 fő részére alkalmas
      </p>

      <div className="flex items-center justify-center gap-6 mb-12">
        <button
          onClick={handleDecrement}
          disabled={guests <= 1}
          className="w-14 h-14 rounded-full bg-primary text-white text-2xl font-bold hover:bg-primary-light transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          -
        </button>

        <div className="text-6xl font-bold text-primary w-24">
          {guests}
        </div>

        <button
          onClick={handleIncrement}
          disabled={guests >= 8}
          className="w-14 h-14 rounded-full bg-primary text-white text-2xl font-bold hover:bg-primary-light transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      <Button onClick={handleNext} variant="primary">
        Tovább
      </Button>
    </div>
  );
};
