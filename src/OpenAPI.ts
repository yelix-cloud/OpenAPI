import type { EndpointBuilder } from "./EndpointBuilder.ts";
import type {
  DescribeValidationType,
  JSONSchemaDialect,
  JSONSchemaVocabulary,
  OpenAPICallback,
  OpenAPIComponents,
  OpenAPIDoc,
  OpenAPIExample,
  OpenAPIExternalDocs,
  OpenAPIHeader,
  OpenAPILink,
  OpenAPIOAuthFlows,
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPIParams,
  OpenAPIPathItem,
  OpenAPIReference,
  OpenAPIRequestBody,
  OpenAPIResponse,
  OpenAPISchema,
  OpenAPISecurityScheme,
  OpenAPITag,
  SecurityRequirement,
  WebhookOptions,
} from "./OpenAPI.types.ts";
import { stringify } from "jsr:@eemeli/yaml@2.7.1";

// Commonly used JSON Schema dialects
const SCHEMA_DIALECTS = {
  // Default for OpenAPI 3.1
  DRAFT_2020_12: "https://json-schema.org/draft/2020-12/schema" as const,
  DRAFT_2019_09: "https://json-schema.org/draft/2019-09/schema" as const,
  DRAFT_07: "https://json-schema.org/draft/07/schema" as const,
  DRAFT_06: "https://json-schema.org/draft-06/schema#" as const,
  DRAFT_04: "https://json-schema.org/draft-04/schema#" as const,
};

class OpenAPI {
  readonly _openAPI: OpenAPIDoc;
  private describeValidation: Record<string, DescribeValidationType> = {};
  private schemaVocabularies: Record<string, JSONSchemaVocabulary> = {};

  constructor(config: OpenAPIParams) {
    this._openAPI = {
      openapi: "3.1.0",
      info: {
        title: config.title,
        version: config.version,
        description: config.description || "OpenAPI API Documentation",
      },
      // Default to JSON Schema 2020-12 dialect for OpenAPI 3.1
      jsonSchemaDialect: SCHEMA_DIALECTS.DRAFT_2020_12,
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
   * @param dialect - Optional JSON Schema dialect to use for this schema
   * @returns The reference object that can be used in other parts of the API
   */
  addSchema(
    name: string,
    schema: Partial<OpenAPISchema>,
    dialect?: JSONSchemaDialect,
  ): OpenAPIReference {
    const components = this.ensureComponents();
    if (!components.schemas) {
      components.schemas = {};
    }

    // Only add $schema if explicitly provided or different from document default
    const finalSchema: OpenAPISchema = {
      ...schema,
    };

    if (dialect) {
      finalSchema.$schema = dialect;
    }

    components.schemas[name] = finalSchema;
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

    const parts = ref.substring(2).split("/");
    if (parts.length !== 3) {
      return undefined;
    }

    // parts[0] should be "components"
    // parts[1] should be the component type (e.g., "securitySchemes")
    // parts[2] should be the component name (e.g., "ApiKey")

    const componentType = parts[1] as keyof OpenAPIComponents;
    const componentName = parts[2];

    // Check if components exists
    if (!this._openAPI.components) {
      return undefined;
    }

    // Check if the specific component collection exists
    const collection = this._openAPI.components[componentType];
    if (!collection) {
      return undefined;
    }

    // Return the component from the collection if it exists
    return (collection as Record<string, unknown>)[componentName];
  }

  /**
   * Adds a tag to the OpenAPI specification.
   *
   * @param name - The name of the tag
   * @param description - Optional description of what the tag is for
   * @param externalDocs - Optional external documentation for this tag
   * @returns This OpenAPI instance for chaining
   */
  addTag(
    name: string,
    description?: string,
    externalDocs?: OpenAPIExternalDocs,
  ): this {
    if (!this._openAPI.tags) {
      this._openAPI.tags = [];
    }

    // Check if tag already exists to avoid duplicates
    const existingTag = this._openAPI.tags.find((tag) => tag.name === name);
    if (!existingTag) {
      const tag: OpenAPITag = { name };

      if (description) {
        tag.description = description;
      }

      if (externalDocs) {
        tag.externalDocs = externalDocs;
      }

      this._openAPI.tags.push(tag);
    }

    return this;
  }

  /**
   * Gets all tags defined in the OpenAPI specification.
   *
   * @returns Array of tag objects
   */
  getTags(): OpenAPITag[] {
    return this._openAPI.tags || [];
  }

  /**
   * Gets a tag by name
   *
   * @param name - The name of the tag to find
   * @returns The tag object if found, or undefined
   */
  getTagByName(name: string): OpenAPITag | undefined {
    return this._openAPI.tags?.find((tag) => tag.name === name);
  }

  /**
   * Updates an existing tag in the OpenAPI specification.
   *
   * @param name - The name of the tag to update
   * @param description - New description for the tag
   * @param externalDocs - New external documentation for the tag
   * @returns boolean indicating if the tag was successfully updated
   */
  updateTag(
    name: string,
    description?: string,
    externalDocs?: OpenAPIExternalDocs,
  ): boolean {
    if (!this._openAPI.tags) {
      return false;
    }

    const tagIndex = this._openAPI.tags.findIndex((tag) => tag.name === name);
    if (tagIndex === -1) {
      return false;
    }

    const tag = this._openAPI.tags[tagIndex];

    if (description !== undefined) {
      tag.description = description;
    }

    if (externalDocs !== undefined) {
      tag.externalDocs = externalDocs;
    }

    return true;
  }

  /**
   * Removes a tag from the OpenAPI specification.
   * Note: This doesn't update operations that might be using this tag.
   *
   * @param name - The name of the tag to remove
   * @returns boolean indicating if the tag was successfully removed
   */
  removeTag(name: string): boolean {
    if (!this._openAPI.tags) {
      return false;
    }

    const initialLength = this._openAPI.tags.length;
    this._openAPI.tags = this._openAPI.tags.filter((tag) => tag.name !== name);

    return initialLength > this._openAPI.tags.length;
  }

  /**
   * Add external documentation for a tag
   *
   * @param tagName - The name of the tag to add documentation to
   * @param url - Required URL for the external documentation
   * @param description - Optional description of the documentation
   * @returns boolean indicating if the documentation was added successfully
   */
  addTagExternalDocs(
    tagName: string,
    url: string,
    description?: string,
  ): boolean {
    if (!this._openAPI.tags) {
      return false;
    }

    const tag = this._openAPI.tags.find((t) => t.name === tagName);
    if (!tag) {
      return false;
    }

    tag.externalDocs = { url };
    if (description) {
      tag.externalDocs.description = description;
    }

    return true;
  }

  /**
   * Creates external documentation object that can be used with tags
   * or other OpenAPI elements
   *
   * @param url - The URL for the external documentation
   * @param description - Optional description of the documentation
   * @returns An OpenAPIExternalDocs object
   */
  createExternalDocs(url: string, description?: string): OpenAPIExternalDocs {
    const docs: OpenAPIExternalDocs = { url };
    if (description) {
      docs.description = description;
    }
    return docs;
  }

  /**
   * Adds a webhook to the OpenAPI document
   *
   * @param name - The name to use for this webhook (used as the key in webhooks object)
   * @param pathItem - The webhook path item definition or a reference
   * @returns This OpenAPI instance for chaining
   */
  addWebhook(name: string, pathItem: OpenAPIPathItem | OpenAPIReference): this {
    if (!this._openAPI.webhooks) {
      this._openAPI.webhooks = {};
    }
    this._openAPI.webhooks[name] = pathItem;
    return this;
  }

  /**
   * Creates a webhook and adds it to the OpenAPI document
   *
   * @param name - The name to use for this webhook (used as the key in webhooks object)
   * @param options - Configuration options for the webhook
   * @returns This OpenAPI instance for chaining
   */
  createWebhook(name: string, options: WebhookOptions): this {
    const pathItem: OpenAPIPathItem = {};

    if (options.summary) {
      pathItem.summary = options.summary;
    }

    if (options.description) {
      pathItem.description = options.description;
    }

    if (options.servers) {
      pathItem.servers = options.servers;
    }

    if (options.parameters) {
      pathItem.parameters = options.parameters;
    }

    // Add the operations to the path item
    if (options.operations) {
      for (const [method, operation] of Object.entries(options.operations)) {
        // Validate that the method is a valid HTTP method
        if (
          ["get", "post", "put", "delete", "options", "head", "patch", "trace"]
            .includes(method)
        ) {
          pathItem[
            method as keyof Pick<
              OpenAPIPathItem,
              | "get"
              | "post"
              | "put"
              | "delete"
              | "options"
              | "head"
              | "patch"
              | "trace"
            >
          ] = operation;
        }
      }
    }

    return this.addWebhook(name, pathItem);
  }

  /**
   * Gets all webhooks defined in the OpenAPI document
   *
   * @returns Record of webhook names to path items or references
   */
  getWebhooks():
    | Record<string, OpenAPIPathItem | OpenAPIReference>
    | undefined {
    return this._openAPI.webhooks;
  }

  /**
   * Gets a specific webhook by name
   *
   * @param name - The name of the webhook to retrieve
   * @returns The webhook path item or reference, or undefined if not found
   */
  getWebhookByName(
    name: string,
  ): OpenAPIPathItem | OpenAPIReference | undefined {
    return this._openAPI.webhooks?.[name];
  }

  /**
   * Updates an existing webhook in the OpenAPI document
   *
   * @param name - The name of the webhook to update
   * @param pathItem - The new webhook path item or reference
   * @returns boolean indicating if the webhook was successfully updated
   */
  updateWebhook(
    name: string,
    pathItem: OpenAPIPathItem | OpenAPIReference,
  ): boolean {
    if (!this._openAPI.webhooks || !this._openAPI.webhooks[name]) {
      return false;
    }

    this._openAPI.webhooks[name] = pathItem;
    return true;
  }

  /**
   * Removes a webhook from the OpenAPI document
   *
   * @param name - The name of the webhook to remove
   * @returns boolean indicating if the webhook was successfully removed
   */
  removeWebhook(name: string): boolean {
    if (!this._openAPI.webhooks || !this._openAPI.webhooks[name]) {
      return false;
    }

    delete this._openAPI.webhooks[name];
    return true;
  }

  /**
   * Adds a webhook operation for a specific HTTP method
   *
   * @param webhookName - The name of the webhook
   * @param method - The HTTP method for this operation
   * @param operation - The operation definition
   * @returns boolean indicating if the operation was successfully added
   */
  addWebhookOperation(
    webhookName: string,
    method:
      | "get"
      | "post"
      | "put"
      | "delete"
      | "options"
      | "head"
      | "patch"
      | "trace",
    operation: OpenAPIOperation,
  ): boolean {
    if (!this._openAPI.webhooks) {
      this._openAPI.webhooks = {};
    }

    // Check if the webhook exists
    if (!this._openAPI.webhooks[webhookName]) {
      return false; // Return false if webhook doesn't exist
    }

    const webhook = this._openAPI.webhooks[webhookName];

    // If it's a reference, we can't add operations to it
    if ("$ref" in webhook) {
      return false;
    }

    // Add the operation to the webhook
    webhook[method] = operation;
    return true;
  }

  /**
   * Creates a reference to a webhook in the components section
   *
   * @param name - The name of the webhook in components to reference
   * @returns A reference object pointing to the webhook
   */
  createWebhookReference(name: string): OpenAPIReference {
    return { $ref: `#/components/webhooks/${name}` };
  }

  /**
   * Adds a reusable webhook to the components section
   *
   * @param name - The name to use for this webhook in the components section
   * @param pathItem - The webhook path item definition
   * @returns A reference object that can be used with addWebhook
   */
  addComponentWebhook(
    name: string,
    pathItem: OpenAPIPathItem,
  ): OpenAPIReference {
    const components = this.ensureComponents();

    if (!components.webhooks) {
      components.webhooks = {};
    }

    components.webhooks[name] = pathItem;
    return this.createWebhookReference(name);
  }

  /**
   * Sets the default JSON Schema dialect for the OpenAPI document.
   * This defines which JSON Schema version should be used by default.
   *
   * @param dialect - The JSON Schema dialect URI, use SCHEMA_DIALECTS constants for convenience
   * @returns This OpenAPI instance for chaining
   */
  setJSONSchemaDialect(dialect: JSONSchemaDialect): this {
    this._openAPI.jsonSchemaDialect = dialect;
    return this;
  }

  /**
   * Gets the current JSON Schema dialect set for the OpenAPI document.
   *
   * @returns The JSON Schema dialect URI
   */
  getJSONSchemaDialect(): JSONSchemaDialect {
    return this._openAPI.jsonSchemaDialect || SCHEMA_DIALECTS.DRAFT_2020_12;
  }

  /**
   * Registers a JSON Schema vocabulary with documentation
   *
   * @param uri - The URI identifying the vocabulary
   * @param description - Optional description of the vocabulary
   * @returns This OpenAPI instance for chaining
   */
  registerVocabulary(uri: string, description?: string): this {
    this.schemaVocabularies[uri] = {
      uri,
      description,
    };
    return this;
  }

  /**
   * Creates a schema with a specific JSON Schema dialect
   *
   * @param schema - The schema definition
   * @param dialect - Optional JSON Schema dialect to use for this schema
   * @returns The schema with $schema property set
   */
  createSchema(
    schema: Partial<OpenAPISchema>,
    dialect?: JSONSchemaDialect,
  ): OpenAPISchema {
    return {
      ...schema,
      $schema: dialect || this.getJSONSchemaDialect(),
    };
  }

  /**
   * Creates a schema with specific vocabularies enabled
   *
   * @param schema - The schema definition
   * @param vocabularies - Record of vocabulary URIs and boolean indicating if they're required
   * @returns The schema with $vocabulary property set
   */
  createSchemaWithVocabularies(
    schema: Partial<OpenAPISchema>,
    vocabularies: Record<string, boolean>,
  ): OpenAPISchema {
    return {
      ...schema,
      $vocabulary: vocabularies,
    };
  }

  /**
   * Gets constants for commonly used JSON Schema dialects
   *
   * @returns Object containing common JSON Schema dialect URIs
   */
  static get SCHEMA_DIALECTS(): Record<string, JSONSchemaDialect> {
    return SCHEMA_DIALECTS;
  }
}

export { OpenAPI, SCHEMA_DIALECTS };
