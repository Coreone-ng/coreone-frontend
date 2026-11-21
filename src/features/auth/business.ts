export type Option = { value: string; label: string };
export type BusinessOptions = {
  industries: Option[];
  business_structures: Option[];
  owner_roles: Option[];
  employee_ranges: Option[];
  goals: Option[];
};
export type BusinessDraft = {
  legal_name: string;
  industry: string;
  business_structure: string;
  owner_role: string;
  employee_range: string;
  goals: string[];
};
export function businessErrors(
  input: Record<string, unknown>,
  options: BusinessOptions,
) {
  const errors: Record<string, string> = {};
  if (
    typeof input.legal_name !== "string" ||
    !input.legal_name.trim() ||
    input.legal_name.trim().length > 200
  )
    errors.legal_name = "Enter a business name of 1–200 characters.";
  for (const [field, list] of [
    ["industry", options.industries],
    ["business_structure", options.business_structures],
    ["owner_role", options.owner_roles],
    ["employee_range", options.employee_ranges],
  ] as const) {
    if (!list.some((option) => option.value === input[field]))
      errors[field] = "Choose one of the available options.";
  }
  if (
    !Array.isArray(input.goals) ||
    input.goals.length > 6 ||
    new Set(input.goals).size !== input.goals.length ||
    input.goals.some(
      (goal) =>
        typeof goal !== "string" ||
        !options.goals.some((option) => option.value === goal),
    )
  )
    errors.goals = "Choose up to six different goals from the list.";
  return errors;
}
