import { IConstants } from './interfaces'

export const OASWalkerConstants = {
  API_SPECS: [
    {
      id: 'payments-orchestrator',
      url:
        'https://s3-us-west-2.amazonaws.com/yapstone-devportal-flavorizer-dev/specs/orchestrator-api.yaml'
    },
    {
      id: 'payouts-composite',
      url:
        'https://s3-us-west-2.amazonaws.com/yapstone-devportal-flavorizer-dev/specs/payouts-composite.yaml'
    },
    {
      id: 'so-v2',
      url: 'https://s3-us-west-2.amazonaws.com/yapstone-devportal-flavorizer-dev/specs/so-v2.yaml'
    }
  ],
  CONTENT_TYPE: 'application/json',
  EXAMPLE: 'example',
  PARAMETER: 'param',
  REQUEST_BODY_PARAM: 'requestBodyParam',
  RESPONSE: 'response',
  X_SCHEMA_WALKER: 'x-schema-walker',
  X_SCHEMA_WALKER_PATH_PREFIX: 'x-schema-walker-refed-'
} as IConstants
