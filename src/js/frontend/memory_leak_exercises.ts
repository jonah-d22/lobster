export interface MemoryLeakExercise {
    readonly title: string;
    readonly prompt: string;
    readonly code: string;
    readonly solution: string;
    readonly addedLines: readonly string[];
}

export const MEMORY_LEAK_EXERCISES: readonly MemoryLeakExercise[] = [
    {
        title: "A score that never gets released",
        prompt: "The result is saved before the heap value is needed no more. Release the allocation before returning.",
        code: `int main() {
  int* score = new int(42);
  int result = *score;
  return result;
}`,
        solution: `int main() {
  int* score = new int(42);
  int result = *score;
  delete score;
  return result;
}`,
        addedLines: ["  delete score;"]
    },
    {
        title: "An array left on the heap",
        prompt: "This program allocates an array. Add the matching array deallocation after its values are used.",
        code: `int main() {
  int* values = new int[3];
  values[0] = 4;
  values[1] = 5;
  values[2] = 6;
  int total = values[0] + values[1] + values[2];
  return total;
}`,
        solution: `int main() {
  int* values = new int[3];
  values[0] = 4;
  values[1] = 5;
  values[2] = 6;
  int total = values[0] + values[1] + values[2];
  delete[] values;
  return total;
}`,
        addedLines: ["  delete[] values;"]
    },
    {
        title: "Two allocations, two cleanups",
        prompt: "Both heap values need to be released. Save the result first, then clean up both pointers.",
        code: `int main() {
  int* first = new int(8);
  int* second = new int(13);
  int sum = *first + *second;
  return sum;
}`,
        solution: `int main() {
  int* first = new int(8);
  int* second = new int(13);
  int sum = *first + *second;
  delete first;
  delete second;
  return sum;
}`,
        addedLines: ["  delete first;", "  delete second;"]
    },
    {
        title: "A pointer passed to a function",
        prompt: "The helper updates the heap value, but main still owns the allocation. Release it after saving the result.",
        code: `void addOne(int* value) {
  *value = *value + 1;
}

int main() {
  int* count = new int(4);
  addOne(count);
  int result = *count;
  return result;
}`,
        solution: `void addOne(int* value) {
  *value = *value + 1;
}

int main() {
  int* count = new int(4);
  addOne(count);
  int result = *count;
  delete count;
  return result;
}`,
        addedLines: ["  delete count;"]
    },
    {
        title: "A dynamically allocated record",
        prompt: "This record is created with new. Release it after copying its value out of the object.",
        code: `class Record {
public:
  int value;
};

int main() {
  Record* record = new Record;
  record->value = 9;
  int result = record->value;
  return result;
}`,
        solution: `class Record {
public:
  int value;
};

int main() {
  Record* record = new Record;
  record->value = 9;
  int result = record->value;
  delete record;
  return result;
}`,
        addedLines: ["  delete record;"]
    }
];
