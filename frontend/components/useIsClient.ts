import { useState, useEffect } from 'react';
export const useIsClient = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
};
