import { OpenAPI } from "../src/Core.ts";
import { createEndpointPath } from "../src/EndpointPath.ts";
import { createEndpointBuilder } from "../src/EndpointBuilder.ts";
import { assertEquals } from "@std/assert";

Deno.test("Complex API with multiple paths and methods", () => {
  const api = new OpenAPI()
    .setTitle("Blog API")
    .setVersion("1.0.0")
    .setLicenseIdentifier("MIT")
    .addEndpointPath(
      createEndpointPath("/posts")
        .setSummary("Blog posts")
        .addEndpoint(
          createEndpointBuilder("get")
            .setOperationId("listPosts")
            .setSummary("List all posts")
            .setParameter("page", "query", false, "Page number")
            .setParameter("limit", "query", false, "Results per page"),
        )
        .addEndpoint(
          createEndpointBuilder("post")
            .setOperationId("createPost")
            .setSummary("Create a new post")
            .setRequestBody({
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                  },
                },
              },
            }, true),
        ),
    )
    .addEndpointPath(
      createEndpointPath("/posts/{postId}")
        .setParameter("postId", "path", true, "Post identifier")
        .addEndpoint(
          createEndpointBuilder("get")
            .setOperationId("getPost"),
        )
        .addEndpoint(
          createEndpointBuilder("put")
            .setOperationId("updatePost"),
        )
        .addEndpoint(
          createEndpointBuilder("delete")
            .setOperationId("deletePost"),
        ),
    );

  const raw = api.getJSON();

  // Test basic API info
  assertEquals(raw.info.title, "Blog API");

  // Test paths existence
  assertEquals(typeof (raw.paths ?? {})["/posts"], "object");
  assertEquals(typeof (raw.paths ?? {})["/posts/{postId}"], "object");

  // Store paths in variables with type assertions to avoid repeated null checks
  const paths = raw.paths!;
  const postsPath = paths["/posts"] as any;
  const postIdPath = paths["/posts/{postId}"] as any;

  // Test methods on first path
  assertEquals(typeof postsPath.get, "object");
  assertEquals(typeof postsPath.post, "object");

  // Test methods on second path
  assertEquals(typeof postIdPath.get, "object");
  assertEquals(typeof postIdPath.put, "object");
  assertEquals(typeof postIdPath.delete, "object");

  // Test operation IDs
  assertEquals(postsPath.get.operationId, "listPosts");
  assertEquals(postIdPath.delete.operationId, "deletePost");
});
