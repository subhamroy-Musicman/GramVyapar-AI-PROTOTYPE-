import { describe, expect, it } from 'vitest';

// We just want to ensure that the buttons in AIAdvisory have type="button"
// to prevent form submission bugs.
describe('AIAdvisory buttons', () => {
  it('action buttons should have explicit type="button"', () => {
    // A simple smoke test matching the DOM structure.
    // In actual unit tests, you'd render the component and assert on the DOM.
    // Given the component relies on many hooks and contexts (LanguageContext, fetch, etc),
    // we'll just parse the component text for this regression test.
    
    // Instead of a full mount which requires mocking all contexts:
    const fs = require('fs');
    const path = require('path');
    const sourceCode = fs.readFileSync(path.join(__dirname, 'AIAdvisory.tsx'), 'utf-8');
    
    // Regression check: No <button> without type="button"
    const buttonRegex = /<button(?![^>]*type="button")[^>]*>/g;
    const matches = sourceCode.match(buttonRegex);
    
    expect(matches).toBeNull();
  });
});
