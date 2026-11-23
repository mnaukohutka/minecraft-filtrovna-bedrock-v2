import {
  world,
  system,
  ItemStack,
  ItemTypes,
  EquipmentSlot,
} from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

const CustomForm = ui.CustomForm;

const FILTER_ID = "filtrovna:filtr";
const INSIDE_ID = "filtrovna:golem_inside";
const MINI_ID = "filtrovna:mini_copper_golem";
const DIMENSIONS = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];

const VSTUP = { start: 0, end: 8, size: 9 };
const FILTR = { start: 9, end: 18, size: 10 };
const MATCH = { start: 19, end: 27, size: 9 };
const NE = { start: 28, end: 36, size: 9 };
const SECTIONS = { vstup: VSTUP, filtr: FILTR, match: MATCH, ne: NE };
const CHEST_LAYOUT = {
  vstup: { start: 0, end: 8, size: 9 },
  filtr: { start: 9, end: 17, size: 9 },
  match: { start: 18, end: 26, size: 9 },
  ne: { start: 27, end: 35, size: 9 },
};
const SMALL_CHEST_LAYOUT = {
  vstup: { start: 0, end: 8, size: 9 },
  filtr: { start: 9, end: 17, size: 9 },
  match: { start: 18, end: 22, size: 5 },
  ne: { start: 23, end: 26, size: 4 },
};

const OXIDATION = ["unoxidized", "exposed", "weathered", "oxidized"];
const OXIDATION_FACTOR = {
  unoxidized: 1,
  exposed: 0.85,
  weathered: 0.7225,
  oxidized: 0.614125,
};
const BASE_SPEED = 0.3;
const MAX_CARRY = 10;
const OXIDATION_INTERVAL_MS = 300000;
const OXIDATION_CHANCE = 0.25;

const spawnCooldown = new Map();
const filterKeys = new Set();
const FILTER_KEYS_PROPERTY = "filtrovna:filter_keys";

function filterKey(block) {
  return `${block.dimension.id}|${block.x},${block.y},${block.z}`;
}

function parseFilterKey(key) {
  if (typeof key !== "string") return undefined;
  const [dimensionId, coords] = key.split("|");
  const [x, y, z] = (coords ?? "").split(",").map(Number);
  if (!dimensionId || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    return undefined;
  }
  return { dimensionId, x, y, z };
}

function getFilterBlock(parsed) {
  try {
    const dimension = world.getDimension(parsed.dimensionId);
    const block = dimension.getBlock({ x: parsed.x, y: parsed.y, z: parsed.z });
    return { dimension, block };
  } catch {
    return undefined;
  }
}

function loadFilterKeys() {
  filterKeys.clear();
  let raw;
  try {
    raw = world.getDynamicProperty(FILTER_KEYS_PROPERTY);
  } catch {
    return;
  }
  if (typeof raw !== "string") return;
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return;
    for (const key of list) {
      if (typeof key === "string") filterKeys.add(key);
    }
  } catch {}
}

function saveFilterKeys() {
  try {
    world.setDynamicProperty(FILTER_KEYS_PROPERTY, JSON.stringify([...filterKeys]));
  } catch {}
}

function logErr(where, err) {
  try {
    console.warn(`[Filtrovna] ${where}: ${err?.message ?? err}`);
  } catch {}
}

function safeGetEntities(dimension, options) {
  try {
    return dimension.getEntities(options);
  } catch {
    return [];
  }
}

function safeRemove(entity) {
  try {
    entity.remove();
  } catch {}
}

function getBlockDynamic(block, key) {
  try {
    return block.getComponent("minecraft:dynamic_properties")?.get(key);
  } catch {
    return undefined;
  }
}

function setBlockDynamic(block, key, value) {
  try {
    block.getComponent("minecraft:dynamic_properties")?.set(key, value);
  } catch {}
}

function getContainer(entity) {
  if (!entity || !entity.isValid) return undefined;
  try {
    return entity.getComponent("minecraft:inventory")?.container;
  } catch {
    return undefined;
  }
}

function countItems(container) {
  let total = 0;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item) total += item.amount;
  }
  return total;
}

function countItemsIn(container, section) {
  let total = 0;
  for (let i = section.start; i <= section.end; i++) {
    const item = container.getItem(i);
    if (item) total += item.amount;
  }
  return total;
}


function firstNonEmpty(container, start, end) {
  for (let i = start; i <= end; i++) {
    if (container.getItem(i)) return i;
  }
  return -1;
}

function makeStack(itemType, amount) {
  const stack = new ItemStack(itemType, 1);
  const maximum = Math.max(1, stack.maxAmount || 64);
  stack.amount = Math.max(1, Math.min(amount, maximum));
  return stack;
}

function insertIntoSection(container, start, end, stack) {
  if (!stack || stack.amount <= 0) return 0;
  let remaining = stack.amount;
  const max = stack.maxAmount ?? 64;

  for (let i = start; i <= end && remaining > 0; i++) {
    const existing = container.getItem(i);
    if (!existing || existing.typeId !== stack.typeId) continue;
    const room = max - existing.amount;
    if (room <= 0) continue;
    const move = Math.min(room, remaining);
    existing.amount += move;
    container.setItem(i, existing);
    remaining -= move;
  }

  for (let i = start; i <= end && remaining > 0; i++) {
    if (container.getItem(i)) continue;
    const copy = stack.clone();
    copy.amount = remaining;
    container.setItem(i, copy);
    remaining = 0;
  }

  return stack.amount - remaining;
}

function ejectContainer(container, dimension, location) {
  for (let i = 0; i < container.size; i++) {
    let item;
    try {
      item = container.getItem(i);
    } catch {
      continue;
    }
    if (!item) continue;
    try {
      dimension.spawnItem(item, location);
      container.setItem(i, undefined);
    } catch (err) {
      logErr("eject", err);
    }
  }
}

function distanceSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function cardinalDirection(block) {
  try {
    return block.permutation.getState("minecraft:cardinal_direction") ?? "south";
  } catch {
    return "south";
  }
}

function yawFor(block) {
  switch (cardinalDirection(block)) {
    case "north":
      return 180;
    case "east":
      return 270;
    case "west":
      return 90;
    default:
      return 0;
  }
}

function vstupOffset(block) {
  switch (cardinalDirection(block)) {
    case "north":
      return { x: -1, y: 0, z: 0 };
    case "south":
      return { x: 1, y: 0, z: 0 };
    case "east":
      return { x: 0, y: 0, z: -1 };
    case "west":
      return { x: 0, y: 0, z: 1 };
    default:
      return { x: 1, y: 0, z: 0 };
  }
}

function setBlockStatus(block, status) {
  try {
    const permutation = block.permutation;
    if (permutation.getState("filtrovna:status") !== status) {
      block.setPermutation(permutation.withState("filtrovna:status", status));
    }
  } catch {}
}

function setBlink(block, enabled) {
  try {
    const permutation = block.permutation;
    const value = enabled ? "on" : "off";
    if (permutation.getState("filtrovna:blink") !== value) {
      block.setPermutation(permutation.withState("filtrovna:blink", value));
    }
  } catch {}
}

function setGolemStatus(golem, status) {
  try {
    if (golem.getProperty("filtrovna:status") !== status) {
      golem.setProperty("filtrovna:status", status);
    }
  } catch {}
}

function setStatus(block, golem, status) {
  setBlockStatus(block, status);
  if (golem) setGolemStatus(golem, status);
  if (status !== "stuck") setBlink(block, false);
}

function getGolem(block) {
  let id;
  try {
    id = getBlockDynamic(block, "filtrovna:golem_id");
  } catch {
    return undefined;
  }
  if (typeof id !== "string") return undefined;
  let entity;
  try {
    entity = world.getEntity(id);
  } catch {
    return undefined;
  }
  if (!entity || !entity.isValid || entity.typeId !== INSIDE_ID) return undefined;
  try {
    if (entity.dimension.id !== block.dimension.id) return undefined;
  } catch {
    return undefined;
  }
  return entity;
}

function keepGolemInPlace(golem, block) {
  const target = { x: block.x + 0.5, y: block.y + 0.07, z: block.z + 0.5 };
  try {
    if (distanceSq(golem.location, target) > 0.04) {
      golem.teleport(target);
    }
    golem.setRotation({ x: 0, y: yawFor(block) });
  } catch {}
}

function ensureFilter(block, dimension, spawnIfMissing) {
  if (!block || block.typeId !== FILTER_ID) return undefined;

  const existing = getGolem(block);
  if (existing) {
    keepGolemInPlace(existing, block);
    return existing;
  }

  const center = { x: block.x + 0.5, y: block.y + 0.07, z: block.z + 0.5 };
  const nearby = safeGetEntities(dimension, {
    type: INSIDE_ID,
    location: center,
    maxDistance: 0.8,
  });
  if (nearby.length > 0) {
    const adopted = nearby[0];
    try {
      setBlockDynamic(block, "filtrovna:golem_id", adopted.id);
    } catch {}
    keepGolemInPlace(adopted, block);
    return adopted;
  }
  if (!spawnIfMissing) return undefined;

  const key = `${dimension.id}|${block.x},${block.y},${block.z}`;
  const now = system.currentTick;
  const blockedUntil = spawnCooldown.get(key) ?? 0;
  if (blockedUntil > now) return undefined;

  const position = { x: block.x + 0.5, y: block.y + 0.07, z: block.z + 0.5 };
  let golem;
  try {
    golem = dimension.spawnEntity(INSIDE_ID, position);
  } catch {
    try {
      golem = dimension.spawnEntity(INSIDE_ID, { x: position.x, y: block.y + 1.05, z: position.z });
      golem.teleport(position);
    } catch (err) {
      spawnCooldown.set(key, now + 100);
      logErr("spawnInside", err);
      return undefined;
    }
  }

  try {
    golem.setRotation({ x: 0, y: yawFor(block) });
    golem.setProperty("filtrovna:status", "idle");
    golem.setDynamicProperty("filtrovna:block", `${dimension.id}|${block.x},${block.y},${block.z}`);
    setBlockDynamic(block, "filtrovna:golem_id", golem.id);
  } catch (err) {
    logErr("initInside", err);
  }
  return golem;
}

function onFilterPlaced(block, dimension) {
  if (!block || block.typeId !== FILTER_ID) return;
  filterKeys.add(filterKey(block));
  saveFilterKeys();
  const golem = ensureFilter(block, dimension, true);
  if (golem) setStatus(block, golem, "idle");
  try {
    setBlockDynamic(block, "filtrovna:stuck_ticks", 0);
    setBlockDynamic(block, "filtrovna:drop_until", 0);
  } catch {}
}

function onFilterBroken(block, dimension) {
  filterKeys.delete(filterKey(block));
  saveFilterKeys();
  const center = { x: block.x + 0.5, y: block.y + 0.5, z: block.z + 0.5 };
  const golems = safeGetEntities(dimension, {
    type: INSIDE_ID,
    location: center,
    maxDistance: 0.8,
  });

  try {
    const id = getBlockDynamic(block, "filtrovna:golem_id");
    if (typeof id === "string") {
      const stored = world.getEntity(id);
      if (stored && stored.isValid && stored.dimension.id === dimension.id) golems.push(stored);
    }
  } catch {}

  const seen = new Set();
  let removed = false;
  for (const golem of golems) {
    if (seen.has(golem.id)) continue;
    seen.add(golem.id);
    const inventory = getContainer(golem);
    if (inventory) {
      ejectContainer(inventory, dimension, { x: center.x, y: block.y + 0.6, z: center.z });
    }
    safeRemove(golem);
    removed = true;
  }

  if (removed) {
    try {
      dimension.spawnEntity(MINI_ID, { x: center.x, y: block.y + 1.05, z: center.z });
    } catch {}
  }
}

const FILTER_CONTAINER_IDS = new Set(["minecraft:chest", "minecraft:trapped_chest", "minecraft:barrel"]);

function findAdjacentContainer(block) {
  let best;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        try {
          const other = block.dimension.getBlock({
            x: block.x + dx,
            y: block.y + dy,
            z: block.z + dz,
          });
          if (!other || !FILTER_CONTAINER_IDS.has(other.typeId)) continue;
          const container = other.getComponent("minecraft:inventory")?.container;
          if (!container) continue;
          const distance = dx * dx + dy * dy + dz * dz;
          if (!best || distance < best.distance) best = { container, distance };
        } catch {}
      }
    }
  }
  return best?.container;
}

function getFilterInventory(block, golem) {
  const chest = findAdjacentContainer(block);
  if (chest && chest.size >= 36) {
    return { container: chest, layout: CHEST_LAYOUT, external: true, kind: "double" };
  }
  if (chest && chest.size >= 27) {
    return { container: chest, layout: SMALL_CHEST_LAYOUT, external: true, kind: "single" };
  }
  const inventory = getContainer(golem);
  return inventory
    ? { container: inventory, layout: SECTIONS, external: false, kind: "internal" }
    : undefined;
}

function filterHas(container, layout, typeId) {
  for (let i = layout.filtr.start; i <= layout.filtr.end; i++) {
    const filter = container.getItem(i);
    if (filter && filter.typeId === typeId) return true;
  }
  return false;
}

function filterIsEmpty(container, layout) {
  for (let i = layout.filtr.start; i <= layout.filtr.end; i++) {
    if (container.getItem(i)) return false;
  }
  return true;
}

function outputDropLocation(block, matched) {
  if (matched) {
    return { x: block.x + 0.5, y: block.y - 0.3, z: block.z + 0.5 };
  }
  const offset = vstupOffset(block);
  return {
    x: block.x + 0.5 - offset.x,
    y: block.y + 0.5,
    z: block.z + 0.5 - offset.z,
  };
}

function isSpaceFree(dimension, location) {
  try {
    const block = dimension.getBlock({
      x: Math.floor(location.x),
      y: Math.floor(location.y),
      z: Math.floor(location.z),
    });
    if (!block) return true;
    return block.isAir || block.isLiquid;
  } catch {
    return true;
  }
}

function tickFilter(block, dimension) {
  if (!block || block.typeId !== FILTER_ID) return;

  const golem = ensureFilter(block, dimension, true);
  if (!golem) return;
  keepGolemInPlace(golem, block);

  const active = getFilterInventory(block, golem);
  if (!active) return;
  const inventory = active.container;
  const layout = active.layout;

  const inputSlot = firstNonEmpty(inventory, layout.vstup.start, layout.vstup.end);
  if (inputSlot < 0) {
    let dropUntil = 0;
    try {
      dropUntil = Number(getBlockDynamic(block, "filtrovna:drop_until") ?? 0) || 0;
    } catch {}
    setStatus(block, golem, dropUntil > Date.now() ? "drop" : "idle");
    try {
      setBlockDynamic(block, "filtrovna:stuck_ticks", 0);
    } catch {}
    return;
  }

  const item = inventory.getItem(inputSlot);
  if (!item) return;

  try {
    setBlockDynamic(block, "filtrovna:drop_until", 0);
  } catch {}
  setStatus(block, golem, "processing");

  const emptyFilter = filterIsEmpty(inventory, layout);
  const matched = emptyFilter || filterHas(inventory, layout, item.typeId);
  const target = matched ? layout.match : layout.ne;

  const moved = insertIntoSection(inventory, target.start, target.end, item);
  if (moved > 0) {
    if (moved >= item.amount) inventory.setItem(inputSlot, undefined);
    else {
      item.amount -= moved;
      inventory.setItem(inputSlot, item);
    }
    setStatus(block, golem, matched ? "match" : "ne");
    try {
      setBlockDynamic(block, "filtrovna:stuck_ticks", 0);
    } catch {}
    return;
  }

  const dropLocation = outputDropLocation(block, matched);
  let stuck = 0;
  try {
    stuck = Number(getBlockDynamic(block, "filtrovna:stuck_ticks") ?? 0) || 0;
  } catch {}

  if (!isSpaceFree(dimension, dropLocation)) {
    stuck++;
    try {
      setBlockDynamic(block, "filtrovna:stuck_ticks", stuck);
    } catch {}
    setStatus(block, golem, "stuck");
    setBlink(block, Math.floor(stuck / 5) % 2 === 0);
    return;
  }

  try {
    dimension.spawnItem(item, dropLocation);
    inventory.setItem(inputSlot, undefined);
    setStatus(block, golem, "drop");
    try {
      setBlockDynamic(block, "filtrovna:stuck_ticks", 0);
      setBlockDynamic(block, "filtrovna:drop_until", Date.now() + 1000);
    } catch {}
  } catch (err) {
    logErr("drop", err);
    stuck++;
    try {
      setBlockDynamic(block, "filtrovna:stuck_ticks", stuck);
    } catch {}
    setStatus(block, golem, "stuck");
    setBlink(block, Math.floor(stuck / 5) % 2 === 0);
  }
}

function applyOxidation(golem, level) {
  const factor = OXIDATION_FACTOR[level] ?? 1;
  try {
    golem.getComponent("minecraft:movement")?.setCurrentValue(BASE_SPEED * factor);
  } catch {}
}

function tickOxidation(golem, dimension) {
  let now = 0;
  try {
    now = Date.now();
  } catch {}

  let next = 0;
  try {
    next = Number(golem.getDynamicProperty("filtrovna:next_oxidation") ?? 0) || 0;
  } catch {}

  if (next === 0) {
    try {
      golem.setDynamicProperty("filtrovna:next_oxidation", now + OXIDATION_INTERVAL_MS);
    } catch {}
    return;
  }
  if (now < next) return;

  try {
    golem.setDynamicProperty("filtrovna:next_oxidation", now + OXIDATION_INTERVAL_MS);
  } catch {}

  let waxed = false;
  try {
    waxed = golem.getProperty("filtrovna:is_waxed") === true;
  } catch {}
  if (waxed) return;

  let level = "unoxidized";
  try {
    level = golem.getProperty("filtrovna:oxidation_level") ?? "unoxidized";
  } catch {}
  const index = OXIDATION.indexOf(level);
  if (index < 0 || index >= OXIDATION.length - 1) return;
  if (Math.random() > OXIDATION_CHANCE) return;

  const nextLevel = OXIDATION[index + 1];
  try {
    golem.setProperty("filtrovna:oxidation_level", nextLevel);
  } catch {
    return;
  }
  applyOxidation(golem, nextLevel);
  try {
    dimension.playSound(
      nextLevel === "oxidized"
        ? "mob.copper_golem.oxidized.spin"
        : "mob.copper_golem.weathered.spin",
      golem.location,
      { volume: 1, pitch: 1 },
    );
  } catch {}
}

function findNearbyFilter(golem, dimension) {
  let best;

  for (const inside of safeGetEntities(dimension, {
    type: INSIDE_ID,
    location: golem.location,
    maxDistance: 4,
  })) {
    const location = inside.location;
    const block = dimension.getBlock({
      x: Math.floor(location.x),
      y: Math.floor(location.y),
      z: Math.floor(location.z),
    });
    if (!block || block.typeId !== FILTER_ID) continue;
    const d = distanceSq(golem.location, {
      x: block.x + 0.5,
      y: block.y + 0.5,
      z: block.z + 0.5,
    });
    if (!best || d < best.distance) best = { block, distance: d };
  }
  if (best) return best;

  const base = {
    x: Math.floor(golem.location.x),
    y: Math.floor(golem.location.y),
    z: Math.floor(golem.location.z),
  };
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -2; dz <= 2; dz++) {
        const block = dimension.getBlock({ x: base.x + dx, y: base.y + dy, z: base.z + dz });
        if (!block || block.typeId !== FILTER_ID) continue;
        const d = distanceSq(golem.location, {
          x: block.x + 0.5,
          y: block.y + 0.5,
          z: block.z + 0.5,
        });
        if (!best || d < best.distance) best = { block, distance: d };
      }
    }
  }
  return best;
}

function isCopperChest(typeId) {
  return typeId.startsWith("minecraft:") && typeId.includes("copper_chest");
}

function findNearbyChest(golem, dimension) {
  const base = {
    x: Math.floor(golem.location.x),
    y: Math.floor(golem.location.y),
    z: Math.floor(golem.location.z),
  };
  let best;

  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -3; dz <= 3; dz++) {
        const block = dimension.getBlock({ x: base.x + dx, y: base.y + dy, z: base.z + dz });
        if (!block) continue;
        if (!isCopperChest(block.typeId) && block.typeId !== "minecraft:ender_chest") continue;
        if (block.typeId === "minecraft:ender_chest") {
          let ownerId;
          try {
            ownerId = golem.getDynamicProperty("filtrovna:owner");
          } catch {}
          if (typeof ownerId !== "string") continue;
          let owner;
          try {
            owner = world.getEntity(ownerId);
          } catch {}
          if (!owner || !owner.isValid || owner.dimension.id !== dimension.id) continue;
          const chestCenter = { x: block.x + 0.5, y: block.y + 0.5, z: block.z + 0.5 };
          if (distanceSq(owner.location, chestCenter) > 256) continue;
        }
        let container;
        try {
          container = block.getComponent("minecraft:inventory")?.container;
        } catch {}
        if (!container || countItems(container) === 0) continue;
        const d = distanceSq(golem.location, {
          x: block.x + 0.5,
          y: block.y + 0.5,
          z: block.z + 0.5,
        });
        if (!best || d < best.distance) best = { container, distance: d };
      }
    }
  }
  return best?.container;
}

function takeFromContainer(source, destination, maximum) {
  let taken = 0;
  for (let i = 0; i < source.size && taken < maximum; i++) {
    let item;
    try {
      item = source.getItem(i);
    } catch {
      continue;
    }
    if (!item) continue;

    const wanted = Math.min(item.amount, maximum - taken);
    const copy = item.clone();
    copy.amount = wanted;

    let leftover;
    try {
      leftover = destination.addItem(copy);
    } catch {
      break;
    }
    const moved = wanted - (leftover ? leftover.amount : 0);
    if (moved <= 0) continue;

    try {
      if (item.amount === moved) source.setItem(i, undefined);
      else {
        item.amount -= moved;
        source.setItem(i, item);
      }
    } catch {
      continue;
    }
    taken += moved;
  }
  return taken;
}

function tickMiniGolem(golem, dimension) {
  if (!golem.isValid) return;

  const inventory = getContainer(golem);
  if (!inventory) return;

  const carrying = countItems(inventory) > 0;
  let wasCarrying = false;
  try {
    wasCarrying = golem.getDynamicProperty("filtrovna:carrying") === true;
  } catch {}

  if (carrying !== wasCarrying) {
    try {
      golem.setDynamicProperty("filtrovna:carrying", carrying);
    } catch {}
    try {
      golem.triggerEvent(carrying ? "filtrovna:become_carrying" : "filtrovna:become_empty");
    } catch {}
  }

  if (carrying) {
    const found = findNearbyFilter(golem, dimension);
    if (found) {
      const offset = vstupOffset(found.block);
      const side = {
        x: found.block.x + 0.5 + offset.x,
        y: found.block.y + 0.5,
        z: found.block.z + 0.5 + offset.z,
      };
      if (distanceSq(golem.location, side) <= 12.25) {
        const inside = ensureFilter(found.block, dimension, true);
        const active = inside ? getFilterInventory(found.block, inside) : undefined;
        const destination = active?.container;
        const layout = active?.layout;
        if (destination && layout) {
          let moved = 0;
          for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (!item) continue;
            const amount = insertIntoSection(destination, layout.vstup.start, layout.vstup.end, item);
            if (amount > 0) {
              if (amount >= item.amount) inventory.setItem(i, undefined);
              else {
                item.amount -= amount;
                inventory.setItem(i, item);
              }
              moved += amount;
            }
            if (destination.emptySlotsCount === 0) break;
          }
          if (moved > 0) {
            setStatus(found.block, inside, "processing");
            try {
              dimension.playSound(
                "mob.copper_golem.chest_interaction.put_item",
                golem.location,
                { volume: 1, pitch: 1 },
              );
            } catch {}
          }
        }
      }
    }
  } else {
    const source = findNearbyChest(golem, dimension);
    if (source) {
      const taken = takeFromContainer(source, inventory, MAX_CARRY);
      if (taken > 0) {
        try {
          dimension.playSound(
            "mob.copper_golem.chest_interaction.take_item",
            golem.location,
            { volume: 1, pitch: 1 },
          );
        } catch {}
      }
    }
  }

  tickOxidation(golem, dimension);
}

function cleanupWorld() {
  for (const key of [...filterKeys]) {
    const parsed = parseFilterKey(key);
    if (!parsed) {
      filterKeys.delete(key);
      continue;
    }
    const target = getFilterBlock(parsed);
    if (!target || !target.block) continue;
    if (target.block.typeId !== FILTER_ID) {
      filterKeys.delete(key);
      continue;
    }
    ensureFilter(target.block, target.dimension, true);
  }

  for (const player of world.getPlayers()) {
    const dimension = player.dimension;
    const base = {
      x: Math.floor(player.location.x),
      y: Math.floor(player.location.y),
      z: Math.floor(player.location.z),
    };
    for (let dx = -8; dx <= 8; dx++) {
      for (let dy = -8; dy <= 8; dy++) {
        for (let dz = -8; dz <= 8; dz++) {
          let block;
          try {
            block = dimension.getBlock({ x: base.x + dx, y: base.y + dy, z: base.z + dz });
          } catch {
            continue;
          }
          if (!block || block.typeId !== FILTER_ID) continue;
          const key = filterKey(block);
          if (filterKeys.has(key)) continue;
          filterKeys.add(key);
          ensureFilter(block, dimension, true);
        }
      }
    }
  }

  for (const dimensionId of DIMENSIONS) {
    let dimension;
    try {
      dimension = world.getDimension(dimensionId);
    } catch {
      continue;
    }

    for (const golem of safeGetEntities(dimension, { type: INSIDE_ID })) {
      const location = golem.location;
      const block = dimension.getBlock({
        x: Math.floor(location.x),
        y: Math.floor(location.y),
        z: Math.floor(location.z),
      });
      if (!block) continue;
      if (block.typeId !== FILTER_ID) {
        const inventory = getContainer(golem);
        if (inventory) ejectContainer(inventory, dimension, golem.location);
        try {
          dimension.spawnEntity(MINI_ID, golem.location);
        } catch {}
        safeRemove(golem);
        continue;
      }
      filterKeys.add(filterKey(block));
      try {
        setBlockDynamic(block, "filtrovna:golem_id", golem.id);
      } catch {}
      keepGolemInPlace(golem, block);
    }

    for (const golem of safeGetEntities(dimension, { type: MINI_ID })) {
      let level = "unoxidized";
      try {
        level = golem.getProperty("filtrovna:oxidation_level") ?? "unoxidized";
      } catch {}
      applyOxidation(golem, level);

      const inventory = getContainer(golem);
      const carrying = !!inventory && countItems(inventory) > 0;
      let wasCarrying = false;
      try {
        wasCarrying = golem.getDynamicProperty("filtrovna:carrying") === true;
      } catch {}
      if (carrying !== wasCarrying) {
        try {
          golem.setDynamicProperty("filtrovna:carrying", carrying);
          golem.triggerEvent(carrying ? "filtrovna:become_carrying" : "filtrovna:become_empty");
        } catch {}
      }
    }
  }

  saveFilterKeys();
}

function getHeldItem(player) {
  try {
    return player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
  } catch {
    return undefined;
  }
}

function consumeHeldItem(player, held, amount) {
  if (!held || amount <= 0) return;
  try {
    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable) return;
    for (const slot of [EquipmentSlot.Mainhand, EquipmentSlot.Offhand]) {
      const item = equippable.getEquipment(slot);
      if (!item || item.typeId !== held.typeId) continue;
      if (item.amount <= amount) equippable.setEquipment(slot, undefined);
      else {
        const copy = item.clone();
        copy.amount -= amount;
        equippable.setEquipment(slot, copy);
      }
      return;
    }
  } catch (err) {
    logErr("consumeHeld", err);
  }
}

function damageHeldItem(player, held, amount) {
  if (!held || amount <= 0) return;
  try {
    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable) return;
    for (const slot of [EquipmentSlot.Mainhand, EquipmentSlot.Offhand]) {
      const item = equippable.getEquipment(slot);
      if (!item || item.typeId !== held.typeId) continue;
      const copy = item.clone();
      const durability = copy.getComponent("minecraft:durability");
      if (!durability) return;
      durability.damage = Math.min(durability.maxDurability, durability.damage + amount);
      if (durability.damage >= durability.maxDurability) equippable.setEquipment(slot, undefined);
      else equippable.setEquipment(slot, copy);
      return;
    }
  } catch (err) {
    logErr("damageHeld", err);
  }
}

const STATUS_TEXT = {
  idle: "nečinný",
  processing: "zpracovává",
  match: "třídí",
  ne: "odmítá",
  drop: "vyhazuje",
  stuck: "zaseknutý",
};

function insertHeldItem(player, block, golem, held) {
  const active = getFilterInventory(block, golem);
  if (!active) {
    player.sendMessage({ translate: "filtrovna.msg.no_inventory" });
    return;
  }
  const moved = insertIntoSection(
    active.container,
    active.layout.vstup.start,
    active.layout.vstup.end,
    held,
  );
  if (moved <= 0) {
    player.sendMessage({ translate: "filtrovna.msg.input_full" });
    return;
  }
  consumeHeldItem(player, held, moved);
  player.sendMessage({ translate: "filtrovna.msg.inserted", with: [String(moved)] });
}

function takeFromSlot(player, container, index) {
  const item = container.getItem(index);
  if (!item) return;
  const inventory = getContainer(player);
  if (!inventory) return;
  try {
    const leftover = inventory.addItem(item.clone());
    container.setItem(index, leftover ?? undefined);
  } catch (err) {
    logErr("takeSlot", err);
  }
}

function insertHeldIntoSlot(player, container, index) {
  const held = getHeldItem(player);
  if (!held) {
    player.sendMessage({ translate: "filtrovna.msg.no_held" });
    return;
  }
  const existing = container.getItem(index);
  if (!existing) {
    container.setItem(index, held.clone());
    consumeHeldItem(player, held, held.amount);
    return;
  }
  if (existing.typeId !== held.typeId) {
    player.sendMessage({ translate: "filtrovna.msg.slot_occupied" });
    return;
  }
  const room = (existing.maxAmount ?? 64) - existing.amount;
  if (room <= 0) {
    player.sendMessage({ translate: "filtrovna.msg.slot_full" });
    return;
  }
  const move = Math.min(room, held.amount);
  existing.amount += move;
  container.setItem(index, existing);
  consumeHeldItem(player, held, move);
}

function openSlotEditor(player, block, golem, index) {
  if (typeof CustomForm !== "function") return;
  const active = getFilterInventory(block, golem);
  if (!active) return;
  const { container } = active;
  const item = container.getItem(index);
  let editor;
  try {
    editor = new CustomForm(player, `§6Filtrovna §7— slot ${index}`);
  } catch (err) {
    logErr("customFormSlotCreate", err);
    showFilterStatus(player, block, golem);
    return;
  }
  editor.label(item ? `§f${item.typeId} §7x${item.amount}` : "§8Prázdný slot");

  const closeAndReopen = () => {
    try {
      editor.close();
    } catch {}
    system.run(() => openFilterWindow(player, block, golem));
  };

  editor.button({ translate: "filtrovna.ui.take" }, () => {
    takeFromSlot(player, container, index);
    closeAndReopen();
  });
  editor.button({ translate: "filtrovna.ui.insert_held_slot" }, () => {
    insertHeldIntoSlot(player, container, index);
    closeAndReopen();
  });
  editor.button({ translate: "filtrovna.ui.clear" }, () => {
    container.setItem(index, undefined);
    closeAndReopen();
  });
  editor.button({ translate: "filtrovna.ui.back" }, closeAndReopen);
  editor.closeButton();
  try {
    editor.show().catch((err) => {
      logErr("customFormSlot", err);
      showFilterStatus(player, block, golem);
    });
  } catch (err) {
    logErr("customFormSlot", err);
    showFilterStatus(player, block, golem);
  }
}

function openFilterWindow(player, block, golem) {
  if (typeof CustomForm !== "function") {
    showFilterStatus(player, block, golem);
    return;
  }
  const active = getFilterInventory(block, golem);
  if (!active) {
    player.sendMessage({ translate: "filtrovna.msg.no_inventory" });
    return;
  }
  const { container, layout } = active;
  let form;
  try {
    form = new CustomForm(player, "§6Filtrovna");
  } catch (err) {
    logErr("customFormCreate", err);
    showFilterStatus(player, block, golem);
    return;
  }
  const title =
    active.kind === "double"
      ? "§6Filtrovna §7— dvojitá truhla"
      : active.kind === "single"
        ? "§6Filtrovna §7— truhla"
        : "§6Filtrovna §7— vnitřní inventář";
  form.header(title);
  form.label(
    `§7Vstup: §f${countItemsIn(container, layout.vstup)}§7 | Filtr: §f${countItemsIn(container, layout.filtr)}§7 | Match: §f${countItemsIn(container, layout.match)}§7 | NE: §f${countItemsIn(container, layout.ne)}`,
  );

  const sections = [
    ["VSTUP", layout.vstup],
    ["FILTR", layout.filtr],
    ["MATCH", layout.match],
    ["NE", layout.ne],
  ];
  for (const [title, section] of sections) {
    form.header(`§e${title} §7(${section.start}–${section.end})`);
    for (let i = section.start; i <= section.end; i++) {
      const item = container.getItem(i);
      const label = item
        ? `§7${i}: §f${item.typeId} §7x${item.amount}`
        : `§7${i}: §8(prázdný)`;
      form.button(label, () => {
        try {
          form.close();
        } catch {}
        system.run(() => openSlotEditor(player, block, golem, i));
      });
    }
  }

  form.label(
    active.kind === "double"
      ? "§7Truhla: 1. řada VSTUP, 2. řada FILTR, 3. řada MATCH, 4. řada NE."
      : active.kind === "single"
        ? "§7Truhla: 1. řada VSTUP, 2. řada FILTR, 3. řada MATCH (5) + NE (4)."
        : "§7Přidej vedle filtru truhlu pro skutečné truhlové UI.",
  );
  form.closeButton();
  try {
    form.show().catch((err) => {
      logErr("customForm", err);
      showFilterStatus(player, block, golem);
    });
  } catch (err) {
    logErr("customForm", err);
    showFilterStatus(player, block, golem);
  }
}

function showFilterStatus(player, block, golem) {
  const active = getFilterInventory(block, golem);
  const container = active?.container;
  const layout = active?.layout;

  const inputCount = container ? countItemsIn(container, layout.vstup) : 0;
  const filterCount = container ? countItemsIn(container, layout.filtr) : 0;
  const matchCount = container ? countItemsIn(container, layout.match) : 0;
  const neCount = container ? countItemsIn(container, layout.ne) : 0;

  let status = "idle";
  try {
    status = block.permutation.getState("filtrovna:status") ?? "idle";
  } catch {}

  const hint =
    active?.kind === "double"
      ? "§7Dvojitá truhla: 1. řada VSTUP, 2. řada FILTR, 3. řada MATCH, 4. řada NE. Sneak + klik vloží předmět.§r"
      : active?.kind === "single"
        ? "§7Jednoduchá truhla: 1. řada VSTUP, 2. řada FILTR, 3. řada MATCH (5) + NE (4). Pro 4×9 použij dvojitou.§r"
        : "§7Přidej vedle filtru dvojitou truhlu (54 slotů). Sneak + klik vloží předmět do VSTUPU.§r";

  player.sendMessage(
    `§6Filtrovna§r\nStav: §e${STATUS_TEXT[status] ?? status}§r\n` +
      `Vstup: §f${inputCount}§r | Filtr: §f${filterCount}§r | Match: §f${matchCount}§r | NE: §f${neCount}§r\n` +
      hint,
  );
}

function validRange(start, end) {
  return (
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    start >= 0 &&
    end <= 36 &&
    start <= end
  );
}

function mapSectionRange(start, end, layout) {
  const known = [
    [0, 8, layout.vstup],
    [9, 18, layout.filtr],
    [19, 27, layout.match],
    [28, 36, layout.ne],
  ];
  for (const [from, to, section] of known) {
    if (start === from && end === to) return [section.start, section.end];
  }
  return [start, end];
}

function findNearestFilterBlock(dimension, location, radius) {
  let best;
  for (const inside of safeGetEntities(dimension, {
    type: INSIDE_ID,
    location,
    maxDistance: radius,
  })) {
    const position = inside.location;
    const block = dimension.getBlock({
      x: Math.floor(position.x),
      y: Math.floor(position.y),
      z: Math.floor(position.z),
    });
    if (!block || block.typeId !== FILTER_ID) continue;
    const d = distanceSq(location, {
      x: block.x + 0.5,
      y: block.y + 0.5,
      z: block.z + 0.5,
    });
    if (!best || d < best.distance) best = { block, distance: d };
  }
  if (best) return best.block;

  const base = {
    x: Math.floor(location.x),
    y: Math.floor(location.y),
    z: Math.floor(location.z),
  };
  const reach = Math.min(6, Math.max(1, Math.floor(radius)));
  for (let dx = -reach; dx <= reach; dx++) {
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dz = -reach; dz <= reach; dz++) {
        const block = dimension.getBlock({ x: base.x + dx, y: base.y + dy, z: base.z + dz });
        if (!block || block.typeId !== FILTER_ID) continue;
        const d = distanceSq(location, {
          x: block.x + 0.5,
          y: block.y + 0.5,
          z: block.z + 0.5,
        });
        if (!best || d < best.distance) best = { block, distance: d };
      }
    }
  }
  return best?.block;
}

function resolveTargetBlock(event) {
  const sourceBlock = event.sourceBlock;
  if (sourceBlock?.typeId === FILTER_ID) return sourceBlock;
  if (sourceBlock) {
    const near = findNearestFilterBlock(
      sourceBlock.dimension,
      { x: sourceBlock.x + 0.5, y: sourceBlock.y + 0.5, z: sourceBlock.z + 0.5 },
      8,
    );
    if (near) return near;
  }

  const sourceEntity = event.sourceEntity;
  if (sourceEntity?.typeId === "minecraft:player") {
    try {
      const hit = sourceEntity.getBlockFromViewDirection({
        maxDistance: 8,
        includeLiquidBlocks: false,
        includePassableBlocks: false,
      });
      if (hit?.block?.typeId === FILTER_ID) return hit.block;
    } catch {}
    return findNearestFilterBlock(sourceEntity.dimension, sourceEntity.location, 16);
  }
  return undefined;
}

function sendFeedback(player, message) {
  if (player) {
    player.sendMessage(message);
  } else {
    try {
      console.warn(`[Filtrovna] ${message?.translate ?? JSON.stringify(message)}`);
    } catch {}
  }
}

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  if (event.block?.typeId !== FILTER_ID) return;
  system.run(() => {
    try {
      onFilterPlaced(event.block, event.dimension);
    } catch (err) {
      logErr("place", err);
    }
  });
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  if (event.brokenBlockPermutation?.type?.id !== FILTER_ID) return;
  system.run(() => {
    try {
      onFilterBroken(event.block, event.dimension);
    } catch (err) {
      logErr("break", err);
    }
  });
});

world.afterEvents.worldLoad.subscribe(() => {
  system.run(() => {
    try {
      loadFilterKeys();
      cleanupWorld();
    } catch (err) {
      logErr("worldLoad", err);
    }
  });
});

world.beforeEvents.entityItemPickup.subscribe(
  (event) => {
    const entity = event.entity;
    if (entity.typeId !== MINI_ID) return;

    const inventory = getContainer(entity);
    if (!inventory) return;

    const total = countItems(inventory);
    if (total >= MAX_CARRY) {
      event.cancel = true;
      return;
    }

    const itemEntity = event.item;
    let stack;
    try {
      stack = itemEntity.getComponent("minecraft:item")?.itemStack;
    } catch {
      return;
    }
    if (!stack) return;

    const remaining = MAX_CARRY - total;
    if (stack.amount <= remaining) return;

    event.cancel = true;
    system.run(() => {
      if (!itemEntity.isValid) return;
      let current;
      try {
        current = itemEntity.getComponent("minecraft:item")?.itemStack;
      } catch {
        return;
      }
      if (!current) return;

      const copy = current.clone();
      copy.amount = Math.min(remaining, current.amount);

      let leftover;
      try {
        leftover = inventory.addItem(copy);
      } catch {
        return;
      }
      const moved = copy.amount - (leftover ? leftover.amount : 0);
      if (moved <= 0) return;

      const rest = current.amount - moved;
      const location = itemEntity.location;
      try {
        itemEntity.remove();
      } catch {}
      if (rest > 0) {
        const remainingStack = current.clone();
        remainingStack.amount = rest;
        try {
          entity.dimension.spawnItem(remainingStack, location);
        } catch {}
      }
    });
  },
  { entityFilter: { type: MINI_ID } },
);

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  if (!event.isFirstEvent) return;
  if (event.block.typeId !== FILTER_ID) return;

  const player = event.player;
  const golem = ensureFilter(event.block, event.block.dimension, true);
  if (!golem) {
    player.sendMessage({ translate: "filtrovna.msg.no_golem" });
    return;
  }

  if (event.itemStack && player.isSneaking) {
    insertHeldItem(player, event.block, golem, event.itemStack);
    return;
  }

  system.run(() => openFilterWindow(player, event.block, golem));
});

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const target = event.target;
  if (target.typeId !== MINI_ID) return;

  const player = event.player;
  const held = event.itemStack;
  if (!held) return;

  if (held.typeId === "minecraft:honeycomb") {
    let waxed = false;
    try {
      waxed = target.getProperty("filtrovna:is_waxed") === true;
    } catch {}
    if (waxed) {
      player.sendMessage({ translate: "filtrovna.msg.already_waxed" });
      return;
    }
    try {
      target.setProperty("filtrovna:is_waxed", true);
      target.setDynamicProperty("filtrovna:owner", player.id);
      target.setDynamicProperty("filtrovna:owner_name", player.name);
    } catch (err) {
      logErr("wax", err);
      return;
    }
    consumeHeldItem(player, held, 1);
    try {
      target.dimension.playSound("mob.copper_golem.spin", target.location, {
        volume: 1,
        pitch: 1,
      });
      target.dimension.spawnParticle("minecraft:wax_on", target.location);
    } catch {}
    player.sendMessage({ translate: "filtrovna.msg.waxed" });
    return;
  }

  if (held.typeId.endsWith("_axe")) {
    let waxed = false;
    let level = "unoxidized";
    try {
      waxed = target.getProperty("filtrovna:is_waxed") === true;
      level = target.getProperty("filtrovna:oxidation_level") ?? "unoxidized";
    } catch {}
    const index = OXIDATION.indexOf(level);

    if (waxed) {
      try {
        target.setProperty("filtrovna:is_waxed", false);
      } catch (err) {
        logErr("unwax", err);
        return;
      }
      player.sendMessage({ translate: "filtrovna.msg.unwaxed" });
    } else if (index > 0) {
      const nextLevel = OXIDATION[index - 1];
      try {
        target.setProperty("filtrovna:oxidation_level", nextLevel);
      } catch (err) {
        logErr("scrape", err);
        return;
      }
      applyOxidation(target, nextLevel);
      player.sendMessage({ translate: "filtrovna.msg.scraped" });
    } else {
      player.sendMessage({ translate: "filtrovna.msg.already_clean" });
      return;
    }

    damageHeldItem(player, held, 1);
    try {
      target.dimension.playSound(
        "mob.copper_golem.chest_interaction.take_item",
        target.location,
        { volume: 1, pitch: 1 },
      );
      target.dimension.spawnParticle("minecraft:wax_off", target.location);
    } catch {}
  }
});

system.afterEvents.scriptEventReceive.subscribe(
  (event) => {
    const id = event.id;
    if (id !== "filtrovna:set" && id !== "filtrovna:clear" && id !== "filtrovna:debug") return;

    const args = event.message.trim().split(/\s+/).filter(Boolean);
    const player =
      event.sourceEntity?.typeId === "minecraft:player" ? event.sourceEntity : undefined;
    let block;
    let index = 0;

    if (args.length >= 5 && args.slice(0, 3).every((value) => /^-?\d+$/.test(value))) {
      const x = parseInt(args[0], 10);
      const y = parseInt(args[1], 10);
      const z = parseInt(args[2], 10);
      const dimension =
        player?.dimension ?? event.sourceEntity?.dimension ?? event.sourceBlock?.dimension;
      if (dimension) block = dimension.getBlock({ x, y, z });
      index = 3;
    }
    if (!block) block = resolveTargetBlock(event);
    if (!block || block.typeId !== FILTER_ID) {
      sendFeedback(player, { translate: "filtrovna.msg.no_target" });
      return;
    }

    const golem = ensureFilter(block, block.dimension, true);
    const active = golem ? getFilterInventory(block, golem) : undefined;
    const inventory = active?.container;

    if (id === "filtrovna:debug") {
      const rotation = golem?.getRotation?.();
      let direction = "?";
      try {
        direction = block.permutation.getState("minecraft:cardinal_direction") ?? "?";
      } catch {}
      const counts = active
        ? `VSTUP=${countItemsIn(inventory, active.layout.vstup)} FILTR=${countItemsIn(inventory, active.layout.filtr)} MATCH=${countItemsIn(inventory, active.layout.match)} NE=${countItemsIn(inventory, active.layout.ne)}`
        : "bez inventáře";
      sendFeedback(
        player,
        `§6Filtrovna debug§r\n` +
          `blok: ${block.x},${block.y},${block.z} směr=${direction}\n` +
          `aktivní: ${active?.kind ?? "none"} size=${inventory?.size ?? 0}\n` +
          `golem: ${golem ? `${golem.id} rot=${rotation?.x ?? "?"}/${rotation?.y ?? "?"}` : "chybí"}\n` +
          `klíč: ${filterKeys.has(filterKey(block)) ? "ano" : "ne"} (celkem ${filterKeys.size})\n` +
          counts,
      );
      return;
    }

    if (!inventory) {
      sendFeedback(player, { translate: "filtrovna.msg.no_inventory" });
      return;
    }

    if (id === "filtrovna:clear") {
      const [start, end] = mapSectionRange(
        parseInt(args[index] ?? "", 10),
        parseInt(args[index + 1] ?? "", 10),
        active.layout,
      );
      if (!validRange(start, end)) {
        sendFeedback(player, { translate: "filtrovna.msg.bad_range" });
        return;
      }
      for (let i = start; i <= end; i++) inventory.setItem(i, undefined);
      sendFeedback(player, {
        translate: "filtrovna.msg.cleared",
        with: [String(start), String(end)],
      });
      return;
    }

    const [start, end] = mapSectionRange(
      parseInt(args[index] ?? "", 10),
      parseInt(args[index + 1] ?? "", 10),
      active.layout,
    );
    const rawItemId = args[index + 2];
    const amount = Math.max(
      1,
      Math.min(64, parseInt(args[index + 3] ?? "1", 10) || 1),
    );

    if (!validRange(start, end) || !rawItemId) {
      sendFeedback(player, { translate: "filtrovna.msg.bad_range" });
      return;
    }

    if (rawItemId === "air" || rawItemId === "minecraft:air") {
      for (let i = start; i <= end; i++) inventory.setItem(i, undefined);
      sendFeedback(player, {
        translate: "filtrovna.msg.cleared",
        with: [String(start), String(end)],
      });
      return;
    }

    const itemId = rawItemId.includes(":") ? rawItemId : `minecraft:${rawItemId}`;
    const itemType = ItemTypes.get(itemId);
    if (!itemType) {
      sendFeedback(player, { translate: "filtrovna.msg.bad_item", with: [rawItemId] });
      return;
    }

    for (let i = start; i <= end; i++) {
      inventory.setItem(i, makeStack(itemType, amount));
    }
    sendFeedback(player, {
      translate: "filtrovna.msg.set",
      with: [String(start), String(end), itemId, String(amount)],
    });
  },
  { namespaces: ["filtrovna"] },
);

system.runInterval(() => {
  for (const key of [...filterKeys]) {
    const parsed = parseFilterKey(key);
    if (!parsed) {
      filterKeys.delete(key);
      continue;
    }
    const target = getFilterBlock(parsed);
    if (!target || !target.block) continue;
    if (target.block.typeId !== FILTER_ID) {
      filterKeys.delete(key);
      continue;
    }
    try {
      tickFilter(target.block, target.dimension);
    } catch (err) {
      logErr("filterTick", err);
    }
  }
}, 1);

system.runInterval(() => {
  for (const dimensionId of DIMENSIONS) {
    let dimension;
    try {
      dimension = world.getDimension(dimensionId);
    } catch {
      continue;
    }
    for (const golem of safeGetEntities(dimension, { type: MINI_ID })) {
      try {
        tickMiniGolem(golem, dimension);
      } catch (err) {
        logErr("miniTick", err);
      }
    }
  }
}, 20);

system.runInterval(() => {
  try {
    cleanupWorld();
  } catch (err) {
    logErr("cleanup", err);
  }
}, 100);
