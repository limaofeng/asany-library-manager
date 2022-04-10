import { useEffect, useReducer, useRef } from 'react';

import { DataSourceLoader } from '../typings';
import { DataSource } from '../typings';

import useSunmao from './useSunmao';

function useLoadDataSource<P>(dataSourceLoader: DataSourceLoader<any> | undefined, param: P): DataSource | null {
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const latestDataState = useRef<DataSource | null>(null);

  useEffect(() => {
    if (!dataSourceLoader) {
      latestDataState.current = null;
      forceRender();
      return;
    }
    latestDataState.current = dataSourceLoader.load(param);
    forceRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourceLoader]);

  return latestDataState.current;
}

function useDataSource<P = any>(type: string, param?: P): DataSource | null {
  const sunmao = useSunmao();
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const latestDataSourceLoader = useRef<DataSourceLoader | undefined>(sunmao.getDataSourceLoader(type));

  useEffect(() => {
    return sunmao.subscribe(() => {
      const dataSourceLoader = sunmao.getDataSourceLoader(type);
      if (latestDataSourceLoader.current !== dataSourceLoader) {
        latestDataSourceLoader.current = dataSourceLoader;
        forceRender();
      }
    });
  }, [sunmao, type]);

  const dataSourceLoader = latestDataSourceLoader.current;

  return useLoadDataSource(dataSourceLoader, param);
}

export default useDataSource;
