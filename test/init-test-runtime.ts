import { JSDOM } from "jsdom";

export const dom = new JSDOM(`<!DOCTYPE html><div id="app"></div>`);
global.document = dom.window.document;
