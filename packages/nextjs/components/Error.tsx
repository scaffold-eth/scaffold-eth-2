import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

function Error({ statusCode, message }: ErrorProps) {
  return (
    <div>
      <Head>
        <title>{`Error - ${statusCode} ${message}`}</title>
      </Head>

      <div className="flex flex-col justify-center items-center h-screen mx-10">
        <Image src="/logo.svg" width={300} height={300} alt="Scaffold Logo" />
        <p className="font-bold text-3xl text-error">{`${statusCode} - ${message}`}</p>
        <p className="font-bold text-3xl">
          {`Go to Scaffold-ETH's `}
          <Link href="/" className="underline hover:text-info">
            Home
          </Link>
          {` Page`}
        </p>
      </div>
    </div>
  );
}

export default Error;
