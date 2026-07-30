export type PackingTemplateItem = {
  label: string;
  category: string;
};

/** Starter packing list seeded when a trip has no items yet. */
export const DEFAULT_PACKING_TEMPLATE: PackingTemplateItem[] = [
  { category: "Documents", label: "Driver’s license" },
  { category: "Documents", label: "International Driving Permit (if required)" },
  { category: "Documents", label: "Passport / ID copies (offline)" },
  { category: "Documents", label: "Vehicle rental + insurance docs" },
  { category: "Documents", label: "Hotel / ferry booking references" },
  { category: "Tech", label: "Phone mount" },
  { category: "Tech", label: "Multi-port charger + country adapters" },
  { category: "Bags", label: "Soft duffels (hatchback-friendly)" },
  { category: "Bags", label: "Daypack for short hikes / city walks" },
  { category: "Comfort", label: "Reusable water bottles + road snacks" },
  { category: "Comfort", label: "Weather layers for mountain / coastal swings" },
  { category: "Safety", label: "First-aid kit + microfiber cloths" },
  { category: "Backup", label: "Printed Day 1–2 outline for low-signal valleys" },
];

export function createDefaultPackingItems<T>(
  factory: (input: {
    label: string;
    packed: boolean;
    sortOrder: number;
    category: string;
  }) => T,
): T[] {
  return DEFAULT_PACKING_TEMPLATE.map((item, index) =>
    factory({
      label: item.label,
      packed: false,
      sortOrder: index,
      category: item.category,
    }),
  );
}
