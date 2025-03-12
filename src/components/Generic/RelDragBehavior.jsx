import React, { useEffect, useRef } from 'react';
import { useDrag } from '@use-gesture/react';

export default function RelDragBehavior(props) {
  const {
    value = 0, // Not used here since master uses its own base
    snapToMouseLinearHorizontal,
    onChange,
    onDoubleClick,
    onDragEnd,
    ...other
  } = props;
  const nodeRef = useRef();
  // For wheel events, we need to accumulate delta because each event is independent.
  const wheelDeltaRef = useRef(0);

  const bindDragHandlers = useDrag((state) => {
    if (state.first) {
      // Reset wheel accumulation at the start of a gesture.
      wheelDeltaRef.current = 0;
    }
    if (state.last && typeof onDragEnd === 'function') {
      onDragEnd();
    }
    // state.movement is cumulative so this delta is relative to gesture start.
    const [dx, dy] = state.movement;
    const delta = (dx - dy) / 200;
    if (typeof onChange === 'function') {
      onChange(delta);
    }
  });

  // For wheel events, accumulate the delta so that each wheel tick adds onto the previous one.
  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault();
      let baseDelta = event.deltaY > 0 ? -0.04 : 0.04;
      let delta = event.shiftKey ? baseDelta / 2 : baseDelta;
      delta = event.altKey ? delta * 4 : delta;
      wheelDeltaRef.current += delta;
      if (typeof onChange === 'function') {
        onChange(wheelDeltaRef.current);
      }
    };

    const handleDoubleClick = (e) => {
      e.stopPropagation();
      if (typeof onDoubleClick === 'function') {
        onDoubleClick(0);
      }
    };

    const node = nodeRef.current;
    if (node) {
      node.addEventListener('wheel', handleWheel);
      node.addEventListener('dblclick', handleDoubleClick);
    }
    return () => {
      if (node) {
        node.removeEventListener('wheel', handleWheel);
        node.removeEventListener('dblclick', handleDoubleClick);
      }
    };
  }, [onChange, onDoubleClick]);

  return (
    <div ref={nodeRef} className="dragbehaviour" {...bindDragHandlers()} {...other}>
      {props.children}
    </div>
  );
}
