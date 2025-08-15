import { generateReversePolish } from "./reversePolish";
import type { TruthTableColumn } from "./types";

const DEFAULT_OUTPUTS = ["p | q", "!p & q", "p ^ q"];
const VARIABLE_LETTERS = ["p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"] as const;

/**
 * Modern truth table generator class with improved TypeScript support
 */
export class TruthTableGenerator {
  private inputCount: number;
  private outputs: string[];

  constructor(inputCount = 2, outputs = DEFAULT_OUTPUTS) {
    this.inputCount = Math.max(1, Math.min(inputCount, 10)); // Limit to reasonable range
    this.outputs = outputs;
  }

  /**
   * Get the total number of truth value combinations
   */
  get valueCount(): number {
    return Math.pow(2, this.inputCount);
  }

  /**
   * Get the number of input variables
   */
  get inputVariableCount(): number {
    return this.inputCount;
  }

  /**
   * Get the output expressions
   */
  get outputExpressions(): readonly string[] {
    return this.outputs;
  }

  /**
   * Get the number of output expressions
   */
  get outputCount(): number {
    return this.outputs.length;
  }

  /**
   * Get all columns (inputs and outputs) for the truth table
   */
  getAllColumns(): TruthTableColumn[] {
    return [...this.getInputColumns(), ...this.getOutputColumns()];
  }

  /**
   * Get only input columns
   */
  getInputColumns(): TruthTableColumn[] {
    const columns: TruthTableColumn[] = [];
    const letterGenerator = this.createLetterGenerator();

    for (let i = 0; i < this.inputCount; i++) {
      columns.push({
        type: "input",
        name: letterGenerator.next().value,
        values: this.generateInputValues(i),
      });
    }

    return columns;
  }

  /**
   * Get only output columns
   */
  getOutputColumns(): TruthTableColumn[] {
    return this.outputs.map((output) => ({
      type: "output",
      name: output,
      values: this.calculateOutput(output),
    }));
  }

  /**
   * Add an input variable (up to maximum supported)
   */
  addInput(): boolean {
    if (this.inputCount < VARIABLE_LETTERS.length) {
      this.inputCount++;
      return true;
    }
    return false;
  }

  /**
   * Remove an input variable (minimum 1)
   */
  removeInput(): boolean {
    if (this.inputCount > 1) {
      this.inputCount--;
      return true;
    }
    return false;
  }

  /**
   * Update output expressions
   */
  updateOutputs(outputs: string[]): void {
    this.outputs = outputs.filter((output) => output.trim() !== "");
  }

  /**
   * Add a new output expression
   */
  addOutput(expression: string): void {
    if (expression.trim() !== "") {
      this.outputs.push(expression.trim());
    }
  }

  /**
   * Remove an output expression by index
   */
  removeOutput(index: number): boolean {
    if (index >= 0 && index < this.outputs.length) {
      this.outputs.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Calculate truth values for a given logical expression
   */
  private calculateOutput(expression: string): boolean[] {
    try {
      const result: boolean[] = [];
      const reversePolish = generateReversePolish(expression);
      const inputColumns = this.getInputColumns();

      for (let row = 0; row < this.valueCount; row++) {
        const stack: boolean[] = [];

        for (const node of reversePolish) {
          if (node.type === "letter") {
            let value: boolean;

            if (node.value === "1") {
              value = true;
            } else if (node.value === "0") {
              value = false;
            } else {
              const variableIndex = this.getVariableIndex(node.value);
              value = inputColumns[variableIndex]?.values[row] ?? false;
            }

            stack.push(value);
          } else if (node.type === "operator") {
            if (stack.length < 2) {
              throw new Error(`Insufficient operands for operator ${node.value}`);
            }

            const b = stack.pop()!;
            const a = stack.pop()!;
            let result: boolean;

            switch (node.value) {
              case "&":
                result = a && b;
                break;
              case "|":
                result = a || b;
                break;
              case "^":
                result = a !== b; // XOR
                break;
              default:
                throw new Error(`Unknown operator`);
            }

            stack.push(result);
          }
        }

        if (stack.length !== 1) {
          throw new Error("Invalid expression: stack should contain exactly one value");
        }

        result.push(stack[0]);
      }

      return result;
    } catch (error) {
      console.error(`Error calculating expression "${expression}":`, error);
      return new Array(this.valueCount).fill(false);
    }
  }

  /**
   * Generate truth values for an input variable at given index
   */
  private generateInputValues(variableIndex: number): boolean[] {
    const totalRows = this.valueCount;
    const blockSize = Math.pow(2, this.inputCount - variableIndex - 1);

    return Array.from({ length: totalRows }, (_, rowIndex) => Math.floor(rowIndex / blockSize) % 2 === 1);
  }

  /**
   * Get the index of a variable letter (supports primes for extended variables)
   */
  private getVariableIndex(variableName: string): number {
    const baseLetter = variableName[0];
    const baseIndex = VARIABLE_LETTERS.findIndex((letter) => letter === baseLetter);

    if (baseIndex === -1) return 0;

    const primeCount = (variableName.match(/'/g) || []).length;
    return baseIndex + primeCount * VARIABLE_LETTERS.length;
  }

  /**
   * Create a generator for variable names with prime notation
   */
  private *createLetterGenerator(): Generator<string> {
    let primeLevel = 0;
    let letterIndex = 0;

    while (true) {
      const letter = VARIABLE_LETTERS[letterIndex];
      const primes = "'".repeat(primeLevel);
      yield letter + primes;

      letterIndex++;
      if (letterIndex >= VARIABLE_LETTERS.length) {
        letterIndex = 0;
        primeLevel++;
      }
    }
  }
}
