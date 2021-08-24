import React, { useEffect } from 'react';
import { useBlock } from '../src/hooks';
import { ComponentPropertyType } from '../src/typings';

function Showme() {
  const { key, props, update, Provider } = useBlock({
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
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  console.log('>>>>>', props.title);

  return (
    <Provider clickable={true}>
      Show me your code: {props.title} <br /> key = {key}
    </Provider>
  );
}

export default Showme;
