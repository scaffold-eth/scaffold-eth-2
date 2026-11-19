type AddressCodeTabProps = {
  bytecode: string;
  assembly: string;
};

export const AddressCodeTab = ({ bytecode, assembly }: AddressCodeTabProps) => {
  const formattedAssembly = Array.from(assembly.matchAll(/\w+( 0x[a-fA-F0-9]+)?/g))
    .map(it => it[0])
    .join("\n");

  return (
    <div className="flex flex-col gap-3 p-4">
      Bytecode
      <div className="mockup-code -indent-5 overflow-y-auto max-h-[500px]">
        <pre className="px-5">
          <code className="whitespace-pre-wrap overflow-auto break-words">{bytecode}</code>
        </pre>
      </div>
      Opcodes
      <div className="mockup-code -indent-5 overflow-y-auto max-h-[500px]">
        <pre className="px-5">
          <code>{formattedAssembly}</code>
        </pre>
      </div>
    </div>
  );
};
