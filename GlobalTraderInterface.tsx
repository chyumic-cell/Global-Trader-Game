import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  Anchor,
  ArrowRight,
  BanknoteArrowUp,
  Boxes,
  Briefcase,
  Clock3,
  Crosshair,
  Globe,
  IdCard,
  LayoutDashboard,
  MapPin,
  Minus,
  Package,
  Plane,
  Plus,
  ShieldAlert,
  ShieldX,
  ShoppingCart,
  Skull,
  TrendingUp,
  Truck,
  Train,
  ShipWheel,
  Trash2,
  Wallet,
  Warehouse,
  ZoomIn,
  ZoomOut,
  Landmark,
  Siren,
  Scale,
  Gavel,
} from "lucide-react";

/* --------------------------------- DATA --------------------------------- */

const cityMapPositions: Record<string, { x: number; y: number }> = {
  "New York": { x: 22, y: 34 },
  Chicago: { x: 18, y: 31 },
  "Los Angeles": { x: 9, y: 37 },
  Toronto: { x: 21, y: 28 },
  "Mexico City": { x: 15, y: 47 },
  London: { x: 43, y: 25 },
  Paris: { x: 45, y: 29 },
  Berlin: { x: 49, y: 25 },
  Moscow: { x: 58, y: 22 },
  Istanbul: { x: 53, y: 33 },
  Nairobi: { x: 57, y: 59 },
  Lagos: { x: 47, y: 56 },
  Johannesburg: { x: 55, y: 79 },
  Cairo: { x: 55, y: 42 },
  Casablanca: { x: 42, y: 39 },
  "Sao Paulo": { x: 30, y: 73 },
  "Buenos Aires": { x: 28, y: 86 },
  Lima: { x: 20, y: 72 },
  Bogota: { x: 19, y: 59 },
  Santiago: { x: 21, y: 88 },
  Dubai: { x: 62, y: 40 },
  Singapore: { x: 77, y: 61 },
  Tokyo: { x: 88, y: 34 },
  Shanghai: { x: 82, y: 38 },
  "Hong Kong": { x: 80, y: 45 },
  Mumbai: { x: 71, y: 49 },
  Bangkok: { x: 78, y: 51 },
  Seoul: { x: 86, y: 31 },
  Jakarta: { x: 79, y: 68 },
  Manila: { x: 86, y: 54 },
};

const continentColors: Record<string, string> = {
  "North America": "bg-blue-500/80",
  Europe: "bg-emerald-500/80",
  Africa: "bg-amber-500/80",
  "South America": "bg-rose-500/80",
  Asia: "bg-violet-500/80",
};

const world = {
  "North America": ["New York", "Chicago", "Los Angeles", "Toronto", "Mexico City"],
  Europe: ["London", "Paris", "Berlin", "Moscow", "Istanbul"],
  Africa: ["Nairobi", "Lagos", "Johannesburg", "Cairo", "Casablanca"],
  "South America": ["Sao Paulo", "Buenos Aires", "Lima", "Bogota", "Santiago"],
  Asia: ["Dubai", "Singapore", "Tokyo", "Shanghai", "Hong Kong", "Mumbai", "Bangkok", "Seoul", "Jakarta", "Manila"],
};

const cityToContinent = Object.entries(world).reduce((acc, [continent, cities]) => {
  cities.forEach((city) => {
    acc[city] = continent;
  });
  return acc;
}, {} as Record<string, string>);

const allCities = Object.values(world).flat();

type CityProfile = {
  continent: string;
  law: number;
  corruption: number;
  piracy: number;
  airportLoss: number;
  trainUse: boolean;
  shipUse: boolean;
  truckUse: boolean;
  safeHaven: boolean;
  strictEntry: boolean;
};

const cityProfiles: Record<string, CityProfile> = {
  "New York": { continent: "North America", law: 0.92, corruption: 0.12, piracy: 0.02, airportLoss: 0.03, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: true },
  Chicago: { continent: "North America", law: 0.82, corruption: 0.18, piracy: 0.02, airportLoss: 0.03, trainUse: true, shipUse: false, truckUse: true, safeHaven: false, strictEntry: false },
  "Los Angeles": { continent: "North America", law: 0.82, corruption: 0.18, piracy: 0.08, airportLoss: 0.04, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: true },
  Toronto: { continent: "North America", law: 0.9, corruption: 0.1, piracy: 0.01, airportLoss: 0.02, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: true },
  "Mexico City": { continent: "North America", law: 0.6, corruption: 0.45, piracy: 0.04, airportLoss: 0.05, trainUse: false, shipUse: false, truckUse: true, safeHaven: false, strictEntry: false },
  London: { continent: "Europe", law: 0.93, corruption: 0.08, piracy: 0.02, airportLoss: 0.02, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: true },
  Paris: { continent: "Europe", law: 0.9, corruption: 0.12, piracy: 0.02, airportLoss: 0.02, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: true },
  Berlin: { continent: "Europe", law: 0.95, corruption: 0.05, piracy: 0.01, airportLoss: 0.02, trainUse: true, shipUse: false, truckUse: true, safeHaven: false, strictEntry: true },
  Moscow: { continent: "Europe", law: 0.72, corruption: 0.34, piracy: 0.02, airportLoss: 0.04, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  Istanbul: { continent: "Europe", law: 0.68, corruption: 0.32, piracy: 0.05, airportLoss: 0.04, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  Nairobi: { continent: "Africa", law: 0.45, corruption: 0.55, piracy: 0.08, airportLoss: 0.05, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  Lagos: { continent: "Africa", law: 0.38, corruption: 0.66, piracy: 0.15, airportLoss: 0.06, trainUse: false, shipUse: true, truckUse: true, safeHaven: true, strictEntry: false },
  Johannesburg: { continent: "Africa", law: 0.62, corruption: 0.35, piracy: 0.06, airportLoss: 0.04, trainUse: true, shipUse: false, truckUse: true, safeHaven: false, strictEntry: false },
  Cairo: { continent: "Africa", law: 0.58, corruption: 0.38, piracy: 0.04, airportLoss: 0.03, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  Casablanca: { continent: "Africa", law: 0.62, corruption: 0.28, piracy: 0.05, airportLoss: 0.03, trainUse: false, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  "Sao Paulo": { continent: "South America", law: 0.55, corruption: 0.42, piracy: 0.05, airportLoss: 0.05, trainUse: false, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  "Buenos Aires": { continent: "South America", law: 0.65, corruption: 0.3, piracy: 0.04, airportLoss: 0.03, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  Lima: { continent: "South America", law: 0.48, corruption: 0.5, piracy: 0.06, airportLoss: 0.05, trainUse: false, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  Bogota: { continent: "South America", law: 0.42, corruption: 0.58, piracy: 0.05, airportLoss: 0.05, trainUse: false, shipUse: false, truckUse: true, safeHaven: true, strictEntry: false },
  Santiago: { continent: "South America", law: 0.7, corruption: 0.22, piracy: 0.03, airportLoss: 0.03, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  Dubai: { continent: "Asia", law: 0.78, corruption: 0.28, piracy: 0.03, airportLoss: 0.03, trainUse: false, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  Singapore: { continent: "Asia", law: 0.98, corruption: 0.03, piracy: 0.02, airportLoss: 0.02, trainUse: false, shipUse: true, truckUse: true, safeHaven: false, strictEntry: true },
  Tokyo: { continent: "Asia", law: 0.96, corruption: 0.04, piracy: 0.02, airportLoss: 0.02, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: true },
  Shanghai: { continent: "Asia", law: 0.84, corruption: 0.16, piracy: 0.03, airportLoss: 0.03, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  "Hong Kong": { continent: "Asia", law: 0.76, corruption: 0.2, piracy: 0.03, airportLoss: 0.03, trainUse: false, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  Mumbai: { continent: "Asia", law: 0.55, corruption: 0.42, piracy: 0.04, airportLoss: 0.05, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  Bangkok: { continent: "Asia", law: 0.5, corruption: 0.45, piracy: 0.05, airportLoss: 0.05, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  Seoul: { continent: "Asia", law: 0.92, corruption: 0.08, piracy: 0.02, airportLoss: 0.02, trainUse: true, shipUse: true, truckUse: true, safeHaven: false, strictEntry: true },
  Jakarta: { continent: "Asia", law: 0.52, corruption: 0.46, piracy: 0.1, airportLoss: 0.05, trainUse: false, shipUse: true, truckUse: true, safeHaven: false, strictEntry: false },
  Manila: { continent: "Asia", law: 0.48, corruption: 0.5, piracy: 0.12, airportLoss: 0.05, trainUse: false, shipUse: true, truckUse: true, safeHaven: true, strictEntry: false },
};

const productCatalog = {
  "Fresh Produce": ["Apples", "Bananas", "Beef", "Fish", "Livestock"],
  "Dried Food": ["Wheat", "Rice", "Coffee", "Spices"],
  Electronics: ["TVs", "Phones", "Laptops", "Microchips"],
  Industrial: ["Oil", "Steel", "Timber", "Chemicals"],
  Luxury: ["Diamonds", "Gold", "Watches"],
  Contraband: ["Drugs", "Weapons", "Counterfeit Goods"],
};

const illegalGoods = new Set(productCatalog.Contraband);
const allItems = Object.values(productCatalog).flat();

const basePrices: Record<string, number> = {
  Apples: 12,
  Bananas: 10,
  Beef: 35,
  Fish: 28,
  Livestock: 120,
  Wheat: 30,
  Rice: 24,
  Coffee: 18,
  Spices: 22,
  TVs: 420,
  Phones: 650,
  Laptops: 900,
  Microchips: 1200,
  Oil: 80,
  Steel: 70,
  Timber: 45,
  Chemicals: 95,
  Diamonds: 5000,
  Gold: 2100,
  Watches: 650,
  Drugs: 2000,
  Weapons: 1500,
  "Counterfeit Goods": 220,
};

const cityModifiers: Record<string, Record<string, number>> = {
  "New York": { Diamonds: 0.7, Wheat: 1.45, TVs: 1.15, Phones: 1.08, Gold: 1.1 },
  Chicago: { Wheat: 1.2, Oil: 1.05, Beef: 0.88, Steel: 0.9 },
  "Los Angeles": { TVs: 1.18, Phones: 1.12, Drugs: 1.15, Fish: 0.9 },
  Toronto: { Diamonds: 0.9, Wheat: 1.25, Timber: 0.82, Chemicals: 1.08 },
  "Mexico City": { Drugs: 0.72, Weapons: 0.88, Phones: 1.1, Coffee: 0.84, "Counterfeit Goods": 0.8 },
  London: { Diamonds: 1.05, Watches: 1.08, Weapons: 1.3, Gold: 1.12 },
  Paris: { Wheat: 1.2, Diamonds: 1.1, Watches: 0.9, Beef: 1.1 },
  Berlin: { Laptops: 0.82, Drugs: 1.25, Chemicals: 0.86, Steel: 0.92 },
  Moscow: { Weapons: 0.7, Oil: 0.88, Phones: 1.1, Steel: 0.84 },
  Istanbul: { Weapons: 0.9, Wheat: 1.15, Drugs: 1.05, Spices: 0.78, Gold: 0.95 },
  Nairobi: { Wheat: 0.7, Laptops: 1.2, Drugs: 0.95, Livestock: 0.74, Coffee: 0.8 },
  Lagos: { Oil: 0.75, Phones: 1.22, Weapons: 0.92, Chemicals: 1.1 },
  Johannesburg: { Diamonds: 0.78, Wheat: 1.18, Gold: 0.86, Beef: 0.9 },
  Cairo: { Wheat: 0.82, Weapons: 1.08, Spices: 0.84, Fish: 0.92 },
  Casablanca: { Oil: 0.9, Drugs: 1.1, Fish: 0.86, Coffee: 0.9 },
  "Sao Paulo": { Drugs: 0.68, Weapons: 0.92, TVs: 1.08, Coffee: 0.7, Beef: 0.82 },
  "Buenos Aires": { Wheat: 0.8, Laptops: 1.06, Beef: 0.74, Chemicals: 1.05 },
  Lima: { Drugs: 0.72, Weapons: 0.95, Oil: 1.1, Fish: 0.76, Gold: 0.92 },
  Bogota: { Drugs: 0.62, Weapons: 0.9, Phones: 1.08, Coffee: 0.66, "Counterfeit Goods": 0.76 },
  Santiago: { Wheat: 0.85, Diamonds: 1.1, Timber: 0.82, Microchips: 1.08 },
  Dubai: { Oil: 0.7, Phones: 0.82, Drugs: 1.18, Gold: 0.76, Watches: 0.84 },
  Singapore: { Laptops: 0.6, Weapons: 1.25, Drugs: 1.3, Microchips: 0.66, TVs: 0.74 },
  Tokyo: { Laptops: 0.74, Wheat: 1.18, Microchips: 0.72, Fish: 1.08 },
  Shanghai: { Phones: 0.78, Oil: 0.92, TVs: 0.7, Steel: 0.86 },
  "Hong Kong": { Diamonds: 0.82, Watches: 0.8, Gold: 0.88, Phones: 0.84 },
  Mumbai: { Drugs: 0.86, Wheat: 0.76, Phones: 1.05, Spices: 0.62, Rice: 0.74 },
  Bangkok: { Drugs: 0.78, Weapons: 1.05, TVs: 0.95, Rice: 0.72, Fish: 0.82 },
  Seoul: { Phones: 0.72, Wheat: 1.12, Microchips: 0.68, Laptops: 0.76 },
  Jakarta: { Oil: 0.82, Weapons: 0.96, Drugs: 0.82, Timber: 0.74, Fish: 0.78 },
  Manila: { Drugs: 0.8, Weapons: 0.95, TVs: 1.08, Fish: 0.8, Bananas: 0.7 },
};

/* -------------------------------- TYPES -------------------------------- */

type TransportName = "Truck" | "Train" | "Plane" | "Ship";
type ScreenName = "main" | "market" | "logistics" | "storage" | "intel";

type SecurityState = {
  insurance: boolean;
  guards: boolean;
  bribe: boolean;
  stealth: boolean;
};

type ShipmentLoad = {
  item: string;
  qty: number;
};

type Shipment = {
  id: number;
  loads: ShipmentLoad[];
  totalQty: number;
  from: string;
  to: string;
  turns: number;
  originalTurns: number;
  transport: TransportName;
  security: SecurityState;
  totalCost: number;
  risk: number;
};

type IncidentType = "pirates" | "airportLoss" | "customs" | "police" | "judge";
type IncidentAction = "customsBribe" | "policeBribe" | "judgeBribe" | "acceptLoss";

type Incident = {
  id: string;
  type: IncidentType;
  shipment?: Shipment;
  title: string;
  description: string;
  options: IncidentAction[];
};

type CityStorage = Record<string, Record<string, number>>;
type StoragePlan = Record<string, boolean>;
type ManipulationState = Record<string, Record<string, number>>;
type PriceHistoryRow = { turn: number; [key: string]: string | number };
type MarketState = Record<string, Record<string, number>>;

/* -------------------------------- RULES -------------------------------- */

const transportTypes: Record<
  TransportName,
  { costPerUnit: number; time: number; baseRisk: number; capacity: number; icon: any; mode: string }
> = {
  Truck: { costPerUnit: 10, time: 2, baseRisk: 0.14, capacity: 40, icon: Truck, mode: "land" },
  Train: { costPerUnit: 7, time: 3, baseRisk: 0.09, capacity: 80, icon: Train, mode: "rail" },
  Plane: { costPerUnit: 25, time: 1, baseRisk: 0.05, capacity: 20, icon: Plane, mode: "air" },
  Ship: { costPerUnit: 5, time: 5, baseRisk: 0.2, capacity: 150, icon: ShipWheel, mode: "sea" },
};

const securityOptions = {
  insurance: { label: "Insurance", cost: 500, description: "Pays after cargo is lost" },
  guards: { label: "Armed Guards", cost: 300, description: "Much better odds against pirates" },
  bribe: { label: "Border Bribe", cost: 200, description: "Helps with corrupt routes" },
  stealth: { label: "False Manifest", cost: 250, description: "Helps hide illegal cargo" },
};

const crisisActions: Record<IncidentAction, { label: string; icon: any }> = {
  customsBribe: { label: "Bribe Customs", icon: Landmark },
  policeBribe: { label: "Bribe Police", icon: Siren },
  judgeBribe: { label: "Bribe Judge", icon: Scale },
  acceptLoss: { label: "Accept Loss", icon: Gavel },
};

const spikeStories = [
  "A regional panic-buying wave rippled through the market.",
  "A surprise logistics bottleneck tightened supply overnight.",
  "Rumors of future scarcity pushed traders into a frenzy.",
  "A sudden procurement rush by large buyers drained local stock.",
];

const dropStories = [
  "A flood of new supply hit the docks without warning.",
  "A botched demand forecast left warehouses overflowing.",
  "Merchants undercut one another and prices sagged fast.",
  "A random shipping glut dumped excess inventory into the city.",
];

/* ------------------------------- HELPERS ------------------------------- */

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function makeEmptyCityStorage(): CityStorage {
  return Object.fromEntries(allCities.map((city) => [city, {}])) as CityStorage;
}

function makeEmptyStoragePlan(): StoragePlan {
  return Object.fromEntries(allCities.map((city) => [city, false])) as StoragePlan;
}

function makeEmptyManipulations(): ManipulationState {
  return Object.fromEntries(allCities.map((city) => [city, {}])) as ManipulationState;
}

function cloneCityStorage(input: CityStorage): CityStorage {
  return Object.fromEntries(
    allCities.map((city) => [city, { ...(input[city] || {}) }]),
  ) as CityStorage;
}

function getTransportVisual(transport: TransportName) {
  if (transport === "Plane") return { icon: Plane, trail: "bg-sky-400", line: "bg-sky-300/70" };
  if (transport === "Ship") return { icon: Anchor, trail: "bg-cyan-400", line: "bg-cyan-300/70" };
  if (transport === "Train") return { icon: Train, trail: "bg-emerald-400", line: "bg-emerald-300/70" };
  return { icon: Truck, trail: "bg-orange-400", line: "bg-orange-300/70" };
}

function getItemCategory(item: string) {
  const entry = Object.entries(productCatalog).find(([, items]) => items.includes(item));
  return entry?.[0] || "Other";
}

function generatePrices(city: string, manipulations?: Record<string, number>, eventShocks?: Record<string, number>) {
  const prices: Record<string, number> = {};
  Object.keys(basePrices).forEach((item) => {
    let price = basePrices[item];
    if (cityModifiers[city]?.[item]) price *= cityModifiers[city][item];
    if (manipulations?.[item]) price *= manipulations[item];
    if (eventShocks?.[item]) price *= eventShocks[item];
    const fluctuation = 0.94 + Math.random() * 0.12;
    prices[item] = Math.max(1, Math.round(price * fluctuation));
  });
  return prices;
}

function getAvailableTransport(from: string, to: string) {
  const sameContinent = cityToContinent[from] === cityToContinent[to];
  const fromProfile = cityProfiles[from];
  const toProfile = cityProfiles[to];

  return (Object.entries(transportTypes) as [TransportName, (typeof transportTypes)[TransportName]][]).filter(([name]) => {
    if (name === "Truck") return sameContinent && fromProfile.truckUse && toProfile.truckUse;
    if (name === "Train") return sameContinent && fromProfile.trainUse && toProfile.trainUse;
    if (name === "Ship") return fromProfile.shipUse && toProfile.shipUse;
    if (name === "Plane") return true;
    return false;
  });
}

function calculateTransportCost({
  loads,
  transportName,
  from,
  to,
  security,
}: {
  loads: ShipmentLoad[];
  transportName: TransportName;
  from: string;
  to: string;
  security: SecurityState;
}) {
  const transport = transportTypes[transportName];
  const sameContinent = cityToContinent[from] === cityToContinent[to];
  const routeMultiplier = sameContinent ? 1 : 1.45;

  const loadCost = loads.reduce((sum, load) => {
    const itemMultiplier = load.item === "Diamonds" ? 1.25 : illegalGoods.has(load.item) ? 1.35 : 1;
    return sum + load.qty * transport.costPerUnit * routeMultiplier * itemMultiplier;
  }, 0);

  const securityCost = (Object.entries(security) as [keyof SecurityState, boolean][])
    .reduce((sum, [key, enabled]) => sum + (enabled ? securityOptions[key].cost : 0), 0);

  return Math.round(loadCost + securityCost);
}

function calculateShipmentRisk({
  shipment,
  destinationProfile,
  notoriety,
}: {
  shipment: Pick<Shipment, "transport" | "security" | "loads">;
  destinationProfile: CityProfile;
  notoriety: number;
}) {
  const transport = transportTypes[shipment.transport];
  let risk = transport.baseRisk;
  risk += destinationProfile.piracy * (shipment.transport === "Ship" ? 0.8 : 0);
  risk += destinationProfile.airportLoss * (shipment.transport === "Plane" ? 0.75 : 0);

  const hasIllegal = shipment.loads.some((load) => illegalGoods.has(load.item));
  if (hasIllegal) {
    risk += destinationProfile.law * 0.35;
    risk -= destinationProfile.corruption * 0.18;
  }

  if (shipment.security.guards) risk -= shipment.transport === "Ship" ? 0.14 : 0.06;
  if (shipment.security.insurance) risk -= 0.02;
  if (shipment.security.bribe) risk -= destinationProfile.corruption * 0.15;
  if (shipment.security.stealth) risk -= hasIllegal ? 0.1 : 0.02;

  risk += notoriety / 220;
  return Math.min(0.92, Math.max(0.01, risk));
}

function getContinentBribeEffect(continent: string, type: "customs" | "police" | "judge") {
  const table = {
    Africa: { customs: 0.82, police: 0.78, judge: 0.95 },
    Asia: { customs: 0.58, police: 0.52, judge: 0.42 },
    Europe: { customs: 0.18, police: 0.14, judge: 0.06 },
    "North America": { customs: 0.12, police: 0.1, judge: 0.03 },
    "South America": { customs: 0.68, police: 0.64, judge: 0.72 },
  } as const;

  return table[continent as keyof typeof table]?.[type] ?? 0.2;
}

function buildPriceHistoryRows(
  history: Record<string, Record<string, number>>[],
  mode: "city" | "good",
  city: string,
  good: string,
) {
  return history.map((snapshot, index) => {
    const row: PriceHistoryRow = { turn: index + 1 };
    if (mode === "city") {
      Object.entries(snapshot[city] || {}).forEach(([item, price]) => {
        row[item] = price;
      });
    } else {
      allCities.forEach((c) => {
        row[c] = snapshot[c]?.[good] ?? 0;
      });
    }
    return row;
  });
}

function createIncident(shipment, destinationProfile, isMidRoute = false) {
  const hasIllegal = shipment.loads.some((load) => illegalGoods.has(load.item));

  if (shipment.transport === "Ship") {
    const pirateChance = clamp(
      0.12 +
        destinationProfile.piracy * 0.95 +
        shipment.risk * 0.18 -
        (shipment.security.guards ? 0.12 : 0),
      0.08,
      0.88,
    );

    if (Math.random() < pirateChance) {
      return {
        id: `${shipment.id}-pirates-${isMidRoute ? "mid" : "end"}`,
        type: "pirates",
        shipment,
        title: isMidRoute ? `Pirate attack on route to ${shipment.to}` : `Pirate attack near ${shipment.to}`,
        description:
          "The route was hit by raiders. Armed guards give you a much better chance of saving the cargo.",
        options: ["acceptLoss"],
      };
    }
  }

  if (shipment.transport === "Plane") {
    const airportChance = clamp(
      0.05 + destinationProfile.airportLoss * 0.95 + shipment.risk * 0.12,
      0.05,
      0.42,
    );

    if (Math.random() < airportChance) {
      return {
        id: `${shipment.id}-airport-${isMidRoute ? "mid" : "end"}`,
        type: "airportLoss",
        shipment,
        title: `Cargo mishandling for ${shipment.to}`,
        description:
          "Ground crews lost part of the shipment. Insurance can soften the damage after the fact.",
        options: ["acceptLoss"],
      };
    }
  }

  if (hasIllegal) {
    const customsChance = clamp(
      0.08 +
        destinationProfile.law * 0.34 +
        (destinationProfile.strictEntry ? 0.1 : 0) +
        shipment.risk * 0.08 -
        destinationProfile.corruption * 0.16 -
        (shipment.security.stealth ? 0.09 : 0) -
        (shipment.security.bribe ? 0.04 : 0),
      0.06,
      0.85,
    );

    if (Math.random() < customsChance) {
      return {
        id: `${shipment.id}-customs-${isMidRoute ? "mid" : "end"}`,
        type: "customs",
        shipment,
        title: `Customs intervention for ${shipment.to}`,
        description:
          "Customs flagged the cargo. You can try bribing them, or accept confiscation and move on.",
        options: ["customsBribe", "acceptLoss"],
      };
    }
  }

  const policeChance = clamp(
    0.04 + destinationProfile.law * 0.12 + shipment.risk * 0.2 + (hasIllegal ? 0.07 : 0),
    0.04,
    0.48,
  );

  if (Math.random() < policeChance) {
    return {
      id: `${shipment.id}-police-${isMidRoute ? "mid" : "end"}`,
      type: "police",
      shipment,
      title: `Police inquiry in ${shipment.to}`,
      description:
        "Authorities started asking questions about the shipment. You can try to make the problem disappear or let it escalate.",
      options: ["policeBribe", "acceptLoss"],
    };
  }

  return null;
}


  if (hasIllegal) {
    const customsChance =
      destinationProfile.law * 0.28 +
      (destinationProfile.strictEntry ? 0.12 : 0) -
      destinationProfile.corruption * 0.16 -
      (shipment.security.stealth ? 0.08 : 0) -
      (shipment.security.bribe ? 0.05 : 0);

    if (Math.random() < clamp(customsChance, 0.04, 0.78)) {
      return {
        id: `${shipment.id}-customs`,
        type: "customs",
        shipment,
        title: `Customs seizure risk in ${shipment.to}`,
        description:
          "Customs flagged the cargo. You can try bribing them, or accept confiscation and move on.",
        options: ["customsBribe", "acceptLoss"],
      };
    }
  }

  const policeChance = destinationProfile.law * 0.08 + shipment.risk * 0.12;
  if (Math.random() < clamp(policeChance, 0.01, 0.28)) {
    return {
      id: `${shipment.id}-police`,
      type: "police",
      shipment,
      title: `Police inquiry in ${shipment.to}`,
      description:
        "Authorities started asking questions about the shipment. You can try to make the problem disappear or let it escalate.",
      options: ["policeBribe", "acceptLoss"],
    };
  }

  return null;
}

function advanceStableMarket({
  market,
  manipulations,
  cityStorage,
  shipments,
  turn,
}: {
  market: MarketState;
  manipulations: ManipulationState;
  cityStorage: CityStorage;
  shipments: Shipment[];
  turn: number;
}) {
  const shockCity = Math.random() < 0.24 ? pickRandom(allCities) : null;
  const shockItem = shockCity ? pickRandom(allItems) : null;
  const shockDirection =
    shockCity && shockItem ? (Math.random() < 0.5 ? "spike" : "drop") : null;
  const shockMultiplier =
    shockDirection === "spike"
      ? 1.38 + Math.random() * 0.22
      : shockDirection === "drop"
        ? 0.66 + Math.random() * 0.16
        : 1;

  const next: MarketState = {};
  const movers: { city: string; item: string; change: number }[] = [];
  const headlines: string[] = [];

  allCities.forEach((city) => {
    next[city] = {};
    allItems.forEach((item) => {
      let target = basePrices[item];
      if (cityModifiers[city]?.[item]) target *= cityModifiers[city][item];
      if (manipulations[city]?.[item]) target *= manipulations[city][item];

      const storedQty = cityStorage[city]?.[item] || 0;
      const inboundQty = shipments.reduce((sum, shipment) => {
        if (shipment.to !== city) return sum;
        const load = shipment.loads.find((entry) => entry.item === item);
        if (!load) return sum;
        return sum + load.qty / Math.max(1, shipment.turns);
      }, 0);

      target *= 1 - Math.min(0.2, storedQty / 260);
      target *= 1 - Math.min(0.12, inboundQty / 180);

      if (city === shockCity && item === shockItem) {
        target *= shockMultiplier;
      }

      const current = market[city]?.[item] ?? target;
      const drift = current + (target - current) * 0.22;
      const noise = drift * (Math.random() * 0.06 - 0.03);
      const price = Math.max(1, Math.round(drift + noise));

      next[city][item] = price;
      movers.push({
        city,
        item,
        change: current ? (price - current) / current : 0,
      });
    });
  });

  if (shockCity && shockItem && shockDirection) {
    const story =
      shockDirection === "spike" ? pickRandom(spikeStories) : pickRandom(dropStories);

    headlines.push(
      `Turn ${turn + 1}: ${shockItem} in ${shockCity} ${shockDirection === "spike" ? "spiked" : "dropped"}. ${story}`,
    );
  }

  movers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const strongest = movers[0];

  if (strongest && Math.abs(strongest.change) > 0.06) {
    headlines.push(
      `Turn ${turn + 1}: ${strongest.item} in ${strongest.city} ${
        strongest.change > 0 ? "is climbing" : "is softening"
      } after local market pressure.`,
    );
  }

  return { next, headlines };
}

/* ------------------------------- COMPONENT ------------------------------ */

export default function GlobalTraderInterface() {
  const [screen, setScreen] = useState<ScreenName>("main");
  const [currentCity, setCurrentCity] = useState("New York");
  const [selectedTravelCity, setSelectedTravelCity] = useState("Chicago");
  const [selectedShipmentDestination, setSelectedShipmentDestination] = useState("Chicago");
  const [selectedShipmentTransport, setSelectedShipmentTransport] = useState<TransportName>("Truck");

  const [money, setMoney] = useState(10000);
  const [cargo, setCargo] = useState<Record<string, number>>({});
  const [cityStorage, setCityStorage] = useState<CityStorage>(() => makeEmptyCityStorage());
  const [storagePlan, setStoragePlan] = useState<StoragePlan>(() => makeEmptyStoragePlan());
  const [turn, setTurn] = useState(1);

  const [marketCategory, setMarketCategory] = useState<keyof typeof productCatalog>("Industrial");
  const [marketItem, setMarketItem] = useState("Oil");
  const [tradeAmount, setTradeAmount] = useState("1");

  const [shipmentItem, setShipmentItem] = useState("Oil");
  const [shipmentAmount, setShipmentAmount] = useState("1");
  const [shipmentDraft, setShipmentDraft] = useState<ShipmentLoad[]>([]);
  const [security, setSecurity] = useState<SecurityState>({
    insurance: false,
    guards: false,
    bribe: false,
    stealth: false,
  });

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [incidentQueue, setIncidentQueue] = useState<Incident[]>([]);

  const [dashboardMode, setDashboardMode] = useState<"city" | "good">("city");
  const [dashboardCity, setDashboardCity] = useState("New York");
  const [dashboardGood, setDashboardGood] = useState("Oil");

  const [mapZoom, setMapZoom] = useState(1);
  const [notoriety, setNotoriety] = useState(0);
  const [fakePassport, setFakePassport] = useState(false);
  const [passportQuality, setPassportQuality] = useState(0);
  const [detainedTurns, setDetainedTurns] = useState(0);

  const [manipulationState, setManipulationState] = useState<ManipulationState>(() =>
    makeEmptyManipulations(),
  );

  const [market, setMarket] = useState<MarketState>(() => {
    const snapshot: MarketState = {};
    allCities.forEach((city) => {
      snapshot[city] = generatePrices(city, {}, {});
    });
    return snapshot;
  });

  const [marketHistory, setMarketHistory] = useState<MarketState[]>(() => {
    const snapshot: MarketState = {};
    allCities.forEach((city) => {
      snapshot[city] = generatePrices(city, {}, {});
    });
    return [snapshot];
  });

  const [marketNews, setMarketNews] = useState<string[]>([]);
  const [message, setMessage] = useState(
    "Welcome trader. Buy low, ship smart, and try not to get arrested.",
  );

  const prices = useMemo(() => market[currentCity] || {}, [market, currentCity]);
  const currentProfile = cityProfiles[currentCity];
  const currentCityStorage = cityStorage[currentCity] || {};
  const cargoCount = Object.values(cargo).reduce((sum, qty) => sum + qty, 0);
  const storedCargoCount = Object.values(currentCityStorage).reduce((sum, qty) => sum + qty, 0);
  const activeIncident = incidentQueue[0] || null;

  const notorietyLabel =
    notoriety < 20 ? "Unknown" : notoriety < 45 ? "Suspicious" : notoriety < 75 ? "Wanted" : "Infamous";

  const shipmentDestinationOptions = allCities.filter((city) => city !== currentCity);
  const travelOptions = allCities.filter((city) => city !== currentCity);

  const availableTransport = useMemo(
    () => getAvailableTransport(currentCity, selectedShipmentDestination),
    [currentCity, selectedShipmentDestination],
  );

  const resolvedTransport =
    availableTransport.find(([name]) => name === selectedShipmentTransport)?.[0] ??
    availableTransport[0]?.[0] ??
    "Plane";

  const selectedTransportStats = transportTypes[resolvedTransport];
  const destinationProfile = cityProfiles[selectedShipmentDestination];

  const routeCostPreview = useMemo(() => {
    if (shipmentDraft.length === 0) return 0;
    return calculateTransportCost({
      loads: shipmentDraft,
      transportName: resolvedTransport,
      from: currentCity,
      to: selectedShipmentDestination,
      security,
    });
  }, [shipmentDraft, resolvedTransport, currentCity, selectedShipmentDestination, security]);

  const routeRiskPreview = useMemo(() => {
    const loads =
      shipmentDraft.length > 0 ? shipmentDraft : [{ item: shipmentItem, qty: 1 }];
    return calculateShipmentRisk({
      shipment: { transport: resolvedTransport, security, loads },
      destinationProfile,
      notoriety,
    });
  }, [shipmentDraft, shipmentItem, resolvedTransport, security, destinationProfile, notoriety]);

  const dashboardRows = useMemo(
    () => buildPriceHistoryRows(marketHistory.slice(-14), dashboardMode, dashboardCity, dashboardGood),
    [marketHistory, dashboardMode, dashboardCity, dashboardGood],
  );

  const dashboardSeries =
    dashboardMode === "city" ? Object.keys(market[dashboardCity] || {}) : allCities;

  const itemCityPrices = useMemo(
    () => allCities.map((city) => ({ city, price: market[city]?.[marketItem] ?? 0 })),
    [market, marketItem],
  );

  const cheapestForItem = useMemo(
    () =>
      itemCityPrices.reduce(
        (best, entry) => (entry.price < best.price ? entry : best),
        itemCityPrices[0] || { city: currentCity, price: 0 },
      ),
    [itemCityPrices, currentCity],
  );

  const priciestForItem = useMemo(
    () =>
      itemCityPrices.reduce(
        (best, entry) => (entry.price > best.price ? entry : best),
        itemCityPrices[0] || { city: currentCity, price: 0 },
      ),
    [itemCityPrices, currentCity],
  );

  const worldAverageForItem = useMemo(() => {
    const total = itemCityPrices.reduce((sum, entry) => sum + entry.price, 0);
    return Math.round(total / Math.max(1, itemCityPrices.length));
  }, [itemCityPrices]);

  function nudgeLocalPrice(city: string, item: string, multiplier: number) {
    setMarket((prev) => ({
      ...prev,
      [city]: {
        ...prev[city],
        [item]: Math.max(1, Math.round((prev[city]?.[item] ?? 1) * multiplier)),
      },
    }));
  }

  function renderCargoList(items: Record<string, number>, emptyText: string) {
    const entries = Object.entries(items).filter(([, qty]) => qty > 0);

    if (entries.length === 0) {
      return <div className="text-sm text-slate-500">{emptyText}</div>;
    }

    return (
      <div className="space-y-2">
        {entries.map(([item, qty]) => (
          <div key={item} className="flex items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm">
            <span>{item}</span>
            <Badge variant="secondary">{qty}</Badge>
          </div>
        ))}
      </div>
    );
  }

  function handleCategoryChange(category: keyof typeof productCatalog) {
    setMarketCategory(category);
    setMarketItem(productCatalog[category][0]);
  }

  function buyItem() {
    const qty = parseInt(tradeAmount, 10);
    if (!qty || qty <= 0) return setMessage("Enter a real amount greater than zero.");

    const unitPrice = prices[marketItem];
    if (!unitPrice) return setMessage("That item is not available here.");

    const cost = unitPrice * qty;
    if (money < cost) return setMessage("Not enough money.");

    setMoney((value) => value - cost);
    setCargo((prev) => ({ ...prev, [marketItem]: (prev[marketItem] || 0) + qty }));
    nudgeLocalPrice(currentCity, marketItem, 1 + Math.min(0.14, qty * 0.01));
    setMessage(`Bought ${qty} ${marketItem} in ${currentCity} for $${cost.toLocaleString()}.`);
  }

  function sellItem() {
    const qty = parseInt(tradeAmount, 10);
    if (!qty || qty <= 0) return setMessage("Enter a real amount greater than zero.");

    const availableHere = (cargo[marketItem] || 0) + (currentCityStorage[marketItem] || 0);
    if (availableHere < qty) return setMessage("Not enough cargo in this city.");

    const revenue = (prices[marketItem] || 0) * qty;
    let remaining = qty;

    setMoney((value) => value + revenue);

    setCityStorage((prev) => {
      const next = cloneCityStorage(prev);
      const stored = next[currentCity][marketItem] || 0;

      if (stored > 0) {
        const useFromStorage = Math.min(stored, remaining);
        next[currentCity][marketItem] = stored - useFromStorage;
        if (next[currentCity][marketItem] <= 0) delete next[currentCity][marketItem];
        remaining -= useFromStorage;
      }

      return next;
    });

    if (remaining > 0) {
      setCargo((prev) => {
        const next = { ...prev, [marketItem]: (prev[marketItem] || 0) - remaining };
        if (next[marketItem] <= 0) delete next[marketItem];
        return next;
      });
    }

    nudgeLocalPrice(currentCity, marketItem, 1 - Math.min(0.14, qty * 0.01));
    setMessage(`Sold ${qty} ${marketItem} in ${currentCity} for $${revenue.toLocaleString()}.`);
  }

  function addToShipmentDraft() {
    const qty = parseInt(shipmentAmount, 10);
    if (!qty || qty <= 0) return setMessage("Enter a real shipment amount.");

    const owned = cargo[shipmentItem] || 0;
    const alreadyAssigned = shipmentDraft
      .filter((load) => load.item === shipmentItem)
      .reduce((sum, load) => sum + load.qty, 0);

    if (owned - alreadyAssigned < qty) {
      return setMessage("You can only assign cargo you actually bought and still have free.");
    }

    setShipmentDraft((prev) => {
      const existing = prev.find((load) => load.item === shipmentItem);
      if (existing) {
        return prev.map((load) =>
          load.item === shipmentItem ? { ...load, qty: load.qty + qty } : load,
        );
      }
      return [...prev, { item: shipmentItem, qty }];
    });

    setMessage(`Added ${qty} ${shipmentItem} to the shipment draft.`);
  }

  function changeDraftQuantity(item: string, delta: number) {
    setShipmentDraft((prev) =>
      prev.flatMap((load) => {
        if (load.item !== item) return [load];

        const nextQty = load.qty + delta;
        if (nextQty <= 0) return [];

        const owned = cargo[item] || 0;
        const assignedElsewhere = prev
          .filter((entry) => entry.item === item && entry !== load)
          .reduce((sum, entry) => sum + entry.qty, 0);

        if (nextQty > owned - assignedElsewhere) return [load];
        return [{ ...load, qty: nextQty }];
      }),
    );
  }

  function removeDraftItem(item: string) {
    setShipmentDraft((prev) => prev.filter((load) => load.item !== item));
  }

  function toggleSecurity(key: keyof SecurityState) {
    setSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function buyFakePassport() {
    const cost = 4500;
    if (money < cost) return setMessage("Not enough money for a forged identity package.");

    const quality = Number((0.35 + Math.random() * 0.45).toFixed(2));
    setMoney((value) => value - cost);
    setFakePassport(true);
    setPassportQuality(quality);
    setMessage(`You bought a fake passport. Quality: ${(quality * 100).toFixed(0)}%.`);
  }

  function checkArrival(city: string) {
    const profile = cityProfiles[city];

    if (profile.safeHaven) {
      return {
        result: "clear" as const,
        text: `${city} functions as a safe haven. Nobody asked questions.`,
      };
    }

    if (!profile.strictEntry && notoriety < 35) {
      return {
        result: "clear" as const,
        text: `You entered ${city} without major scrutiny.`,
      };
    }

    let arrestRisk = profile.law * 0.4 + notoriety / 115 - profile.corruption * 0.16;
    if (fakePassport) arrestRisk *= 1 - passportQuality * 0.7;
    arrestRisk = clamp(arrestRisk, 0.04, 0.94);

    if (Math.random() < arrestRisk) {
      return {
        result: "arrest" as const,
        text: fakePassport
          ? `Entry screening in ${city} exposed your fake passport. Authorities detained you on arrival.`
          : `Authorities in ${city} detained you on arrival.`,
      };
    }

    return {
      result: "clear" as const,
      text: `You made it into ${city}. Border control missed enough to let you through.`,
    };
  }

  function travel() {
    if (activeIncident) return setMessage("Resolve the active problem before travelling.");
    if (detainedTurns > 0) return setMessage("You are detained and cannot travel.");
    if (!selectedTravelCity || selectedTravelCity === currentCity) {
      return setMessage("Pick another city.");
    }

    const arrival = checkArrival(selectedTravelCity);
    const nextShipmentDestination =
      selectedShipmentDestination === selectedTravelCity
        ? allCities.find((city) => city !== selectedTravelCity) || selectedShipmentDestination
        : selectedShipmentDestination;

    setCurrentCity(selectedTravelCity);
    setSelectedShipmentDestination(nextShipmentDestination);

    const routeOptions = getAvailableTransport(selectedTravelCity, nextShipmentDestination);
    if (!routeOptions.some(([name]) => name === selectedShipmentTransport)) {
      setSelectedShipmentTransport(routeOptions[0]?.[0] || "Plane");
    }

    if (arrival.result === "arrest") {
      setDetainedTurns(2);
      setNotoriety((value) => Math.min(100, value + 8));
      return setMessage(arrival.text);
    }

    setMessage(arrival.text);
  }

  function dispatchShipment() {
    if (activeIncident) return setMessage("Resolve the active problem before sending new cargo.");
    if (detainedTurns > 0) return setMessage("You are detained and cannot dispatch shipments.");
    if (selectedShipmentDestination === currentCity) {
      return setMessage("Pick another city for the shipment.");
    }
    if (shipmentDraft.length === 0) return setMessage("Add cargo to the shipment first.");

    const transport = transportTypes[resolvedTransport];
    const totalQty = shipmentDraft.reduce((sum, load) => sum + load.qty, 0);

    if (totalQty > transport.capacity) {
      return setMessage(`${resolvedTransport} capacity is ${transport.capacity}.`);
    }

    const totalCost = calculateTransportCost({
      loads: shipmentDraft,
      transportName: resolvedTransport,
      from: currentCity,
      to: selectedShipmentDestination,
      security,
    });

    if (money < totalCost) {
      return setMessage("Cannot afford shipping and route protection.");
    }

    const risk = calculateShipmentRisk({
      shipment: { transport: resolvedTransport, security, loads: shipmentDraft },
      destinationProfile,
      notoriety,
    });

    setMoney((value) => value - totalCost);
    setCargo((prev) => {
      const next = { ...prev };
      shipmentDraft.forEach((load) => {
        next[load.item] = (next[load.item] || 0) - load.qty;
        if (next[load.item] <= 0) delete next[load.item];
      });
      return next;
    });

    setShipments((prev) => [
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        loads: shipmentDraft.map((load) => ({ ...load })),
        totalQty,
        from: currentCity,
        to: selectedShipmentDestination,
        turns: transport.time,
        originalTurns: transport.time,
        transport: resolvedTransport,
        security: { ...security },
        totalCost,
        risk,
      },
      ...prev,
    ]);

    setShipmentDraft([]);
    setSecurity({ insurance: false, guards: false, bribe: false, stealth: false });
    setMessage(
      `Shipment dispatched from ${currentCity} to ${selectedShipmentDestination} by ${resolvedTransport} for $${totalCost.toLocaleString()}.`,
    );
  }

  function commitPiracy() {
    if (!currentProfile.shipUse) return setMessage("You need a port city to raid shipping lanes.");
    const risk = 0.25 + currentProfile.law * 0.45 - currentProfile.corruption * 0.18 + notoriety / 160;
    const reward = Math.round(300 + currentProfile.piracy * 2200 + Math.random() * 500);

    if (Math.random() > risk) {
      setMoney((value) => value + reward);
      setNotoriety((value) => Math.min(100, value + 12));
      setMessage(`Piracy paid off near ${currentCity}. You pocketed $${reward.toLocaleString()}.`);
    } else {
      const fine = Math.round(500 + currentProfile.law * 1200 + notoriety * 12);
      setMoney((value) => Math.max(0, value - fine));
      setNotoriety((value) => Math.min(100, value + 18));
      setMessage(`The piracy run failed near ${currentCity}. Losses cost you $${fine.toLocaleString()}.`);
    }
  }

  function commitTheft() {
    const qty = parseInt(tradeAmount, 10);
    if (!qty || qty <= 0) return setMessage("Enter a real amount first.");

    const risk = 0.18 + currentProfile.law * 0.42 - currentProfile.corruption * 0.16 + notoriety / 170;
    if (Math.random() > risk) {
      setCargo((prev) => ({ ...prev, [marketItem]: (prev[marketItem] || 0) + qty }));
      setNotoriety((value) => Math.min(100, value + 8));
      setMessage(`You stole ${qty} ${marketItem} in ${currentCity}.`);
    } else {
      const fine = Math.round((prices[marketItem] || 0) * qty * (0.8 + currentProfile.law));
      setMoney((value) => Math.max(0, value - fine));
      setNotoriety((value) => Math.min(100, value + 14));
      setMessage(`The theft failed in ${currentCity}. Fines cost you $${fine.toLocaleString()}.`);
    }
  }

  function createShortage() {
    const qty = parseInt(tradeAmount, 10);
    if (!qty || qty <= 0) return setMessage("Enter a real amount first.");

    const cost = (prices[marketItem] || 0) * qty;
    if (money < cost) return setMessage("You cannot afford to hoard that much inventory.");

    setMoney((value) => value - cost);
    setManipulationState((prev) => ({
      ...prev,
      [currentCity]: {
        ...prev[currentCity],
        [marketItem]: Math.min(2.2, (prev[currentCity]?.[marketItem] || 1) + 0.18),
      },
    }));
    nudgeLocalPrice(currentCity, marketItem, 1.08);

    const risk = 0.16 + currentProfile.law * 0.34 - currentProfile.corruption * 0.1 + notoriety / 200;
    if (Math.random() < risk) {
      const penalty = Math.round(cost * (0.35 + currentProfile.law));
      setMoney((value) => Math.max(0, value - penalty));
      setNotoriety((value) => Math.min(100, value + 10));
      setMessage(`You engineered a shortage in ${currentCity}, but regulators noticed. Penalties: $${penalty.toLocaleString()}.`);
    } else {
      setNotoriety((value) => Math.min(100, value + 6));
      setMessage(`You hoarded ${marketItem} in ${currentCity}. Prices are moving your way.`);
    }
  }

  function resolveIncident(incident: Incident, action: IncidentAction) {
    if (!incident.shipment) return;

    const shipment = incident.shipment;
    const destination = cityProfiles[shipment.to];
    const continent = cityToContinent[shipment.to];
    const marketAtDestination = market[shipment.to];

    let newMoney = money;
    const newStorage = cloneCityStorage(cityStorage);
    let resultMessage = "";
    let followUpIncident: Incident | null = null;

    const depositLoadsToStorage = () => {
      shipment.loads.forEach((load) => {
        newStorage[shipment.to][load.item] = (newStorage[shipment.to][load.item] || 0) + load.qty;
      });
    };

    const shipmentValue = shipment.loads.reduce(
      (sum, load) => sum + (marketAtDestination[load.item] || 0) * load.qty,
      0,
    );

    if (incident.type === "pirates") {
      const surviveRoll = Math.random();
      const threshold = shipment.security.guards ? 0.82 : 0.28;

      if (surviveRoll < threshold) {
        depositLoadsToStorage();
        resultMessage = shipment.security.guards
          ? `Your armed guards fought off the pirates. The cargo reached storage in ${shipment.to}.`
          : `The pirates failed to take the shipment. Luck did what planning did not.`;
      } else if (shipment.security.insurance) {
        const payout = Math.round(shipmentValue * 0.8);
        newMoney += payout;
        resultMessage = `Pirates took the cargo. Insurance paid $${payout.toLocaleString()}.`;
      } else {
        resultMessage = "Pirates took the cargo. No payout. No mercy.";
      }
    }

    if (incident.type === "airportLoss") {
      let insuredValue = 0;

      shipment.loads.forEach((load) => {
        const lostQty = Math.max(1, Math.floor(load.qty * 0.4));
        const savedQty = load.qty - lostQty;

        if (savedQty > 0) {
          newStorage[shipment.to][load.item] = (newStorage[shipment.to][load.item] || 0) + savedQty;
        }

        insuredValue += (marketAtDestination[load.item] || 0) * lostQty;
      });

      if (shipment.security.insurance) {
        const payout = Math.round(insuredValue * 0.8);
        newMoney += payout;
        resultMessage = `Airport handlers lost part of the shipment. Insurance paid $${payout.toLocaleString()}.`;
      } else {
        resultMessage = "Airport handlers lost part of the shipment. No insurer came to save the day.";
      }
    }

    if (incident.type === "customs") {
      if (action === "customsBribe") {
        const cost = 350;
        newMoney -= cost;
        const successChance =
          getContinentBribeEffect(continent, "customs") +
          destination.corruption * 0.2 +
          (shipment.security.bribe ? 0.1 : 0);

        if (Math.random() < successChance) {
          depositLoadsToStorage();
          resultMessage = `Customs took the money and looked away in ${shipment.to}. Cargo released into storage.`;
        } else {
          followUpIncident = {
            id: `${incident.id}-police`,
            type: "police",
            shipment,
            title: `Police investigation in ${shipment.to}`,
            description:
              "The customs bribe failed and the matter moved to police. Try another bribe or let the case escalate.",
            options: ["policeBribe", "acceptLoss"],
          };
          resultMessage = "Customs bribe failed. Police are now involved.";
        }
      } else {
        resultMessage = `You accepted customs confiscation in ${shipment.to}. The cargo is gone.`;
      }
    }

    if (incident.type === "police") {
      if (action === "policeBribe") {
        const cost = 600;
        newMoney -= cost;
        const successChance =
          getContinentBribeEffect(continent, "police") +
          destination.corruption * 0.15 +
          (shipment.security.bribe ? 0.08 : 0);

        if (Math.random() < successChance) {
          depositLoadsToStorage();
          resultMessage = "Police accepted the payment and the cargo quietly reappeared in storage.";
        } else {
          followUpIncident = {
            id: `${incident.id}-judge`,
            type: "judge",
            shipment,
            title: `Court case in ${shipment.to}`,
            description:
              "The police bribe failed. The case is now in court. Judge outcomes depend heavily on where you are.",
            options: ["judgeBribe", "acceptLoss"],
          };
          resultMessage = "Police bribe failed. The case moved to court.";
        }
      } else {
        followUpIncident = {
          id: `${incident.id}-judge`,
          type: "judge",
          shipment,
          title: `Court case in ${shipment.to}`,
          description:
            "You refused to bribe police. The case is now in court. Time to test your faith in systems.",
          options: ["judgeBribe", "acceptLoss"],
        };
        resultMessage = "The case advanced to court.";
      }
    }

    if (incident.type === "judge") {
      if (action === "judgeBribe") {
        const cost = 1100;
        newMoney -= cost;
        const successChance = getContinentBribeEffect(continent, "judge") + destination.corruption * 0.05;

        if (Math.random() < successChance) {
          depositLoadsToStorage();
          resultMessage =
            continent === "Africa"
              ? `The judge in ${shipment.to} was bought and the case vanished. Cargo released to storage.`
              : `The judge was influenced and the cargo was released to storage. Rare, ugly, profitable.`;
        } else {
          const penalty = continent === "North America" ? 1800 : 1200;
          newMoney -= penalty;
          resultMessage =
            continent === "North America"
              ? `Bribing the judge in ${shipment.to} backfired badly. Extra penalties: $${penalty.toLocaleString()}. Cargo lost.`
              : `The judge bribe failed. Penalties added: $${penalty.toLocaleString()}. Cargo lost.`;
        }
      } else {
        resultMessage = "You let the court process run. The cargo was seized and the case closed against you.";
      }
    }

    setMoney(Math.max(0, newMoney));
    setCityStorage(newStorage);
    setIncidentQueue((prev) => {
      const filtered = prev.filter((entry) => entry.id !== incident.id);
      return followUpIncident ? [followUpIncident, ...filtered] : filtered;
    });
    setMessage(resultMessage);
  }

  function nextTurn() {
    if (activeIncident) {
      return setMessage("Resolve the active problem before ending another turn.");
    }

    const wasDetained = detainedTurns > 0;
    if (wasDetained) {
      setDetainedTurns((value) => Math.max(0, value - 1));
    }

    const decremented = shipments.map((shipment) => ({
      ...shipment,
      turns: shipment.turns - 1,
    }));
    const finished = decremented.filter((shipment) => shipment.turns <= 0);
    const ongoing = decremented.filter((shipment) => shipment.turns > 0);

    let newMoney = money;
    const newStorage = cloneCityStorage(cityStorage);
    const messages: string[] = [];
    const newIncidents: Incident[] = [];

    finished.forEach((shipment) => {
      const incident = createIncident(shipment, cityProfiles[shipment.to]);
      if (incident) {
        newIncidents.push(incident);
        messages.push(`Problem on route to ${shipment.to}: ${incident.title}`);
      } else {
        shipment.loads.forEach((load) => {
          newStorage[shipment.to][load.item] = (newStorage[shipment.to][load.item] || 0) + load.qty;
        });
        messages.push(`Shipment arrived in ${shipment.to} and is now waiting in storage.`);
      }
    });

    allCities.forEach((city) => {
      const items = newStorage[city] || {};
      const totalStored = Object.values(items).reduce((sum, qty) => sum + qty, 0);
      if (totalStored === 0) return;

      const prepaid = storagePlan[city];
      const storageCost = prepaid ? totalStored * 2 : totalStored * 6;
      newMoney -= storageCost;

      if (!prepaid) {
        newMoney -= totalStored * 2;
        messages.push(`Storage penalties hit in ${city} because no warehouse plan was in place.`);
      }

      const illegalStored = Object.keys(items).some((item) => illegalGoods.has(item));
      if (
        illegalStored &&
        Math.random() < cityProfiles[city].law * (prepaid ? 0.18 : 0.32) + notoriety / 250
      ) {
        newIncidents.push({
          id: `${city}-storage-${turn}`,
          type: "customs",
          shipment: {
            id: Date.now() + Math.floor(Math.random() * 1000),
            loads: Object.entries(items).map(([item, qty]) => ({ item, qty })),
            totalQty: totalStored,
            from: city,
            to: city,
            turns: 0,
            originalTurns: 0,
            transport: "Truck",
            security: { insurance: false, guards: false, bribe: prepaid, stealth: false },
            totalCost: 0,
            risk: 0,
          },
          title: `Stored contraband drew attention in ${city}`,
          description:
            "Illegal goods sat in storage too long. Customs noticed. Warehouses are not magical voids.",
          options: ["customsBribe", "acceptLoss"],
        });
      }
    });

    const updatedManipulations: ManipulationState = makeEmptyManipulations();
    allCities.forEach((city) => {
      Object.entries(manipulationState[city] || {}).forEach(([item, multiplier]) => {
        const nextMultiplier = Math.max(1, multiplier - 0.08);
        if (nextMultiplier > 1.01) {
          updatedManipulations[city][item] = nextMultiplier;
        }
      });
    });

    const marketStep = advanceStableMarket({
      market,
      manipulations: updatedManipulations,
      cityStorage: newStorage,
      shipments: ongoing,
      turn,
    });

    setTurn((value) => value + 1);
    setMoney(Math.max(0, newMoney));
    setCityStorage(newStorage);
    setShipments(ongoing);
    setManipulationState(updatedManipulations);
    setMarket(marketStep.next);
    setMarketHistory((prev) => [...prev.slice(-19), marketStep.next]);
    setIncidentQueue((prev) => [...newIncidents, ...prev]);
    setMarketNews((prev) => [...marketStep.headlines, ...prev].slice(0, 8));
    setNotoriety((value) => Math.max(0, value - 1));

    if (wasDetained) {
      messages.unshift("You lost a turn to detention while the markets kept moving without you.");
    }

    setMessage(
      messages.length > 0
        ? messages.join(" ")
        : marketStep.headlines[0] || "Turn advanced. Markets shifted, storage bills arrived, and life got harder.",
    );
  }

  function renderMainScreen() {
    const selectedProfile = cityProfiles[selectedTravelCity];

    return (
      <Card className="rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-5 w-5" />
            Main Screen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs text-slate-300">
              <span>World Map</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-xl border-white/20 bg-transparent text-white"
                  onClick={() => setMapZoom((value) => Math.max(0.7, +(value - 0.15).toFixed(2)))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-xl border-white/20 bg-transparent text-white"
                  onClick={() => setMapZoom(1)}
                >
                  <Crosshair className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-xl border-white/20 bg-transparent text-white"
                  onClick={() => setMapZoom((value) => Math.min(2.2, +(value + 0.15).toFixed(2)))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative h-[320px] overflow-hidden">
              <div
                className="absolute inset-0 origin-center transition-transform duration-200"
                style={{ transform: `scale(${mapZoom})` }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,rgba(15,23,42,1),rgba(30,41,59,1))]" />
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                  }}
                />
                <div className="absolute left-[7%] top-[20%] h-40 w-20 rounded-[45%] bg-slate-700/50" />
                <div className="absolute left-[17%] top-[48%] h-24 w-16 rounded-[45%] bg-slate-700/45" />
                <div className="absolute left-[37%] top-[10%] h-64 w-28 rounded-[45%] bg-slate-700/55" />
                <div className="absolute left-[48%] top-[28%] h-44 w-18 rounded-[45%] bg-slate-700/50" />
                <div className="absolute left-[63%] top-[20%] h-52 w-24 rounded-[45%] bg-slate-700/55" />
                <div className="absolute left-[73%] top-[56%] h-14 w-16 rounded-[45%] bg-slate-700/45" />

                {shipments.map((shipment) => {
                  const fromPos = cityMapPositions[shipment.from];
                  const toPos = cityMapPositions[shipment.to];
                  if (!fromPos || !toPos) return null;

                  const angle =
                    Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) * (180 / Math.PI);
                  const distance = Math.sqrt(
                    Math.pow(toPos.x - fromPos.x, 2) + Math.pow(toPos.y - fromPos.y, 2),
                  );
                  const progress = 1 - shipment.turns / shipment.originalTurns;
                  const currentX = fromPos.x + (toPos.x - fromPos.x) * progress;
                  const currentY = fromPos.y + (toPos.y - fromPos.y) * progress;
                  const visual = getTransportVisual(shipment.transport);
                  const TransportIcon = visual.icon;

                  return (
                    <React.Fragment key={shipment.id}>
                      <div
                        className={`absolute rounded-full ${visual.line}`}
                        style={{
                          left: `${fromPos.x}%`,
                          top: `${fromPos.y}%`,
                          width: `${distance}%`,
                          height: "2px",
                          transformOrigin: "left center",
                          transform: `rotate(${angle}deg)`,
                        }}
                      />
                      <div
                        className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 ${visual.trail}`}
                        style={{ left: `${currentX}%`, top: `${currentY}%` }}
                      >
                        <TransportIcon className="h-3 w-3 text-slate-950" />
                      </div>
                    </React.Fragment>
                  );
                })}

                {allCities.map((city) => {
                  const pos = cityMapPositions[city];
                  if (!pos) return null;

                  const isCurrent = city === currentCity;
                  const isSelected = city === selectedTravelCity;
                  const storedHere = Object.values(cityStorage[city] || {}).reduce((sum, qty) => sum + qty, 0);

                  return (
                    <button
                      key={city}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      onClick={() => setSelectedTravelCity(city)}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border-2 border-white shadow-lg ${
                          isCurrent
                            ? "bg-white"
                            : isSelected
                              ? "bg-amber-300"
                              : continentColors[cityToContinent[city]] || "bg-sky-400"
                        }`}
                      />
                      {(isCurrent || isSelected || storedHere > 0 || cityProfiles[city].safeHaven) && (
                        <div className="mt-1 rounded-lg bg-slate-900/80 px-2 py-1 text-[10px] text-white">
                          <div>{city}</div>
                          {storedHere > 0 && <div className="text-amber-300">Stored: {storedHere}</div>}
                          {cityProfiles[city].safeHaven && <div className="text-emerald-300">Safe haven</div>}
                          {isCurrent && <div className="text-sky-300">You</div>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border bg-slate-50 p-4">
            <div>
              <div className="mb-1 text-sm text-slate-500">Travel destination</div>
              <select
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                value={selectedTravelCity}
                onChange={(e) => setSelectedTravelCity(e.target.value)}
              >
                {travelOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border bg-white p-3 text-sm text-slate-700">
              <div className="font-medium">{selectedTravelCity}</div>
              <div className="text-slate-500">{selectedProfile.continent}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedProfile.safeHaven && <Badge className="bg-emerald-600">Safe Haven</Badge>}
                {selectedProfile.strictEntry && <Badge variant="secondary">Strict Entry</Badge>}
                <Badge variant="outline">Law {Math.round(selectedProfile.law * 100)}%</Badge>
                <Badge variant="outline">Corruption {Math.round(selectedProfile.corruption * 100)}%</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button className="rounded-2xl" onClick={travel}>
                <Plane className="mr-2 h-4 w-4" />
                Travel
              </Button>
              <Button className="rounded-2xl" variant="outline" onClick={buyFakePassport}>
                <IdCard className="mr-2 h-4 w-4" />
                {fakePassport ? "Upgrade Passport" : "Fake Passport"}
              </Button>
            </div>

            <div className="rounded-2xl border bg-white p-3 text-sm text-slate-600">
              Passport: {fakePassport ? `${(passportQuality * 100).toFixed(0)}% quality` : "None"} | Detained turns:{" "}
              {detainedTurns}
            </div>
          </div>

          <div className="space-y-2">
            {marketNews.slice(0, 3).map((entry, index) => (
              <div key={`${entry}-${index}`} className="rounded-2xl border bg-white p-3 text-sm text-slate-700">
                {entry}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderMarketScreen() {
    return (
      <Card className="rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5" />
            Market
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-2xl border bg-slate-50 p-4">
            <div>
              <div className="mb-1 text-sm text-slate-500">Category</div>
              <select
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                value={marketCategory}
                onChange={(e) => handleCategoryChange(e.target.value as keyof typeof productCatalog)}
              >
                {Object.keys(productCatalog).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1 text-sm text-slate-500">Item</div>
              <select
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                value={marketItem}
                onChange={(e) => setMarketItem(e.target.value)}
              >
                {productCatalog[marketCategory].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1 text-sm text-slate-500">Amount</div>
              <Input value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} />
            </div>

            <div className="rounded-2xl border bg-white p-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Price in {currentCity}</span>
                <Badge>${prices[marketItem]?.toLocaleString()}</Badge>
              </div>
              <div className="mt-2 text-slate-500">World average: ${worldAverageForItem.toLocaleString()}</div>
              <div className="mt-2 text-slate-500">
                Cheapest: {cheapestForItem?.city} (${cheapestForItem?.price?.toLocaleString()})
              </div>
              <div className="text-slate-500">
                Best sale: {priciestForItem?.city} (${priciestForItem?.price?.toLocaleString()})
              </div>
              <div className="mt-2 text-xs">
                {illegalGoods.has(marketItem) ? "Contraband" : getItemCategory(marketItem)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button className="rounded-2xl" onClick={buyItem}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy
              </Button>
              <Button className="rounded-2xl" variant="outline" onClick={sellItem}>
                <BanknoteArrowUp className="mr-2 h-4 w-4" />
                Sell
              </Button>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border bg-slate-50 p-4">
            <div className="font-medium">Cargo on Hand</div>
            {renderCargoList(cargo, "No cargo in hand.")}

            <div className="border-t pt-3">
              <div className="font-medium">Stored in {currentCity}</div>
              <div className="mb-2 text-xs text-slate-500">
                Prepaid storage: {storagePlan[currentCity] ? "Yes" : "No"}
              </div>
              {renderCargoList(currentCityStorage, "Nothing waiting in local storage.")}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border bg-slate-50 p-4">
            <div className="flex items-center gap-2 font-medium">
              <Skull className="h-4 w-4" />
              Underground
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button className="rounded-2xl" variant="outline" onClick={commitPiracy}>
                <Anchor className="mr-2 h-4 w-4" />
                Piracy
              </Button>
              <Button className="rounded-2xl" variant="outline" onClick={commitTheft}>
                <ShieldX className="mr-2 h-4 w-4" />
                Theft
              </Button>
              <Button className="rounded-2xl" variant="outline" onClick={createShortage}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Shortage
              </Button>
            </div>
            <div className="rounded-2xl border bg-white p-3 text-sm text-slate-600">
              Higher notoriety increases scrutiny, storage detection, fines, and border trouble.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderLogisticsScreen() {
    return (
      <Card className="rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            Shipping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-2xl border bg-slate-50 p-4">
            <div>
              <div className="mb-1 text-sm text-slate-500">Shipment destination</div>
              <select
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                value={selectedShipmentDestination}
                onChange={(e) => {
                  const nextCity = e.target.value;
                  setSelectedShipmentDestination(nextCity);
                  const options = getAvailableTransport(currentCity, nextCity);
                  if (!options.some(([name]) => name === selectedShipmentTransport)) {
                    setSelectedShipmentTransport(options[0]?.[0] || "Plane");
                  }
                }}
              >
                {shipmentDestinationOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1 text-sm text-slate-500">Transport</div>
              <select
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                value={resolvedTransport}
                onChange={(e) => setSelectedShipmentTransport(e.target.value as TransportName)}
              >
                {availableTransport.map(([name]) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border bg-white p-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {selectedTransportStats.time} turn{selectedTransportStats.time > 1 ? "s" : ""}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Boxes className="h-4 w-4" />
                Capacity {selectedTransportStats.capacity}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Route cost ${routeCostPreview.toLocaleString()}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Risk {Math.round(routeRiskPreview * 100)}%
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border bg-slate-50 p-4">
            <div>
              <div className="mb-1 text-sm text-slate-500">Item for shipment</div>
              <select
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                value={shipmentItem}
                onChange={(e) => setShipmentItem(e.target.value)}
              >
                {allItems.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1 text-sm text-slate-500">Amount</div>
              <Input value={shipmentAmount} onChange={(e) => setShipmentAmount(e.target.value)} />
            </div>

            <Button className="w-full rounded-2xl" variant="outline" onClick={addToShipmentDraft}>
              <Boxes className="mr-2 h-4 w-4" />
              Add to Shipment
            </Button>

            {shipmentDraft.length === 0 ? (
              <div className="rounded-2xl border bg-white p-3 text-sm text-slate-500">
                No cargo assigned yet.
              </div>
            ) : (
              <div className="space-y-2">
                {shipmentDraft.map((load) => (
                  <div key={load.item} className="rounded-2xl border bg-white p-3">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{load.item}</span>
                      <Badge variant="secondary">{load.qty}</Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => changeDraftQuantity(load.item, -1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => changeDraftQuantity(load.item, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="ml-auto rounded-xl" onClick={() => removeDraftItem(load.item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(securityOptions) as [keyof SecurityState, (typeof securityOptions)[keyof typeof securityOptions]][]).map(
                ([key, option]) => (
                  <Button
                    key={key}
                    className="h-auto rounded-2xl py-3 text-left"
                    variant={security[key] ? "default" : "outline"}
                    onClick={() => toggleSecurity(key)}
                  >
                    <div className="w-full">
                      <div className="font-medium">{option.label}</div>
                      <div className="mt-1 text-xs opacity-80">${option.cost}</div>
                    </div>
                  </Button>
                ),
              )}
            </div>

            <Button className="w-full rounded-2xl" onClick={dispatchShipment}>
              Dispatch Shipment
            </Button>
          </div>

          <div className="space-y-2 rounded-2xl border bg-slate-50 p-4">
            <div className="font-medium">In Transit</div>
            {shipments.length === 0 ? (
              <div className="rounded-2xl border bg-white p-3 text-sm text-slate-500">
                No active shipments.
              </div>
            ) : (
              shipments.map((shipment) => {
                const Icon = transportTypes[shipment.transport].icon;
                return (
                  <div key={shipment.id} className="rounded-2xl border bg-white p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {shipment.from} <ArrowRight className="mx-1 inline h-4 w-4" /> {shipment.to}
                      </div>
                      <Badge variant="secondary">{shipment.totalQty}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <Icon className="h-4 w-4" />
                      {shipment.transport} | {shipment.turns} turn{shipment.turns > 1 ? "s" : ""} left
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      Risk {Math.round(shipment.risk * 100)}%
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {shipment.loads.map((load) => `${load.item} x ${load.qty}`).join(", ")}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderStorageScreen() {
    const citiesWithStorage = allCities.filter(
      (city) => Object.values(cityStorage[city] || {}).reduce((sum, qty) => sum + qty, 0) > 0,
    );

    return (
      <Card className="rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Warehouse className="h-5 w-5" />
            Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-2xl border bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Current city: {currentCity}</div>
                <div className="text-sm text-slate-500">
                  Prepaid storage: {storagePlan[currentCity] ? "Yes" : "No"}
                </div>
              </div>
              <Badge variant="secondary">{storedCargoCount}</Badge>
            </div>

            {renderCargoList(currentCityStorage, "Nothing waiting in local storage.")}

            <Button
              className="w-full rounded-2xl"
              variant="outline"
              onClick={() => {
                if (storagePlan[currentCity]) return setMessage(`Storage in ${currentCity} is already prepaid.`);
                if (money < 300) return setMessage("Not enough money to prepay storage.");
                setMoney((value) => value - 300);
                setStoragePlan((prev) => ({ ...prev, [currentCity]: true }));
                setMessage(`You prepaid warehouse space in ${currentCity}.`);
              }}
            >
              Prepay Storage in {currentCity}
            </Button>

            <div className="rounded-2xl border bg-white p-3 text-sm text-slate-600">
              Prepaid storage is cheap. No prepaid storage means heavier fees and more customs attention.
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border bg-slate-50 p-4">
            <div className="font-medium">Cargo Stored Around the World</div>
            {citiesWithStorage.length === 0 ? (
              <div className="rounded-2xl border bg-white p-3 text-sm text-slate-500">
                No goods are sitting in storage anywhere.
              </div>
            ) : (
              citiesWithStorage.map((city) => (
                <div key={city} className="rounded-2xl border bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{city}</div>
                    <Badge variant="secondary">
                      {Object.values(cityStorage[city] || {}).reduce((sum, qty) => sum + qty, 0)}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Prepaid: {storagePlan[city] ? "Yes" : "No"}
                  </div>
                  <div className="mt-3">{renderCargoList(cityStorage[city] || {}, "Nothing here.")}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderIntelScreen() {
    return (
      <Card className="rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <LayoutDashboard className="h-5 w-5" />
            Intel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="rounded-2xl"
              variant={dashboardMode === "city" ? "default" : "outline"}
              onClick={() => setDashboardMode("city")}
            >
              City View
            </Button>
            <Button
              className="rounded-2xl"
              variant={dashboardMode === "good" ? "default" : "outline"}
              onClick={() => setDashboardMode("good")}
            >
              Good View
            </Button>
          </div>

          {dashboardMode === "city" ? (
            <select
              className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
              value={dashboardCity}
              onChange={(e) => setDashboardCity(e.target.value)}
            >
              {allCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          ) : (
            <select
              className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
              value={dashboardGood}
              onChange={(e) => setDashboardGood(e.target.value)}
            >
              {allItems.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          )}

          <div className="rounded-2xl border bg-white p-3">
            <div className="mb-3 text-sm text-slate-600">
              {dashboardMode === "city"
                ? `All goods in ${dashboardCity} over the last ${dashboardRows.length} turns.`
                : `${dashboardGood} across all cities over the last ${dashboardRows.length} turns.`}
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardRows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="turn" />
                  <YAxis />
                  <Tooltip />
                  {dashboardSeries.map((series, index) => (
                    <Line
                      key={series}
                      type="monotone"
                      dataKey={series}
                      dot={false}
                      strokeWidth={2}
                      stroke={`hsl(${(index * 47) % 360} 70% 45%)`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border bg-slate-50 p-4">
            <div className="font-medium">Current Snapshot</div>

            {dashboardMode === "city" ? (
              Object.entries(market[dashboardCity] || {}).map(([item, price]) => (
                <div key={item} className="flex items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm">
                  <span>{item}</span>
                  <Badge variant="secondary">${price.toLocaleString()}</Badge>
                </div>
              ))
            ) : (
              [...allCities]
                .sort((a, b) => (market[b]?.[dashboardGood] || 0) - (market[a]?.[dashboardGood] || 0))
                .map((city) => (
                  <div key={city} className="flex items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm">
                    <span>{city}</span>
                    <Badge variant="secondary">${market[city]?.[dashboardGood]?.toLocaleString()}</Badge>
                  </div>
                ))
            )}
          </div>

          <details className="rounded-2xl border bg-slate-50 p-4">
            <summary className="cursor-pointer font-medium">All Cities Prices</summary>
            <div className="mt-3 space-y-3">
              {allCities.map((city) => (
                <div key={city} className="rounded-2xl border bg-white p-3">
                  <div className="mb-2 font-medium">{city}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {allItems.map((item) => (
                      <div key={item} className="flex items-center justify-between rounded-lg border px-2 py-1">
                        <span>{item}</span>
                        <span>${market[city]?.[item]?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>

          <div className="space-y-2 rounded-2xl border bg-slate-50 p-4">
            <div className="font-medium">Market News</div>
            {marketNews.length === 0 ? (
              <div className="rounded-2xl border bg-white p-3 text-sm text-slate-500">
                No major market shocks yet.
              </div>
            ) : (
              marketNews.map((entry, index) => (
                <div key={`${entry}-${index}`} className="rounded-2xl border bg-white p-3 text-sm text-slate-700">
                  {entry}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-sky-50 text-slate-900">
      <header className="fixed inset-x-0 top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="rounded-2xl"
              variant={screen === "main" ? "default" : "outline"}
              onClick={() => setScreen("main")}
            >
              Main Screen
            </Button>
            <Button className="rounded-2xl" onClick={nextTurn}>
              End Turn
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-2xl border bg-slate-50 px-2 py-2">
              <div className="text-slate-500">City</div>
              <div className="font-medium">{currentCity}</div>
            </div>
            <div className="rounded-2xl border bg-slate-50 px-2 py-2">
              <div className="text-slate-500">Cash</div>
              <div className="font-medium">${money.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl border bg-slate-50 px-2 py-2">
              <div className="text-slate-500">Cargo</div>
              <div className="font-medium">{cargoCount}</div>
            </div>
            <div className="rounded-2xl border bg-slate-50 px-2 py-2">
              <div className="text-slate-500">Heat</div>
              <div className="font-medium">{notorietyLabel}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pb-28 pt-36">
        {activeIncident && activeIncident.shipment && (
          <Card className="rounded-3xl border-2 border-amber-300 bg-amber-50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Active Problem: {activeIncident.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-700">{activeIncident.description}</div>
              <div className="text-xs text-slate-600">
                Cargo:{" "}
                {activeIncident.shipment.loads
                  .map((load) => `${load.item} x ${load.qty}`)
                  .join(", ")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {activeIncident.options.map((optionKey) => {
                  const option = crisisActions[optionKey];
                  const Icon = option.icon;
                  return (
                    <Button
                      key={optionKey}
                      className="rounded-2xl"
                      variant={optionKey === "acceptLoss" ? "outline" : "default"}
                      onClick={() => resolveIncident(activeIncident, optionKey)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {screen === "main" && renderMainScreen()}
        {screen === "market" && renderMarketScreen()}
        {screen === "logistics" && renderLogisticsScreen()}
        {screen === "storage" && renderStorageScreen()}
        {screen === "intel" && renderIntelScreen()}

        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-4 w-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</div>
          </CardContent>
        </Card>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2 px-4 py-3">
          <Button
            className="rounded-2xl"
            variant={screen === "market" ? "default" : "outline"}
            onClick={() => setScreen("market")}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Market
          </Button>

          <Button
            className="rounded-2xl"
            variant={screen === "logistics" ? "default" : "outline"}
            onClick={() => setScreen("logistics")}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Shipping
          </Button>

          <Button
            className="rounded-2xl"
            variant={screen === "storage" ? "default" : "outline"}
            onClick={() => setScreen("storage")}
          >
            <Warehouse className="mr-2 h-4 w-4" />
            Storage
          </Button>

          <Button
            className="rounded-2xl"
            variant={screen === "intel" ? "default" : "outline"}
            onClick={() => setScreen("intel")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Intel
          </Button>
        </div>
      </nav>
    </div>
  );
}
