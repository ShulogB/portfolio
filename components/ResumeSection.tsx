"use client";

import Button from "./Button";
import { useLanguage } from "@/context/LanguageContext";

export default function ResumeSection() {
  const { content } = useLanguage();
  return (
    <section className="border-b-2 border-sega-cyan/40">
      <div className="max-w-4xl mx-auto px-6 py-6 flex justify-center">
        <Button href="/resume.pdf" variant="secondary" external>
          {content.ui.hero.downloadResume}
        </Button>
      </div>
    </section>
  );
}
