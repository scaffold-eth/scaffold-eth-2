export const withDefaults =
  (template, expectedArgs, debug = false) =>
  (receivedArgs) => {
    const argsWithDefault = Object.fromEntries(
      expectedArgs.map((argName) => [argName, receivedArgs[argName] ?? []])
    );

    if (debug) {
      console.log(argsWithDefault, expectedArgs, receivedArgs);
    }

    Object.keys(receivedArgs).forEach((receivedArgName) => {
      if (!expectedArgs.includes(receivedArgName)) {
        throw new Error(
          `Templated received unexpected argument named "${receivedArgName}". Expecting only ${expectedArgs.join(
            ", "
          )}`
        );
      }
    });

    return template(argsWithDefault);
  };
