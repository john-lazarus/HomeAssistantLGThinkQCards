const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs
  .readFileSync("homeassistant-lg-thinq-cards.js", "utf8")
  .replace(/^\s*export const /m, "const ");

const html = (strings, ...values) => ({ strings: [...strings], values });
const css = html;
class LitElement {
  requestUpdate() {}
}
LitElement.prototype.html = html;
LitElement.prototype.css = css;

const registry = new Map();
const context = {
  console: { info() {}, log() {} },
  window: { LitElement },
  customElements: {
    define(name, klass) { registry.set(name, klass); },
    get(name) { return registry.get(name); },
  },
  Set,
  Map,
};
vm.runInNewContext(source, context);

const Card = registry.get("lg-thinq-card");
const hass = (states) => ({ states });
const state = (value, friendlyName) => ({
  state: value,
  attributes: friendlyName ? { friendly_name: friendlyName } : {},
});
const stringsIn = (value) => {
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === "object") return Object.values(value).flatMap(stringsIn);
  return typeof value === "string" ? [value] : [];
};

function testAutoDetectsRefrigeratorInsteadOfDefaultingToDishwasher() {
  const card = new Card();
  card.setConfig({});
  card.hass = hass({
    "sensor.refrigerator_fridge_temperature": state("3", "Fridge temperature"),
    "sensor.refrigerator_freezer_temperature": state("-18", "Freezer temperature"),
  });
  assert.equal(card._config.appliance, "fridge");
  assert.equal(card._definition.label, "Refrigerator");
}

function testExplicitApplianceStillWins() {
  const card = new Card();
  card.setConfig({ appliance: "washer" });
  card.hass = hass({
    "sensor.refrigerator_fridge_temperature": state("3"),
    "sensor.washer_current_status": state("running"),
  });
  assert.equal(card._config.appliance, "washer");
}

function testAutoDetectionPrefersSpecificComboOnSharedPrefix() {
  const card = new Card();
  card.setConfig({});
  card.hass = hass({
    "sensor.washcombo_main_current_status": state("running"),
    "sensor.washcombo_main_remaining_time": state("00:42:00"),
  });
  assert.equal(card._config.appliance, "washer_combo");
}

function testNoMatchDoesNotInventADishwasher() {
  const card = new Card();
  card.setConfig({});
  card.hass = hass({ "sensor.outdoor_temperature": state("21") });
  assert.equal(card._definition, undefined);
  assert.equal(card._config.appliance, undefined);
}

function testHideEntitiesSuppressesDetailsAndChips() {
  const card = new Card();
  card.setConfig({ appliance: "washer", hide_entities: ["cycle_count", "door"] });
  card.hass = hass({
    "sensor.washer_current_status": state("running"),
    "sensor.washer_cycles": state("42"),
    "binary_sensor.washer_door": state("on"),
  });
  assert.equal(card._formatValue({ key: "cycle_count", format: "number" }), null);
  assert.equal(card._renderChip({ key: "door", active: "Open", inactive: "Closed" }), null);
  assert.equal(card._stateObj("door"), undefined);
  assert.throws(
    () => new Card().setConfig({ appliance: "washer", hide_entities: "door" }),
    /hide_entities must be a list/,
  );
}

function testDetailsUseFriendlyNameWithConfiguredLabelFallback() {
  const card = new Card();
  card.setConfig({ appliance: "washer" });
  card.hass = hass({
    "sensor.washer_current_status": state("running"),
    "sensor.washer_cycles": state("42", "Laundry cycles"),
  });
  const friendly = stringsIn(card._renderDetails());
  assert(friendly.includes("Laundry cycles"));
  assert(!friendly.includes("Cycles"));

  card.hass = hass({
    "sensor.washer_current_status": state("running"),
    "sensor.washer_cycles": state("42"),
  });
  const fallback = stringsIn(card._renderDetails());
  assert(fallback.includes("Cycles"));
}

testAutoDetectsRefrigeratorInsteadOfDefaultingToDishwasher();
testExplicitApplianceStillWins();
testAutoDetectionPrefersSpecificComboOnSharedPrefix();
testNoMatchDoesNotInventADishwasher();
testHideEntitiesSuppressesDetailsAndChips();
testDetailsUseFriendlyNameWithConfiguredLabelFallback();
console.log("card tests passed");
