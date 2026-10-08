import { SimulationEvent } from "../../runtime/Simulation";
import { CompleteObjectType, PointerType, isPointerType } from "../../compilation/types";
import { ExpressionContext, ConstructDescription } from "../../compilation/contexts";
import { SuccessfullyCompiled, RuntimeConstruct } from "../CPPConstruct";
import { CPPError } from "../../compilation/errors";
import { Value } from "../../runtime/Value";
import { Expression, CompiledExpression, TypedExpression, t_TypedExpression } from "./Expression";
import { RuntimeExpression } from "./RuntimeExpression";
import { Predicates } from "../../../analysis/predicates";
import { CompiledTemporaryDeallocator } from "../TemporaryDeallocator";
import { DereferenceExpressionASTNode } from "../../../ast/ast_expressions";
import { SimpleRuntimeExpression } from "./SimpleRuntimeExpression";
import { UnaryOperatorExpression } from "./UnaryOperatorExpression";
import { createExpressionFromAST, createRuntimeExpression } from "./expressions";
import { convertToPRValue,  } from "./ImplicitConversion";








export class DereferenceExpression extends UnaryOperatorExpression<DereferenceExpressionASTNode> {
    public readonly construct_type = "dereference_expression";

    public readonly type?: CompleteObjectType;
    public readonly valueCategory = "lvalue";

    public readonly operand: Expression;

    public readonly operator = "*";

    public constructor(context: ExpressionContext, ast: DereferenceExpressionASTNode, operand: Expression) {
        super(context, ast);

        if (!operand.isWellTyped()) {
            this.attach(this.operand = operand);
            return;
        }

        let convertedOperand = convertToPRValue(operand);
        this.attach(this.operand = convertedOperand);

        if (!Predicates.isTypedExpression(convertedOperand, isPointerType)) {
            this.addNote(CPPError.expr.dereference.pointer(this, convertedOperand.type));
        }
        else if (!(convertedOperand.type.ptrTo.isCompleteObjectType())) {
            // Note: function pointers currently not allowed
            this.addNote(CPPError.expr.dereference.pointerToObjectType(this, convertedOperand.type));
        }
        else {
            this.type = convertedOperand.type.ptrTo;
        }
    }

    public static createFromAST(ast: DereferenceExpressionASTNode, context: ExpressionContext): DereferenceExpression {
        return new DereferenceExpression(context, ast, createExpressionFromAST(ast.operand, context));
    }

    // public createRuntimeExpression<T extends ObjectType>(this: CompiledDereferenceExpression<T>, parent: RuntimeConstruct) : RuntimeDereferenceExpression<T>;
    // public createRuntimeExpression<T extends ObjectType, V extends ValueCategory>(this: Compiled<Expression<T,V>>, parent: RuntimeConstruct) : never;
    // public createRuntimeExpression<T extends ObjectType>(this: CompiledDereferenceExpression<T>, parent: RuntimeConstruct) : RuntimeDereferenceExpression<T> {
    //     return new RuntimeDereferenceExpression(this, parent);
    // }
    public describeEvalResult(depth: number): ConstructDescription {
        throw new Error("Method not implemented.");
    }
}

export interface TypedDereferenceExpression<T extends CompleteObjectType = CompleteObjectType> extends DereferenceExpression, t_TypedExpression {
    readonly type: T;
    readonly operand: TypedExpression<PointerType<T>, "prvalue">;
}

export interface CompiledDereferenceExpression<T extends CompleteObjectType = CompleteObjectType> extends TypedDereferenceExpression<T>, SuccessfullyCompiled {

    readonly temporaryDeallocator?: CompiledTemporaryDeallocator; // to match CompiledPotentialFullExpression structure

    readonly operand: CompiledExpression<PointerType<T>, "prvalue">;
}

export class RuntimeDereferenceExpression<T extends CompleteObjectType> extends SimpleRuntimeExpression<T, "lvalue", CompiledDereferenceExpression<T>> {

    public operand: RuntimeExpression<PointerType<T>, "prvalue">;

    public constructor(model: CompiledDereferenceExpression<T>, parent: RuntimeConstruct) {
        super(model, parent);
        this.operand = createRuntimeExpression(this.model.operand, this);
        this.setSubexpressions([this.operand]);
    }

    protected operate() {
        // Note: function pointers not supported yet

        let ptr = <Value<PointerType<T>>>this.operand.evalResult;
        let addr = ptr.rawValue;

        // If it's a null pointer, give message
        if (PointerType.isNull(addr)) {
            this.sim.memoryIssueOccurred("invalid access", "A null pointer was dereferenced.", SimulationEvent.CRASH);
        }
        else if (PointerType.isNegative(addr)) {
            this.sim.memoryIssueOccurred("invalid access", "A pointer with a negative address was dereferenced.", SimulationEvent.CRASH);
        }
        else if (ptr.type.isArrayPointerType()) {
            // If it's an array pointer, make sure it's in bounds and not one-past
            if (addr < ptr.type.min()) {
                this.sim.memoryIssueOccurred("out-of-bounds access", "A pointer before the beginning of its array was dereferenced.");
            }
            else if (ptr.type.onePast() < addr) {
                this.sim.memoryIssueOccurred("out-of-bounds access", "A pointer beyond the end of its array was dereferenced.");
            }
            else if (addr == ptr.type.onePast()) {
                // TODO: technically this is not undefined behavior unless the result of the dereference undergoes an lvalue-to-rvalue conversion to look up the object
                this.sim.memoryIssueOccurred("out-of-bounds access", "A one-past-the-end pointer was dereferenced.");
            }
        }

        var obj = this.sim.memory.dereference(ptr);
        const freedAllocation = this.sim.memory.findDynamicObjectContainingAddress(addr);
        if (freedAllocation && !freedAllocation.isAlive) {
            this.sim.memoryIssueOccurred("use after free", "A pointer to a deallocated heap object was dereferenced.");
        }

        // Note: dead object is not necessarily invalid. Invalid has to do with the value
        // while dead/alive has to do with the object itself. Reading from dead object does
        // yield an invalid value though.
        // TODO: add this back in
        // if (!obj.isAlive()){
        //     DeadObjectMessage.instance(obj, {fromDereference:true}).display(sim, inst);
        // }
        this.setEvalResult(<this["evalResult"]>obj);
    }


}
