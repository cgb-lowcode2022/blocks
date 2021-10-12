import {useCallback} from 'react';

export default function MenuSearch({value, onChange, onAction, onKeyDown, ...others}) {

    const bindInput = useCallback(el => {
        if(!el) {
            return;
        }
        el.focus();
        el.select();
    }, []);

    const handleKeyDown = (onKeyDown || onAction) && (event => {
        if(onKeyDown) {
            onKeyDown(event);
        }
        if(onAction && event.keyCode === 13 /* Enter */) {
            onAction();
        }
    });

    return (
        <input
            type="text"
            className="context-menu-search"
            autoFocus
            ref={bindInput}
            autoComplete="blocks-search"
            value={value || ''}
            onClick={event => event.stopPropagation()}
            onChange={onChange && (event => onChange(event.target.value))}
            onKeyDown={handleKeyDown}
            {...others}
        />
    );
}