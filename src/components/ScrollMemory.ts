import { createContext } from "react";

export const ScrollMemoryContext = createContext(new Map<string, number>());
