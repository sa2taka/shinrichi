import { TruthTableGenerator } from "../truthTableGenerator";

describe("TruthTableGenerator", () => {
  test("should generate correct truth table for basic inputs", () => {
    const generator = new TruthTableGenerator(2, ["p & q", "p | q"]);
    const columns = generator.getAllColumns();

    expect(columns).toHaveLength(4); // 2 inputs + 2 outputs
    expect(generator.valueCount).toBe(4);
    expect(generator.inputVariableCount).toBe(2);
  });

  test("should handle logical AND correctly", () => {
    const generator = new TruthTableGenerator(2, ["p & q"]);
    const outputColumn = generator.getOutputColumns()[0];

    // Expected AND truth table: [false, false, false, true]
    expect(outputColumn.values).toEqual([false, false, false, true]);
  });

  test("should handle logical OR correctly", () => {
    const generator = new TruthTableGenerator(2, ["p | q"]);
    const outputColumn = generator.getOutputColumns()[0];

    // Expected OR truth table: [false, true, true, true]
    expect(outputColumn.values).toEqual([false, true, true, true]);
  });

  test("should handle logical XOR correctly", () => {
    const generator = new TruthTableGenerator(2, ["p ^ q"]);
    const outputColumn = generator.getOutputColumns()[0];

    // Expected XOR truth table: [false, true, true, false]
    expect(outputColumn.values).toEqual([false, true, true, false]);
  });

  test("should handle negation correctly", () => {
    const generator = new TruthTableGenerator(2, ["!p"]);
    const outputColumn = generator.getOutputColumns()[0];

    // Expected NOT p truth table: [true, true, false, false]
    expect(outputColumn.values).toEqual([true, true, false, false]);
  });

  test("should handle complex expressions", () => {
    const generator = new TruthTableGenerator(2, ["!p & q"]);
    const outputColumn = generator.getOutputColumns()[0];

    // Expected (!p & q) truth table: [false, true, false, false]
    expect(outputColumn.values).toEqual([false, true, false, false]);
  });

  test("should handle parentheses correctly", () => {
    const generator = new TruthTableGenerator(2, ["!(p & q)"]);
    const outputColumn = generator.getOutputColumns()[0];

    // Expected !(p & q) truth table: [true, true, true, false]
    expect(outputColumn.values).toEqual([true, true, true, false]);
  });

  test("should add and remove inputs correctly", () => {
    const generator = new TruthTableGenerator(2);

    expect(generator.addInput()).toBe(true);
    expect(generator.inputVariableCount).toBe(3);
    expect(generator.valueCount).toBe(8);

    expect(generator.removeInput()).toBe(true);
    expect(generator.inputVariableCount).toBe(2);
    expect(generator.valueCount).toBe(4);

    expect(generator.removeInput()).toBe(true);
    expect(generator.inputVariableCount).toBe(1);
    expect(generator.removeInput()).toBe(false); // Cannot go below 1
  });
});
