export interface BookingData {
  guests: number;
  checkIn: Date | null;
  checkOut: Date | null;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface StepProps {
  data: BookingData;
  onNext: (data: Partial<BookingData>) => void;
  onBack: () => void;
}

export type WizardStep = 1 | 2 | 3 | 4;
