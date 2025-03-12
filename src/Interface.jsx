// Interface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { XCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { PARAMETERS } from './config/ParameterDefinitions';
import * as Util from './Utilities.js';
import Filter from './components/ChannelStrip/Filter.jsx';

function ErrorAlert({ message, reset }) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={reset}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Interface(props) {
  // Add a ref to track reset timestamps
  const resetTimestampsRef = useRef({});

  // Initialize paramValues state with default values from the PARAMETERS
  const [paramValues, setParamValues] = useState(() => {
    const initialParams = {};
    PARAMETERS.forEach(param => {
      initialParams[param.paramId] = props[param.paramId] ?? param.defaultValue;
    });
    return initialParams;
  });

  useEffect(() => {
    const updates = {};
    PARAMETERS.forEach(param => {
      const paramId = param.paramId;
      // If a recent reset occurred, skip updating this param
      const lastReset = resetTimestampsRef.current[paramId];
      if (lastReset && (Date.now() - lastReset < 300)) {
        return;
      }
      if (props[paramId] !== undefined && props[paramId] !== paramValues[paramId]) {
        updates[paramId] = props[paramId];
      }
    });
    if (Object.keys(updates).length > 0) {
      setParamValues(current => ({ ...current, ...updates }));
    }
  }, [props]);

  const handleValueChange = (param, newValue) => {
    const formattedValue = Util.formatValueFromButton(newValue, param.paramId, param.min, param.max, param.log);
    if (formattedValue === param.defaultValue) {
      resetTimestampsRef.current[param.paramId] = Date.now();
    }
    setParamValues({ ...paramValues, [param.paramId]: formattedValue });
    props.requestParamValueUpdate(param.paramId, formattedValue);
  };

  if (!props.events) {
    console.log('No events received');
    return null;
  }
  return (
    <div id='main'>
      {props.error && (<ErrorAlert message={props.error.message} reset={props.resetErrorState} />)}
      <div id='controls'>
        <Filter props={props} manifest={PARAMETERS} paramValues={paramValues} handleValueChange={handleValueChange} />
      </div>
    </div>
  );
}