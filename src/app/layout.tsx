import type { Metadata } from "next";
import "@/styles/App.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@/util/suppressAntdWarning";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App } from "antd";

import Footer from "@/components/footer";
import Header from "@/components/header/HeaderClientWrapper";

import AuthProvider from "@/util/authProvider";
import { StoreProvider } from "@/util/storeProvider";
import ReactQueryProvider from "@/util/queryProvider";

import CONFIG from "@/config/configuration";
// import WhatsAppChatTab from "@/components/whatsappSupport/WhatsAppChatTab";
import LayoutContent from "@/components/LayoutContent";
import ChatBot from "@/components/chatbot/ChatBot";

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
    fontFamily: "Poppins, Roboto, Arial, Helvetica, sans-serif",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-5J27TX49');`,
          }}
        />

        <link rel="icon" href="/icon.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/icon.jpeg" />
        <meta
          name="google-site-verification"
          content="hjuHfzlO0fdL02U92aa34wv7wVNkG8yqQX-Hv-lhdLE"
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5J27TX49"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <AuthProvider>
          <ReactQueryProvider>
            <AntdRegistry>
              <ConfigProvider theme={theme}>
                <App>
                  <StoreProvider>
                    <LayoutContent>
                      <div className="layout-container">
                        <Header />
                        <main className="layout-main">{children}</main>
                        <Footer />
                        {/* <WhatsAppChatTab /> */}
                        <ChatBot />
                      </div>
                    </LayoutContent>
                  </StoreProvider>
                </App>
              </ConfigProvider>
            </AntdRegistry>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
