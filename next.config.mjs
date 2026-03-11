const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://xgour62062.execute-api.ap-southeast-2.amazonaws.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
