import json
import time
from dataclasses import dataclass

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options


GAME_URL = "file:///C:/Users/pc1/Documents/Global-Trader-Game/index.html"


@dataclass
class ScenarioResult:
    name: str
    turn: int
    money: int
    illegal_sales: int
    legal_sales: int
    enterprise_value: int
    white_collar_profit: int
    life_type: str
    detained: int
    warrant: bool
    notes: str


class GameHarness:
    def __init__(self):
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1440,2200")
        self.driver = webdriver.Edge(options=options)

    def close(self):
        self.driver.quit()

    def load(self):
        self.driver.get(GAME_URL)
        time.sleep(0.5)
        self.assert_clean()

    def body_text(self):
        return self.driver.find_element(By.TAG_NAME, "body").text

    def assert_clean(self):
        body = self.body_text()
        if "Game Error" in body:
            raise RuntimeError(body)

    def js(self, script, *args):
        value = self.driver.execute_script(script, *args)
        self.assert_clean()
        return value

    def snapshot(self):
        return self.js(
            """
            return {
              turn: state.turn,
              money: state.money,
              illegalSales: state.illegalSales,
              legalSales: state.legalSales,
              enterpriseValue: state.enterpriseValue,
              whiteCollarProfit: state.whiteCollarProfit,
              lifeType: lifeType(),
              detained: state.detained,
              warrant: state.warrant.active,
              message: state.message
            };
            """
        )

    def incident(self):
        return self.js(
            """
            if (!state.incidents.length) return null;
            const inc = state.incidents[0];
            return { type: inc.type, title: inc.title, options: inc.options };
            """
        )

    def set_field(self, key, value):
        self.js("field(arguments[0], arguments[1])", key, value)

    def choose_item(self, category, item):
        self.js("setCat(arguments[0]); pickItem(arguments[1])", category, item)

    def buy(self):
        self.js("buy()")

    def sell(self):
        self.js("sell()")

    def next_turn(self):
        self.js("nextTurn()")

    def hire(self, agent_type, count=1):
        self.set_field("hireType", agent_type)
        for _ in range(count):
            self.js("hireAgent()")

    def agent_ids(self, agent_type):
        return self.js(
            "return state.agents.filter(a => a.type === arguments[0]).map(a => a.id)",
            agent_type,
        )

    def move_agent(self, agent_id, city):
        self.set_field("agentTarget", city)
        self.js("moveAgent(arguments[0])", agent_id)

    def travel(self, city):
        self.set_field("travelCity", city)
        self.js("travel()")

    def resolve_all(self, mode, limit=20):
        preferences = {
            "legal": {
                "antitrust": "lobbyBoard",
                "labor": "publicSpin",
                "pr": "publicSpin",
                "sec": "acceptLoss",
                "audit": "acceptLoss",
                "informant": "acceptLoss",
                "customs": "acceptLoss",
                "police": "acceptLoss",
                "judge": "acceptLoss",
            },
            "cartel": {
                "antitrust": "acceptLoss",
                "labor": "acceptLoss",
                "pr": "acceptLoss",
                "sec": "acceptLoss",
                "audit": "customsBribe",
                "informant": "policeBribe",
                "customs": "customsBribe",
                "police": "policeBribe",
                "judge": "judgeBribe",
            },
            "hybrid": {
                "antitrust": "lobbyBoard",
                "labor": "publicSpin",
                "pr": "publicSpin",
                "sec": "buryBooks",
                "audit": "customsBribe",
                "informant": "policeBribe",
                "customs": "customsBribe",
                "police": "policeBribe",
                "judge": "judgeBribe",
            },
        }

        for _ in range(limit):
            inc = self.incident()
            if not inc:
                return
            pref = preferences[mode].get(inc["type"], None)
            action = pref if pref in inc["options"] else inc["options"][0]
            self.js("resolve(arguments[0])", action)
        raise RuntimeError(f"Incident loop did not settle for {mode}")

    def idle_turns(self, mode, count):
        for _ in range(count):
            self.resolve_all(mode)
            self.next_turn()

    def settle_until_clear(self, mode, limit=12):
        for _ in range(limit):
            self.resolve_all(mode)
            pending = self.js("return state.shipments.length + state.incidents.length")
            if pending == 0:
                return
            self.next_turn()
        raise RuntimeError(f"Routes did not settle for {mode}")

    def pick_best_pair(self, illegal_mode=False):
        return self.js(
            """
            const useIllegal = arguments[0];
            const items = allItems.filter(item => useIllegal ? illegal.has(item) : !illegal.has(item));
            const cities = useIllegal
              ? [...new Set(state.agents.filter(a => a.type === 'thug').map(a => a.city).concat([state.currentCity]))]
              : accessibleCities();
            let best = null;
            for (const item of items) {
              for (const from of cities) {
                for (const to of cities) {
                  if (from === to) continue;
                  const fromPrice = state.market[from][item];
                  const toPrice = state.market[to][item];
                  const rawDiff = toPrice - fromPrice;
                  const riskPenalty = useIllegal
                    ? profile(to).law * 900 + (profile(to).strict ? 700 : 0) - (profile(to).safe ? 350 : 0) - (profile(from).safe ? 220 : 0)
                    : 0;
                  const score = rawDiff - riskPenalty;
                  if (!best || score > best.score) {
                    best = { item, from, to, diff: rawDiff, score, fromPrice, toPrice };
                  }
                }
              }
            }
            return best;
            """,
            illegal_mode,
        )

    def buy_and_ship(self, from_city, to_city, item, qty):
        category = self.js(
            """
            const item = arguments[0];
            return Object.keys(goods).find(key => goods[key].includes(item));
            """,
            item,
        )
        self.set_field("operationCity", from_city)
        self.choose_item(category, item)
        self.set_field("tradeAmount", str(qty))
        self.buy()
        self.js("pickOrigin(arguments[0]); pickDest(arguments[1])", from_city, to_city)
        self.set_field("shipItem", item)
        self.set_field("shipAmount", str(qty))
        self.js("addDraft(); dispatch()")

    def enable_all_security(self):
        self.js(
            """
            Object.keys(state.security).forEach(key => {
              if (!state.security[key]) toggleSec(key);
            });
            """
        )

    def sell_remote(self, city, item, qty):
        category = self.js(
            """
            const item = arguments[0];
            return Object.keys(goods).find(key => goods[key].includes(item));
            """,
            item,
        )
        self.set_field("operationCity", city)
        self.choose_item(category, item)
        self.set_field("tradeAmount", str(qty))
        self.sell()

    def city_inventory_qty(self, city, item):
        return self.js(
            """
            const city = arguments[0];
            const item = arguments[1];
            return (state.storage[city] && state.storage[city][item]) || (city === state.currentCity ? (state.cargo[item] || 0) : 0);
            """,
            city,
            item,
        )

    def expansion_cycle(self):
        self.js("expandEnterprise()")

    def charity(self):
        self.js("charityGala()")

    def cook_books(self):
        self.js("cookBooks()")

    def legal_trade_cycle(self):
        pair = self.pick_best_pair(illegal_mode=False)
        snap = self.snapshot()
        qty = max(6, min(20, int(snap["money"] / max(1, pair["fromPrice"] * 4))))
        self.buy_and_ship(pair["from"], pair["to"], pair["item"], qty)
        self.settle_until_clear("legal")
        self.resolve_all("legal")
        landed = self.city_inventory_qty(pair["to"], pair["item"])
        if landed:
            self.sell_remote(pair["to"], pair["item"], landed)
        return pair, landed

    def cartel_trade_cycle(self):
        pair = self.pick_best_pair(illegal_mode=True)
        snap = self.snapshot()
        qty = max(4, min(10, int(snap["money"] / max(1, pair["fromPrice"] * 7))))
        self.set_field("operationCity", pair["from"])
        self.choose_item(
            self.js("return Object.keys(goods).find(key => goods[key].includes(arguments[0]))", pair["item"]),
            pair["item"],
        )
        self.set_field("tradeAmount", str(qty))
        self.buy()
        self.js("pickOrigin(arguments[0]); pickDest(arguments[1])", pair["from"], pair["to"])
        self.set_field("shipItem", pair["item"])
        self.set_field("shipAmount", str(qty))
        self.enable_all_security()
        self.js("addDraft(); dispatch()")
        self.settle_until_clear("cartel")
        self.resolve_all("cartel")
        landed = self.city_inventory_qty(pair["to"], pair["item"])
        if landed:
            self.sell_remote(pair["to"], pair["item"], landed)
        return pair, landed

    def hybrid_trade_cycle(self):
        pair = self.pick_best_pair(illegal_mode=True)
        snap = self.snapshot()
        qty = max(4, min(9, int(snap["money"] / max(1, pair["fromPrice"] * 7))))
        self.set_field("operationCity", pair["from"])
        self.choose_item(
            self.js("return Object.keys(goods).find(key => goods[key].includes(arguments[0]))", pair["item"]),
            pair["item"],
        )
        self.set_field("tradeAmount", str(qty))
        self.buy()
        self.js("pickOrigin(arguments[0]); pickDest(arguments[1])", pair["from"], pair["to"])
        self.set_field("shipItem", pair["item"])
        self.set_field("shipAmount", str(qty))
        self.enable_all_security()
        self.js("addDraft(); dispatch()")
        self.settle_until_clear("hybrid")
        self.resolve_all("hybrid")
        landed = self.city_inventory_qty(pair["to"], pair["item"])
        if landed:
            self.sell_remote(pair["to"], pair["item"], landed)
        return pair, landed


def run_legal(game):
    game.load()
    game.hire("worker", 5)
    worker_targets = ["Chicago", "Berlin", "Singapore", "Dubai", "Toronto"]
    for agent_id, city in zip(game.agent_ids("worker"), worker_targets):
        game.move_agent(agent_id, city)

    trade_notes = []
    for i in range(18):
        game.resolve_all("legal")
        if i in (0, 4, 8):
            pair, qty = game.legal_trade_cycle()
            if qty:
                trade_notes.append(f"{pair['item']} {pair['from']}->{pair['to']} x{qty}")
        else:
            game.expansion_cycle()
            if i % 3 == 2:
                game.charity()
            game.next_turn()
        if game.snapshot()["lifeType"] == "Legal Mogul":
            break

    snap = game.snapshot()
    if snap["lifeType"] != "Legal Mogul":
        raise RuntimeError(f"Legal path did not become Legal Mogul: {snap}")
    return ScenarioResult(
        name="legal_mogul",
        turn=snap["turn"],
        money=snap["money"],
        illegal_sales=snap["illegalSales"],
        legal_sales=snap["legalSales"],
        enterprise_value=snap["enterpriseValue"],
        white_collar_profit=snap["whiteCollarProfit"],
        life_type=snap["lifeType"],
        detained=snap["detained"],
        warrant=snap["warrant"],
        notes="; ".join(trade_notes) or "expansion-only",
    )


def run_cartel(game):
    game.load()
    game.hire("thug", 3)
    thug_targets = ["Bogota", "Singapore", "Lagos"]
    for agent_id, city in zip(game.agent_ids("thug"), thug_targets):
        game.move_agent(agent_id, city)

    game.travel("Lagos")
    game.resolve_all("cartel")

    trade_notes = []
    while True:
        snap = game.snapshot()
        if snap["illegalSales"] >= 35000 and snap["lifeType"] == "Cartel Boss":
            break
        pair, qty = game.cartel_trade_cycle()
        if qty:
            trade_notes.append(f"{pair['item']} {pair['from']}->{pair['to']} x{qty}")
        if len(trade_notes) > 8:
            break

    # Force a non-haven kingpin travel test.
    game.resolve_all("cartel")
    game.travel("New York")
    post_travel = game.snapshot()
    if not post_travel["detained"] and not post_travel["warrant"]:
        game.next_turn()
        post_travel = game.snapshot()

    snap = game.snapshot()
    if snap["lifeType"] not in ("Cartel Boss", "Shadow Tycoon"):
        raise RuntimeError(f"Cartel path did not reach cartel status: {snap}")
    if snap["illegalSales"] < 35000:
        raise RuntimeError(f"Cartel path illegal sales too low: {snap}")
    return ScenarioResult(
        name="cartel_boss",
        turn=snap["turn"],
        money=snap["money"],
        illegal_sales=snap["illegalSales"],
        legal_sales=snap["legalSales"],
        enterprise_value=snap["enterpriseValue"],
        white_collar_profit=snap["whiteCollarProfit"],
        life_type=snap["lifeType"],
        detained=snap["detained"],
        warrant=snap["warrant"],
        notes="; ".join(trade_notes) + f"; post-kingpin travel message: {post_travel['message']}",
    )


def run_hybrid(game):
    game.load()
    game.hire("worker", 5)
    game.hire("thug", 3)

    worker_targets = ["Chicago", "Berlin", "Singapore", "Dubai", "Toronto"]
    thug_targets = ["Bogota", "Singapore", "Lagos"]
    for agent_id, city in zip(game.agent_ids("worker"), worker_targets):
        game.move_agent(agent_id, city)
    for agent_id, city in zip(game.agent_ids("thug"), thug_targets):
        game.move_agent(agent_id, city)

    game.travel("Lagos")
    game.resolve_all("hybrid")

    notes = []
    for _ in range(4):
        snap = game.snapshot()
        if snap["illegalSales"] >= 65000:
            break
        pair, qty = game.hybrid_trade_cycle()
        if qty:
            notes.append(f"dirty {pair['item']} {pair['from']}->{pair['to']} x{qty}")

    for _ in range(10):
        snap = game.snapshot()
        if snap["enterpriseValue"] >= 850000 and snap["legalSales"] >= 125000:
            break
        game.resolve_all("hybrid")
        game.expansion_cycle()
        if game.snapshot()["money"] > 40000:
            game.charity()
            notes.append("charity")
        notes.append("expand")
        game.next_turn()

    for _ in range(12):
        snap = game.snapshot()
        if game.snapshot()["lifeType"] == "Shadow Tycoon":
            break
        game.resolve_all("hybrid")
        if snap["money"] > 12000:
            game.cook_books()
            notes.append("cook books")
        else:
            game.expansion_cycle()
            notes.append("expand")
        game.next_turn()
        if game.snapshot()["lifeType"] == "Shadow Tycoon":
            break

    for _ in range(8):
        if game.snapshot()["lifeType"] == "Shadow Tycoon":
            break
        game.resolve_all("hybrid")
        pair, qty = game.legal_trade_cycle()
        if qty:
            notes.append(f"legal {pair['item']} {pair['from']}->{pair['to']} x{qty}")
        game.next_turn()
        if game.snapshot()["lifeType"] == "Shadow Tycoon":
            break

    snap = game.snapshot()
    if snap["lifeType"] != "Shadow Tycoon":
        raise RuntimeError(f"Hybrid path did not become Shadow Tycoon: {snap}")
    return ScenarioResult(
        name="shadow_tycoon",
        turn=snap["turn"],
        money=snap["money"],
        illegal_sales=snap["illegalSales"],
        legal_sales=snap["legalSales"],
        enterprise_value=snap["enterpriseValue"],
        white_collar_profit=snap["whiteCollarProfit"],
        life_type=snap["lifeType"],
        detained=snap["detained"],
        warrant=snap["warrant"],
        notes="; ".join(notes),
    )


def main():
    harness = GameHarness()
    try:
        results = [
            run_legal(harness),
            run_cartel(harness),
            run_hybrid(harness),
        ]
        print(json.dumps([result.__dict__ for result in results], indent=2))
    finally:
        harness.close()


if __name__ == "__main__":
    main()
