import { JTDSchemaType } from "ajv/dist/jtd";

export const dateTimeSchema: JTDSchemaType<string> = {
  type: "timestamp",
};

export const stringArray: JTDSchemaType<string[]> = {
  elements: {
    type: "string",
  },
};
