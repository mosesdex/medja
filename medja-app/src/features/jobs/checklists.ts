/** Default checklist items seeded onto a new job, by job type. */
export const DEFAULT_CHECKLISTS: Record<string, string[]> = {
  residential: [
    "All bedrooms — dust, mop, wardrobes",
    "Toilets & bathrooms — scrub, disinfect",
    "Kitchen — degrease, cabinets, appliances",
    "Living & dining — furniture, floors",
    "Windows & nets",
    "Final walkthrough with client",
  ],
  commercial: [
    "Reception & common areas",
    "Workstations & desks",
    "Toilets — restock & disinfect",
    "Kitchen / pantry",
    "Empty all bins",
    "Floors — sweep & mop",
  ],
  post_construction: [
    "Remove debris & waste",
    "Dust removal — all surfaces & fittings",
    "Paint & cement stain removal",
    "Windows, frames & glass",
    "Deep floor clean",
    "Final snag walkthrough",
  ],
};
