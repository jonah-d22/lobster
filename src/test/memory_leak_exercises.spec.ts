import 'mocha';
import { expect } from 'chai';
import { SimpleProgram } from '../js/core/compilation/Program';
import { Simulation } from '../js/core/runtime/Simulation';
import { MEMORY_LEAK_EXERCISES } from '../js/frontend/memory_leak_exercises';

describe('memory leak game exercises', () => {
  it('provides five runnable snippets that each start with a leak', () => {
    expect(MEMORY_LEAK_EXERCISES).to.have.length(5);

    MEMORY_LEAK_EXERCISES.forEach(exercise => {
      const program = new SimpleProgram(exercise.code);
      if (!program.isRunnable()) {
        throw new Error(`${exercise.title} did not compile as runnable.`);
      }

      const simulation = new Simulation(program);
      simulation.stepToEnd();
      expect(simulation.memoryIssues.some(issue => issue.kind === 'memory leak'), exercise.title).to.equal(true);
    });
  });

  it('provides a solution for every exercise without modeled memory issues', () => {
    MEMORY_LEAK_EXERCISES.forEach(exercise => {
      const program = new SimpleProgram(exercise.solution);
      if (!program.isRunnable()) {
        throw new Error(`${exercise.title} solution did not compile as runnable.`);
      }

      const simulation = new Simulation(program);
      simulation.stepToEnd();
      expect(simulation.memoryIssues, exercise.title).to.have.length(0);
    });
  });
});
