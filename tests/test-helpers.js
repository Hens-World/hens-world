import {JSDOM} from 'jsdom';
import fs from 'fs';
import path from 'path';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import 'angular-mocks';
import * as pkg from 'package.json';

let dom;
let container;

import '/src/app/app.js';

export function GetContainer() {
    dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <p>Hello world</p>
</body>
</html>
`, {runScripts: 'dangerously'});
    
    container = dom.window.document.body;
    return [dom, container];
}
