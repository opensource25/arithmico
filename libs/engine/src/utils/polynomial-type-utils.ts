import { SyntaxTreeNode } from '../types/SyntaxTreeNodes';
import createPlus from '../create/create-plus';
import createNumberNode from '../create/create-number-node';
import createTimes from '../create/create-times';
import createSymbolNode from '../create/create-symbol-node';
import createPower from '../create/create-power';
import { getDegreeFromPolynomial } from '../plugins/core/polynomials/utils/polynomial-utils';
import createNegate from '../create/create-negate';

export type Polynomial = Monomial[];

export type Monomial = NonConstant | Constant;

interface NonConstant {
    type: 'non-constant';
    coefficient: number;
    base: string;
    degree: number;
}

interface Constant {
    type: 'constant';
    base?: undefined;
    degree?: undefined;
    coefficient: number;
}

export function createNonConstantMonomial(coefficient: number, base: string, degree: number): NonConstant {
    return {
        type: 'non-constant',
        coefficient: coefficient,
        base: base,
        degree: degree,
    };
}

export function createConstantMonomial(coefficient: number): Constant {
    return {
        type: 'constant',
        coefficient: coefficient,
    };
}

export function compareMonomialsByDegree(a: Monomial, b: Monomial): number {
    return (b.degree ?? 0) - (a.degree ?? 0);
}

function getMonomialDegree(monomial: Monomial) {
    if (monomial.type === 'constant') {
        return 0;
    }
    return monomial.degree;
}

export function compareMonomialsDegreeGreater(a: Monomial, b: Monomial) {
    return getMonomialDegree(a) > getMonomialDegree(b);
}

export function compareMonomialsDegreeSmaller(a: Monomial, b: Monomial) {
    return getMonomialDegree(a) < getMonomialDegree(b);
}

export function compareMonomialsDegreeEqual(a: Monomial, b: Monomial) {
    return getMonomialDegree(a) === getMonomialDegree(b);
}

export function haveMonomialsSameBase(a: Monomial, b: Monomial) {
    return a.base === b.base;
}

function getSyntaxTreeNodeFromMonomial(monomial: Monomial): SyntaxTreeNode {
    if (monomial.type === 'constant') {
        return createNumberNode(monomial.coefficient);
    }

    if (monomial.type === 'non-constant' && monomial.degree === 1) {
        switch (monomial.coefficient) {
            case 1:
                return createSymbolNode(monomial.base);
            case -1:
                return createNegate(createSymbolNode(monomial.base));
            default:
                return createTimes(createNumberNode(monomial.coefficient), createSymbolNode(monomial.base));
        }
    }

    if (monomial.type === 'non-constant' && monomial.degree > 1) {
        switch (monomial.coefficient) {
            case 1:
                return createPower(createSymbolNode(monomial.base), createNumberNode(monomial.degree));
            case -1:
                return createNegate(createPower(createSymbolNode(monomial.base), createNumberNode(monomial.degree)));
            default:
                return createTimes(
                    createNumberNode(monomial.coefficient),
                    createPower(createSymbolNode(monomial.base), createNumberNode(monomial.degree)),
                );
        }
    }
}

export function getSyntaxTreeNodeFromPolynomial(polynomial: Polynomial): SyntaxTreeNode {
    return polynomial.map(getSyntaxTreeNodeFromMonomial).reduce(createPlus);
}

export function multiplyMonomials(leftMonomial: Monomial, rightMonomial: Monomial) {
    if (leftMonomial.type === 'non-constant' && rightMonomial.type === 'non-constant') {
        return createNonConstantMonomial(
            leftMonomial.coefficient * rightMonomial.coefficient,
            leftMonomial.base,
            leftMonomial.degree + rightMonomial.degree,
        );
    }

    if (leftMonomial.type === 'non-constant' && rightMonomial.type === 'constant') {
        return createNonConstantMonomial(
            leftMonomial.coefficient * rightMonomial.coefficient,
            leftMonomial.base,
            leftMonomial.degree,
        );
    }

    if (leftMonomial.type === 'constant' && rightMonomial.type === 'non-constant') {
        return createNonConstantMonomial(
            leftMonomial.coefficient * rightMonomial.coefficient,
            rightMonomial.base,
            rightMonomial.degree,
        );
    }

    if (leftMonomial.type === 'constant' && rightMonomial.type === 'constant') {
        return createConstantMonomial(leftMonomial.coefficient * rightMonomial.coefficient);
    }
}

export function divideMonomials(leftMonomial: Monomial, rightMonomial: Monomial) {
    if (getMonomialDegree(leftMonomial) > getMonomialDegree(rightMonomial)) {
        return createNonConstantMonomial(
            leftMonomial.coefficient / rightMonomial.coefficient,
            leftMonomial.base,
            getMonomialDegree(leftMonomial) - getMonomialDegree(rightMonomial),
        );
    }

    if (getMonomialDegree(leftMonomial) === getMonomialDegree(rightMonomial)) {
        return createConstantMonomial(leftMonomial.coefficient / rightMonomial.coefficient);
    }
}

export function addMissingMonomialsWithCoefficientZero(polynomial: Polynomial) {
    const copiedPolynomial = [...polynomial];
    const base = polynomial.length === 1 && polynomial[0].type === 'non-constant' ? polynomial[0].base : null;
    const newMonomials = [];

    for (let i = 0, currentDegree = getDegreeFromPolynomial(polynomial); currentDegree >= 0; currentDegree--) {
        const monomial = copiedPolynomial[i];

        if (getMonomialDegree(monomial) === currentDegree) {
            if (i === polynomial.length - 1) {
                i = polynomial.length - 1;
            } else {
                i++;
            }
        } else if (monomial.type === 'non-constant' && monomial.degree !== currentDegree) {
            newMonomials.push(createNonConstantMonomial(0, base, currentDegree));
        } else if (currentDegree === 0 && copiedPolynomial.at(-1).type !== 'constant') {
            newMonomials.push(createConstantMonomial(0));
        }
    }
    return copiedPolynomial.concat(newMonomials).sort(compareMonomialsByDegree);
}

export function removeMonomialsWithCoefficientZero(polynomial: Polynomial) {
    const copiedPolynomial = [...polynomial].filter((m) => m.coefficient !== 0);
    return copiedPolynomial.length === 0 ? [createConstantMonomial(0)] : copiedPolynomial;
}