import GLib from "gi://GLib";
import St from "gi://St";
import Clutter from "gi://Clutter";
import Pango from "gi://Pango";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import { DATE_TIME_FORMATS, UPDATE_INTERVAL_MS, EXTENSION_UUID } from './constants.js';

/**
 * Log an error message
 */
function logError(message) {
    console.error(`[${EXTENSION_UUID}] ERROR: ${message}`);
}

/**
 * Log a debug message
 */
function logDebug(message) {
    console.log(`[${EXTENSION_UUID}] DEBUG: ${message}`);
}

export default class DateTimeFormatExtension extends Extension {
    /**
     * Update the date/time label with the current time
     * @returns {boolean} True to continue the timeout
     */
    _updateDateTime() {
        if (!this._dateTimeLabel) {
            return false;
        }

        const formatString = this._getFormatString(this._format);
        const formattedText = GLib.DateTime.new_now_local().format(formatString);
        //this._dateTimeLabel.set_text(formattedText);
        this._dateTimeLabel.clutter_text.set_markup(formattedText);

        return true;
    }

    /**
     * Get the format string for a given format key
     * @param {string} formatKey - The format key to look up
     * @returns {string} The format string, or default if key is invalid
     */
    _getFormatString(formatKey) {
        return DATE_TIME_FORMATS[formatKey] || DATE_TIME_FORMATS['datetime'];
    }

    /**
     * Validate that a format key is in the allowed list
     * @param {string} formatKey - The format key to validate
     * @returns {string} Valid format key (may be default if input was invalid)
     */
    _validateFormatKey(formatKey) {
        if (!formatKey || !DATE_TIME_FORMATS[formatKey]) {
            logDebug(`Invalid format key: ${formatKey}, defaulting to 'datetime'`);
            return 'datetime';
        }
        return formatKey;
    }

    /**
     * Enable the extension
     */
    enable() {
        // Check if panel and dateMenu exist
        if (!Main.panel?.statusArea?.dateMenu?._clockDisplay) {
            logError('Clock display not found. Panel structure may have changed.');
            return;
        }

        this._systemClockLabel = Main.panel.statusArea.dateMenu._clockDisplay;

        // Create the custom date/time label
        this._dateTimeLabel = new St.Label({ style_class: "clock" });
        this._dateTimeLabel.clutter_text.y_align = Clutter.ActorAlign.CENTER;
        this._dateTimeLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        this._dateTimeLabel.clutter_text.use_markup = true;

        // Get settings and validate format
        this._settings = this.getSettings();
        const rawFormat = this._settings.get_string("format");
        this._format = this._validateFormatKey(rawFormat);

        // If format was invalid, save the corrected value
        if (rawFormat !== this._format) {
            this._settings.set_string("format", this._format);
        }

        // Initial update
        this._updateDateTime();

        // Hide system clock and insert our label
        this._systemClockLabel.hide();
        const parent = this._systemClockLabel.get_parent();
        if (parent) {
            parent.insert_child_below(this._dateTimeLabel, this._systemClockLabel);
        } else {
            logError('System clock label has no parent');
            this.disable();
            return;
        }

        // Set up periodic updates
        this._timeoutID = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT,
            UPDATE_INTERVAL_MS,
            this._updateDateTime.bind(this)
        );

        // Listen for format changes
        this._formatChangedId = this._settings.connect('changed::format', (settings, key) => {
            const newFormat = settings.get_string(key);
            this._format = this._validateFormatKey(newFormat);
            this._updateDateTime();
        });

        logDebug('Extension enabled successfully');
    }

    /**
     * Disable the extension and clean up resources
     */
    disable() {
        // Remove timeout
        if (this._timeoutID) {
            GLib.Source.remove(this._timeoutID);
            this._timeoutID = null;
        }

        // Disconnect settings signal
        if (this._formatChangedId) {
            this._settings.disconnect(this._formatChangedId);
            this._formatChangedId = null;
        }

        // Clear settings reference
        this._settings = null;

        // Clean up label
        if (this._systemClockLabel) {
            if (this._dateTimeLabel?.get_parent()) {
                this._systemClockLabel.get_parent().remove_child(this._dateTimeLabel);
                this._dateTimeLabel.destroy();
                this._dateTimeLabel = null;
            }

            // Show system clock again
            this._systemClockLabel.show();
        }
        logDebug('Extension disabled successfully');
    }
}
        //this._dateTimeLabel.clutter_text.single_line_mode = true;
        //this._dateTimeLabel.clutter_text.line_alignment = Pango.Alignment.RIGHT;
        //this._dateTimeLabel.clutter_text.justify = true;
