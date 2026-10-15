/**
 * NoticeSense AI — Verification Engine
 * Core Principle: TRUSTWORTHY AI OVER CONFIDENT GUESSING.
 * 
 * Performs deterministic substring search, entity cross-referencing,
 * and semantic consistency checks on extracted facts against the original source notice.
 */

// Normalize text for flexible fuzzy whitespace and casing comparison
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^\w\s\d₹$€£%.,/:-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministic check whether an excerpt exists in the notice
 */
function findExcerptInSource(excerpt, sourceText) {
  if (!excerpt || typeof excerpt !== 'string' || !sourceText) {
    return { found: false, matchType: 'none', index: -1 };
  }

  const cleanExcerpt = excerpt.trim();
  if (cleanExcerpt.length === 0) {
    return { found: false, matchType: 'empty', index: -1 };
  }

  // 1. Direct exact match
  const exactIndex = sourceText.indexOf(cleanExcerpt);
  if (exactIndex !== -1) {
    return { found: true, matchType: 'exact', index: exactIndex, matchedText: cleanExcerpt };
  }

  // 2. Case-insensitive match
  const lowerSource = sourceText.toLowerCase();
  const lowerExcerpt = cleanExcerpt.toLowerCase();
  const ciIndex = lowerSource.indexOf(lowerExcerpt);
  if (ciIndex !== -1) {
    return {
      found: true,
      matchType: 'case_insensitive',
      index: ciIndex,
      matchedText: sourceText.substring(ciIndex, ciIndex + cleanExcerpt.length)
    };
  }

  // 3. Normalized whitespace & punctuation match
  const normSource = normalizeText(sourceText);
  const normExcerpt = normalizeText(cleanExcerpt);
  const normIndex = normSource.indexOf(normExcerpt);
  if (normIndex !== -1) {
    return { found: true, matchType: 'normalized', index: normIndex, matchedText: cleanExcerpt };
  }

  // 4. Sub-segment sliding window (handles minor quote clipping)
  if (normExcerpt.length > 25) {
    const head = normExcerpt.substring(0, 20);
    const tail = normExcerpt.substring(normExcerpt.length - 20);
    const headIdx = normSource.indexOf(head);
    const tailIdx = normSource.indexOf(tail);
    if (headIdx !== -1 && tailIdx !== -1 && tailIdx >= headIdx) {
      return { found: true, matchType: 'fuzzy_window', index: headIdx, matchedText: cleanExcerpt };
    }
  }

  return { found: false, matchType: 'not_found', index: -1 };
}

/**
 * Verify a single extracted deadline
 */
function verifyDeadline(item, sourceText) {
  const excerptResult = findExcerptInSource(item.evidence, sourceText);

  // If evidence quote is not found in source text
  if (!excerptResult.found) {
    return {
      ...item,
      verification_status: 'Not found in notice',
      badge_class: 'status-not-found',
      confidence_score: 0.2,
      verification_notes: 'The cited supporting evidence could not be located in the original notice text. Manual review required.',
      verified_evidence: item.evidence || null,
      source_position: -1
    };
  }

  // Check whether the date text or numbers appear in the evidence or notice
  const dateTokens = (item.date_text || '').match(/\d+|[A-Za-z]{3,9}/g) || [];
  const evidenceNorm = normalizeText(item.evidence);
  const hasDateMatch = dateTokens.some(token => evidenceNorm.includes(token.toLowerCase()));

  // Detect potential date confusion: event start vs submission deadline
  const lowerEv = evidenceNorm.toLowerCase();
  const isSubmissionKeyword = /last date|submission|submit|apply before|due by|deadline|latest by/i.test(lowerEv);
  const isEventKeyword = /commences|scheduled on|held on|event date|exam date|symposium date/i.test(lowerEv);

  let status = 'Supported by notice';
  let badgeClass = 'status-supported';
  let notes = 'Citing verbatim passage found in notice. Date tokens match source context.';
  let confidence = 0.95;

  if (!hasDateMatch) {
    status = 'Needs review';
    badgeClass = 'status-review';
    confidence = 0.6;
    notes = 'The cited passage exists, but the exact date text was not explicitly detected within the excerpt.';
  } else if (isEventKeyword && !isSubmissionKeyword && /submission|submit|apply|register|deadline/i.test(item.description || '')) {
    status = 'Conflicting information';
    badgeClass = 'status-conflict';
    confidence = 0.5;
    notes = 'Notice excerpt describes an event date rather than an explicit application submission deadline. Verify context.';
  }

  return {
    ...item,
    verification_status: status,
    badge_class: badgeClass,
    confidence_score: confidence,
    verification_notes: notes,
    verified_evidence: item.evidence,
    source_position: excerptResult.index
  };
}

/**
 * Verify fee and financial details
 */
function verifyFee(item, sourceText) {
  const excerptResult = findExcerptInSource(item.evidence, sourceText);

  if (!excerptResult.found) {
    return {
      ...item,
      verification_status: 'Not found in notice',
      badge_class: 'status-not-found',
      confidence_score: 0.2,
      verification_notes: 'Evidence passage for fee details was not found in the original document.'
    };
  }

  // Verify numerical amount is in evidence
  const amountDigits = (item.amount || '').replace(/[^\d]/g, '');
  const evidenceDigits = (item.evidence || '').replace(/[^\d]/g, '');
  const hasDigitMatch = amountDigits && evidenceDigits.includes(amountDigits);

  let status = 'Supported by notice';
  let badgeClass = 'status-supported';
  let notes = 'Fee amount and payment condition verified against source text.';
  let confidence = 0.92;

  if (amountDigits && !hasDigitMatch) {
    status = 'Needs review';
    badgeClass = 'status-review';
    confidence = 0.65;
    notes = `Extracted amount (${item.amount}) digits do not precisely match the cited evidence excerpt.`;
  }

  return {
    ...item,
    verification_status: status,
    badge_class: badgeClass,
    confidence_score: confidence,
    verification_notes: notes,
    verified_evidence: item.evidence,
    source_position: excerptResult.index
  };
}

/**
 * Verify general extracted fact (eligibility, required docs, contact)
 */
function verifyGenericFact(item, sourceText, categoryName) {
  const excerpt = typeof item === 'string' ? null : item.evidence;
  const description = typeof item === 'string' ? item : (item.description || item.item || item.condition || item.rule || '');

  if (!excerpt) {
    // If model didn't supply an explicit evidence quote, try searching for the description directly
    const directSearch = findExcerptInSource(description, sourceText);
    return {
      description,
      evidence: directSearch.found ? directSearch.matchedText : null,
      verification_status: directSearch.found ? 'Supported by notice' : 'Needs review',
      badge_class: directSearch.found ? 'status-supported' : 'status-review',
      confidence_score: directSearch.found ? 0.85 : 0.6,
      verification_notes: directSearch.found
        ? 'Matched directly from text.'
        : 'Inferred by model without verbatim excerpt; review original text.'
    };
  }

  const excerptResult = findExcerptInSource(excerpt, sourceText);

  if (!excerptResult.found) {
    return {
      ...item,
      description,
      verification_status: 'Not found in notice',
      badge_class: 'status-not-found',
      confidence_score: 0.2,
      verification_notes: `Cited evidence for ${categoryName} could not be matched in source text.`
    };
  }

  return {
    ...item,
    description,
    verification_status: 'Supported by notice',
    badge_class: 'status-supported',
    confidence_score: 0.9,
    verification_notes: `Passage confirmed in notice at character position ${excerptResult.index}.`,
    source_position: excerptResult.index
  };
}

/**
 * Run comprehensive verification pipeline across all extracted facts
 */
function verifyAnalysis(rawAnalysis, sourceText) {
  const verified = { ...rawAnalysis };

  // 1. Verify deadlines
  if (Array.isArray(verified.deadlines)) {
    verified.deadlines = verified.deadlines.map(d => verifyDeadline(d, sourceText));
  } else {
    verified.deadlines = [];
  }

  // 2. Verify eligibility criteria
  if (Array.isArray(verified.eligibility)) {
    verified.eligibility = verified.eligibility.map(e => verifyGenericFact(e, sourceText, 'eligibility'));
  } else {
    verified.eligibility = [];
  }

  // 3. Verify required documents
  if (Array.isArray(verified.required_documents)) {
    verified.required_documents = verified.required_documents.map(d => verifyGenericFact(d, sourceText, 'document'));
  } else {
    verified.required_documents = [];
  }

  // 4. Verify fees
  if (Array.isArray(verified.fees)) {
    verified.fees = verified.fees.map(f => verifyFee(f, sourceText));
  } else {
    verified.fees = [];
  }

  // 5. Verify instructions / steps
  if (Array.isArray(verified.instructions)) {
    verified.instructions = verified.instructions.map(i => verifyGenericFact(i, sourceText, 'instruction'));
  } else {
    verified.instructions = [];
  }

  // 6. Verify contact info if present
  if (verified.contact_details && typeof verified.contact_details === 'object') {
    if (verified.contact_details.evidence) {
      const cRes = findExcerptInSource(verified.contact_details.evidence, sourceText);
      verified.contact_details.verification_status = cRes.found ? 'Supported by notice' : 'Needs review';
      verified.contact_details.badge_class = cRes.found ? 'status-supported' : 'status-review';
    }
  }

  // 7. Calculate aggregate verification metrics
  const allVerifiedItems = [
    ...(verified.deadlines || []),
    ...(verified.eligibility || []),
    ...(verified.required_documents || []),
    ...(verified.fees || []),
    ...(verified.instructions || [])
  ];

  const totalFacts = allVerifiedItems.length;
  const supportedCount = allVerifiedItems.filter(i => i.verification_status === 'Supported by notice').length;
  const reviewCount = allVerifiedItems.filter(i => i.verification_status === 'Needs review').length;
  const notFoundCount = allVerifiedItems.filter(i => i.verification_status === 'Not found in notice').length;
  const conflictCount = allVerifiedItems.filter(i => i.verification_status === 'Conflicting information').length;

  verified.verification_summary = {
    total_facts: totalFacts,
    supported: supportedCount,
    needs_review: reviewCount,
    not_found: notFoundCount,
    conflicts: conflictCount,
    trust_score: totalFacts > 0 ? Math.round((supportedCount / totalFacts) * 100) : 100
  };

  return verified;
}

module.exports = {
  findExcerptInSource,
  verifyDeadline,
  verifyFee,
  verifyGenericFact,
  verifyAnalysis
};
