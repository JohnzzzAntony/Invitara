import { DateTime } from 'luxon';

export function eventExpiry(date, zone, now = Date.now()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || typeof zone !== 'string') throw new Error('Choose a valid event date and timezone.');
  const day = DateTime.fromISO(date, { zone });
  if (!day.isValid || day.toISODate() !== date) throw new Error('Choose a valid event date and timezone.');
  const expires = day.plus({ days: 1 }).startOf('day').toMillis();
  if (expires <= now) throw new Error('The event date must be today or later in the event timezone.');
  if (day.year > DateTime.fromMillis(now).year + 5) throw new Error('Choose an event within the next five years.');
  return expires;
}

export function editable(project, now = Date.now()) {
  return !!project?.paid && Number.isFinite(project.expiresAt) && now < project.expiresAt;
}
