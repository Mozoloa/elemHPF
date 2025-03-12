import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import './DragBehavior.css';

export default function DragBehavior(props) {
  const nodeRef = useRef();
  const valueAtDragStartRef = useRef(props.value || 0);
  const { snapToMouseLinearHorizontal, value, onChange, defaultValue, onDoubleClick, ...other } = props;

  // Handle drag behavior
  const bindDragHandlers = useDrag((state) => {
    if (state.first && typeof value === 'number') {
      valueAtDragStartRef.current = value;

      if (snapToMouseLinearHorizontal) {
        let [x, y] = state.xy;
        let posInScreen = nodeRef.current.getBoundingClientRect();

        let dx = x - posInScreen.left;
        let dv = dx / posInScreen.width;

        valueAtDragStartRef.current = Math.max(0, Math.min(1, dv));

        if (typeof onChange === 'function') {
          onChange(Math.max(0, Math.min(1, dv)));
        }
      }
      return;
    }

    let [dx, dy] = state.movement;
    let dv = (dx - dy) / 200;

    if (typeof onChange === 'function') {
      onChange(Math.max(0, Math.min(1, valueAtDragStartRef.current + dv)));
    }
  });

  // Handle double-click event
  const handleDoubleClick = (e) => {
    e.stopPropagation(); // Stop the event from bubbling up
    console.log("DragBehavior: onDoubleClick triggered, defaultValue:", defaultValue); // debug log
    if (typeof onDoubleClick === 'function') {
      onDoubleClick(defaultValue);
    }
  };

  // Handle scroll wheel input
  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault(); // Prevents page scroll when interacting
      // Base delta
      let baseDelta = event.deltaY > 0 ? -0.04 : 0.04;
      // If shift key is held, use half the step for finer control.
      let delta = event.shiftKey ? baseDelta / 2 : baseDelta;
      delta = event.altKey ? delta * 4 : delta;
      let newValue = Math.max(0, Math.min(1, (value || 0) + delta));

      if (typeof onChange === 'function') {
        onChange(newValue);
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
  }, [value, onChange, defaultValue, onDoubleClick]);

  return (
    <div ref={nodeRef} className="dragbehaviour" {...bindDragHandlers()} {...other}>
      {props.children}
    </div>
  );
}
