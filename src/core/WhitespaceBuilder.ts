import { trimSpacesEnd } from '../utils';
import Indentation from './Indentation';

/** Whitespace modifiers to be used with add() method */
export enum WS {
  SPACE = 1, // Adds single space
  NO_SPACE = 2, // Removes preceding spaces (if any)
  NEWLINE = 3, // Adds single newline
  NO_NEWLINE = 4, // Removes all preceding whitespace (including newlines)
  INDENT = 5, // Adds indentation (as much as needed for current indentation level)
  SINGLE_INDENT = 6, // Adds whitespace for single indentation step
}

/**
 * API for constructing SQL string (especially the whitespace part).
 *
 * It hides the internal implementation, so it can be rewritten to
 * use something more efficient than current string concatenation.
 */
export default class WhitespaceBuilder {
  private query = '';

  constructor(private indentation: Indentation) {}

  /**
   * Appends token strings and whitespace modifications to SQL string.
   */
  public add(...items: (WS | string)[]) {
    for (const item of items) {
      switch (item) {
        case WS.SPACE:
          this.query += ' ';
          break;
        case WS.NO_SPACE:
          this.query = trimSpacesEnd(this.query);
          break;
        case WS.NEWLINE:
          this.addNewline();
          break;
        case WS.NO_NEWLINE:
          this.query = this.query.trimEnd();
          break;
        case WS.INDENT:
          this.query += this.indentation.getIndent();
          break;
        case WS.SINGLE_INDENT:
          this.query += this.indentation.getSingleIndent();
          break;
        default:
          this.query += item;
      }
    }
  }

  private addNewline() {
    this.query = trimSpacesEnd(this.query);
    if (!this.query.endsWith('\n') && this.query !== '') {
      this.query += '\n';
    }
  }

  /**
   * Returns the final SQL string.
   */
  public toString(): string {
    return this.query;
  }
}
