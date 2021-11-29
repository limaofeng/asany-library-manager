import { useEffect, useReducer, useRef } from 'react';

import { useApolloClient } from '@apollo/client';

import { DataSourceLoader, DataSourceResult } from '../typings';

import useSunmao from './useSunmao';

function useLoadData<P, R>(
  dataSourceLoader: DataSourceLoader<any> | undefined,
  param: P,
  defaultResult?: R
): DataSourceResult<R> {
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const latestDataState = useRef<DataSourceResult<R>>({ loading: false, data: defaultResult });

  const client = useApolloClient();

  useEffect(() => {
    if (!dataSourceLoader) {
      latestDataState.current = { loading: false, data: defaultResult };
      return;
    }

    latestDataState.current = { ...latestDataState.current, loading: true, error: undefined };
    forceRender();

    dataSourceLoader
      .load<R>({ ...param, client })
      .then((data) => {
        latestDataState.current = data;
        forceRender();
      })
      .catch((error) => {
        latestDataState.current = { ...latestDataState.current, loading: false, error };
        forceRender();
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourceLoader, defaultResult, param]);

  return latestDataState.current;
}

function useDataSource<P, R = any>(type: string, param: P, defaultResult?: R): DataSourceResult<R> {
  const sunmao = useSunmao();
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const latestDataSourceLoader = useRef<DataSourceLoader | undefined>(sunmao.getDataSourceLoader(type));

  useEffect(() => {
    sunmao.subscribe(() => {
      const dataSourceLoader = sunmao.getDataSourceLoader(type);
      if (latestDataSourceLoader.current !== dataSourceLoader) {
        latestDataSourceLoader.current = dataSourceLoader;
        forceRender();
      }
    });
  }, [sunmao, type]);

  const dataSourceLoader = latestDataSourceLoader.current;

  return useLoadData(dataSourceLoader, param, defaultResult);
}

export default useDataSource;
