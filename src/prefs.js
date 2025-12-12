import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';

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

        // Validate and set the current format
        const currentFormat = window._settings.get_string('format');

        const customDatetimeFormatEntryRow = new Adw.EntryRow({
            title: _('Users Datetime format'),
            sensitive: currentFormat === 'other' ? true : false,
            width_chars: 100,
        });

        const datetimeFormatComboRow = new Adw.ComboRow({
            title: _('Datetime format'),
            subtitle: _('Datetime format of the extension in the panel'),
            model: datetimeFormatOptions,
        });

        const formatIndex = displayFormat.indexOf(currentFormat);
        datetimeFormatComboRow.selected = formatIndex >= 0 ? formatIndex : 0;

        // Handle format changes with validation
        datetimeFormatComboRow.connect('notify::selected-item', () => {
            try {
                const selectedIndex = datetimeFormatComboRow.get_selected();
                if (selectedIndex >= 0 && selectedIndex < displayFormat.length) {
                    const selectedFormat = displayFormat[selectedIndex];
                    window._settings.set_string('format', selectedFormat);

                    customDatetimeFormatEntryRow.sensitive = window._settings
                        .get_string('format') === 'other' ? true : false
                }
            } catch (e) {
                console.error(`[${EXTENSION_UUID}] Error setting format: ${e.message}`);
            }
        });
        
        formatGroup.add(datetimeFormatComboRow);

        const customFormat = window._settings.get_value('user-format').deepUnpack().userFormat;
        customDatetimeFormatEntryRow.set_text(customFormat);

        customDatetimeFormatEntryRow.connect('changed', (row) => {
            const userFormat = GLib.Variant.new('a{ss}',
                {
                    'userFormat': row.text,
                }
            );
            window._settings.set_value('user-format', userFormat);
        });

        formatGroup.add(customDatetimeFormatEntryRow);
    }
}

