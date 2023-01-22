/* semantic-release lifecycles used:
 * `verifyConditions`: check mod portal token, ...
 * `verifyRelease`: check if version format is factorio compliant
 * `prepare`: update changelog.txt and info.json + package mod in zip
 * `publish`: push update to mod portal
 */

import { promisify } from 'node:util';
import AggregateError from 'aggregate-error';

const exec = promisify(require('child_process').exec);
const changelog = require('./lib/changelog');
const portal = require('./lib/mod-portal');
const modInfo = require('./lib/mod-info');

async function verifyConditions(config, context) {
    const errors = [];

    try {
        const info = await modInfo.readInfoFile(config, context);
        modInfo.isInfoValid(info);

        await portal.verifyToken(config, context, modInfo.name);
    } catch (error) {
        errors.push(error)
    }

    if (errors.length > 0) {
        throw new AggregateError(errors);
    }
}

// async function verifyRelease(config, context) {
//     const errors = [];
//     
//     if (errors.length > 0) {
//         throw new AggregateError(errors);
//     }
// }

async function prepare(config, context) {
    const errors = [];

    try {
        await modInfo.updateInfo(config, context);
        await changelog.updateChangelog(config, context);
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
        const info = await modInfo.readInfoFile(config, context);

        const archiveFile = [info.name, "_", info.version, ".zip"].join();
        const archiveCommand = "git archive --format zip --prefix " + info.name +
                "/ --worktree-attributes --output " + archiveFile + " HEAD";

        const { stdout0, stderr0 } = await exec(archiveCommand);

        await portal.uploadMod(config, context, info, archiveFile);

        const deleteArchiveCommand = "rm -f" + archiveFile;
        const { stdout1, stderr1 } = await exec(deleteArchiveCommand);
    } catch (error) {
        errors.push(error);
    }
    
    if (errors.length > 0) {
        throw new AggregateError(errors);
    }
}

module.exports = { verifyConditions, /* verifyRelease, */ prepare, publish };
