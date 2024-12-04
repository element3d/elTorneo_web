import { Html, Head, Main, NextScript } from "next/document";
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head >
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
            {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script> */}

            {/* <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7041403371220271`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        /> */}
<script src="https://telegram.org/js/telegram-web-app.js?56"></script>

           <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7041403371220271"
     crossorigin="anonymous"></script>
      </Head>
      <body>
    
        <Main />
        <NextScript />
  
      </body>
    </Html>
  );
}
