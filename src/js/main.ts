import "./lib/standard";

import { Project } from "./core/Project";
import { SimpleExerciseLobsterOutlet } from "./view/SimpleExerciseLobsterOutlet";
import { createSimpleExerciseOutlet } from "./frontend/simple_exercise_outlet";
import { MEMORY_LEAK_EXERCISES } from "./frontend/memory_leak_exercises";

$(async () => {
    const project = new Project(
        "Memory Leak Fix-It",
        undefined,
        [{
            name: "main.cpp",
            code: MEMORY_LEAK_EXERCISES[0].code,
            isTranslationUnit: true
        }]
    );

    $(".lobster-lobster").empty();
    $(".lobster-lobster").append(createSimpleExerciseOutlet("1"));

    new SimpleExerciseLobsterOutlet($(".lobster-lobster"), project);
});