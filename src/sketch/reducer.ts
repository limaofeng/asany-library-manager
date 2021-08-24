import { IBlockState, IUpdateBlockData, ReactComponentAction } from '../typings';

// const defaultState: IBlockState = {
//   version: 0,
//   definition: {} as any,
//   activeKey: '',
//   blocks: [],
//   stack: [],
// };

const merge = (props: any[], newProps: any[]) => {
  const newBolcks = [...newProps];
  return [
    ...props.filter(
      (i) =>
        !newBolcks.some((item: any, index: number) => {
          if (item.key === i.key) {
            newBolcks[index] = { ...i, ...item, version: (i.version || 0) + 1 };
          }
          return item.key === i.key;
        })
    ),
    ...newBolcks,
  ];
};

export default function reducer(state: IBlockState, action: ReactComponentAction): IBlockState {
  // const { stack } = state || {};
  // if (action.type === ProjectActionType.ChangeCase && action.payload.type === 'component') {
  //   return {
  //     ...defaultState,
  //     version: state.version + 1,
  //     component: action.payload.data.id,
  //     blocks: merge(state.blocks, action.payload.data.props || []),
  //   };
  // }
  // console.log('action:', state, action);
  switch (action.type) {
    case 'UpdateAllBlockProps':
      return {
        ...state,
        version: state.version + 1,
        blocks: merge(state.blocks, action.payload || []),
      };
    case 'RegistrationBlock':
      if (state.blocks.some(({ key }) => key === action.payload.key)) {
        return {
          ...state,
          version: state.version + 1,
          blocks: state.blocks.map((item) => {
            if (item.key === action.payload.key) {
              return { ...action.payload, props: item.props, version: 0 };
            }
            return item;
          }),
        };
      }
      return {
        ...state,
        blocks: [...state.blocks, action.payload],
      };
    case 'UninstallBlock':
      return {
        ...state,
        version: state.version + 1,
        activeKey: state.activeKey === action.payload.key ? 'father' : state.activeKey, // TODO: father 是否应该保留
        blocks: state.blocks.filter(({ key }) => key != action.payload.key),
      };
    //   case BlockActionType.PushBlock:
    //     const key = (action.payload as IBlockData<any>).key;
    //     if (key === father) {
    //       stack.length = 0;
    //     }
    //     stack.push(key);
    //     return {
    //       ...state,
    //       stack: [...stack],
    //     };
    //   case BlockActionType.PopBlock:
    //     stack.pop();
    //     return {
    //       ...state,
    //       stack: [...stack],
    //     };
    //   case BlockActionType.SelectedBlock:
    //     return {
    //       ...state,
    //       activeKey: (action.payload as IBlockData<any>).key,
    //     };
    //   case BlockActionType.UncheckBlock:
    //     return {
    //       ...state,
    //       activeKey: father,
    //     };
    case 'UpdateBlockProps': {
      const data = action.payload as IUpdateBlockData;
      console.log('action:', action);
      return {
        ...state,
        version: state.version + 1,
        blocks: state.blocks.map((block) => {
          if (block.key === data.key) {
            block.props = { ...data.props };
            block.version = (block.version || 0) + 1;
          }
          return block;
        }),
      };
    }
    //   case BlockActionType.UpdateBlockCustomizer: {
    //     const data = action.payload as IUpdateBlockData;
    //     return {
    //       ...state,
    //       blocks: state.blocks.map((block) => {
    //         if (block.key === data.key) {
    //           block.customizer = data.customizer;
    //         }
    //         return block;
    //       }),
    //     };
    //   }
    //   case GlobalAsanyAction.Init:
    //     return defaultState;
    default:
      return state;
  }
}
