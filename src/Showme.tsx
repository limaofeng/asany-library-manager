import React, { useEffect } from 'react';
import { useBlock } from './hooks';
import { ComponentPropertyType } from './typings';

function Showme() {
  const [{ props, update }] = useBlock({
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

  return <div>Show me your code: {props.title} </div>;
}

export default Showme;
