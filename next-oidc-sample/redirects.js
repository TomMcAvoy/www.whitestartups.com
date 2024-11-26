module.exports = async () => {
  console.log("Configuring redirects...");
  return [
    {
      source: "/old-path",
      destination: "/new-path",
      permanent: true,
    },
    {
      source: "/another-old-path",
      destination: "/another-new-path",
      permanent: false,
    },
    // Add more redirects as needed
  ];
};
