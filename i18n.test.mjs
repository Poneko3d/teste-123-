import assert from 'node:assert/strict';import {translate} from './src/i18n.js';
assert.equal(translate(' Montar tudo '),' Assemble all ');
assert.equal(translate('2 grupos selecionados · 7753 triângulos'),'2 groups selected · 7753 triangles');
assert.equal(translate('✓ Reparo: 1 buracos fechados · frestas unidas'),'✓ Repair: 1 holes filled · gaps welded');
assert.equal(translate('Cortando user-model.obj…'),'Cutting user-model.obj…');
assert.equal(translate('user-model.obj'),'user-model.obj');
assert.equal(translate('Prolongar encaixe além da espessura'),'Extend connector beyond patch thickness');
console.log('Passed translations: static labels, dynamic selection and repair messages, preserved filenames.');

assert.equal(translate('3 pontos · fechado · ponto 2 selecionado'),'3 points · closed · point 2 selected');
