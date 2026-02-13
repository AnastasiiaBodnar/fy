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
        if (document.querySelector) {
            return document.querySelector(selector);
        }
        
        const filter = (elem) => {
            if (!elem.attribs) return false;
            
            if (selector.startsWith('.')) {
                const className = selector.substring(1);
                return elem.attribs.class?.split(' ').includes(className);
            }
            if (selector.startsWith('#')) {
                return elem.attribs.id === selector.substring(1);
            }
            return elem.name === selector;
        };
        
        const children = document.children || [document];
        return DomUtils.findOne(filter, children, true);
    }

    querySelectorAll(document, selector) {
        if (document.querySelectorAll) {
            return document.querySelectorAll(selector);
        }
        
        const filter = (elem) => {
            if (!elem.attribs) return false;
            
            if (selector.startsWith('.')) {
                const className = selector.substring(1);
                return elem.attribs.class?.split(' ').includes(className);
            }
            if (selector.startsWith('#')) {
                return elem.attribs.id === selector.substring(1);
            }
            return elem.name === selector;
        };
        
        const children = document.children || [document];
        return DomUtils.findAll(filter, children);
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