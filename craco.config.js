const path = require("path");

const resolvePath = (p) => path.resolve(__dirname, p);

module.exports = {
  webpack: {
    alias: {
      "@": resolvePath("./src"),
      "@routers": resolvePath("./src/routers"),
      "@pages": resolvePath("./src/pages"),
      "@views": resolvePath("./src/views"),
      "@containers": resolvePath("./src/containers"),
      "@components": resolvePath("./src/components"),
      "@ui": resolvePath("./src/components/UI"),
      "@store": resolvePath("./src/store"),
      "@common": resolvePath("./src/common"),
      "@hooks": resolvePath("./src/hooks"),
      "@hoc": resolvePath("./src/hoc"),
      "@assets": resolvePath("./src/assets"),
      "@styles": resolvePath("./src/assets/styles"),
      "@prop-types": resolvePath("./src/prop-types"),
      "@locales": resolvePath("./src/locales"),
    },
  },
};
