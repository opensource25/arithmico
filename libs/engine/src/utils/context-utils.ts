import serialize from '../serialize';
import { Context, Options, SyntaxTreeNode } from '../types';

export const defaultOptions: Options = {
    decimalPlaces: 6,
    decimalSeparator: '.',
    magnitudeThresholdForScientificNotation: 6,
    angleUnit: 'degrees',
    operators: {
        define: true,
        lambda: true,

        orBooleanBoolean: true,
        orFunctionFunction: true,

        andBooleanBoolean: true,
        andFunctionFunction: true,

        negateNumber: true,
        negateBoolean: true,
        negateFunction: true,

        equalsNumberNumber: true,
        equalsBooleanBoolean: true,
        equalsFunctionFunction: true,

        lessNumberNumber: true,
        lessFunctionFunction: true,

        lessOrEqualsNumberNumber: true,
        lessOrEqualsFunctionFunction: true,

        greaterNumberNumber: true,
        greaterFunctionFunction: true,

        greaterOrEqualsNumberNumber: true,
        greaterOrEqualsFunctionFunction: true,

        plusNumberNumber: true,
        plusVectorVector: true,
        plusFunctionFunction: true,

        minusNumberNumber: true,
        minusVectorVector: true,
        minusFunctionFunction: true,

        timesNumberNumber: true,
        timesNumberVector: true,
        timesVectorVector: true,
        timesVectorMatrix: true,
        timesMatrixMatrix: true,
        timesFunctionFunction: true,

        dividedNumberNumber: true,
        dividedVectorNumber: true,
        dividedFunctionFunction: true,

        powerNumberNumber: true,
        powerFunctionFunction: true,
    },
};

export function createContextWithOptions(options: Options): Context {
    return {
        options,
        stack: [new Map()],
    };
}

export function createOptions(options?: Partial<Options>): Options {
    return {
        ...defaultOptions,
        ...options,
        operators: {
            ...defaultOptions.operators,
            ...options?.operators,
        },
    };
}

export function useStrictContextValidator(name: string, context: Context) {
    if (context.stack.length === 0) {
        throw 'ContextError: no stackframes available';
    }
}

export function existsOnStack(name: string, context: Context) {
    for (let i = context.stack.length - 1; i >= 0; i--) {
        const stackFrame = context.stack[i];

        if (stackFrame.has(name)) {
            return true;
        }
    }

    return false;
}

export function getStackObject(name: string, context: Context) {
    for (let i = context.stack.length - 1; i >= 0; i--) {
        const stackFrame = context.stack[i];

        if (stackFrame.has(name)) {
            return stackFrame.get(name);
        }
    }
}

export function insertStackObject(name: string, stackObject: SyntaxTreeNode, context: Context): Context {
    useStrictContextValidator(name, context);
    const stackFrameIndex = context.stack.length - 1;
    return {
        ...context,
        stack: context.stack.map((stackFrame, index) => {
            if (index === stackFrameIndex) {
                const newStackFrame = new Map(stackFrame);
                newStackFrame.set(name, stackObject);
                return newStackFrame;
            }
            return stackFrame;
        }),
    };
}

export function serializeStack(context: Context): Record<string, string> {
    if (context.stack.length === 0) {
        return {};
    }

    return Object.fromEntries(
        [...context.stack.at(-1).entries()].map(([name, node]) => [name, serialize(node, context.options)]),
    );
}
