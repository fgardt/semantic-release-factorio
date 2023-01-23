const AggregateError = require('aggregate-error');
const { Validator } = require('jsonschema');
const { readFile, writeFile } = require('node:fs/promises');
const { join } = require('node:path');

const { getMiscError } = require('./get-error');
const infoSchema = require('./info-schema.js');


function getInfoFilePath(config, context) {
    return join(context.cwd, "./info.json");
}

async function readInfoFile(config, context) {
    try {
        const result = await readFile(getInfoFilePath(config, context), "utf-8");
    
        return JSON.parse(result);
    } catch (error) {
        throw getMiscError(error);
    }
}

async function writeInfoFile(config, context, info_file_obj) {
    try {
        await writeFile(getInfoFilePath(config, context), JSON.stringify(info_file_obj, null, 2));
    } catch (error) {
        throw getMiscError(error);
    }
}

function isInfoValid(info_file_obj) {
    try {
        var v = new Validator();
        var res = v.validate(info_file_obj, infoSchema);
    
        if (res.valid) {
            return true;
        }

        throw new AggregateError(res.errors.map((err) => getMiscError(err)));
    } catch (error) {
        throw getMiscError(error);
    }
}

async function updateInfo(config, context) {
    try {
        var info = await readInfoFile(config, context);

        info.version = context.version;
    
        await writeInfoFile(config, context, info);
    } catch (error) {
        throw getMiscError(error);
    }
}


module.exports = {
    getInfoFilePath,
    readInfoFile,
    writeInfoFile,
    isInfoValid,
    updateInfo
};
