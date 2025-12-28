# SEARCH-007: Advanced Query Syntax - Parser Core

**Priority:** P1
**Phase:** 1 - Core Search Enhancements
**Status:** Not Started
**Estimated Effort:** 2 days
**Dependencies:** None

---

## Overview

Create a query parser that transforms human-readable boolean queries into source-specific search syntax. This enables advanced search capabilities across Solr-based sources (Trove, PROV, ALA).

**Supported Syntax:**
```
"exact phrase"           → Phrase search
word1 AND word2          → Both terms required
word1 OR word2           → Either term matches
NOT word                 → Exclude term
word1 -word2             → Include word1, exclude word2
field:value              → Field-specific search
(group1) AND (group2)    → Logical grouping
word*                    → Wildcard prefix
```

---

## Files to Create

| File | Description |
|------|-------------|
| `src/core/query/types.ts` | Query AST node types |
| `src/core/query/lexer.ts` | Tokenizer for query strings |
| `src/core/query/parser.ts` | Parse tokens into AST |
| `src/core/query/index.ts` | Module exports |

## Files to Modify

| File | Change |
|------|--------|
| `src/core/types.ts` | Export query module |

---

## Subtasks

### 1. Define Query AST Types
- [ ] Create `src/core/query/types.ts`:
  ```typescript
  type QueryNode =
    | TermNode
    | PhraseNode
    | FieldNode
    | BooleanNode
    | NotNode
    | GroupNode
    | WildcardNode;

  interface TermNode {
    type: 'term';
    value: string;
  }

  interface PhraseNode {
    type: 'phrase';
    value: string;  // Without quotes
  }

  interface FieldNode {
    type: 'field';
    field: string;
    value: QueryNode;
  }

  interface BooleanNode {
    type: 'and' | 'or';
    left: QueryNode;
    right: QueryNode;
  }

  interface NotNode {
    type: 'not';
    operand: QueryNode;
  }

  interface GroupNode {
    type: 'group';
    child: QueryNode;
  }

  interface WildcardNode {
    type: 'wildcard';
    prefix: string;
  }

  interface ParseResult {
    ast: QueryNode | null;
    errors: ParseError[];
  }
  ```

### 2. Create Lexer (Tokenizer)
- [ ] Create `src/core/query/lexer.ts`
- [ ] Define token types:
  ```typescript
  type TokenType =
    | 'TERM'       // word
    | 'PHRASE'     // "quoted phrase"
    | 'AND'        // AND
    | 'OR'         // OR
    | 'NOT'        // NOT or -
    | 'LPAREN'     // (
    | 'RPAREN'     // )
    | 'COLON'      // :
    | 'WILDCARD'   // *
    | 'EOF';
  ```
- [ ] Implement `tokenize(query: string): Token[]`
- [ ] Handle quoted strings with escaping
- [ ] Handle operators (case-insensitive AND/OR/NOT)
- [ ] Handle field:value syntax
- [ ] Handle wildcards

### 3. Create Parser
- [ ] Create `src/core/query/parser.ts`
- [ ] Implement recursive descent parser
- [ ] Parse expression with operator precedence:
  - Highest: NOT
  - Middle: AND
  - Lowest: OR
- [ ] Handle grouping with parentheses
- [ ] Handle implicit AND between terms (optional)
- [ ] Return AST or parse errors

### 4. Implement Parse Functions
- [ ] `parseExpression()` - Top-level OR expressions
- [ ] `parseAndExpression()` - AND expressions
- [ ] `parseUnaryExpression()` - NOT expressions
- [ ] `parsePrimaryExpression()` - Terms, phrases, groups, fields
- [ ] Error recovery and helpful error messages

### 5. Create Query Utilities
- [ ] `isSimpleQuery(query)` - Check if query needs parsing
- [ ] `validateQuery(query)` - Validate syntax without full parse
- [ ] `prettyPrint(ast)` - Debug output for AST

### 6. Export Module
- [ ] Create `src/core/query/index.ts`
- [ ] Export parser, types, utilities
- [ ] Add to core exports

### 7. Testing
- [ ] Test simple term queries
- [ ] Test phrase queries with quotes
- [ ] Test AND/OR/NOT operators
- [ ] Test nested parentheses
- [ ] Test field:value syntax
- [ ] Test wildcard queries
- [ ] Test error handling for malformed queries
- [ ] Test edge cases (empty query, only operators, etc.)

### 8. Documentation
- [ ] Document query syntax in code comments
- [ ] Create `docs/dev-guides/query-syntax.md` user guide
- [ ] Add syntax examples

---

## Query Examples & AST

```
Query: "gold rush" AND victoria
AST: {
  type: 'and',
  left: { type: 'phrase', value: 'gold rush' },
  right: { type: 'term', value: 'victoria' }
}

Query: railway OR tramway -melbourne
AST: {
  type: 'or',
  left: { type: 'term', value: 'railway' },
  right: {
    type: 'and',  // Implicit AND
    left: { type: 'term', value: 'tramway' },
    right: { type: 'not', operand: { type: 'term', value: 'melbourne' } }
  }
}

Query: creator:lawson AND subject:bushrangers
AST: {
  type: 'and',
  left: { type: 'field', field: 'creator', value: { type: 'term', value: 'lawson' } },
  right: { type: 'field', field: 'subject', value: { type: 'term', value: 'bushrangers' } }
}
```

---

## Operator Precedence

| Precedence | Operator | Example |
|------------|----------|---------|
| 1 (highest) | NOT / - | `-melbourne` |
| 2 | AND | `gold AND rush` |
| 3 (lowest) | OR | `railway OR tramway` |

**Note:** Implicit AND between adjacent terms (configurable).

---

## Acceptance Criteria

- [ ] Lexer correctly tokenizes all supported syntax
- [ ] Parser produces valid AST for valid queries
- [ ] Parser returns helpful errors for invalid queries
- [ ] All operators work with correct precedence
- [ ] Phrase queries preserve spaces and punctuation
- [ ] Field:value syntax works correctly
- [ ] Wildcards are recognized
- [ ] Tests cover all syntax elements

---

## Notes

- Parser is source-agnostic - builders convert AST to source syntax
- Keep parser simple - don't try to handle all Lucene syntax
- Implicit AND is common user expectation (space = AND)
- Error messages should be user-friendly
- Consider adding query validation tool for debugging
