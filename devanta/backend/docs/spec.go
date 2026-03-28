package docs

import _ "embed"

// OpenAPISpec — OpenAPI 3 для Swagger UI (встраивается в бинарник).
//
//go:embed openapi.yaml
var OpenAPISpec []byte
