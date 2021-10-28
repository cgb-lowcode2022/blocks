import React from 'react';
import {Control, Node} from 'rete-react-render-plugin';
import {SocketHandle} from '../sockets/SocketHandle';
import {getBlock} from '../../../editor/blocks';
import classNames from 'classnames';
import {paramCase} from 'change-case';
import DynamicTitle from './parts/DynamicTitle';
import getNodeLabel from '../../../utils/getNodeLabel';
import getPropLabel from '../../../utils/getPropLabel';
import {ButtonGroup} from 'react-bootstrap';
import ShortcutButton from './parts/ShortcutButton';

function PropHandle({prop, node, hideLeft, hideRight, bindSocket, bindControl}) {
    let input = node.inputs.get(prop.key);
    let output = node.outputs.get(prop.key);
    let control = node.controls.get(prop.key) || (input?.showControl() && input.control);

    let leftSocket = input && !hideLeft && (
        <SocketHandle
            type="input"
            socket={input.socket}
            io={input}
            innerRef={bindSocket}
        />
    );
    let rightSocket = output && !hideRight && (
        <SocketHandle
            type="output"
            socket={output.socket}
            io={output}
            innerRef={bindSocket}
        />
    );
    let controlField = control && (
        <Control
            className={input ? 'input-control' : 'control'}
            control={control}
            innerRef={bindControl}
        />
    );

    return (
        <div className={classNames('prop', 'key-' + paramCase(prop.key))}>
            <div className="input">
                {leftSocket}
                {controlField || (leftSocket && (
                    <div className="input-title">{getPropLabel(prop)}</div>
                ))}
            </div>
            <div className="output">
                {!input && (rightSocket && (
                    <div className="output-title">{getPropLabel(prop)}</div>
                ))}
                {rightSocket}
            </div>
        </div>
    );
}

export default class NodeHandle extends Node {
    render() {
        const {editor, node, bindSocket, bindControl} = this.props;
        const {selected} = this.state;

        let block = getBlock(node.name);

        // Properties for the top left/right corners
        let topLeft = block.topLeft && node.inputs.get(block.topLeft);
        let topRight = block.topRight && node.outputs.get(block.topRight);

        let title = getNodeLabel(node, editor, true);
        if(block.computeTitle) {
            title = <DynamicTitle editor={editor} node={node} block={block} fallback={title}/>;
        }

        return (
            <div className={classNames('node', selected)}>
                <div className="header">
                    {topLeft && (
                        <div style={{float: 'left'}}>
                            <SocketHandle
                                type="input"
                                socket={topLeft.socket}
                                io={topLeft}
                                innerRef={bindSocket}
                            />
                        </div>
                    )}
                    {topRight && (
                        <div style={{float: 'right'}}>
                            <SocketHandle
                                type="output"
                                socket={topRight.socket}
                                io={topRight}
                                innerRef={bindSocket}
                            />
                        </div>
                    )}
                    <div className="title d-inline-block" style={{color: block.category.data.color}}>
                        {block.icon && (
                            // TODO: improve icon render logic
                            <span className="d-inline-block" style={{transform: 'translateY(-.1em)'}}>
                                {React.createElement(block.icon)}&nbsp;
                            </span>
                        )}
                        {title}
                    </div>
                </div>
                {block.shortcuts.length > 0 && (
                    <ButtonGroup className="px-4 py-1 w-100" style={{background:'#0002'}}>
                        {block.shortcuts.map((shortcut, i) => (
                            <ShortcutButton key={i} editor={editor} node={node} shortcut={shortcut}/>
                        ))}
                    </ButtonGroup>
                )}
                {Object.values(block.props)
                    .filter(prop => prop.control || ((!topLeft || prop.key !== block.topLeft) && (!topRight || prop.key !== block.topRight)))
                    .map(prop => (
                        <PropHandle
                            key={prop.key}
                            prop={prop}
                            node={node}
                            hideLeft={prop.key === block.topLeft}
                            hideRight={prop.key === block.topRight}
                            bindSocket={bindSocket}
                            bindControl={bindControl}
                        />
                    ))}
            </div>
        );
    }
}
