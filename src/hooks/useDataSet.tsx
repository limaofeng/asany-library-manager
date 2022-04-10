import { useReducer, useRef } from 'react';

import { DataSet } from '../typings';
import { useDeepCompareEffect } from '../utils';

import useDataSource from './useDataSource';

function useDataSet<P, R = any>(sourceId: any, options: P) {
  const dataSource = useDataSource(sourceId);

  const [, forceRender] = useReducer((s) => s + 1, 0);
  const latestDataState = useRef<DataSet<R>>({ loading: false, data: undefined });

  useDeepCompareEffect(() => {
    if (dataSource == null) {
      return;
    }
    if (!latestDataState.current.loading) {
      latestDataState.current = { loading: true };
      forceRender();
    }
    dataSource.dataset<R, P>(options).then((dataset) => {
      latestDataState.current = dataset;
      forceRender();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, options]);

  return latestDataState.current;
}

export default useDataSet;
