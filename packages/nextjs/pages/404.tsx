import Error from "~~/components/Error";

function ErrorPage() {
  return <Error statusCode="404" message="Page not found" />;
}

export default ErrorPage;
