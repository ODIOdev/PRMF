export const dealership = {
  name: "Premier Brooklyn",
  tagline: "Ford and Lincoln in Brooklyn. Transparent pricing, fast financing, service you can schedule online.",
  showroom: {
    name: "Sales showroom",
    address: "5001 Glenwood Rd",
    city: "Brooklyn",
    state: "NY",
    zip: "11234",
  },
  serviceCenter: {
    name: "Service and parts",
    address: "1072 E 49th St",
    city: "Brooklyn",
    state: "NY",
    zip: "11234",
  },
  phones: {
    sales: "718-677-0619",
    fordService: "718-677-0619",
    lincolnService: "718-859-5200",
    parts: "718-859-5210",
  },
  email: "sales@premierfordsales.com",
  hours: [
    { days: "Monday – Thursday", time: "9:00 AM – 9:00 PM" },
    { days: "Friday", time: "9:00 AM – 7:30 PM" },
    { days: "Saturday", time: "9:00 AM – 6:00 PM" },
    { days: "Sunday", time: "11:00 AM – 5:00 PM" },
  ],
} as const;

export const brands = ["ford", "lincoln"] as const;
export type Brand = (typeof brands)[number];
