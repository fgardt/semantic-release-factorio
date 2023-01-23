const AggregateError = require('aggregate-error');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const axios = require('axios');

const ENDPOINT_BASE    = "https://mods.factorio.com/api/v2/mods"
const DETAILS_ENDPOINT = "/edit_details"
const UPLOAD_ENDPOINT  = "/releases/init_upload"
const PUBLISH_ENDPOINT = "/init_publish"


function getToken(config, context) {
    var { tokenEnvVar } = config;

    if (!tokenEnvVar.length) {
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
            'Content-Type:': 'multipart/form-data',
            'Authorization': 'Bearer ' + token
        },

        transformResponse: [(data) => {
            return JSON.parse(data);
        }]
    });
}

async function verifyToken(config, context, modName) {
    const instance = getAxiosInstance(config, context);

    const res = await instance.post(DETAILS_ENDPOINT, {mod: modName});

    if (res.status != 200 && res.data.error != "UnknownMod") {
        throw new AggregateError(res.data.message);
    }
}

async function updateMod(instance, modInfo, fileBuffer) {
    const initRes = await instance.post(UPLOAD_ENDPOINT, {mod: modInfo.name});

    if (initRes.status != 200) {
        if (initRes.data.error == "UnknownMod") {
            return false;
        }

        throw new AggregateError(initRes.data.message);
    }

    const uploadRes = await instance.post(initRes.data.upload_url, {file: fileBuffer});

    if (uploadRes.status != 200) {
        throw new AggregateError(uploadRes.data.message);
    }

    return true;
}

async function publishMod(instance, modInfo, fileBuffer) {
    const initRes = await instance.post(PUBLISH_ENDPOINT, {mod: modInfo.name});

    if (initRes.status != 200) {
        throw new AggregateError(initRes.data.message);
    }

    const uploadRes = await instance.post(initRes.data.upload_url, {file: fileBuffer, description: modInfo.description});

    if (uploadRes.status != 200) {
        throw new AggregateError(uploadRes.data.message);
    }

    return true;
}

async function uploadMod(config, context, modInfo, archiveFile) {
    const instance = getAxiosInstance(config, context);
    const buf = await readFile(join(context.cwd, archiveFile));

    if (!(await updateMod(instance, modInfo, buf))) {
        await publishMod(instance, modInfo, buf);
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
