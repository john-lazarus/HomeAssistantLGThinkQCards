const VERSION = "0.2.5";

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

const UNAVAILABLE = new Set(["unknown", "unavailable"]);
const DEFAULT_ACTIVE_STATES = ["on", "true", "open", "running", "active", "enabled", "start", "started"];
const PASSIVE_STATES = ["off", "power off", "power_off", "standby", "ready", "idle", "complete", "completed", "done", "finished", "end", "ended", "paused", "pause", "stopped", "stop"];

const APPLIANCES = {
	dishwasher: {
		label: "Dishwasher",
		icon: "mdi:dishwasher",
		accent: { start: "#00b4d8", end: "#0077b6" },
		keywords: ["dishwasher"],
		defaultPrefixes: ["dishwasher"],
		meter: { remaining: "remaining_time", total: "total_time" },
		chips: [
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }, { hideInactive: true }),
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
			status: entityMeta("sensor", ["current_status"]),
			cycle: entityMeta("sensor", ["current_cycle"]),
			remaining_time: entityMeta("sensor", ["remaining_time"]),
			delayed_start: entityMeta("sensor", ["delayed_start"], true),
			softening_level: entityMeta("sensor", ["softening_level"], true),
			temperature: entityMeta("sensor", ["target_temperature", "water_temperature"], true),
			power: entityMeta("switch", ["power"], true),
			door: entityMeta("binary_sensor", ["door"], false, true),
			rinse_refill: entityMeta("binary_sensor", ["rinse_refill_needed"], true),
			salt_refill: entityMeta("binary_sensor", ["salt_refill_needed"], true),
			steam_option: entityMeta(["sensor", "switch"], ["steam_option"], true),
			dual_zone: entityMeta(["sensor", "switch"], ["dual_zone"], true),
			extra_dry: entityMeta(["sensor", "switch"], ["extra_dry"], true),
			total_time: entityMeta("sensor", ["total_time"], true),
		},
	},
	washer: {
		label: "Washer",
		icon: "mdi:washing-machine",
		accent: { start: "#4ecdc4", end: "#2a9d8f" },
		keywords: ["washer", "wash"],
		defaultPrefixes: ["washer", "washtower_washer", "washcombo_main"],
		meter: { remaining: "remaining_time", total: "total_time" },
		chips: [
			chipMeta("door", "mdi:door", { active: "Door unlocked", inactive: "Door locked" }, { hideInactive: true }),
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
			status: entityMeta("sensor", ["current_status"]),
			cycle: entityMeta("sensor", ["current_cycle"]),
			remaining_time: entityMeta("sensor", ["remaining_time"]),
			delayed_start: entityMeta("sensor", ["delayed_start"], true),
			water_temp: entityMeta("sensor", ["water_temp"], true),
			spin_speed: entityMeta("sensor", ["spin_speed"], true),
			cycle_count: entityMeta("sensor", ["cycles"], true),
			door: entityMeta("binary_sensor", ["door"], false, true),
			remote_start: entityMeta("binary_sensor", ["remote_start"], true),
			total_time: entityMeta("sensor", ["total_time"], true),
		},
	},
	dryer: {
		label: "Dryer",
		icon: "mdi:tumble-dryer",
		accent: { start: "#f4a261", end: "#e76f51" },
		keywords: ["dryer"],
		defaultPrefixes: ["dryer", "washtower_dryer"],
		meter: { remaining: "remaining_time", total: "total_time" },
		chips: [
			chipMeta("remote_start", "mdi:wifi", { active: "Remote start" }, { tone: "soft" }),
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }, { hideInactive: true }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("cycle", "Program", "mdi:tune-vertical-variant", "text", { optional: true }),
			detailRow("remaining_time", "Time left", "mdi:clock-outline", "duration"),
			detailRow("delayed_start", "Delay start", "mdi:clock-alert-outline", "duration", { optional: true }),
			detailRow("dry_level", "Dry level", "mdi:air-filter", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"]),
			cycle: entityMeta("sensor", ["current_cycle"], true),
			remaining_time: entityMeta("sensor", ["remaining_time"]),
			delayed_start: entityMeta("sensor", ["delayed_start"], true),
			dry_level: entityMeta("sensor", ["dry_level"], true),
			door: entityMeta("binary_sensor", ["door"], false, true),
			remote_start: entityMeta("binary_sensor", ["remote_start"], true),
			total_time: entityMeta("sensor", ["total_time"], true),
		},
	},
	washer_combo: {
		label: "Clothes Washer Dryer Combo",
		icon: "mdi:washing-machine",
		accent: { start: "#8e2de2", end: "#4a00e0" },
		keywords: ["washcombo", "washer", "dryer"],
		defaultPrefixes: ["washcombo_main", "washer_dryer", "washcombo", "washerdryer"],
		meter: { remaining: "remaining_time", total: "total_time" },
		chips: [
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }, { hideInactive: true }),
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
			status: entityMeta("sensor", ["current_status"]),
			cycle: entityMeta("sensor", ["current_cycle"]),
			remaining_time: entityMeta("sensor", ["remaining_time"]),
			delayed_start: entityMeta("sensor", ["delayed_start"], true),
			dry_level: entityMeta("sensor", ["dry_level"], true),
			door: entityMeta("binary_sensor", ["door"], false, true),
			remote_start: entityMeta("binary_sensor", ["remote_start"], true),
			total_time: entityMeta("sensor", ["total_time"], true),
		},
	},
	mini_washer: {
		label: "Mini washer",
		icon: "mdi:washing-machine",
		accent: { start: "#ff9a9e", end: "#fad0c4" },
		keywords: ["mini", "wash"],
		defaultPrefixes: ["washcombo_mini", "mini_washer", "mini"],
		meter: { remaining: "remaining_time", total: "total_time" },
		chips: [
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }, { hideInactive: true }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("cycle", "Cycle", "mdi:tune-vertical-variant", "text", { optional: true }),
			detailRow("remaining_time", "Time left", "mdi:clock-outline", "duration"),
			detailRow("delayed_start", "Delay start", "mdi:clock-alert-outline", "duration", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"]),
			cycle: entityMeta("sensor", ["current_cycle"], true),
			remaining_time: entityMeta("sensor", ["remaining_time"]),
			delayed_start: entityMeta("sensor", ["delayed_start"], true),
			door: entityMeta("binary_sensor", ["door"], false, true),
			total_time: entityMeta("sensor", ["total_time"], true),
		},
	},
	washtower: {
		label: "Washtower",
		icon: "mdi:washing-machine",
		accent: { start: "#667eea", end: "#764ba2" },
		keywords: ["washtower", "tower"],
		defaultPrefixes: ["washtower"],
		meter: { remaining: "remaining_time", total: "total_time" },
		chips: [
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }, { hideInactive: true }),
			chipMeta("remote_start", "mdi:wifi", { active: "Remote start" }, { tone: "soft" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("cycle", "Cycle", "mdi:tune-vertical-variant"),
			detailRow("remaining_time", "Time left", "mdi:clock-outline", "duration"),
			detailRow("delayed_start", "Delay start", "mdi:clock-alert-outline", "duration", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"]),
			cycle: entityMeta("sensor", ["current_cycle"]),
			remaining_time: entityMeta("sensor", ["remaining_time"]),
			delayed_start: entityMeta("sensor", ["delayed_start"], true),
			door: entityMeta("binary_sensor", ["door"], false, true),
			remote_start: entityMeta("binary_sensor", ["remote_start"], true),
			total_time: entityMeta("sensor", ["total_time"], true),
		},
	},
	fridge: {
		label: "Refrigerator",
		icon: "mdi:fridge",
		accent: { start: "#00c6ff", end: "#0072ff" },
		keywords: ["fridge", "refrigerator"],
		defaultPrefixes: ["refrigerator", "fridge"],
		chips: [
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }, { hideInactive: true }),
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
	air_conditioner: {
		label: "Air Conditioner",
		icon: "mdi:air-conditioner",
		accent: { start: "#48c6ef", end: "#6f86d6" },
		keywords: ["ac", "air_conditioner", "aircon"],
		defaultPrefixes: ["air_conditioner", "ac"],
		chips: [
			chipMeta("power", "mdi:power", { active: "On", inactive: "Off" }),
			chipMeta("energy_saving", "mdi:leaf", { active: "Eco mode" }, { tone: "soft", hideInactive: true }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("current_temp", "Current temp", "mdi:thermometer", "temperature"),
			detailRow("target_temp", "Target temp", "mdi:thermometer", "temperature"),
			detailRow("humidity", "Humidity", "mdi:water-percent", "text", { optional: true }),
			detailRow("air_quality", "Air quality", "mdi:air-filter", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			power: entityMeta("switch", ["power"], true),
			energy_saving: entityMeta("switch", ["energy_saving"], true),
			current_temp: entityMeta("sensor", ["current_temperature", "temperature"], true),
			target_temp: entityMeta("sensor", ["target_temperature"], true),
			humidity: entityMeta("sensor", ["humidity"], true),
			air_quality: entityMeta("sensor", ["air_quality", "overall_air_quality"], true),
		},
	},
	air_purifier: {
		label: "Air Purifier",
		icon: "mdi:air-purifier",
		accent: { start: "#a8edea", end: "#fed6e3" },
		keywords: ["air_purifier", "purifier"],
		defaultPrefixes: ["air_purifier", "purifier"],
		chips: [
			chipMeta("power", "mdi:power", { active: "On", inactive: "Off" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine", "text", { optional: true }),
			detailRow("mode", "Mode", "mdi:tune", "text", { optional: true }),
			detailRow("air_quality", "Air quality", "mdi:air-filter", "text", { optional: true }),
			detailRow("pm25", "PM2.5", "mdi:molecule", "text", { optional: true }),
			detailRow("filter_life", "Filter life", "mdi:air-filter", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			power: entityMeta("switch", ["power"], true),
			mode: entityMeta("sensor", ["operating_mode"], true),
			air_quality: entityMeta("sensor", ["air_quality", "overall_air_quality"], true),
			pm25: entityMeta("sensor", ["pm2_5", "pm25"], true),
			filter_life: entityMeta("sensor", ["filter_remaining"], true),
		},
	},
	air_purifier_fan: {
		label: "Air Purifier Fan",
		icon: "mdi:fan",
		accent: { start: "#fbc2eb", end: "#a6c1ee" },
		keywords: ["air_purifier_fan", "purifier_fan"],
		defaultPrefixes: ["air_purifier_fan"],
		chips: [
			chipMeta("power", "mdi:power", { active: "On", inactive: "Off" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine", "text", { optional: true }),
			detailRow("mode", "Mode", "mdi:tune", "text", { optional: true }),
			detailRow("speed", "Speed", "mdi:speedometer", "text", { optional: true }),
			detailRow("air_quality", "Air quality", "mdi:air-filter", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			power: entityMeta("switch", ["power"], true),
			mode: entityMeta("sensor", ["operating_mode"], true),
			speed: entityMeta("sensor", ["speed"], true),
			air_quality: entityMeta("sensor", ["air_quality", "overall_air_quality"], true),
		},
	},
	ceiling_fan: {
		label: "Ceiling Fan",
		icon: "mdi:ceiling-fan",
		accent: { start: "#fa709a", end: "#fee140" },
		keywords: ["ceiling_fan", "fan"],
		defaultPrefixes: ["ceiling_fan"],
		chips: [
			chipMeta("power", "mdi:power", { active: "On", inactive: "Off" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine", "text", { optional: true }),
			detailRow("speed", "Speed", "mdi:speedometer", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			power: entityMeta("switch", ["power"], true),
			speed: entityMeta("sensor", ["speed"], true),
		},
	},
	cooktop: {
		label: "Cooktop",
		icon: "mdi:stove",
		accent: { start: "#ff9a56", end: "#ff6a00" },
		keywords: ["cooktop", "stove"],
		defaultPrefixes: ["cooktop"],
		meter: { remaining: "remaining_time", total: "total_time" },
		chips: [
			chipMeta("remote_start", "mdi:wifi", { active: "Remote start" }, { tone: "soft" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("power_level", "Power level", "mdi:fire", "text", { optional: true }),
			detailRow("remaining_time", "Time left", "mdi:clock-outline", "duration", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"]),
			power_level: entityMeta("sensor", ["power_level"], true),
			remaining_time: entityMeta("sensor", ["remaining_time"], true),
			total_time: entityMeta("sensor", ["total_time"], true),
			remote_start: entityMeta("binary_sensor", ["remote_start"], true),
		},
	},
	dehumidifier: {
		label: "Dehumidifier",
		icon: "mdi:air-humidifier-off",
		accent: { start: "#89f7fe", end: "#66a6ff" },
		keywords: ["dehumidifier"],
		defaultPrefixes: ["dehumidifier"],
		chips: [
			chipMeta("power", "mdi:power", { active: "On", inactive: "Off" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine", "text", { optional: true }),
			detailRow("mode", "Mode", "mdi:tune", "text", { optional: true }),
			detailRow("humidity", "Humidity", "mdi:water-percent", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			power: entityMeta("switch", ["power"], true),
			mode: entityMeta("sensor", ["operating_mode"], true),
			humidity: entityMeta("sensor", ["humidity"], true),
		},
	},
	home_brew: {
		label: "Home Brew",
		icon: "mdi:beer",
		accent: { start: "#f7971e", end: "#ffd200" },
		keywords: ["home_brew", "homebrew", "beer"],
		defaultPrefixes: ["home_brew", "homebrew"],
		chips: [],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("recipe", "Recipe", "mdi:book-open-variant", "text", { optional: true }),
			detailRow("progress", "Progress", "mdi:percent", "text", { optional: true }),
			detailRow("duration", "Duration", "mdi:clock-outline", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"]),
			recipe: entityMeta("sensor", ["homebrew_recipe"], true),
			progress: entityMeta("sensor", ["recipe_progress"], true),
			duration: entityMeta("sensor", ["brewing_duration"], true),
		},
	},
	hood: {
		label: "Hood",
		icon: "mdi:hvac",
		accent: { start: "#667eea", end: "#764ba2" },
		keywords: ["hood", "range_hood", "extractor"],
		defaultPrefixes: ["hood", "range_hood"],
		chips: [
			chipMeta("power", "mdi:power", { active: "On", inactive: "Off" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine", "text", { optional: true }),
			detailRow("fan_speed", "Fan speed", "mdi:fan", "text", { optional: true }),
			detailRow("light", "Light", "mdi:lightbulb", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			power: entityMeta("switch", ["power"], true),
			fan_speed: entityMeta("sensor", ["fan"], true),
			light: entityMeta("sensor", ["light"], true),
		},
	},
	humidifier: {
		label: "Humidifier",
		icon: "mdi:air-humidifier",
		accent: { start: "#4facfe", end: "#00f2fe" },
		keywords: ["humidifier"],
		defaultPrefixes: ["humidifier"],
		chips: [
			chipMeta("power", "mdi:power", { active: "On", inactive: "Off" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine", "text", { optional: true }),
			detailRow("mode", "Mode", "mdi:tune", "text", { optional: true }),
			detailRow("humidity", "Humidity", "mdi:water-percent", "text", { optional: true }),
			detailRow("target_humidity", "Target humidity", "mdi:water-percent", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			power: entityMeta("switch", ["power"], true),
			mode: entityMeta("sensor", ["operating_mode"], true),
			humidity: entityMeta("sensor", ["humidity"], true),
			target_humidity: entityMeta("sensor", ["target_humidity"], true),
		},
	},
	kimchi_refrigerator: {
		label: "Kimchi Refrigerator",
		icon: "mdi:fridge-variant",
		accent: { start: "#fa8bff", end: "#2bd2ff" },
		keywords: ["kimchi", "kimchi_refrigerator"],
		defaultPrefixes: ["kimchi_refrigerator"],
		chips: [
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }, { hideInactive: true }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine", "text", { optional: true }),
			detailRow("temperature", "Temperature", "mdi:thermometer", "temperature", { optional: true }),
			detailRow("fresh_air_filter", "Fresh air filter", "mdi:air-filter", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			door: entityMeta("binary_sensor", ["door"], false, true),
			temperature: entityMeta("sensor", ["temperature"], true),
			fresh_air_filter: entityMeta("sensor", ["fresh_air_filter"], true),
		},
	},
	microwave_oven: {
		label: "Microwave Oven",
		icon: "mdi:microwave",
		accent: { start: "#ff6e7f", end: "#bfe9ff" },
		keywords: ["microwave", "oven"],
		defaultPrefixes: ["microwave_oven", "microwave"],
		chips: [],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("fan", "Fan", "mdi:fan", "text", { optional: true }),
			detailRow("light", "Light", "mdi:lightbulb", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"]),
			fan: entityMeta("sensor", ["fan"], true),
			light: entityMeta("sensor", ["light"], true),
		},
	},
	oven: {
		label: "Oven",
		icon: "mdi:stove",
		accent: { start: "#f83600", end: "#f9d423" },
		keywords: ["oven"],
		defaultPrefixes: ["oven"],
		chips: [
			chipMeta("remote_start", "mdi:wifi", { active: "Remote start" }, { tone: "soft" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("temperature", "Temperature", "mdi:thermometer", "temperature", { optional: true }),
			detailRow("cook_mode", "Cook mode", "mdi:chef-hat", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"]),
			temperature: entityMeta("sensor", ["temperature"], true),
			cook_mode: entityMeta("sensor", ["cook_mode"], true),
			remote_start: entityMeta("binary_sensor", ["remote_start"], true),
		},
	},
	plant_cultivator: {
		label: "Plant Cultivator",
		icon: "mdi:sprout",
		accent: { start: "#56ab2f", end: "#a8e063" },
		keywords: ["plant", "cultivator"],
		defaultPrefixes: ["plant_cultivator"],
		chips: [],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("temperature", "Temperature", "mdi:thermometer", "temperature", { optional: true }),
			detailRow("light_intensity", "Light intensity", "mdi:brightness-6", "text", { optional: true }),
			detailRow("mode", "Mode", "mdi:tune", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"]),
			temperature: entityMeta("sensor", ["temperature"], true),
			light_intensity: entityMeta("sensor", ["lighting_intensity"], true),
			mode: entityMeta("sensor", ["mode"], true),
		},
	},
	robot_cleaner: {
		label: "Robot Cleaner",
		icon: "mdi:robot-vacuum",
		accent: { start: "#00d2ff", end: "#3a47d5" },
		keywords: ["robot", "vacuum", "cleaner"],
		defaultPrefixes: ["robot_cleaner", "vacuum"],
		chips: [],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("mode", "Mode", "mdi:tune", "text", { optional: true }),
			detailRow("battery", "Battery", "mdi:battery", "text", { optional: true }),
			detailRow("running_time", "Running time", "mdi:clock-outline", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"]),
			mode: entityMeta("sensor", ["operating_mode"], true),
			battery: entityMeta("sensor", ["battery"], true),
			running_time: entityMeta("sensor", ["running_time"], true),
		},
	},
	stick_cleaner: {
		label: "Stick Cleaner",
		icon: "mdi:broom",
		accent: { start: "#f2709c", end: "#ff9472" },
		keywords: ["stick", "cleaner", "vacuum"],
		defaultPrefixes: ["stick_cleaner"],
		chips: [],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("mode", "Mode", "mdi:tune", "text", { optional: true }),
			detailRow("battery", "Battery", "mdi:battery", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"]),
			mode: entityMeta("sensor", ["operating_mode"], true),
			battery: entityMeta("sensor", ["battery"], true),
		},
	},
	styler: {
		label: "Styler",
		icon: "mdi:hanger",
		accent: { start: "#ff0844", end: "#ffb199" },
		keywords: ["styler"],
		defaultPrefixes: ["styler"],
		meter: { remaining: "remaining_time", total: "total_time" },
		chips: [
			chipMeta("remote_start", "mdi:wifi", { active: "Remote start" }, { tone: "soft" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine"),
			detailRow("cycle", "Cycle", "mdi:tune-vertical-variant", "text", { optional: true }),
			detailRow("remaining_time", "Time left", "mdi:clock-outline", "duration", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"]),
			cycle: entityMeta("sensor", ["current_cycle"], true),
			remaining_time: entityMeta("sensor", ["remaining_time"], true),
			total_time: entityMeta("sensor", ["total_time"], true),
			remote_start: entityMeta("binary_sensor", ["remote_start"], true),
		},
	},
	system_boiler: {
		label: "System Boiler",
		icon: "mdi:water-boiler",
		accent: { start: "#ee0979", end: "#ff6a00" },
		keywords: ["boiler", "system_boiler"],
		defaultPrefixes: ["system_boiler", "boiler"],
		chips: [
			chipMeta("power", "mdi:power", { active: "On", inactive: "Off" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine", "text", { optional: true }),
			detailRow("indoor_temp", "Indoor temp", "mdi:thermometer", "temperature", { optional: true }),
			detailRow("inlet_temp", "Inlet temp", "mdi:thermometer", "temperature", { optional: true }),
			detailRow("outlet_temp", "Outlet temp", "mdi:thermometer", "temperature", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			power: entityMeta("switch", ["power"], true),
			indoor_temp: entityMeta("sensor", ["indoor_temperature"], true),
			inlet_temp: entityMeta("sensor", ["inlet_temperature"], true),
			outlet_temp: entityMeta("sensor", ["outlet_temperature"], true),
		},
	},
	water_heater: {
		label: "Water Heater",
		icon: "mdi:water-boiler",
		accent: { start: "#fc4a1a", end: "#f7b733" },
		keywords: ["water_heater", "heater"],
		defaultPrefixes: ["water_heater"],
		chips: [
			chipMeta("power", "mdi:power", { active: "On", inactive: "Off" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine", "text", { optional: true }),
			detailRow("mode", "Mode", "mdi:tune", "text", { optional: true }),
			detailRow("current_temp", "Current temp", "mdi:thermometer", "temperature", { optional: true }),
			detailRow("target_temp", "Target temp", "mdi:thermometer", "temperature", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			power: entityMeta("switch", ["power"], true),
			mode: entityMeta("sensor", ["operating_mode"], true),
			current_temp: entityMeta("sensor", ["current_temperature"], true),
			target_temp: entityMeta("sensor", ["target_temperature", "temperature"], true),
		},
	},
	water_purifier: {
		label: "Water Purifier",
		icon: "mdi:water-pump",
		accent: { start: "#00b4db", end: "#0083b0" },
		keywords: ["water_purifier", "purifier"],
		defaultPrefixes: ["water_purifier"],
		chips: [],
		details: [
			detailRow("status", "Status", "mdi:state-machine", "text", { optional: true }),
			detailRow("sterilization", "Sterilization", "mdi:bacteria", "text", { optional: true }),
			detailRow("type", "Type", "mdi:information", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			sterilization: entityMeta("sensor", ["high_temp_sterilization"], true),
			type: entityMeta("sensor", ["type"], true),
		},
	},
	wine_cellar: {
		label: "Wine Cellar",
		icon: "mdi:glass-wine",
		accent: { start: "#8e2de2", end: "#4a00e0" },
		keywords: ["wine", "cellar"],
		defaultPrefixes: ["wine_cellar"],
		chips: [
			chipMeta("door", "mdi:door", { active: "Door open", inactive: "Door closed" }, { hideInactive: true }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine", "text", { optional: true }),
			detailRow("temperature", "Temperature", "mdi:thermometer", "temperature", { optional: true }),
			detailRow("light", "Light", "mdi:lightbulb", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			door: entityMeta("binary_sensor", ["door"], false, true),
			temperature: entityMeta("sensor", ["temperature"], true),
			light: entityMeta("sensor", ["light"], true),
		},
	},
	ventilator: {
		label: "Ventilator",
		icon: "mdi:fan",
		accent: { start: "#90e0ff", end: "#4facfe" },
		keywords: ["ventilator", "vent"],
		defaultPrefixes: ["ventilator"],
		chips: [
			chipMeta("power", "mdi:power", { active: "On", inactive: "Off" }),
		],
		details: [
			detailRow("status", "Status", "mdi:state-machine", "text", { optional: true }),
			detailRow("mode", "Mode", "mdi:tune", "text", { optional: true }),
			detailRow("speed", "Speed", "mdi:speedometer", "text", { optional: true }),
			detailRow("air_quality", "Air quality", "mdi:air-filter", "text", { optional: true }),
		],
		entities: {
			status: entityMeta("sensor", ["current_status"], true),
			power: entityMeta("switch", ["power"], true),
			mode: entityMeta("sensor", ["operating_mode"], true),
			speed: entityMeta("sensor", ["speed"], true),
			air_quality: entityMeta("sensor", ["air_quality"], true),
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
	  
	  // Check for plain numbers FIRST (total_time sensor returns just "38" for 38 minutes)
	  const numeric = Number(raw);
	  if (!Number.isNaN(numeric)) {
	    return numeric * 60;
	  }
	  
	  // Handle "in X minutes/hours" relative timestamp format from Home Assistant
	  // LG ThinQ TIMESTAMP sensors display as "in X minutes" when formatted
	  const inFormat = raw.match(/^in\s+(\d+)\s+(minute|minutes|hour|hours)$/i);
	  if (inFormat) {
	    const num = Number(inFormat[1]);
	    const unit = inFormat[2].toLowerCase();
	    return unit.startsWith('hour') ? num * 3600 : num * 60;
	  }
	  
	  // Handle "XXm" or "XXh" DURATION sensor format
	  const shortFormat = raw.match(/^(\d+)([hm])$/i);
	  if (shortFormat) {
	    const num = Number(shortFormat[1]);
	    const unit = shortFormat[2].toLowerCase();
	    return unit === 'h' ? num * 3600 : num * 60;
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
	// ISO timestamp (remaining_time returns "2025-11-03T23:52:15+00:00")
	const timestamp = Date.parse(raw);
	if (!Number.isNaN(timestamp)) {
	  const diff = Math.round((timestamp - Date.now()) / 1000);
	  return diff >= 0 ? diff : 0;
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

	    // Don't show cycle/program when appliance is inactive (prevents showing stale data)
	    if (detail.key === "cycle" && !this._isApplianceActive()) {
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

	  _isApplianceActive() {
	    const statusValue = this._stateValue("status");
	    const statusNormalized = normalize(statusValue);
	    
	    // Check if status indicates active operation
	    if (statusNormalized && !UNAVAILABLE.has(statusNormalized)) {
	      // If status is a passive state (off, idle, etc.), appliance is inactive
	      if (PASSIVE_STATES.includes(statusNormalized)) {
	        return false;
	      }
	      // Any other non-passive status means active
	      if (statusNormalized) {
	        return true;
	      }
	    }
	    
	    // Fallback: check if there's progress
	    const config = this._definition.meter;
	    if (config) {
	      const remainingValue = this._stateValue(config.remaining);
	      const remainingSeconds = parseDurationToSeconds(remainingValue);
	      if (remainingSeconds != null && remainingSeconds > 0) {
	        return true;
	      }
	    }
	    
	    return false;
	  }

_buildProgress() {
	const config = this._definition.meter;
	if (!config) {
		return null;
	}

	const statusValue = this._stateValue("status");
	const normalized = normalize(statusValue);

	if (normalized && UNAVAILABLE.has(normalized)) {
		return null;
	}

	const remainingValue = this._stateValue(config.remaining);
	const totalValue = this._stateValue(config.total);

	if (remainingValue != null && UNAVAILABLE.has(normalize(remainingValue))) {
		return null;
	}
	if (totalValue != null && UNAVAILABLE.has(normalize(totalValue))) {
		return null;
	}

	const remainingSeconds = parseDurationToSeconds(remainingValue);
	const totalSeconds = parseDurationToSeconds(totalValue);
	let percent = null;

	console.log('[LG ThinQ Progress]', {
		remainingValue,
		totalValue,
		remainingSeconds,
		totalSeconds,
		calculation: totalSeconds && remainingSeconds != null ? `(${totalSeconds} - ${remainingSeconds}) / ${totalSeconds} = ${((totalSeconds - remainingSeconds) / totalSeconds * 100).toFixed(1)}%` : 'null'
	});

	// Progress shows completion: 0% at start, 100% when done
	if (totalSeconds != null && totalSeconds > 0 && remainingSeconds != null && remainingSeconds >= 0) {
		percent = clamp(((totalSeconds - remainingSeconds) / totalSeconds) * 100, 0, 100);
	}

	if (percent == null) {
		return null;
	}

	let label = null;
	if (remainingSeconds != null && remainingSeconds > 0) {
		const timeLabel = formatDurationShort(remainingSeconds);
		const percentLabel = `${Math.round(percent)}%`;
		label = `${percentLabel} • ${timeLabel} left`;
	} else if (percent != null) {
		label = `${Math.round(percent)}%`;
	}

	return { percent, label };
}	  _renderChips() {
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
		const isOffline = statusNormalized && UNAVAILABLE.has(statusNormalized);

		if (isOffline) {
		  return html`
		    <ha-card class="lg-thinq lg-thinq--offline" style=${`--lg-accent-start:${accent.start}; --lg-accent-end:${accent.end};`}>
		      <div class="lg-thinq__hero lg-thinq__hero--offline">
		        <div class="lg-thinq__hero-icon lg-thinq__hero-icon--offline">
		          <ha-icon icon=${this._definition.icon}></ha-icon>
		        </div>
		        <div class="lg-thinq__hero-text">
		          <div class="lg-thinq__headline">${header}</div>
		          <div class="lg-thinq__status">Offline</div>
		        </div>
		      </div>
		    </ha-card>
		  `;
		}

		const status = statusNormalized ? prettifyText(statusValue) : null;
		const cycle = this._formatValue({ key: "cycle", format: "text" });
		const progress = this._buildProgress();
		const chips = this._renderChips();
		const details = this._renderDetails();
		const isActive = !isOffline && (isTruthyState(statusValue) || Boolean(progress && progress.percent > 0));
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
	        transition: box-shadow 0.4s ease, filter 0.3s ease;
	      }

	      .lg-thinq--active {
	        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
	      }

	      .lg-thinq:not(.lg-thinq--active) {
	        filter: grayscale(0.6);
	        opacity: 0.85;
	      }

	      .lg-thinq--offline .lg-thinq__hero--offline {
	        background: linear-gradient(135deg, #757575, #9e9e9e);
	        opacity: 0.7;
	      }

	      .lg-thinq--offline .lg-thinq__hero-icon--offline {
	        opacity: 0.6;
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
        transition: box-shadow 0.3s ease, transform 0.3s ease;
      }

      .lg-thinq--active .lg-thinq__hero-icon {
        animation: lg-thinq-icon-pop 1.8s ease-in-out infinite;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
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
        padding: 20px 24px 12px;
      }

      .lg-thinq__progress-track {
        position: relative;
        width: 100%;
        height: 12px;
        border-radius: 16px;
        background: linear-gradient(
          135deg,
          rgba(0, 0, 0, 0.04) 0%,
          rgba(0, 0, 0, 0.06) 100%
        );
        box-shadow: 
          inset 0 2px 4px rgba(0, 0, 0, 0.08),
          inset 0 -1px 2px rgba(255, 255, 255, 0.1);
        overflow: hidden;
        backdrop-filter: blur(10px);
      }

      .lg-thinq__progress-track::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.2) 50%,
          transparent 100%
        );
      }

      .lg-thinq__progress-value {
        position: relative;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(
          135deg,
          var(--lg-accent-start) 0%,
          var(--lg-accent-end) 100%
        );
        box-shadow: 
          0 2px 8px rgba(var(--rgb-primary-color), 0.25),
          0 1px 3px rgba(0, 0, 0, 0.15),
          inset 0 1px 1px rgba(255, 255, 255, 0.3);
        transition: width 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
        overflow: hidden;
      }

      .lg-thinq__progress-value::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.25) 0%,
          rgba(255, 255, 255, 0.05) 50%,
          transparent 100%
        );
        border-radius: 16px 16px 0 0;
      }

      .lg-thinq--active .lg-thinq__progress-value {
        animation: lg-thinq-progress-glow 2s ease-in-out infinite;
      }

      .lg-thinq--active .lg-thinq__progress-value::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.35) 50%,
          transparent 100%
        );
        animation: lg-thinq-progress-shimmer 2.5s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
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
        box-shadow: 0 0 12px rgba(var(--rgb-primary-color), 0.3);
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

	      @keyframes lg-thinq-progress-glow {
	        0%, 100% {
	          box-shadow: 
	            0 2px 8px rgba(var(--rgb-primary-color), 0.25),
	            0 1px 3px rgba(0, 0, 0, 0.15),
	            inset 0 1px 1px rgba(255, 255, 255, 0.3);
	        }
	        50% {
	          box-shadow: 
	            0 3px 12px rgba(var(--rgb-primary-color), 0.4),
	            0 2px 6px rgba(0, 0, 0, 0.2),
	            inset 0 1px 1px rgba(255, 255, 255, 0.4);
	        }
	      }

	      @keyframes lg-thinq-progress-shimmer {
	        0% {
	          left: -100%;
	        }
	        100% {
	          left: 200%;
	        }
	      }

	      @keyframes lg-thinq-status-pulse {
	        0%, 100% {
	          opacity: 1;
	        }
	        50% {
	          opacity: 0.7;
	        }
	      }

	      @keyframes lg-thinq-icon-pop {
	        0%, 100% {
	          transform: scale(1);
	        }
	        50% {
	          transform: scale(1.15);
	        }
	      }

	      @keyframes lg-thinq-chip-pop {
	        0%, 100% {
	          transform: translateY(0);
	        }
	        50% {
	          transform: translateY(-2px);
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