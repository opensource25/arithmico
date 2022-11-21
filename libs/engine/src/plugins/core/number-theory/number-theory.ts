import createPluginV2 from '../../../utils/plugin-builder-v2';
import primeNumberFragment from './fragments/prime-numbers';
import gcdLcmFragment from './fragments/gcd-lcm';
import coprimeFragment from './fragments/coprime';

const numberTheoryPlugin = createPluginV2(
    'core/number-theory',
    'brings many functions for calculation on integers and in number theory',
    'core',
)
    .addFragment(primeNumberFragment)
    .addFragment(gcdLcmFragment)
    .addFragment(coprimeFragment)
    .build();

export default numberTheoryPlugin;
