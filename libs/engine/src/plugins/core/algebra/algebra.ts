import createPluginV2 from '../../../utils/plugin-builder-v2';
import lsolveFragment from './fragments/lsolve';
import vectorFragment from './fragments/vector';
import inverseMatrixFragment from './fragments/inverse-matrix';
import polynomialFragment from './fragments/polynomial';
import tensorFragment from "./fragments/tensor";

const algebraPlugin = createPluginV2(
    'core/algebra',
    'core',
    'Contains functions to solve linear equations, work with vectors and another algebraic functions.',
)
    .addFragment(lsolveFragment)
    .addFragment(vectorFragment)
    .addFragment(inverseMatrixFragment)
    .addFragment(polynomialFragment)
    .addFragment(tensorFragment)
    .build();

export default algebraPlugin;
