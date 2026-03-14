export function formatCurrency(value: number | undefined): string {
  if (typeof value !== "number" && !value) return "-";

  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "ETB",
  });
}
