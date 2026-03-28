"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PortfolioContent } from "@/lib/portfolioContentApi";

const PortfolioContentContext = createContext<PortfolioContent | null>(null);

export function PortfolioContentProvider({
  value,
  children,
}: {
  value: PortfolioContent;
  children: ReactNode;
}) {
  return (
    <PortfolioContentContext.Provider value={value}>{children}</PortfolioContentContext.Provider>
  );
}

export function usePortfolioContent(): PortfolioContent {
  const ctx = useContext(PortfolioContentContext);
  if (!ctx) {
    throw new Error("usePortfolioContent must be used within PortfolioContentProvider");
  }
  return ctx;
}
