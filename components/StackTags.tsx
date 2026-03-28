"use client";

import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioContent } from "@/context/PortfolioContentContext";
import { orderedTechnologies } from "@/lib/portfolioContentApi";
import {
  SiPostgresql,
  SiDjango,
  SiDocker,
  SiJenkins,
  SiGithubactions,
  SiCloudflare,
  SiStripe,
  SiMercadopago,
  SiKeycloak,
  SiVercel,
  SiRailway,
} from "react-icons/si";
import type { IconType } from "react-icons";

const ICON_MAP: Record<string, IconType> = {
  PostgreSQL: SiPostgresql,
  "Django REST Framework": SiDjango,
  Docker: SiDocker,
  "CI/CD": SiJenkins,
  "GitHub Actions": SiGithubactions,
  AWS: SiCloudflare,
  Stripe: SiStripe,
  "Mercado Pago": SiMercadopago,
  Cognito: SiKeycloak,
  Vercel: SiVercel,
  Railway: SiRailway,
};

type StackTagsProps = {
  /** Si se pasan, se usan en lugar de la API (tests / story). */
  itemsPrincipal?: string[];
  itemsComplementary?: string[];
};

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((item) => {
        const Icon = ICON_MAP[item];
        return (
          <span
            key={item}
            className="inline-flex items-center justify-center gap-2 w-[190px] min-h-[44px] border-2 border-sega-cyan/50 bg-sega-bg-dark px-3 py-2 text-xs font-pixel text-sega-cyan"
          >
            {Icon && (
              <Icon className="h-4 w-4 shrink-0 text-sega-cyan/90" aria-hidden />
            )}
            {item}
          </span>
        );
      })}
    </div>
  );
}

export default function StackTags({ itemsPrincipal: itemsPrincipalProp, itemsComplementary: itemsComplementaryProp }: StackTagsProps) {
  const { lang } = useLanguage();
  const portfolio = usePortfolioContent();
  const fromApi = orderedTechnologies(portfolio).map((row) =>
    lang === "es" && row.name_es ? row.name_es : row.name
  );
  const itemsPrincipal = itemsPrincipalProp ?? fromApi;
  const itemsComplementary = itemsComplementaryProp ?? [];

  if (itemsPrincipal.length === 0 && itemsComplementary.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5 w-full">
      <div className="space-y-2">
        <h3 className="font-pixel text-[10px] uppercase tracking-widest text-sega-yellow/90 text-center">
          {lang === "es" ? "Conocimiento principal" : "Core knowledge"}
        </h3>
        <TagList items={itemsPrincipal} />
      </div>

      {itemsComplementary.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-pixel text-[10px] uppercase tracking-widest text-sega-yellow/75 text-center">
            {lang === "es" ? "Conocimiento complementario" : "Complementary knowledge"}
          </h3>
          <TagList items={itemsComplementary} />
        </div>
      )}
    </div>
  );
}
