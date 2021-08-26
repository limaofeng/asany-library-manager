import { useContext, useMemo } from 'react';
import { SunmaoContext } from '../SunmaoProvider';
import Sunmao from '../Sunmao';
import Debugger from '../utils/Debugger';

export default function useSunmao(): Sunmao {
  return useContext(SunmaoContext).sunmao;
}

export function useDebugger(): Debugger {
  const debug = useContext(SunmaoContext).debug;
  return useMemo(() => new Debugger(debug), [debug]);
}
