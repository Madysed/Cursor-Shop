import { useState } from 'react';
import axios from 'axios';

interface ApiError {
  message: string;
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ApiError | null>(null);

  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      setErrors(error.response.data as ApiError);
    } else {
      setErrors({ message: 'An unexpected error occurred' });
    }
  };

  const clearErrors = () => setErrors(null);

  return { errors, handleError, clearErrors };
}; 