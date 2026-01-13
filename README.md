<div align="center">
  <h1>LG ThinQ Lovelace Cards</h1>
  <p>Zero-config Home Assistant cards for LG ThinQ appliances with live progress, smart chips, and polished gradients.</p>
  
  <a href="https://www.buymeacoffee.com/trusmith" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" width="217"></a>
</div>

> **⚠️ Beta Software**: This project is in active development. Minor issues may occur. If you encounter any problems, please [open an issue](https://github.com/john-lazarus/HomeAssistantLGThinkQCards/issues).

## Screenshots

<div align="center">
  <img src="docs/dishwasher-active.png" alt="Dishwasher Active" width="45%">
  <img src="docs/washer-inactive.png" alt="Washer Inactive" width="45%">
</div>

## What you get

- Auto-detect entities per appliance (washer, dryer, dishwasher, combo, mini, fridge); manual overrides optional.
- Responsive hero header with gradient accent, status + cycle labels, and animated progress bar.
- Contextual chips for door state, remote start, express modes, rinse refill, and more.
- Detail sections with duration formatting, unit-aware temperatures, and grouped measurements.
- Packaged for [HACS](https://hacs.xyz/) so the bundle updates alongside your other frontend cards.

## Install via HACS

<div align="center">
  <a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=john-lazarus&repository=HomeAssistantLGThinkQCards&category=plugin"><img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Install via HACS"></a>
</div>

1. Click the blue **Install in HACS** button above or open `https://my.home-assistant.io/redirect/hacs_repository/?owner=john-lazarus&repository=HomeAssistantLGThinkQCards&category=plugin`.
2. When Home Assistant opens, confirm HACS is installed and logged in, then select **Open link**.
3. Choose **Download** inside HACS; keep the resource URL set to `/hacsfiles/HomeAssistantLGThinkQCards/homeassistant-lg-thinq-cards.js`.
4. After the download completes, click **Reload** so the new resources register.
5. Hard-refresh your browser (`Ctrl+F5` / `Cmd+Shift+R`) to ensure the updated bundle loads.

## Quick start

1. Install the official [LG ThinQ](https://www.home-assistant.io/integrations/lg_thinq/) integration and confirm your washer/dryer/etc. entities show up in **Developer Tools → States**.
2. Install the card through HACS either by using the **Install in HACS** button above or via **HACS → Frontend** and searching for “LG ThinQ cards.”
3. Confirm HACS auto-added the resource. If not, add it manually under `Settings → Dashboards → Resources` with URL `/hacsfiles/HomeAssistantLGThinkQCards/homeassistant-lg-thinq-cards.js` (type `module`).
4. Force-refresh your browser (`Ctrl+F5` / `Cmd+Shift+R`) so the latest bundle loads.
5. In Lovelace, add a **Manual** card with:

  ```yaml
  type: custom:lg-thinq-card
  ```

That's it—the card finds the best-matching appliance automatically. To lock it to a specific unit or override guesses, pass `appliance:` or provide explicit entity IDs.

**Note**: If your entities use a custom prefix (e.g., `sensor.jnj_washerdryer_*` instead of `sensor.washer_*`), you must specify the `entity_prefix`:

```yaml
type: custom:lg-thinq-card
appliance: washer_combo
entity_prefix: jnj_washerdryer
```

Or override individual entities:

```yaml
type: custom:lg-thinq-card
appliance: washer
entities:
  remaining_time: sensor.laundry_washer_time_display
  door: binary_sensor.laundry_washer_door
```

### Manual installation

1. Copy `homeassistant-lg-thinq-cards.js` into `<config>/www/community/homeassistant-lg-thinq-cards/`.
2. Add a Lovelace resource (type `module`) pointing to `/local/community/homeassistant-lg-thinq-cards/homeassistant-lg-thinq-cards.js`.
3. Reload the browser, then add the manual card snippet above.

### Troubleshooting checklist

- Resource missing? Visit `https://<ha-host>/hacsfiles/HomeAssistantLGThinkQCards/homeassistant-lg-thinq-cards.js`—you should see the bundle source.
- Still cached? Append `?v=0.5.0` to the resource URL or hard-reload the browser.
- Wrong entity match? Pass `appliance: washer` (etc.) or override specific sensors under `entities:`.

# Entities

## Dishwasher
| Entity Name | Description |
| :--- | :--- |
| door | Status of the dishwasher door (open/closed). |
| power | Indicates if the dishwasher is powered on. |
| rinse_refill | Notification if the rinse aid needs to be refilled. |
| status | Current operational state of the device. |
| cycle | Currently selected washing program. |
| remaining_time | Time remaining until the cycle finishes. |
| delayed_start | Configured time for the delayed start function. |
| softening_level | Current water softening setting. |
| temperature | Current or target water temperature. |
| salt_refill | Notification if the dishwasher salt needs to be refilled. |
| steam_option | Indicates if the steam cleaning option is enabled. |
| dual_zone | Status of the dual-zone wash setting. |
| extra_dry | Indicates if the extra drying phase is active. |
| total_time | Total duration of the selected cycle. |

## Washer
| Entity Name | Description |
| :--- | :--- |
| door | Status of the washer door lock. |
| remote_start | Indicates if the device can be started remotely via Wi-Fi. |
| status | Current operational state of the washer. |
| cycle | Currently selected wash cycle. |
| remaining_time | Time remaining for the current wash. |
| delayed_start | Time set for a delayed start. |
| water_temp | Current temperature of the washing water. |
| spin_speed | Current or selected spin speed setting. |
| cycle_count | Total number of wash cycles performed. |
| total_time | Total estimated duration of the wash program. |

## Dryer
| Entity Name | Description |
| :--- | :--- |
| remote_start | Remote control availability via network. |
| door | Status of the dryer door. |
| status | Current operational state. |
| cycle | Currently selected drying program. |
| remaining_time | Time remaining for the drying process. |
| delayed_start | Delay timer for the drying cycle. |
| dry_level | Selected level of dryness for the laundry. |
| total_time | Total duration of the drying program. |

## Clothes Washer Dryer Combo
| Entity Name | Description |
| :--- | :--- |
| door | Status of the machine door. |
| remote_start | Remote start capability status. |
| status | Current operational state. |
| cycle | Currently selected wash/dry program. |
| remaining_time | Time remaining for the combined process. |
| delayed_start | Configured delayed start time. |
| dry_level | Target dryness setting. |
| total_time | Total cycle duration. |

## Mini washer
| Entity Name | Description |
| :--- | :--- |
| door | Status of the washer door. |
| status | Current state of the mini washer. |
| cycle | Selected wash cycle. |
| remaining_time | Remaining time for the current task. |
| delayed_start | Delay timer setting. |
| total_time | Total program duration. |

## Washtower
| Entity Name | Description |
| :--- | :--- |
| door | Status of the tower unit doors. |
| remote_start | Connectivity for remote operation. |
| status | Operational status of the tower. |
| cycle | Selected program for the unit. |
| remaining_time | Time left in the current cycle. |
| delayed_start | Configured delay timer. |
| total_time | Total expected duration. |

## Refrigerator
| Entity Name | Description |
| :--- | :--- |
| door | Status of the fridge or freezer doors. |
| express_freeze | Status of the rapid freezing function. |
| express_cool | Status of the rapid cooling function. |
| fridge_temp | Current temperature inside the refrigerator compartment. |
| freezer_temp | Current temperature inside the freezer compartment. |
| fresh_air_filter | Condition or status of the air filter. |
| water_filter_state | Status or remaining life of the water filter. |

## Air Conditioner
| Entity Name | Description |
| :--- | :--- |
| power | Power state of the AC unit. |
| energy_saving | Status of the eco or energy-saving mode. |
| status | General operational status. |
| current_temp | Measured ambient temperature. |
| target_temp | Desired setpoint temperature. |
| humidity | Measured indoor humidity levels. |
| air_quality | Current air quality index or level. |

## Air Purifier
| Entity Name | Description |
| :--- | :--- |
| power | Power state of the purifier. |
| status | Current operational mode or state. |
| mode | Currently selected purification mode. |
| air_quality | Overall air quality measurement. |
| pm25 | Concentration of particulate matter (PM2.5). |
| filter_life | Remaining lifespan of the air filter. |

## Air Purifier Fan
| Entity Name | Description |
| :--- | :--- |
| power | Power state of the fan. |
| status | General operational status. |
| mode | Current fan or purification mode. |
| speed | Current fan speed level. |
| air_quality | Measured air quality. |

## Ceiling Fan
| Entity Name | Description |
| :--- | :--- |
| power | Power state of the ceiling fan. |
| status | Current operating status. |
| speed | Rotational speed setting of the fan. |

## Cooktop
| Entity Name | Description |
| :--- | :--- |
| remote_start | Remote monitoring/start capability. |
| status | Operational state of the burners. |
| power_level | Current heating intensity or power stage. |
| remaining_time | Timer for the current cooking process. |
| total_time | Total set timer duration. |

## Dehumidifier
| Entity Name | Description |
| :--- | :--- |
| power | Power state of the device. |
| status | Current operational mode. |
| mode | Selected dehumidification program. |
| humidity | Current ambient humidity. |

## Home Brew
| Entity Name | Description |
| :--- | :--- |
| status | Current stage of the brewing process. |
| recipe | Name of the active brewing recipe. |
| progress | Percentage of completion for the current batch. |
| duration | Elapsed or total time for the brewing step. |

## Hood
| Entity Name | Description |
| :--- | :--- |
| power | Power state of the extractor hood. |
| status | Current operational status. |
| fan_speed | Current speed of the extraction fan. |
| light | Status of the hood illumination. |

## Humidifier
| Entity Name | Description |
| :--- | :--- |
| power | Power state of the humidifier. |
| status | Current operating status. |
| mode | Selected humidification mode. |
| humidity | Current room humidity. |
| target_humidity | Desired humidity setpoint. |

## Kimchi Refrigerator
| Entity Name | Description |
| :--- | :--- |
| door | Status of the refrigerator door. |
| status | Operational state of the cooling system. |
| temperature | Current temperature inside the unit. |
| fresh_air_filter | Status of the specialized air filter. |

## Microwave Oven
| Entity Name | Description |
| :--- | :--- |
| status | Operational status of the microwave. |
| fan | Status or speed of the ventilation fan. |
| light | Status of the interior light. |

## Oven
| Entity Name | Description |
| :--- | :--- |
| remote_start | Status of remote operation capability. |
| status | Current cooking or cleaning status. |
| temperature | Current internal oven temperature. |
| cook_mode | Currently selected oven function (e.g., grill, fan). |

## Plant Cultivator
| Entity Name | Description |
| :--- | :--- |
| status | Current state of the cultivation system. |
| temperature | Ambient temperature for the plants. |
| light_intensity | Measured or set brightness of the growth lights. |
| mode | Active growth program or mode. |

## Robot Cleaner
| Entity Name | Description |
| :--- | :--- |
| status | Current activity (cleaning, charging, etc.). |
| mode | Selected cleaning pattern or mode. |
| battery | Remaining battery percentage. |
| running_time | Duration of the current cleaning session. |

## Stick Cleaner
| Entity Name | Description |
| :--- | :--- |
| status | Operational state of the vacuum. |
| mode | Selected power suction mode. |
| battery | Remaining battery level. |

## Styler
| Entity Name | Description |
| :--- | :--- |
| remote_start | Connectivity status for remote control. |
| status | Current operational phase of the styler. |
| cycle | Selected refreshment or drying program. |
| remaining_time | Time left in the current cycle. |
| total_time | Total duration of the styling program. |

## System Boiler
| Entity Name | Description |
| :--- | :--- |
| power | Main power status of the boiler. |
| status | Current operational status. |
| indoor_temp | Measured temperature inside the building. |
| inlet_temp | Temperature of the water entering the boiler. |
| outlet_temp | Temperature of the water leaving the boiler. |

## Water Heater
| Entity Name | Description |
| :--- | :--- |
| power | Power status of the heater. |
| status | Current operational state. |
| mode | Selected heating mode. |
| current_temp | Current temperature of the stored water. |
| target_temp | Desired water temperature setpoint. |

## Water Purifier
| Entity Name | Description |
| :--- | :--- |
| status | Current status of the purification system. |
| sterilization | Status of the high-temperature sterilization process. |
| type | Type of water or purification mode being used. |

## Wine Cellar
| Entity Name | Description |
| :--- | :--- |
| door | Status of the cellar door. |
| status | General operational status. |
| temperature | Current internal temperature for wine storage. |
| light | Status of the internal lighting. |

## Ventilator
| Entity Name | Description |
| :--- | :--- |
| power | Power status of the ventilator. |
| status | Current operational state. |
| mode | Selected ventilation mode. |
| speed | Current speed of the fan. |
| air_quality | Measured air quality levels. |

## Features in depth

- **Entity resolver**: Derives the entity prefix from ThinQ naming patterns (`sensor.washer_remaining_time`, etc.) so most setups work without configuration.
- **Progress logic**: Reads percentage, total time, or remaining time—falling back gracefully—and shows a friendly `xh ym left` label.
- **State chips**: Highlights only meaningful states; inactive chips collapse when marked `hideInactive` to keep the layout tidy.
- **Detail sections**: Optional metrics (like delay start or filters) only render when available; temperatures and numbers retain Home Assistant units.

## Development & testing

- `dist/homeassistant-lg-thinq-cards.js` contains the published bundle. Run `node --check dist/homeassistant-lg-thinq-cards.js` after edits to confirm syntax.
- `homeassistant-lg-thinq-cards.js` mirrors the bundle so HACS and manual installs share a single entry point.

## Roadmap

- Translations using Home Assistant frontend i18n utilities.
- Optional compact layout tuned for mobile dashboards.
- Additional appliance definitions as LG expands ThinQ coverage.

## Credits

- Original ThinQ inspiration and community research by the Home Assistant community and LG ThinQ integration maintainers.
- Iconography from [Material Design Icons](https://materialdesignicons.com/), used under their permissive license.
- Project maintained by John Lazarus under the [MIT License](LICENSE).

Contributions, bug reports, and screenshots of your dashboards are welcome!
