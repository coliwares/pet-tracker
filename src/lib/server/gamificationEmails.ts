import 'server-only';

type EmailTone = {
  accent: string;
  surface: string;
  text: string;
};

type BaseEmailPayload = {
  userName: string;
  petName: string;
  ctaUrl: string;
  ctaLabel: string;
  previewText?: string;
};

type StreakCompletedPayload = BaseEmailPayload & {
  streakDays: number;
  bonusPoints: number;
  unlockedBadge?: string | null;
  multiplierLabel: string;
  nextGoal: string;
};

type BadgeUnlockedPayload = BaseEmailPayload & {
  badgeName: string;
  badgeIcon: string;
  unlockedAt: string;
  description: string;
  awardedPoints: number;
  tierProgressLabel: string;
  nextBadgeLabel: string;
};

type WeeklySummaryPayload = BaseEmailPayload & {
  weekLabel: string;
  totalPoints: number;
  streakLabel: string;
  consistencyLabel: string;
  badgesLabel: string;
  bestDayLabel: string;
  categoryHighlight: string;
  challengePreview: string;
  compareLabel?: string | null;
};

type ChallengeCompletedPayload = BaseEmailPayload & {
  challengeName: string;
  metricLabel: string;
  rewardLabel: string;
  nextChallengeLabel: string;
};

type StreakRiskPayload = BaseEmailPayload & {
  currentStreak: number;
  missingItems: string[];
  hoursLeft: number;
  nextMilestoneLabel: string;
};

type MilestonePayload = BaseEmailPayload & {
  milestoneTitle: string;
  milestoneDescription: string;
  averagePointsLabel: string;
  nextGoal: string;
};

type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

function renderBaseEmail(
  payload: BaseEmailPayload,
  tone: EmailTone,
  title: string,
  body: string,
  footer = 'Recibes este correo porque activaste notificaciones de progreso en Pet Tracker.'
) {
  const html = `
    <div style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="padding:28px 28px 20px;background:${tone.surface};">
          <div style="display:inline-block;padding:10px 16px;border-radius:999px;background:${tone.accent};color:#ffffff;font-weight:700;">
            Pet Tracker
          </div>
          <p style="margin:18px 0 0;font-size:14px;color:${tone.text};">Hola ${payload.userName},</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#0f172a;">${title}</h1>
          ${payload.previewText ? `<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#334155;">${payload.previewText}</p>` : ''}
        </div>
        <div style="padding:28px;">
          ${body}
          <div style="margin-top:28px;">
            <a href="${payload.ctaUrl}" style="display:inline-block;padding:14px 22px;border-radius:14px;background:${tone.accent};color:#ffffff;text-decoration:none;font-weight:700;">
              ${payload.ctaLabel}
            </a>
          </div>
        </div>
        <div style="padding:20px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:13px;line-height:1.6;color:#64748b;">
          ${footer}
        </div>
      </div>
    </div>
  `;

  return html;
}

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function renderStreakCompletedEmail(payload: StreakCompletedPayload): RenderedEmail {
  const subject = payload.streakDays >= 30
    ? `🔥🔥🔥🔥 ${payload.petName} completo un mes dorado`
    : payload.streakDays >= 14
      ? `🔥🔥🔥 ${payload.petName} llego a ${payload.streakDays} dias`
      : `🔥 ${payload.petName} mantiene su racha`;
  const body = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#334155;">
      ${payload.petName} acaba de completar <strong>${payload.streakDays} dias seguidos</strong> con un nivel de cuidado consistente.
    </p>
    <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin:20px 0;">
      <div style="padding:16px;border-radius:18px;background:#fff7ed;border:1px solid #fed7aa;">
        <div style="font-size:12px;text-transform:uppercase;color:#9a3412;font-weight:700;">Bonus</div>
        <div style="margin-top:6px;font-size:24px;font-weight:800;color:#7c2d12;">+${payload.bonusPoints}</div>
      </div>
      <div style="padding:16px;border-radius:18px;background:#eff6ff;border:1px solid #bfdbfe;">
        <div style="font-size:12px;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Multiplicador</div>
        <div style="margin-top:6px;font-size:24px;font-weight:800;color:#1e3a8a;">${payload.multiplierLabel}</div>
      </div>
    </div>
    ${payload.unlockedBadge ? `<p style="margin:0 0 14px;font-size:15px;color:#334155;">Badge desbloqueado: <strong>${payload.unlockedBadge}</strong></p>` : ''}
    <p style="margin:0;font-size:15px;color:#334155;">Siguiente meta: <strong>${payload.nextGoal}</strong></p>
  `;

  const html = renderBaseEmail(
    payload,
    { accent: '#f97316', surface: '#fff7ed', text: '#9a3412' },
    `La racha de ${payload.petName} esta encendida`,
    body
  );

  return {
    subject,
    html,
    text: stripHtml(body),
  };
}

export function renderBadgeUnlockedEmail(payload: BadgeUnlockedPayload): RenderedEmail {
  const subject = `🏆 ${payload.petName} desbloqueo ${payload.badgeName}`;
  const body = `
    <div style="padding:18px;border-radius:20px;background:#f8fafc;border:1px solid #e2e8f0;">
      <div style="font-size:30px;">${payload.badgeIcon}</div>
      <h2 style="margin:10px 0 0;font-size:26px;color:#0f172a;">${payload.badgeName}</h2>
      <p style="margin:10px 0 0;font-size:15px;color:#475569;">${payload.description}</p>
      <p style="margin:10px 0 0;font-size:14px;color:#64748b;">Desbloqueado: ${payload.unlockedAt}</p>
    </div>
    <p style="margin:18px 0 0;font-size:15px;color:#334155;">Puntos otorgados: <strong>+${payload.awardedPoints}</strong></p>
    <p style="margin:8px 0 0;font-size:15px;color:#334155;">${payload.tierProgressLabel}</p>
    <p style="margin:8px 0 0;font-size:15px;color:#334155;">Siguiente badge cercano: <strong>${payload.nextBadgeLabel}</strong></p>
  `;

  const html = renderBaseEmail(
    payload,
    { accent: '#f59e0b', surface: '#fffbeb', text: '#92400e' },
    `${payload.badgeIcon} Nuevo logro para ${payload.petName}`,
    body
  );

  return { subject, html, text: stripHtml(body) };
}

export function renderWeeklySummaryEmail(payload: WeeklySummaryPayload): RenderedEmail {
  const subject = `📊 Tu semana en numeros con ${payload.petName}`;
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
      Semana ${payload.weekLabel}. Resumen rapido para mantener el ritmo de ${payload.petName}.
    </p>
    <ul style="padding-left:18px;margin:0;color:#334155;font-size:15px;line-height:1.8;">
      <li>${payload.totalPoints} puntos totales</li>
      <li>${payload.streakLabel}</li>
      <li>${payload.consistencyLabel}</li>
      <li>${payload.badgesLabel}</li>
      <li>${payload.bestDayLabel}</li>
      <li>${payload.categoryHighlight}</li>
      ${payload.compareLabel ? `<li>${payload.compareLabel}</li>` : ''}
    </ul>
    <p style="margin:18px 0 0;font-size:15px;color:#334155;">Proxima semana: <strong>${payload.challengePreview}</strong></p>
  `;

  const html = renderBaseEmail(
    payload,
    { accent: '#2563eb', surface: '#eff6ff', text: '#1d4ed8' },
    `Resumen semanal de ${payload.petName}`,
    body
  );

  return { subject, html, text: stripHtml(body) };
}

export function renderChallengeCompletedEmail(payload: ChallengeCompletedPayload): RenderedEmail {
  const subject = `⭐ Desafio completado: ${payload.challengeName}`;
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
      Excelente cierre de semana. ${payload.petName} completo <strong>${payload.challengeName}</strong>.
    </p>
    <p style="margin:0 0 10px;font-size:15px;color:#334155;">Logro destacado: <strong>${payload.metricLabel}</strong></p>
    <p style="margin:0 0 10px;font-size:15px;color:#334155;">Recompensa: <strong>${payload.rewardLabel}</strong></p>
    <p style="margin:0;font-size:15px;color:#334155;">Proximo desafio: <strong>${payload.nextChallengeLabel}</strong></p>
  `;

  const html = renderBaseEmail(
    payload,
    { accent: '#10b981', surface: '#ecfdf5', text: '#047857' },
    `Desafio semanal superado por ${payload.petName}`,
    body
  );

  return { subject, html, text: stripHtml(body) };
}

export function renderStreakRiskEmail(payload: StreakRiskPayload): RenderedEmail {
  const subject = `⚠️ ${payload.petName} podria perder su racha hoy`;
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
      Todavia estas a tiempo. Quedan <strong>${payload.hoursLeft} horas</strong> para salvar una racha de ${payload.currentStreak} dias.
    </p>
    <p style="margin:0 0 10px;font-size:15px;color:#334155;">Falta registrar: <strong>${payload.missingItems.join(', ')}</strong></p>
    <p style="margin:0;font-size:15px;color:#334155;">Proximo hito: <strong>${payload.nextMilestoneLabel}</strong></p>
  `;

  const html = renderBaseEmail(
    payload,
    { accent: '#f97316', surface: '#fff7ed', text: '#c2410c' },
    `No dejes caer la racha de ${payload.petName}`,
    body
  );

  return { subject, html, text: stripHtml(body) };
}

export function renderMilestoneEmail(payload: MilestonePayload): RenderedEmail {
  const subject = `🎉 Nuevo hito para ${payload.petName}`;
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
      ${payload.milestoneDescription}
    </p>
    <p style="margin:0 0 10px;font-size:15px;color:#334155;">Promedio actual: <strong>${payload.averagePointsLabel}</strong></p>
    <p style="margin:0;font-size:15px;color:#334155;">Siguiente meta: <strong>${payload.nextGoal}</strong></p>
  `;

  const html = renderBaseEmail(
    payload,
    { accent: '#8b5cf6', surface: '#f5f3ff', text: '#6d28d9' },
    payload.milestoneTitle,
    body
  );

  return { subject, html, text: stripHtml(body) };
}
