import type { Metadata } from "next";
import { PublicShareClient } from "./public-share-client";

export const metadata: Metadata = { title: "Shared file", robots: { index: false, follow: false } };

export default async function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
	const { token } = await params;
	return <PublicShareClient token={token} />;
}
