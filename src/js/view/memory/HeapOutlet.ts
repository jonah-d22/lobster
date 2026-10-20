import { Memory } from "../../core/runtime/Memory";
import { listenTo, MessageResponses, messageResponse, Message } from "../../util/observe";
import { CPPObject, DynamicObject } from "../../core/runtime/objects";
import { CPP_ANIMATIONS } from "../constructs/common";
import { SLIDE_DURATION } from "../simOutlets";
import { createMemoryColumnHeadings, createMemoryObjectOutlet } from "./MemoryObjectOutlets";
import { MemoryOutlet } from "./MemoryOutlet";



export class HeapOutlet {

    private readonly element: JQuery;
    private readonly memoryOutlet: MemoryOutlet;
    private readonly objectsElem: JQuery;
    private readonly usageElem: JQuery;
    private objectElems: { [index: number]: JQuery; } = {};

    public readonly memory: Memory;

    public _act!: MessageResponses;

    public constructor(element: JQuery, memory: Memory, memoryOutlet: MemoryOutlet) {
        this.element = element.addClass("code-memoryHeap");
        this.memory = memory;
        this.memoryOutlet = memoryOutlet;

        let header = $("<div class='header'><span>Heap</span><span class='memory-column-usage'></span></div>");
        this.usageElem = header.find(".memory-column-usage");
        this.element.append(header);
        this.element.append(createMemoryColumnHeadings().addClass("heap-column-headings"));

        this.objectsElem = $("<div></div>");
        this.element.append(this.objectsElem);

        listenTo(this, memory);

        this.objectElems = {};

        for (let key in this.memory.heap.objectMap) {
            this.heapObjectAllocated(this.memory.heap.objectMap[key]);
        }
        this.updateUsage();
    }



    @messageResponse("heapObjectAllocated", "unwrap")
    private heapObjectAllocated(obj: DynamicObject) {
        var elem = $("<div></div>");
        createMemoryObjectOutlet(elem, obj, this.memoryOutlet);
        elem.addClass("heap-allocation-row");

        this.objectElems[obj.address] = elem;
        this.objectsElem.prepend(elem);
        if (CPP_ANIMATIONS) {
            elem.css({ opacity: 0 }).animate({ opacity: 1 }, SLIDE_DURATION);
        }
        this.updateUsage();
    }

    @messageResponse("heapObjectDeleted")
    private heapObjectDeleted(msg: Message<CPPObject>) {
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
        const allocatedObjects = Object.values(this.memory.heap.objectMap);
        const usedBytes = allocatedObjects.reduce((total, obj) => total + obj.size, 0);
        this.usageElem.text(`${usedBytes} modeled bytes`);
    }

    @messageResponse("reset")
    private reset() {
        this.objectElems = {};
        this.objectsElem.children().remove();
        this.updateUsage();
    }
}
