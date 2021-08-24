import React, { useEffect } from 'react';
import { useBlock } from '../src/hooks';
import { ComponentPropertyType } from '../src/typings';

function Showme() {
  const [{ key, props, update, Provider }] = useBlock<ACProps>({
    key: 'xxx',
    icon: '',
    title: '',
    props: {
      title: 'xxx',
    },
    customizer: {
      fields: [
        {
          name: 'title',
          type: ComponentPropertyType.String,
        },
      ],
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      update('title', 'Time =>' + Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  console.log('>>>>>', props.title);

  return (
    <Provider clickable={true} name="" tag={AC}>
      Show me your code: {props.title} <br /> key = {key}
    </Provider>
  );
}

interface ACProps {
  name: string;
  children: React.ReactNode;
}

const AC = React.forwardRef(function (p: ACProps, ref: any) {
  console.log('ref => ', ref);
  return <span ref={ref}>{p.children}</span>;
});

export default Showme;
