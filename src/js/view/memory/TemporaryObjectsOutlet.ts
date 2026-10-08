import { Memory } from "../../core/runtime/Memory";
import { listenTo, MessageResponses, messageResponse, Message } from "../../util/observe";
import { CPPObject } from "../../core/runtime/objects";
import { CPP_ANIMATIONS } from "../constructs/common";
import { OutletCustomizations, SLIDE_DURATION } from "../simOutlets";
import { createMemoryColumnHeadings, createMemoryObjectOutlet } from "./MemoryObjectOutlets";
import { MemoryOutlet } from "./MemoryOutlet";
import { TemporaryObjectsCustomization } from "./StackFrameOutlet";



export class TemporaryObjectsOutlet {

    private readonly element: JQuery;
    private readonly memoryOutlet: MemoryOutlet;
    private readonly objectsElem: JQuery;
    private readonly usageElem: JQuery;
    private objectElems: { [index: number]: JQuery; } = {};

    public readonly memory: Memory;

    private readonly customizations: TemporaryObjectsCustomization;

    public _act!: MessageResponses;

    public constructor(element: JQuery, memory: Memory, memoryOutlet: MemoryOutlet) {
        this.element = element.addClass("code-memoryTemporaryObjects");
        this.memory = memory;
        this.memoryOutlet = memoryOutlet;

        this.customizations = OutletCustomizations.temporaryObjects;

        let header = $("<div class='header'><span>Temporaries</span><span class='memory-column-usage'></span></div>");
        this.usageElem = header.find(".memory-column-usage");
        this.element.append(header);

        this.objectsElem = $("<div></div>");
        this.objectsElem.append(createMemoryColumnHeadings());
        this.element.append(this.objectsElem);

        let minimizeButton = $("<span class='button'></span>");
        if (this.customizations.minimize === "show") {
            minimizeButton.html("hide");
        }
        else {
            minimizeButton.html("show");
            this.objectsElem.css("display", "none");
        }

        minimizeButton.click(() => {
            this.objectsElem.slideToggle();
            if (minimizeButton.html() === "hide") {
                minimizeButton.html("show");
                this.customizations.minimize = "hide";
            }
            else {
                minimizeButton.html("hide");
                this.customizations.minimize = "show";
            }
        });
        header.append(minimizeButton);

        listenTo(this, memory);

        this.objectElems = {};

        memory.allLiveObjects()
            .filter(obj => obj.hasStorage("temporary"))
            .forEach(obj => this.addTemporaryObject(obj));
        this.updateUsage();

        return this;
    }

    @messageResponse("temporaryObjectAllocated")
    private temporaryObjectAllocated(msg: Message<CPPObject>) {
        this.addTemporaryObject(msg.data);
    }

    private addTemporaryObject(obj: CPPObject) {
        if (this.objectElems[obj.address]) {
            return;
        }

        var elem = $("<div></div>");
        createMemoryObjectOutlet(elem, obj, this.memoryOutlet);

        this.objectElems[obj.address] = elem;
        this.objectsElem.prepend(elem);
        if (CPP_ANIMATIONS) {
            elem.css({ opacity: 0 }).animate({ opacity: 1 }, SLIDE_DURATION);
        }
        this.updateUsage();
    }

    @messageResponse("temporaryObjectDeallocated")
    private temporaryObjectDeallocated(msg: Message<CPPObject>) {
        var addr = msg.data.address;
        if (this.objectElems[addr]) {
            this.objectElems[addr].fadeOut(function () {
                $(this).remove();
            });
            delete this.objectElems[addr];
        }
        this.updateUsage();
    }

    private updateUsage() {
        const liveObjects = this.memory.allLiveObjects().filter(obj => obj.hasStorage("temporary"));
        const usedBytes = liveObjects.reduce((total, obj) => total + obj.size, 0);
        this.usageElem.text(`${usedBytes} modeled bytes`);
    }

    @messageResponse("reset")
    private reset() {
        this.objectElems = {};
        this.objectsElem.children().remove();
        this.updateUsage();
    }

}
