import { fail, ok, type ApiError, type PaginatedResult, type PaginationQuery, type Result } from '../types';

describe('Result type helpers', () => {
  describe('ok()', () => {
    it('returns a Success with ok=true', () => {
      const result = ok(42);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(42);
      }
    });

    it('works with string value', () => {
      const result = ok('hello');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('hello');
      }
    });

    it('works with object value', () => {
      const result = ok({ id: '123', name: 'test' });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('123');
      }
    });
  });

  describe('fail()', () => {
    it('returns a Failure with ok=false', () => {
      const result = fail('something went wrong');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('something went wrong');
      }
    });

    it('works with an object error', () => {
      const result = fail({ code: 'NOT_FOUND', message: 'resource not found' });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('Result discriminated union', () => {
    it('narrows correctly in a switch', () => {
      const process = (r: Result<number>): string => {
        if (r.ok) {
          return `value: ${r.value}`;
        } else {
          return `error: ${r.error}`;
        }
      };

      expect(process(ok(5))).toBe('value: 5');
      expect(process(fail('oops'))).toBe('error: oops');
    });
  });
});

describe('ApiError interface', () => {
  it('accepts a minimal ApiError', () => {
    const err: ApiError = { code: 'VALIDATION_ERROR', message: 'Invalid input' };
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Invalid input');
    expect(err.details).toBeUndefined();
  });

  it('accepts an ApiError with details', () => {
    const err: ApiError = {
      code: 'BAD_REQUEST',
      message: 'Bad request',
      details: { field: 'email', reason: 'invalid format' },
    };
    expect(err.details).toBeDefined();
  });
});

describe('PaginationQuery interface', () => {
  it('accepts a valid pagination query', () => {
    const query: PaginationQuery = { page: 1, pageSize: 25 };
    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(25);
  });
});

describe('PaginatedResult interface', () => {
  it('accepts a typed paginated result', () => {
    const result: PaginatedResult<{ id: string }> = {
      items: [{ id: 'a' }, { id: 'b' }],
      total: 50,
      page: 1,
      pageSize: 2,
    };
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(50);
  });
});
