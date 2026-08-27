export type NavLink = { label: string; href: string };
export type NavColumn = { heading: string; links: NavLink[]; note?: string };
export type NavItem = {
  id: string;
  label: string;
  href?: string;
  columns?: NavColumn[];
};

export const mainNav: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  {
    id: "shop",
    label: "Shop",
    columns: [
      {
        heading: "New Ford Inventory",
        links: [
          { label: "New Ford Inventory", href: "/inventory?brand=ford&condition=new" },
          { label: "New Commercial Inventory", href: "/inventory?brand=ford&commercial=1" },
          { label: "New Ford Specials", href: "/specials/new-ford" },
          { label: "Model Year End Sale", href: "/inventory?brand=ford&condition=new&year=2025,2024" },
          { label: "Custom Order Your New Ford", href: "/shop/custom-order" },
          { label: "Buy a Car Online", href: "/shop/buy-online" },
          { label: "Ford Vehicle Research", href: "/shop/research" },
        ],
      },
      {
        heading: "Pre-Owned Inventory",
        links: [
          { label: "Used Vehicle Inventory", href: "/inventory?condition=used" },
          { label: "Featured Used Vehicles", href: "/inventory?condition=used" },
          { label: "Find it for me", href: "/shop/find-it-for-me" },
          { label: "Value Your Trade", href: "/trade" },
        ],
      },
      {
        heading: "Lincoln",
        links: [
          { label: "New Lincoln Inventory", href: "/inventory?brand=lincoln&condition=new" },
          { label: "Used Lincoln Inventory", href: "/inventory?brand=lincoln&condition=used" },
          { label: "Shop Lincoln", href: "/lincoln" },
        ],
      },
      {
        heading: "Shop By Model",
        links: [],
      },
    ],
  },
  {
    id: "ev",
    label: "EV Hub",
    columns: [
      {
        heading: "Shop",
        links: [
          { label: "Shop F-150 Lightning", href: "/inventory?q=Lightning" },
          { label: "Shop Mustang Mach-E", href: "/inventory?q=Mach-E" },
          { label: "Shop All Ford EVs", href: "/inventory?brand=ford&ev=1" },
        ],
      },
      {
        heading: "Research",
        links: [
          { label: "Discover Ford EVs", href: "/ev" },
          { label: "Ford F-150 Lightning", href: "/ev/f-150-lightning" },
          { label: "Ford Mustang Mach-E", href: "/ev/mustang-mach-e" },
          { label: "Learn More About Ford Electric Vehicles", href: "/ev/ownership" },
          { label: "Electric Vehicle Portal", href: "/ev/portal" },
          { label: "Electric Vehicle Range Performance", href: "/ev/charging" },
        ],
      },
    ],
  },
  {
    id: "commercial",
    label: "Commercial",
    href: "/commercial",
    columns: [
      {
        heading: "Commercial",
        links: [
          { label: "Commercial Vehicles", href: "/commercial" },
          { label: "New Ford Commercial Vehicles", href: "/inventory?brand=ford&commercial=1" },
          { label: "Section 179 Information", href: "/commercial/section-179" },
          { label: "Ford Transit Commercial", href: "/inventory?q=Transit" },
        ],
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    columns: [
      {
        heading: "Finance",
        links: [
          { label: "Finance Center", href: "/finance" },
          { label: "Apply For Credit", href: "/finance/apply" },
          { label: "Buying vs. Leasing a Ford", href: "/finance/buying-vs-leasing" },
          { label: "Is Now a Good Time to Buy a Car?", href: "/finance/good-time-to-buy" },
          { label: "Tax Deduction For Ford", href: "/commercial/section-179" },
          { label: "Value Your Trade", href: "/trade" },
        ],
      },
      {
        heading: "Specials",
        links: [
          { label: "New Ford Specials", href: "/specials/new-ford" },
          { label: "Service & Parts Specials", href: "/specials/service" },
          { label: "Manufacturer Offers", href: "/specials/manufacturer" },
          { label: "Regional Incentives", href: "/specials/regional" },
        ],
      },
    ],
  },
  {
    id: "service",
    label: "Service",
    columns: [
      {
        heading: "Service",
        links: [
          { label: "Service Center", href: "/service" },
          { label: "Schedule Service", href: "/service/schedule" },
          { label: "Mobile Service", href: "/service/mobile" },
          { label: "Pickup & Delivery", href: "/service/pickup-delivery" },
          { label: "Service & Parts Specials", href: "/specials/service" },
          { label: "FordProtect", href: "/service/fordprotect" },
          { label: "FordPass", href: "/service/fordpass" },
        ],
      },
      {
        heading: "Maintenance",
        links: [
          { label: "Battery Replacement", href: "/service/battery-replacement" },
          { label: "Brakes", href: "/service/brakes" },
          { label: "Oil Change", href: "/service/oil" },
          { label: "Tires", href: "/service/tires" },
          { label: "Tire Center", href: "/service/tire-center" },
          { label: "Battery Service", href: "/service/battery" },
          { label: "General Maintenance", href: "/service/maintenance" },
          { label: "Wheel Alignment", href: "/service/alignment" },
        ],
      },
      {
        heading: "Parts",
        links: [
          { label: "Shop Ford Parts", href: "/parts" },
          { label: "Parts Brands", href: "/parts/brands" },
          { label: "Parts Center", href: "/parts/center" },
          { label: "Accessories", href: "/parts/accessories" },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "About",
    columns: [
      {
        heading: "About The Dealership",
        links: [
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Directions", href: "/about/directions" },
          { label: "Employment", href: "/about/employment" },
          { label: "Ford Dealer", href: "/about/ford-dealer" },
          { label: "Staff", href: "/about/staff" },
          { label: "Join the Referral Club", href: "/about/referral-club" },
          { label: "Premier Ford Renovation", href: "/about/renovation" },
          { label: "Our Blog", href: "/about/blog" },
        ],
      },
      {
        heading: "Reviews",
        links: [
          { label: "Reviews", href: "/about/reviews" },
          { label: "Write a Review", href: "/about/write-a-review" },
        ],
      },
      {
        heading: "Showroom Hours — 5001 Glenwood Rd",
        links: [],
        note: "Monday – Thursday 9:00 AM – 9:00 PM\nFriday 9:00 AM – 7:30 PM\nSaturday 9:00 AM – 6:00 PM\nSunday 11:00 AM – 5:00 PM",
      },
      {
        heading: "Service Hours — 1072 E 49th St",
        links: [],
        note: "Ford service 718-677-0619\nLincoln service 718-859-5200\nParts 718-859-5210",
      },
    ],
  },
  { id: "espanol", label: "Español", href: "/espanol" },
];

export function navWithModels(models: string[]): NavItem[] {
  return mainNav.map((item) => {
    if (item.id !== "shop" || !item.columns) return item;
    return {
      ...item,
      columns: item.columns.map((col) =>
        col.heading === "Shop By Model"
          ? {
              ...col,
              links: models.slice(0, 10).map((model) => ({
                label: model,
                href: `/inventory?model=${encodeURIComponent(model)}`,
              })),
            }
          : col,
      ),
    };
  });
}
