const path = require('path');
const colors = require('colors/safe');
const builtinPlugins = require('./builtin_plugins');

exports.builtinDefaultPlugins = builtinPlugins.defaultPlugins;

const createConfigPlugin = async function (pluginName, parameters, localPath) {
  // for each plugin, look for a local definition, a built-in definition, or
  // a module-provided definition (module relaxed-pluginName)
  let origin;
  let plugin = builtinPlugins.plugins[pluginName];

  if (plugin) {
    origin = `ReLaXed ${pluginName} built-in plugin`
  } else {
    let possiblePaths = [
      {
        location: path.join(localPath, `${pluginName}.plugin.js`),
        origin: `local file ${pluginName}.plugin.js`
      },
      {
        location: path.join(localPath, pluginName),
        origin: `local plugin ${pluginName}`
      },
      {
        location: path.join(localPath, `relaxed-${pluginName}`),
        origin: `local relaxed-${pluginName}`
      },
      {
        location: `relaxed-${pluginName}`,
        origin: `relaxed-${pluginName}`
      },
      {
        // linux
        location: `/usr/local/lib/node_modules/relaxed-${pluginName}`,
        origin: `relaxed-${pluginName}`
      },
      {
        // travis
        location: `/home/travis/build/RelaxedJS/relaxed-${pluginName}`,
        origin: `relaxed-${pluginName}`
      }
    ];
    for (let possiblePath of possiblePaths) {
      try {
        plugin = require(possiblePath.location);
        origin = possiblePath.origin;
        break
      } catch (error) {
        let expected = `Cannot find module '${possiblePath.location}'`;
        if (error.message.indexOf(expected) === -1) {
          console.error(error)
        }
      }
    }
  }
  if (!plugin) {
    throw Error(`Plugin ${pluginName} not found !`)
  }
  let configuratedPlugin = await plugin.constructor(parameters);
  configuratedPlugin.origin = origin;
  return configuratedPlugin
};

const listPluginHooks = function (pluginList) {
  let pluginHooks = {};
  const hooks = [
    'watchers',
    'pugHeaders',
    'pugFilters',
    'headElements',
    'htmlModifiers',
    'pageModifiers',
    'page2ndModifiers',
    'postPDF'
  ];
  for (let hook of hooks) {
    let hookInstances = [];
    for (let plugin of pluginList) {
      try {
        let thisPluginHooks = plugin[hook];
        if (thisPluginHooks) {
          if (!Array.isArray(thisPluginHooks)) {
            thisPluginHooks = [thisPluginHooks]
          }
          for (var pluginHook of thisPluginHooks) {
            hookInstances.push({
              instance: pluginHook,
              origin: plugin.origin
            })
          }
        }
      } catch (error) {
        console.log(`In hook ${hook} of plugin [${plugin.origin}]:`);
        console.log(error.message);
        throw error
      }
    }
    pluginHooks[hook] = hookInstances
  }
  // TODO: order watchers by watched extension inclusion.
  return pluginHooks
};

const updateRegisteredPlugins = async function (relaxedGlobals, inputDir) {
  if (relaxedGlobals.config.plugins) {
    console.log(colors.magenta('... Loading config plugins'));
    let plugin, pluginName, params;
    for (let pluginDefinition of relaxedGlobals.config.plugins) {
      try {
        if (typeof (pluginDefinition) === 'string') {
          [pluginName, params] = [pluginDefinition, {}]
        } else {
          [pluginName, params] = Object.entries(pluginDefinition)[0]
        }
        console.log(colors.magenta(`    - ${pluginName} plugin`));
        plugin = await createConfigPlugin(pluginName, params, inputDir);
        relaxedGlobals.configPlugins.push(plugin)
      } catch (error) {
        console.log(error.message);
        console.error(colors.bold.red(`Could not load plugin ${pluginName}`))
      }
    }
  }
  const allPlugins = relaxedGlobals.configPlugins.concat(builtinPlugins.defaultPlugins);
  relaxedGlobals.pluginHooks = listPluginHooks(allPlugins);

  // TODO: remove some of these extensions as they get covered by plugins.
  relaxedGlobals.watchedExtensions = [
    '.pug',
    '.md',
    '.html',
    '.css',
    '.scss',
    '.svg',
    '.png',
    '.jpeg',
    '.jpg'
  ];

  for (let watcher of relaxedGlobals.pluginHooks.watchers) {
    let exts = watcher.instance.extensions;
    relaxedGlobals.watchedExtensions = relaxedGlobals.watchedExtensions.concat(exts)
  }
};

exports.updateRegisteredPlugins = updateRegisteredPlugins;
exports.listPluginHooks = listPluginHooks;
exports.createConfigPlugin = createConfigPlugin;
