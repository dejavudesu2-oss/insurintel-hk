/**
 * scripts/build_mobile_cafe.js
 * Compatibility entry point delegating to the deterministic `scripts/build_app.js` builder.
 */
const { buildApp } = require('./build_app.js');
if (require.main === module) {
  buildApp();
}
module.exports = { buildApp };
