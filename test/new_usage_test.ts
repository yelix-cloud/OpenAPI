import { createEndpointBuilder, OpenAPI } from "../src/Core.ts";
import { assertEquals } from "@std/assert";

Deno.test("New usage with individual endpoints", () => {
  const api = new OpenAPI()
    .setTitle("Tasks API")
    .setVersion("1.0.0");

  const endpoint1 = createEndpointBuilder()
    .setMethod("get")
    .setPath("/tasks")
    .setSummary("Get Tasks")
    .setOperationId("getTasks")
    .setResponses({
      200: {
        description: "Success response",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  completed: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    });

  const endpoint2 = createEndpointBuilder()
    .setMethod("post")
    .setPath("/tasks")
    .setSummary("Create Task")
    .setOperationId("createTask")
    .setRequestBody(
      {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              completed: { type: "boolean" },
            },
          },
        },
      },
      true,
    )
    .setResponses({
      201: {
        description: "Task created",
      },
    });

  // Add endpoint with different path
  const endpoint3 = createEndpointBuilder()
    .setMethod("get")
    .setPath("/tasks/{taskId}")
    .setSummary("Get Task by ID")
    .setOperationId("getTaskById")
    .setParameter("taskId", "path", true, "Task identifier")
    .setResponses({
      200: {
        description: "Task details",
      },
      404: {
        description: "Task not found",
      },
    });

  api.addEndpoints([endpoint1, endpoint2, endpoint3]);

  const result = api.getJSON();

  // Verify that we have two distinct paths
  assertEquals(Object.keys(result.paths || {}).length, 2);

  // Check that /tasks has both GET and POST methods
  // deno-lint-ignore no-explicit-any
  const tasksPath = result.paths?.["/tasks"] as any;
  assertEquals(typeof tasksPath?.get, "object");
  assertEquals(typeof tasksPath?.post, "object");
  assertEquals(tasksPath?.get?.operationId, "getTasks");
  assertEquals(tasksPath?.post?.operationId, "createTask");

  // Check that /tasks/{taskId} has GET method
  // deno-lint-ignore no-explicit-any
  const taskByIdPath = result.paths?.["/tasks/{taskId}"] as any;
  assertEquals(typeof taskByIdPath?.get, "object");
  assertEquals(taskByIdPath?.get?.operationId, "getTaskById");
});

Deno.test("Adding a single endpoint works", () => {
  const api = new OpenAPI();

  api.addEndpoint(
    createEndpointBuilder()
      .setMethod("get")
      .setPath("/users")
      .setOperationId("getUsers"),
  );

  // deno-lint-ignore no-explicit-any
  const result = api.getJSON() as any;
  assertEquals(typeof result.paths?.["/users"]?.get, "object");
  assertEquals(result.paths?.["/users"]?.get?.operationId, "getUsers");
});
