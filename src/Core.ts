import type {
  OpenAPI as OpenAPI_3_1,
  OpenAPISecurityRequirement,
  OpenAPITag,
} from "./Core.types.ts";
import { createEndpointBuilder } from "./EndpointBuilder.ts";
import { createEndpointPath, type EndpointPath } from "./EndpointPath.ts";
import type { AllowedLicenses } from "./Licenses.types.ts";

class OpenAPI {
  private raw: OpenAPI_3_1;

  constructor() {
    this.raw = {
      openapi: "3.1.0",
      info: {
        title: "OpenAPI 3.1.0",
        version: "1.0.0",
      },
    };
  }

  getJSON() {
    return this.raw;
  }

  setTitle(title: string): this {
    this.raw.info.title = title;
    return this;
  }

  setVersion(version: string): this {
    this.raw.info.version = version;
    return this;
  }

  setDescription(description: string): this {
    this.raw.info.description = description;
    return this;
  }

  setTermsOfService(termsOfService: string): this {
    this.raw.info.termsOfService = termsOfService;
    return this;
  }

  setContactName(name: string): this {
    this.raw.info.contact = this.raw.info.contact || {};
    this.raw.info.contact.name = name;
    return this;
  }

  setContactUrl(url: string): this {
    this.raw.info.contact = this.raw.info.contact || {};
    this.raw.info.contact.url = url;
    return this;
  }

  setContactEmail(email: string): this {
    this.raw.info.contact = this.raw.info.contact || {};
    this.raw.info.contact.email = email;
    return this;
  }

  setLicenseName(name: string): this {
    this.raw.info.license = this.raw.info.license || { name: "" };
    this.raw.info.license.name = name;
    return this;
  }

  setLicenseUrl(url: string): this {
    this.raw.info.license = this.raw.info.license || { name: "" };
    this.raw.info.license.url = url;
    return this;
  }

  setLicenseIdentifier(identifier: AllowedLicenses): this {
    this.raw.info.license = this.raw.info.license || { name: "" };
    this.raw.info.license.identifier = identifier;
    return this;
  }

  addEndpointPath(endpointPath: EndpointPath) {
    if (!this.raw.paths) {
      this.raw.paths = {};
    }

    if (this.raw.paths[endpointPath.path]) {
      console.warn(`Path ${endpointPath.path} already exists, Overwriting it.`);
    }

    this.raw.paths[endpointPath.path] = endpointPath.pathItem;
    return this;
  }

  setJsonSchemaDialect(dialect: string): this {
    this.raw.jsonSchemaDialect = dialect;
    return this;
  }

  setServers(servers: { url: string; description?: string }[]): this {
    this.raw.servers = servers;
    return this;
  }

  setSecurity(scheme: {
    type: "apiKey" | "http" | "oauth2" | "openIdConnect";
    name: string;
    scopes?: string[];
  }): this {
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
    if (!this.raw.tags) {
      this.raw.tags = [];
    }

    const newTags = tags.map((tag) => ({ name: tag }));
    this.raw.tags = [...this.raw.tags, ...newTags];
    return this;
  }

  setExternalDocs(url: string, description?: string): this {
    this.raw.externalDocs = {
      url,
      description,
    };
    return this;
  }
}

export { OpenAPI };

const openAPI = new OpenAPI();

openAPI
  .setTitle("My API")
  .setVersion("1.0.0")
  .setDescription("This is my API")
  .setTermsOfService("https://example.com/terms")
  .setContactName("John Doe")
  .setContactUrl("https://example.com/contact")
  .setContactEmail("john@gmail.com")
  .addEndpointPath(
    createEndpointPath("/users/{userId}")
      .setSummary("Process group of users")
      .setDescription("This endpoint processes a group of users")
      .setParameter("userId", "path", true, "The ID of the user")
      .addEndpoint(
        createEndpointBuilder("get")
          .setOperationId("getUser")
          .setSummary("Get user by ID")
          .setDescription("This endpoint retrieves a user by ID")
          .setTags(["User"])
          .setExternalDocs("https://example.com/docs", "API Documentation")
          .setSecurity({ apiKey: [] })
          .setParameter("userId", "path", true, "The ID of the user")
          .setRequestBody(
            {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    age: { type: "integer" },
                  },
                },
              },
            },
            true,
          )
          .setResponses({
            200: {
              description: "User retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      age: { type: "integer" },
                    },
                  },
                },
              },
            },
            404: {
              description: "User not found",
            },
          }),
      )
      .addEndpoint(
        createEndpointBuilder("delete")
          .setOperationId("deleteUser")
          .setSummary("Delete user by ID")
          .setDescription("This endpoint deletes a user by ID")
          .setTags(["User"])
          .setExternalDocs("https://example.com/docs", "API Documentation")
          .setSecurity({ apiKey: [] })
          .setParameter("userId", "path", true, "The ID of the user")
          .setResponses({
            204: {
              description: "User deleted successfully",
            },
            404: {
              description: "User not found",
            },
          }),
      ),
  );
