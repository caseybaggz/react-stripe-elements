// @flow

import {useEffect, useState} from 'react';

type Error = {
  type: string,
  message: string
};

type HookErrors = {
  noApi: Error,
  noToken: Error
};

const hookErrors: HookErrors = {
  noApi: {
    type: 'MISSING_API',
    message:
      'Stripe is missing from the global instance. Please make sure you are including the api script in your app.',
  },
  noToken: {
    type: 'INVALID_TOKEN',
    message: 'Missing apiKey as parameter to useStripe hook.',
  }
};

export default function useStripe(apiKey: string = '') {
  const [props, setProps] = useState(null);
  const [errors, setError] = useState(null);

  function handleError(type: string = '', message: string = ''): void {
    setError((prevState) => [...prevState, {type, message}]);
  }

  useEffect(() => {
    if (!window.Stripe) {
      handleError(...hookErrors.noApi);
    }

    if (!apiKey) {
      handleError(...hookErrors.noToken);
    }
  }, []);

  return [props, errors];
}
