import { EndpointBuilder } from "../../../src/EndpointBuilder.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("EndpointBuilder tags functionality", async (t) => {
  await t.step("should set tags using setTags method", () => {
    const endpoint = new EndpointBuilder({
      method: "post",
      title: "Create User",
    });

    endpoint.setTags(["users", "create"]);

    const pathItem = endpoint.getEndpoint();

    assertEquals(
      pathItem.post?.tags,
      ["users", "create"],
      "Tags should be set correctly",
    );
  });

  await t.step("should add a single tag using addTag method", () => {
    const endpoint = new EndpointBuilder({
      method: "get",
      title: "Get User",
    });

    endpoint.addTag("users");

    const pathItem = endpoint.getEndpoint();

    assertEquals(
      pathItem.get?.tags,
      ["users"],
      "Single tag should be added correctly",
    );
  });

  await t.step("should add multiple tags using addTags method", () => {
    const endpoint = new EndpointBuilder({
      method: "delete",
      title: "Delete User",
    });

    endpoint.addTags(["users", "delete", "admin"]);

    const pathItem = endpoint.getEndpoint();

    assertEquals(
      pathItem.delete?.tags,
      ["users", "delete", "admin"],
      "Multiple tags should be added correctly",
    );
  });

  await t.step("should chain tag methods correctly", () => {
    const endpoint = new EndpointBuilder({
      method: "patch",
      title: "Update User",
    });

    endpoint
      .addTag("users")
      .addTag("update")
      .addTags(["profile", "admin"]);

    const pathItem = endpoint.getEndpoint();

    assertEquals(
      pathItem.patch?.tags,
      ["users", "update", "profile", "admin"],
      "Tags should be added in the correct order with chained methods",
    );
  });

  await t.step("should add tags to previously empty tags array", () => {
    const endpoint = new EndpointBuilder({
      method: "put",
      title: "Replace User",
    });

    // First call should initialize the tags array
    endpoint.addTag("users");
    // Second call should add to the existing array
    endpoint.addTag("replace");

    const pathItem = endpoint.getEndpoint();

    assertEquals(
      pathItem.put?.tags,
      ["users", "replace"],
      "Tags should be properly initialized and appended",
    );
  });
});
