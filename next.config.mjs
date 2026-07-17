const nextConfig = {
  // Static export for S3 + CloudFront hosting — no Node/Edge server available at runtime.
  output: "export",
  // Emits <route>/index.html so S3 (static website hosting) resolves directory index docs.
  trailingSlash: true,
};

export default nextConfig;
