import React, { useMemo } from 'react';

import Sunmao from './Sunmao';

const defaultSunmao = new Sunmao();

export const SunmaoContext = React.createContext<Sunmao>(defaultSunmao);

interface SunmaoProviderProps {
  sunmao?: Sunmao;
  children: React.ReactNode;
}

function SunmaoProvider(props: SunmaoProviderProps) {
  return useMemo(
    () => <SunmaoContext.Provider value={props.sunmao || defaultSunmao}>{props.children}</SunmaoContext.Provider>,
    []
  );
}

export default SunmaoProvider;
