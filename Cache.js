'use strict';

/**
 * @module Cache
 * @desc
 * @class
 * @param {vscode.ExtensionContext} context - The Visual Studio Code extension context
 * @param {string} [namespace] - Optional namespace for cached items. Defaults to "cache"
 * @returns {Cache} The cache object
 */
let Cache = function (context, namespace) {
  if (!context) {
    return undefined;
  }

  // ExtensionContext
  this.context = context;

  // Namespace of the context's globalState
  this.namespace = namespace || 'cache';

  // Local cache object
  this.cache = this.context.globalState.get(this.namespace, {});
}

/**
 * @name cache.set
 * @desc Save something in the cache, with optional expiration
 * @function
 * @param {string} key - The unique key for the cached item
 * @param {string|number|object} value - The value to cache
 * @param {number} [expiration] - Optional expiration time in seconds
 * @returns {Thenable} Visual Studio Code Thenable (Promise)
 */
Cache.prototype.set = function (key, value, expiration) {

  // Parameter type checking
  if (typeof (key) !== 'string' || typeof (value) === 'undefined') {
    return undefined; // Does this need to return a Thenable?
  }

  let obj = {
    value: value
  };

  // Set expiration
  if (Number.isInteger(expiration)) {
    obj.expiration = now() + expiration;
  }

  // Save to local cache object
  this.cache[key] = obj;

  // Save to extension's globalState
  return this.context.globalState.update(this.namespace, this.cache);
}

/**
 * @name cache.get
 * @desc Get an item from the cache, or the optional default value
 * @function
 * @param {string} key - The unique key for the cached item
 * @param {string|number|object} [defaultValue] - The optional default value to return if the cached item does not exist or is expired
 * @returns {string|number|object} Returns the cached value or optional defaultValue
 */
Cache.prototype.get = function (key, defaultValue) {

  // Return default value
  if (typeof (this.cache[key]) === 'undefined') {

    if (typeof (defaultValue) !== 'undefined') {
      return defaultValue;
    } else {
      return undefined;
    }

  } else {
    return this.cache[key].value;
  }
}

/**
 * @name cache.has
 * @desc Checks to see if unexpired item exists in the cache
 * @function
 * @param {string} key - The unique key for the cached item
 * @return {boolean}
 */
Cache.prototype.has = function (key) {
  return (typeof (this.cache[key]) !== 'undefined' && !this.isExpired(key));
}

/**
 * @name cache.delete
 * @desc Deletes the specified key from the cache
 * @function
 * @param {string} key - The unique key for the cached item
 * @returns {Thenable|false} Visual Studio Code Thenable (Promise) or false if key does not exist
 */
Cache.prototype.delete = function (key) {
  // Does item exist?
  if (typeof (this.cache[key]) === 'undefined') {
    return false;
  }

  // Delete from local object
  delete this.cache[key];

  // Update the extension's globalState
  return this.context.globalState.update(this.namespace, this.cache);
}

/**
 * @name cache.keys
 * @desc Get an array of all cached item keys
 * @function
 * @return {string[]}
 */
Cache.prototype.keys = function () {
  return Object.keys(this.cache);
}

/**
 * @name cache.clear
 * @desc Clears all items from the cache
 * @function
 * @return {boolean}
 */
Cache.prototype.clear = function () {
  this.cache = {};
  return this.context.globalState.update(this.namespace, undefined);
}

/**
 * @name cache.expiration
 * @desc Gets the expiration time for the cached item
 * @function
 * @param {string} key - The unique key for the cached item
 * @return {number} Unix Timestamp in seconds
 */
Cache.prototype.getExpiration = function (key) {
  return this.has(key) ? this.cache[key].expiration : undefined;
}

/**
 * @name isExpired
 * @desc Checks to see if cached item is expired
 * @function
 * @private
 * @param {object} item - Cached item object
 * @return {boolean}
 */
Cache.prototype.isExpired = function (key) {

  // If key doesn't exist or it has no expiration
  if (typeof (this.cache[key]) === 'undefined' || typeof (this.cache[key].expiration) === 'undefined') {
    return false;
  } else {

    // Is expiration >= right now?
    return now() >= this.cache[key].expiration;
  }
}

/**
 * @name now
 * @desc Helpfer function to get the current timestamp
 * @function
 * @private
 * @return {number} Current Unix Timestamp in seconds
 */
const now = function () {
  return Math.floor(Date.now() / 1000);
}

module.exports = Cache;