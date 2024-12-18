import { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import "@/styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Example of authentication logic
    const checkAuth = async () => {
      const sessionId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sessionId="))
        ?.split("=")[1];

      if (!sessionId) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
