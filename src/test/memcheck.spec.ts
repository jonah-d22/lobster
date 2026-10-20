import 'mocha';
import { expect } from 'chai';
import { SimpleProgram } from '../js/core/compilation/Program';
import { toHexadecimalString } from '../js/core/compilation/types';
import { Simulation } from '../js/core/runtime/Simulation';

function runProgram(source: string): Simulation {
  const program = new SimpleProgram(source);
  if (!program.isRunnable()) {
    throw new Error('Test program did not compile as runnable.');
  }

  const sim = new Simulation(program);
  sim.stepToEnd();
  return sim;
}

describe('modeled memory check', () => {
  it('reports a heap allocation whose last pointer is lost', () => {
    const sim = runProgram('int main() { int* p = new int(7); return 0; }');
    const allocation = Object.values(sim.memory.heap.objectMap)[0];
    const report = sim.getMemoryCheckSummary();

    expect(report).to.include('Unreachable at end of main: 1 blocks');
    expect(report).to.include(toHexadecimalString(allocation.address));
    expect(report).not.to.include(allocation.toString());
    expect(sim.getMemoryCheckDisplay()).to.equal([
      'Memory issues detected: 1',
      `Addresses: ${toHexadecimalString(allocation.address)}`
    ].join('\n'));
    expect(sim.memoryIssues.some(issue => issue.kind === 'memory leak')).to.equal(true);
  });

  it('does not report a deleted allocation as a leak', () => {
    const sim = runProgram('int main() { int* p = new int(7); delete p; return 0; }');

    expect(sim.getMemoryCheckSummary()).to.include('Unreachable at end of main: 0 blocks');
    expect(sim.memoryIssues.some(issue => issue.kind === 'memory leak')).to.equal(false);
  });

  it('allows a local destructor to release its owned allocation before checking', () => {
    const sim = runProgram('class Owner { public: int* value; ~Owner() { delete value; } }; int main() { Owner owner; owner.value = new int(7); return 0; }');

    expect(sim.getMemoryCheckSummary()).to.include('Unreachable at end of main: 0 blocks');
    expect(sim.memoryIssues.some(issue => issue.kind === 'memory leak')).to.equal(false);
  });

  it('follows pointers stored inside reachable heap allocations', () => {
    const sim = runProgram('class Node { public: int* next; }; Node* root; int main() { root = new Node; root->next = new int(7); return 0; }');

    expect(sim.getMemoryCheckSummary()).to.include('Reachable at end of main: 2 blocks');
    expect(sim.getMemoryCheckSummary()).to.include('Unreachable at end of main: 0 blocks');
  });

  it('treats a global pointer as a root for its allocation', () => {
    const sim = runProgram('int* root; int main() { root = new int(7); return 0; }');

    expect(sim.getMemoryCheckSummary()).to.include('Unreachable at end of main: 0 blocks');
    expect(sim.getMemoryCheckSummary()).to.include('Reachable at end of main: 1 blocks');
    expect(sim.memoryIssues.some(issue => issue.kind === 'memory leak')).to.equal(false);
  });

  it('reports mismatched scalar delete on an array allocation', () => {
    const sim = runProgram('int main() { int* p = new int[2]; delete p; return 0; }');

    expect(sim.memoryIssues.some(issue => issue.kind === 'mismatched deallocation')).to.equal(true);
  });

  it('reports mismatched array delete on a scalar allocation', () => {
    const sim = runProgram('int main() { int* p = new int(7); delete[] p; return 0; }');

    expect(sim.memoryIssues.some(issue => issue.kind === 'mismatched deallocation')).to.equal(true);
  });

  it('reports freeing an interior pointer', () => {
    const sim = runProgram('int main() { int* p = new int[2]; delete (p + 1); return 0; }');

    expect(sim.memoryIssues.some(issue => issue.kind === 'invalid free')).to.equal(true);
  });

  it('reports use after free', () => {
    const sim = runProgram('int main() { int* p = new int(7); delete p; return *p; }');
    const issue = sim.memoryIssues.find(issue => issue.kind === 'use after free')!;

    expect(issue.address).to.be.a('number');
    expect(sim.getMemoryCheckDisplay()).to.equal([
      'Memory issues detected: 1',
      `Addresses: ${toHexadecimalString(issue.address!)}`
    ].join('\n'));
  });

  it('reports double free', () => {
    const sim = runProgram('int main() { int* p = new int(7); delete p; delete p; return 0; }');

    expect(sim.memoryIssues.some(issue => issue.kind === 'double free')).to.equal(true);
  });

  it('reports use after free through an array element pointer', () => {
    const sim = runProgram('int main() { int* p = new int[2]; int* element = p + 1; delete[] p; return *element; }');

    expect(sim.memoryIssues.some(issue => issue.kind === 'use after free')).to.equal(true);
  });
});
