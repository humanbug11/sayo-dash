import test from 'node:test';
import assert from 'node:assert/strict';
import { RunInput } from '../src/systems/RunInput.ts';
import { readBest, saveBest } from '../src/systems/RaceRecord.ts';

test('alternation grades timing and only consecutive perfect steps build combo', () => {
  const input = new RunInput();
  assert.equal(input.step('A', 0).timing, 'good');
  assert.equal(input.step('D', 120).timing, 'perfect');
  assert.equal(input.step('A', 240).timing, 'perfect');
  assert.equal(input.getCombo(), 2);
  assert.equal(input.step('D', 450).timing, 'good');
  assert.equal(input.getCombo(), 0);
  assert.equal(input.step('A', 800).timing, 'late');
  assert.equal(input.getCombo(), 0);
});
test('same key and impossibly fast alternation lose combo and give no impulse', () => {
  const input = new RunInput(); input.step('A', 100); input.step('D', 220);
  assert.deepEqual(input.step('D', 340), { valid: false, timing: 'miss', impulse: 0 });
  assert.equal(input.getCombo(), 0);
  assert.equal(input.step('A', 380).timing, 'miss');
  assert.equal(input.step('D', 500).timing, 'perfect');
  input.breakCombo();
  assert.equal(input.getCombo(), 0);
  assert.equal(input.step('D', 510).timing, 'good');
});
test('race reset clears previous input and combo', () => {
  const input = new RunInput(); input.step('A', 100); input.step('D', 220); input.reset();
  assert.equal(input.getCombo(), 0); assert.equal(input.step('D', 230).timing, 'good');
});
test('best record never worsens and survives blocked or corrupt storage', () => {
  const values = new Map();
  Object.defineProperty(globalThis, 'localStorage', {configurable:true,value:{getItem:k=>values.get(k) ?? null,setItem:(k,v)=>values.set(k,v)}});
  assert.equal(readBest(), null); assert.equal(saveBest(23000), true);
  assert.equal(saveBest(24000), false); assert.equal(readBest(), 23000);
  assert.equal(saveBest(22000), true); assert.equal(readBest(), 22000);
  values.set('sayo-dash:city:best', 'broken'); assert.equal(readBest(), null);
  Object.defineProperty(globalThis, 'localStorage', {configurable:true,get(){throw new Error('blocked')}});
  assert.equal(readBest(), null); assert.doesNotThrow(()=>saveBest(20000));
});
