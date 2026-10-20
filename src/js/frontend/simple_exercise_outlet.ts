export function createSimpleExerciseOutlet(id: string) {
    return $(`
        <main class="memory-leak-game">
            <header class="memory-leak-game-header">
                <h1>Memory Leak Fix-It</h1>
                <p>Find the leak in each C++ program, edit the code, then simulate it to check your fix.</p>
            </header>
            <div class="memory-leak-exercise-heading">
                <h2 class="memory-leak-exercise-title"></h2>
                <p class="memory-leak-exercise-prompt"></p>
            </div>
            <section class="memory-leak-simulation-panel lobster-sim-pane" aria-label="Program simulation">
                <div class="runningProgress">
                    Thinking...
                </div>
                <div class="alerts-container">
                    <div class="alerts">
                        <div style="display:inline-block; padding: 5px">
                            <div style="height: 100px; margin-left: 5px; float: right;">
                                <div style="padding-right: 5px; text-align: right"><button>Dismiss</button></div>
                            </div>
                            <table style="height: 110px"><tr><td><div class="alerts-message"></div></td></tr></table>
                        </div>
                    </div>
                </div>
                <div class="lobster-simulation-layout">
                    <div class="lobster-simulation-controls">
                        <div style="margin-bottom: 5px;">
                            <button class="restart btn btn-warning-muted" style="font-size: 12px; padding: 6px 6px"><span class="glyphicon glyphicon-fast-backward"></span> Restart</button>
                            <button class="runToEnd btn btn-success-muted" style="font-size: 12px; padding: 6px 6px">Run <span class="glyphicon glyphicon-fast-forward"></button>
                            <button class="pause btn btn-warning-muted" style="font-size: 12px; padding: 6px 6px"><span class="glyphicon glyphicon-pause"></button>
                            <button class="stepBackward btn btn-success-muted" style="font-size: 12px; padding: 6px 6px"><span class="glyphicon glyphicon-arrow-left"></span></button>
                            <input type="hidden" class="stepBackwardNum" value="1" />
                            <input type="hidden" class="stepForwardNum" value="1" />
                            <button class="stepForward btn btn-success-muted" style="font-size: 12px; padding: 6px 6px">Step <span class="glyphicon glyphicon-arrow-right"></span></button>
                        </div>
                        <div class="console">
                            <span style="position: absolute; top: 5px; right: 5px; pointer-events: none;">Console</span>
                            <span class="lobster-console-contents"></span>
                            <input type="text" class="lobster-console-user-input-entry">
                        </div>
                        <div class="lobster-cin-buffer" style="margin-top: 5px;"></div>
                        <div class="lobster-memcheck">
                            <div class="lobster-memcheck-title">Lobster Memory Check</div>
                            <pre class="lobster-memcheck-contents">Memory issues detected: —
Addresses: —</pre>
                        </div>
                    </div>
                    <div class="lobster-simulation-code memory-leak-code-area">
                        <ul class="project-files nav nav-pills" style="display: none;"></ul>
                        <div id="lobster-app-${id}-source-pane" class="lobster-source-pane">
                            <div class="codeMirrorEditor"></div>
                        </div>
                        <div class="codeStack code-simulation readOnly" aria-hidden="true"></div>
                        <div class="memory-leak-feedback" role="status" aria-live="polite"></div>
                        <div class="memory-leak-editor-footer">
                            <button class="btn btn-primary-muted memory-leak-submit">
                                <span class="glyphicon glyphicon-play-circle"></span> Check &amp; Simulate
                            </button>
                        </div>
                    </div>
                    <aside class="lobster-simulation-memory">
                        <div class="lobster-simulation-memory-title">Memory</div>
                        <div class="lobster-simulation-memory-canvas">
                            <div class="lobster-memory readOnly"></div>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    `);
}
