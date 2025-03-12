import invariant from 'invariant';

export class RefMap {
  constructor(core) {
    this._map = new Map();
    this._core = core;
  }

  getOrCreate(name, type, props, children) {
    if (!this._map.has(name)) {
      // Create ref and store as an object with named properties for clarity.
      const ref = this._core.createRef(type, props, children);
      this._map.set(name, { node: ref[0], update: ref[1] });
    }
    return this._map.get(name).node;
  }

  update(name, props) {
    invariant(this._map.has(name), "Oops, trying to update a ref that doesn't exist");
    const refRecord = this._map.get(name);
    refRecord.update(props);
  }
}
