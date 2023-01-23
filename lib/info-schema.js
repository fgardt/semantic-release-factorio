const infoSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "title": "Factorio mod info.json",
    "type": "object",

    "required": ["name", "version", "title", "author"],
    "properties": {
        "name": {
            "description": "internal and unique name of a mod",
            "type": "string",
            "minLength": 4,
            "maxLength": 50,
            "pattern": "[A-Za-z0-9-_]+"
        },
        "version": {
            "description": "Defines the version of the mod in the format \"number.number.number\"",
            "type": "string",
            "patern": "(?:0*\\d+\\.){2}0*\\d+"
        },
        "title": {
            "description": "The display name of the mod",
            "type": "string",
            "maxLength": 100
        },
        "author": {
            "description": "The author of the mod. This field does not have restrictions, it can also be a list of authors etc",
            "type": "string"
        },
        "contact": {
            "description": "How the mod author can be contacted, for example an email address",
            "type": "string"
        },
        "homepage": {
            "description": "Where the mod can be found on the internet. Please don't put \"None\" here",
            "type": "string",
            "pattern": "^((?:https?:\/\/)(?:[^\\s.]+\\.)+[^\\s.]{2,}[^\\s]*)?$"
        },
        "description": {
            "description": "A short description of what your mod does. This is all that people get to see in-game",
            "type": "string"
        },
        "factorio_version": {
            "description": "The Factorio version that this mod supports in the format \"major.minor\"",
            "type": "string",
            "pattern": "\\d+\\.\\d+"
        },
        "dependencies": {
            "description": "Mods that this mod depends on or is incompatible with",
            "type": "array",
            "items": {
                "type": "string",
                "pattern": "^(!\\s[A-Za-z0-9-_]+|(([?~]|\\(\\?\\))\\s)?[A-Za-z0-9-_]+(\\s(?:=|[<>]=?)\\s(\\d+\\.){2}\\d+)?)$"
            }
        }
    }
};

module.exports = infoSchema;
