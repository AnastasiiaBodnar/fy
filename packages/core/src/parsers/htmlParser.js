import { parseDocument } from 'htmlparser2';
import * as DomUtils from 'domutils';

export class HTMLParser {
    parse(html) {
        if (typeof DOMParser !== 'undefined') {
            const parser = new DOMParser();
            return parser.parseFromString(html, 'text/html');
        }

        return parseDocument(html);
    }

    querySelector(document, selector) {
        if (typeof document.querySelector === 'function') {
            return document.querySelector(selector);
        }
        // Fallback for non-browser environments (using domutils)
        const found = this.querySelectorAll(document, selector);
        return found.length > 0 ? found[0] : null;
    }

    querySelectorAll(document, selector) {
        if (typeof document.querySelectorAll === 'function') {
            return Array.from(document.querySelectorAll(selector));
        }

        // Basic selector parser support for:
        // - multiple classes: .class1.class2
        // - descendant combinator: div span
        // - simple tag/id/class

        const selectors = selector.split(/\s+/); // Split by descendant combinator

        let context = document.children || (Array.isArray(document) ? document : [document]);

        for (const part of selectors) {
            const predicate = (elem) => {
                if (!elem.attribs && !elem.name) return false;

                // Handle multiple classes e.g. .card.job-link
                if (part.startsWith('.')) {
                    const classes = part.split('.').filter(Boolean);
                    const elemClasses = (elem.attribs?.class || '').split(/\s+/);
                    return classes.every(cls => elemClasses.includes(cls));
                }

                // Handle ID
                if (part.startsWith('#')) {
                    return elem.attribs?.id === part.substring(1);
                }

                // Handle tag with classes e.g. div.mt-xs
                if (part.includes('.')) {
                    const [tag, ...classes] = part.split('.');
                    if (elem.name !== tag) return false;
                    const elemClasses = (elem.attribs?.class || '').split(/\s+/);
                    return classes.every(cls => elemClasses.includes(cls));
                }

                // Simple tag
                return elem.name === part;
            };

            // Find all matching elements in current context (recursive)
            let matches = [];
            DomUtils.findAll(predicate, context).forEach(match => matches.push(match));

            if (matches.length === 0) return [];
            context = matches; // Next iteration searches within found elements (but wait, findAll searches subtree...)

            // Actually, DomUtils.findAll returns flattened list of all matches in subtree.
            // If we have "div span", first we find all "div"s. 
            // Then for EACH div, we need to find "span"s in its subtree.
            // The logic here needs to be:
            // 1. Find all matches for first selector part in current root.
            // 2. Set these matches as new roots.
            // 3. Repeat for next selector part.

            // Correction for loop:
            // On first iteration, context is root. matches = findAll(part, context).
            // On second iteration, context should be the *children* of the matches from previous step?
            // unique matches to avoid duplicates?
            if (selectors.indexOf(part) < selectors.length - 1) {
                // Prepare context for next iteration: direct children of all found matches
                // DomUtils.findAll already searches deep. 
                // We simply need to restrict search to the subtrees of fully matched elements?
                // Actually the standard way: 
                // Context = matches.map(m => m.children).flat().filter(Boolean)
                context = matches;
            }
        }

        // Wait, the logic above is slightly flawed for "div span". 
        // 1. Find all "div"s in Document. 
        // 2. For each "div", find all "span"s.
        // The loop above:
        // 1. matches = all divs.
        // 2. context = matches.
        // 3. find all "span"s in context... findAll accepts array of elements? Yes.
        // But findAll searches *recursively*. So if we pass a div, it searches inside it.
        // So yes, `DomUtils.findAll(predicate, context)` should work if context is array of nodes.

        return context;
    }

    getText(element) {
        if (!element) return '';

        if (element.textContent !== undefined) {
            return element.textContent.trim();
        }

        return DomUtils.textContent(element).trim();
    }

    getAttribute(element, attribute) {
        if (!element) return '';

        if (element.getAttribute) {
            return element.getAttribute(attribute) || '';
        }

        return element.attribs?.[attribute] || '';
    }
}