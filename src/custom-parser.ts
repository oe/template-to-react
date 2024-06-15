import peg from 'pegjs'
// import fs from 'fs'
import { htmlSyntax } from './syntax';

// Load the PEG.js grammar from the generated file
// const grammar = fs.readFileSync('./grammar.js', 'utf8');

// Create a PEG.js parser
const parser = peg.generate(htmlSyntax);

// Parse some input
const input = '<div class="test">Hello, world!</div>';
const output = parser.parse(input);

console.log('parser:');
console.log(output);