import { CONFIG } from '../config';
export const dbg = CONFIG.DEBUG ? console.log.bind(console, '[TGA]') : () => {};
