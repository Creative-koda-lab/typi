/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "typi",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: { region: "us-east-1" },
        cloudflare: true
      }
    };
  },
  async run() {
    const mongoUri = new sst.Secret("MongoDbUri");
    const authSecret = new sst.Secret("AuthSecret");
    const googleClientId = new sst.Secret("GoogleClientId");
    const googleClientSecret = new sst.Secret("GoogleClientSecret");

    const site = new sst.aws.Astro("Web", {
      path: ".",
      domain: {
        name: "typi.creative-koda.com",
        dns: sst.cloudflare.dns()
      },
      environment: {
        PUBLIC_APP_URL: `https://typi.creative-koda.com`,
        PUBLIC_GA_MEASUREMENT_ID: "G-0V5YFBMLH4"
      },
      link: [mongoUri, authSecret, googleClientId, googleClientSecret],
    });

    return {
      url: site.url
    };
  },
});