export const fetcher = async <T = Record<any, any>>(...args: Parameters<typeof fetch>) => {
  const res = await fetch(...args);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Error fetching data");
  }
  return data as T;
};

export const makeMutationFetcher =
  <T = Record<any, any>>(method: "POST" | "PUT" | "PATCH" | "DELETE") =>
  async (url: string, { body }: { body: T }) => {
    const res = await fetch(url, {
      method: method,
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Error ${method.toLowerCase()}ing data`);
    }
    return data;
  };

export const postMutationFetcher = <T = Record<any, any>>(url: string, arg: { body: T }) =>
  makeMutationFetcher<T>("POST")(url, arg);

export const patchMutationFetcher = <T = Record<any, any>>(url: string, arg: { body: T }) =>
  makeMutationFetcher<T>("PATCH")(url, arg);
