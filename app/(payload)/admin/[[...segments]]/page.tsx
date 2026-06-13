import configPromise from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";

type Args = {
  params: Promise<{
    segments?: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export const generateMetadata = async ({ params, searchParams }: Args) =>
  generatePageMetadata({ config: configPromise, params: await params, searchParams: await searchParams });

export default async function AdminPage({ params, searchParams }: Args) {
  return <RootPage config={configPromise} params={await params} searchParams={await searchParams} />;
}
