/* semantic-release lifecycles used:
 * `verifyConditions`: check mod portal token, ...
 * `prepare`: update changelog.txt and info.json + package mod in zip
 * `publish`: push update to mod portal
 */

const { promisify } = require('node:util');
const exec = promisify(require('node:child_process').exec);
const AggregateError = require('aggregate-error');

const { verifyToken, uploadMod } = require('./lib/mod-portal.js');
const { isInfoValid, readInfoFile, updateInfo } = require('./lib/mod-info.js');


async function verifyConditions(config, context) {
    const { logger } = context;
    const errors = [];

    try {
        logger.log("verifying factorio mod info.json..");

        const info = await readInfoFile(config, context);
        isInfoValid(info);

        logger.log("info.json valid. checking api token..")

        await verifyToken(config, context, info.name);

        logger.log("api token valid.");
    } catch (error) {
        errors.push(error)
    }

    if (errors.length > 0) {
        throw new AggregateError(errors);
    }
}

async function prepare(config, context) {
    const errors = [];

    try {
        await updateInfo(config, context);
    } catch (error) {
        errors.push(error);
    }
    
    if (errors.length > 0) {
        throw new AggregateError(errors);
    }
}

async function publish(config, context) {
    const errors = [];

    try {
        const info = await readInfoFile(config, context);

        const archiveFile = [info.name, "_", info.version, ".zip"].join();
        const archiveCommand = "git archive --format zip --prefix " + info.name +
                "/ --worktree-attributes --output " + archiveFile + " HEAD";

        const { stdout0, stderr0 } = await exec(archiveCommand);

        await uploadMod(config, context, info, archiveFile);
    } catch (error) {
        errors.push(error);
    }
    
    if (errors.length > 0) {
        throw new AggregateError(errors);
    }
}

export { verifyConditions, prepare, publish };
