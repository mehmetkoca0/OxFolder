/** @type {import('next').NextConfig} */
const nextConfig = {
    redirects: () => [{
        source: "/",
        destination: "/files",
        permanent: true
    }]
};

export default nextConfig;
