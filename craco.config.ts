module.exports = {
  eslint: {
    mode: "file",
  },
  webpack: {
    configure: {
      resolve: {
        fallback: { url: require.resolve("url/") },
      },
    },
  },
};
