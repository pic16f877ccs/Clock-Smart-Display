import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences,
    gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { DATE_TIME_FORMATS, EXTENSION_UUID } from './constants.js';

export default class ClockSmartDisplayPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: null,
            icon_name: null,
        });
        window.add(page);

        const formatGroup = new Adw.PreferencesGroup({ title: _('Format')});
        formatGroup.set_separate_rows?.(true);
        page.add(formatGroup);

        // Use the format keys from the shared constant
        const displayFormat = Object.keys(DATE_TIME_FORMATS);
        const datetimeFormatOptions = Gtk.StringList.new(displayFormat);

        const datetimeFormatComboRow = new Adw.ComboRow({
            title: _('Datetime format'),
            subtitle: _('Datetime format of the extension in the panel'),
            model: datetimeFormatOptions,
        });

        // Validate and set the current format
        const currentFormat = window._settings.get_string('format');
        const formatIndex = displayFormat.indexOf(currentFormat);
        datetimeFormatComboRow.selected = formatIndex >= 0 ? formatIndex : 0;

        // Handle format changes with validation
        datetimeFormatComboRow.connect('notify::selected-item', () => {
            try {
                const selectedIndex = datetimeFormatComboRow.get_selected();
                if (selectedIndex >= 0 && selectedIndex < displayFormat.length) {
                    const selectedFormat = displayFormat[selectedIndex];
                    window._settings.set_string('format', selectedFormat);
                }
            } catch (e) {
                console.error(`[${EXTENSION_UUID}] Error setting format: ${e.message}`);
            }
        });
        
        formatGroup.add(datetimeFormatComboRow);
    }
}

