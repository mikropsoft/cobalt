import type { RecursivePartial } from "$lib/types/generic";
import type {
    PartialSettings,
    AllPartialSettingsWithSchema,
    CobaltSettingsV3,
    CobaltSettingsV4,
    CobaltSettingsV5,
} from "$lib/types/settings";
import { getBrowserLanguage } from "$lib/settings/youtube-lang";

type Migrator = (s: AllPartialSettingsWithSchema) => AllPartialSettingsWithSchema;

const migrations: Record<number, Migrator> = {
    [3]: (settings: AllPartialSettingsWithSchema) => {
        const out = settings as RecursivePartial<CobaltSettingsV3>;
        out.schemaVersion = 3;

        if (settings?.save && "youtubeDubBrowserLang" in settings.save) {
            if (settings.save.youtubeDubBrowserLang) {
                out.save!.youtubeDubLang = getBrowserLanguage();
            }

            delete settings.save.youtubeDubBrowserLang;
        }

        return out as AllPartialSettingsWithSchema;
    },

    [4]: (settings: AllPartialSettingsWithSchema) => {
        const out = settings as RecursivePartial<CobaltSettingsV4>;
        out.schemaVersion = 4;

        if (settings?.processing) {
            if ("allowDefaultOverride" in settings.processing) {
                delete settings.processing.allowDefaultOverride;
            }
            if ("seenOverrideWarning" in settings.processing) {
                delete settings.processing.seenOverrideWarning;
            }
        }

        return out as AllPartialSettingsWithSchema;
    },

    [5]: (settings: AllPartialSettingsWithSchema) => {
        const out = settings as RecursivePartial<CobaltSettingsV5>;
        out.schemaVersion = 5;

        if (settings?.save) {
            if ("tiktokH265" in settings.save) {
                out.save!.allowH265 = settings.save.tiktokH265;
                delete settings.save.tiktokH265;
            }
            if ("twitterGif" in settings.save) {
                out.save!.convertGif = settings.save.twitterGif;
                delete settings.save.twitterGif;
            }
        }

        return out as AllPartialSettingsWithSchema;
    },
};

export const migrate = (settings: AllPartialSettingsWithSchema): PartialSettings => {
    return Object.keys(migrations)
        .map(Number)
        .filter((version) => version > settings.schemaVersion)
        .reduce((settings, migrationVersion) => {
            return migrations[migrationVersion](settings);
        }, settings as AllPartialSettingsWithSchema) as PartialSettings;
};
