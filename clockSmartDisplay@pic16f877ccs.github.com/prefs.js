import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences,
    gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class MonitorSmartSaverPreferences extends ExtensionPreferences {
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

        const displayFormat = [
            'datetime',
            'date',
            'time',
            'iso',
            'time 12',
            'date us',
            'date eu',
            'rfc',
            'full',
            'vtime',
        ];
        const datetimeFormatOptions = Gtk.StringList.new(displayFormat);

        const datetimeFormatComboRow = new Adw.ComboRow({
            title: _('Datetime format'),
            subtitle: _('Datetime format of the extension in the panel'),
            model: datetimeFormatOptions,
            selected: Object.values(displayFormat)
                .indexOf(window._settings.get_string('format')),
        });

        datetimeFormatComboRow.connect('notify::selected-item', () => {
			window._settings.set_string('format',
                Object.values(displayFormat)[datetimeFormatComboRow.get_selected()]);
        });
        formatGroup.add(datetimeFormatComboRow);
    }
}

