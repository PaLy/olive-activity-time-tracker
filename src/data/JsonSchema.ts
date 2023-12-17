export const dateSchema = {
  type: "integer",
  minimum: -8_640_000_000_000_000,
  maximum: 8_640_000_000_000_000,
};

export const stringArray = {
  type: "array",
  items: {
    type: "string",
  },
};
