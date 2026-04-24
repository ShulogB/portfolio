import HomeContent from "@/components/HomeContent";
import { getCaseStudiesForCarousel } from "@/lib/caseStudyApi";

export default async function Home() {
  const caseStudies = await getCaseStudiesForCarousel();
  return <HomeContent caseStudies={caseStudies} />;
}
