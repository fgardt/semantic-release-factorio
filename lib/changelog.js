import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

function getChangelogFilePath(config, context) {
    return join(context.cwd, "./changelog.txt");
}

async function readChangelogFile(config, context) {
    return await readFile(getChangelogFilePath(config, context), "utf-8");
}

async function writeChangelogFile(config, context, content) {
    await writeFile(getChangelogFilePath(config, context), content);
}

async function updateChangelog(config, context) {
    const current = await readChangelogFile(config, context);

    const updated = [...context.nextRelease.notes.split("\n"), ...current.split("\n")].filter(Boolean).join("\n");

    await writeChangelogFile(config, context, updated);
}


module.exports = {
    getChangelogFilePath,
    readChangelogFile,
    writeChangelogFile,
    updateChangelog
}
