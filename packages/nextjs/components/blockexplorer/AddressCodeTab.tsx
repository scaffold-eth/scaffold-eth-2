type AddressCodeTabProps = {
  bytecode: string;
  assembly: string;
};

export const AddressCodeTab = ({ bytecode, assembly }: AddressCodeTabProps) => {
  const formattedAssembly = assembly.split(" ").join("\n");

  return (
    <div className="flex flex-col gap-3 p-4">
      Bytecode
      <div className="mockup-code max-h-[500px] overflow-y-auto -indent-5">
        <pre className="px-5">
          <code className="overflow-auto whitespace-pre-wrap break-words">{bytecode}</code>
        </pre>
      </div>
      Opcodes
      <div className="mockup-code max-h-[500px] overflow-y-auto -indent-5">
        <pre className="px-5">
          <code>{formattedAssembly}</code>
        </pre>
      </div>
    </div>
  );
};
