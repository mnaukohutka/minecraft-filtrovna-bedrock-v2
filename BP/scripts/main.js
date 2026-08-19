// =============================================================================
// FILTROVNA - Inteligentní třídící systém pro Minecraft Bedrock Edition
// Verze: 1.0.0
// Kompatibilita: Bedrock 1.21.30+ / Script API v1.14.0+
// Autor: mnaukohutka
// =============================================================================

import { world, system, ItemStack, BlockPermutation } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// =============================================================================
// KONSTANTY
// =============================================================================

// Slotové rozložení inventáře (37 slotů celkem)
const SLOTS = {
  VSTUP: { start: 0, end: 8, size: 9 },      // Levá strana - vstupní položky
  FILTR: { start: 9, end: 18, size: 10 },    // Definice filtru - co se má třídit
  MATCH: { start: 19, end: 27, size: 9 },    // Spodní strana - shodné položky
  NE: { start: 28, end: 36, size: 9 }        // Pravá strana - odpad
};

// Stavy bloku a příslušné barvy světla
const STATES = {
  IDLE: { color: "#00FF00", light: 8, name: "idle" },
  PROCESSING: { color: "#FFFF00", light: 10, name: "processing" },
  MATCH: { color: "#0080FF", light: 12, name: "match" },
  NE: { color: "#FF8000", light: 12, name: "ne" },
  DROP: { color: "#FFFFFF", light: 15, name: "drop" },
  STUCK: { color: "#FF0000", light: 6, name: "stuck" }
};

// =============================================================================
// REGISTRACE DYNAMICKÝCH VLASTNOSTÍ
// =============================================================================

// Registrace dynamických vlastností pro bloky
world.afterEvents.worldInitialize.subscribe((event) => {
  const worldProperties = event.world.getDynamicProperties();
  
  // Registrace vlastností pro Filtr blok
  worldProperties.defineString("filtrovna:golem_id");
  worldProperties.defineString("filtrovna:state");
  worldProperties.defineNumber("filtrovna:last_tick");
  
  console.log("[Filtrovna] Dynamické vlastnosti zaregistrovány");
});

// =============================================================================
// VYTVOŘENÍ GOLEMA UVNITŘ BLOKU PŘI UMÍSTĚNÍ
// =============================================================================

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  if (event.block.typeId !== "filtrovna:filtr") return;

  const loc = event.block.location;
  const dimension = event.dimension;
  
  // Vytvoření golema uvnitř bloku
  const golem = dimension.spawnEntity("filtrovna:golem_inside", {
    x: loc.x + 0.5,
    y: loc.y + 0.1,
    z: loc.z + 0.5
  });

  if (!golem) {
    console.error("[Filtrovna] Nepodařilo se vytvořit golema uvnitř bloku");
    return;
  }

  // Nastavení rotace golema podle orientace bloku
  const facing = event.block.permutation.getState("minecraft:cardinal_direction");
  let rotationY = 0;
  
  switch (facing) {
    case "west": rotationY = 90; break;
    case "north": rotationY = 180; break;
    case "east": rotationY = 270; break;
    default: rotationY = 0; // south
  }

  golem.setRotation(rotationY, 0);
  
  // Uložení ID golema do dynamických vlastností bloku
  event.block.setDynamicProperty("golem_id", golem.id);
  event.block.setDynamicProperty("filtrovna:state", STATES.IDLE.name);
  
  console.log(`[Filtrovna] Golem vytvořen na pozici (${loc.x}, ${loc.y}, ${loc.z}) s ID: ${golem.id}`);
});

// =============================================================================
// ZNIČENÍ BLOKU A VYHOZENÍ OBSAHU
// =============================================================================

world.afterEvents.playerBreakBlock.subscribe((event) => {
  if (event.brokenBlockPermutation.type.id !== "filtrovna:filtr") return;

  const block = event.brokenBlockPermutation;
  const golemId = block.getDynamicProperty("golem_id");
  
  if (!golemId) {
    console.warn("[Filtrovna] Blok nemá přiřazené ID golema");
    return;
  }

  const golem = world.getEntity(golemId);
  if (!golem) {
    console.warn(`[Filtrovna] Golem s ID ${golemId} nebyl nalezen`);
    return;
  }

  // Vyhození obsahu inventáře golema do světa
  const inv = golem.getComponent("minecraft:inventory")?.container;
  if (inv) {
    for (let i = 0; i < inv.size; i++) {
      const item = inv.getItem(i);
      if (item) {
        event.dimension.spawnItem(item, event.block.location);
      }
    }
  }

  // Odstranění golema
  golem.remove();
  
  console.log(`[Filtrovna] Blok zničen, obsah vyhozen, golem ${golemId} odstraněn`);
});

// =============================================================================
// UI INTERAKCE - OTEVŘENÍ INVENTÁŘE
// =============================================================================

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  if (event.block.typeId !== "filtrovna:filtr") return;

  const golemId = event.block.getDynamicProperty("golem_id");
  if (!golemId) {
    event.player.sendMessage("§cChyba: Golem nebyl nalezen!");
    return;
  }

  const golem = world.getEntity(golemId);
  if (!golem) {
    event.player.sendMessage("§cChyba: Golem neexistuje!");
    return;
  }

  openFilterUI(event.player, golem, event.block);
});

// =============================================================================
// UI FUNKCE
// =============================================================================

function openFilterUI(player, golem, block) {
  const form = new ActionFormData()
    .title("§6Filtr - Správa Golema")
    .body("§7Vyberte sekci inventáře pro správu:")
    .button("§aVSTUP (0-8)\n§7Vstupní položky")
    .button("§eFILTR PRAVIDLA (9-18)\n§7Definice třídění")
    .button("§9VÝSTUP - MATCH (19-27)\n§7Shodné položky")
    .button("§cODPAD - NE (28-36)\n§7Neshodné položky")
    .button("§4Zavřít");

  form.show(player).then((response) => {
    if (response.canceled || response.selection === 4) return;

    const section = Object.keys(SLOTS)[response.selection];
    openInventorySection(player, golem, block, section);
  });
}

function openInventorySection(player, golem, block, section) {
  const slots = SLOTS[section];
  const inv = golem.getComponent("minecraft:inventory")?.container;
  
  if (!inv) {
    player.sendMessage("§cChyba: Inventář není dostupný!");
    return;
  }

  // Získání obsahu vybrané sekce
  const items = [];
  for (let i = slots.start; i <= slots.end; i++) {
    const item = inv.getItem(i);
    items.push(item ? `${item.typeId} (${item.amount})` : "Prázdný");
  }

  const form = new ModalFormData()
    .title(`§6Filtr - ${section.toUpperCase()}`)
    .dropdown("Vyberte slot", Array.from({ length: slots.size }, (_, i) => `Slot ${i + slots.start}`),
      0)
    .textField("Položka (ID)", "Příklad: minecraft:stone")
    .slider("Množství", 1, 64, 1, 1)
    .toggle("Vyprázdnit slot", false);

  form.show(player).then((response) => {
    if (response.canceled) return;

    const slotIndex = slots.start + response.formValues[0];
    const itemId = response.formValues[1];
    const amount = response.formValues[2];
    const clearSlot = response.formValues[3];

    if (clearSlot) {
      inv.setItem(slotIndex, undefined);
      player.sendMessage(`§aSlot ${slotIndex} vyprázdněn`);
    } else if (itemId) {
      const itemStack = new ItemStack(itemId, amount);
      inv.setItem(slotIndex, itemStack);
      player.sendMessage(`§aDo slotu ${slotIndex} vloženo: ${itemId} (${amount})`);
    }
  });
}

// =============================================================================
// SCRIPT EVENT PRO NASTAVENÍ OBSAHU
// =============================================================================

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id !== "filtrovna:set") return;

  const args = event.message.split(" ");
  if (args.length < 3) {
    console.error("[Filtrovna] Neplatný příkaz: " + event.message);
    return;
  }

  const start = parseInt(args[0]);
  const end = parseInt(args[1]);
  const itemId = args[2];
  const amount = parseInt(args[3] || "1");

  if (isNaN(start) || isNaN(end) || isNaN(amount)) {
    console.error("[Filtrovna] Neplatné číselné hodnoty");
    return;
  }

  if (event.sourceBlock) {
    const golemId = event.sourceBlock.getDynamicProperty("golem_id");
    if (golemId) {
      const golem = world.getEntity(golemId);
      const inv = golem?.getComponent("minecraft:inventory")?.container;
      
      if (inv) {
        for (let i = start; i <= end; i++) {
          inv.setItem(i, new ItemStack(itemId, amount));
        }
        console.log(`[Filtrovna] Nastaveno ${end - start + 1} slotů na ${itemId} (${amount})`);
      }
    }
  }
});

// =============================================================================
// HLAVNÍ TICK LOGIKA - TŘÍDĚNÍ POLOŽEK
// =============================================================================

system.runInterval(() => {
  // Hledáme všechny golemy uvnitř bloků a zpracováváme jejich bloky
  const dimensions = ["overworld", "nether", "the_end"];
  
  for (const dimName of dimensions) {
    const dimension = world.getDimension(dimName);
    
    // Najít všechny golemy uvnitř bloků
    const golems = dimension.getEntities({ type: "filtrovna:golem_inside" });
    
    for (const golem of golems) {
      const golemId = golem.id;
      const golemLoc = golem.location;
      
      // Získat blok na pozici golema
      const blockX = Math.floor(golemLoc.x);
      const blockY = Math.floor(golemLoc.y);
      const blockZ = Math.floor(golemLoc.z);
      
      const blocks = dimension.getBlocks({
        x: blockX, y: blockY, z: blockZ
      });
      
      for (const block of blocks) {
        if (block.typeId === "filtrovna:filtr") {
          const blockGolemId = block.getDynamicProperty("golem_id");
          if (blockGolemId === golemId) {
            processFilterBlock(block, dimension);
            break;
          }
        }
      }
    }
  }
}, 2); // Každé 2 ticky (0.1 vteřiny)

function processFilterBlock(block, dimension) {
  const golemId = block.getDynamicProperty("golem_id");
  if (!golemId) return;

  const golem = world.getEntity(golemId);
  if (!golem) return;

  const inv = golem.getComponent("minecraft:inventory")?.container;
  if (!inv) return;

  // Získání orientace bloku
  const facing = block.permutation.getState("minecraft:cardinal_direction");
  
  // Hledání první neprázdné položky ve VSTUPU
  let firstItemSlot = -1;
  let firstItem = null;
  
  for (let i = SLOTS.VSTUP.start; i <= SLOTS.VSTUP.end; i++) {
    const item = inv.getItem(i);
    if (item) {
      firstItemSlot = i;
      firstItem = item;
      break;
    }
  }

  // Pokud není žádná položka ve VSTUPU, nic nedělat
  if (!firstItem) {
    block.setDynamicProperty("filtrovna:state", STATES.IDLE.name);
    return;
  }

  // Nastavení stavu na PROCESSING
  block.setDynamicProperty("filtrovna:state", STATES.PROCESSING.name);

  // Kontrola, zda se položka shoduje s některým z FILTR slotů
  let matchesFilter = false;
  
  for (let i = SLOTS.FILTR.start; i <= SLOTS.FILTR.end; i++) {
    const filterItem = inv.getItem(i);
    if (filterItem && filterItem.typeId === firstItem.typeId) {
      matchesFilter = true;
      break;
    }
  }

  // Pokud FILTR je prázdný, vše jde do MATCH
  let hasFilterItems = false;
  for (let i = SLOTS.FILTR.start; i <= SLOTS.FILTR.end; i++) {
    if (inv.getItem(i)) {
      hasFilterItems = true;
      break;
    }
  }

  if (!hasFilterItems) {
    matchesFilter = true;
  }

  // Zpracování podle shody
  if (matchesFilter) {
    // Hledání prvního volného slotu v MATCH
    let targetSlot = -1;
    for (let i = SLOTS.MATCH.start; i <= SLOTS.MATCH.end; i++) {
      if (!inv.getItem(i)) {
        targetSlot = i;
        break;
      }
    }

    if (targetSlot !== -1) {
      // Přesun položky do MATCH
      inv.setItem(targetSlot, firstItem);
      inv.setItem(firstItemSlot, undefined);
      block.setDynamicProperty("filtrovna:state", STATES.MATCH.name);
      return;
    }
  } else {
    // Hledání prvního volného slotu v NE
    let targetSlot = -1;
    for (let i = SLOTS.NE.start; i <= SLOTS.NE.end; i++) {
      if (!inv.getItem(i)) {
        targetSlot = i;
        break;
      }
    }

    if (targetSlot !== -1) {
      // Přesun položky do NE
      inv.setItem(targetSlot, firstItem);
      inv.setItem(firstItemSlot, undefined);
      block.setDynamicProperty("filtrovna:state", STATES.NE.name);
      return;
    }
  }

  // Pokud jsou všechny cílové sloty plné, vyhodit položku
  const loc = block.location;
  dimension.spawnItem(firstItem, {
    x: loc.x + 0.5,
    y: loc.y + 1.0,
    z: loc.z + 0.5
  });
  inv.setItem(firstItemSlot, undefined);
  block.setDynamicProperty("filtrovna:state", STATES.DROP.name);
}

// =============================================================================
// MINI COPPER GOLEM AI - SBĚR A DORUČENÍ POLOŽEK
// =============================================================================

system.runInterval(() => {
  const dimensions = ["overworld", "nether", "the_end"];
  
  for (const dimName of dimensions) {
    const dimension = world.getDimension(dimName);
    const miniGolems = dimension.getEntities({ type: "filtrovna:mini_copper_golem" });

    for (const golem of miniGolems) {
      processMiniGolem(golem, dimension);
    }
  }
}, 20); // Každých 20 ticků (1 vteřina)

function processMiniGolem(golem, dimension) {
  const inv = golem.getComponent("minecraft:inventory")?.container;
  if (!inv) return;

  // Pokud je inventář plný, hledat nejbližší Filtr blok a doručit
  if (inv.emptySlotsCount === 0) {
    const filterGolems = dimension.getEntities({ type: "filtrovna:golem_inside" });
    
    if (filterGolems.length > 0) {
      // Najít nejbližší golem uvnitř bloku
      let nearestGolem = null;
      let minDistance = Infinity;

      for (const filterGolem of filterGolems) {
        const dist = Math.sqrt(
          Math.pow(filterGolem.location.x - golem.location.x, 2) +
          Math.pow(filterGolem.location.y - golem.location.y, 2) +
          Math.pow(filterGolem.location.z - golem.location.z, 2)
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestGolem = filterGolem;
        }
      }

      if (nearestGolem) {
        // Vložit všechny položky z inventáře Mini Golema do VSTUP slotů
        for (let i = 0; i < inv.size; i++) {
          const item = inv.getItem(i);
          if (item) {
            // Najít blok, který má tento golem přiřazený
            const blockX = Math.floor(nearestGolem.location.x);
            const blockY = Math.floor(nearestGolem.location.y);
            const blockZ = Math.floor(nearestGolem.location.z);
            
            const blocks = dimension.getBlocks({
              x: blockX, y: blockY, z: blockZ
            });
            
            for (const block of blocks) {
              if (block.typeId === "filtrovna:filtr") {
                const targetGolemId = block.getDynamicProperty("golem_id");
                if (targetGolemId === nearestGolem.id) {
                  const targetGolem = world.getEntity(targetGolemId);
                  if (targetGolem) {
                    const targetInv = targetGolem.getComponent("minecraft:inventory")?.container;
                    if (targetInv) {
                      // Hledat první volný slot ve VSTUPU
                      for (let j = SLOTS.VSTUP.start; j <= SLOTS.VSTUP.end; j++) {
                        if (!targetInv.getItem(j)) {
                          targetInv.setItem(j, item);
                          inv.setItem(i, undefined);
                          break;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return;
  }

  // Pokud je inventář prázdný, hledat položky na zemi
  if (inv.emptySlotsCount === inv.size) {
    const items = dimension.getEntities({
      type: "minecraft:item",
      location: golem.location,
      maxDistance: 8
    });

    if (items.length > 0) {
      const itemEntity = items[0];
      const itemStack = itemEntity.getComponent("minecraft:item")?.itemStack;
      
      if (itemStack) {
        const countToTake = Math.min(itemStack.amount, 10);
        const takenStack = itemStack.clone();
        takenStack.amount = countToTake;

        // Vložit do inventáře
        inv.addItem(takenStack);

        // Aktualizovat položku na zemi
        if (itemStack.amount <= countToTake) {
          itemEntity.remove();
        } else {
          itemStack.amount -= countToTake;
        }
      }
    }
  }
}

// =============================================================================
// OXIDACE MINI COPPER GOLEMŮ
// =============================================================================

system.runInterval(() => {
  const dimensions = ["overworld", "nether", "the_end"];
  const random = Math.random();
  
  // 10% šance na oxidaci každou minutu
  if (random > 0.1) return;

  for (const dimName of dimensions) {
    const dimension = world.getDimension(dimName);
    const miniGolems = dimension.getEntities({ type: "filtrovna:mini_copper_golem" });

    for (const golem of miniGolems) {
      // Zkontrolovat, zda není navoskován
      const componentGroups = golem.getComponentGroups();
      if (componentGroups.includes("filtrovna:waxed")) continue;

      // Získat aktuální stav oxidace
      let currentState = null;
      if (componentGroups.includes("filtrovna:oxidized")) {
        currentState = "oxidized";
      } else if (componentGroups.includes("filtrovna:weathered")) {
        currentState = "weathered";
      } else if (componentGroups.includes("filtrovna:exposed")) {
        currentState = "exposed";
      } else if (componentGroups.includes("filtrovna:copper")) {
        currentState = "copper";
      }

      // Pokud není v základním stavu, pokročit v oxidaci
      if (currentState === "copper") {
        golem.triggerEvent("filtrovna:oxidize");
      } else if (currentState === "exposed") {
        golem.triggerEvent("filtrovna:oxidize");
      } else if (currentState === "weathered") {
        golem.triggerEvent("filtrovna:oxidize");
      }
    }
  }
}, 1200); // Každou minutu (1200 ticků)

// =============================================================================
// POMOCNÉ FUNKCE
// =============================================================================

// Funkce pro získání stavu bloku
function getBlockState(block) {
  const state = block.getDynamicProperty("filtrovna:state");
  return STATES[state?.toUpperCase()] || STATES.IDLE;
}

// =============================================================================
// LOGOVÁNÍ
// =============================================================================

console.log("[Filtrovna] §aAddon úspěšně načten!");
console.log("[Filtrovna] §7Verze: 1.0.0 | Kompatibilita: Bedrock 1.21.30+");
console.log("[Filtrovna] §7Script API: v1.14.0+");
