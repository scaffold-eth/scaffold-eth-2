export default function TxnToast({ message, blockExplorerLink }: { message: string; blockExplorerLink?: string }) {
  return (
    <div className={`flex flex-col ml-1 cursor-default`}>
      <p className="my-0">{message}</p>
      {blockExplorerLink && blockExplorerLink.length > 0 ? (
        <a href={blockExplorerLink} target="_blank" rel="noreferrer" className="block underline text-md">
          checkout out transaction
        </a>
      ) : null}
    </div>
  );
}
