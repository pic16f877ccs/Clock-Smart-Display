import GLib from "gi://GLib";
import St from "gi://St";
import Clutter from "gi://Clutter";
import Pango from "gi://Pango";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

export default class DateTimeFormatExtension extends Extension {
    _updateDateTime() {
        this._dateTimeLabel.set_text(
            GLib.DateTime.new_now_local()
                .format(this._dateTimeFormats[this._currentFormat] || this._dateTimeFormats['datetime'])
        );

        return true;
    }

    enable() {
        this._dateTimeFormats = {
            "datetime": '%Y-%m-%d %H:%M',
            "date": '%Y-%m-%d',
            "time": '%H:%M',
            "iso": '%FT%T%Ez',
            "time 12": '%I:%M %p',
            "date us": '%m/%d/%Y',
            "date eu": '%d/%m/%Y',
            "rfc": '%a, %d %b %Y %H:%M:%S %z',
            "full": '%a, %d %b %Y %H:%M',
            "vtime": '%H\n%M'
        };

        if (Main.panel.statusArea.dateMenu._clockDisplay) {
            this._systemClockLabel = Main.panel.statusArea.dateMenu._clockDisplay;
        }

        this._dateTimeLabel = new St.Label({ style_class: "clock", });
        this._dateTimeLabel.clutter_text.y_align = Clutter.ActorAlign.CENTER;
        this._dateTimeLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

        this._settings = this.getSettings();

        this._currentFormat = this._settings.get_string("format");
        this._format = this._dateTimeFormats[this._currentFormat] ||
            this._dateTimeFormats['datetime'];
        this._dateTimeLabel.set_text(
            GLib.DateTime.new_now_local().format(this._format)
        );

        this._systemClockLabel.hide();
        this._systemClockLabel
            .get_parent()
            .insert_child_below(this._dateTimeLabel, this._systemClockLabel);

        this._timeoutID = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT,
            1000,
            this._updateDateTime.bind(this)
        );

        this._formatChangedId = this._settings.connect('changed::format', (settings, key) => {
            this._currentFormat = settings.get_string(key);
            this._format = this._dateTimeFormats[this._currentFormat] ||
                this._dateTimeFormats['datetime'];
            this._dateTimeLabel.set_text(
                GLib.DateTime.new_now_local().format(this._format)
            );
        });
    }

    disable() {
        if (this._timeoutID) {
            GLib.Source.remove(this._timeoutID);
            this._timeoutID = null;
        }

        if (this._dateTimeLabel) {
            this._systemClockLabel.get_parent().remove_child(this._dateTimeLabel);
            this._dateTimeLabel.destroy();
            this._dateTimeLabel = null;
        }

        if (this._formatChangedId) {
            this._settings.disconnect(this._formatChangedId);
            this._formatChangedId = null;
        }

        this._systemClockLabel.show();
        this._settings = null;
    }
}
