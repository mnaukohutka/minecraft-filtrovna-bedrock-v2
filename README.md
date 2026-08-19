# Filtrovna - Inteligentní třídící systém pro Minecraft Bedrock

## 📋 Přehled

**Filtrovna** je pokročilý addon pro Minecraft Bedrock Edition, který přidává inteligentní třídící systém s měděnými golemy. Tento addon umožňuje automatické třídění položek podle definovaných pravidel a zahrnuje volně pobíhající Mini Copper Golemy pro sběr a doručování položek.

## ✨ Funkce

### 🗃️ Filtr Blok
- **37-slotový inventář** nesený vnitřním golemem
- **4 sekce**:
  - **VSTUP (0-8)**: Vstupní položky
  - **FILTR (9-18)**: Definice třídících pravidel
  - **MATCH (19-27)**: Shodné položky (výstup dolů)
  - **NE (28-36)**: Neshodné položky (výstup vpravo)
- **Vizuální indikátory stavu** pomocí barevných světel:
  - 🟢 Zelená (Idle)
  - 🟡 Žlutá (Processing)
  - 🔵 Modrá (Match nalezen)
  - 🟠 Oranžová (No Match)
  - ⚪ Bílá (Drop aktivní)
  - 🔴 Červená (Zaseknutý)

### 🤖 Mini Copper Golem
- **Volně pobíhající entita** pro logistiku
- **Sběr položek**: Bere až 10 ks položek najednou
- **Zdroje sběru**:
  - Volně ležící položky na zemi
  - Měděné truhlice
  - Ender truhlice majitele
- **Doručení**: Všechny nasbírané položky odnese do nejbližšího Filtr bloku
- **Vlastnictví**: Majitelem je hráč, který golema navoskoval pláství
- **Oxidace**: 4 fáze oxidace (Copper → Exposed → Weathered → Oxidized)
  - S každým stupněm oxidace se rychlost pohybu snižuje o 15%
  - Použitím sekyry lze očistit
  - Použitím plástve navoskovat a fixovat stav

## 📦 Instalace

### Metoda 1: Použití .mcaddon souboru (doporučeno)
1. Stáhněte soubor `Filtrovna.mcaddon`
2. Poklepejte na soubor (na mobilu: podržte a vyberte "Otevřít v Minecraftu")
3. Minecraft automaticky naimportuje oba packy (Behavior Pack + Resource Pack)
4. Ve hře aktivujte oba packy v nastavení světa

### Metoda 2: Ruční instalace
1. **Behavior Pack**: Zkopírujte složku `BP` do `development_behavior_packs/`
2. **Resource Pack**: Zkopírujte složku `RP` do `development_resource_packs/`
3. Ve hře aktivujte oba packy

## 🎮 Použití

### Crafting Recept
```
MCM
SGS
MBM
```
- **M**: Waxed Copper Block
- **C**: Waxed Copper Grate
- **S**: Glass
- **G**: Copper Ingot
- **B**: Waxed Copper Bulb

### Příkazy
- **Nastavení obsahu přes script event**:
  ```
  /scriptevent filtrovna:set <slot_start> <slot_end> <item_id> [amount]
  ```
  Příklad:
  ```
  /scriptevent filtrovna:set 0 8 minecraft:stone 64
  /scriptevent filtrovna:set 9 18 minecraft:diamond 1
  ```

### UI Interakce
1. Pravým klikem na Filtr blok otevřete UI
2. Vyberte sekci inventáře (VSTUP, FILTR, MATCH, NE)
3. Spravujte jednotlivé sloty

## 📁 Struktura Projektu

```
Filtrovna/
├── BP/                          # Behavior Pack
│   ├── manifest.json
│   ├── blocks/
│   │   └── filtr.json
│   ├── entities/
│   │   ├── golem_inside.json
│   │   └── mini_copper_golem.json
│   ├── recipes/
│   │   └── filtr.json
│   └── scripts/
│       └── main.js
│
└── RP/                          # Resource Pack
    ├── manifest.json
    ├── texts/
    │   ├── cs_CZ.lang
    │   └── en_US.lang
    ├── textures/
    │   ├── blocks/
    │   │   ├── filtr_front_glass.png
    │   │   ├── filtr_front_bulb_green.png
    │   │   ├── filtr_front_bulb_blue.png
    │   │   ├── filtr_front_bulb_yellow.png
    │   │   ├── filtr_front_bulb_orange.png
    │   │   ├── filtr_front_bulb_red.png
    │   │   ├── filtr_front_bulb_white.png
    │   │   ├── filtr_bottom_bulb.png
    │   │   ├── filtr_side_plus.png
    │   │   ├── filtr_side_minus.png
    │   │   ├── filtr_top_grate.png
    │   │   ├── filtr_back_grate.png
    │   │   ├── copper_bulb.png
    │   │   └── filtr_item.png
    │   ├── items/
    │   │   └── filtr_item.png
    │   └── entities/
    ├── models/
    │   ├── blocks/
    │   │   └── filtr.geo.json
    │   └── entities/
    │       ├── golem_inside.geo.json
    │       └── mini_copper_golem.geo.json
    ├── render_controllers/
    │   ├── golem_inside.render.json
    │   └── mini_copper_golem.render.json
    ├── animation_controllers/
    │   └── golem_inside.animation_controller.json
    └── animations/
        └── golem_inside.animation.json
```

## 🔧 Technické Specifikace

- **Verze Minecraftu**: Bedrock 1.21.30+
- **Script API**: v1.14.0+
- **Cílové platformy**: iOS, Android, Windows, Xbox, PlayStation, Switch
- **ID Bloku**: `filtrovna:filtr`
- **ID Entit**:
  - `filtrovna:golem_inside` (interní golem)
  - `filtrovna:mini_copper_golem` (volně pobíhající golem)

## 📝 Změny oproti původní specifikaci

1. **Opravená struktura JSON souborů** - Všechny JSON soubory byly validovány a opraveny
2. **Kompletní implementace skriptu** - Hlavní skript obsahuje veškerou logiku podle specifikace
3. **Vylepšené UI** - Interaktivní formuláře pro správu inventáře
4. **Přidány animace** - Golem uvnitř bloku má animace pro různé stavy
5. **Oxidace Mini Golema** - Implementována 4-fázová oxidace s zpomalením pohybu
6. **Lokalizace** - Kompletní česká a anglická lokalizace

## 🎯 Budoucí vylepšení

- [ ] Přidání zvukových efektů
- [ ] Vylepšené 3D modely pomocí Blockbench
- [ ] Přidání částicových efektů
- [ ] Implementace uložení stavu po restartu světa
- [ ] Přidání dalších typů filtrů

## 📜 Licence

Tento projekt je volně šiřitelný pro osobní použití. Komerční použití vyžaduje souhlas autora.

## 🙏 Poděkování

- Mojang Studios za Minecraft
- Microsoft za Script API
- Komunita Minecraft Bedrock modderů za inspiraci

---

**Verze**: 1.0.0  
**Autor**: mnaukohutka  
**Datum**: 2025
