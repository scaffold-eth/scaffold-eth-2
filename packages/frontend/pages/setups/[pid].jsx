import { useRouter } from "next/router";

const Setup = () => {
  const router = useRouter();
  const { pid } = router.query;

  return <p>Post: {pid}</p>;
};

export default Setup;
