import "./lib/standard";

import { Project } from "./core/Project";
import { SimpleExerciseLobsterOutlet } from "./view/SimpleExerciseLobsterOutlet";
import { createSimpleExerciseOutlet } from "./frontend/simple_exercise_outlet";

$(async () => {
    const project = new Project(
        "Demo",
        undefined,
        [{
            name: "main.cpp",
            code: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello, world!" << endl;
}`,
            isTranslationUnit: true
        }]
    );

    $(".lobster-lobster").empty();
    $(".lobster-lobster").append(createSimpleExerciseOutlet("1"));

    new SimpleExerciseLobsterOutlet($(".lobster-lobster"), project);
});