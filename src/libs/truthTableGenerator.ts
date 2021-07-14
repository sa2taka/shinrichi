import { generateReversePolish } from './reversePolish';

export interface TruthTableColumn {
  type: 'input' | 'output';
  name: string;
  values: boolean[];
}

const defaultOutputs = ['p | q', 'p & q', 'p ^ q', '!(p | q) | (p & q)'];
export class TruthTableGenerator {
  #LETTERS = ['p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  #inputCount: number = 2;
  #outPuts: string[] = defaultOutputs;

  get valueCount() {
    return Math.pow(2, this.#inputCount);
  }

  get inputCount() {
    return this.#inputCount;
  }

  get outputs() {
    return this.#outPuts;
  }

  get outputCount() {
    return this.#outPuts.length;
  }

  constructor(inputCount?: number, outputs?: string[]) {
    this.#inputCount = inputCount ?? 2;
    this.#outPuts = outputs ?? defaultOutputs;
  }

  get value() {
    const tables: TruthTableColumn[] = [];
    tables.push(...this.inputValues);
    tables.push(...this.outputValues);
    return tables;
  }

  get inputValues() {
    const tables: TruthTableColumn[] = [];
    const letterGenerator = this.#letters();
    for (let i = 0; i < this.#inputCount; i++) {
      tables.push({
        type: 'input',
        name: letterGenerator.next().value,
        values: this.#generateInputValues(i, this.#inputCount),
      });
    }

    return tables;
  }

  get outputValues() {
    const tables: TruthTableColumn[] = [];
    this.#outPuts.forEach((output) => {
      tables.push({
        type: 'output',
        name: output,
        values: this.#calculate(output),
      });
    });
    return tables;
  }

  addInput() {
    this.#inputCount += 1;
  }

  #calculate(exp: string) {
    const result: boolean[] = [];

    const reversePolish = generateReversePolish(exp);
    const inputs = this.inputValues;
    for (let i = 0; i < this.valueCount; i++) {
      const stack: string[] = [];

      reversePolish.forEach((node) => {
        if (node.type === 'letter') {
          let bool: boolean;
          if (node.value === '1') {
            bool = true;
          } else if (node.value === '0') {
            bool = false;
          } else {
            const index = this.getLetterIndex(node.value);
            bool = inputs[index]?.values[i] ?? false;
          }
          stack.push(bool ? '1' : '0');
        } else if (node.type === 'operator') {
          const a = stack.pop();
          const b = stack.pop();
          if (a === undefined || b === undefined) {
            return Array(this.#inputCount).fill(false);
          }
          const aValue = a === '1';
          const bValue = b === '1';

          let result: boolean;
          switch (node.value) {
            case '&':
              result = aValue && bValue;
              break;
            case '|':
              result = aValue || bValue;
              break;
            case '^':
              result = (!aValue && bValue) || (aValue && !bValue);
              break;
          }
          stack.push(result ? '1' : '0');
        }
      });

      if (stack.length === 1) {
        result.push(stack[0] === '1');
      }
    }

    return result;
  }

  #generateInputValues(index: number, count: number) {
    const length = Math.pow(2, count);
    const blockLength = Math.pow(2, count - index - 1);
    return Array<boolean>(length)
      .fill(false)
      .map((_, i) => this.#getTruthValue(i, blockLength));
  }

  #getTruthValue(index: number, blockLength: number): boolean {
    return Math.floor(index / blockLength) % 2 === 1;
  }

  getLetterIndex(letter: string) {
    const first = letter[0];

    const index = this.#LETTERS.findIndex((l) => l === first);
    if (index === -1) {
      return 0;
    }
    const dashes = (letter.match(/'/g) ?? []).length;
    return index + dashes * this.#LETTERS.length;
  }

  *#letters(): Generator<string, string, unknown> {
    let laps = 0;
    let index = 0;
    while (true) {
      yield this.#LETTERS[index] + "'".repeat(laps);
      index = (index + 1) % this.#LETTERS.length;
      if (index === 0) {
        laps += 1;
      }
    }
  }
}
