import {useContext, useState} from 'react';
import EventsContext, {EDITOR_CHANGE_EVENT} from '../../../contexts/EventsContext';
import useListener from '../../../hooks/useListener';

export default function DynamicTitle({editor, node, block}) {

    let computeTitle = () => block.computeTitle(node, editor);

    let [title, setTitle] = useState(computeTitle);

    let events = useContext(EventsContext);

    useListener(events, EDITOR_CHANGE_EVENT, () => setTitle(computeTitle()));

    return title || null;
}