import type {
  OpenAPIParameterLocation,
  OpenAPIPathItem,
} from "./Core.types.ts";
import type { EndpointBuilder } from "./EndpointBuilder.ts";

class EndpointPath {
  path: string;
  pathItem: OpenAPIPathItem;

  constructor(path: string) {
    this.path = path;
    this.pathItem = {};
  }

  setSummary(summary: string): this {
    this.pathItem.summary = summary;
    return this;
  }

  setDescription(description: string): this {
    this.pathItem.description = description;
    return this;
  }

  setParameter(
    name: string,
    _in: OpenAPIParameterLocation,
    required: boolean,
    description: string,
  ): this {
    if (!this.pathItem.parameters) {
      this.pathItem.parameters = [];
    }
    this.pathItem.parameters.push({
      name,
      in: _in,
      required,
      description,
    });
    return this;
  }

  setServers(servers: { url: string; description?: string }[]): this {
    this.pathItem.servers = servers;
    return this;
  }

  addEndpoint(builder: EndpointBuilder): this {
    if (this.pathItem[builder.method as keyof OpenAPIPathItem]) {
      console.warn(
        `Endpoint with method ${builder.method} already exists for path ${this.path}, Overwriting it.`,
      );
    }

    this.pathItem[builder.method as keyof OpenAPIPathItem] = builder
      // deno-lint-ignore no-explicit-any
      .operation as any;
    return this;
  }
}

function createEndpointPath(path: string): EndpointPath {
  return new EndpointPath(path);
}

export { createEndpointPath, EndpointPath };
