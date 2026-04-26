'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type OnboardingStep = {
  label: string;
  completed?: boolean;
};

type OnboardingAction = {
  href: string;
  label: string;
};

interface OnboardingPanelProps {
  badge: string;
  title: string;
  description: string;
  progressLabel: string;
  icon: LucideIcon;
  steps: OnboardingStep[];
  primaryActionLabel: string;
  primaryActionHref: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  supportingActions?: OnboardingAction[];
  dismissLabel?: string;
  onDismiss?: () => void;
  accentClassName: string;
  surfaceClassName: string;
}

export function OnboardingPanel({
  badge,
  title,
  description,
  progressLabel,
  icon: Icon,
  steps,
  primaryActionLabel,
  primaryActionHref,
  secondaryActionLabel,
  secondaryActionHref,
  supportingActions,
  dismissLabel,
  onDismiss,
  accentClassName,
  surfaceClassName,
}: OnboardingPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className={`overflow-hidden border px-4 py-3 shadow-sm transition-[border-radius] duration-200 ${
        expanded ? 'rounded-[2rem]' : 'rounded-[2rem] sm:rounded-full'
      } ${surfaceClassName}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-800">
                <Icon className={`h-3.5 w-3.5 ${accentClassName}`} />
                {badge}
              </div>
              <div className="rounded-full border border-white/80 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {progressLabel}
              </div>
            </div>

            <div className="mt-1.5 flex min-w-0 flex-col gap-1 lg:flex-row lg:items-center lg:gap-3">
              <h2 className="truncate text-sm font-black tracking-tight text-slate-950 sm:text-base">
                {title}
              </h2>
              <p className="truncate text-xs leading-5 text-slate-600 sm:text-sm">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={primaryActionHref}>
              <Button size="sm" className="h-8 px-3 text-xs shadow-none">
                {primaryActionLabel}
              </Button>
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
            >
              <span className="inline-flex items-center gap-1.5">
                {expanded ? 'Ocultar' : 'Ver pasos'}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </span>
            </Button>

            {dismissLabel && onDismiss ? (
              <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" onClick={onDismiss}>
                {dismissLabel}
              </Button>
            ) : null}
          </div>
        </div>

        {expanded ? (
          <div className="rounded-[1.2rem] border border-white/80 bg-white/70 px-3 py-3">
            <div className="grid gap-2 lg:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.label}
                  className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-2 text-xs font-medium text-slate-600"
                >
                  <div
                    className={`rounded-full p-1 ${
                      step.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <span className={step.completed ? 'text-slate-900' : undefined}>{step.label}</span>
                </div>
              ))}
            </div>

            {supportingActions && supportingActions.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {supportingActions.map((action) => (
                  <Link key={action.href + action.label} href={action.href}>
                    <Button variant="ghost" size="sm" className="h-8 px-3 py-1 text-xs">
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>
            ) : null}

            {secondaryActionLabel && secondaryActionHref ? (
              <div className="mt-2">
                <Link href={secondaryActionHref}>
                  <Button variant="secondary" size="sm" className="h-8 px-3 text-xs">
                    <span className="inline-flex items-center gap-2">
                      {secondaryActionLabel}
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
