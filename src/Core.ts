import type {
  OpenAPICore,
  OpenAPIPathItem,
  OpenAPISecurityRequirement,
  OpenAPISecurityTypes,
  OpenAPITag,
} from './Core.types.ts';
import {
  createEndpointBuilder,
  type EndpointBuilder,
} from './EndpointBuilder.ts';
import { createEndpointPath, type EndpointPath } from './EndpointPath.ts';
import type { AllowedLicenses } from './Licenses.types.ts';

class OpenAPI {
  private raw: OpenAPICore;
  private endpoints: EndpointBuilder[];
  private debug: boolean;

  constructor({ debug = false }: { debug?: boolean } = {}) {
    this.raw = {
      openapi: '3.1.0',
      info: {
        title: 'OpenAPI 3.1.0',
        version: '1.0.0',
      },
    };
    this.endpoints = [];
    this.debug = debug;

    if (debug) {
      this.log('info', 'OpenAPI instance created with debug mode enabled');
    }
  }

  // deno-lint-ignore no-explicit-any
  private log(level: string, message: string, meta?: any): void {
    if (this.debug) {
      const timestamp = new Date().toISOString();
      const prefix = `@murat/openapi [${timestamp}] [${level.toUpperCase()}]`;

      if (meta) {
        console.log(`${prefix} ${message}`, meta);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }

  getJSON(): OpenAPICore {
    this.log('info', 'Generating OpenAPI JSON', {
      endpointCount: this.endpoints.length,
      paths: this.raw.paths ? Object.keys(this.raw.paths).length : 0,
    });

    // Create a deep copy of the raw object
    const result = JSON.parse(JSON.stringify(this.raw)) as OpenAPICore;

    // Process and group endpoints by path
    if (this.endpoints.length > 0) {
      if (!result.paths) {
        result.paths = {};
      }

      for (const endpoint of this.endpoints) {
        if (!endpoint.path || !endpoint.method) {
          this.log('error', 'Endpoint is missing path or method, skipping', endpoint);
          continue;
        }

        if (!result.paths[endpoint.path]) {
          result.paths[endpoint.path] = {} as OpenAPIPathItem;
        }

        const pathItem = result.paths[endpoint.path] as OpenAPIPathItem;
        pathItem[endpoint.method as keyof OpenAPIPathItem] =
          // deno-lint-ignore no-explicit-any
          endpoint.operation as any;
      }
    }

    return result;
  }

  // Add an array of endpoints
  addEndpoints(endpoints: EndpointBuilder[]): this {
    this.log('info', `Adding ${endpoints.length} endpoints`, { 
      endpoints: endpoints.map(e => `${e.method || 'unknown'} ${e.path || 'unknown'}`) 
    });
    endpoints.forEach(this.addEndpoint.bind(this));
    return this;
  }

  // Add a single endpoint
  addEndpoint(endpoint: EndpointBuilder): this {
    this.endpoints.push(endpoint);
    this.log('info', `Endpoint added: ${endpoint.method} ${endpoint.path}`, {
      operationId: endpoint.operation?.operationId,
      tags: endpoint.operation?.tags,
      hasParameters: (endpoint.operation?.parameters ?? []).length > 0,
      hasRequestBody: !!endpoint.operation?.requestBody,
      responseStatusCodes: endpoint.operation?.responses ? Object.keys(endpoint.operation.responses) : []
    });

    return this;
  }

  setTitle(title: string): this {
    this.log('info', `Setting title: ${title}`);
    this.raw.info.title = title;
    return this;
  }

  setVersion(version: string): this {
    this.log('info', `Setting version: ${version}`);
    this.raw.info.version = version;
    return this;
  }

  setDescription(description: string): this {
    this.log('info', `Setting description`);
    this.raw.info.description = description;
    return this;
  }

  setTermsOfService(termsOfService: string): this {
    this.log('info', `Setting terms of service: ${termsOfService}`);
    this.raw.info.termsOfService = termsOfService;
    return this;
  }

  setContactName(name: string): this {
    this.log('info', `Setting contact name: ${name}`);
    this.raw.info.contact = this.raw.info.contact || {};
    this.raw.info.contact.name = name;
    return this;
  }

  setContactUrl(url: string): this {
    this.log('info', `Setting contact URL: ${url}`);
    this.raw.info.contact = this.raw.info.contact || {};
    this.raw.info.contact.url = url;
    return this;
  }

  setContactEmail(email: string): this {
    this.log('info', `Setting contact email: ${email}`);
    this.raw.info.contact = this.raw.info.contact || {};
    this.raw.info.contact.email = email;
    return this;
  }

  setLicenseName(name: string): this {
    this.log('info', `Setting license name: ${name}`);
    this.raw.info.license = this.raw.info.license || { name: '' };
    this.raw.info.license.name = name;
    return this;
  }

  setLicenseUrl(url: string): this {
    this.log('info', `Setting license URL: ${url}`);
    this.raw.info.license = this.raw.info.license || { name: '' };
    this.raw.info.license.url = url;
    return this;
  }

  setLicenseIdentifier(identifier: AllowedLicenses): this {
    this.log('info', `Setting license identifier: ${identifier}`);
    this.raw.info.license = this.raw.info.license || { name: '' };
    this.raw.info.license.identifier = identifier;
    return this;
  }

  addEndpointPath(endpointPath: EndpointPath): this {
    this.log('info', `Adding endpoint path: ${endpointPath.path}`, {
      operations: Object.keys(endpointPath.pathItem),
      parameters: endpointPath.pathItem.parameters?.length
    });
    
    if (!this.raw.paths) {
      this.raw.paths = {};
    }

    if (this.raw.paths[endpointPath.path]) {
      this.log('warn', `Path ${endpointPath.path} already exists, overwriting it`, {
        existingOperations: Object.keys(this.raw.paths[endpointPath.path]),
        newOperations: Object.keys(endpointPath.pathItem)
      });
    }

    this.raw.paths[endpointPath.path] = endpointPath.pathItem;
    return this;
  }

  setJsonSchemaDialect(dialect: string): this {
    this.log('info', `Setting JSON schema dialect: ${dialect}`);
    this.raw.jsonSchemaDialect = dialect;
    return this;
  }

  setServers(servers: { url: string; description?: string }[]): this {
    this.log('info', `Setting ${servers.length} servers`);
    this.raw.servers = servers;
    return this;
  }

  setSecurity(scheme: {
    type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
    name: string;
    scopes?: string[];
  }): this {
    this.log(
      'info',
      `Setting security scheme: ${scheme.name} (${scheme.type})`
    );
    if (!this.raw.security) {
      this.raw.security = [] as never;
    }

    const requirement: OpenAPISecurityRequirement = {
      [scheme.name]: scheme.scopes || [],
    };

    this.raw.security = [requirement] as never;
    return this;
  }

  setTag(name: string, description?: string): this {
    this.log('info', `Adding tag: ${name}`);
    if (!this.raw.tags) {
      this.raw.tags = [];
    }

    const tag: OpenAPITag = { name };
    if (description) {
      tag.description = description;
    }

    this.raw.tags.push(tag);
    return this;
  }

  setTags(tags: string[]): this {
    this.log('info', `Adding ${tags.length} tags`);
    if (!this.raw.tags) {
      this.raw.tags = [];
    }

    const newTags = tags.map((tag) => ({ name: tag }));
    this.raw.tags = [...this.raw.tags, ...newTags];
    return this;
  }

  setExternalDocs(url: string, description?: string): this {
    this.log('info', `Setting external docs: ${url}`);
    this.raw.externalDocs = {
      url,
      description,
    };
    return this;
  }

  addSecuritySchema(
    name: string,
    scheme: {
      type: OpenAPISecurityTypes;
      scheme?: string;
      bearerFormat?: string;
      name?: string;
      in?: string;
      openIdConnectUrl?: string;
      // deno-lint-ignore no-explicit-any
      flows?: Record<string, any>;
      description?: string;
    }
  ): this {
    this.log('info', `Adding security schema: ${name} (${scheme.type})`, {
      scheme: scheme.scheme,
      bearerFormat: scheme.bearerFormat,
      apiKeyName: scheme.name,
      apiKeyIn: scheme.in,
      hasFlows: !!scheme.flows
    });
    
    if (!this.raw.components) {
      this.raw.components = { securitySchemes: {} };
    }
    if (!this.raw.components.securitySchemes) {
      this.raw.components.securitySchemes = {};
    }
    this.raw.components.securitySchemes[name] = scheme;
    return this;
  }
}

export { createEndpointBuilder, createEndpointPath, OpenAPI };

// const openAPI = new OpenAPI();

// // OLD USAGE
// openAPI
//   .setTitle('My API')
//   .setVersion('1.0.0')
//   .setDescription('This is my API')
//   .setTermsOfService('https://example.com/terms')
//   .setContactName('John Doe')
//   .setContactUrl('https://example.com/contact')
//   .setContactEmail('john@gmail.com')
//   .addEndpointPath(
//     createEndpointPath('/users/{userId}')
//       .setSummary('Process group of users')
//       .setDescription('This endpoint processes a group of users')
//       .setParameter('userId', 'path', true, 'The ID of the user')
//       .addEndpoint(
//         createEndpointBuilder('get')
//           .setOperationId('getUser')
//           .setSummary('Get user by ID')
//           .setDescription('This endpoint retrieves a user by ID')
//           .setTags(['User'])
//           .setExternalDocs('https://example.com/docs', 'API Documentation')
//           .setSecurity({ apiKey: [] })
//           .setParameter('userId', 'path', true, 'The ID of the user')
//           .setRequestBody(
//             {
//               'application/json': {
//                 schema: {
//                   type: 'object',
//                   properties: {
//                     name: { type: 'string' },
//                     age: { type: 'integer' },
//                   },
//                 },
//               },
//             },
//             true
//           )
//           .setResponses({
//             200: {
//               description: 'User retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       id: { type: 'string' },
//                       name: { type: 'string' },
//                       age: { type: 'integer' },
//                     },
//                   },
//                 },
//               },
//             },
//             404: {
//               description: 'User not found',
//             },
//           })
//       )
//       .addEndpoint(
//         createEndpointBuilder('delete')
//           .setOperationId('deleteUser')
//           .setSummary('Delete user by ID')
//           .setDescription('This endpoint deletes a user by ID')
//           .setTags(['User'])
//           .setExternalDocs('https://example.com/docs', 'API Documentation')
//           .setSecurity({ apiKey: [] })
//           .setParameter('userId', 'path', true, 'The ID of the user')
//           .setResponses({
//             204: {
//               description: 'User deleted successfully',
//             },
//             404: {
//               description: 'User not found',
//             },
//           })
//       )
//   );

// // NEW USAGE
// const endpoint1 = createEndpointBuilder()
//   .setMethod('get')
//   .setPath('/tasks')
//   .setSummary('Get Tasks');

// const endpoint2 = createEndpointBuilder()
//   .setMethod('post')
//   .setPath('/tasks')
//   .setSummary('Create Task')
//   .setRequestBody(
//     {
//       'application/json': {
//         schema: {
//           type: 'object',
//           properties: {
//             title: { type: 'string' },
//             completed: { type: 'boolean' },
//           },
//         },
//       },
//     },
//     true
//   );

// openAPI.addEndpoints([endpoint1, endpoint2]);
