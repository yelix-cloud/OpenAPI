import {
  LowercasedOpenAPIMethods,
  OpenAPIOperation,
  OpenAPIPathItem,
  OpenAPIParameter,
  OpenAPIParameterLocation,
  OpenAPIDefaultSchema,
  OpenAPIResponse,
  OpenAPIMediaType,
  OpenAPIRequestBodyNonDocumented,
  OpenAPIExtenedRequestBodySchema,
  OpenAPIProperty,
  OpenAPICallback,
  OpenAPILink,
  SecurityRequirement,
  OpenAPIExampleMap,
  OpenAPIExample,  // Make sure this is imported
} from './OpenAPI.types.ts';

class EndpointBuilder {
  private raw: OpenAPIPathItem;
  private method: LowercasedOpenAPIMethods;
  private insideMethod: OpenAPIOperation;

  constructor(params: {
    method: LowercasedOpenAPIMethods;
    title: string;
  }) {
    this.insideMethod = {
      summary: params.title,
      description: params.title,
      parameters: [],
      requestBody: {},
      responses: {},
    };

    this.raw = {
      [params.method]: this.insideMethod,
    };
    this.method = params.method;
  }

  getEndpoint(): OpenAPIPathItem {
    const assigned = this.raw;
    assigned[this.method] = this.insideMethod;
    return assigned;
  }

  setTags(tags: string[]) {
    this.insideMethod.tags = tags;
    return this;
  }

  addTag(tag: string) {
    if (!this.insideMethod.tags) {
      this.insideMethod.tags = [];
    }
    this.insideMethod.tags.push(tag);
    return this;
  }

  addTags(tags: string[]) {
    if (!this.insideMethod.tags) {
      this.insideMethod.tags = [];
    }
    this.insideMethod.tags.push(...tags);
    return this;
  }

  /**
   * Sets the operation ID for the endpoint
   * @param operationId Unique string used to identify the operation
   */
  setOperationId(operationId: string) {
    this.insideMethod.operationId = operationId;
    return this;
  }
  
  /**
   * Sets the description for the endpoint
   * @param description Detailed explanation of the endpoint
   */
  setDescription(description: string) {
    this.insideMethod.description = description;
    return this;
  }
  
  /**
   * Sets the summary for the endpoint
   * @param summary Short summary of what the endpoint does
   */
  setSummary(summary: string) {
    this.insideMethod.summary = summary;
    return this;
  }
  
  /**
   * Marks the endpoint as deprecated
   * @param isDeprecated Whether the endpoint is deprecated (defaults to true)
   */
  setDeprecated(isDeprecated = true) {
    this.insideMethod.deprecated = isDeprecated;
    return this;
  }
  
  /**
   * Adds external documentation to the endpoint
   * @param url URL for the external documentation
   * @param description Optional description of the documentation
   */
  setExternalDocs(url: string, description?: string) {
    this.insideMethod.externalDocs = {
      url,
      description,
    };
    return this;
  }

  /**
   * Adds a parameter to the endpoint
   * @param param Parameter configuration
   */
  addParameter(param: {
    name: string;
    in: OpenAPIParameterLocation;
    description?: string;
    required?: boolean;
    schema?: OpenAPIDefaultSchema;
  }) {
    if (!this.insideMethod.parameters) {
      this.insideMethod.parameters = [];
    }
    
    const parameter: OpenAPIParameter = {
      name: param.name,
      in: param.in,
      description: param.description,
      required: param.in === 'path' ? true : param.required ?? false,
      schema: param.schema,
    };
    
    this.insideMethod.parameters.push(parameter);
    return this;
  }
  
  /**
   * Adds a path parameter to the endpoint
   * @param name Parameter name
   * @param schema Parameter schema
   * @param description Parameter description
   */
  addPathParameter(name: string, schema?: OpenAPIDefaultSchema, description?: string) {
    return this.addParameter({
      name,
      in: 'path',
      description,
      required: true, // Path parameters are always required
      schema: schema || { type: 'string' },
    });
  }
  
  /**
   * Adds a query parameter to the endpoint
   * @param name Parameter name
   * @param schema Parameter schema
   * @param description Parameter description
   * @param required Whether the parameter is required
   */
  addQueryParameter(
    name: string, 
    schema?: OpenAPIDefaultSchema, 
    description?: string,
    required = false
  ) {
    return this.addParameter({
      name,
      in: 'query',
      description,
      required,
      schema: schema || { type: 'string' },
    });
  }
  
  /**
   * Adds a header parameter to the endpoint
   * @param name Header name
   * @param schema Parameter schema
   * @param description Parameter description
   * @param required Whether the header is required
   */
  addHeaderParameter(
    name: string, 
    schema?: OpenAPIDefaultSchema, 
    description?: string,
    required = false
  ) {
    return this.addParameter({
      name,
      in: 'header',
      description,
      required,
      schema: schema || { type: 'string' },
    });
  }
  
  /**
   * Adds a cookie parameter to the endpoint
   * @param name Cookie name
   * @param schema Parameter schema
   * @param description Parameter description
   * @param required Whether the cookie is required
   */
  addCookieParameter(
    name: string, 
    schema?: OpenAPIDefaultSchema, 
    description?: string,
    required = false
  ) {
    return this.addParameter({
      name,
      in: 'cookie',
      description,
      required,
      schema: schema || { type: 'string' },
    });
  }

  /**
   * Sets the request body for the endpoint
   * @param config Request body configuration
   */
  setRequestBody(config: {
    contentType?: string;
    schema: OpenAPIDefaultSchema;
    required?: boolean;
    description?: string;
  }) {
    const contentType = config.contentType || 'application/json';
    
    const requestBody: OpenAPIRequestBodyNonDocumented = {
      required: config.required ?? false,
      content: {
        [contentType]: {
          schema: config.schema as OpenAPIProperty,
        } as OpenAPIExtenedRequestBodySchema,
      },
    };
    
    // In OpenAPI.types.ts, description is not part of OpenAPIRequestBodyNonDocumented
    // so we need to handle it differently or update the type definition
    this.insideMethod.requestBody = requestBody;
    return this;
  }

  /**
   * Adds a response to the endpoint
   * @param statusCode HTTP status code
   * @param config Response configuration
   */
  addResponse(
    statusCode: string | number,
    config: {
      description: string;
      contentType?: string;
      schema?: OpenAPIDefaultSchema;
    }
  ) {
    const response: OpenAPIResponse = {
      description: config.description,
    };
    
    if (config.schema) {
      const contentType = config.contentType || 'application/json';
      response.content = {
        [contentType]: {
          schema: config.schema,
        } as OpenAPIMediaType,
      };
    }
    
    if (!this.insideMethod.responses) {
      this.insideMethod.responses = {};
    }
    
    this.insideMethod.responses[String(statusCode)] = response;
    return this;
  }
  
  /**
   * Adds a JSON response to the endpoint
   * @param statusCode HTTP status code
   * @param description Response description
   * @param schema Response schema
   */
  addJsonResponse(statusCode: string | number, description: string, schema: OpenAPIDefaultSchema) {
    return this.addResponse(statusCode, {
      description,
      contentType: 'application/json',
      schema,
    });
  }
  
  /**
   * Sets servers that are specific to this endpoint
   * @param servers Array of server objects
   */
  setServers(servers: Array<{ url: string; description?: string }>) {
    this.insideMethod.servers = servers.map(server => ({
      url: server.url,
      description: server.description,
    }));
    return this;
  }

  /**
   * Sets the security requirements for the endpoint
   * @param securityRequirements Array of security requirement objects
   */
  setSecurity(securityRequirements: SecurityRequirement[]) {
    this.insideMethod.security = securityRequirements;
    return this;
  }
  
  /**
   * Adds a security requirement to the endpoint
   * @param name Name of the security scheme
   * @param scopes OAuth scopes if applicable
   */
  addSecurityRequirement(name: string, scopes: string[] = []) {
    if (!this.insideMethod.security) {
      this.insideMethod.security = [];
    }
    
    this.insideMethod.security.push({ [name]: scopes });
    return this;
  }

  /**
   * Sets an example for a parameter
   * @param paramName Name of the parameter
   * @param example Example value or object
   */
  setParameterExample(paramName: string, example: unknown) {
    if (!this.insideMethod.parameters) {
      return this;
    }
    
    const param = this.insideMethod.parameters.find(p => 
      typeof p !== 'object' || !('$ref' in p) ? p.name === paramName : false
    ) as OpenAPIParameter | undefined;
    
    if (param) {
      param.example = example;
    }
    
    return this;
  }

  /**
   * Adds a named example for a parameter
   * @param paramName Name of the parameter
   * @param exampleName Example name
   * @param example Example configuration
   */
  addParameterNamedExample(
    paramName: string, 
    exampleName: string, 
    example: { value: unknown; summary?: string; description?: string }
  ) {
    if (!this.insideMethod.parameters) {
      return this;
    }
    
    const param = this.insideMethod.parameters.find(p => 
      typeof p !== 'object' || !('$ref' in p) ? p.name === paramName : false
    ) as OpenAPIParameter | undefined;
    
    if (param) {
      if (!param.examples) {
        param.examples = {};
      }
      
      param.examples[exampleName] = {
        value: example.value,
        summary: example.summary,
        description: example.description,
      } as OpenAPIExample;  // Type assertion to ensure it's treated as an Example
    }
    
    return this;
  }

  /**
   * Sets an example for the request body
   * @param example Example value
   * @param contentType Media type (defaults to application/json)
   */
  setRequestBodyExample(example: unknown, contentType = 'application/json') {
    if (!this.insideMethod.requestBody || !this.insideMethod.requestBody.content) {
      return this;
    }
    
    const mediaType = this.insideMethod.requestBody.content[contentType];
    if (mediaType) {
      mediaType.example = example;
    }
    
    return this;
  }

  /**
   * Adds a named example for the request body
   * @param exampleName Example name
   * @param example Example configuration
   * @param contentType Media type (defaults to application/json)
   */
  addRequestBodyNamedExample(
    exampleName: string, 
    example: { value: unknown; summary?: string; description?: string },
    contentType = 'application/json'
  ) {
    if (!this.insideMethod.requestBody || !this.insideMethod.requestBody.content) {
      return this;
    }
    
    const mediaType = this.insideMethod.requestBody.content[contentType];
    if (mediaType) {
      if (!mediaType.examples) {
        // Initialize as an empty object (not an array)
        mediaType.examples = {} as OpenAPIExampleMap;
      }
      
      // Now safely add to the examples object
      if (mediaType.examples) {
        mediaType.examples[exampleName] = {
          value: example.value,
          summary: example.summary,
          description: example.description,
        };
      }
    }
    
    return this;
  }

  /**
   * Sets an example for a response
   * @param statusCode HTTP status code
   * @param example Example value
   * @param contentType Media type (defaults to application/json)
   */
  setResponseExample(statusCode: string | number, example: unknown, contentType = 'application/json') {
    const status = String(statusCode);
    
    if (!this.insideMethod.responses || !this.insideMethod.responses[status]) {
      return this;
    }
    
    const response = this.insideMethod.responses[status] as OpenAPIResponse;
    if (response.content && response.content[contentType]) {
      response.content[contentType].example = example;
    }
    
    return this;
  }

  /**
   * Adds a named example for a response
   * @param statusCode HTTP status code
   * @param exampleName Example name
   * @param example Example configuration
   * @param contentType Media type (defaults to application/json)
   */
  addResponseNamedExample(
    statusCode: string | number,
    exampleName: string,
    example: { value: unknown; summary?: string; description?: string },
    contentType = 'application/json'
  ) {
    const status = String(statusCode);
    
    if (!this.insideMethod.responses || !this.insideMethod.responses[status]) {
      return this;
    }
    
    const response = this.insideMethod.responses[status] as OpenAPIResponse;
    if (response.content && response.content[contentType]) {
      if (!response.content[contentType].examples) {
        // Initialize as an empty object (not an array)
        response.content[contentType].examples = {} as OpenAPIExampleMap;
      }
      
      // Now safely add to the examples object
      if (response.content[contentType].examples) {
        response.content[contentType].examples[exampleName] = {
          value: example.value,
          summary: example.summary,
          description: example.description,
        };
      }
    }
    
    return this;
  }

  /**
   * Adds a callback to the endpoint
   * @param callbackName Name of the callback
   * @param expression Runtime expression that specifies the callback URL
   * @param pathItem Path item describing the callback operation
   */
  addCallback(callbackName: string, expression: string, pathItem: OpenAPIPathItem) {
    if (!this.insideMethod.callbacks) {
      this.insideMethod.callbacks = {};
    }
    
    this.insideMethod.callbacks[callbackName] = {
      [expression]: pathItem
    } as OpenAPICallback;
    
    return this;
  }

  /**
   * Adds a link to a response
   * @param statusCode HTTP status code
   * @param linkName Name of the link
   * @param linkConfig Link configuration
   */
  addResponseLink(
    statusCode: string | number,
    linkName: string,
    linkConfig: {
      operationId?: string;
      operationRef?: string;
      parameters?: Record<string, unknown>;
      description?: string;
      server?: { url: string; description?: string };
    }
  ) {
    const status = String(statusCode);
    
    if (!this.insideMethod.responses || !this.insideMethod.responses[status]) {
      return this;
    }
    
    const response = this.insideMethod.responses[status] as OpenAPIResponse;
    if (!response.links) {
      response.links = {};
    }
    
    const link: OpenAPILink = {};
    
    if (linkConfig.operationId) {
      link.operationId = linkConfig.operationId;
    } else if (linkConfig.operationRef) {
      link.operationRef = linkConfig.operationRef;
    }
    
    if (linkConfig.parameters) {
      link.parameters = linkConfig.parameters;
    }
    
    if (linkConfig.description) {
      link.description = linkConfig.description;
    }
    
    if (linkConfig.server) {
      link.server = {
        url: linkConfig.server.url,
        description: linkConfig.server.description,
      };
    }
    
    response.links[linkName] = link;
    return this;
  }

  /**
   * Adds a vendor extension to the operation
   * @param extensionName Name of the extension (must start with x-)
   * @param value Extension value
   */
  addExtension(extensionName: string, value: unknown) {
    if (!extensionName.startsWith('x-')) {
      throw new Error('Extension name must start with x-');
    }
    
    (this.insideMethod as Record<string, unknown>)[extensionName] = value;
    return this;
  }

  /**
   * Sets parameter serialization style
   * @param paramName Name of the parameter
   * @param style Serialization style
   * @param explode Whether to explode array or object values
   */
  setParameterStyle(paramName: string, style: string, explode?: boolean) {
    if (!this.insideMethod.parameters) {
      return this;
    }
    
    const param = this.insideMethod.parameters.find(p => 
      typeof p !== 'object' || !('$ref' in p) ? p.name === paramName : false
    ) as OpenAPIParameter | undefined;
    
    if (param) {
      param.style = style;
      
      if (explode !== undefined) {
        param.explode = explode;
      }
    }
    
    return this;
  }
}

export { EndpointBuilder };
