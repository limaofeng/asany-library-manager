import { useContext } from 'react';
import { SunmaoContext } from '../SunmaoProvider';
import Sunmao from '../Sunmao';

export default function useSunmao(): Sunmao {
  return useContext(SunmaoContext);
}
