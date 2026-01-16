import type {Metadata} from "next";
import "./globals.css";
import {ClientLayout} from "@/app/client-layout";
import {NextIntlClientProvider} from "next-intl";

export const metadata: Metadata = {
    title: "Sephirah Reader",
    description: "Comic reader supporting multiple sources",
};

export default async function RootLayout(props: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body>
            <NextIntlClientProvider>
                <ClientLayout>
                    {props.children}
                </ClientLayout>
            </NextIntlClientProvider>
        </body>
        </html>
    );
}
