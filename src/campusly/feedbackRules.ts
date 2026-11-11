export function feedbackError(form: {
  kind: string;
  module: string;
  target?: string;
  course?: string;
  targetCourse?: string;
  rating?: number;
  message: string;
}) {
  if (!String(form.message || "").trim()) return "Please enter your comments or reason.";
  if (form.kind === "module_shift") {
    if (!form.course) return "Please select your current course.";
    if (!form.targetCourse) return "Please select the requested course.";
    if (form.course === form.targetCourse) return "Choose a different course to shift to.";
    return "";
  }
  if (!form.module) return "Please select a module.";
  if (
    !Number.isInteger(Number(form.rating)) ||
    Number(form.rating) < 1 ||
    Number(form.rating) > 5
  ) {
    return "Please choose a rating from 1 to 5.";
  }
  return "";
}
