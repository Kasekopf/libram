import {
  containsText,
  eudoraItem,
  getCampground,
  getWorkshed,
  print,
  toInt,
  use,
  visitUrl,
  xpath,
} from "kolmafia";
import { $item, $items, $stat, get, have } from ".";
import { Path } from "./Path";
import { ChateauMantegna } from "./resources";

export enum Lifestyle {
  casual = 1,
  softcore = 2,
  normal = 2,
  hardcore = 3,
}

function toMoonId(moon: string | number, playerClass: Class): number {
  if (typeof moon === "number") return moon;

  const offset = (): number => {
    switch (playerClass.primestat) {
      case $stat`Muscle`:
        return 0;
      case $stat`Mysticality`:
        return 1;
      case $stat`Moxie`:
        return 2;
      default:
        throw `unknown prime stat for ${playerClass}`;
    }
  };

  switch ((moon as string).toLowerCase()) {
    case "mongoose":
      return 1;
    case "wallaby":
      return 2;
    case "vole":
      return 3;
    case "platypus":
      return 4;
    case "opossum":
      return 5;
    case "marmot":
      return 6;
    case "wombat":
      return 7;
    case "blender":
      return 8;
    case "packrat":
      return 9;
    case "degrassi":
    case "degrassi knoll":
    case "friendly degrassi knoll":
    case "knoll":
      return 1 + offset();
    case "canada":
    case "canadia":
    case "little canadia":
      return 4 + offset();
    case "gnomads":
    case "gnomish":
    case "gnomish gnomads camp":
      return 7 + offset();
    default:
      return -1;
  }
}

export function ascend(
  path: Path,
  playerClass: Class,
  lifestyle: Lifestyle,
  moon: string | number,
  consumable: Item | undefined = $item`Astral Six-Pack`,
  pet: Item | undefined = undefined
): void {
  if (!containsText(visitUrl("charpane.php"), "Astral Spirit")) {
    print(
      "It'd really be better if you were already through the gash. Oh well!",
      "blue"
    );
    visitUrl("ascend.php?action=ascend&confirm=on&confirm2=on");
  }
  if (!containsText(visitUrl("charpane.php"), "Astral Spirit"))
    throw "Failed to ascend.";
  const classid = path.isAvatar ? 0 : toInt(playerClass);
  if (path.id < 0) throw `Invalid path ID ${path.id}`;
  const moonId = toMoonId(moon, playerClass);
  if (moonId < 1 || moonId > 9) throw `Invalid moon ${moon}`;
  if (
    consumable &&
    !$items`Astral Six-Pack, Astral Hot Dog Dinner`.includes(consumable)
  )
    throw `Invalid consumable ${consumable}`;
  if (
    pet &&
    !$items`Astral Bludgeon,
    Astral Shield, Astral Chapeau,
    Astral Bracer, Astral Longbow,
    Astral Shorts, Astral Mace,
    Astral Ring, Astral Statuette,
    Astral Pistol, Astral Mask,
    Astral Pet Sweater, Astral Shirt,
    Astral Belt`.includes(pet)
  )
    throw `Invalid astral item ${pet}`;

  visitUrl("afterlife.php?action=pearlygates");

  if (consumable)
    visitUrl(`afterlife.php?action=buydeli&whichitem=${toInt(consumable)}`);
  if (pet) visitUrl(`afterlife.php?action=buyarmory&whichitem=${toInt(pet)}`);

  visitUrl(
    `afterlife.php?action=ascend&confirmascend=1&whichsign=${moonId}&gender=2&whichclass=${classid}&whichpath=${path.id}&asctype=${lifestyle}&nopetok=1&noskillsok=1&lamepathok=1&pwd`,
    true
  );
}

const worksheds = $items`Warbear LP-ROM Burner, Warbear Jackhammer Drill Press, Warbear Induction Oven, Warbear High-Efficiency Still, Warbear Chemistry Lab, Warbear Auto-Anvil, Spinning Wheel, Snow Machine, Little Geneticist DNA-Splicing Lab, Portable Mayo Clinic, Asdon Martin Keyfob, Diabolic Pizza Cube`;
const gardens = $items`Packet of Pumpkin Seeds, Peppermint Pip Packet, Packet of Dragon's Teeth, Packet of Beer Seeds, Packet of Winter Seeds, Packet of Thanksgarden Seeds, Packet of Tall Grass Seeds, Packet of Mushroom Spores`;
const eudorae = $items`My Own Pen-Pal Kit, GameInformPowerDailyPro Subscription Card, Xi Receiver Unit, New-You Club Membership Form`;

const desks = $items`Fancy Stationary Set, Swiss Piggy Bank, Continental Juice Bar`;
const ceilings = $items`Antler Chandelier, Ceiling Fan, Artificial Skylight`;
const nightstands = $items`Foreign Language Tapes, Bottle of Potpourri, Electric Muscle Stimulator`;

export function prepareAscension(
  ascensionItems?: {
    workshed?: Item;
    garden?: Item;
    eudora?: Item;
  },
  chateauItems?: {
    desk?: Item;
    ceiling?: Item;
    nightstand?: Item;
  },
  throwOnFail = true
): void {
  if (ascensionItems) {
    if (ascensionItems.workshed && getWorkshed() !== ascensionItems.workshed) {
      if (!worksheds.includes(ascensionItems.workshed) && throwOnFail)
        throw `Invalid workshed: ${ascensionItems.workshed}!`;
      else if (!have(ascensionItems.workshed) && throwOnFail)
        throw `I'm sorry buddy, but you don't seem to own a ${ascensionItems.workshed}. Which makes it REALLY hard for us to plop one into your workshed.`;
      else if (get("_workshedItemUsed") && throwOnFail)
        throw `Seems like you've already swapped your workshed, buddy.`;
      else use(ascensionItems.workshed);
      if (getWorkshed() !== ascensionItems.workshed && throwOnFail)
        throw `We really thought we changed your workshed to a ${ascensionItems.workshed}, but Mafia is saying otherwise.`;
    }

    if (
      ascensionItems.garden &&
      !Object.getOwnPropertyNames(getCampground()).includes(
        ascensionItems.garden.name
      )
    ) {
      if (!gardens.includes(ascensionItems.garden) && throwOnFail)
        throw `Invalid garden: ${ascensionItems.garden}!`;
      else if (!have(ascensionItems.garden) && throwOnFail)
        throw `I'm sorry buddy, but you don't seem to own a ${ascensionItems.garden}. Which makes it REALLY hard for us to plant one into your garden.`;
      else use(ascensionItems.garden);
      if (
        !Object.getOwnPropertyNames(getCampground()).includes(
          ascensionItems.garden.name
        ) &&
        throwOnFail
      )
        throw `We really thought we changed your garden to a ${ascensionItems.garden}, but Mafia is saying otherwise.`;
    }

    if (ascensionItems.eudora && eudoraItem() !== ascensionItems.eudora) {
      if (!eudorae.includes(ascensionItems.eudora) && throwOnFail)
        throw `Invalid eudora: ${ascensionItems.eudora}!`;
      else if (
        !xpath(
          visitUrl("account.php?tab=correspondence"),
          `/select[@name="whichpenpal"]/option/text()`
        ).includes(ascensionItems.eudora.name) &&
        throwOnFail
      )
        throw `I'm sorry buddy, but you don't seem to be subscribed to ${ascensionItems.eudora}. Which makes it REALLY hard to correspond with them.`;
      else
        visitUrl(
          `account.php?actions[]=whichpenpal&whichpenpal=${
            1 + eudorae.indexOf(ascensionItems.eudora)
          }&action=Update`,
          true
        );
      if (eudoraItem() !== ascensionItems.eudora && throwOnFail)
        throw `We really thought we chaned your eudora to a ${ascensionItems.eudora}, but Mafia is saying otherwise.`;
    }
  }
  if (chateauItems && ChateauMantegna.have()) {
    if (
      chateauItems.ceiling &&
      ChateauMantegna.getCeiling() !== chateauItems.ceiling
    ) {
      if (!ceilings.includes(chateauItems.ceiling) && throwOnFail)
        throw `Invalid chateau ceiling: ${chateauItems.ceiling}!`;
      else if (
        !ChateauMantegna.changeCeiling(chateauItems.ceiling) &&
        throwOnFail
      )
        throw `We tried, but were unable to change your chateau ceiling to ${chateauItems.ceiling}. Probably.`;
    }

    if (chateauItems.desk && ChateauMantegna.getDesk() !== chateauItems.desk) {
      if (!desks.includes(chateauItems.desk) && throwOnFail)
        throw `Invalid chateau desk: ${chateauItems.desk}!`;
      else if (!ChateauMantegna.changeDesk(chateauItems.desk) && throwOnFail)
        throw `We tried, but were unable to change your chateau desk to ${chateauItems.desk}. Probably.`;
    }

    if (
      chateauItems.nightstand &&
      ChateauMantegna.getNightstand() !== chateauItems.nightstand
    ) {
      if (!nightstands.includes(chateauItems.nightstand) && throwOnFail)
        throw `Invalid chateau nightstand: ${chateauItems.nightstand}!`;
      else if (
        !ChateauMantegna.changeNightstand(chateauItems.nightstand) &&
        throwOnFail
      )
        throw `We tried, but were unable to change your chateau nightstand to ${chateauItems.nightstand}. Probably.`;
    }
  }
}
