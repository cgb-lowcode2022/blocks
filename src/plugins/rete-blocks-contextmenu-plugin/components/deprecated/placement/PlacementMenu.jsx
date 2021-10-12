import React from 'react';
import MenuPositioner from '../MenuPositioner';
import useEditorComponents from '../../../hooks/useEditorComponents';
import NodeItem from '../node/NodeItem';

let style = {
    background: '#FFF',
};

let itemStyle = {
    padding: '5px',
    cursor: 'pointer',
    color: '#222',
};

const PlacementMenu = ({x, y, root, editor, onCreateNode, context}) => {
    const components = useEditorComponents(editor, context);

    return (
        <MenuPositioner
            x={x}
            y={y}
            style={style}
            root={root}
            editor={editor}>
            {components.map((component) => (
                <NodeItem
                    onCreateNode={onCreateNode}
                    key={component.name}
                    component={component}
                    style={itemStyle}
                />
            ))}
        </MenuPositioner>
    );
};

PlacementMenu.propTypes = {};

export default PlacementMenu;
