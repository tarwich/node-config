/** ****************************************************************************
 * Application configuration script
 *
 * This script is designed to be an easy way to load application configuration
 * from a conglomeration of json files and environment variables.
 ******************************************************************************/
'use strict';

// Libraries
const _     = require('lodash');
const path  = require('path');
const chalk = require('chalk');
const util  = require('util');

let configRoot = '';
let config = null;

/**
 * Simple class to manage loading configurations from root
 */
class Config {
  /**
   * Load configuration files found in path
   *
   * This will load config.json, and overwrite those values with
   * config.local.json. This allows you to commit config.json to your repository
   * with basic information like the project root, while keeping sensitive
   * settings such as password out of the repository with config.local.json.
   *
   * This method doesn't check for file extension -- it loads require('config')
   * and require('config.local'). Therefore, you can use `.js` or `.json`.
   *
   * @param {String} base           The path to search for configuration files
   * @param {Object} options        Options for the loading process
   * @param {Boolean} options.debug Debug the config loading process
   *
   * @return {Config} This for chaining
   */
  loadConfig(base, options) {
    // Early abort for already loaded configuration
    if (config) return this;

    // Store the config root for other things to find
    configRoot = base;

    // The list of configs to load
    const configs = [
      'config.local',
      'config',
    ];

    // Load each config file and merge them all
    config = _.defaultsDeep(...configs.map(config => {
      try {
        if (options && options.debug) {
          console.log(
            'Loading config:',
            chalk.cyan(config),
            'from root:',
            chalk.cyan(configRoot)
          );
        }
        return require(path.resolve(configRoot, config));
      }
      catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
          console.error(e.code);
          throw e;
        }

        return {};
      }
    }));

    // Allow environment variables to overload config
    this.loadEnvironment();
    // Update this class with the values from the config
    Object.assign(this, config);

    // Return this for chaining
    return this;
  }

  /**
   * Allow environment variables to affect the configuration
   */
  loadEnvironment() {
    // ----------[ Environment Translation ]----------------------------------------
    // This is for Heroku, but it's abstracted, because it could really apply to
    // any number of things. Basically this is a map from some arbitrary
    // environment variable to a specific config setting.
    for (let key of Object.keys(config.environmentMap || {})) {
      if (key in process.env)
        process.env[config.environmentMap[key]] = process.env[key];
    }

    // Load any settings from the environment
    Object.keys(process.env).forEach(key => {
      let parts = key.split('.');
      let base = parts.slice(0, -1).reduce((base, key) => {
        // Ensure this path points to something
        if (!base[key]) base[key] = {};
        return base[key];
      }, config);
      // Assign the value
      if (parts.length > 1) base[parts.slice(-1)[0]] = process.env[key];
    });

    // Show the config
    if ((config.logs || {}).config === 'debug') {
      console.log('Loaded Configuration:\n',
        util.inspect(config, {colors: true})
      );
    }
  }

  /**
   * Return the path to the root of the application source code
   */
  get srcRoot() {
    return config.srcRoot;
  }

  /**
   * Change the root of the application source code
   *
   * This method will update node with the new path and reload the require paths
   *
   * @param {String} value The new path
   */
  set srcRoot(value) {
    this.setSrcRoot(value);
    config.srcRoot = value;
  }

  /**
   * Change the root directory where node should look for require()d files that
   * are part of this project
   *
   * @param {String} value The new value for the source root
   */
  setSrcRoot(value) {
    // Make NodeJS look up modules starting in app root
    process.env.NODE_PATH = path.resolve(configRoot, value);
    // Apply the NODE_PATH variable
    require('module').Module._initPaths();
  }
}

module.exports = new Config();
