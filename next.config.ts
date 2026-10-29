import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: "/beat",
        destination: "/beat/",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/beat/:path*",
        destination: "https://play.brht.ai/:path*",
      },
      {
        source: "/beat-the-patriarchy",
        destination: "/beat-the-patriarchy/index.html",
      },
    ];
  },
  env: {
    NEXT_PUBLIC_RWC2027_CSV_URL:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1fm_IjJEm5KoYqshtlWL4DC5bIZWupbaa-QeOIffbPAKFwXchPReA4789OGTWA0DWFAjj_AW0JQmI/pub?gid=1778478103&single=true&output=csv",
  },
};

export default nextConfig;
