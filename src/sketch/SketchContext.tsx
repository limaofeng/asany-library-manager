import React, { useContext, useMemo } from 'react';
import { IReactComponentStoreContext } from '../typings';

type ReactComponentData = {
  id: string;
  store: IReactComponentStoreContext;
};

class Sketch {
  private components = new Map<string, ReactComponentData>();

  add(data: ReactComponentData) {
    this.components.set(data.id, data);
    return () => this.remove(data.id);
  }

  remove(id: string) {
    this.components.delete(id);
  }
}

export const SketchContext = React.createContext<Sketch>(new Sketch());

interface SketchProviderProps {
  children: React.ReactNode;
}

export const useSketch = () => {
  return useContext(SketchContext);
};

export const SketchProvider = (props: SketchProviderProps) => {
  const { children } = props;
  const sketch = useMemo(() => new Sketch(), []);
  return <SketchContext.Provider value={sketch}>{children}</SketchContext.Provider>;
};
