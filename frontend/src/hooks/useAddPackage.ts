import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../services/api';
import { TRACKING_CODE_MAX_LENGTH } from '../config/constants';
import type { Package, CarrierType } from '../types';

export function useAddPackage() {
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierType>('correios');
  const [title, setTitle] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  const queryClient = useQueryClient();
  const { mutate: createPackage, isLoading } = useMutation({
    mutationFn: (values: { description: string; trackingCode: string; carrier: string }) =>
      apiRequest<Package>('/packages', {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });

  const formatTrackingCode = (value: string): string => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, TRACKING_CODE_MAX_LENGTH);
  };

  const handleTrackingCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackingCode(formatTrackingCode(e.target.value));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTrackingCode(formatTrackingCode(text));
    } catch {
      // clipboard access denied
    }
  };

  const isValidTrackingCode = trackingCode.length === TRACKING_CODE_MAX_LENGTH;

  const submit = (callbacks: { onSuccess: () => void; onError: () => void }) => {
    createPackage(
      {
        description: title,
        trackingCode,
        carrier: selectedCarrier,
      },
      callbacks,
    );
  };

  return {
    selectedCarrier,
    setSelectedCarrier,
    title,
    setTitle,
    trackingCode,
    isLoading,
    isValidTrackingCode,
    handleTrackingCodeChange,
    handlePaste,
    submit,
  };
}
