import { Renderer, el } from '@elemaudio/core';
import { RefMap } from './RefMap';
import channelStrip from './channelStrip';
import manifest from '../public/manifest.json';

let core = new Renderer((batch) => {
  __postNativeMessage__(JSON.stringify(batch));
});

let refs = new RefMap(core);
let prevState = null;

function isRerenderParam(key) {
  return manifest.parameters.some(param => param.paramId === key && param.rerender);
}


// Check if a full render is needed
function shouldRender(prevState, nextState) {
  if (prevState === null || prevState.sampleRate !== nextState.sampleRate) {
    console.log('Full render (sampleRate changed)');
    return true;
  }

  // Check any parameter with rerender flag
  for (const param of manifest.parameters) {
    if (param.rerender) {
      const key = param.paramId;
      if (prevState[key] !== nextState[key]) {
        console.log(`Full render because ${key} changed`);
        return true;
      }
    }
  }
  return false;
}

function prepProps(state, key) {
  let newProps = { key };
  for (let [k, v] of Object.entries(state)) {
    // Pass sampleRate or any explicit rerender parameter directly
    if (k === 'sampleRate' || isRerenderParam(k)) {
      newProps[k] = v;
    } else {
      newProps[k] = refs.getOrCreate(k, 'const', { value: v }, []);
    }
  }
  return newProps;
}

function updateProps(state) {
  for (let [k, v] of Object.entries(state)) {
    // Do not update refs for sampleRate or rerender parameters
    if (k === 'sampleRate' || isRerenderParam(k)) {
      continue;
    }
    try {
      refs.update(k, { value: v });
    } catch (error) {
      // silently ignore errors
    }
  }
}

function fullRender(state) {
  // Clear the ref map so that all refs are re-initialized with the new state
  refs._map.clear();
  const props = prepProps(state, 'channelStrip');
  console.log('Full render with props:', props);
  const strip = channelStrip(props, el.in({ channel: 0 }), el.in({ channel: 1 }));
  core.render(strip.left, strip.right);
}

globalThis.__receiveStateChange__ = (serializedState) => {
  const state = JSON.parse(serializedState);
  if (shouldRender(prevState, state)) {
    fullRender(state);
  } else {
    updateProps(state);
  }
  prevState = { ...state };
};

globalThis.__receiveHydrationData__ = (data) => {
  const payload = JSON.parse(data);
  const nodeMap = core._delegate.nodeMap;

  for (let [k, v] of Object.entries(payload)) {
    nodeMap.set(parseInt(k, 16), {
      symbol: '__ELEM_NODE__',
      kind: '__HYDRATED__',
      hash: parseInt(k, 16),
      props: v,
      generation: { current: 0 },
    });
  }
};

globalThis.__receiveError__ = (err) => {
  console.log(`[Error: ${err.name}] ${err.message}`);
};
