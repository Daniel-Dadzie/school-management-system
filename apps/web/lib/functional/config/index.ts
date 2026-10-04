export const functionalConfig = {
  mode: (process.env.NEXT_PUBLIC_API_MODE || 'mock') as 'mock' | 'api',
};

export const isMockMode = functionalConfig.mode === 'mock';
