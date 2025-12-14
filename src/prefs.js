import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';

import {ExtensionPreferences,
    gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { DATE_TIME_FORMATS } from './constants.js';

export default class ClockSmartDisplayPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {

        const page = new Adw.PreferencesPage({
            title: null,
            icon_name: null,
        });
        window.add(page);

        const formatGroup = new Adw.PreferencesGroup({ title: _('Format')});
        formatGroup.set_separate_rows?.(true);
        page.add(formatGroup);

        const displayFormat = Object.keys(DATE_TIME_FORMATS);
        const datetimeFormatOptions = Gtk.StringList.new(displayFormat);

        window._settings = this.getSettings();
        const currentFormat = window._settings.get_string('format');

        const customDatetimeFormatEntryRow = new Adw.EntryRow({
            title: _('Users Datetime format'),
            sensitive: currentFormat === 'other' ? true : false,
        });

        const datetimeFormatComboRow = new Adw.ComboRow({
            title: _('Datetime format'),
            subtitle: _('Datetime format of the extension in the panel'),
            model: datetimeFormatOptions,
        });

        datetimeFormatComboRow.selected = displayFormat.indexOf(currentFormat);

        datetimeFormatComboRow.connect('notify::selected-item', () => {
            const selectedIndex = datetimeFormatComboRow.get_selected();
            window._settings.set_string('format', displayFormat[selectedIndex]);

            customDatetimeFormatEntryRow.sensitive = window._settings
                .get_string('format') === 'other' ? true : false
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

