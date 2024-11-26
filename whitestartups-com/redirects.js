const redirects = async () => {
  return [
    {
      source: '/login',
      destination: '/payload_login',
      permanent: false,
    },
    {
      source: '/logon',
      destination: '/oidc_login',
      permanent: false,
    },
    {
      source: '/admin',
      destination: '/signin',
      permanent: false,
    },
    // Add more redirects as needed
  ]
}

export default redirects
