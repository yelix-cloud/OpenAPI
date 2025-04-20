import type { EndpointBuilder } from "./EndpointBuilder.ts";
import type {
  DescribeValidationType,
  OpenAPICallback,
  OpenAPIComponents,
  OpenAPIDoc,
  OpenAPIExample,
  OpenAPIHeader,
  OpenAPILink,
  OpenAPIOAuthFlows,
  OpenAPIParameter,
  OpenAPIParams,
  OpenAPIPathItem,
  OpenAPIReference,
  OpenAPIRequestBody,
  OpenAPIResponse,
  OpenAPISchema,
  OpenAPISecurityScheme,
  SecurityRequirement,
} from "./OpenAPI.types.ts";
import { stringify } from "jsr:@eemeli/yaml";

class OpenAPI {
  readonly _openAPI: OpenAPIDoc;
  private describeValidation: Record<string, DescribeValidationType> = {};

  constructor(config: OpenAPIParams) {
    this._openAPI = {
      openapi: "3.1.0",
      info: {
        title: config.title,
        version: config.version,
        description: config.description || "OpenAPI API Documentation",
      },
      paths: {},
      servers: config.servers || [],
      components: {}, // Initialize empty components object
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

  getValidationRuleDescription(
    kind: string,
  ): DescribeValidationType | undefined {
    return this.describeValidation[kind];
  }

  addNewEndpoint_(path: string, endpoint: EndpointBuilder): this {
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
  addRequestBody(
    name: string,
    requestBody: OpenAPIRequestBody,
  ): OpenAPIReference {
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
  addSecurityScheme(
    name: string,
    securityScheme: OpenAPISecurityScheme,
  ): OpenAPIReference {
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
   * Adds a global security requirement to the API.
   * This defines the security requirement that applies to all operations.
   *
   * @param securityRequirement - The security requirement to add
   * @returns this OpenAPI instance for chaining
   */
  addGlobalSecurity(securityRequirement: SecurityRequirement): this {
    if (!this._openAPI.security) {
      this._openAPI.security = [];
    }
    this._openAPI.security.push(securityRequirement);
    return this;
  }

  /**
   * Sets the global security requirements for the API.
   * This replaces any existing security requirements.
   *
   * @param securityRequirements - Array of security requirements
   * @returns this OpenAPI instance for chaining
   */
  setGlobalSecurity(securityRequirements: SecurityRequirement[]): this {
    this._openAPI.security = securityRequirements;
    return this;
  }

  /**
   * Adds an API Key security scheme
   *
   * @param name - The name to use for this security scheme
   * @param options - Configuration options for the API Key
   * @returns The reference object that can be used in other parts of the API
   */
  addApiKeySecurity(name: string, options: {
    in: "query" | "header" | "cookie";
    parameterName: string;
    description?: string;
  }): OpenAPIReference {
    return this.addSecurityScheme(name, {
      type: "apiKey",
      in: options.in,
      name: options.parameterName,
      description: options.description,
    });
  }

  /**
   * Adds HTTP authentication security scheme
   *
   * @param name - The name to use for this security scheme
   * @param scheme - The HTTP authentication scheme (e.g., 'basic', 'bearer', 'digest')
   * @param options - Additional options like bearerFormat and description
   * @returns The reference object that can be used in other parts of the API
   */
  addHttpSecurity(name: string, scheme: string, options?: {
    bearerFormat?: string;
    description?: string;
  }): OpenAPIReference {
    return this.addSecurityScheme(name, {
      type: "http",
      scheme: scheme,
      bearerFormat: options?.bearerFormat,
      description: options?.description,
    });
  }

  /**
   * Adds OAuth2 security scheme
   *
   * @param name - The name to use for this security scheme
   * @param flows - The OAuth2 flows configuration
   * @param description - Optional description for this security scheme
   * @returns The reference object that can be used in other parts of the API
   */
  addOAuth2Security(
    name: string,
    flows: OpenAPIOAuthFlows,
    description?: string,
  ): OpenAPIReference {
    return this.addSecurityScheme(name, {
      type: "oauth2",
      flows,
      description,
    });
  }

  /**
   * Adds OpenID Connect security scheme
   *
   * @param name - The name to use for this security scheme
   * @param openIdConnectUrl - OpenId Connect URL to discover OAuth2 configuration values
   * @param description - Optional description for this security scheme
   * @returns The reference object that can be used in other parts of the API
   */
  addOpenIdConnectSecurity(
    name: string,
    openIdConnectUrl: string,
    description?: string,
  ): OpenAPIReference {
    return this.addSecurityScheme(name, {
      type: "openIdConnect",
      openIdConnectUrl,
      description,
    });
  }

  /**
   * Adds Mutual TLS security scheme
   *
   * @param name - The name to use for this security scheme
   * @param description - Optional description for this security scheme
   * @returns The reference object that can be used in other parts of the API
   */
  addMutualTlsSecurity(name: string, description?: string): OpenAPIReference {
    return this.addSecurityScheme(name, {
      type: "mutualTLS",
      description,
    });
  }

  /**
   * Creates a security requirement object that can be used with addGlobalSecurity
   * or with specific operations
   *
   * @param schemeName - The name of the security scheme
   * @param scopes - Optional array of scopes (required for OAuth2)
   * @returns A security requirement object
   */
  createSecurityRequirement(
    schemeName: string,
    scopes: string[] = [],
  ): SecurityRequirement {
    const requirement: SecurityRequirement = {};
    requirement[schemeName] = scopes;
    return requirement;
  }

  /**
   * Gets a component by its reference string
   * Example: getComponentByRef('#/components/schemas/User')
   *
   * @param ref - The reference string
   * @returns The component or undefined if not found
   */
  getComponentByRef(ref: string): unknown {
    if (!ref.startsWith("#/components/")) {
      return undefined;
    }

    const path = ref.substring(1).split("/");
    // deno-lint-ignore no-explicit-any
    let current: Record<string, any> = this._openAPI as any;

    for (const segment of path) {
      if (!current || typeof current !== "object" || !(segment in current)) {
        return undefined;
      }
      current = current[segment];
    }

    return current;
  }
}

export { OpenAPI };
