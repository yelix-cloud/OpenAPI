import { EndpointBuilder } from "./EndpointBuilder.ts";
import { 
  DescribeValidationType, 
  OpenAPIDoc, 
  OpenAPIParams,
  OpenAPISchema,
  OpenAPIReference,
  OpenAPIResponse,
  OpenAPIParameter,
  OpenAPIExample,
  OpenAPIRequestBody,
  OpenAPIHeader,
  OpenAPISecurityScheme,
  OpenAPILink,
  OpenAPICallback,
  OpenAPIPathItem,
  OpenAPIComponents
} from './OpenAPI.types.ts';
import { stringify } from 'jsr:@eemeli/yaml';

class OpenAPI {
  readonly _openAPI: OpenAPIDoc;
  private describeValidation: Record<string, DescribeValidationType> = {};

  constructor(config: OpenAPIParams) {
    this._openAPI = {
      openapi: '3.1.0',
      info: {
        title: config.title,
        version: config.version,
        description: config.description || 'OpenAPI API Documentation',
      },
      paths: {},
      servers: config.servers || [],
      components: {} // Initialize empty components object
    };
  }

  getJSON(): OpenAPIDoc {
    return this._openAPI;
  }

  getJSONString(): string {
    return JSON.stringify(this._openAPI, null, 2);
  }

  getYAMLString(): string {
    return stringify(this._openAPI);
  }

  describeValidationRule(kind: string, fn: DescribeValidationType): boolean {
    let isOverriding = false;

    if (this.describeValidation[kind]) {
      isOverriding = true;
    }

    this.describeValidation[kind] = fn;
    return isOverriding;
  }

  getValidationRuleDescription(kind: string): DescribeValidationType | undefined {
    return this.describeValidation[kind];
  }

  addNewEndpoint_(path: string, endpoint: EndpointBuilder) {
    const json = endpoint.getEndpoint();
    this._openAPI.paths![path] = json;
    return this;
  }

  /**
   * Ensures the components section exists in the OpenAPI document
   * @private
   */
  private ensureComponents(): OpenAPIComponents {
    if (!this._openAPI.components) {
      this._openAPI.components = {};
    }
    return this._openAPI.components;
  }

  /**
   * Adds a schema to the components section
   * 
   * @param name - The name to use for this schema
   * @param schema - The schema definition
   * @returns The reference object that can be used in other parts of the API
   */
  addSchema(name: string, schema: OpenAPISchema): OpenAPIReference {
    const components = this.ensureComponents();
    if (!components.schemas) {
      components.schemas = {};
    }
    components.schemas[name] = schema;
    return { $ref: `#/components/schemas/${name}` };
  }

  /**
   * Adds a response to the components section
   * 
   * @param name - The name to use for this response
   * @param response - The response definition
   * @returns The reference object that can be used in other parts of the API
   */
  addResponse(name: string, response: OpenAPIResponse): OpenAPIReference {
    const components = this.ensureComponents();
    if (!components.responses) {
      components.responses = {};
    }
    components.responses[name] = response;
    return { $ref: `#/components/responses/${name}` };
  }

  /**
   * Adds a parameter to the components section
   * 
   * @param name - The name to use for this parameter
   * @param parameter - The parameter definition
   * @returns The reference object that can be used in other parts of the API
   */
  addParameter(name: string, parameter: OpenAPIParameter): OpenAPIReference {
    const components = this.ensureComponents();
    if (!components.parameters) {
      components.parameters = {};
    }
    components.parameters[name] = parameter;
    return { $ref: `#/components/parameters/${name}` };
  }

  /**
   * Adds an example to the components section
   * 
   * @param name - The name to use for this example
   * @param example - The example definition
   * @returns The reference object that can be used in other parts of the API
   */
  addExample(name: string, example: OpenAPIExample): OpenAPIReference {
    const components = this.ensureComponents();
    if (!components.examples) {
      components.examples = {};
    }
    components.examples[name] = example;
    return { $ref: `#/components/examples/${name}` };
  }

  /**
   * Adds a request body to the components section
   * 
   * @param name - The name to use for this request body
   * @param requestBody - The request body definition
   * @returns The reference object that can be used in other parts of the API
   */
  addRequestBody(name: string, requestBody: OpenAPIRequestBody): OpenAPIReference {
    const components = this.ensureComponents();
    if (!components.requestBodies) {
      components.requestBodies = {};
    }
    // @ts-ignore - The type definitions don't match up perfectly, but this should work
    components.requestBodies[name] = requestBody;
    return { $ref: `#/components/requestBodies/${name}` };
  }

  /**
   * Adds a header to the components section
   * 
   * @param name - The name to use for this header
   * @param header - The header definition
   * @returns The reference object that can be used in other parts of the API
   */
  addHeader(name: string, header: OpenAPIHeader): OpenAPIReference {
    const components = this.ensureComponents();
    if (!components.headers) {
      components.headers = {};
    }
    components.headers[name] = header;
    return { $ref: `#/components/headers/${name}` };
  }

  /**
   * Adds a security scheme to the components section
   * 
   * @param name - The name to use for this security scheme
   * @param securityScheme - The security scheme definition
   * @returns The reference object that can be used in other parts of the API
   */
  addSecurityScheme(name: string, securityScheme: OpenAPISecurityScheme): OpenAPIReference {
    const components = this.ensureComponents();
    if (!components.securitySchemes) {
      components.securitySchemes = {};
    }
    components.securitySchemes[name] = securityScheme;
    return { $ref: `#/components/securitySchemes/${name}` };
  }

  /**
   * Adds a link to the components section
   * 
   * @param name - The name to use for this link
   * @param link - The link definition
   * @returns The reference object that can be used in other parts of the API
   */
  addLink(name: string, link: OpenAPILink): OpenAPIReference {
    const components = this.ensureComponents();
    if (!components.links) {
      components.links = {};
    }
    components.links[name] = link;
    return { $ref: `#/components/links/${name}` };
  }

  /**
   * Adds a callback to the components section
   * 
   * @param name - The name to use for this callback
   * @param callback - The callback definition
   * @returns The reference object that can be used in other parts of the API
   */
  addCallback(name: string, callback: OpenAPICallback): OpenAPIReference {
    const components = this.ensureComponents();
    if (!components.callbacks) {
      components.callbacks = {};
    }
    components.callbacks[name] = callback;
    return { $ref: `#/components/callbacks/${name}` };
  }

  /**
   * Adds a path item to the components section
   * 
   * @param name - The name to use for this path item
   * @param pathItem - The path item definition
   * @returns The reference object that can be used in other parts of the API
   */
  addPathItem(name: string, pathItem: OpenAPIPathItem): OpenAPIReference {
    const components = this.ensureComponents();
    if (!components.pathItems) {
      components.pathItems = {};
    }
    components.pathItems[name] = pathItem;
    return { $ref: `#/components/pathItems/${name}` };
  }

  /**
   * Gets a component by its reference string
   * Example: getComponentByRef('#/components/schemas/User')
   * 
   * @param ref - The reference string
   * @returns The component or undefined if not found
   */
  getComponentByRef(ref: string): unknown {
    if (!ref.startsWith('#/components/')) {
      return undefined;
    }

    const path = ref.substring(1).split('/');
    let current: any = this._openAPI;
    
    for (const segment of path) {
      if (!current[segment]) {
        return undefined;
      }
      current = current[segment];
    }
    
    return current;
  }
}

export { OpenAPI };