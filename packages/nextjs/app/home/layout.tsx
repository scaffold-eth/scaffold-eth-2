import { Logo } from "~~/components/Logo";

const RegisterLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex flex-col justify-center h-24">
        <Logo />
      </div>
      {children}
    </>
  );
};

export default RegisterLayout;
