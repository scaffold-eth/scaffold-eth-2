import type { NextPageContext } from "next";
import Error from "~~/components/Error";

function ErrorPage({ statusCode, message }: ErrorProps) {
  return <Error statusCode={statusCode} message={message} />;
}

ErrorPage.getInitialProps = (ctx: NextPageContext) => {
  const { res, err } = ctx;
  // Inspect the status code and show the given template based off of it
  // Default to 404 page
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  const message = err ? err.message : "An error occurred";
  return { statusCode, message };
};

export default ErrorPage;
