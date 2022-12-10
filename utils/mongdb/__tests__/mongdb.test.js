'use strict';

const mongdb = require('..');
const assert = require('assert').strict;

assert.strictEqual(mongdb(), 'Hello from mongdb');
console.info("mongdb tests passed");
