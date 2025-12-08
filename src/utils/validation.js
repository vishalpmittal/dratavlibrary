function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isPositiveInteger(v) {
  return Number.isInteger(v) && v >= 0;
}

function isValidDate(v) {
  if (!v) return true; // optional
  const d = Date.parse(v);
  return !Number.isNaN(d);
}

function validateAuthorPayload(body) {
  const errors = [];
  if (!body) {
    errors.push('Body is required');
    return errors;
  }
  if (!isNonEmptyString(body.firstName)) errors.push('firstName is required and must be a non-empty string');
  if (!isNonEmptyString(body.lastName)) errors.push('lastName is required and must be a non-empty string');
  return errors;
}

function validateAuthorUpdatePayload(body) {
  const errors = [];
  if (!body) return errors;
  if ('firstName' in body && !isNonEmptyString(body.firstName)) errors.push('firstName must be a non-empty string');
  if ('lastName' in body && !isNonEmptyString(body.lastName)) errors.push('lastName must be a non-empty string');
  return errors;
}

function validateBookPayload(body) {
  const errors = [];
  if (!body) {
    errors.push('Body is required');
    return errors;
  }
  if (!isNonEmptyString(body.title)) errors.push('title is required and must be a non-empty string');
  if (!('pageCount' in body) || !isPositiveInteger(body.pageCount)) errors.push('pageCount is required and must be a non-negative integer');
  if (!isValidDate(body.releaseDate)) errors.push('releaseDate must be a valid date string');

  if (body.author) {
    if (!isNonEmptyString(body.author.firstName) || !isNonEmptyString(body.author.lastName)) {
      errors.push('author must include firstName and lastName as non-empty strings');
    }
  } else if (!('authorId' in body)) {
    // allow no author (nullable), but if authorId provided must be integer
  }

  if ('authorId' in body && body.authorId != null && !Number.isInteger(body.authorId)) {
    errors.push('authorId must be an integer');
  }

  return errors;
}

function validateBookUpdatePayload(body) {
  const errors = [];
  if (!body) return errors;
  if ('title' in body && !isNonEmptyString(body.title)) errors.push('title must be a non-empty string');
  if ('pageCount' in body && !isPositiveInteger(body.pageCount)) errors.push('pageCount must be a non-negative integer');
  if ('releaseDate' in body && !isValidDate(body.releaseDate)) errors.push('releaseDate must be a valid date string');
  if ('author' in body) {
    if (!body.author || !isNonEmptyString(body.author.firstName) || !isNonEmptyString(body.author.lastName)) {
      errors.push('author must include firstName and lastName as non-empty strings');
    }
  }
  if ('authorId' in body && body.authorId != null && !Number.isInteger(body.authorId)) errors.push('authorId must be an integer');
  return errors;
}

module.exports = {
  validateAuthorPayload,
  validateAuthorUpdatePayload,
  validateBookPayload,
  validateBookUpdatePayload,
};
