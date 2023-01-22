import { readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

function getChangelogFilePath(config, context) {
    return join(context.cwd, "./changelog.txt");
}

async function checkChangelogFileExists(config, context) {
    try {
        await access(getChangelogFilePath(config, context));
        return true;
    } catch {
        return false;
    }
}

async function readChangelogFile(config, context) {
    return await readFile(getChangelogFilePath(config, context), "utf-8");
}

async function writeChangelogFile(config, context, content) {
    await writeFile(getChangelogFilePath(config, context), content);
}

async function updateChangelog(config, context) {
    var current = "";

    if (checkChangelogFileExists(config, context)) {
        current = await readChangelogFile(config, context);
    }

    const updated = [...context.nextRelease.notes.split("\n"), ...current.split("\n")].filter(Boolean).join("\n");

    await writeChangelogFile(config, context, updated);
}


module.exports = {
    getChangelogFilePath,
    checkChangelogFileExists,
    readChangelogFile,
    writeChangelogFile,
    updateChangelog
}
