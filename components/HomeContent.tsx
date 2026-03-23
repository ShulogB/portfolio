"use client";

import AppLayout from "./AppLayout";
import type { CaseStudyForCarousel } from "@/lib/caseStudyApi";

type HomeContentProps = {
  caseStudies?: CaseStudyForCarousel[];
};

export default function HomeContent({ caseStudies = [] }: HomeContentProps) {
  return <AppLayout caseStudiesForCarousel={caseStudies} />;
}
