import {
  tagAsPii,
  tagAsSensitive,
  tagAsPiiAndSensitive,
  isPiiField,
  maskPiiField,
  maskPiiString,
  maskAllPiiFields,
  extractPiiFieldKeys,
} from '../pii';

describe('tagAsPii', () => {
  it('wraps a string with PII tag', () => {
    const f = tagAsPii('john.doe@example.com');
    expect(f.value).toBe('john.doe@example.com');
    expect(f.tags).toContain('PII');
  });

  it('wraps a number with PII tag', () => {
    const f = tagAsPii(12345);
    expect(f.value).toBe(12345);
    expect(f.tags).toContain('PII');
  });
});

describe('tagAsSensitive', () => {
  it('wraps a value with SENSITIVE tag', () => {
    const f = tagAsSensitive('salary-band-5');
    expect(f.tags).toContain('SENSITIVE');
    expect(f.tags).not.toContain('PII');
  });
});

describe('tagAsPiiAndSensitive', () => {
  it('wraps a value with both PII and SENSITIVE tags', () => {
    const f = tagAsPiiAndSensitive('john@example.com');
    expect(f.tags).toContain('PII');
    expect(f.tags).toContain('SENSITIVE');
  });
});

describe('isPiiField', () => {
  it('returns true for a PiiField value', () => {
    expect(isPiiField(tagAsPii('x'))).toBe(true);
  });

  it('returns false for a plain string', () => {
    expect(isPiiField('plain')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isPiiField(null)).toBe(false);
  });

  it('returns false for an object missing tags', () => {
    expect(isPiiField({ value: 'x' })).toBe(false);
  });

  it('returns false for an object with invalid tag', () => {
    expect(isPiiField({ value: 'x', tags: ['CLASSIFIED'] })).toBe(false);
  });
});

describe('maskPiiField', () => {
  it('replaces the value with the mask for a PII field', () => {
    const f = tagAsPii('real@email.com');
    const masked = maskPiiField(f, '[REDACTED]');
    expect(masked.value).toBe('[REDACTED]');
  });

  it('replaces the value for a SENSITIVE field', () => {
    const f = tagAsSensitive('salary-data');
    const masked = maskPiiField(f, '[HIDDEN]');
    expect(masked.value).toBe('[HIDDEN]');
  });

  it('does not mask a field with no PII or SENSITIVE tag', () => {
    const f = { value: 'public-data', tags: ['ENCRYPTED'] as const };
    const masked = maskPiiField(f, '[REDACTED]');
    expect(masked.value).toBe('public-data');
  });
});

describe('maskPiiString', () => {
  it('replaces value with [REDACTED]', () => {
    const f = tagAsPii('John Doe');
    const masked = maskPiiString(f);
    expect(masked.value).toBe('[REDACTED]');
  });
});

describe('maskAllPiiFields', () => {
  it('masks all PiiField<string> properties', () => {
    const record = {
      name: tagAsPii('John Doe'),
      department: 'Engineering',
      salary: tagAsSensitive('100000'),
    };
    const masked = maskAllPiiFields(record);
    expect(masked.name.value).toBe('[REDACTED]');
    expect(masked.department).toBe('Engineering');
    expect(masked.salary.value).toBe('[REDACTED]');
  });

  it('leaves non-PiiField properties unchanged', () => {
    const record = { count: 42, label: 'test' };
    const masked = maskAllPiiFields(record);
    expect(masked.count).toBe(42);
    expect(masked.label).toBe('test');
  });
});

describe('extractPiiFieldKeys', () => {
  it('returns keys of PiiField properties', () => {
    const record = {
      name: tagAsPii('Alice'),
      entityId: 'ent-001',
      salary: tagAsSensitive('80000'),
    };
    const keys = extractPiiFieldKeys(record);
    expect(keys).toContain('name');
    expect(keys).toContain('salary');
    expect(keys).not.toContain('entityId');
  });

  it('returns empty array when no PiiField properties exist', () => {
    const record = { a: 1, b: 'hello' };
    expect(extractPiiFieldKeys(record)).toHaveLength(0);
  });
});
