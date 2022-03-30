import evaluate from '..';
import createNumberNode from '../../create/NumberNode';
import createPlus from '../../create/Plus';
import createTimes from '../../create/Times';
import createVector from '../../create/Vector';
import { Times, Context, SyntaxTreeNode, Vector } from '../../types';
import { createBinaryOperatorFunctionComposition } from '../../utils/compose-function-utils';
import { getVectorDimensions, getVectorElement } from '../../utils/vector-utils';

function matrixTimesMatrixItem(leftMatrix: Vector, rightMatrix: Vector, x: number, y: number): SyntaxTreeNode {
    const line = leftMatrix.values[y] as Vector;
    return line.values
        .map(
            (_, index) =>
                createTimes(
                    getVectorElement(leftMatrix, [y, index]),
                    getVectorElement(rightMatrix, [index, x]),
                ) as SyntaxTreeNode,
        )
        .reduceRight((right, left) => createPlus(left, right));
}

export default function evaluateTimes(node: Times, context: Context): SyntaxTreeNode {
    const leftChild = evaluate(node.left, context);
    const rightChild = evaluate(node.right, context);

    if (leftChild.type === 'number' && rightChild.type === 'number') {
        return createNumberNode(leftChild.value * rightChild.value);
    }

    if (leftChild.type === 'number' && rightChild.type === 'vector') {
        return createVector(rightChild.values.map((value) => evaluate(createTimes(leftChild, value), context)));
    }

    if (leftChild.type === 'vector' && rightChild.type === 'number') {
        return createVector(leftChild.values.map((value) => evaluate(createTimes(rightChild, value), context)));
    }

    if (leftChild.type === 'vector' && rightChild.type === 'vector') {
        const leftDims = getVectorDimensions(leftChild);
        const rightDims = getVectorDimensions(rightChild);
        const leftRank = leftDims.length;
        const rightRank = rightDims.length;

        // vector scalar product
        if (leftRank === 1 && rightRank === 1) {
            if (leftDims[0] !== rightDims[0]) {
                throw 'ShapeError: incompatible vector shapes';
            }

            if (leftDims[0] === 0) {
                throw 'ShapeError: empty vector';
            }

            const components: SyntaxTreeNode[] = leftChild.values.map((_, index) =>
                createTimes(leftChild.values[index], rightChild.values[index]),
            );

            return evaluate(
                components.reduceRight((right, left) => createPlus(left, right)),
                context,
            );
        } else if (leftRank === 2 && rightRank === 2) {
            if (leftDims[1] !== rightDims[0]) {
                throw 'ShapeError: incompatible vector shapes';
            }

            const lines: Vector[] = [];

            for (let y = 0; y < leftDims[0]; y++) {
                const lineElements: SyntaxTreeNode[] = [];
                for (let x = 0; x < rightDims[1]; x++) {
                    lineElements.push(matrixTimesMatrixItem(leftChild, rightChild, x, y));
                }
                lines.push(createVector(lineElements));
            }

            return evaluate(createVector(lines), context);
        } else if (leftRank === 2 && rightRank === 1) {
            if (leftDims[1] !== rightDims[0]) {
                throw 'ShapeError: incompatible vector shapes';
            }

            const result = evaluate(
                createTimes(leftChild, createVector(rightChild.values.map((value) => createVector([value])))),
                context,
            ) as Vector;

            return createVector(result.values.map((vector: Vector) => vector.values[0]));
        } else if (leftRank === 1 && rightRank === 2) {
            if (leftDims[0] !== rightDims[0]) {
                throw 'ShapeError: incompatible vector shapes';
            }

            return (evaluate(createTimes(createVector([leftChild]), rightChild), context) as Vector).values[0];
        }

        throw 'ShapeError: incompatible vector shapes';
    } else if (leftChild.type === 'function' && rightChild.type === 'function') {
        return createBinaryOperatorFunctionComposition(leftChild, rightChild, createTimes, context);
    }

    throw `TypeError: <${leftChild.type}> * <${rightChild.type}> is not defined`;
}
