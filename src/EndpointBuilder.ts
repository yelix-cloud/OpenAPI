import type {
  OpenAPIOperation,
  OpenAPIParameterLocation,
} from "./Core.types.ts";

class EndpointBuilder {
  method: string;
  operation: OpenAPIOperation;

  constructor(method: string) {
    this.method = method;
    this.operation = {} as OpenAPIOperation;
  }

  setOperationId(operationId: string): this {
    this.operation.operationId = operationId;
    return this;
  }

  setSummary(summary: string): this {
    this.operation.summary = summary;
    return this;
  }

  setDescription(description: string): this {
    this.operation.description = description;
    return this;
  }

  setTags(tags: string[]): this {
    this.operation.tags = tags;
    return this;
  }

  setExternalDocs(url: string, description?: string): this {
    this.operation.externalDocs = {
      url,
      description,
    };
    return this;
  }

  setSecurity(security: Record<string, string[]>): this {
    this.operation.security = security;
    return this;
  }

  setParameter(
    name: string,
    _in: OpenAPIParameterLocation,
    required: boolean,
    description: string,
  ): this {
    if (!this.operation.parameters) {
      this.operation.parameters = [];
    }
    this.operation.parameters.push({
      name,
      in: _in,
      required,
      description,
    });
    return this;
  }

  setRequestBody(
    content: Record<string, { schema: Record<string, unknown> }>,
    required: boolean,
  ): this {
    this.operation.requestBody = {
      content,
      required,
    };
    return this;
  }

  setResponses(
    responses: Record<
      string,
      {
        description: string;
        content?: Record<string, { schema: Record<string, unknown> }>;
      }
    >,
  ): this {
    this.operation.responses = responses;
    return this;
  }

  setCallbacks(
    callbacks: Record<string, { [expression: string]: { $ref: string } }>,
  ): this {
    this.operation.callbacks = callbacks;
    return this;
  }

  setDeprecated(deprecated: boolean): this {
    this.operation.deprecated = deprecated;
    return this;
  }

  setServers(servers: { url: string; description?: string }[]): this {
    this.operation.servers = servers;
    return this;
  }
}

function createEndpointBuilder(
  method: string,
): EndpointBuilder {
  return new EndpointBuilder(method);
}

export { createEndpointBuilder, EndpointBuilder };
