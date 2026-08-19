================================================================================
TECHNICKÁ SPECIFIKACE: FILTROVNA PRO MINECRAFT BEDROCK EDITION
Verze: 1.21+ (kompatibilní s Bedrock 1.21.30+ / Script API v1.14.0+)
Formát: Behavior Pack + Resource Pack + Script API
Cílová platforma: iOS, Android, Windows, Xbox, PlayStation, Switch
================================================================================
ČÁST 1: PŘEHLED SYSTÉMU
1.1 NÁZEV A IDENTIFIKACE
Název systému:        Filtrovna
ID bloku:             filtrovna:filtr
ID vnitřního golema:  filtrovna:golem_inside
ID moba mini golema:  filtrovna:mini_copper_golem
Display name:         Filtr
Kategorie:            Redstone / Item Transport
Stackable:            Ano (64)
Hardness:             3.5
Resistance:           6.0
Sound group:          Copper
Map color:            #B87333 (měděná)
1.2 ARCHITEKTURA FILTR BLOKU A GOLEMA UVNITŘ
Filtr je 1×1×1 blok s průhledným předním sklem. Uvnitř bloku stojí
miniaturní entita Měděného Golema (filtrovna:golem_inside).
Tato entita plní DVĚ ZÁSADNÍ ROLE:
 * Inventář bloku: Nese 37-slotový container, čímž obchází omezení Bedrock Engine u custom bloků.
 * Vizuální 3D model & Animace: Golem je viditelný přes přední sklo, reaguje na stav bloku (přikývnutí, kroutí hlavou, hází předměty, zmatkuje při zaseknutí) a má svítící oči.
Směrové třídění:
 * VSTUP:    Levá strana (označena žlutým plus)
 * MATCH:    Spodní strana (označena zeleným kolečkem) — tříděné předměty
 * NE:       Pravá strana (označena červeným mínus) — odpad
1.3 INVENTÁŘ BLOKU (NESEN ENTITOU GOLEMA)
Celkový počet slotů: 37
Rozdělení:
Sloty 0–8:    VSTUP (9 slotů, 3×3)
Sloty 9–18:   FILTR (10 slotů — definice, co se má třídit)
Sloty 19–27:  MATCH (9 slotů, 3×3 — výstup dolů)
Sloty 28–36:  NE (9 slotů, 3×3 — výstup vpravo)
Interakce: Pravým klikem na blok se otevře custom UI z @minecraft/server-ui.
================================================================================
ČÁST 2: VIZUÁLNÍ A STAVOVÁ SPECIFIKACE BLOKU
2.1 STRANY BLOKU
 * HORNÍ (Y+): waxed_copper_grate
 * SPODNÍ (Y-): waxed_copper_bulb_green (emisivní, light level 8)
 * LEVÁ (VSTUP): waxed_copper_hammered + žlutý overlay plus (+)
 * PRAVÁ (NE): waxed_copper_hammered + červený overlay mínus (−)
 * ZADNÍ: waxed_copper_grate
 * PŘEDNÍ: Horní 3/4 průhledné sklo (blend, 30% alpha), spodní 1/4 žárovka (emisivní)
2.2 STAVOVÝ INDIKÁTOR BLOKU
 * Čeká (Idle): #00FF00 (zelená, light level 8)
 * Kontroluje (Processing): #FFFF00 (žlutá, light level 10)
 * Třídí MATCH: #0080FF (modrá, light level 12)
 * Třídí NE: #FF8000 (oranžová, light level 12)
 * Drop aktivní: #FFFFFF (bílá, light level 15)
 * Zaseknutý (Stuck): #FF0000 (červená, bliká, light level 6)
================================================================================
ČÁST 3: MINI COPPER GOLEM (VOLNÁ ENTITA PRO LOGISTIKU)
3.1 KONCEPT MINI GOLEMA
Mimo golema uzavřeného ve Filtr bloku obsahuje addon také volně pobíhajícího
moba filtrovna:mini_copper_golem.
Designové vlastnosti:
 * Vzhledově i modelově je TOTOŽNÝ s golemem uvnitř Filtr bloku (zmenšený originální copper golem).
 * Využívá stejné textury (včetně oxidovaných variant a emisivních očí) a stejné zvukové efekty.
Funkční vlastnosti:
 * Dávkový sběr: Na rozdíl od běžných mobů berou předměty v dávkách po 10 kusech a jsou výrazně svižnější.
 * Zdroje sběru: Vyhledávají a berou předměty:
   * Volně ležící na zemi
   * Z Měděných truhlic (filtrovna:copper_chest)
   * Z Ender truhlic (minecraft:ender_chest) patřících jejich majiteli
 * Cíl doručení: Všechny nasbírané předměty odnášejí do nejbližšího bloku filtrovna:filtr a vkládají je do jeho VSTUPNÍCH slotů (0–8).
 * Majitel & Voskování: Majitelem je hráč, který golema navoskoval pláství (minecraft:honeycomb). Golem vidí Ender truhlu pouze svého majitele.
 * Oxidace: Volní golemové oxidují ve 4 fázích (Copper → Exposed → Weathered → Oxidized). S každým stupněm oxidace se jejich rychlost pohybu snižuje o 15 %. Použitím sekyry je lze očistit, použitím plástve navoskovat a fixovat jejich stav.
================================================================================
ČÁST 4: SCRIPT API — TICK LOGIKA A SMĚRY
4.1 LOGIKA FILTR BLOKU (TICK HANDLER)
Skript spouští tick logiku v intervalu 2 ticků (system.runInterval):
 * Načte z bloku ID svázané entity filtrovna:golem_inside.
 * Zkontroluje první neprázdný slot ve VSTUPU (0–8).
 * Pokud najde předmět, spustí animaci "inspect" (golem se otočí k VSTUPU).
 * Porovná typ předmětu (typeId) se sloty FILTRU (9–18). Pokud je FILTR prázdný, vše projde do MATCH.
 * Pokud se shoduje \rightarrow pokusí se o přenos dolů (MATCH). Pokud neshoduje \rightarrow přenos vpravo (NE).
 * Pokud je cílový kontejner plný nebo chybí, vyhodí předmět do prostoru jako item entity (drop).
 * Pokud je cesta zcela zablokována, nastaví stav "stuck" (golem třese hlavou).
4.2 LOGIKA MINI GOLEMA
 * V intervalu 20 ticků vyhledává volné předměty, Měděné truhlice nebo Ender truhlu majitele v okruhu 16 bloků.
 * Po dosažení zdroje odebere až 10 ks předmětu do svého interního inventáře.
 * Najde nejbližší filtrovna:filtr, přiběhne k jeho levé straně (VSTUP) a předá předměty do slotů 0–8.
4.3 RELATIVNÍ SMĚRY BLOKU
Orientace se načítá z block state minecraft:cardinal_direction:
 * South (Z+): VSTUP = East (X+), NE = West (X-)
 * West (X-): VSTUP = South (Z+), NE = North (Z-)
 * North (Z-): VSTUP = West (X-), NE = East (X+)
 * East (X+): VSTUP = North (Z-), NE = South (Z+)
 * MATCH je vždy dolů (Y-).
================================================================================
ČÁST 5: PŘÍKAZY PRO SPRÁVU (SCRIPT EVENTS)
5.1 SYNTAXE PŘÍKAZŮ
Příkazy se spouštějí standardně přes rozhraní /scriptevent.
Syntaxe:
/scriptevent filtrovna:set <slot_start> <slot_end> <item_id> [amount]
Příklady:
/scriptevent filtrovna:set 0 8 minecraft:stone 64
/scriptevent filtrovna:set 9 18 minecraft:diamond 1
================================================================================
ČÁST 6: DEFINICE BEHAVIOR PACKU A STRUKTUR JSON
6.1 BEHAVIOR PACK manifest.json
{
"format_version": 2,
"header": {
"name": "Filtrovna Behavior Pack",
"description": "Inteligentní třídící systém s Měděnými Golemy",
"uuid": "f8a1b2c3-d4e5-4a6b-8c7d-9e0f1a2b3c4d",
"version": [1, 0, 0],
"min_engine_version": [1, 21, 0]
},
"modules": [
{
"type": "data",
"uuid": "e7a1b2c3-d4e5-4a6b-8c7d-9e0f1a2b3c4e",
"version": [1, 0, 0]
},
{
"type": "script",
"language": "javascript",
"uuid": "d6a1b2c3-d4e5-4a6b-8c7d-9e0f1a2b3c4f",
"entry": "scripts/main.js",
"version": [1, 0, 0]
}
],
"dependencies": [
{
"module_name": "@minecraft/server",
"version": "1.14.0"
},
{
"module_name": "@minecraft/server-ui",
"version": "1.2.0"
}
]
}
6.2 BLOK DEFINICE (blocks/filtr.json)
{
"format_version": "1.21.0",
"minecraft:block": {
"description": {
"identifier": "filtrovna:filtr",
"menu_category": {
"category": "items_to_blocks",
"group": "itemGroup.name.redstone"
},
"traits": {
"minecraft:placement_direction": {
"enabled_states": ["minecraft:cardinal_direction"]
}
}
},
"components": {
"minecraft:geometry": "geometry.filtrovna_filtr_casing",
"minecraft:material_instances": {
"*": {
"texture": "waxed_copper_block",
"render_method": "opaque"
},
"front_glass": {
"texture": "filtr_front_glass",
"render_method": "blend"
}
},
"minecraft:destructible_by_mining": {
"seconds": 3.5
},
"minecraft:map_color": "#B87333",
"minecraft:light_emission": {
"emission": 8
}
}
}
}
6.3 ENTITA GOLEMA UVNITŘ BLOKU (entities/golem_inside.json)
{
"format_version": "1.21.0",
"minecraft:entity": {
"description": {
"identifier": "filtrovna:golem_inside",
"is_spawnable": false,
"is_summonable": true
},
"components": {
"minecraft:type_family": {
"families": ["inanimate", "filtrovna_golem"]
},
"minecraft:inventory": {
"inventory_size": 37,
"container_type": "container"
},
"minecraft:scale": {
"value": 0.55
},
"minecraft:physics": {
"has_gravity": false,
"has_collision": false
},
"minecraft:pushable": {
"is_pushable": false,
"is_pushable_by_piston": false
},
"minecraft:health": {
"value": 1,
"max": 1
},
"minecraft:damage_sensor": {
"triggers": {
"cause": "all",
"deals_damage": false
}
}
}
}
}
6.4 MINI COPPER GOLEM ENTITA (entities/mini_copper_golem.json)
{
"format_version": "1.21.0",
"minecraft:entity": {
"description": {
"identifier": "filtrovna:mini_copper_golem",
"is_spawnable": true,
"is_summonable": true
},
"components": {
"minecraft:type_family": {
"families": ["mob", "copper_golem", "filtrovna_helper"]
},
"minecraft:inventory": {
"inventory_size": 10,
"container_type": "container"
},
"minecraft:scale": {
"value": 0.55
},
"minecraft:movement": {
"value": 0.3
},
"minecraft:health": {
"value": 15,
"max": 15
},
"minecraft:interact": {
"interactions": [
{
"on_interact": {
"filters": {
"test": "has_equipment",
"subject": "other",
"domain": "hand",
"value": "minecraft:honeycomb"
},
"event": "filtrovna:wax_golem"
},
"use_item": true
}
]
}
}
}
}
================================================================================
ČÁST 7: SCRIPT API IMPLEMENTACE (scripts/main.js)
import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

// 1. Založení golem entity při položení Filtr bloku
world.afterEvents.playerPlaceBlock.subscribe((event) => {
  if (event.block.typeId === "filtrovna:filtr") {
    const loc = event.block.location;
    const golem = event.dimension.spawnEntity("filtrovna:golem_inside", {
      x: loc.x + 0.5,
      y: loc.y + 0.1,
      z: loc.z + 0.5
    });

    const facing = event.block.permutation.getState("minecraft:cardinal_direction");
    let rotationY = 0;
    if (facing === "west") rotationY = 90;
    if (facing === "north") rotationY = 180;
    if (facing === "east") rotationY = 270;

    golem.setRotation(rotationY, 0);
    event.block.setDynamicProperty("golem_id", golem.id);
  }
});

// 2. Vyčištění a vyhození předmětů při zničení bloku
world.afterEvents.playerBreakBlock.subscribe((event) => {
  if (event.brokenBlockPermutation.type.id === "filtrovna:filtr") {
    const golemId = event.block.getDynamicProperty("golem_id");
    if (golemId) {
      const golem = world.getEntity(golemId);
      if (golem) {
        const inv = golem.getComponent("minecraft:inventory")?.container;
        if (inv) {
          for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (item) {
              event.dimension.spawnItem(item, event.block.location);
            }
          }
        }
        golem.remove();
      }
    }
  }
});

// 3. UI Interakce
world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  if (event.block.typeId === "filtrovna:filtr") {
    const golemId = event.block.getDynamicProperty("golem_id");
    if (!golemId) return;
    const golem = world.getEntity(golemId);
    if (!golem) return;

    openFilterUI(event.player, golem);
  }
});

function openFilterUI(player, golem) {
  const form = new ActionFormData()
    .title("Filtr — Správa Golema")
    .body("Správa inventáře a filtrovacích pravidel")
    .button("VSTUP (0-8)")
    .button("FILTR PRAVIDLA (9-18)")
    .button("VYTRÍDĚNÉ - MATCH (19-27)")
    .button("ODPAD - NE (28-36)");

  form.show(player).then((response) => {
    if (response.canceled) return;
    player.sendMessage(`§aVybrána sekce ${response.selection}`);
  });
}

// 4. Nastavení obsahu přes /scriptevent příkazy
system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id === "filtrovna:set") {
    const args = event.message.split(" ");
    const start = parseInt(args[0]);
    const end = parseInt(args[1]);
    const itemId = args[2];
    const amount = parseInt(args[3] || "1");

    if (event.sourceBlock) {
      const golemId = event.sourceBlock.getDynamicProperty("golem_id");
      if (golemId) {
        const golem = world.getEntity(golemId);
        const inv = golem?.getComponent("minecraft:inventory")?.container;
        if (inv) {
          for (let i = start; i <= end; i++) {
            inv.setItem(i, new ItemStack(itemId, amount));
          }
        }
      }
    }
  }
});

// 5. Základní AI rutina pro Mini Copper Golemy
system.runInterval(() => {
  const overworld = world.getDimension("overworld");
  const miniGolems = overworld.getEntities({ type: "filtrovna:mini_copper_golem" });

  for (const golem of miniGolems) {
    const inv = golem.getComponent("minecraft:inventory")?.container;
    if (!inv) continue;

    // Pokud je inventář prázdný, hledáme ležící předměty na zemi (do 10 ks)
    if (inv.emptySlotsCount === inv.size) {
      const items = overworld.getEntities({
        type: "minecraft:item",
        location: golem.location,
        maxDistance: 8
      });

      for (const itemEntity of items) {
        const itemStack = itemEntity.getComponent("minecraft:item")?.itemStack;
        if (itemStack) {
          const countToTake = Math.min(itemStack.amount, 10);
          const takenStack = itemStack.clone();
          takenStack.amount = countToTake;

          inv.addItem(takenStack);

          if (itemStack.amount <= countToTake) {
            itemEntity.remove();
          } else {
            itemStack.amount -= countToTake;
          }
          break;
        }
      }
    }
  }
}, 20);

================================================================================
ČÁST 8: CRAFTING RECEPTY
8.1 RECIPE: FILTR BLOK (recipes/filtr.json)
{
"format_version": "1.21.0",
"minecraft:recipe_shaped": {
"description": {
"identifier": "filtrovna:filtr"
},
"tags": [ "crafting_table" ],
"pattern": [
"MCM",
"SGS",
"MBM"
],
"key": {
"M": { "item": "minecraft:waxed_copper_block" },
"C": { "item": "minecraft:waxed_copper_grate" },
"S": { "item": "minecraft:glass" },
"G": { "item": "minecraft:copper_ingot" },
"B": { "item": "minecraft:waxed_copper_bulb" }
},
"result": {
"item": "filtrovna:filtr",
"count": 1
}
}
}
================================================================================
ČÁST 9: LOKALIZACE
9.1 texts/cs_CZ.lang
tile.filtrovna:filtr.name=Filtr
tile.filtrovna:filtr.description=Inteligentní třídící blok s měděným golemem
entity.filtrovna:golem_inside.name=Filtr Golem
entity.filtrovna:mini_copper_golem.name=Mini Měděný Golem
9.2 texts/en_US.lang
tile.filtrovna:filtr.name=Filter
tile.filtrovna:filtr.description=Intelligent sorting block with copper golem
entity.filtrovna:golem_inside.name=Filter Golem
entity.filtrovna:mini_copper_golem.name=Mini Copper Golem
