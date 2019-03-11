import superagent from 'superagent'
import SwaggerParser from 'swagger-parser'
import { ParameterObject } from 'openapi3-ts'

import { flattenParamSchema } from '../src/swagger-schema-flattener'
import at from 'lodash.at'

const MAX_APIS_TO_TEST = 1500
const START_AT_INDEX = 0
const MAX_DOWNLOAD_RETRIES = 3

let apiIndex = START_AT_INDEX
let realWorldAPIs = [] as any[]
const knownApiErrors = getKnownApiErrors()

// Download all API defs
beforeAll(done => {
  // Download a list of over 2000 real-world Swagger APIs from apis.guru
  return superagent.get('https://api.apis.guru/v2/list.json').end((err, res) => {
    if (err || !res.ok) {
      console.error('Unable to download real-world APIs from apis.guru')
      return err || new Error('Unable to download real-world APIs from apis.guru')
    }

    // Remove certain APIs that are known to cause problems
    let apis = res.body

    // GitHub's CORS policy blocks this request
    delete apis['googleapis.com:adsense']

    // These APIs cause infinite loops in json-schema-ref-parser.  Still investigating.
    // https://github.com/APIDevTools/json-schema-ref-parser/issues/56
    delete apis['bungie.net']
    delete apis['stripe.com']

    // Flatten the list, so there's an API object for every API version
    Object.keys(apis).forEach((apiName: string) => {
      Object.keys(apis[apiName].versions).forEach((version: string) => {
        let api = apis[apiName].versions[version]
        api.name = apiName
        api.version = version
        realWorldAPIs.push(api)
      })
    })

    done()
  })
}, 10000)

describe('flattenParamSchema', () => {
  for (let i = 1; i <= MAX_APIS_TO_TEST; i++) {
    it('Test ' + i, async () => {
      console.log(`${i}: ${realWorldAPIs[apiIndex].name} - v${realWorldAPIs[apiIndex].version}`)
      const flattenedParams = await flattenApi(realWorldAPIs[apiIndex++], 1)
      if (flattenedParams.length > 0) {
        flattenedParams.forEach((param: any) => {
          expect(at(param, [param['x-swagger-schema-flattener'].realPath])[0]).toBeDefined()
        })
      }
    })
  }
})

/**
 * Downloads an API definition, dereferences it, then tries to flatten params.
 * Automatically retries if the download fails.
 */
function flattenApi(api: any, attemptNumber: number) {
  attemptNumber = attemptNumber || 1

  return SwaggerParser.dereference(api.swaggerYamlUrl)
    .then((spec: any) => {
      if (spec.swagger && spec.swagger.indexOf('2') > -1) {
        if (Object.keys(spec.paths).length > 0) {
          const firstPath = Object.entries(spec.paths)[0][1] as any
          const method = Object.values(firstPath)[0] as any
          return flattenParamSchema(method.parameters as ParameterObject[])
        }
      }
      // Doesn't have any paths!
      console.log('Skipping spec, not 2.0 or no paths to parse!')
      return null
    })
    .catch((error: any) => {
      let knownError = findKnownApiError(api, error) as any

      if (!knownError) {
        console.error('\n\nERROR IN THIS API:', JSON.stringify(api, null, 2))
        throw error
      }

      if (knownError.whatToDo === 'ignore') {
        // Ignore the error. It's a known problem with this API
        return null
      }

      if (knownError.whatToDo === 'retry') {
        if (attemptNumber >= MAX_DOWNLOAD_RETRIES) {
          console.error('        failed to download.  giving up.')
          return null
        } else {
          // Wait a few seconds, then try the download again
          return new Promise(resolve => {
            console.error('        failed to download.  trying again...')
            setTimeout(resolve, 2000)
          }).then(() => {
            return flattenApi(api, attemptNumber + 1)
          })
        }
      }
    })
}

/**
 * Determines whether an API and error match a known error.
 */
function findKnownApiError(api: any, error: any) {
  return knownApiErrors.find((el: any) => {
    if (typeof el.api === 'string' && api.name.indexOf(el.api) === -1) {
      return el
    }

    if (typeof el.error === 'string' && error.message.indexOf(el.error) === -1) {
      return el
    }

    if (el.error instanceof RegExp && !el.error.test(error.message)) {
      return el
    }
  })
}

/**
 * Returns a list of known validation errors in certain API definitions on APIs.guru.
 */
function getKnownApiErrors(): any[] {
  var knownErrors = [
    // If the API definition failed to download, then retry
    {
      error: /Error downloading https?:.*swagger\.yaml/,
      whatToDo: 'retry'
    },
    {
      error: 'socket hang up',
      whatToDo: 'retry'
    },
    // Many Azure API definitions erroneously reference external files that don't exist
    {
      api: 'azure.com',
      error: /Error downloading .*\.json\s+HTTP ERROR 404/,
      whatToDo: 'ignore'
    },
    // Many Azure API definitions have endpoints with multiple "location" placeholders, which is invalid
    {
      api: 'azure.com',
      error: 'has multiple path placeholders named {location}',
      whatToDo: 'ignore'
    },
    // Stoplight.io's API definition uses multi-type schemas, which isn't allowed by Swagger 2.0
    {
      api: 'stoplight.io',
      error: 'invalid response schema type (object,string)',
      whatToDo: 'ignore'
    },
    // VersionEye's API definition is missing MIME types
    {
      api: 'versioneye.com',
      error:
        'has a file parameter, so it must consume multipart/form-data or application/x-www-form-urlencoded',
      whatToDo: 'ignore'
    },
    {
      api: 'amazonaws.com',
      error: "Object didn't pass validation for format regex",
      whatToDo: 'ignore'
    }
  ]

  return knownErrors
}
