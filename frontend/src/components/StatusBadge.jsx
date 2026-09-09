import { statusOf, STATUS_LABEL } from "@/lib/inventory";

const MAP = {
  red: "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  yellow: "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  green: "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
};

export const StatusBadge = ({ batch, status, label, testid }) => {
  const s = status || statusOf(batch);
  return (
    <span
      data-testid={testid}
      className={`inline-flex items-center gap-1.5 border font-semibold px-2.5 py-1 rounded-full text-xs ${MAP[s]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s === "red" ? "bg-rose-500" : s === "yellow" ? "bg-amber-500" : "bg-emerald-500"}`} />
      {label || STATUS_LABEL[s]}
    </span>
  );
};
