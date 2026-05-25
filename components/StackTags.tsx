"use client";

import { useLanguage } from "@/context/LanguageContext";
import {
  SiPostgresql,
  SiDjango,
  SiDocker,
  SiGithubactions,
  SiStripe,
  SiMercadopago,
  SiPython,
  SiGoogle,
  SiMeta,
  SiPix,
} from "react-icons/si";
import { TbBrandAws, TbMail, TbShieldLock, TbGitMerge } from "react-icons/tb";
import type { IconType } from "react-icons";

const ICON_MAP: Record<string, IconType> = {
  Python: SiPython,
  PostgreSQL: SiPostgresql,
  "Django REST Framework": SiDjango,
  Docker: SiDocker,
  "GitHub Actions": SiGithubactions,
  "CI/CD": TbGitMerge,
  AWS: TbBrandAws,
  Stripe: SiStripe,
  "Mercado Pago": SiMercadopago,
  Cognito: TbShieldLock,
  "Amazon SES": TbMail,
  "Google OAuth": SiGoogle,
  Meta: SiMeta,
  Pix: SiPix,
};

type StackTagsProps = {
  itemsPrincipal: string[];
  itemsComplementary?: string[];
  itemsIntegrations?: string[];
};

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="h-px flex-1 bg-sega-cyan/20" />
      <span className="font-pixel text-[9px] text-sega-yellow/70 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="h-px flex-1 bg-sega-cyan/20" />
    </div>
  );
}

function TagList({ items, dim = false }: { items: string[]; dim?: boolean }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((item) => {
        const Icon = ICON_MAP[item];
        return (
          <span
            key={item}
            className={`
              inline-flex items-center gap-2 px-4 py-2 border
              font-pixel text-[10px] leading-none
              transition-all duration-150 cursor-default
              ${dim
                ? "border-sega-cyan/30 text-sega-cyan/60 bg-transparent hover:border-sega-cyan/60 hover:text-sega-cyan/80"
                : "border-sega-cyan/50 text-sega-cyan bg-sega-bg-dark hover:border-sega-cyan hover:bg-sega-cyan/8 hover:shadow-[0_0_8px_rgba(0,220,255,0.15)]"
              }
            `}
          >
            {Icon && (
              <Icon
                className={`h-[15px] w-[15px] shrink-0 ${dim ? "opacity-60" : "opacity-80"}`}
                aria-hidden
              />
            )}
            {item}
          </span>
        );
      })}
    </div>
  );
}

export default function StackTags({
  itemsPrincipal,
  itemsComplementary = [],
  itemsIntegrations = [],
}: StackTagsProps) {
  const { lang } = useLanguage();

  return (
    <div className="space-y-4 w-full">
      <SectionDivider label={lang === "es" ? "Stack principal" : "Core stack"} />
      <TagList items={itemsPrincipal} />

      {itemsComplementary.length > 0 && (
        <>
          <SectionDivider label={lang === "es" ? "Infraestructura & DevOps" : "Infrastructure & DevOps"} />
          <TagList items={itemsComplementary} dim />
        </>
      )}

      {itemsIntegrations.length > 0 && (
        <>
          <SectionDivider label={lang === "es" ? "Integraciones" : "Integrations"} />
          <TagList items={itemsIntegrations} dim />
        </>
      )}
    </div>
  );
}
