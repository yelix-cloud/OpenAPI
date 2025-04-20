import { OpenAPI } from "../../src/OpenAPI.ts";

// Create test API
const api = new OpenAPI({
  title: "Test API",
  version: "1.0.0"
});

// Add a security scheme
const apiKeyRef = api.addApiKeySecurity("ApiKey", {
  in: "header",
  parameterName: "X-API-Key",
  description: "API Key authentication"
});

// Debug information
console.log("Reference:", apiKeyRef.$ref);
console.log("Components structure:", JSON.stringify(api.getJSON().components, null, 2));
console.log("Result of getComponentByRef:", api.getComponentByRef(apiKeyRef.$ref));
