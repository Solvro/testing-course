import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { testQueryClient } from "./query-client";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
};
