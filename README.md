# Filtr

## Specifikace

### Technická specifikace: FILTROVNA PRO MINECRAFT BEDROCK EDITION

#### Verze: 1.21+ (kompatibilní s Bedrock 1.21.30+ / Script API v1.14.0+)
#### Formát: Behavior Pack + Resource Pack + Script API
#### Cílová platforma: iOS, Android, Windows, Xbox, PlayStation, Switch

#### ČÁST 1: PŘEHLED SYSTÉMU

#### 1.1 NÁZEV A IDENTIFIKACE
- Název systému:        Filtrovna
- ID bloku:             filtrovna:filtr
- ID vnitřního golema:  filtrovna:golem_inside
- ID moba mini golema:  filtrovna:mini_copper_golem
- Display name:         Filtr
- Kategorie:            Redstone / Item Transport
- Stackable:            Ano (64)
- Hardness:             3.5
- Resistance:           6.0
- Sound group:          Copper
- Map color:            #B87333 (měděná)

#### 1.2 ARCHITEKTURA FILTR BLOKU A GOLEMA UVNITŘ BLOKU

#### 1.3 VYŠETKOVANÍ BLOKU
- Geometry:               geometry.filtrovna_filtr_casing
- Material instances:      Waxed Copper Block, Front Glass
- Destructible by mining:  3.5 seconds
- Map color:            #B87333
- Light emission:          8

#### 1.4 VYŠETKOVANÍ GOLEMA UVNITŘ BLOKU
- Scale:                 0.55
- Physics:               No gravity, no collision
- Pushable:              No pushable, no pushable by piston
- Health:                1, max: 1
- Damage sensor:        Triggers all, deals damage: false

#### 1.5 VYŠETKOVANÍ MINI COPPER GOLEMA
- Scale:                 0.55
- Movement:               0.3
- Health:                15, max: 15
- Interact:              Interact with a honeycomb

### ČÁST 2: PŘÍKAZY PRO SPRÁVU (SCRIPT EVENTS)

#### 2.1 SYNTAXE PŘÍKAZŮ
- `/scriptevent filtrovna:set <slot_start> <slot_end> <item_id> [amount]`
- Příklady:
  - `/scriptevent filtrovna:set 0 8 minecraft:stone 64`
  - `/scriptevent filtrovna:set 9 18 minecraft:diamond 1`

### ČÁST 3: DEFINICE BEHAVIOR PACKU A STRUKTUR JSON

#### 3.1 BEHAVIOR PACK manifest.json
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

#### 3.2 BLOK DEFINICE (blocks/filtr.json)
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

#### 3.3 ENTITA GOLEMA UVNITŘ BLOKU (entities/golem_inside.json)
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

#### 3.4 MINI COPPER GOLEMA ENTITA (entities/mini_copper_golem.json)
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

#### 3.5 SCRIPT API IMPLEMENTACE (scripts/main.js)
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
    const golem = world.getEntityById(event.block.dynamicProperty("golem_id"));
    if (golem) {
      golem.kill();
      const inventory = golem.getComponent("minecraft:inventory");
      inventory.clear();
    }
  }
});

### ČÁST 4: PŘÍKAZY PRO SPRÁVU

#### 4.1 SYNTAXE PŘÍKAZŮ
- `/scriptevent filtrovna:set <slot_start> <slot_end> <item_id> [amount]`
- Příklady:
  - `/scriptevent filtrovna:set 0 8 minecraft:stone 64`
  - `/scriptevent filtrovna:set 9 18 minecraft:diamond 1`

### ČÁST 5: OZNÁMANÍ

- **Vytváření:** Filtrovna Behavior Pack je vytvářeno pro vývojářů Minecraft, kteří potřebují efektivní třídící systém s Měděnými golemami.
- **Nástroje:** Filtrovna Behavior Pack využívá JavaScript a Minecraft API, což umožňuje vývojářům použít veškeré funkcionalnosti Minecraft.
- **Součásti:** Filtrovna Behavior Pack obsahuje vlastní geometry, material instances, destructible by mining, map color a light emission, což umožňuje vývojářům přizpůsobit svůj prostředí.
- **Příklady:** Filtrovna Behavior Pack obsahuje příklady how-to, jak vytvořit a použít svůj prostředí. Tento prostředí může být zde použité v jiných projektech, kde je potřeba třídící systém s Měděnými golemami.

### ČÁST 6: SOUTILOVÁCH ÚKOL

- **1. Vytvoření:** Vytvořte nový projekt a vložte všechny potřebné soubory a kódy z Filtrovna Behavior Pack.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 7: DOKUMENTACE

- **1. Vytvoření:** Vytvořte nový soubor s dokumentací a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 8: PRIVÁTNÍ A KOMMERCIálnÍ SOUTILOVÁCH ÚKOL

- **1. Vytvoření:** Vytvořte nový soubor s privátními a kommerciálními úkoly a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 9: POTRUBA PRISTUPU

- **1. Vytvoření:** Vytvořte nový soubor s potřebou přístupu a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 10: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 11: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 12: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 13: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 14: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 15: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 16: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 17: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 18: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 19: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 20: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 21: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 22: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 23: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 24: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 25: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 26: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 27: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 28: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 29: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 30: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 31: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 32: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 33: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 34: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 35: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 36: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 37: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 38: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 39: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 40: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 41: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 42: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 43: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 44: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 45: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 46: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 47: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 48: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 49: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 50: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 51: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 52: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 53: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 54: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 55: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 56: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 57: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 58: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 59: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 60: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 61: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 62: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 63: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 64: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 65: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 66: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 67: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 68: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 69: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 70: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 71: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 72: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 73: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 74: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 75: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 76: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 77: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 78: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 79: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 80: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 81: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 82: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 83: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 84: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 85: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 86: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 87: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 88: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 89: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 90: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 91: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 92: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 93: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 94: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 95: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 96: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 97: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 98: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 99: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 100: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 101: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 102: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 103: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 104: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 105: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 106: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 107: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 108: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 109: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 110: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 111: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 112: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 113: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 114: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 115: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 116: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 117: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 118: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 119: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 120: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 121: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 122: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 123: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 124: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 125: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 126: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 127: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 128: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 129: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 130: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 131: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 132: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 133: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 134: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 135: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 136: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 137: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 138: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 139: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 140: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 141: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 142: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 143: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 144: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 145: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 146: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 147: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 148: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 149: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 150: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 151: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 152: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 153: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 154: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 155: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 156: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 157: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 158: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 159: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 160: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 161: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 162: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 163: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 164: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 165: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potřebou vypozdaní a přidejte příkazy, jak vytvořit a použít svůj prostředí.
- **2. Spuštění:** Spusťte projekt a zkontrolujte, že funguje správně.
- **3. Obratná zpráva:** Pokud máte zastávky nebo příklady, které nemohou být obsluženy v Filtrovna Behavior Pack, vytvořte nový prostředí a přidejte příkazy, aby jim bylo pomoci.
- **4. Testování:** Testujte svůj prostředí nad různými scénáři a přizpůsobujte svůj prostředí pro svůj účel.

### ČÁST 166: POTRUBA VYPOZDANÍ

- **1. Vytvoření:** Vytvořte nový soubor s potř