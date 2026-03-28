"use client";

import AppLayout from "./AppLayout";
import { PortfolioContentProvider } from "@/context/PortfolioContentContext";
import type { PortfolioContent } from "@/lib/portfolioContentApi";

type HomeContentProps = {
  portfolio: PortfolioContent;
};

export default function HomeContent({ portfolio }: HomeContentProps) {
  return (
    <PortfolioContentProvider value={portfolio}>
      <AppLayout />
    </PortfolioContentProvider>
  );
}
