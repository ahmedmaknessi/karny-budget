// Transforms .sql files into JS string modules for Drizzle migrations
const path = require('path');

let upstreamTransformer = null;

function getUpstream() {
  if (upstreamTransformer) return upstreamTransformer;
  try {
    upstreamTransformer = require('@expo/metro-config/build/transformer/metro-transform-worker');
  } catch {
    upstreamTransformer = require('metro-transform-worker');
  }
  return upstreamTransformer;
}

module.exports.transform = async function sqlTransform(params) {
  const { src, filename, options } = params;
  if (path.extname(filename) === '.sql') {
    return getUpstream().transform({
      ...params,
      src: `module.exports = ${JSON.stringify(src)};`,
    });
  }
  return getUpstream().transform(params);
};
