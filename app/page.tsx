import HomeContent from "@/components/HomeContent";
import { getPortfolioContent } from "@/lib/portfolioContentApi";

export default async function Home() {
  const portfolio = await getPortfolioContent();
  return <HomeContent portfolio={portfolio} />;
}
