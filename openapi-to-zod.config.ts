import { defineConfig } from "@cerios/openapi-to-zod";

export default defineConfig({
  defaults: {
    mode: "strict",
    includeDescriptions: true,
    useDescribe: false,
    showStats: false,
    schemaType: "all",
  },
  specs: [
    {
      input: "/Users/kipabelousow/Termeet/Termeet-back/backend/docs/openapi.yaml",
      outputTypes: "src/entities/Meet/Meet.schema.ts",
      operationFilters: {
        includeTags: ["Meet"],
      },
    },
  ],
});
