import { OpenAPI } from "../src/Core.ts";
import { assertEquals } from "@std/assert";

Deno.test("setServers sets server information", () => {
  const servers = [
    { url: "https://api.example.com", description: "Production server" },
    { url: "https://dev-api.example.com", description: "Development server" },
  ];

  const api = new OpenAPI().setServers(servers);
  const raw = api.getJSON();

  assertEquals(raw.servers, servers);
  assertEquals(raw.servers?.[0].url, "https://api.example.com");
  assertEquals(raw.servers?.[1].description, "Development server");
});
