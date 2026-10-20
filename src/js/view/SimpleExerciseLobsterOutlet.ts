import { Simulation } from "../core/runtime/Simulation";
import { Memory } from "../core/runtime/Memory";
import { Project } from "../core/Project";
import { SourceFile } from "../core/compilation/Program";
import { SimulationOutlet } from "./simOutlets";
import { ProjectEditor } from "./editors";
import { MEMORY_LEAK_EXERCISES } from "../frontend/memory_leak_exercises";

type AnswerState = "editing" | "showing-result";

export class SimpleExerciseLobsterOutlet {

    public readonly projectEditor: ProjectEditor;
    private readonly simulationOutlet: SimulationOutlet;
    public readonly project: Project;

    private readonly element: JQuery;
    private readonly codeArea: JQuery;
    private readonly exerciseTitleElem: JQuery;
    private readonly exercisePromptElem: JQuery;
    private readonly feedbackElem: JQuery;
    private readonly submitButton: JQuery;
    private exerciseIndex = 0;
    private answerState: AnswerState = "editing";

    public constructor(element: JQuery, project: Project) {
        this.element = element;
        this.project = project;
        this.codeArea = element.find(".memory-leak-code-area");
        this.exerciseTitleElem = element.find(".memory-leak-exercise-title");
        this.exercisePromptElem = element.find(".memory-leak-exercise-prompt");
        this.feedbackElem = element.find(".memory-leak-feedback");
        this.submitButton = element.find(".memory-leak-submit");

        this.projectEditor = new ProjectEditor(this.codeArea, project);
        this.simulationOutlet = new SimulationOutlet(element.find(".lobster-sim-pane"));
        this.simulationOutlet.memoryOutlet.setMemory(new Memory());
        this.showExercise();

        this.submitButton.on("click", () => {
            if (this.answerState === "showing-result") {
                this.nextExercise();
            }
            else {
                void this.submitAnswer();
            }
        });
    }

    private async submitAnswer() {
        this.submitButton.prop("disabled", true).text("Simulating...");
        this.feedbackElem.empty().hide();
        this.clearSimulation();
        this.project.recompile();

        if (!this.project.program.isRunnable()) {
            const errors = this.project.program.notes.allNotes
                .filter(note => note.kind === "error")
                .map(note => note.message);
            const details = errors.length > 0 ? ` ${errors.join(" ")}` : "";
            this.showResult(false, `This code could not be simulated.${details}`);
            return;
        }

        const simulation = new Simulation(this.project.program);
        while (!simulation.globalAllocator.isDone) {
            simulation.stepForward();
        }

        try {
            this.codeArea.addClass("is-simulating");
            this.simulationOutlet.setSimulation(simulation);
            const checkedSimulation = await this.simulationOutlet.runToEnd();
            if (!checkedSimulation) {
                throw new Error("The memory check did not complete.");
            }
            const passed = checkedSimulation.memoryIssues.length === 0;
            this.showResult(
                passed,
                passed
                    ? "Correct! The program finishes without modeled memory issues."
                    : "Not quite. The simulation still reports a memory issue."
            );
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.showResult(false, `The simulation could not finish: ${message}`);
        }
    }

    private clearSimulation() {
        this.simulationOutlet.clearSimulation();
        this.codeArea.removeClass("is-simulating");
        this.simulationOutlet.memoryOutlet.setMemory(new Memory());
    }

    private showResult(passed: boolean, message: string) {
        this.answerState = "showing-result";
        this.feedbackElem
            .removeClass("memory-leak-feedback-correct memory-leak-feedback-incorrect")
            .addClass(passed ? "memory-leak-feedback-correct" : "memory-leak-feedback-incorrect")
            .text(message)
            .show();

        if (!passed) {
            this.feedbackElem.append(
                $("<h3></h3>").text("Possible solution"),
                this.renderSolution()
            );
        }

        const isLastExercise = this.exerciseIndex === MEMORY_LEAK_EXERCISES.length - 1;
        this.submitButton
            .prop("disabled", false)
            .text(isLastExercise ? "Play again" : "Next");

        window.requestAnimationFrame(() => this.simulationOutlet.memoryOutlet.refreshSvg());
    }

    private renderSolution() {
        const exercise = MEMORY_LEAK_EXERCISES[this.exerciseIndex];
        const additions = new Map<string, number>();
        exercise.addedLines.forEach(line => additions.set(line, (additions.get(line) || 0) + 1));

        const code = exercise.solution.split("\n").map(line => {
            const count = additions.get(line) || 0;
            if (count > 0) {
                additions.set(line, count - 1);
                return `<span class="memory-leak-solution-added">${this.escapeHtml(line)}</span>`;
            }
            return this.escapeHtml(line);
        }).join("\n");

        return $("<pre class='memory-leak-solution'></pre>").html(code);
    }

    private escapeHtml(text: string) {
        return text.replace(/[&<>"']/g, character => {
            const replacements: {[key: string]: string} = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            };
            return replacements[character];
        });
    }

    private nextExercise() {
        this.clearSimulation();
        this.answerState = "editing";
        this.feedbackElem.empty().hide();

        if (this.exerciseIndex === MEMORY_LEAK_EXERCISES.length - 1) {
            this.exerciseIndex = 0;
        }
        else {
            ++this.exerciseIndex;
        }

        this.showExercise();
    }

    private showExercise() {
        const exercise = MEMORY_LEAK_EXERCISES[this.exerciseIndex];
        this.exerciseTitleElem.text(`Exercise ${this.exerciseIndex + 1} of ${MEMORY_LEAK_EXERCISES.length}: ${exercise.title}`);
        this.exercisePromptElem.text(exercise.prompt);
        this.project.setFileContents(new SourceFile("main.cpp", exercise.code));
        this.project.recompile();
        this.projectEditor.refreshEditorView();

        this.submitButton
            .prop("disabled", false)
            .html('<span class="glyphicon glyphicon-play-circle"></span> Check &amp; Simulate');
    }
}
