# Filtrovna — Inteligentní třídící systém pro Minecraft Bedrock

## 📋 Přehled

**Filtrovna** je addon pro Minecraft Bedrock Edition, který přidává inteligentní třídící blok s vnitřním měděným golemem a volně pobíhající Mini Copper Golemy. Addon cílí na **Minecraft Bedrock 1.26.60** a využívá Script API `@minecraft/server` 2.11.0 a `@minecraft/server-ui` 2.3.0.

## ✨ Funkce

### 🗃️ Filtr blok (`filtrovna:filtr`)

- **37-slotový inventář** nesený entitou `filtrovna:golem_inside`.
- **4 sekce**:
  - **VSTUP (0–8)** — 9 vstupních slotů.
  - **FILTR (9–18)** — 10 slotů s pravidly. Pokud je FILTR prázdný, projde vše do MATCH.
  - **MATCH (19–27)** — 9 slotů pro shodné předměty (výstup dolů).
  - **NE (28–36)** — 9 slotů pro neshodné předměty (výstup vpravo).
- **Směrové umístění**: blok se otáčí podle hráče. VSTUP je vždy levá strana, MATCH dolů a NE pravá strana.
- **Plné sekce**: pokud je MATCH nebo NE plná, předmět se vyhodí do prostoru (MATCH dolů, NE vpravo). Pokud je výstup blokovaný, blok přejde do stavu `stuck` a čeká, dokud se cesta neuvolní.
- **Stavové LED** na přední straně:

| Stav | Barva | Světlo |
|---|---|---|
| Čeká (Idle) | 🟢 zelená | 8 |
| Kontroluje (Processing) | 🟡 žlutá | 10 |
| Třídí MATCH | 🔵 modrá | 12 |
| Třídí NE | 🟠 oranžová | 12 |
| Drop aktivní | ⚪ bílá | 15 |
| Zaseknutý (Stuck) | 🔴 červená, bliká | 6 |

- **Vzhled**: měděné pouzdro, průhledné přední sklo, spodní zelená žárovka, horní a zadní mřížka, levá strana se žlutým plus a pravá s červeným mínus.
- **Vnitřní golem** je vidět přes sklo, má svítící oči a animace podle stavu (idle, inspect, process, stuck).

### 🤖 Mini Copper Golem (`filtrovna:mini_copper_golem`)

- Stejný model, textury a zvuky jako vanilkový copper golem, zmenšený na 55 %.
- **Dávkový sběr**: maximálně 10 kusů předmětů najednou.
- **Zdroje**:
  - předměty volně ležící na zemi,
  - měděné truhlice (všechny oxidované i navoskované varianty),
  - ender truhlice svého majitele (majitel musí být online do 16 bloků).
- **Doručení**: předměty odnese k nejbližšímu Filtr bloku a vloží je do VSTUPU (0–8).
- **Voskování**: pravý klik s pláství (`minecraft:honeycomb`) nastaví majitele a zastaví oxidaci.
- **Čištění**: pravý klik se sekyrou odstraní vosk, případně sníží oxidaci o jeden stupeň.
- **Oxidace**: Copper → Exposed → Weathered → Oxidized; každý stupeň snižuje rychlost o 15 %.

## 📦 Instalace

### Doporučená metoda — `.mcaddon`

1. Stáhněte `Filtrovna.mcaddon`.
2. Otevřete soubor v Minecraftu (na mobilu podržte a zvolte „Otevřít v Minecraftu“).
3. Minecraft naimportuje Behavior Pack i Resource Pack.
4. V nastavení světa aktivujte oba packy.

### Ruční instalace

1. Zkopírujte `BP/` do `development_behavior_packs/FiltrovnaBP/`.
2. Zkopírujte `RP/` do `development_resource_packs/FiltrovnaRP/`.
3. Aktivujte oba packy ve světě.

> Addon je stavěný na stabilní Script API 2.11.0 a nevyžaduje experimentální custom komponenty bloků. Pro jistotu mějte zapnuté **Beta APIs** pouze pokud používáte starší build hry.

## 🎮 Použití

### Crafting recept

```
MCM
SGS
MBM
```

- **M** — Waxed Copper Block (4×)
- **C** — Waxed Copper Grate (1×)
- **S** — Glass (2×)
- **G** — Copper Ingot (1×)
- **B** — Waxed Copper Bulb (1×)

### Ovládání bloku

- **Pravý klik na blok** otevře vlastní okno `CustomForm` se čtyřmi sekcemi a 36 sloty. Kliknutím na slot otevřeš editor (vzít předmět, vložit držený, vyprázdnit).
- **Sneak + pravý klik s předmětem v ruce** vloží předmět přímo do VSTUPU.
- **Přilehlá dvojitá truhla (54 slotů)** je volitelné skutečné truhlové UI; okno s ní pracuje:
  - 1. řada (sloty 0–8) = VSTUP
  - 2. řada (sloty 9–17) = FILTR
  - 3. řada (sloty 18–26) = MATCH
  - 4. řada (sloty 27–35) = NE
  - 5.–6. řada = volné úložiště
- Bez přilehlé dvojité truhly okno pracuje s interním 37-slotovým inventářem golema; ten lze ovládat i příkazy `/scriptevent`.

### Příkazy `/scriptevent`

```
/scriptevent filtrovna:set <slot_start> <slot_end> <item_id> [amount]
/scriptevent filtrovna:clear <slot_start> <slot_end>
```

Příklady:

```
/scriptevent filtrovna:set 0 8 minecraft:stone 64
/scriptevent filtrovna:set 9 18 minecraft:diamond 1
/scriptevent filtrovna:clear 28 36
```

Příkaz najde blok, na který se díváte (do 8 bloků), nebo nejbližší Filtr do 16 bloků. Volitelně lze zadat souřadnice:

```
/scriptevent filtrovna:set 100 64 200 9 18 minecraft:diamond 1
```

## 📁 Struktura projektu

```
Filtrovna/
├── BP/
│   ├── manifest.json
│   ├── blocks/filtr.json
│   ├── entities/golem_inside.json
│   ├── entities/mini_copper_golem.json
│   ├── recipes/filtr.json
│   └── scripts/main.js
└── RP/
    ├── manifest.json
    ├── animations/golem_inside.animation.json
    ├── animations/mini_copper_golem.animation.json
    ├── entity/golem_inside.entity.json
    ├── entity/mini_copper_golem.entity.json
    ├── models/blocks/filtr.geo.json
    ├── render_controllers/copper_golem.render.json
    ├── texts/cs_CZ.lang
    ├── texts/en_US.lang
    └── textures/
        ├── blocks/…
        ├── items/filtr_item.png
        ├── item_texture.json
        └── terrain_texture.json
```

## 🔧 Technické údaje

- **Minecraft Bedrock**: 1.26.60 (testováno proti schématům 1.26.60)
- **Script API**: `@minecraft/server` 2.11.0, `@minecraft/server-ui` 2.3.0
- **Formát bloku**: `1.26.50`
- **ID bloku**: `filtrovna:filtr`
- **ID entit**: `filtrovna:golem_inside`, `filtrovna:mini_copper_golem`
- **Uložení stavu**: dynamické vlastnosti bloku (`filtrovna:golem_id`, `filtrovna:stuck_ticks`) a entity (`filtrovna:owner`, `filtrovna:carrying`, `filtrovna:next_oxidation`)

## ⚠️ Poznámky

- MATCH a NE jsou interní sekce inventáře vnitřního golema. Když je některá z nich plná, předmět se vyhodí do prostoru; addon sám neobsahuje hopperovou automatizaci pro plynulé vytahování z bloku.
- Ender truhlice jsou dostupné pouze tehdy, je-li majitel golema online a do 16 bloků od truhlice; Bedrock Script API neumožňuje bezpečně číst ender inventář konkrétního hráče.
- Při zničení bloku se obsah vnitřního golema vysype do prostoru.

## 📜 Licence

Projekt je volně šiřitelný pro osobní použití. Komerční použití vyžaduje souhlas autora.

---

**Verze**: 1.1.0  
**Autor**: mnaukohutka  
**Datum**: 2026
