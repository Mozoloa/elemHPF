import React, { useEffect, useRef } from 'react';
import DragBehavior from './DragBehavior.jsx';
import * as Util from '../../Utilities.js';

function ValueCTRL({ name, paramId, onChange, value, actualValue, defaultValue, accentColor }) {
  const divRef = useRef(); // Reference for the div element

  return (
    <DragBehavior onChange={onChange} value={value} defaultValue={defaultValue} onDoubleClick={onChange} name={paramId}>
      <div
        ref={divRef}
        className="param-value"
        style={{ color: accentColor, cursor: 'pointer' }} // Added cursor style for better UX
      >
        {name ? name : Util.formatValueForDisplay(actualValue, paramId)}
      </div>
    </DragBehavior>
  );
}

export default React.memo(ValueCTRL);
