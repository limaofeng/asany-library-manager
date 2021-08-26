import { IBlockState, IUpdateBlockData, ReactComponentAction } from '../typings';

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
        blocks: state.blocks.filter(({ key }) => key != action.payload.key),
      };
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
    default:
      return state;
  }
}
