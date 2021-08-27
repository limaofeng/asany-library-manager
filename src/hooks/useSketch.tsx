import { useContext } from 'react';

import { Sketch, SketchContext } from '../sketch/SketchContext';

export default function useSketch(): Sketch {
  return useContext(SketchContext);
}
