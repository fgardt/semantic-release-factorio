/* semantic-release lifecycles used:
 * `verifyConditions`: check mod portal token, ...
 * (`verifyRelease`: check if version format is factorio compliant)
 * `prepare`: update changelog.txt and info.json + package mod in zip
 * `publish`: push update to mod portal
 */

import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import AggregateError from 'aggregate-error';

import { verifyToken, uploadMod } from './lib/mod-portal.js';
import { isInfoValid, readInfoFile, updateInfo } from './lib/mod-info.js';

const execPromise = promisify(exec);


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

        const { stdout0, stderr0 } = await execPromise(archiveCommand);

        await uploadMod(config, context, info, archiveFile);

        //const deleteArchiveCommand = "rm -f" + archiveFile;
        //const { stdout1, stderr1 } = await execPromise(deleteArchiveCommand);
    } catch (error) {
        errors.push(error);
    }
    
    if (errors.length > 0) {
        throw new AggregateError(errors);
    }
}

export { verifyConditions, /* verifyRelease, */ prepare, publish };
