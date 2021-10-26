import TextControlHandle from '../components/rete/controls/TextControlHandle';
import CheckboxControlHandle from '../components/rete/controls/CheckboxControlHandle';
import NumberControlHandle from '../components/rete/controls/NumberControlHandle';
import TypeControlHandle from '../components/rete/controls/TypeControlHandle';

class Type {
    constructor(name, parent, generics, data = {}) {
        if(name instanceof Type) {
            throw new Error(`Type cannot be named ${name}`);
        }
        this.name = name;
        this.parent = parent;
        this.generics = generics.map(type => getType(type));
        this.genericNames = null;//
        this.data = data;
    }

    toJSON() {
        return {
            name: this.name,
            generics: this.generics.map(t => t.toJSON()),
        };
    }

    of(...generics) {
        return getType(this, generics);
    }

    isAbstract() {
        return this.data.abstract || this.generics.some(type => type.isAbstract());
    }

    getDefaultValue() {
        let value = this.data.defaultValue;
        return typeof value === 'function' ? value(this) : value;
    }

    equals(other) {
        return this.name === other.name && this.generics.length === other.generics.length && this.generics.every((t, i) => t.equals(other.generics[i]));
    }

    isSubtype(other) {
        if(!other) {
            return false;
        }
        if(this.name === other.name) {
            return this.generics.length === other.generics.length && this.generics.every((t, i) => t.isSubtype(other.generics[i]));
        }
        return !!other.parent && this.isSubtype(other.parent);
    }

    getSharedType(other) {
        if(!other) {
            return;
        }
        if(this === other) {
            return this;
        }
        if(this.isSubtype(other)) {
            return this;
        }
        if(other.isSubtype(this)) {
            return other;
        }
        if(this.parent) {
            return this.parent.getSharedType(other);
        }
    }

    toTypeString() {
        return this.data.toTypeString?.call(this) ?? this.name + (this.generics.length ? '<' + this.generics.map(g => g.toTypeString()).join(', ') + '>' : '');
    }

    toString() {
        return `Type(${this.toTypeString()})`;
    }
}

export const TYPE_MAP = new Map();

export const anyType = createType('Any', {
    category: 'default',
    reversed: false,
});
export const anyReversedType = createType('AnyReversed', {
    category: 'default',
    // parent: anyType,
    reversed: true,
});

export const typeType = createType('Type', {
    parent: anyType,
    category: 'types',
    controlType: TypeControlHandle,
    defaultValue: type => type.generics[0],
    generics: [anyType],
});

// High-level type categories
export const valueType = createType('Value', {
    abstract: true,
    parent: anyType,
    category: 'values',
});
export const identifierType = createType('Identifier', {
    parent: anyType,
    controlType: TextControlHandle,
    // defaultValue: '',
    validation: {
        minLength: 1,
        // TODO: constrain to valid identifiers
    },
});
export const effectType = createType('Effect', {
    parent: anyReversedType,
    category: 'effects',
    generics: [valueType],
    toMotoko([value]) {
        return value;
    },
});
export const memberType = createType('Member', {
    parent: anyReversedType,
    singleOutput: true,
    category: 'members',
});
export const actorType = createType('Actor', {
    parent: anyReversedType,
    singleOutput: true,
    category: 'actors',
});
export const moduleType = createType('Module', {
    parent: anyReversedType,
    singleOutput: true,
    category: 'modules',
});
export const paramType = createType('Param', {
    parent: anyReversedType,
    category: 'parameters',
});

// Value types
export const boolType = createType('Bool', {
    parent: valueType,
    controlType: CheckboxControlHandle,
    defaultValue: false,
});
export const charType = createType('Char', {
    parent: valueType,
    controlType: TextControlHandle,
    validation: {
        minLength: 1,
        maxLength: 1,
    },
});
export const textType = createType('Text', {
    parent: valueType,
    controlType: TextControlHandle,
    defaultValue: '',
});
export const floatType = createType('Float', {
    parent: valueType,
    controlType: NumberControlHandle,
    defaultValue: 0,
});
export const intType = createType('Int', {
    parent: floatType,
    category: 'integers',
    controlType: NumberControlHandle,
    validation: {
        step: 1,
    },
});
export const natType = createType('Nat', {
    parent: floatType,
    category: 'naturals',
    validation: {
        step: 1,
        min: 0,
    },
});
export const blobType = createType('Blob', {
    parent: valueType,
});
export const principalType = createType('Principal', {
    parent: valueType,
});
export const errorType = createType('Error', {
    parent: valueType,
});
export const tupleType = createType('Tuple', {
    abstract: true,
    arbitraryGenerics: true,
    parent: valueType,
    category: 'tuples',
    // controlType: ,
    toTypeString() {
        return this === tupleType ? this.name : `(${this.generics.map(t => t.toTypeString()).join(', ')})`;
    },
});
// export const unitType = createType('Unit', {
//     parent: tupleType,
// });
export const unitType = tupleType.of();
export const objectType = createType('Object', {
    abstract: true,
    arbitraryGenerics: true,
    parent: valueType,
    category: 'objects',
    // controlType: ,
    toTypeString() {
        return `(${this.generics.map((t, i) => `${this.genericNames[i]}: ${t.toTypeString()}`).join(', ')})`;
    },
});
export const functionType = createType('Function', {
    parent: valueType,
    generics: [valueType, valueType],
    category: 'functions',
    // controlType: ,
    // toTypeString() {
    //     return `(${this.generics[0]} -> ${this.generics[1]})`;
    // },
});
export const optionalType = createType('Optional', {
    parent: valueType,
    generics: [valueType],
    category: 'optionals',
    toMotoko([value]) {
        return `?${value}`;
    },
});
export const asyncType = createType('Async', {
    parent: valueType,
    generics: [valueType],
    category: 'futures',
    toMotoko([value]) {
        return `async ${value}`;
    },
});
// export const andType = createType('And', {
//     parent: valueType,
//     generics: [valueType, valueType],
//     toMotoko([a, b]) {
//         return `(${a} and ${b})`;
//     },
// });

// Fixed-size int values
export const int64Type = createType('Int64', {
    parent: intType,
    validation: getIntValidation(64),
});
export const int32Type = createType('Int32', {
    parent: int64Type,
    validation: getIntValidation(32),
});
export const int16Type = createType('Int16', {
    parent: int32Type,
    validation: getIntValidation(16),
});
export const int8Type = createType('Int8', {
    parent: int16Type,
    validation: getIntValidation(8),
});

// Fixed-size nat values
export const nat64Type = createType('Nat64', {
    parent: natType,
    validation: getNatValidation(64),
});
export const nat32Type = createType('Nat32', {
    parent: nat64Type,
    validation: getNatValidation(32),
});
export const nat16Type = createType('Nat16', {
    parent: nat32Type,
    validation: getNatValidation(16),
});
export const nat8Type = createType('Nat8', {
    parent: nat16Type,
    validation: getNatValidation(8),
});

function getNatValidation(n) {
    return {
        ...natType.data.validation,
        max: 2 ** n - 1,
    };
}

function getIntValidation(n) {
    let x = 2 ** (n - 1);
    return {
        ...intType.data.validation,
        min: -x,
        max: x - 1,
    };
}

function createType(name, data) {
    let parent = data.parent;
    if(parent) {
        // `abstract` is special case for data inheritance
        let {abstract, arbitraryGenerics, ...parentData} = parent.data;
        data = {...parentData, ...data};
    }
    let {generics = [], ...other} = data;
    let type = new Type(name, parent, generics, other);
    TYPE_MAP.set(name, type);
    return type;
}

function getGenericType(parent, generics) {
    if(typeof parent === 'string') {
        parent = getType(parent);
    }
    if((!generics || !generics.length) && !parent.data.arbitraryGenerics) {
        return getType(parent);
    }
    let {abstract, arbitraryGenerics, ...parentData} = parent.data;
    let type = new Type(parent.name, parent, generics, parentData);
    if(!parent.isSubtype(type)) {
        throw new Error(`Generics not assignable to ${parent} from ${type}`);
    }
    return type;
}

export function getType(name, generics) {
    if(arguments.length > 1) {
        return getGenericType(name, generics);
    }
    if(name instanceof Type) {
        return name;
    }
    if(typeof name === 'object') {
        return getGenericType(name.name, (name.generics || []).map(t => getType(t)));
    }
    if(!name) {
        throw new Error(`Invalid type: ${name}`);
    }
    if(!TYPE_MAP.has(name)) {
        throw new Error(`Unknown type: ${name}`);
    }
    return TYPE_MAP.get(name);
}
