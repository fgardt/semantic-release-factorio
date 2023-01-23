const { readFile, writeFile, access } = require('node:fs/promises');
const { join } = require('node:path');

const { getMiscError } = require('./get-error');


function getChangelogPath(config, context) {
    return join(context.cwd, "./changelog.txt");
}

async function readChangelogFile(config, context) {
    try {
        return (await readFile(getChangelogPath(config, context), "utf-8")).toString();
    } catch (error) {
        throw getMiscError(error);
    }
}

async function writeChangelogFile(config, context, changelog) {
    try {
        await writeFile(getChangelogPath(config, context), changelog);
    } catch (error) {
        throw getMiscError(error);
    }
}

async function updateChangelog(config, context) {
    const { logger, nextRelease: { notes } } = context;

    if (notes) {
        var changelogContent = notes.split("\n");

        try {
            await access(getChangelogPath(config, context));
            logger.log("appending release notes to changelog.txt");

            try {
                changelogContent = [...changelogContent, ...(await readChangelogFile(config, context)).split("\n")];
            } catch (error) {
                throw getMiscError(error);
            }
        } catch {
            logger.log("creating new changelog.txt");
        }

        changelogContent = changelogContent.filter(a => a.trim() != '');

        try {
            await writeChangelogFile(config, context, changelogContent.join("\n"));
        } catch (error) {
            throw getMiscError(error);
        }
    }
}

module.exports = {
    getChangelogPath,
    readChangelogFile,
    writeChangelogFile,
    updateChangelog
 };
