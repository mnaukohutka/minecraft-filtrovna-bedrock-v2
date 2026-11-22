# Filtrovna — project notes

- Minecraft Bedrock addon (Behavior Pack + Resource Pack + Script API), author `mnaukohutka`.
- Target: Minecraft Bedrock **1.26.60**, `@minecraft/server` **2.11.0**, `@minecraft/server-ui` **2.3.0**; `min_engine_version` `[1, 26, 60]`.
- IDs: block `filtrovna:filtr`, inner entity `filtrovna:golem_inside`, mini entity `filtrovna:mini_copper_golem`.
- Block custom component: `filtrovna:filtr_logic` (`onPlace`, `onBreak`, `onTick`), registered in `BP/scripts/main.js` from `system.beforeEvents.startup`.
- Inventory: 37 slots on the inner golem; VSTUP 0–8, FILTR 9–18, MATCH 19–27, NE 28–36. When MATCH/NE is full, items drop below/right; a blocked drop path sets `stuck`.
- Visuals: waxed copper casing, `geometry.filtrovna_filtr_casing`, front glass 30% alpha, status bulbs, yellow plus (VSTUP), red minus (NE), green bottom LED, grates.
- Build: zip `BP/` and `RP/` directly into `Filtrovna.mcaddon` (no top-level wrapper folder).
- Validation: official Bedrock 1.26.60 JSON schemas for block/entities (0 errors), `node --check`, JSON syntax. A temporary Node stub suite covered placement, routing, drop/stuck, mini pickup/delivery, UI, scriptevents, oxidation, break ejection and cleanup; it is not checked in.
- 1.26.60 gotchas: `world.afterEvents.worldLoad`; `world.beforeEvents.entityItemPickup`; `system.beforeEvents.startup`; entity `minecraft:interact` is required for `playerInteractWithEntity`; block `menu_category.category` must be `construction`/`nature`/`equipment`/`items`/`none`; recipes use `unlock: [{ "context": "AlwaysUnlocked" }]`.
- Ender chest access is limited by the Script API; the golem only considers one when its owner is online within 16 blocks, and the game may not expose the owner's ender inventory.
