import configPromise from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";

type Args = {
  params: {
    segments: string[];
  };
  searchParams: {
    [key: string]: string | string[];
  };
};

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config: configPromise, params, searchParams });

export default function AdminPage({ params, searchParams }: Args) {
  return <RootPage config={configPromise} params={params} searchParams={searchParams} />;
}
