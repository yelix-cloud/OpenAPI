import type {
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPIParameterLocation,
  OpenAPIRequestBody,
} from "./Core.types.ts";

class EndpointBuilder {
  method: string;
  path: string;
  operation: OpenAPIOperation;

  constructor(method?: string) {
    this.method = method || "";
    this.path = "";
    this.operation = {} as OpenAPIOperation;
  }

  setMethod(method: string): this {
    this.method = method.toLowerCase();
    return this;
  }

  setPath(path: string): this {
    this.path = path;
    return this;
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

  // deno-lint-ignore no-explicit-any
  setRawRequestBodyContent(obj: any): this {
    if (!this.operation.requestBody) {
      this.operation.requestBody = {} as OpenAPIRequestBody;
    }

    (this.operation.requestBody as OpenAPIRequestBody).required = true;
    (this.operation.requestBody as OpenAPIRequestBody).content = obj;
    return this;
  }

  addRawParameter(obj: OpenAPIParameter ): this {
    if (!this.operation.parameters) {
      this.operation.parameters = [];
    }
    this.operation.parameters.push(obj);
    return this;
  }
}

function createEndpointBuilder(
  method?: string,
): EndpointBuilder {
  return new EndpointBuilder(method);
}

export { createEndpointBuilder, EndpointBuilder };
