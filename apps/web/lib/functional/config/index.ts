export const functionalConfig = {
  mode: (process.env.NEXT_PUBLIC_KARATU_API_MODE || 'mock') as 'mock' | 'api',
};

// Production must never silently read or mutate the browser mock database.
export const isMockMode = process.env.NODE_ENV !== 'production' && functionalConfig.mode === 'mock';
