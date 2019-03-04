Tiny package to help deal with parsing dereferenced Swagger 2.0 / OpenApi 3.0 parameter objects into easier formats. Currently **only** tested with specs that are dereferenced by [`swagger-parser`](https://github.com/APIDevTools/swagger-parser).

## Features:

- `flattenParamSchema`: Converts a parameter schema to an flattened array of valid parameter objects. Includes a stringified object path inside each param using the `x-swagger-param-flattener` key.

## Usage

```js
import SwaggerParser from 'swagger-parser'
import flattenParamSchema from 'swagger-param-flattener'

SwaggerParser.dereference('https://petstore.swagger.io/v2/swagger.json').then(spec => {
    const path = Object.entries(spec.paths)[0]
    const method = Object.entries(method)[0]
    console.log(flattenParamSchema(method.parameters))
})
```

## Development

#### Dependencies:
1. Node 9.8.0

##### `yarn start`

- Runs `tsc` in watch mode, picking up new changes.

##### `yarn prettier-watch`

- Runs `prettier` in watch mode, which automatically formats your code.
