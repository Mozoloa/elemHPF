/*
This function exports an array of parameter objects used to create the GUI and interact with the audio engine. The GUI uses these parameters directly, while the audio engine uses a JSON version of them (in public/manifest.json) to build the audio graph.

Each parameter object includes:
- paramId: unique identifier
- name: display name
- min: minimum value
- max: maximum value
- defaultValue: default value
- hue: color hue (optional)
- toggle: boolean for toggle parameters (optional)
- log: boolean for logarithmic scale (optional)
- rerender: boolean to trigger audio engine rerender on change (optional)

Using a function helps set multiple similar parameters without hardcoding each one, useful for similar parameters like EQ bands.

But if it's confusing for you, you can start by hardcoding parameters, by using PARAMETERS.push(). Example:
PARAMETERS.push({ paramId: "gain", name: "Gain", min: -20, max: 20, defaultValue: 0, hue: 200 });
*/

// Global parameters as plain object literals
const PARAMETERS = [];

// Global parameters
PARAMETERS.push(
    { paramId: "mix_inGain", name: "INP", min: -20, max: 20, defaultValue: 0, hue: 200 },
    { paramId: "mix_drywet", name: "MIX", min: 0, max: 1, defaultValue: 1 },
    { paramId: "mix_outGain", name: "OUT", min: -20, max: 20, defaultValue: 0, hue: 200 },
    { paramId: "main_bypass", name: "B", min: 0, max: 1, defaultValue: 0, toggle: true }
);


// High-pass filter (frequency only)
PARAMETERS.push(
    {
        paramId: "eq_hpFreq",
        name: "HPF Freq",
        min: 20,
        max: 10000,
        defaultValue: 20,
        log: true,
        hue: 200
    },
    {
        paramId: "eq_slope",
        name: "Slope",
        min: 0,
        max: 1,
        defaultValue: 0,
        toggle: true,
        rerender: true
    }
);

export { PARAMETERS };

