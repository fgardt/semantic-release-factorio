const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const axios = require('axios');

const { getApiError, getMiscError } = require('./get-error');

const ENDPOINT_BASE    = "https://mods.factorio.com/api/v2/mods"
const DETAILS_ENDPOINT = "/edit_details"
const UPLOAD_ENDPOINT  = "/releases/init_upload"
const PUBLISH_ENDPOINT = "/init_publish"


function getToken(config, context) {
    var { tokenEnvVar } = config;

    if (tokenEnvVar == undefined) {
        tokenEnvVar = "FACTORIO_TOKEN";
    }

    return context.env[tokenEnvVar];
}

function getAxiosInstance(config, context) {
    const token = getToken(config, context);

    return axios.create({
        baseURL: ENDPOINT_BASE,

        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + token
        },

        transformResponse: [(data) => {
            return JSON.parse(data);
        }],

        validateStatus: (status) => {
            return status >= 200 && status < 500;
        }
    });
}

async function verifyToken(config, context, modName) {
    const instance = getAxiosInstance(config, context);
    const { logger } = context;

    try {
        logger.log("verifying API token");
        const res = await instance.post(DETAILS_ENDPOINT, {mod: modName});

        if (res.status != 200 && res.data.error != "UnknownMod") {
            logger.log("token invalid");
            throw getApiError(res.data);
        }

        logger.log("token valid");
    } catch (error) {
        logger.log("API error");
        throw getMiscError(error);
    }
}

async function updateMod(config, context, instance, modInfo, fileBuffer) {
    const { logger } = context;

    try {
        logger.log("initializing mod update");
        const initRes = await instance.post(UPLOAD_ENDPOINT, {mod: modInfo.name});

        if (initRes.status != 200) {
            if (initRes.data.error == "UnknownMod") {
                logger.log("mod does not exist yet");
                return false;
            }
    
            logger.log("API error");
            throw getApiError(initRes.data);
        }
    
        logger.log("uploading update");
        const uploadRes = await instance.post(initRes.data.upload_url, {file: fileBuffer});
    
        if (uploadRes.status != 200) {
            logger.log("upload error");
            throw getApiError(uploadRes.data);
        }
    } catch (error) {
        logger.log("error");
        throw getMiscError(error);
    }

    logger.log("update complete");
    return true;
}

async function publishMod(config, context, instance, modInfo, fileBuffer) {
    const { logger } = context;

    try {
        logger.log("initializing mod publishing");
        const initRes = await instance.post(PUBLISH_ENDPOINT, {mod: modInfo.name});

        if (initRes.status != 200) {
            logger.log("API error");
            throw getApiError(initRes.data);
        }
    
        logger.log("uploading mod");
        const uploadRes = await instance.post(initRes.data.upload_url, {file: fileBuffer, description: modInfo.description});
    
        if (uploadRes.status != 200) {
            logger.log("upload error");
            throw getApiError(uploadRes.data);
        }
    } catch (error) {
        logger.log("error");
        throw getMiscError(error);
    }

    logger.log("publish complete");
    return true;
}

async function uploadMod(config, context, modInfo, archiveFile) {
    const instance = getAxiosInstance(config, context);
    const buf = await readFile(join(context.cwd, archiveFile));

    if (!(await updateMod(config, context, instance, modInfo, buf))) {
        await publishMod(config, context, instance, modInfo, buf);
    }
}


module.exports = {
    getToken,
    getAxiosInstance,
    verifyToken,
    updateMod,
    publishMod,
    uploadMod
};
