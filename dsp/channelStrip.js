import invariant from 'invariant';
import { el } from '@elemaudio/core';

export default function channelStrip(props, left_in, right_in) {
    invariant(typeof props === 'object', 'Unexpected props object');
    // Grabbing parameters
    const { mix_inGain, mix_drywet, mix_outGain, main_bypass, eq_hpFreq, eq_slope } = props;

    // Grabbing the state and smoothing it
    const inGain = el.db2gain(el.sm(mix_inGain));
    const outGain = el.db2gain(el.sm(mix_outGain));
    const drywet = el.sm(mix_drywet);
    const bypass = el.sm(main_bypass);

    const hpFreq = el.sm(eq_hpFreq);

    // Input gain stage
    const gainedInL = el.meter({ name: 'in_L' }, el.mul(left_in, inGain));
    const gainedInR = el.meter({ name: 'in_R' }, el.mul(right_in, inGain));

    // High-pass filter
    let hpL = el.highpass(hpFreq, 0.707, gainedInL);
    let hpR = el.highpass(hpFreq, 0.707, gainedInR);
    if (eq_slope) {
        // Stack a second high-pass filter to double the slope effect
        hpL = el.highpass(hpFreq, 0.707, hpL);
        hpR = el.highpass(hpFreq, 0.707, hpR);
    }

    // Output gain stage
    const gainedOutL = el.mul(hpL, outGain);
    const gainedOutR = el.mul(hpR, outGain);

    // Dry/wet mix
    const mixedL = el.select(drywet, gainedOutL, left_in);
    const mixedR = el.select(drywet, gainedOutR, right_in);

    // Bypass
    const outL = el.select(bypass, left_in, mixedL);
    const outR = el.select(bypass, right_in, mixedR);
    return {
        left: el.meter({ name: 'out_L' }, outL),
        right: el.meter({ name: 'out_R' }, outR),
    };
}
