import { terms, reminderMin, numbers, emails, emit, write_terms, write_reminderMin, write_numbers } from "./part-01";

export function addTerm(name: string, schedule: string) {
  if (!name.trim()) return;
  write_terms([...terms, { id: `P-${terms.length + 1}`, name: name.trim(), schedule: schedule.trim() }]);
  emit();
}

export function setReminderMin(n: number) {
  write_reminderMin(Math.max(5, Math.min(120, n)));
  emit();
}

export function setOfficeNumber(office: string, number: string) {
  write_numbers(numbers.map((n) => (n.office === office ? { ...n, number } : n)));
  emit();
}

export function getFromNumbers() {
  return numbers;
}

export function getFromEmails() {
  return emails;
}
