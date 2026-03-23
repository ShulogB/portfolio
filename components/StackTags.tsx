"use client";

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
};

export default function StackTags({ items }: { items: string[] }) {
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
