// abstract interfaces
interface AbstractSyntaxTreeNode {
    type: string
}

interface AbstractBinaryOperatorNode extends AbstractSyntaxTreeNode {
    children: [SyntaxTreeNode, SyntaxTreeNode]
}

interface AbstractUnaryOperatorNode extends AbstractSyntaxTreeNode {
    child: SyntaxTreeNode
}

// data structure nodes
export interface Symbol extends AbstractSyntaxTreeNode {
    type: "Symbol",
    name: string
}

export interface Number extends AbstractSyntaxTreeNode {
    type: "Number",
    value: number
}

export interface Boolean extends AbstractSyntaxTreeNode {
    type: "Boolean",
    value: boolean
}

export interface Vector extends AbstractSyntaxTreeNode {
    type: "Vector",
    children: SyntaxTreeNode[]
}

// non terminal nodes
export interface And extends AbstractBinaryOperatorNode {
    type: "And"
}

export interface Or extends AbstractBinaryOperatorNode {
    type: "Or"
}

export interface Add extends AbstractBinaryOperatorNode {
    type: "Add"
}

export interface Mul extends AbstractBinaryOperatorNode {
    type: "Mul"
}

export interface Pow extends AbstractBinaryOperatorNode {
    type: "Pow"
}

export interface Equal extends AbstractBinaryOperatorNode {
    type: "Equal"
}

export interface LessThan extends AbstractBinaryOperatorNode {
    type: "LessThan"
}

export interface GreaterThan extends AbstractBinaryOperatorNode {
    type: "GreaterThan"
}

export interface LessThanOrEqual extends AbstractBinaryOperatorNode {
    type: "LessThanOrEqual"
}

export interface GreaterThanOrEqual extends AbstractBinaryOperatorNode {
    type: "GreaterThanOrEqual"
}

export interface Definition extends AbstractBinaryOperatorNode {
    type: "Definition"
}

// unary operator nodes
export interface Not extends AbstractUnaryOperatorNode {
    type: "Not"
}

// other nodes
export interface FunctionCall extends AbstractSyntaxTreeNode {
    type: "FunctionCall",
    name: string,
    children: SyntaxTreeNode[]
}

export interface FunctionParameter {
    name: string,
    type: string
}

export interface FunctionSignature extends AbstractSyntaxTreeNode {
    type: "FunctionSignature",
    name: string,
    parameters: FunctionParameter[]
}

// node categories
export type SyntaxTreeNode = DatastructureNode
    | BinaryOperatorNode
    | UnaryOperatorNode
    | FunctionSignature
    | FunctionCall;

export type DatastructureNode = Symbol
    | Number
    | Boolean
    | Vector;

export type BinaryOperatorNode = Add
    | Mul
    | Pow
    | And
    | Or
    | Equal
    | LessThan
    | GreaterThan
    | LessThanOrEqual
    | GreaterThanOrEqual
    | Definition;

export type PartialOrder = LessThan | GreaterThan | LessThanOrEqual | GreaterThanOrEqual;
export type Relation = Equal | PartialOrder

export type UnaryOperatorNode = Not;