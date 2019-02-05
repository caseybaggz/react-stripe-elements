// @flow

import { useEffect } from 'react';

type HookErrors = {
  noApi: string,
  noApiKey: string
};

const hookErrors: HookErrors = {
  noApi: 'Stripe is missing from the global instance. Please make sure you are including the api script in your app.',
  noApiKey: 'Missing apiKey as parameter to useStripe hook.',
};

export default function useStripe(apiKey: string = '') {
  // Wraps createToken in order to infer the Element that is being tokenized.
  function wrappedCreateToken(stripe: StripeShape) {
    return (tokenTypeOrOptions: mixed = {}, options: mixed = {}) => {
      if (tokenTypeOrOptions && typeof tokenTypeOrOptions === 'object') {
        // First argument is options; infer the Element and tokenize
        const opts = tokenTypeOrOptions;
        const {type: tokenType, ...rest} = opts;
        const specifiedType =
          typeof tokenType === 'string' ? tokenType : 'auto';
        // Since only options were passed in, a corresponding Element must exist
        // for the tokenization to succeed -- thus we call requireElement.
        const element = this.requireElement('impliedTokenType', specifiedType);
        return stripe.createToken(element, rest);
      } else if (typeof tokenTypeOrOptions === 'string') {
        // First argument is token type; tokenize with token type and options
        const tokenType = tokenTypeOrOptions;
        return stripe.createToken(tokenType, options);
      } else {
        // If a bad value was passed in for options, set an error.
        throw new Error (
          `Invalid options passed to createToken. Expected an object, got ${typeof tokenTypeOrOptions}.`
        );
      }
    };
  }

  // Wraps createSource in order to infer the Element that is being used for
  // source creation.
  function wrappedCreateSource(stripe: StripeShape) {
    return (options: mixed = {}) => {
      if (options && typeof options === 'object') {
        if (typeof options.type !== 'string') {
          throw new Error(
            `Invalid Source type passed to createSource. Expected string, got ${typeof options.type}.`
          );
        }

        // TODO: figure out how to address this
        const element = this.findElement('impliedSourceType', options.type);
        if (element) {
          // If an Element exists for the source type, use that to create the
          // corresponding source.
          //
          // NOTE: this prevents users from independently creating sources of
          // type `foo` if an Element that can create `foo` sources exists in
          // the current <Elements /> context.
          return stripe.createSource(element, options);
        } else {
          // If no Element exists for the source type, directly create a source.
          return stripe.createSource(options);
        }
      } else {
        // If a bad value was passed in for options, set an error.
        throw new Error(
          `Invalid options passed to createToken. Expected an object, got ${typeof tokenTypeOrOptions}.`
        );
      }
    };
  }

  useEffect(() => {
    if (!window.Stripe) {
      throw new Error(hookErrors.noApi);
    }

    if (!apiKey) {
      throw new Error(hookErrors.noApiKey);
    }
  }, []);

  return {
    createToken: wrappedCreateToken,
    createSource: wrappedCreateSource
  };
}
