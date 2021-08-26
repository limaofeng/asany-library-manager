import React, { useMemo } from 'react';

import Sunmao from './Sunmao';

const defaultSunmao = new Sunmao();

export const SunmaoContext = React.createContext<{ sunmao: Sunmao; debug: boolean }>({
  sunmao: defaultSunmao,
  debug: true,
});

interface SunmaoProviderProps {
  sunmao?: Sunmao;
  debug?: boolean;
  children: React.ReactNode;
}

function SunmaoProvider({ sunmao, debug = true, children }: SunmaoProviderProps) {
  return useMemo(() => {
    return (
      <SunmaoContext.Provider value={{ sunmao: sunmao || defaultSunmao, debug }}>{children}</SunmaoContext.Provider>
    );
  }, []);
}

export default SunmaoProvider;
