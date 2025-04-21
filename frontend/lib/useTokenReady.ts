import { useEffect, useState } from 'react';

/** ① 1 度だけ localStorage を読み、完了フラグを返す簡易フック */
export const useTokenReady = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.getItem('token');   // 同期読み取り
      setReady(true);                  // 読み終わったら OK
    }
  }, []);

  return ready;
};
