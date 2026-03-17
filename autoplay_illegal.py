from __future__ import annotations

import json
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.edge.options import Options


ROOT = Path(r"C:\Users\pc1\Documents\Global-Trader-Game")
URL = ROOT.joinpath("index.html").resolve().as_uri()
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

TARGET_WORKERS = 5
TARGET_THUGS = 3
TARGET_DIRTY = 20_000_000

WORKER_CITIES = ["New York", "London", "Tokyo", "Johannesburg", "Singapore"]
THUG_CITIES = ["Berlin", "Cairo", "Dubai"]
SAFE_HOME = "Bogota"


def js(driver: webdriver.Edge, script: str, *args):
    return driver.execute_script(script, *args)


def summary(driver: webdriver.Edge) -> dict:
    return js(
        driver,
        """
        return {
          turn: state.turn,
          money: state.money,
          dirty: state.illegalSales,
          currentCity: state.currentCity,
          detained: state.detained,
          warrant: state.warrant.active,
          incidents: state.incidents.length,
          shipments: state.shipments.length,
          workers: state.agents.filter(a=>a.type==='worker').length,
          thugs: state.agents.filter(a=>a.type==='thug').length,
          message: state.message,
          storage: state.storage,
          thugCities: state.agents.filter(a=>a.type==='thug').map(a=>a.city),
        };
        """,
    )


def bootstrap(driver: webdriver.Edge) -> None:
    js(
        driver,
        """
        for (let i = state.agents.filter(a=>a.type==='worker').length; i < arguments[0]; i += 1) {
          state.hireType = 'worker';
          hireAgent();
        }
        for (let i = state.agents.filter(a=>a.type==='thug').length; i < arguments[1]; i += 1) {
          state.hireType = 'thug';
          hireAgent();
        }
        """,
        TARGET_WORKERS,
        TARGET_THUGS,
    )

    js(
        driver,
        """
        const workerTargets = arguments[0];
        const thugTargets = arguments[1];
        const workers = state.agents.filter(a => a.type === 'worker').sort((a,b)=>a.id-b.id);
        const thugs = state.agents.filter(a => a.type === 'thug').sort((a,b)=>a.id-b.id);
        workerTargets.forEach((target, idx) => {
          if (workers[idx] && workers[idx].city !== target) {
            state.agentTarget = target;
            moveAgent(workers[idx].id);
          }
        });
        thugTargets.forEach((target, idx) => {
          if (thugs[idx] && thugs[idx].city !== target) {
            state.agentTarget = target;
            moveAgent(thugs[idx].id);
          }
        });
        """,
        WORKER_CITIES,
        THUG_CITIES,
    )

    js(
        driver,
        """
        if (!state.passport && state.money >= 4500) buyPassport();
        if (state.currentCity !== arguments[0]) {
          state.travelCity = arguments[0];
          travel();
        }
        """,
        SAFE_HOME,
    )


def resolve_incidents(driver: webdriver.Edge) -> int:
    count = 0
    while True:
        active = js(
            driver,
            """
            const inc = state.incidents[0];
            if (!inc) return null;
            return {
              type: inc.type,
              title: inc.title,
              options: inc.options,
              money: state.money,
            };
            """,
        )
        if not active:
            break

        if active["type"] == "judge":
            action = "judgeBribe" if "judgeBribe" in active["options"] and active["money"] > 3000 else "acceptLoss"
        elif active["type"] == "police":
            action = "policeBribe" if "policeBribe" in active["options"] and active["money"] > 1200 else "acceptLoss"
        elif active["type"] == "customs":
            action = "customsBribe" if "customsBribe" in active["options"] and active["money"] > 800 else "acceptLoss"
        else:
            action = "acceptLoss"

        js(driver, "resolve(arguments[0]);", action)
        count += 1
    return count


def sell_illegal(driver: webdriver.Edge) -> list[str]:
    sold = []
    if js(driver, "return state.detained;"):
        return sold
    while True:
        choice = js(
            driver,
            """
            const thugCities = state.agents.filter(a=>a.type==='thug').map(a=>a.city);
            let best = null;
            for (const city of thugCities) {
              for (const item of goods.Contraband) {
                const qty = (state.storage[city] && state.storage[city][item]) || 0;
                if (!qty) continue;
                const price = state.market[city][item] || 0;
                if (!best || price > best.price) best = {city, item, qty, price};
              }
            }
            return best;
            """,
        )
        if not choice:
            break

        js(
            driver,
            """
            state.operationCity = arguments[0];
            state.marketItem = arguments[1];
            state.tradeAmount = String(arguments[2]);
            sell();
            """,
            choice["city"],
            choice["item"],
            int(choice["qty"]),
        )
        sold.append(f"{choice['item']} in {choice['city']} x{choice['qty']}")
    return sold


def best_illegal_deals(driver: webdriver.Edge) -> list[dict]:
    return js(
        driver,
        """
        const source = state.currentCity;
        const thugCities = state.agents.filter(a=>a.type==='thug').map(a=>a.city);
        const thugMap = Object.fromEntries(state.agents.filter(a=>a.type==='thug').map(a=>[a.city,a]));
        const options = [];
        for (const item of goods.Contraband) {
          for (const city of thugCities) {
            if (city === source) continue;
            const buy = state.market[source][item];
            const sell = state.market[city][item];
            const thug = thugMap[city];
            const skim = Math.max(0.05, Math.min(0.25, 0.05 + (1 - thug.loyalty) * 0.22));
            const shipUnit = transport.Plane.cost * 1.45 * 1.35;
            const security = sec.insurance.cost + sec.bribe.cost + sec.stealth.cost;
            const grossPerUnit = sell * (1 - skim);
            const netPerUnit = grossPerUnit - buy - shipUnit - security / 40;
            options.push({
              source,
              dest: city,
              item,
              buy,
              sell,
              skim,
              netPerUnit,
            });
          }
        }
        options.sort((a, b) => b.netPerUnit - a.netPerUnit);
        return options;
        """,
    )


def buy_and_dispatch(driver: webdriver.Edge, reserve: int = 15000) -> list[str]:
    sent = []
    used_items: set[str] = set()
    if js(driver, "return state.detained || state.incidents.length;"):
        return sent

    for deal in best_illegal_deals(driver):
        if deal["netPerUnit"] <= 0 or deal["item"] in used_items:
            continue

        money = js(driver, "return state.money;")
        max_qty = min(40, int((money - reserve) // max(1, deal["buy"] + 60)))
        if max_qty <= 0:
            continue

        before = js(driver, "return state.shipments.length;")
        js(
            driver,
            """
            state.operationCity = arguments[0];
            state.marketItem = arguments[1];
            state.tradeAmount = String(arguments[2]);
            buy();
            state.shipOrigin = arguments[0];
            state.shipDest = arguments[3];
            state.shipMode = 'Plane';
            state.shipItem = arguments[1];
            state.shipAmount = String(arguments[2]);
            addDraft();
            state.security.insurance = true;
            state.security.guards = false;
            state.security.bribe = true;
            state.security.stealth = true;
            dispatch();
            """,
            deal["source"],
            deal["item"],
            max_qty,
            deal["dest"],
        )
        after = js(driver, "return state.shipments.length;")
        if after == before:
            continue
        used_items.add(deal["item"])
        sent.append(f"{deal['item']} {max_qty} {deal['source']}->{deal['dest']} net/u {deal['netPerUnit']:.0f}")

    return sent


def stabilize_position(driver: webdriver.Edge) -> None:
    js(
        driver,
        """
        if (state.currentCity !== arguments[0] && state.detained === 0 && !state.incidents.length) {
          state.travelCity = arguments[0];
          travel();
        }
        """,
        SAFE_HOME,
    )


def run() -> int:
    opts = Options()
    opts.binary_location = EDGE
    opts.add_argument("--headless=new")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=430,1400")

    driver = webdriver.Edge(options=opts)
    try:
        driver.get(URL)
        bootstrap(driver)

        for step in range(1, 401):
            stabilize_position(driver)
            resolved = resolve_incidents(driver)
            sold = sell_illegal(driver)
            sent = buy_and_dispatch(driver)

            snap = summary(driver)
            if step % 5 == 0 or resolved or sold or sent:
                print(
                    json.dumps(
                        {
                            "step": step,
                            "turn": snap["turn"],
                            "money": snap["money"],
                            "dirty": snap["dirty"],
                            "city": snap["currentCity"],
                            "detained": snap["detained"],
                            "warrant": snap["warrant"],
                            "workers": snap["workers"],
                            "thugs": snap["thugs"],
                            "incidents_resolved": resolved,
                            "sold": sold[:5],
                            "sent": sent[:5],
                            "message": snap["message"],
                        }
                    )
                )

            if (
                snap["workers"] >= TARGET_WORKERS
                and snap["thugs"] >= TARGET_THUGS
                and snap["dirty"] >= TARGET_DIRTY
            ):
                print("TARGET_REACHED")
                print(json.dumps(snap, indent=2))
                return 0

            js(driver, "nextTurn();")
            time.sleep(0.02)

        print("TARGET_NOT_REACHED")
        print(json.dumps(summary(driver), indent=2))
        return 1
    finally:
        driver.quit()


if __name__ == "__main__":
    raise SystemExit(run())
