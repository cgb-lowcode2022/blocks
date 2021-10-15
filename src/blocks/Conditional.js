import {statementBlock} from '../block-patterns/statement-patterns';
import {boolType, effectType} from '../block-types/types';

const block = statementBlock({
    inputs: [{
        key: 'condition',
        type: boolType,
    }, {
        key: 'trueCase',
        title: 'True',
        type: effectType,
    }, {
        key: 'falseCase',
        title: 'False',
        type: effectType,
        optional: true,
    }],
}, ({condition, trueCase, falseCase}) => {
    let falsePart = falseCase ? ` else {${falseCase}}` : '';
    return `if(${condition}) {${trueCase}}${falsePart};`;
});
export default block;