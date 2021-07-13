export interface TruthTableColumn {
  type: 'input' | 'output';
  name: string;
  values: boolean[];
}

export type Output =
  | {
      type: 'header';
      value: string;
    }
  | {
      type: 'values';
      value: boolean[];
    };

export class TruthTableGenerator {
  #LETTERS = ['p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  #inputCount: number = 2;
  #outPuts: Output[] = [];

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

  constructor(inputCount?: number, outputs?: Output[]) {
    this.#inputCount = inputCount ?? 2;
    this.#outPuts = outputs ?? [];
  }

  get value() {
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

  addInput() {
    this.#inputCount += 1;
  }

  #generateInputValues(index: number, count: number) {
    const length = Math.pow(2, count);
    const blockLength = Math.pow(2, count - index - 1);
    return Array<boolean>(length)
      .fill(false)
      .map((_, i) => this.getTruthValue(i, blockLength));
  }

  getTruthValue(index: number, blockLength: number): boolean {
    return Math.floor(index / blockLength) % 2 === 1;
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
