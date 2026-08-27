export type BodyType = "Coupe" | "SUV" | "Truck" | "Van" | "Wagon";

export type ShopModel = {
  name: string;
  body: BodyType;
  href: string;
  image: string;
  description: string;
};

function studio(model: string, body: string, year = 2026) {
  const file = `${year}_76.png`;
  const path = `https://images.dealer.com/ddc/vehicles/${year}/Ford/${encodeURIComponent(model)}/${encodeURIComponent(body)}/perspective/front-left/${file}`;
  return year === 2026 && model === "Expedition" ? path : `${path}?impolicy=resize&w=640`;
}

export const shopBodyTypes: BodyType[] = ["Coupe", "SUV", "Truck", "Van"];

export const shopModels: ShopModel[] = [
  {
    name: "Explorer",
    body: "SUV",
    href: "/inventory?brand=ford&model=Explorer",
    image: studio("Explorer", "SUV"),
    description: "Family SUV with three rows and Ford capability.",
  },
  {
    name: "Expedition",
    body: "SUV",
    href: "/inventory?brand=ford&model=Expedition",
    image: studio("Expedition", "SUV", 2025),
    description: "Full-size SUV for people, cargo, and towing.",
  },
  {
    name: "Mustang GT",
    body: "Coupe",
    href: "/inventory?brand=ford&model=Mustang",
    image: "/models/mustang-gt.png?v=4",
    description: "Iconic Ford GT coupe with 5.0L V8 power.",
  },
  {
    name: "Ranger",
    body: "Truck",
    href: "/inventory?brand=ford&model=Ranger",
    image: studio("Ranger", "Truck"),
    description: "Midsize truck with Built Ford Tough capability.",
  },
  {
    name: "Transit",
    body: "Van",
    href: "/inventory?brand=ford&model=Transit",
    image: studio("Transit-250 Cargo", "Van"),
    description: "Commercial van for cargo and work crews.",
  },
];
