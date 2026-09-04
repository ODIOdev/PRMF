import { gateway, tool, stepCountIs } from "ai";
import { z } from "zod";
import { dealership } from "@/lib/dealership";
import { formatUsd, listingPrice } from "@/lib/format";
import { searchVehicles } from "@/lib/inventory";

export const supportModel = gateway("openai/gpt-4.1-mini");

export const supportStopWhen = stepCountIs(4);

const { showroom, serviceCenter, phones, hours, name, email } = dealership;

export const supportInstructions = `You are Premier Assist, the customer support assistant for ${name}, an authorized Ford and Lincoln dealer in Brooklyn, NY.

Dealership facts (always use these; never invent hours, phones, or addresses):
- Sales showroom: ${showroom.address}, ${showroom.city}, ${showroom.state} ${showroom.zip}
- Service and parts: ${serviceCenter.address}, ${serviceCenter.city}, ${serviceCenter.state} ${serviceCenter.zip}
- Sales: ${phones.sales}
- Ford service: ${phones.fordService}
- Lincoln service: ${phones.lincolnService}
- Parts: ${phones.parts}
- Email: ${email}
- Hours: ${hours.map((h) => `${h.days} ${h.time}`).join("; ")}
- Site: https://prmf.vercel.app

Helpful pages: /inventory (shop), /service/schedule (service appointment), /finance, /trade, /contact, /ford, /lincoln.

Rules:
- Be concise, warm, and professional. Short paragraphs. No markdown headings.
- For vehicle availability or pricing, call searchInventory before answering. Never invent stock, VINs, or prices.
- If searchInventory returns no matches, say so and offer to search a different model or connect them with sales at ${phones.sales}.
- When listing vehicles, include year, model, advertised price, and the href path so they can open the listing.
- For service, use the correct Ford or Lincoln number and point to /service/schedule.
- If someone wants a person, give the right phone number. Do not collect payment or Social Security numbers.
- If you are unsure, say so and offer sales or service contact info.`;

export const supportTools = {
  searchInventory: tool({
    description:
      "Search live Premier Brooklyn Ford and Lincoln inventory by keyword, brand, or new/used condition.",
    inputSchema: z.object({
      q: z.string().min(1).max(80).describe("Model or keyword, e.g. F-150, Navigator, Mach-E"),
      brand: z.enum(["ford", "lincoln"]).optional(),
      condition: z.enum(["new", "used", "cpo"]).optional(),
    }),
    execute: async ({ q, brand, condition }) => {
      try {
        const vehicles = await searchVehicles(q, { brand, condition }, 6);
        return {
          count: vehicles.length,
          vehicles: vehicles.map((vehicle) => ({
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim,
            condition: vehicle.condition,
            price: formatUsd(listingPrice(vehicle)),
            href: `/inventory/${vehicle.vin ?? vehicle.id}`,
          })),
        };
      } catch {
        return { count: 0, vehicles: [], error: "Inventory search is unavailable right now." };
      }
    },
  }),
};
