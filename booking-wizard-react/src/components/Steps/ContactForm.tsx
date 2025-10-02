import React from 'react';
import { useForm } from 'react-hook-form';
import type { StepProps } from '../../types/booking';
import { Button } from '../UI/Button';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const ContactForm: React.FC<StepProps> = ({ data, onNext, onBack }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    },
  });

  const onSubmit = (formData: FormData) => {
    onNext(formData);
  };

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-display text-primary mb-4 text-center">
        Elérhetőségek
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        Add meg az adataidat a foglalás véglegesítéséhez
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">
            Név *
          </label>
          <input
            type="text"
            {...register('name', { required: 'A név megadása kötelező' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Teljes név"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">
            Email cím *
          </label>
          <input
            type="email"
            {...register('email', {
              required: 'Az email cím megadása kötelező',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Érvénytelen email cím',
              },
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="pelda@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">
            Telefonszám *
          </label>
          <input
            type="tel"
            {...register('phone', {
              required: 'A telefonszám megadása kötelező',
              pattern: {
                value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                message: 'Érvénytelen telefonszám',
              },
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="+36 20 123 4567"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-primary">
            Üzenet (opcionális)
          </label>
          <textarea
            {...register('message')}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Egyéb kérések, megjegyzések..."
          />
        </div>

        <div className="flex justify-between gap-4 pt-4">
          <Button onClick={onBack} variant="outline" type="button">
            Vissza
          </Button>
          <Button type="submit" variant="primary">
            Tovább
          </Button>
        </div>
      </form>
    </div>
  );
};
