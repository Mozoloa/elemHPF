import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Interface from './Interface.jsx';

// ...existing state management and utility imports...
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { updateEventMap, getEventMap } from './Utilities';
import './index.css';

// Initial state management
const store = createStore(() => { });
const errorStore = createStore(() => ({ error: null }));

function requestParamValueUpdate(paramId, value) {
  if (typeof globalThis.__postNativeMessage__ === 'function') {
    globalThis.__postNativeMessage__("setParameterValue", { paramId, value });
  }
}

if (process.env.NODE_ENV !== 'production') {
  import.meta.hot.on('reload-dsp', () => {
    console.log('Sending reload dsp message');
    if (typeof globalThis.__postNativeMessage__ === 'function') {
      globalThis.__postNativeMessage__('reload');
    }
  });
}

globalThis.__receiveStateChange__ = function (state) {
  const parsedState = JSON.parse(state);
  store.setState(parsedState);
};

globalThis.__receiveGraphEvents__ = function (eventBatch) {
  updateEventMap(eventBatch);
};

globalThis.__receiveError__ = (err) => {
  errorStore.setState({ error: err });
  console.error(`[Error from native side: ${err.name}] ${err.message}`);
};

function App(props) {
  // In development, run manifest generation only on the server side
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && import.meta.env.SSR) {
      import('../scripts/generateManifest.js')
        .then(({ generateManifest }) => generateManifest())
        .catch(err => console.error('Error generating manifest:', err));
    }
  }, []);

  let state = useStore(store);
  let { error } = useStore(errorStore);
  return (
    <Interface
      {...state}
      events={getEventMap()}
      error={error}
      requestParamValueUpdate={requestParamValueUpdate}
      resetErrorState={() => errorStore.setState({ error: null })}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (typeof globalThis.__postNativeMessage__ === 'function') {
  globalThis.__postNativeMessage__("ready");
}
