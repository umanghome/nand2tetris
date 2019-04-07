const JUMP = {
  null: '000',
  JGT: '001',
  JEQ: '010',
  JGE: '011',
  JLT: '100',
  JNE: '101',
  JLE: '110',
  JMP: '111',
}

const DEST = {
  null: '000',
  M: '001',
  D: '010',
  MD: '011',
  A: '100',
  AM: '101',
  AD: '110',
  AMD: '111'
};

const COMP = {
  '0': '101010',
  '1': '111111',
  '-1': '111010',
  D: '001100',
  A: '110000',
  '!D': '001101',
  '!A': '110011',
  '-D': '001111',
  '-A': '110011',
  'D+1': '011111',
  'A+1': '110111',
  'D-1': '001110',
  'A-1': '110010',
  'D+A': '000010',
  'D-A': '010011',
  'A-D': '000111',
  'D&A': '000000',
  'D|A': '010101',
  M: '110000',
  '!M': '110001',
  '-M': '110011',
  'M+1': '110111',
  'M-1': '110010',
  'D+M': '000010',
  'D-M': '010011',
  'M-D': '000111',
  'D&M': '000000',
  'D|M': '010101',
};

/**
 * Input file validation.
 */
const inputFileName = process.argv[2];
if (!inputFileName) {
  console.error('No input file provided.');
  process.exit(1);
}

const fs = require('fs');
const path = require('path');
const inputFilePath = path.resolve(__dirname, inputFileName); // , 'UTF-8', callback);

if (!fs.existsSync(inputFilePath)) {
  console.error('Input file doesn\'t exist.');
  process.exit(2);
}

let fileContents = fs.readFileSync(inputFilePath, {
  encoding: 'UTF-8'
});

/**
 * All the required regexes.
 */
const REGEXES = {
  comments: /\/\/.*/,
  labels: /^\(([A-Za-z_\.\$\:][\w\.\$\:]*)\)$/,
  number: /^\d+$/,
  symbol: /^@([A-Za-z_\.\$\:][\w\.\$\:]*)$/,
  cInstruction: /^(\w+\=)?([\w\-\+\!\|\&]+)?(;\w+)?$/
};

// Remove comments and whitespace.
const stripComments = string => string.replace(REGEXES.comments, '');
fileContents = fileContents.split('\n').map(line => stripComments(line).trim()).filter(line => line.length);

/**
 * Symbol-related code.
 */
const SYMBOL_TABLE = {
  R0: 0,
  R1: 1,
  R2: 2,
  R3: 3,
  R4: 4,
  R5: 5,
  R6: 6,
  R7: 7,
  R8: 8,
  R9: 9,
  R10: 10,
  R11: 11,
  R12: 12,
  R13: 13,
  R14: 14,
  R15: 15,

  SCREEN: 16384,
  KBD: 24576,

  SP: 0,
  LCL: 1,
  ARG: 2,
  THIS: 3,
  THAT: 4,
};

const isSymbolKnown = symbol => Object.keys(SYMBOL_TABLE).indexOf(symbol) >= 0;
const getSymbolValue = symbol => SYMBOL_TABLE[symbol];
const addSymbol = (symbol, value) => SYMBOL_TABLE[symbol] = value;
let VAR_COUNT = 16;
const getOrAddSymbol = symbol => {
  if (isSymbolKnown(symbol)) {
    return getSymbolValue(symbol);
  } else {
    addSymbol(symbol, VAR_COUNT++);
  }
};

/**
 * Parsing logic.
 */
const isLabel = line => REGEXES.labels.test(line);
const getLabel = line => {
  const matches = REGEXES.labels.exec(line);

  return matches && matches[1];
}
const getInstructionType = instruction =>
  instruction.indexOf('@') === 0 ? 'A' : 'C';
const getSymbolFromAInstruction = instruction => {
  const matches = REGEXES.symbol.exec(instruction);
  return matches && matches[1];
}

/**
 * First pass: Store symbols from labels.
 */
let instructions = [];
let LC = 0;

// Labels
fileContents.forEach(instruction => {
  if (isLabel(instruction)) {
    const label = getLabel(instruction);

    if (!isSymbolKnown(label)) {
      addSymbol(label, LC);
    }
  } else {
    instructions.push(instruction); 
    LC++;
  }
});

/**
 * Second pass: Store symbols from variables.
 */
instructions.forEach(instruction => {
  const instructionType = getInstructionType(instruction);

  if (instructionType === 'A') {
    let symbol = getSymbolFromAInstruction(instruction);

    if (symbol) {
      symbol = symbol.replace('@', '');
      if (!isSymbolKnown(symbol)) {
        getOrAddSymbol(symbol);
      }
    }
  }
});

/**
 * Decode instructions.
 */
const decimalToBinary = decimal => (decimal >>> 0).toString(2);
const pad = (string, till, padWith = '0') => {
  while (string.length !== till) {
    string = padWith + string;
  }

  return string;
}

const decodeAInstruction = instruction => {
  const symbol = instruction.slice(1);
  let address;

  if (REGEXES.number.test(symbol)) {

    address = symbol;
  } else {
    address = getOrAddSymbol(symbol);
  }

  const binary = pad(decimalToBinary(address), 15);

  return `0${binary}`;
}

const decodeCInstruction = instruction => {
  const matches = REGEXES.cInstruction.exec(instruction);

  const groups = [
    matches[1] ? matches[1].replace('=', '') : null,
    matches[2] ? matches[2] : null,
    matches[3] ? matches[3].replace(';', '') : null
  ];
  
  const [ dest, comp, jmp ] = groups;

  const a = comp.indexOf('M') >= 0 ? 1 : 0;

  const inst = `111${a}${COMP[comp]}${DEST[dest]}${JUMP[jmp]}`;

  return inst;
}

/**
 * Translate everything.
 */
instructions = instructions.map(instruction => {
  const instructionType = getInstructionType(instruction);
  let binary = '';
  if (instructionType === 'A') {
    binary = decodeAInstruction(instruction);
  } else {
    binary = decodeCInstruction(instruction);
  }

  return binary;
});

/**
 * Output logic.
 */
let outputFilePath = inputFilePath.split('.').reverse();
if (outputFilePath[0] === 'asm') {
 outputFilePath[0] = 'hack';
}
outputFilePath = outputFilePath.reverse().join('.');

fs.writeFileSync(outputFilePath, instructions.join('\n'), {
  encoding: 'UTF-8'
});
