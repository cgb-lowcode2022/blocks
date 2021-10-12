import React from 'react';
import ReactDOM from 'react-dom';
import ContextMenu from './components/ContextMenu';
import AbsolutePosition from './components/AbsolutePosition';
import {MenuContext} from './contexts/MenuContext';

// Derived from: https://github.com/michael-braun/rete-react-contextmenu-plugin

function install(editor, config = {}) {
    editor.bind('hidecontextmenu');
    editor.bind('showcontextmenu');

    let [offsetX, offsetY] = config.offset ? [config.offset.x, config.offset.y] : [-10, -10];

    let menu = null;

    editor.on('hidecontextmenu', () => {
        if(menu) {
            menu.style.display = 'none';
        }
    });

    editor.on(['click', 'contextmenu'], () => {
        editor.trigger('hidecontextmenu');
    });

    editor.on('contextmenu', ({e, node, context}) => {
        e.preventDefault();
        e.stopPropagation();

        if(!editor.trigger('showcontextmenu', {e, node, context})) {
            return;
        }

        // Select node under cursor
        if(node) {
            if(!editor.selected.contains(node)) {
                editor.selectNode(node);
            }
        }
        else {
            editor.selected.clear();
        }

        const [x, y] = [e.clientX, e.clientY];

        if(!menu) {
            menu = document.createElement('div');
            editor.view.container.appendChild(menu);
        }
        menu.style.display = 'block';
        ReactDOM.render((
            <AbsolutePosition
                x={x + offsetX}
                y={y + offsetY}
                onClick={() => editor.trigger('hidecontextmenu')}>
                <MenuContext.Provider value={{editor, mouse, node, context}}>
                    <ContextMenu/>
                </MenuContext.Provider>
            </AbsolutePosition>
        ), menu);
    });

    editor.on('destroy', () => {
        console.log('CLEANUP');/////
        if(menu) {
            menu.remove();
            menu = null;
        }
    });

    const mouse = {x: 0, y: 0};

    editor.on('mousemove', ({x, y}) => {
        mouse.x = x;
        mouse.y = y;
    });

    //
    // let lastConnectionStart = null;
    // editor.on('rendersocket', ({el, socket, input, output}) => {
    //     const connected = {
    //         current: input?.hasConnection?.() || false,
    //     };
    //
    //     if(input) {
    //         editor.on('connectioncreated', (connection) => {
    //             if(connection.input === input) {
    //                 connected.current = connection.input.hasConnection();
    //             }
    //         });
    //     }
    //
    //     el.addEventListener('pointerdown', () => {
    //         if(lastConnectionStart) {
    //             lastConnectionStart = null;
    //         }
    //         else {
    //             lastConnectionStart = {
    //                 socket,
    //                 input: input || null,
    //                 output: output || null,
    //                 node: input?.node || output?.node,
    //                 connected,
    //             };
    //         }
    //     });
    //
    //     el.addEventListener('pointerup', () => {
    //         if(input && lastConnectionStart) {
    //             lastConnectionStart.connected.current = input.hasConnection();
    //         }
    //
    //         lastConnectionStart = null;
    //     });
    // });
    //
    // editor.view.container.addEventListener('pointerup', (e) => {
    //     if(!lastConnectionStart || lastConnectionStart.connected.current) {
    //         if(lastConnectionStart?.input) {
    //             lastConnectionStart.connected.current = lastConnectionStart.input.hasConnection();
    //         }
    //
    //         lastConnectionStart = null;
    //         return;
    //     }
    //
    //     const connectionStart = lastConnectionStart;
    //     lastConnectionStart = null;
    //     editor.trigger('contextmenu', {e, node: null, context: connectionStart});
    // });
}

export const COMPONENT_NODE = 'node';
export const COMPONENT_NODE_CONTAINER = 'node-container';
export const COMPONENT_CONTEXT = 'context';
export const COMPONENT_CONTEXT_CONTAINER = 'context-container';

const ContextMenuPlugin = {
    name: 'blocks-contextmenu',
    install,
};
export default ContextMenuPlugin;
