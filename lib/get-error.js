const SemanticReleaseError = require('@semantic-release/error');


function getApiError(errorData) {
    return new SemanticReleaseError(errorData.message, errorData.error);
}

function getMiscError(error) {
    return new SemanticReleaseError(error.message, error.code);
}

module.exports = { getApiError, getMiscError };
