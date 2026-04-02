import DOMPurify from 'dompurify';

export const sanitize = (dirty) => DOMPurify.sanitize(dirty ?? '');