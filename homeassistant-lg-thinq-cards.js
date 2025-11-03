const VERSION = "0.4.3";

/* eslint-disable no-console */
console.info(
	`%cHomeAssistant LG ThinQ Cards%c ${VERSION}`,
	"color: #8df427; font-weight: 600;",
	"color: inherit; font-weight: 500;"
);

const litBase = window.LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));

if (!litBase) {
	throw new Error("Unable to locate LitElement base class for LG ThinQ cards");
}

const html = litBase.prototype?.html || window.html;
const css = litBase.prototype?.css || window.css;

if (!html || !css) {
	throw new Error("Lit helpers unavailable: ensure Home Assistant 2023.10+ is running");
}

const UNAVAILABLE = new Set(["unknown", "unavailable", "none", "", "idle"]);
const DEFAULT_ACTIVE_STATES = ["on", "true", "open", "running", "active", "enabled", "start", "started"];
const PASSIVE_STATES = ["off", "standby", "ready", "idle", "complete", "completed", "done", "finished", "end", "ended", "paused", "pause"];

const APPLIANCES = {
	dishwasher: {
		label: "Dishwasher",
		icon: "mdi:dishwasher",
		accent: { start: "#00b4d8", end: "#0077b6" },
		keywords: ["dishwasher"],
		defaultPrefixes: ["dishwasher"],
		meter: { remaining: "remaining_time", total: "initial_time", percent: "progress" },
		chips: [
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }),
			chipMeta("power", "mdi:power", { active: "Powered", hideInactive: true }),
			chipMeta("rinse_refill", "mdi:blur", { active: "Rinse aid low", inactive: "Rinse aid ok", hideInactive: true }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("cycle", "Program", "mdi:tune-vertical-variant"),
			detailRow("remaining_time", "Time left", "mdi:clock-outline", "duration"),
			detailRow("delayed_start", "Delay start", "mdi:clock-alert-outline", "duration", { optional: true }),
			detailRow("softening_level", "Softening level", "mdi:creation", "text", { optional: true }),
			detailRow("temperature", "Water temp", "mdi:thermometer", "temperature", { optional: true }),
			detailRow("rinse_refill", "Rinse aid", "mdi:water", "binary", { optional: true, labels: { on: "Needs refill", off: "OK" } }),
			detailRow("salt_refill", "Salt", "mdi:shaker-outline", "binary", { optional: true, labels: { on: "Needs refill", off: "OK" } }),
			detailRow("steam_option", "Steam", "mdi:weather-fog", "binary", { optional: true, labels: { on: "Enabled", off: "Disabled" } }),
			detailRow("dual_zone", "Dual zone", "mdi:circle-double", "binary", { optional: true, labels: { on: "Enabled", off: "Disabled" } }),
			detailRow("extra_dry", "Extra dry", "mdi:weather-sunny-alert", "binary", { optional: true, labels: { on: "Enabled", off: "Disabled" } }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status", "current_state", "run_state", "process_state"]),
			cycle: entityMeta("sensor", ["current_cycle", "current_course", "job_state"]),
			remaining_time: entityMeta("sensor", ["remaining_time", "time_display", "remain"]),
			delayed_start: entityMeta("sensor", ["delayed_start", "delay_start", "relative_to_start_wm"], true),
			softening_level: entityMeta("sensor", ["softening_level"], true),
			temperature: entityMeta("sensor", ["target_temperature", "water_temperature"], true),
			power: entityMeta("switch", ["power", "operation_mode"], true),
			door: entityMeta("binary_sensor", ["door", "door_open"], false, true),
			rinse_refill: entityMeta(["binary_sensor", "sensor"], ["rinse_refill_needed", "rinse_refill", "rinse_aid"], true),
			salt_refill: entityMeta(["binary_sensor", "sensor"], ["salt_refill_needed", "salt_refill"], true),
			steam_option: entityMeta(["sensor", "switch"], ["steam_option", "steam"], true),
			dual_zone: entityMeta(["sensor", "switch"], ["dual_zone", "dual_zone_option"], true),
			extra_dry: entityMeta(["sensor", "switch"], ["extra_dry", "night_dry", "turbo_option"], true),
			initial_time: entityMeta("sensor", ["initial_time", "total_time", "course_total_time"], true),
			progress: entityMeta("sensor", ["progress", "completion_rate", "progress_percent"], true),
		},
	},
	washer: {
		label: "Washer",
		icon: "mdi:washing-machine",
		accent: { start: "#4ecdc4", end: "#2a9d8f" },
		keywords: ["washer", "wash"],
		defaultPrefixes: ["washer", "washtower_washer", "washcombo_main"],
		meter: { remaining: "remaining_time", total: "initial_time", percent: "progress" },
		chips: [
			chipMeta("door", "mdi:door", { active: "Door unlocked", inactive: "Door locked" }),
			chipMeta("remote_start", "mdi:wifi", { active: "Remote start" }, { tone: "soft" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("cycle", "Cycle", "mdi:tune-vertical-variant"),
			detailRow("remaining_time", "Time left", "mdi:clock-outline", "duration"),
			detailRow("delayed_start", "Delay start", "mdi:clock-alert-outline", "duration", { optional: true }),
			detailRow("water_temp", "Water", "mdi:thermometer", "text", { optional: true }),
			detailRow("spin_speed", "Spin", "mdi:rotate-right", "text", { optional: true }),
			detailRow("cycle_count", "Cycles", "mdi:counter", "number", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status", "current_state", "run_state"]),
			cycle: entityMeta("sensor", ["current_cycle", "current_course", "job_state"]),
			remaining_time: entityMeta("sensor", ["remaining_time", "time_display", "remain"]),
			delayed_start: entityMeta("sensor", ["delayed_start", "delay_start", "relative_to_start_wm"], true),
			water_temp: entityMeta("sensor", ["water_temp", "water_temperature"], true),
			spin_speed: entityMeta("sensor", ["spin_speed", "spin_level", "spin"], true),
			cycle_count: entityMeta("sensor", ["cycle_count", "cycles"], true),
			door: entityMeta("binary_sensor", ["door", "door_lock"], false, true),
			remote_start: entityMeta("binary_sensor", ["remote_start", "remote_operation"], true),
			initial_time: entityMeta("sensor", ["initial_time", "total_time", "course_total_time"], true),
			progress: entityMeta("sensor", ["progress", "completion_rate", "progress_percent"], true),
		},
	},
	dryer: {
		label: "Dryer",
		icon: "mdi:tumble-dryer",
		accent: { start: "#f4a261", end: "#e76f51" },
		keywords: ["dryer"],
		defaultPrefixes: ["dryer", "washtower_dryer"],
		meter: { remaining: "remaining_time", total: "initial_time", percent: "progress" },
		chips: [
			chipMeta("remote_start", "mdi:wifi", { active: "Remote start" }, { tone: "soft" }),
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("cycle", "Program", "mdi:tune-vertical-variant", "text", { optional: true }),
			detailRow("remaining_time", "Time left", "mdi:clock-outline", "duration"),
			detailRow("delayed_start", "Delay start", "mdi:clock-alert-outline", "duration", { optional: true }),
			detailRow("dry_level", "Dry level", "mdi:air-filter", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status", "current_state", "run_state"]),
			cycle: entityMeta("sensor", ["current_cycle", "current_course", "job_state"], true),
			remaining_time: entityMeta("sensor", ["remaining_time", "time_display", "remain"]),
			delayed_start: entityMeta("sensor", ["delayed_start", "delay_start", "relative_to_start_wm"], true),
			dry_level: entityMeta("sensor", ["dry_level", "dryness_level"], true),
			door: entityMeta("binary_sensor", ["door", "door_open"], false, true),
			remote_start: entityMeta("binary_sensor", ["remote_start", "remote_operation"], true),
			initial_time: entityMeta("sensor", ["initial_time", "total_time", "course_total_time"], true),
			progress: entityMeta("sensor", ["progress", "completion_rate", "progress_percent"], true),
		},
	},
	washer_combo: {
		label: "WashTower",
		icon: "mdi:washing-machine",
		accent: { start: "#8e2de2", end: "#4a00e0" },
		keywords: ["washcombo", "washer", "dryer"],
		defaultPrefixes: ["washcombo_main", "washer_dryer", "washcombo"],
		meter: { remaining: "remaining_time", total: "initial_time", percent: "progress" },
		chips: [
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }),
			chipMeta("remote_start", "mdi:wifi", { active: "Remote start" }, { tone: "soft" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("cycle", "Program", "mdi:tune-vertical-variant"),
			detailRow("remaining_time", "Time left", "mdi:clock-outline", "duration"),
			detailRow("delayed_start", "Delay start", "mdi:clock-alert-outline", "duration", { optional: true }),
			detailRow("dry_level", "Dry level", "mdi:air-filter", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status", "current_state", "run_state"]),
			cycle: entityMeta("sensor", ["current_cycle", "current_course", "job_state"]),
			remaining_time: entityMeta("sensor", ["remaining_time", "time_display", "remain"]),
			delayed_start: entityMeta("sensor", ["delayed_start", "delay_start", "relative_to_start_wm"], true),
			dry_level: entityMeta("sensor", ["dry_level", "dryness_level"], true),
			door: entityMeta("binary_sensor", ["door", "door_lock"], false, true),
			remote_start: entityMeta("binary_sensor", ["remote_start", "remote_operation"], true),
			initial_time: entityMeta("sensor", ["initial_time", "total_time", "course_total_time"], true),
			progress: entityMeta("sensor", ["progress", "completion_rate", "progress_percent"], true),
		},
	},
	mini_washer: {
		label: "Mini washer",
		icon: "mdi:washing-machine",
		accent: { start: "#ff9a9e", end: "#fad0c4" },
		keywords: ["mini", "wash"],
		defaultPrefixes: ["washcombo_mini", "mini_washer", "mini"],
		meter: { remaining: "remaining_time", total: "initial_time", percent: "progress" },
		chips: [
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("cycle", "Cycle", "mdi:tune-vertical-variant", "text", { optional: true }),
			detailRow("remaining_time", "Time left", "mdi:clock-outline", "duration"),
			detailRow("delayed_start", "Delay start", "mdi:clock-alert-outline", "duration", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status", "current_state", "run_state"]),
			cycle: entityMeta("sensor", ["current_cycle", "current_course", "job_state"], true),
			remaining_time: entityMeta("sensor", ["remaining_time", "time_display", "remain"]),
			delayed_start: entityMeta("sensor", ["delayed_start", "delay_start", "relative_to_start_wm"], true),
			door: entityMeta("binary_sensor", ["door", "door_lock"], false, true),
			initial_time: entityMeta("sensor", ["initial_time", "total_time", "course_total_time"], true),
			progress: entityMeta("sensor", ["progress", "completion_rate", "progress_percent"], true),
		},
	},
	fridge: {
		label: "Refrigerator",
		icon: "mdi:fridge",
		accent: { start: "#00c6ff", end: "#0072ff" },
		keywords: ["fridge", "refrigerator"],
		defaultPrefixes: ["refrigerator", "fridge"],
		chips: [
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }),
			chipMeta("express_freeze", "mdi:snowflake", { active: "Express freeze" }, { tone: "soft", hideInactive: true }),
			chipMeta("express_cool", "mdi:fridge", { active: "Express cool" }, { tone: "soft", hideInactive: true }),
		],
		details: [
			detailRow("fridge_temp", "Fridge", "mdi:thermometer", "temperature", { group: "Temperatures" }),
			detailRow("freezer_temp", "Freezer", "mdi:thermometer-low", "temperature", { group: "Temperatures" }),
			detailRow("fresh_air_filter", "Fresh air filter", "mdi:air-filter", "text", { optional: true }),
			detailRow("water_filter_state", "Water filter", "mdi:water", "text", { optional: true }),
		],
		entities: {
			door: entityMeta("binary_sensor", ["door", "door_open"], false),
			express_freeze: entityMeta("switch", ["express_mode", "express_freeze"], true),
			express_cool: entityMeta("switch", ["express_fridge", "express_cool"], true),
			fridge_temp: entityMeta("sensor", ["fridge_temperature", "fridge_temp", "temperature_fridge"]),
			freezer_temp: entityMeta("sensor", ["freezer_temperature", "freezer_temp", "temperature_freezer"]),
			fresh_air_filter: entityMeta("sensor", ["fresh_air_filter"], true),
			water_filter_state: entityMeta("sensor", ["water_filter_state", "water_filter_usage", "water_filter"], true),
		},
	},
};

	function entityMeta(domain, suffixes, optional = false, capturePrefix = true) {
	  const domains = Array.isArray(domain) ? domain : [domain];
	  return { domains, suffixes, optional, capturePrefix };
	}

	function detailRow(key, label, icon, format = "text", options = {}) {
	  const { optional = false, group, labels } = options;
	  return { key, label, icon, format, optional, group, labels };
	}

	function chipMeta(key, icon, labels, options = {}) {
	  return {
	    key,
	    icon,
	    active: labels?.active ?? "On",
	    inactive: labels?.inactive ?? "Off",
	    hideInactive: Boolean(labels?.hideInactive ?? options.hideInactive),
	    tone: options.tone ?? "solid",
	    activeStates: options.activeStates,
	    inactiveStates: options.inactiveStates,
	  };
	}

	function normalize(value) {
	  return typeof value === "string" ? value.trim().toLowerCase() : value;
	}

	function prettifyText(value) {
	  if (typeof value !== "string") {
	    return value;
	  }
	  const trimmed = value.trim();
	  if (!trimmed) {
	    return trimmed;
	  }
	  const lower = trimmed.toLowerCase();
	  const softening = lower.match(/^softeninglevel[_\s-]?(\d+)/);
	  if (softening) {
	    return `Level ${softening[1]}`;
	  }
	  if (lower === "on" || lower === "off") {
	    return lower === "on" ? "On" : "Off";
	  }
	  const withSpaces = trimmed.replace(/[_-]+/g, " ");
	  return withSpaces.replace(/\b\w/g, (match) => match.toUpperCase());
	}

	function formatBoolean(value, labels) {
	  const normalized = normalize(value);
	  if (labels && normalized != null && Object.prototype.hasOwnProperty.call(labels, normalized)) {
	    return labels[normalized];
	  }
	  if (["on", "true", "open", "enabled"].includes(normalized)) {
	    return "On";
	  }
	  if (["off", "false", "closed", "disabled"].includes(normalized)) {
	    return "Off";
	  }
	  return prettifyText(value);
	}

	function clamp(value, min, max) {
	  return Math.min(Math.max(value, min), max);
	}

	function parseDurationToSeconds(value) {
	  if (value == null) {
	    return null;
	  }
	  const raw = String(value).trim();
	  if (!raw || UNAVAILABLE.has(normalize(raw))) {
	    return null;
	  }
	  const hhmm = raw.match(/^(\d{1,2}):(\d{2})$/);
	  if (hhmm) {
	    const hours = Number(hhmm[1]);
	    const minutes = Number(hhmm[2]);
	    return (hours * 60 + minutes) * 60;
	  }
	  const mmss = raw.match(/^(\d{1,2})m\s*(\d{1,2})s$/i);
	  if (mmss) {
	    const minutes = Number(mmss[1]);
	    const seconds = Number(mmss[2]);
	    return minutes * 60 + seconds;
	  }
	const iso = raw.match(/^P(?:T)?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
	  if (iso) {
	    const hours = Number(iso[1] ?? 0);
	    const minutes = Number(iso[2] ?? 0);
	    const seconds = Number(iso[3] ?? 0);
	    return hours * 3600 + minutes * 60 + seconds;
	  }
	const timestamp = Date.parse(raw);
	if (!Number.isNaN(timestamp)) {
	  const diff = Math.round((timestamp - Date.now()) / 1000);
	  return diff >= 0 ? diff : 0;
	}
	  const numeric = Number(raw);
	  if (!Number.isNaN(numeric)) {
	    const seconds = numeric >= 3600 ? numeric : numeric * 60;
	    return seconds >= 0 ? seconds : null;
	  }
	  return null;
	}

	function formatDurationShort(seconds) {
	  if (seconds == null || Number.isNaN(seconds)) {
	    return null;
	  }
	const total = Math.max(0, Math.round(seconds));
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const remainingSeconds = total % 60;
	if (hours && minutes) {
	  return `${hours}h ${minutes}m`;
	}
	if (hours) {
	  return `${hours}h`;
	}
	if (minutes) {
	  return `${minutes}m`;
	}
	if (remainingSeconds) {
	  return `${remainingSeconds}s`;
	}
	return "Done";
	}

	function formatNumber(value, stateObj) {
	  const num = Number(value);
	  if (Number.isFinite(num)) {
	    const unit = stateObj?.attributes?.unit_of_measurement;
	    return unit ? `${num} ${unit}` : String(num);
	  }
	  return value;
	}

	function isTruthyState(value) {
	if (value == null) {
	  return false;
	}
	const normalized = normalize(value);
	if (normalized == null) {
	  return false;
	}
	if (UNAVAILABLE.has(normalized)) {
	  return false;
	}
	if (PASSIVE_STATES.includes(normalized)) {
	  return false;
	}
	if (DEFAULT_ACTIVE_STATES.includes(normalized)) {
	  return true;
	}
	if (/ing$/.test(normalized)) {
	  return true;
	}
	return false;
	}

	class LGThinQCardBase extends litBase {
	  static get properties() {
	    return { hass: {} };
	  }

	  constructor() {
	    super();
	    this.hass = undefined;
	    this._config = {};
	    this._definition = undefined;
	    this._resolved = {};
		this._autoPrefix = undefined;
		this._meterState = { baseline: null, lastRemaining: null };
	  }

	  setConfig(config = {}) {
	    const forced = this.constructor.applianceType;
	    const requested = config.appliance ?? forced ?? "dishwasher";
	    const key = String(requested).toLowerCase();
	    const definition = APPLIANCES[key];
	    if (!definition) {
	      throw new Error(`Unsupported appliance type: ${requested}`);
	    }
	    this._config = { ...config, appliance: key };
	    this._definition = definition;
	    this._resolved = {};
	    this._autoPrefix = config.entity_prefix ?? undefined;
		this._meterState = { baseline: null, lastRemaining: null };
	  }

	  set hass(value) {
	    this.__hass = value;
	    if (!value || !this._definition) {
	      return;
	    }
	    this._resolveEntities();
	    this.requestUpdate();
	  }

	  get hass() {
	    return this.__hass;
	  }

	  _resolveEntities() {
	    const hass = this.hass;
	    if (!hass || !this._definition) {
	      return;
	    }
	    const overrides = this._config.entities ?? {};
	    const resolved = { ...this._resolved };
	    const prefixes = new Set();

	    if (this._autoPrefix) {
	      prefixes.add(this._autoPrefix);
	    }
	    if (this._config.entity_prefix) {
	      prefixes.add(this._config.entity_prefix);
	    }
	    for (const prefix of this._definition.defaultPrefixes ?? []) {
	      prefixes.add(prefix);
	    }

	    const keywordSet = new Set(this._definition.keywords ?? []);

	    for (const [key, meta] of Object.entries(this._definition.entities)) {
	      if (overrides[key]) {
	        resolved[key] = overrides[key];
	        continue;
	      }
	      const current = resolved[key];
	      if (current && hass.states[current]) {
	        continue;
	      }
	      const candidate = this._findEntity(meta, prefixes, keywordSet);
	      if (candidate) {
	        resolved[key] = candidate;
	        if (meta.capturePrefix !== false) {
	          const derived = this._extractPrefix(candidate, meta.suffixes);
	          if (derived && !prefixes.has(derived)) {
	            prefixes.add(derived);
	            this._autoPrefix = derived;
	          }
	        }
	      } else if (!Object.prototype.hasOwnProperty.call(resolved, key)) {
	        resolved[key] = null;
	      }
	    }

	    this._resolved = resolved;
	  }

	  _findEntity(meta, prefixes, keywords) {
	    const hass = this.hass;
	    if (!hass) {
	      return null;
	    }
		const domains = meta.domains ?? [];
		const suffixes = meta.suffixes ?? [];
		for (const domain of domains) {
		  for (const prefix of prefixes) {
		    for (const suffix of suffixes) {
		      const candidate = `${domain}.${prefix}_${suffix}`;
		      if (hass.states[candidate]) {
		        return candidate;
		      }
		      const compact = `${domain}.${prefix}${suffix}`;
		      if (hass.states[compact]) {
		        return compact;
		      }
		    }
		  }
		}

		const matches = [];
		for (const entityId of Object.keys(hass.states)) {
		  const [domain] = entityId.split(".");
		  if (!domains.includes(domain)) {
		    continue;
		  }
		  const stem = entityId.slice(domain.length + 1);
		  if (suffixes.length && !suffixes.some((suffix) => stem.endsWith(`_${suffix}`) || stem.endsWith(suffix))) {
		    continue;
		  }
		  if (keywords.size) {
		    const stemLower = stem.toLowerCase();
		    if (![...keywords].some((word) => stemLower.includes(word))) {
		      continue;
		    }
		  }
		  matches.push(entityId);
		}

		if (matches.length) {
		  matches.sort((a, b) => a.length - b.length);
		  return matches[0];
		}

		return null;
	  }

	  _extractPrefix(entityId, suffixes = []) {
	    const [, stem] = entityId.split(".");
	    if (!stem) {
	      return null;
	    }
	    for (const suffix of suffixes) {
	      const target = `_${suffix}`;
	      if (stem.endsWith(target)) {
	        return stem.slice(0, -target.length);
	      }
	      if (stem.endsWith(suffix) && stem.length > suffix.length) {
	        return stem.slice(0, -suffix.length);
	      }
	    }
	    const idx = stem.indexOf("_");
	    return idx > 0 ? stem.slice(0, idx) : stem;
	  }

	  _stateObj(key) {
	    const id = this._resolved[key];
	    return id ? this.hass.states[id] : undefined;
	  }

	  _stateValue(key) {
	    return this._stateObj(key)?.state;
	  }

	  _formatValue(detail) {
	    const stateObj = this._stateObj(detail.key);
	    if (!stateObj) {
	      return null;
	    }
	    const raw = stateObj.state;
	    if (UNAVAILABLE.has(normalize(raw))) {
	      return null;
	    }

		switch (detail.format) {
		  case "duration": {
		    const seconds = parseDurationToSeconds(raw);
		    if (seconds != null) {
		      return formatDurationShort(seconds);
		    }
		    return detail.labels?.[normalize(raw)] ?? prettifyText(raw);
		  }
		  case "temperature":
		    return formatNumber(raw, stateObj);
		  case "number":
		    return formatNumber(raw, stateObj);
		  case "binary":
		    return formatBoolean(raw, detail.labels);
		  default:
		    if (detail.labels && detail.labels[normalize(raw)] != null) {
		      return detail.labels[normalize(raw)];
		    }
		    return prettifyText(raw);
		}
	  }

	_buildProgress() {
		const config = this._definition.meter;
		if (!config) {
			return null;
		}

		const meterState = this._meterState ?? (this._meterState = { baseline: null, lastRemaining: null });
		const statusValue = this._stateValue("status");
		const isActive = isTruthyState(statusValue);

		if (!isActive && meterState.baseline != null) {
			meterState.baseline = null;
			meterState.lastRemaining = null;
		}

		const remainingSeconds = parseDurationToSeconds(this._stateValue(config.remaining));
		const totalSeconds = parseDurationToSeconds(this._stateValue(config.total));
		const percentRaw = Number(this._stateValue(config.percent));
		let percent = null;

		if (totalSeconds != null && totalSeconds > 0 && remainingSeconds != null) {
			percent = clamp(((totalSeconds - remainingSeconds) / totalSeconds) * 100, 0, 100);
			meterState.baseline = totalSeconds;
			meterState.lastRemaining = remainingSeconds;
		}

		if (percent == null && Number.isFinite(percentRaw)) {
			percent = clamp(percentRaw, 0, 100);
			if (remainingSeconds != null && percent > 0 && percent < 100) {
				const estimated = remainingSeconds / (1 - percent / 100);
				if (Number.isFinite(estimated) && estimated > 0) {
					meterState.baseline = estimated;
				}
			}
		}

		if (percent == null && remainingSeconds != null) {
			if (
				meterState.baseline == null ||
				meterState.baseline <= 0 ||
				(meterState.lastRemaining != null && remainingSeconds > meterState.lastRemaining + 60)
			) {
				meterState.baseline = remainingSeconds;
			} else if (remainingSeconds > meterState.baseline) {
				meterState.baseline = remainingSeconds;
			}

			meterState.lastRemaining = remainingSeconds;

			if (meterState.baseline && meterState.baseline > 0) {
				percent = clamp(((meterState.baseline - remainingSeconds) / meterState.baseline) * 100, 0, 100);
			}
		} else if (remainingSeconds == null) {
			meterState.lastRemaining = null;
		}

		if (percent == null) {
			return null;
		}

		if (remainingSeconds != null && remainingSeconds <= 0) {
			meterState.baseline = null;
		}

		const label = remainingSeconds != null ? `${formatDurationShort(remainingSeconds)} left` : null;
		return { percent, label };
	}

	  _renderChips() {
	    const chips = (this._definition.chips ?? [])
	      .map((chip) => this._renderChip(chip))
	      .filter(Boolean);

	    if (!chips.length) {
	      return null;
	    }

	    return html`<div class="lg-thinq__chips">${chips}</div>`;
	  }

	  _renderChip(chip) {
	    const stateObj = this._stateObj(chip.key);
	    const value = stateObj?.state;
		if (value == null) {
	      return null;
	    }
	    const normalized = normalize(value);
		if (normalized != null && UNAVAILABLE.has(normalized)) {
		  return null;
		}
	    const activeStates = chip.activeStates ?? DEFAULT_ACTIVE_STATES;
	    const inactiveStates = chip.inactiveStates ?? ["off", "false", "closed", "disabled", "locked"];
	    const isActive = activeStates.includes(normalized);

	    if (!isActive && chip.hideInactive) {
	      return null;
	    }

	    const label = isActive ? chip.active : chip.inactive;
	    const variant = isActive ? "active" : "inactive";
	    const tone = chip.tone === "soft" ? "soft" : "solid";

	    return html`
	      <div class="lg-thinq__chip lg-thinq__chip--${variant} lg-thinq__chip--${tone}">
	        <ha-icon icon=${chip.icon}></ha-icon>
	        <span>${label}</span>
	      </div>
	    `;
	  }

	  _renderDetails() {
	    const details = this._definition.details ?? [];
	    if (!details.length) {
	      return null;
	    }

	    const groups = new Map();

	    for (const detail of details) {
	      const value = this._formatValue(detail);
	      if (value == null && detail.optional) {
	        continue;
	      }
	      if (value == null && !detail.optional) {
	        continue;
	      }

	      const group = detail.group ?? "Details";
	      if (!groups.has(group)) {
	        groups.set(group, []);
	      }
	      groups.get(group).push(
	        html`
	          <div class="lg-thinq__detail-row">
	            ${detail.icon ? html`<ha-icon icon=${detail.icon}></ha-icon>` : null}
	            <span class="lg-thinq__detail-label">${detail.label}</span>
	            <span class="lg-thinq__detail-value">${value ?? "—"}</span>
	          </div>
	        `
	      );
	    }

	    if (!groups.size) {
	      return null;
	    }

	    return html`
	      <div class="lg-thinq__sections">
	        ${[...groups.entries()].map(([group, rows]) => html`
	          <div class="lg-thinq__section">
	            ${group !== "Details" ? html`<div class="lg-thinq__section-title">${group}</div>` : null}
	            <div class="lg-thinq__section-content">${rows}</div>
	          </div>
	        `)}
	      </div>
	    `;
	  }

	  render() {
	    if (!this._definition) {
	      return html``;
	    }

		const header = this._config.title ?? this._config.name ?? this._definition.label;
		const accent = this._definition.accent ?? { start: "#8df427", end: "#4caf50" };
		const statusValue = this._stateValue("status");
		const statusNormalized = statusValue != null ? normalize(statusValue) : null;
		const status = statusNormalized && !UNAVAILABLE.has(statusNormalized) ? prettifyText(statusValue) : null;
		const cycle = this._formatValue({ key: "cycle", format: "text" });
		const progress = this._buildProgress();
		const chips = this._renderChips();
		const details = this._renderDetails();
		const isActive = isTruthyState(statusValue) || Boolean(progress && progress.percent > 0);
		const cardClasses = ["lg-thinq"];
		if (isActive) {
		  cardClasses.push("lg-thinq--active");
		}
		const statusClass = isActive ? "lg-thinq__status lg-thinq__status--active" : "lg-thinq__status";

	    return html`
		  <ha-card class=${cardClasses.join(" ")} style=${`--lg-accent-start:${accent.start}; --lg-accent-end:${accent.end};`}>
	        <div class="lg-thinq__hero">
	          <div class="lg-thinq__hero-icon">
	            <ha-icon icon=${this._definition.icon}></ha-icon>
	          </div>
	          <div class="lg-thinq__hero-text">
	            <div class="lg-thinq__headline">${header}</div>
		        ${status ? html`<div class=${statusClass}>${status}</div>` : null}
	            ${cycle && cycle !== status ? html`<div class="lg-thinq__substatus">${cycle}</div>` : null}
	          </div>
	        </div>

	        ${progress
	          ? html`
	              <div class="lg-thinq__progress">
	                <div class="lg-thinq__progress-track">
	                  <div class="lg-thinq__progress-value" style=${`width: ${clamp(progress.percent, 0, 100)}%;`}></div>
	                </div>
	                ${progress.label ? html`<div class="lg-thinq__progress-label">${progress.label}</div>` : null}
	              </div>
	            `
	          : null}

	        ${chips}
	        ${details}
	      </ha-card>
	    `;
	  }

	  static get styles() {
	    return css`
	      :host {
	        display: block;
	      }

	      .lg-thinq {
	        padding: 0;
	        overflow: hidden;
	        transition: box-shadow 0.4s ease;
	      }

	      .lg-thinq--active {
	        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
	      }

	      .lg-thinq__hero {
	        display: flex;
	        align-items: center;
	        gap: 16px;
	        padding: 20px;
	        background: linear-gradient(135deg, var(--lg-accent-start), var(--lg-accent-end));
	        color: #fff;
	        background-size: 150% 150%;
	      }

      .lg-thinq--active .lg-thinq__hero {
        animation: lg-thinq-hero-shift 6s ease-in-out infinite;
      }

      .lg-thinq__hero-icon {
        display: grid;
        place-items: center;
        width: 64px;
        height: 64px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.18);
      }

      .lg-thinq--active .lg-thinq__hero-icon {
        animation: lg-thinq-icon-pop 1.8s ease-in-out infinite;
      }	      .lg-thinq__hero-icon ha-icon {
	        --mdc-icon-size: 36px;
	        color: #fff;
	      }

	      .lg-thinq__headline {
	        font-size: 1.2rem;
	        font-weight: 600;
	      }

	      .lg-thinq__status {
	        font-size: 0.95rem;
	        font-weight: 500;
	      }

      .lg-thinq__status--active {
        animation: lg-thinq-status-pulse 2s ease-in-out infinite;
      }

      .lg-thinq__substatus {
        font-size: 0.85rem;
        opacity: 0.85;
      }

      .lg-thinq__progress {
        padding: 16px 20px 8px;
      }

      .lg-thinq__progress-track {
        position: relative;
        width: 100%;
        height: 8px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }

      .lg-thinq__progress-value {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(135deg, var(--lg-accent-start), var(--lg-accent-end));
        transition: width 0.35s ease;
      }

      .lg-thinq--active .lg-thinq__progress-value {
        animation: lg-thinq-progress-flow 1.5s linear infinite;
      }	      .lg-thinq__progress-label {
	        margin-top: 8px;
	        font-size: 0.85rem;
	        color: var(--secondary-text-color);
	      }

	      .lg-thinq__chips {
	        display: flex;
	        flex-wrap: wrap;
	        gap: 8px;
	        padding: 0 20px 12px;
	      }

	      .lg-thinq__chip {
	        display: inline-flex;
	        align-items: center;
	        gap: 6px;
	        padding: 6px 12px;
	        border-radius: 999px;
	        font-size: 0.8rem;
	        font-weight: 500;
	      }

      .lg-thinq--active .lg-thinq__chip--active {
        animation: lg-thinq-chip-pop 2.5s ease-in-out infinite;
      }	      .lg-thinq__chip ha-icon {
	        --mdc-icon-size: 18px;
	      }

	      .lg-thinq__chip--active.lg-thinq__chip--solid {
	        background: linear-gradient(135deg, var(--lg-accent-start), var(--lg-accent-end));
	        color: #fff;
	      }

	      .lg-thinq__chip--inactive.lg-thinq__chip--solid {
	        background: rgba(0, 0, 0, 0.08);
	        color: var(--secondary-text-color);
	      }

	      .lg-thinq__chip--active.lg-thinq__chip--soft {
	        background: rgba(33, 150, 243, 0.12);
	        color: var(--primary-text-color);
	      }

	      .lg-thinq__chip--inactive.lg-thinq__chip--soft {
	        background: rgba(0, 0, 0, 0.05);
	        color: var(--secondary-text-color);
	      }

	      .lg-thinq__sections {
	        padding: 8px 0 16px;
	      }

	      .lg-thinq__section + .lg-thinq__section {
	        margin-top: 12px;
	      }

	      .lg-thinq__section-title {
	        padding: 0 20px;
	        font-size: 0.75rem;
	        text-transform: uppercase;
	        letter-spacing: 0.08em;
	        color: var(--secondary-text-color);
	      }

	      .lg-thinq__section-content {
	        display: flex;
	        flex-direction: column;
	        gap: 6px;
	        padding: 0 20px;
	      }

	      .lg-thinq__detail-row {
	        display: flex;
	        align-items: center;
	        gap: 10px;
	        padding: 8px 0;
	        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
	      }

	      .lg-thinq__detail-row:last-child {
	        border-bottom: none;
	      }

	      .lg-thinq__detail-row ha-icon {
	        --mdc-icon-size: 20px;
	        color: var(--secondary-text-color);
	      }

	      .lg-thinq__detail-label {
	        font-weight: 500;
	        color: var(--primary-text-color);
	      }

	      .lg-thinq__detail-value {
	        margin-left: auto;
	        font-weight: 500;
	        color: var(--secondary-text-color);
	      }

	      @keyframes lg-thinq-hero-shift {
	        0% {
	          background-position: 0% 50%;
	        }
	        50% {
	          background-position: 100% 50%;
	        }
	        100% {
	          background-position: 0% 50%;
	        }
	      }

	      @keyframes lg-thinq-progress-flow {
	        0% {
	          filter: brightness(1);
	        }
	        50% {
	          filter: brightness(1.15);
	        }
	        100% {
	          filter: brightness(1);
	        }
	      }

	      @keyframes lg-thinq-status-pulse {
	        0%, 100% {
	          opacity: 1;
	        }
	        50% {
	          opacity: 0.75;
	        }
	      }

	      @keyframes lg-thinq-icon-pop {
	        0%, 100% {
	          transform: scale(1);
	        }
	        50% {
	          transform: scale(1.04);
	        }
	      }

	      @keyframes lg-thinq-chip-pop {
	        0%, 100% {
	          transform: translateY(0);
	        }
	        50% {
	          transform: translateY(-1px);
	        }
	      }
	    `;
	  }
	}

	class LGThinQCard extends LGThinQCardBase {}

	class LGThinQDishwasherCard extends LGThinQCardBase {
	  static applianceType = "dishwasher";
	}

	class LGThinQWasherCard extends LGThinQCardBase {
	  static applianceType = "washer";
	}

	class LGThinQDryerCard extends LGThinQCardBase {
	  static applianceType = "dryer";
	}

	class LGThinQWasherComboCard extends LGThinQCardBase {
	  static applianceType = "washer_combo";
	}

	class LGThinQMiniWasherCard extends LGThinQCardBase {
	  static applianceType = "mini_washer";
	}

	class LGThinQFridgeCard extends LGThinQCardBase {
	  static applianceType = "fridge";
	}

	if (!customElements.get("lg-thinq-card")) {
	  customElements.define("lg-thinq-card", LGThinQCard);
	}

	if (!customElements.get("lg-thinq-dishwasher-card")) {
	  customElements.define("lg-thinq-dishwasher-card", LGThinQDishwasherCard);
	}

	if (!customElements.get("lg-thinq-washer-card")) {
	  customElements.define("lg-thinq-washer-card", LGThinQWasherCard);
	}

	if (!customElements.get("lg-thinq-dryer-card")) {
	  customElements.define("lg-thinq-dryer-card", LGThinQDryerCard);
	}

	if (!customElements.get("lg-thinq-washer-combo-card")) {
	  customElements.define("lg-thinq-washer-combo-card", LGThinQWasherComboCard);
	}

	if (!customElements.get("lg-thinq-mini-washer-card")) {
	  customElements.define("lg-thinq-mini-washer-card", LGThinQMiniWasherCard);
	}

	if (!customElements.get("lg-thinq-fridge-card")) {
	  customElements.define("lg-thinq-fridge-card", LGThinQFridgeCard);
	}

	export const homeAssistantLGThinQCardsVersion = VERSION;