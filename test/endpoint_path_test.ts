import { createEndpointPath } from "../src/EndpointPath.ts";
import { assertEquals } from "@std/assert";

Deno.test("EndpointPath creates with correct path", () => {
  const path = createEndpointPath("/users");
  assertEquals(path.path, "/users");
});

Deno.test("EndpointPath sets summary and description", () => {
  const path = createEndpointPath("/users")
    .setSummary("User operations")
    .setDescription("Endpoints for managing users");

  assertEquals(path.pathItem.summary, "User operations");
  assertEquals(path.pathItem.description, "Endpoints for managing users");
});

Deno.test("EndpointPath sets parameters correctly", () => {
  const path = createEndpointPath("/users/{userId}")
    .setParameter("userId", "path", true, "User identifier");

  assertEquals(path.pathItem.parameters?.length, 1);

  // Type guard to check if the parameter is an object with these properties
  const param = path.pathItem.parameters?.[0];
  if (param && typeof param === "object" && "name" in param) {
    assertEquals(param.name, "userId");
    assertEquals(param.in, "path");
    assertEquals(param.required, true);
    assertEquals(param.description, "User identifier");
  } else {
    // Fail the test if parameter doesn't have the expected structure
    assertEquals(
      true,
      false,
      "Expected parameter to be an object with name, in, required, and description properties",
    );
  }
});

Deno.test("EndpointPath can set multiple parameters", () => {
  const path = createEndpointPath("/users/{userId}/posts")
    .setParameter("userId", "path", true, "User identifier")
    .setParameter("limit", "query", false, "Maximum number of results");

  assertEquals(path.pathItem.parameters?.length, 2);

  // Check first parameter
  const param1 = path.pathItem.parameters?.[0];
  if (param1 && typeof param1 === "object" && "name" in param1) {
    assertEquals(param1.name, "userId");
  } else {
    assertEquals(true, false, "First parameter should have name property");
  }

  // Check second parameter
  const param2 = path.pathItem.parameters?.[1];
  if (param2 && typeof param2 === "object" && "name" in param2) {
    assertEquals(param2.name, "limit");
  } else {
    assertEquals(true, false, "Second parameter should have name property");
  }
});
