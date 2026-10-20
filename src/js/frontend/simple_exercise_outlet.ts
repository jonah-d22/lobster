
export function createSimpleExerciseOutlet(id: string) {
    return $(`
        <ul style="position: relative;" class="lobster-simulation-outlet-tabs nav nav-tabs">
            <li class="active"><a class="lobster-source-tab" data-toggle="tab" href="#lobster-app-${id}-source-pane">Source Code</a></li>
            <li><a class="lobster-simulate-tab" data-toggle="tab" href="#lobster-app-${id}-sim-pane">Simulation</a></li>
        </ul>

        <div class="tab-content lobster-simulation-height" style="overflow: hidden;">

            <div id="lobster-app-${id}-source-pane" class="lobster-source-pane tab-pane fade active in" style="height: 100%; overflow-y: hidden;">
                <div style="height: 100%; overflow-y: hidden; display: flex; flex-direction: column;">
                    <div style="padding-top:5px; padding-bottom: 5px;">
                        <ul style="display:inline-block; vertical-align: middle;" class="project-files nav nav-pills"></ul>
                        <div style="float: right;">
                            <div class = "compilation-status-outlet" style="display: inline-block;"></div>
                            <div style="display: inline-block; text-align: center;">
                                Memory Diagram<br />
                                <div class="btn-group btn-toggle lobster-instant-memory-diagram-buttons"> 
                                    <button class="btn btn-xs btn-default">ON</button>
                                    <button class="btn btn-xs btn-primary active">OFF</button>
                                </div>
                            </div>
                            <button class = "btn btn-primary-muted runButton" style="display: inline-block; margin-left: 1em"><span class="glyphicon glyphicon-play-circle"></span> Simulate</span></button>
                        </div>
                    </div>
                    <div style="height: 100%; display: flex; flex-direction: row; overflow: hidden;">
                        <div class="codeMirrorEditor" style = "flex-grow: 1; position: relative; overflow-y: hidden; height: 100%; background-color: #272822"></div>
                        <div class="lobster-instant-memory-diagram" style="display: none; height: 100%; flex: 0 1 300px;"></div>
                    </div>
                    
                </div>
            </div>
            <div id="lobster-app-${id}-sim-pane" class="lobster-sim-pane tab-pane fade" style="height: 100%">
                <div style="position: relative">
                    <div class="runningProgress" style="position: absolute; right: 0; top: 0; margin: 5px; margin-right: 20px; padding: 5px; background-color: rgba(255,255,255,0.7);">
                        Thinking...
                        <!--<progress style="display: inline-block; vertical-align: top"></progress>-->
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
                </div>
                <!-- <p style = "width: 394px; padding: 5px;" class = "_outlet readOnly memory">memory</p> -->
                <div class="lobster-simulation-layout">
                    <div class="lobster-simulation-controls">
                        <div style="margin-bottom: 5px;">
                            <button class = "lobster-return-to-source btn btn-primary-muted" style="width: 100%; padding: 6px 6px;">Return to Source Code</button>
                        </div>
                        <div style="margin-bottom: 5px;">
                            <button class = "restart btn btn-warning-muted" style="font-size: 12px; padding: 6px 6px"><span class="glyphicon glyphicon-fast-backward"></span> Restart</button>
                            <!--<span style = "display: inline-block; width: 4ch"></span>-->
                            <!-- <button class = "stepOver">Step Over</button> -->
                            <!-- <button class = "stepOut">Step Out</button> -->
                            <button class = "runToEnd btn btn-success-muted" style="font-size: 12px; padding: 6px 6px">Run <span class="glyphicon glyphicon-fast-forward"></button>
                            <button class = "pause btn btn-warning-muted" style="font-size: 12px; padding: 6px 6px"><span class="glyphicon glyphicon-pause"></button>
                            <!-- <button class = "skipToEnd"><span class="glyphicon glyphicon-fast-forward"></button> -->

                            <!--Show Functions<input type="checkbox" class="stepInto"/>-->
                            <button class = "stepBackward btn btn-success-muted" style="font-size: 12px; padding: 6px 6px"><span class="glyphicon glyphicon-arrow-left"></span></button>
                            <input type="hidden" style="width: 4ch" class="stepBackwardNum" value="1" />


                            <input type="hidden" style="display: none; width: 4ch" class="stepForwardNum" value="1" />
                            <button class = "stepForward btn btn-success-muted" style="font-size: 12px; padding: 6px 6px">Step <span class="glyphicon glyphicon-arrow-right"></span></button>
                            <!--<input type="checkbox" id="tcoCheckbox" checked="false" />-->
                        </div>
                        <div class="console">
                            <span style = "position: absolute; top: 5px; right: 5px; pointer-events: none;">Console</span>
                            <span class="lobster-console-contents"></span>
                            <input type="text" class="lobster-console-user-input-entry"></span>
                        </div>
                        <div class="lobster-cin-buffer" style = "margin-top: 5px;"></div>
                        <div class="lobster-memcheck">
                            <div class="lobster-memcheck-title">Lobster Memory Check</div>
                            <pre class="lobster-memcheck-contents">Memory issues detected: —
Addresses: —</pre>
                        </div>
                    </div>
                    <div class="lobster-simulation-code">
                        <div class="codeStack code-simulation readOnly"> </div>
                    </div>
                    <aside class="lobster-simulation-memory">
                        <div class="lobster-simulation-memory-title">Memory</div>
                        <div class="lobster-simulation-memory-canvas">
                            <div class="lobster-memory readOnly"></div>
                        </div>
                    </aside>
                </div>

            </div>
        </div>
        

    `);
}
