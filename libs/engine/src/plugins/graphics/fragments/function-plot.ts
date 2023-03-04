import createFunctionCall from '../../../node-operations/create-node/create-function-call';
import createNumberNode from '../../../node-operations/create-node/create-number-node';
import evaluate from '../../../node-operations/evaluate-node';
import { FunctionHeaderItem, FunctionNode, NumberNode } from '../../../types';
import { Cartesian2DGraphic, Point2D } from '../../../types/graphics.types';
import { PluginFragment } from '../../../utils/plugin-builder';

const plotResolution = 1000;

const plotHeader: FunctionHeaderItem[] = [
    { type: 'function', name: 'f', evaluate: true },
    { type: 'number', name: 'xMin', evaluate: true, optional: true },
    { type: 'number', name: 'xMax', evaluate: true, optional: true },
];

const functionPlotFragment = new PluginFragment().addFunction(
    'plot',
    plotHeader,
    '',
    '',
    ({ getParameter, typeError, runtimeError, context }): Cartesian2DGraphic => {
        const f = getParameter('f') as FunctionNode;
        const xMinNode = getParameter('xMin', createNumberNode(-10)) as NumberNode;
        const xMaxNode = getParameter('xMax', createNumberNode(10)) as NumberNode;
        const xMin = Math.min(xMinNode.value, xMaxNode.value);
        const xMax = Math.max(xMinNode.value, xMaxNode.value);

        if (f.header.length !== 1 || !['number', 'any'].includes(f.header.at(0).type)) {
            throw typeError('invalid function signature');
        }

        if (xMin === xMax) {
            throw runtimeError('xMax must be greater than xMin');
        }

        const points: Point2D[] = [];

        for (let i = 0; i <= plotResolution; i++) {
            const x = xMin + ((xMax - xMin) * i) / plotResolution;
            const yNode = evaluate(createFunctionCall(f, [createNumberNode(x)]), context);
            if (yNode.type !== 'number') {
                throw runtimeError(`invalid return type expected number got ${yNode.type}`);
            }
            points.push({ x: x, y: yNode.value });
        }

        const yMin = points.map((point) => point.y).reduce((a, b) => Math.min(a, b));
        const yMax = points.map((point) => point.y).reduce((a, b) => Math.max(a, b));

        return {
            type: 'graphic',
            graphicType: 'cartesian2D',
            limits: { xMin, yMin, xMax, yMax },
            xTicks: 'auto',
            yTicks: 'auto',
            lines: [
                {
                    type: 'line',
                    points,
                },
            ],
        };
    },
);

export default functionPlotFragment;
