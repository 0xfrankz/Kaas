use entity::entities::conversations::GenericOptions;
use serde::Deserialize;

// An utility function that converts string of format BCP-47 with region subtag to format BCP-47 with script subtag
pub fn convert_locale_region_to_script(bcp47: &str) -> String {
    let mut bcp47 = bcp47.to_string();
    if bcp47.contains("-") {
        let parts: Vec<&str> = bcp47.split("-").collect();
        if parts.len() == 2 {
            let lang = parts[0].to_string();
            let region = parts[1].to_uppercase();
            if lang == "zh" {
                if region == "CN" || region == "SG" || region == "MY" {
                    // Simplified Chinese
                    bcp47 = format!("{}-Hans", lang);
                } else {
                    // Traditional Chinese
                    bcp47 = format!("{}-Hant", lang);
                }
            } else if lang == "en" {
                // use en for all English regions
                bcp47 = lang
            }
        }
    }
    bcp47
}

#[derive(Debug, Deserialize)]
struct OptionsWithStream {
    stream: Option<bool>,
}

pub fn is_stream_enabled(options: &GenericOptions) -> bool {
    if let Ok(options) = serde_json::from_str::<OptionsWithStream>(&options.options) {
        return options.stream.unwrap_or(false);
    } else {
        return false;
    }
}