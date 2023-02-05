import Address from "./Address";

export default function NoContractAddressError({ address }: { address: string }) {
  return (
    <>
      <Address address={address} />
      <p className="break-normal my-1">
        Above address dosen&apos;t seems like an contract address did you forgot to do
        <br /> `yarn deploy` ?
      </p>
    </>
  );
}
