import type { Metadata } from "next";
import "@/styles/App.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";

import Footer from "@/components/footer";
import Header from "@/components/header";

import AuthProvider from "@/util/authProvider";
import { StoreProvider } from "@/util/storeProvider";
import ReactQueryProvider from "@/util/queryProvider";

import CONFIG from "@/config/configuration";

export const metadata: Metadata = {
  title: CONFIG.NAME,
  description: `Shop for anything with ${CONFIG.NAME}`,
  icons: {
    icon: "/icon.jpeg",
    shortcut: "/icon.jpeg",
    apple: "/icon.jpeg",
  },
};
const theme = {
  token: {
    fontFamily: "DMSans-Regular",
    colorPrimary: CONFIG.COLOR,
    lineWidth: 1,
    controlOutlineWidth: 0,
    borderRadius: 6,
  },
  components: {
    Button: {
      fontSize: 14,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/icon.jpeg" />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-EK6V7P6NKR"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-EK6V7P6NKR');
            `,
          }}
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-11168946770"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                  window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'AW-11168946770');`,
          }}
        ></script>
        <meta
          name="google-site-verification"
          content="BOD9AxLW76nB9a-0zZOoXbBGJItd5s9Sb3PGxqIsscU"
        />
      </head>
      <body>
        <AuthProvider>
          <ReactQueryProvider>
            <AntdRegistry>
              <ConfigProvider theme={theme}>
                <StoreProvider>
                  <div className="layout-container">
                    <Header />
                    <main className="layout-main">{children}</main>
                    <Footer />
                  </div>
                </StoreProvider>
              </ConfigProvider>
            </AntdRegistry>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
